using AutoMapper;
using Backend.Business.ExamScheduleTopik;
using Backend.Business.Metadata;
using Backend.Infrastructure.Dapper.Interfaces;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using IIG.Core.Framework.ICom.Infrastructure.Utils;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using RazorEngineCore;
using Serilog;
using System.Data;
using System.Globalization;
using System.IO.Compression;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using static Backend.Infrastructure.Utils.Constant;
using DataTable = System.Data.DataTable;
using File = System.IO.File;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using Backend.Business.Mailing;
using Backend.Business.ManageRegisteredCandidates;
using Backend.Business.User;

namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public class ManageRegisteredCandidateTopikHandler : IManageRegisteredCandidateTopikHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;
        private readonly IDapperReposity _dapper;
        private readonly IDapperUnitOfWork _dapperUnit;
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");
        private static readonly string apiBasicUriUser = Backend.Infrastructure.Utils.Utils.GetConfig("User");

        public ManageRegisteredCandidateTopikHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment, IDapperReposity dapper, IDapperUnitOfWork dapperUnit, IEmailTemplateHandler emailTemplateHandler)
        {
            _mapper = mapper;
            _dapper = dapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            _dapperUnit = dapperUnit;
            _emailTemplateHandler = emailTemplateHandler;
        }

        public async Task<ResponseData> Create(RegisteredCandidateTopikModel model, string userName, string accessToken, string? tenant = "")
        {
            try
            {
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");

                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + model.PlaceTest, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (headerQuater == null || (headerQuater != null && headerQuater.Data == null))
                        return new ResponseDataError(Code.ServerError, "PlaceTestNotFound");

                    if (headerQuater != null && headerQuater.Data != null)
                    {
                        model.PlaceTestName = headerQuater.Data.Name;
                        if (headerQuater.Data.AreaId != model.AreaTest)
                            return new ResponseDataError(Code.NotFound, "PlaceTestIncorect");
                    }

                    var checkSlot = await CheckSlot(model.PlaceTest, model.TestScheduleId, profiles.Data.Id, string.Empty, DateTime.Now, accessToken, tenant) as ResponseDataObject<object>;
                    if (checkSlot != null && checkSlot.Code != Code.Success)
                        return new ResponseDataError(checkSlot.Code, checkSlot.Message);

                    var checkSlotData = checkSlot?.Data as dynamic;
                    if (checkSlot != null && checkSlot.Code == Code.Success && !checkSlotData?.Continute)
                        return new ResponseDataError(Code.Forbidden, "OverQuantity");

                    if (profiles.Data.Id != model.UserId)
                    {
                        return new ResponseDataError(Code.Forbidden, "ProfileIncorrect");
                    }

                    model.Id = Guid.NewGuid();
                    model.IsPaid = (int)Constant.StatusPaid.UnPaid;
                    var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + model.ExamId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (exam != null && exam.Data != null)
                    {
                        var areaApply = exam.Data.AreaApply != null ? JsonConvert.DeserializeObject<List<AreaApplyModel>>(exam.Data.AreaApply) : null;
                        var acept = new List<AreaApplyModel>();
                        if (areaApply != null)
                        {
                            var areaTest = areaApply.FirstOrDefault(p => p.Area == model.AreaTest.ToString());
                            if (areaTest == null)
                                return new ResponseDataError(Code.ServerError, "AreaNotAccess");
                            if (!areaTest.IsOn)
                                return new ResponseDataError(Code.ServerError, "ExamIsOff");
                            if (!string.IsNullOrEmpty(areaTest.Open))
                            {
                                var op = DateTime.ParseExact(areaTest.Open, "yyyy/MM/dd HH:mm:ss", CultureInfo.InvariantCulture) < DateTime.Now;
                                if (!op)
                                    return new ResponseDataError(Code.ServerError, "ExamNotOpen!");
                            }
                            if (!string.IsNullOrEmpty(areaTest.Close))
                            {
                                var cl = DateTime.ParseExact(areaTest.Close, "yyyy/MM/dd HH:mm:ss", CultureInfo.InvariantCulture) > DateTime.Now;
                                if (!cl)
                                    return new ResponseDataError(Code.ServerError, "ExamClose!");
                            }
                        }
                        model.Price = Convert.ToInt64(exam.Data.Price);
                        model.RegistrationCode = exam.Data.RegistrationCode;

                    }
                    else
                    {
                        return new ResponseDataError(Code.ServerError, "ExamNotFound");
                    }

                    var examSchedule = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == model.TestScheduleId);
                    if (examSchedule == null)
                        return new ResponseDataError(Code.NotFound, "TestScheduleNotFound");

                    if (examSchedule.ExamId != model.ExamId)
                        return new ResponseDataError(Code.NotFound, "TestScheduleIncorect");

                    var profileUse = profiles?.Data?.Profiles.FirstOrDefault();
                    if (profileUse != null)
                    {
                        var metadata = profileUse.Metadata;
                        if (metadata != null)
                        {
                            var saveProfile = new SysUserProfileRegistered();
                            saveProfile.UserName = profiles?.Data.Email;
                            saveProfile.CandidateRegisterId = (Guid)model.Id;
                            var contactAddressCityId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CityContact);
                            if (contactAddressCityId != null && contactAddressCityId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressCityId = new Guid(contactAddressCityId.Value);
                            }
                            var contactAddressDistrictId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DistrictContact);
                            if (contactAddressDistrictId != null && contactAddressDistrictId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressDistrictId = new Guid(contactAddressDistrictId.Value);
                            }
                            var contactAddressWardsId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WardContact);
                            if (contactAddressWardsId != null && contactAddressWardsId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressWardId = new Guid(contactAddressWardsId.Value);
                            }
                            var birthDay = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthDay);
                            if (birthDay != null)
                            {
                                saveProfile.Birthday = DateTime.ParseExact(birthDay.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                saveProfile.Month = saveProfile.Birthday.Month;
                                saveProfile.Date = saveProfile.Birthday.Day;
                            }
                            var email = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Email);
                            if (email != null)
                            {
                                saveProfile.Email = email.Value;
                            }
                            var vietnameseName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.VietnameseName);
                            if (vietnameseName != null)
                            {
                                string fullName = vietnameseName.Value.Trim();
                                Regex trimmer = new Regex(@"\s\s+");
                                fullName = trimmer.Replace(fullName, " ");
                                saveProfile.FullNameOrigin = vietnameseName.Value.Trim();
                                saveProfile.FullName = Utils.RemoveUnicode(fullName);
                                saveProfile.LastName = saveProfile.FullName.Split(" ").LastOrDefault();
                                saveProfile.FirstName = saveProfile.FullName.Replace(" " + saveProfile.LastName, "");
                            }
                            var koreaName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.KoreaName);
                            if (koreaName != null)
                            {
                                saveProfile.FullNameKorea = koreaName.Value;
                            }
                            var countryCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Country);
                            if (countryCode != null)
                            {
                                var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + countryCode.Value.ToString(), accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                                saveProfile.CountryEnglishName = countryModel?.Data?.EnglishName;
                                saveProfile.CountryKoreanName = countryModel?.Data?.KoreanName;
                                saveProfile.CountryCode = countryCode.Value;
                            }
                            var languageCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Language);
                            if (languageCode != null)
                            {
                                var languageModel = await HttpHelper.Get<ResponseDataObject<LanguageModel>>(apiBasicUriCatalog, "Language/code/" + languageCode.Value.ToString(), accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                                saveProfile.LanguageEnglishName = languageModel?.Data?.EnglishName;
                                saveProfile.LanguageKoreanName = languageModel?.Data?.KoreanName;
                                saveProfile.LanguageCode = languageCode.Value;
                            }
                            var phone = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Phone);
                            if (phone != null)
                            {
                                saveProfile.Phone = phone.Value;
                            }
                            var houseNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.HouseNumber);
                            if (houseNumber != null)
                            {
                                saveProfile.ContactAddress = houseNumber.Value;
                            }
                            var gender = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Gender);
                            if (gender != null)
                            {
                                saveProfile.Sex = gender.Value;
                            }
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            if (typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                            }
                            //var idCardNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            //if (idCardNumber != null)
                            //{
                            //    var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.IdentityCard == idCardNumber.Value.Trim());
                            //    if (checkBlacklist != null)
                            //    {
                            //        if (checkBlacklist.FinishPunishmentDate == null || (checkBlacklist.FinishPunishmentDate.Value.Date > examSchedule.ExamDate.Date))
                            //        {
                            //            if (saveProfile.Birthday.Date == checkBlacklist.DateOfBirth.Date && saveProfile.FullName.Trim().ToLower() == checkBlacklist.FullName.Trim().ToLower())
                            //                return new ResponseDataObject<object>(new
                            //                {
                            //                    FinishDate = checkBlacklist.FinishPunishmentDate,
                            //                    StartDate = checkBlacklist.NotifyResultDate
                            //                }, Code.Forbidden, "blacklist");
                            //        }
                            //    }

                            //    saveProfile.IDNumber = idCardNumber.Value;
                            //}
                            var cccdT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CCCD);
                            if (cccdT != null)
                            {
                                var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.CitizenIdentityCard == cccdT.Value.Trim());
                                if (checkBlacklist != null)
                                {
                                    if (checkBlacklist.FinishPunishmentDate == null || (checkBlacklist.FinishPunishmentDate.Value.Date > examSchedule.ExamDate.Date))
                                    {
                                        if (saveProfile.Birthday.Date == checkBlacklist.DateOfBirth.Date && saveProfile.FullName.Trim().ToLower() == checkBlacklist.FullName.Trim().ToLower())
                                            return new ResponseDataObject<object>(new
                                            {
                                                FinishDate = checkBlacklist.FinishPunishmentDate,
                                                StartDate = checkBlacklist.NotifyResultDate,
                                                Type = checkBlacklist.Type
                                            }, Code.Forbidden, "blacklist");
                                    }
                                }

                                saveProfile.CCCD = cccdT.Value;
                            }
                            var cmndT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            if (cmndT != null)
                            {
                                var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.IdentityCard == cmndT.Value.Trim());
                                if (checkBlacklist != null)
                                {
                                    if (checkBlacklist.FinishPunishmentDate == null || (checkBlacklist.FinishPunishmentDate.Value.Date > examSchedule.ExamDate.Date))
                                    {
                                        if (saveProfile.Birthday.Date == checkBlacklist.DateOfBirth.Date && saveProfile.FullName.Trim().ToLower() == checkBlacklist.FullName.Trim().ToLower())
                                            return new ResponseDataObject<object>(new
                                            {
                                                FinishDate = checkBlacklist.FinishPunishmentDate,
                                                StartDate = checkBlacklist.NotifyResultDate,
                                                Type = checkBlacklist.Type
                                            }, Code.Forbidden, "blacklist");
                                    }
                                }

                                saveProfile.CMND = cmndT.Value;
                            }
                            var passport = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Passport);
                            if (passport != null)
                            {
                                var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.Passport.ToLower() == passport.Value.Trim().ToLower());
                                if (checkBlacklist != null)
                                {
                                    if (checkBlacklist.FinishPunishmentDate == null || (checkBlacklist.FinishPunishmentDate.Value.Date > examSchedule.ExamDate.Date))
                                    {
                                        if (saveProfile.Birthday.Date == checkBlacklist.DateOfBirth.Date && saveProfile.FullName.Trim().ToLower() == checkBlacklist.FullName.Trim().ToLower())
                                            return new ResponseDataObject<object>(new
                                            {
                                                FinishDate = checkBlacklist.FinishPunishmentDate,
                                                StartDate = checkBlacklist.NotifyResultDate,
                                                Type = checkBlacklist.Type
                                            }, Code.Forbidden, "blacklist");
                                    }
                                }

                                saveProfile.Passport = passport.Value;
                            }

                            if (saveProfile.TypeIdCard == TypeIDCard.CMND)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CMND) ? saveProfile.CMND : string.Empty;
                            else if (saveProfile.TypeIdCard == TypeIDCard.CCCD)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CCCD) ? saveProfile.CCCD : string.Empty;
                            else
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.Passport) ? saveProfile.Passport : string.Empty;

                            var dateOfIssueOfIDCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DateOfIssueOfIDCard);
                            if (dateOfIssueOfIDCard != null)
                            {
                                saveProfile.DateOfCCCD = DateTime.ParseExact(dateOfIssueOfIDCard.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                            }
                            var placeProvideIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard);
                            if (placeProvideIdCard != null)
                            {
                                saveProfile.PlaceOfCCCD = placeProvideIdCard.Value;
                            }

                            var iDCardFront = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardFront);
                            if (iDCardFront != null)
                            {
                                saveProfile.IDCardFront = iDCardFront.TextValue;
                            }
                            var iDCardBack = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardBack);
                            if (iDCardBack != null)
                            {
                                saveProfile.IDCardBack = iDCardBack.TextValue;
                            }
                            var image3x4 = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Image3x4);
                            if (image3x4 != null)
                            {
                                saveProfile.Image3x4 = image3x4.TextValue;
                            }
                            var studentCardImage = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.StudentCardImage);
                            if (studentCardImage != null)
                            {
                                saveProfile.StudentCardImage = studentCardImage.TextValue;
                            }
                            var isKorean = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IsKorean);
                            if (isKorean != null)
                            {
                                saveProfile.IsKorean = isKorean.Value;
                            }
                            var schoolCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.SchoolCertificate);
                            if (schoolCertificate != null)
                            {
                                saveProfile.SchoolCertificate = schoolCertificate.TextValue;
                            }
                            var birthCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthCertificate);
                            if (birthCertificate != null)
                            {
                                saveProfile.BirthCertificate = birthCertificate.TextValue;
                            }
                            if (model.LanguageName != null)
                            {
                                saveProfile.LanguageName = model.LanguageName;
                            }

                            saveProfile.PlaceOfCCCD = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard)?.Value;
                            saveProfile.Job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job)?.Value;
                            saveProfile.OptionJob = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OptionJob)?.Value;
                            unitOfWork.Repository<SysUserProfileRegistered>().Insert(saveProfile);
                            // save data registed
                            unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Insert(_mapper.Map<SysManageRegisteredCandidateTopik>(model));
                            // save slot
                            unitOfWork.Repository<SysSlotRegister>().Insert(new SysSlotRegister
                            {
                                PlaceId = model.PlaceTest,
                                ExamTopikId = model.TestScheduleId,
                                EndTime = DateTimeOffset.Now.AddMinutes(Convert.ToInt32(Utils.GetConfig("WaitingTime"))).ToUnixTimeSeconds(),
                                UserName = profiles != null ? profiles.Data.Username : string.Empty,
                                UserId = model.UserId,
                                CreatedOnDate = DateTime.Now
                            });
                            unitOfWork.Save();
                        }
                    }
                    return new ResponseDataObject<object>(new { Id = model.Id, Name = examSchedule?.ExaminationName, Price = model?.Price }, Code.Success, "");
                }
                return new ResponseDataError(Code.NotFound, "ProfileIncorrect");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        public ResponseData Delete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Get(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, string? accessToken, int? pageIndex, int? pageSize, string? username, string? sbdSearch, Guid? examPeriod, bool? blacklist)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var examScheduleTopikIds = new List<Guid>();
                if (examPeriod != null)
                {
                    examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriod).Select(p => p.Id).ToList();
                }
                else
                {
                    var examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.IsCurrent);
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).Select(p => p.Id).ToList();
                }
                var listData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetAll();
                var listBlacklist = unitOfWork.Repository<SysBlackListTopik>().GetAll();
                var listProfile = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();
                var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.IsPaid == (int)Constant.StatusPaid.Paid && examScheduleTopikIds.Contains(p.TestScheduleId));
                if (blacklist != null && (bool)blacklist)
                {
                    data = (from SysUserProfileRegistered in listProfile
                            join SysBlackListTopik in listBlacklist on SysUserProfileRegistered.FullName equals SysBlackListTopik.FullName
                            join SysManageRegisteredCandidateTopik in listData on SysUserProfileRegistered.CandidateRegisterId equals SysManageRegisteredCandidateTopik.Id
                            where SysManageRegisteredCandidateTopik.IsPaid == (int)StatusPaid.Paid && SysUserProfileRegistered.Birthday.Date == SysBlackListTopik.DateOfBirth.Date
                            select SysManageRegisteredCandidateTopik).ToList();

                }
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.PlaceTest));
                else
                    data = data.Where(p => p.Id == Guid.Empty);
                var result = new List<ListCandidateTopikModel>();
                var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : string.Empty);
                var examss = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty);
                int totalCount = data.Count();
                if (data != null && data.Count() > 0)
                {
                    data = data.OrderByDescending(p => p.CreatedOnDate);
                    if (areaId != null)
                        data = data.Where(p => p.AreaTest == areaId);
                    if (exam != null)
                        data = data.Where(p => p.ExamId == exam);
                    if (placeTest != null)
                        data = data.Where(p => p.PlaceTest == placeTest);
                    if (examVersion != null)
                        data = data.Where(p => p.TestScheduleId == examVersion);

                    if (!string.IsNullOrEmpty(dateReceive))
                    {
                        var date = dateReceive.Split(",");
                        DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.CreatedOnDate.Date >= dateConvert1 && p.CreatedOnDate.Date <= dateConvert2);
                    }

                    if (!string.IsNullOrEmpty(fullname))
                    {
                        var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullName.ToUpper().Contains(fullname.ToUpper())).Select(p => p.CandidateRegisterId);
                        data = data.Where(p => candidateRegisters.Contains(p.Id));
                    }


                    if (!string.IsNullOrEmpty(username))
                    {
                        var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.UserName.ToUpper() == username.ToUpper()).Select(p => p.CandidateRegisterId);
                        data = data.Where(p => candidateRegisters.Contains(p.Id));
                    }
                    if (!string.IsNullOrEmpty(cccd))
                    {
                        var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CCCD.Contains(cccd) || p.CMND.Contains(cccd) || p.Passport.Contains(cccd)).Select(p => p.CandidateRegisterId);
                        data = data.Where(p => candidateRegisters.Contains(p.Id));
                    }
                    if (!string.IsNullOrEmpty(sbdSearch))
                    {
                        //var sbd = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.CandidateNumber == sbdSearch);
                        var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                   join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                   where examRoomDivided.CandidateNumber == sbdSearch && examScheduleTopikIds.Contains(dividingExamPlace.ExamScheduleTopikId)
                                   select examRoomDivided
                                   ).FirstOrDefault();
                        if (sbd != null)
                        {
                            var sysDividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.Id == sbd.DividingExamPlaceId);
                            if (sysDividingExamPlace != null)
                                data = data.Where(p => p.UserProfileId == sbd.UserProfileId && sysDividingExamPlace.ExamScheduleTopikId == p.TestScheduleId);
                        }
                        else
                            data = data.Where(p => p.Id == Guid.Empty);
                    }
                    totalCount = data.Count();

                    if (pageSize != null && pageIndex != null)
                        data = data.Skip((int)(pageIndex - 1) * (int)pageSize).Take((int)pageSize).ToList();
                    else
                        data = data.Skip(0).Take(10).ToList();

                    foreach (var item in data)
                    {
                        var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        var res = new ListCandidateTopikModel();
                        res.DateCreated = item.CreatedOnDate.ToString("dd-MM-yyyy HH:mm:ss");
                        res.Id = item.Id;
                        res.ExamId = item.ExamId;
                        res.Price = item.Price;
                        res.Status = item.Status != null ? Convert.ToInt32(item.Status) : 1;
                        res.IsPaid = item.IsPaid != null ? Convert.ToInt32(item.IsPaid) : 1;
                        res.PlaceTest = item.PlaceTest;
                        if (profile != null)
                        {
                            res.FullName = profile.FullName.ToUpper();
                            res.Phone = profile.Phone;
                        }
                        result.Add(res);
                    }
                }
                var pagination = new Pagination(Convert.ToInt32(pageIndex), Convert.ToInt32(pageSize), totalCount, totalCount / 10);
                return new PageableData<List<ListCandidateTopikModel>>(result, pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetById(Guid id, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var userInfo = new UserInfoModel();
                var result = new ManageRegisteredCandidateTopikModel();
                var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == existData.Id);

                if (profile != null)
                {
                    var languageData = await HttpHelper.Get<ResponseDataObject<List<LanguageModel>>>(apiBasicUriCatalog, "Language", accessToken != null ? accessToken : "");
                    var countryData = await HttpHelper.Get<ResponseDataObject<List<CountryModel>>>(apiBasicUriCatalog, "Countries", accessToken != null ? accessToken : "");

                    userInfo.ContactAddressCityId = profile.ContactAddressCityId;
                    userInfo.ContactAddressDistrictId = profile.ContactAddressDistrictId;
                    userInfo.ContactAddressWardsId = profile.ContactAddressWardId;
                    userInfo.DOB = profile.Birthday;
                    userInfo.Email = profile.Email;
                    userInfo.FullName = profile.FullName;
                    userInfo.FullNameKorea = profile.FullNameKorea;
                    userInfo.SDT = profile.Phone;
                    userInfo.ContactAddress = profile.ContactAddress;
                    userInfo.Sex = profile.Sex;
                    userInfo.CCCD = profile.CCCD;
                    userInfo.IDNumber = profile.IDNumber;
                    userInfo.TypeIdCard = profile.TypeIdCard;
                    userInfo.CMND = profile.CMND;
                    userInfo.Passport = profile.Passport;
                    userInfo.DateOfCCCD = profile.DateOfCCCD;
                    userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                    userInfo.Job = profile.Job;
                    userInfo.OptionJob = profile.OptionJob;
                    if (profile.IDCardFront != null)
                        userInfo.FrontImgCCCD = profile.IDCardFront.Length > 1000 ? profile.IDCardFront : await MinioHelpers.GetBase64Minio(profile.IDCardFront);
                    if (profile.IDCardBack != null)
                        userInfo.BackImgCCCD = profile.IDCardBack.Length > 1000 ? profile.IDCardBack : await MinioHelpers.GetBase64Minio(profile.IDCardBack);
                    if (profile.Image3x4 != null)
                        userInfo.IMG3X4 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                    if (profile.StudentCardImage != null)
                        userInfo.StudentCardImage = profile.StudentCardImage.Length > 1000 ? profile.StudentCardImage : await MinioHelpers.GetBase64Minio(profile.StudentCardImage);
                    if (profile.SchoolCertificate != null)
                        userInfo.SchoolCertificate = profile.SchoolCertificate.Length > 1000 ? profile.SchoolCertificate : await MinioHelpers.GetBase64Minio(profile.SchoolCertificate);
                    if (profile.BirthCertificate != null)
                        userInfo.BirthCertificate = profile.BirthCertificate.Length > 1000 ? profile.BirthCertificate : await MinioHelpers.GetBase64Minio(profile.BirthCertificate);
                    userInfo.UserName = profile.UserName;
                    userInfo.IsKorean = profile.IsKorean;
                    userInfo.IsDisabilities = profile.IsDisabilities;
                    userInfo.LanguageName = profile.LanguageName;
                    userInfo.CountryCode = profile.CountryCode;
                    userInfo.LanguageCode = profile.LanguageCode;
                }

                var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(existData.TestScheduleId);
                var examCalendarModel = new ExamScheduleTopikModel();
                var examInfo = new ExamInfoModel();

                if (examCalendar != null)
                {
                    var examWorkShiftGet = await HttpHelper.Get<ResponseDataObject<ExamWorkShiftModel>>(apiBasicUriCatalog, "ExamWorkShift/" + examCalendar.ExamWorkShiftId, accessToken);

                    examCalendarModel = new ExamScheduleTopikModel
                    {
                        Id = examCalendar.Id,
                        ExamId = examCalendar.ExamId,
                        Status = examCalendar.Status,
                        Note = examCalendar.Note,
                        EndRegister = examCalendar.EndRegister.ToString("dd/MM/yyyy"),
                        ExamDate = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                        ExaminationName = examCalendar.ExaminationName,
                        ExamTime = examCalendar.ExamTime,
                        ExamWorkShiftId = examCalendar.ExamWorkShiftId,
                        StartRegister = examCalendar.StartRegister.ToString("dd/MM/yyyy"),
                    };
                    //var sbd = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.UserProfileId == existData.UserProfileId);
                    var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                               join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                               where examRoomDivided.UserProfileId == existData.UserProfileId && existData.TestScheduleId == dividingExamPlace.ExamScheduleTopikId
                               select examRoomDivided
                                   ).FirstOrDefault();

                    examInfo.Price = existData.Price;
                    examInfo.SBD = sbd != null ? sbd.CandidateNumber : "";
                    examInfo.ExamRoomId = sbd != null ? sbd.ExamRoomId : new Guid();
                    examInfo.ExamShift = examWorkShiftGet?.Data?.Name;
                    examInfo.DateTest = examCalendarModel != null ? examCalendar.ExamDate : null;
                    examInfo.TimeTest = examCalendarModel != null ? (examCalendarModel.ExamTime) : null;
                }

                result = new ManageRegisteredCandidateTopikModel
                {
                    Id = existData.Id,
                    UserProfileId = existData.UserProfileId,
                    UserId = existData.UserId,
                    TestScheduleId = existData.TestScheduleId,
                    ExamPurpose = existData.ExamPurpose,
                    PlaceTest = existData.PlaceTest,
                    IsPaid = existData.IsPaid,
                    KnowWhere = existData.KnowWhere,
                    IsTestTOPIK = existData.IsTestTOPIK,
                    ExamId = existData.ExamId,
                    AreaTest = existData.AreaTest,
                    UserInfo = userInfo,
                    ExamInfo = examInfo,
                    TestSchedule = examCalendarModel,
                    DateRegister = existData.CreatedOnDate,
                    Price = existData.Price,
                };
                return new ResponseDataObject<ManageRegisteredCandidateTopikModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Statistical(Guid? areaId, Guid? placeTest, Guid? examinationId, int? status, Guid? examPeriodId, string? accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetAll();
                var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();

                var data = new List<SysManageRegisteredCandidateTopik>();
                var examScheduleTopikIds = new List<Guid>();
                if (examPeriodId != null)
                {
                    examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodId).Select(p => p.Id).ToList();
                }
                else
                {
                    var examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.IsCurrent);
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).Select(p => p.Id).ToList();
                }
                if (examinationId != null)
                {
                    examScheduleTopikIds = new List<Guid>();
                    examScheduleTopikIds.Add((Guid)examinationId);
                }

                if (manageRegisteredCandidateTopiks != null && manageRegisteredCandidateTopiks.Count() > 0 && userProfileRegistereds != null && userProfileRegistereds.Count() > 0)
                {
                    data = (from manageRegisteredCandidateTopik in manageRegisteredCandidateTopiks
                            join userProfileRegistered in userProfileRegistereds on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                            where manageRegisteredCandidateTopik.IsPaid == (int)Constant.StatusPaid.Paid
                            && (areaId == null || manageRegisteredCandidateTopik.AreaTest == areaId)
                            && (placeTest == null || manageRegisteredCandidateTopik.PlaceTest == placeTest)
                            && (examScheduleTopikIds.Contains(manageRegisteredCandidateTopik.TestScheduleId))
                            select manageRegisteredCandidateTopik)
                            .ToList();
                }

                var examinations = unitOfWork.Repository<SysExamScheduleTopik>().Get();

                if (status != null)
                {
                    examinations = examinations.Where(x => x.Status == status);
                    data = data.Where(x => examinations.Select(y => y.Id).Contains(x.TestScheduleId)).ToList();
                }

                var groupData = data
                    .GroupBy(p => new
                    {
                        p.AreaTest,
                        p.PlaceTest,
                        p.TestScheduleId
                    })
                    .Select(gcs => new StatisticalGroupDTO()
                    {
                        AreaTest = gcs.Key.AreaTest,
                        PlaceTest = gcs.Key.PlaceTest,
                        TestScheduleId = gcs.Key.TestScheduleId,
                        Items = gcs.ToList(),
                    });
                var result = new List<StatisticalRegisterTopikDTO>();

                var areas = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var headQuaters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);

                foreach (var statisticalItem in groupData)
                {
                    var area = areas?.Data?.FirstOrDefault(x => x.Id == statisticalItem.AreaTest);
                    var headQuater = headQuaters?.Data?.FirstOrDefault(x => x.Id == statisticalItem.PlaceTest);

                    var TestSchedule = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(x => x.Id == statisticalItem.TestScheduleId);

                    var statisticalRegisterTopikDTO = new StatisticalRegisterTopikDTO();
                    var item = statisticalItem.Items[0];

                    statisticalRegisterTopikDTO.Id = item.Id;
                    statisticalRegisterTopikDTO.AreaId = item.AreaTest;
                    statisticalRegisterTopikDTO.AreaName = area?.Name;
                    statisticalRegisterTopikDTO.HeadQuaterId = item.PlaceTest;
                    statisticalRegisterTopikDTO.HeadQuaterName = headQuater?.Name;
                    statisticalRegisterTopikDTO.ExaminationId = item.TestScheduleId;
                    statisticalRegisterTopikDTO.ExaminationName = TestSchedule != null ? TestSchedule.ExaminationName : "Đã xóa";
                    statisticalRegisterTopikDTO.Status = TestSchedule != null ? TestSchedule.Status : 1;

                    statisticalRegisterTopikDTO.MaxQuantity = headQuater?.MaxQuantity;

                    statisticalRegisterTopikDTO.TotalQuantity = statisticalItem.Items.Count();

                    result.Add(statisticalRegisterTopikDTO);
                }


                return new ResponseDataObject<List<StatisticalRegisterTopikDTO>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> ExportExcelStatistical(Guid? areaId, Guid? placeTest, Guid? examinationId, int? status, Guid? examPeriodId, string? accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetAll();
                var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();

                var data = new List<SysManageRegisteredCandidateTopik>();
                var examScheduleTopikIds = new List<Guid>();
                if (examPeriodId != null)
                {
                    examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodId).Select(p => p.Id).ToList();
                }
                else
                {
                    var examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.IsCurrent);
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).Select(p => p.Id).ToList();
                }
                if (examinationId != null)
                {
                    examScheduleTopikIds = new List<Guid>();
                    examScheduleTopikIds.Add((Guid)examinationId);
                }
                //string strExamScheduleTopikIds = "null";
                //if (examScheduleTopikIds != null && examScheduleTopikIds.Count() > 0)
                //{
                //    strExamScheduleTopikIds = string.Join(",", examScheduleTopikIds.Select(s => "'" + s + "'"));
                //}
                //string examStr = "";
                //examTopik.ForEach(exam =>
                //{
                //    if (!string.IsNullOrEmpty(examStr))
                //        examStr += $",[{exam.Id}]";
                //    else
                //        examStr = $"[{exam.Id}]";
                //});
                var exams = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                List<ExamModel> examTopik = exams?.Data?.Where(exam => exam.Code == "TOPIK_I" || exam.Code == "TOPIK_II")?.ToList();

                var idTopik1 = examTopik.FirstOrDefault(g => g.Code == "TOPIK_I")?.Id;
                var idTopik2 = examTopik.FirstOrDefault(g => g.Code == "TOPIK_II")?.Id;
                List<Dictionary<string, object>> queryData = new List<Dictionary<string, object>>();

                if (manageRegisteredCandidateTopiks != null && manageRegisteredCandidateTopiks.Count() > 0 && userProfileRegistereds != null && userProfileRegistereds.Count() > 0)
                {
                    //string sqlQuery = "select * from\r\n(\tSELECT a.AreaTest, a.PlaceTest, a.ExamId, Count(*) AS T\r\n\tFROM ManageRegisteredCandidateTopik a\r\n\tINNER JOIN UserProfileRegistered b ON a.Id = b.CandidateRegisterId\r\n\tWHERE a.IsPaid = 2\r\n\tAND (@areaId is null OR a.AreaTest = '@areaId' ) AND  (@placeTest is null OR a.PlaceTest = '@placeTest')\r\n\tAND a.TestScheduleId in (@examScheduleTopikIds)\r\n\tGROUP BY a.AreaTest, a.PlaceTest, a.ExamId\r\n) as Tav\r\nPIVOT  \r\n(  \r\n  SUM(T)  \r\n  FOR ExamId IN (@examStr)  \r\n) AS PivotTable;";
                    //sqlQuery = sqlQuery.Replace("@areaId", areaId?.ToString() ?? "null");
                    //sqlQuery = sqlQuery.Replace("@placeTest", placeTest?.ToString() ?? "null");
                    //sqlQuery = sqlQuery.Replace("@examScheduleTopikIds", strExamScheduleTopikIds);
                    //sqlQuery = sqlQuery.Replace("@examStr", examStr);
                    //var objectData = _dapper.Query<object>(sqlQuery, new
                    //{
                    //    //@areaId = areaId?.ToString() ?? "null",
                    //    //@placeTest = placeTest?.ToString() ?? "null",
                    //    //@examScheduleTopikIds = strExamScheduleTopikIds,
                    //    //@examStr = examStr
                    //}, null, CommandType.Text)?.ToList();
                    //queryData = Newtonsoft.Json.JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(Newtonsoft.Json.JsonConvert.SerializeObject(objectData));

                    queryData = (
                        from manageRegisteredCandidateTopik in manageRegisteredCandidateTopiks
                        join userProfileRegistered in userProfileRegistereds on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                        where manageRegisteredCandidateTopik.IsPaid == 2
                        && (areaId == null || manageRegisteredCandidateTopik.AreaTest == areaId)
                        && (placeTest == null || manageRegisteredCandidateTopik.PlaceTest == placeTest)
                        && (examScheduleTopikIds.Contains(manageRegisteredCandidateTopik.TestScheduleId))
                        group new { manageRegisteredCandidateTopik, userProfileRegistered } by new { manageRegisteredCandidateTopik.AreaTest, manageRegisteredCandidateTopik.PlaceTest, manageRegisteredCandidateTopik.ExamId } into g
                        select new
                        {
                            g.Key.AreaTest,
                            g.Key.PlaceTest,
                            g.Key.ExamId,
                            T = g.Count()
                        }
                    ).ToList()
                    .GroupBy(x => new { x.AreaTest, x.PlaceTest })
                    .Select(g => new Dictionary<string, object>()
                    {
                        { "AreaTest", g.Key.AreaTest },
                        { "PlaceTest", g.Key.PlaceTest },
                        { idTopik1?.ToString()??"nullTopik1", g.Sum(x => x.ExamId == idTopik1 ? x.T : 0) },
                        { idTopik2?.ToString()??"nullTopik2", g.Sum(x => x.ExamId == idTopik2 ? x.T : 0) },
                        //g.Key.AreaTest,
                        //g.Key.PlaceTest,
                        //topik1 = g.Sum(x => x.ExamId == Guid.Parse("42EFB49E-5E23-4EEC-9DB0-0E72BC13B94F") ? x.T : 0),
                        //topik2 = g.Sum(x => x.ExamId == Guid.Parse("8099040B-E742-4566-A3CB-126D26EFB6E2") ? x.T : 0)
                    }).ToList();
                }

                var examinations = unitOfWork.Repository<SysExamScheduleTopik>().Get();

                var result = new List<StatisticalRegisterTopikExportDTO>();
                var areas = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var headQuaters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);

                var (candidateRegisterNorth1, candidateRegisterCenter1, candidateRegisterSouthern1) = (0, 0, 0);
                var (candidateRegisterNorth2, candidateRegisterCenter2, candidateRegisterSouthern2) = (0, 0, 0);
                foreach (var statisticalItem in queryData)
                {
                    Guid.TryParse(statisticalItem["PlaceTest"]?.ToString(), out Guid placeTestGuid);
                    Guid.TryParse(statisticalItem["AreaTest"]?.ToString(), out Guid areaTestGuid);
                    var headQuater = headQuaters?.Data?.FirstOrDefault(x => x.Id == placeTestGuid);
                    var area = areas?.Data?.FirstOrDefault(x => x.Id == areaTestGuid);
                    statisticalItem["RegionName"] = area.RegionName;
                    statisticalItem["Region"] = area.Region;
                    statisticalItem["PlaceName"] = $"{headQuater.Name}-{headQuater.KoreaName}";

                    statisticalItem["TOPIK_I"] = $"{statisticalItem[idTopik1.ToString()] ?? 0}/{headQuater.MaxQuantity}";
                    statisticalItem["TOPIK_II"] = $"{statisticalItem[idTopik2.ToString()] ?? 0}/{headQuater.MaxQuantity}";
                    statisticalItem["TOPIK_I_Register"] = statisticalItem[idTopik1.ToString()] ?? 0;
                    statisticalItem["TOPIK_II_Register"] = statisticalItem[idTopik2.ToString()] ?? 0;

                    int.TryParse(statisticalItem[idTopik1.ToString()]?.ToString(), out int topik1Register);
                    int.TryParse(statisticalItem[idTopik2.ToString()]?.ToString(), out int topik2Register);
                    var objectTemp = new StatisticalRegisterTopikExportDTO()
                    {
                        RegionName = area.RegionName,
                        Region = area.Region,
                        HeadQuaterName = $"{headQuater.Name}-{headQuater.KoreaName}",
                        Topik1Register = topik1Register,
                        Topik2Register = topik2Register,
                        MaxRegister = headQuater.MaxQuantity

                    };
                    result.Add(objectTemp);

                    if (area.Region == 1)
                    {
                        candidateRegisterNorth1 += topik1Register;
                        candidateRegisterNorth2 += topik2Register;
                    }
                    else if (area.Region == 2)
                    {
                        candidateRegisterCenter1 += topik1Register;
                        candidateRegisterCenter2 += topik2Register;
                    }
                    else if (area.Region == 3)
                    {
                        candidateRegisterSouthern1 += topik1Register;
                        candidateRegisterSouthern2 += topik2Register;
                    }
                }

                var resultObject = result.OrderBy(g => g.Region).ToList();

                var (recordNorthFirst, recordCenterFirst, recordSouthernFirst) = (true, true, true);
                foreach (var statisticalItem in resultObject)
                {
                    statisticalItem.Topik1RegisterCombine = $"{statisticalItem.Topik1Register}/{statisticalItem.MaxRegister}";
                    statisticalItem.Topik2RegisterCombine = $"{statisticalItem.Topik2Register}/{statisticalItem.MaxRegister}";
                    if (statisticalItem.Region == 1)
                    {
                        if (recordNorthFirst)
                        {
                            statisticalItem.Topik1SumRegion = candidateRegisterNorth1;
                            statisticalItem.Topik2SumRegion = candidateRegisterNorth2;
                        }
                        recordNorthFirst = false;
                    }
                    else if (statisticalItem.Region == 2)
                    {
                        if (recordCenterFirst)
                        {
                            statisticalItem.Topik1SumRegion = candidateRegisterCenter1;
                            statisticalItem.Topik2SumRegion = candidateRegisterCenter2;
                        }
                        recordCenterFirst = false;
                    }
                    else if (statisticalItem.Region == 3)
                    {
                        if (recordSouthernFirst)
                        {
                            statisticalItem.Topik1SumRegion = candidateRegisterSouthern1;
                            statisticalItem.Topik2SumRegion = candidateRegisterSouthern2;
                        }
                        recordSouthernFirst = false;
                    }

                }


                var dateExport = DateTime.Now;
                // Tạo bảng dữ liệu chung ( Master ) 
                DataTable Master = new DataTable();
                Master.TableName = "Master";
                Master.Columns.Add("titleSheet");
                Master.Columns.Add("totalTopik1");
                Master.Columns.Add("totalTopik2");

                DataRow dr = Master.NewRow();
                dr["titleSheet"] = $"BÁO CÁO TÌNH HÌNH ĐĂNG KÍ THI TOPIK NGÀY {dateExport.ToString("dd/MM/yyyy")}";
                dr["totalTopik1"] = candidateRegisterNorth1 + candidateRegisterCenter1 + candidateRegisterSouthern1;
                dr["totalTopik2"] = candidateRegisterNorth2 + candidateRegisterCenter2 + candidateRegisterSouthern2;
                // Tạo Dataset ghi dữ liệu Master + Details 
                var ds = new DataSet();
                var fileOutput = $"Bao_cao_dang_ki_TOPIK_{dateExport.ToString("dd.MM.yyyy")}_{dateExport.ToString("hh.mm")}.xlsx";
                // Lấy tên file đầu vào và đầu ra 
                var fileTmp = "Bao_cao_dang_ki_TOPIK.xlsx";
                DataTable detailSheet = new DataTable();
                detailSheet = Commonyy.ToDataTable<StatisticalRegisterTopikExportDTO>(resultObject);
                detailSheet.TableName = $"Details";
                ds.Tables.Add(detailSheet);

                Master.Rows.Add(dr);
                ds.Tables.Add(Master);

                ExcelFillData.FillReportGrid(fileOutput, fileTmp, ds, new string[] { "{", "}" }, 1);

                return new ResponseDataObject<string>(@"OutputExcel\" + fileOutput, Code.Success, "Success");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Update(ManageRegisteredCandidateTopikModel model, string accessToken)
        {
            try
            {
                if (model != null)
                {
                    using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                    var request = new Dictionary<string, string>();
                    int index = 0;
                    var multipartFormContent = new MultipartFormDataContent();

                    var exist = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(model.Id);
                    if (exist == null)
                        return new ResponseDataError(Code.NotFound, "Id not found");
                    var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + model.UserId + "?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                    if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                    {
                        var current = profiles.Data.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                        var profileTemp = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == model.Id);
                        if (profileTemp == null)
                        {
                            profileTemp = new SysUserProfileRegistered();
                            profileTemp.Id = Guid.NewGuid();
                            profileTemp.CandidateRegisterId = model.Id;
                        }
                        if (model.IsChangeUserInfo && current != null)
                        {
                            var metaDataListRes = await HttpHelper.Get<ResponseDataObject<List<MetadataModel>>>(apiBasicUriUser, "metadata", accessToken != null ? accessToken : "");
                            if (metaDataListRes != null && metaDataListRes.Data != null)
                            {
                                var metaDataList = metaDataListRes.Data;
                                var metaFullName = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.VietnameseName);
                                if (metaFullName != null && model.UserInfo != null && model.UserInfo.FullName != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaFullName.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.FullName), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.FullNameOrigin = model.UserInfo.FullName;
                                    string fullName = model.UserInfo.FullName.Trim();
                                    Regex trimmer = new Regex(@"\s\s+");
                                    fullName = trimmer.Replace(fullName, " ");
                                    profileTemp.FullName = Utils.RemoveUnicode(fullName);
                                    profileTemp.LastName = fullName.Split(" ").LastOrDefault();
                                    profileTemp.FirstName = fullName.Replace(" " + profileTemp.LastName, "");
                                }

                                var koreaName = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.KoreaName);
                                if (koreaName != null && model.UserInfo != null && model.UserInfo.FullNameKorea != null)
                                {
                                    multipartFormContent.Add(new StringContent(koreaName.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.FullNameKorea), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.FullNameKorea = model.UserInfo.FullNameKorea;
                                }

                                var metaBirthDay = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.BirthDay);
                                if (metaBirthDay != null && model.UserInfo != null && !string.IsNullOrEmpty(model.UserInfo.DOBString))
                                {
                                    multipartFormContent.Add(new StringContent(metaBirthDay.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.DOBString), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Birthday = DateTime.ParseExact(model.UserInfo.DOBString, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                    profileTemp.Month = profileTemp.Birthday.Month;
                                    profileTemp.Date = profileTemp.Birthday.Day;
                                }

                                var metaGender = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Gender);
                                if (metaGender != null && model.UserInfo != null && model.UserInfo.Sex != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaGender.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.Sex), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Sex = model.UserInfo.Sex;
                                }

                                var typeIdCard = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.TypeIdCard);
                                if (typeIdCard != null && model.UserInfo != null && model.UserInfo.TypeIdCard != null)
                                {
                                    multipartFormContent.Add(new StringContent(typeIdCard.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.TypeIdCard), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.TypeIdCard = model.UserInfo.TypeIdCard;
                                }


                                //var idCardNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IdCardNumber);
                                //if (idCardNumber != null && model.UserInfo != null && model.UserInfo.IDNumber != null)
                                //{
                                //    multipartFormContent.Add(new StringContent(idCardNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                //    multipartFormContent.Add(new StringContent(model.UserInfo.IDNumber), name: "Metadata[" + index + "].textValue");
                                //    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                //    index++;
                                //    profileTemp.IDNumber = model.UserInfo.IDNumber;
                                //}

                                var metaIdCardNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CCCD);
                                if (metaIdCardNumber != null && model.UserInfo != null && model.UserInfo.CCCD != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaIdCardNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.CCCD), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.CCCD = model.UserInfo.CCCD;
                                }

                                var cmnd = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IdCardNumber);
                                if (cmnd != null && model.UserInfo != null && model.UserInfo.CMND != null)
                                {
                                    multipartFormContent.Add(new StringContent(cmnd.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.CMND), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.CMND = model.UserInfo.CMND;
                                }

                                var passport = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Passport);
                                if (passport != null && model.UserInfo != null && model.UserInfo.Passport != null)
                                {
                                    multipartFormContent.Add(new StringContent(passport.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.Passport), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Passport = model.UserInfo.Passport;
                                }

                                if (profileTemp.TypeIdCard == TypeIDCard.CMND)
                                    profileTemp.IDNumber = !string.IsNullOrEmpty(profileTemp.CMND) ? profileTemp.CMND : string.Empty;
                                else if (profileTemp.TypeIdCard == TypeIDCard.CCCD)
                                    profileTemp.IDNumber = !string.IsNullOrEmpty(profileTemp.CCCD) ? profileTemp.CCCD : string.Empty;
                                else
                                    profileTemp.IDNumber = !string.IsNullOrEmpty(profileTemp.Passport) ? profileTemp.Passport : string.Empty;


                                var metaPlaceProvideIdCard = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.PlaceProvideIdCard);
                                if (metaPlaceProvideIdCard != null && model.UserInfo != null && model.UserInfo.PlaceOfCCCD != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaPlaceProvideIdCard.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.PlaceOfCCCD), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.PlaceOfCCCD = model.UserInfo.PlaceOfCCCD;
                                }

                                var dateOfIssueOfIDCard = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.DateOfIssueOfIDCard);
                                if (dateOfIssueOfIDCard != null && model.UserInfo != null && !string.IsNullOrEmpty(model.UserInfo.DateOfCCCDString))
                                {
                                    multipartFormContent.Add(new StringContent(dateOfIssueOfIDCard.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.DateOfCCCDString), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.DateOfCCCD = DateTime.ParseExact(model.UserInfo.DateOfCCCDString, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                }
                                if (profileTemp.TypeIdCard == TypeIDCard.DinhDanh)
                                {
                                    profileTemp.DateOfCCCD = null;
                                    profileTemp.PlaceOfCCCD = null;
                                }

                                var metaPhone = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Phone);
                                if (metaPhone != null && model.UserInfo != null && model.UserInfo.SDT != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaPhone.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.SDT), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Phone = model.UserInfo.SDT;
                                }

                                var metaEmail = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Email);
                                if (metaEmail != null && model.UserInfo != null && model.UserInfo.Email != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaEmail.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.Email), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Email = model.UserInfo.Email;
                                }

                                var metaCityContact = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CityContact);
                                if (metaCityContact != null && model.UserInfo != null && model.UserInfo.ContactAddressCityId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaCityContact.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.ContactAddressCityId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.ContactAddressCityId = (Guid)model.UserInfo.ContactAddressCityId;
                                }

                                var metaDistrictContact = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.DistrictContact);
                                if (metaDistrictContact != null && model.UserInfo != null && model.UserInfo.ContactAddressDistrictId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaDistrictContact.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.ContactAddressDistrictId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.ContactAddressDistrictId = (Guid)model.UserInfo.ContactAddressDistrictId;
                                }

                                var metaWardContact = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.WardContact);
                                if (metaWardContact != null && model.UserInfo != null && model.UserInfo.ContactAddressWardsId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaWardContact.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.ContactAddressWardsId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.ContactAddressWardId = (Guid)model.UserInfo.ContactAddressWardsId;
                                }

                                var metaHouseNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.HouseNumber);
                                if (metaHouseNumber != null && model.UserInfo != null && model.UserInfo.ContactAddress != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaHouseNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.ContactAddress), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.ContactAddress = model.UserInfo.ContactAddress;
                                }

                                var metaOptionJob = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.OptionJob);
                                if (metaOptionJob != null && model.UserInfo != null && model.UserInfo.OptionJob != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaOptionJob.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.OptionJob), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.OptionJob = model.UserInfo.OptionJob;
                                }

                                var metaJob = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Job);
                                if (metaJob != null && model.UserInfo != null && model.UserInfo.Job != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaJob.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.Job), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.Job = model.UserInfo.Job;
                                }

                                var metaLanguage = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Language);
                                if (metaLanguage != null && model.UserInfo != null && model.UserInfo.LanguageCode != null)
                                {
                                    var languageModel = await HttpHelper.Get<ResponseDataObject<LanguageModel>>(apiBasicUriCatalog, "Language/code/" + model.UserInfo.LanguageCode, accessToken != null ? accessToken : "");
                                    if (languageModel != null && languageModel.Data != null)
                                    {
                                        profileTemp.LanguageKoreanName = languageModel.Data.KoreanName;
                                        profileTemp.LanguageEnglishName = languageModel.Data.EnglishName;
                                    }
                                    profileTemp.LanguageCode = model.UserInfo.LanguageCode;
                                    multipartFormContent.Add(new StringContent(metaLanguage.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.LanguageCode), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                }

                                var metaCountry = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Country);
                                if (metaCountry != null && model.UserInfo != null && model.UserInfo.CountryCode != null)
                                {
                                    var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + model.UserInfo.CountryCode, accessToken != null ? accessToken : "");
                                    if (countryModel != null && countryModel.Data != null)
                                    {
                                        profileTemp.CountryKoreanName = countryModel.Data.KoreanName;
                                        profileTemp.CountryEnglishName = countryModel.Data.EnglishName;
                                    }
                                    profileTemp.CountryCode = model.UserInfo.CountryCode;
                                    multipartFormContent.Add(new StringContent(metaCountry.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.CountryCode), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                }

                                var metaIsKorean = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IsKorean);
                                if (metaIsKorean != null && model.UserInfo != null && model.UserInfo.IsKorean != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaIsKorean.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.IsKorean), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.IsKorean = model.UserInfo.IsKorean;
                                }

                                var metaIsDisabilities = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IsDisabilities);
                                if (metaIsDisabilities != null && model.UserInfo != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaIsDisabilities.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.IsDisabilities ? "1" : "0"), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.IsDisabilities = model.UserInfo.IsDisabilities;
                                }

                                var iDCardFront = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IDCardFront);
                                if (iDCardFront != null && model.UserInfo != null && model.UserInfo.FrontImgCCCDFile != null && model.UserInfo.FrontImgCCCDFile.Length > 0)
                                {
                                    multipartFormContent.Add(new StringContent(iDCardFront.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent("1"), name: "Metadata[" + index + "].dataType");
                                    MemoryStream stream = new MemoryStream();
                                    model.UserInfo.FrontImgCCCDFile.CopyTo(stream);
                                    var fileBytes = stream.ToArray();
                                    stream = new MemoryStream(fileBytes);
                                    HttpContent file = new StringContent("Metadata[" + index + "].fileValue");
                                    file = new StreamContent(stream);
                                    file.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
                                    {
                                        Name = "Metadata[" + index + "].fileValue",
                                        FileName = "FrontImgCCCD"
                                    };
                                    multipartFormContent.Add(file);
                                    profileTemp.IDCardFront = "/" + profiles.Data.Username + "/FrontImgCCCD";
                                    index++;
                                }
                                var iDCardBack = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IDCardBack);
                                if (iDCardBack != null && model.UserInfo != null && model.UserInfo.BackImgCCCDFile != null && model.UserInfo.BackImgCCCDFile.Length > 0)
                                {
                                    multipartFormContent.Add(new StringContent(iDCardBack.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent("1"), name: "Metadata[" + index + "].dataType");
                                    MemoryStream stream = new MemoryStream();
                                    model.UserInfo.BackImgCCCDFile.CopyTo(stream);
                                    var fileBytes = stream.ToArray();
                                    stream = new MemoryStream(fileBytes);
                                    HttpContent file = new StringContent("Metadata[" + index + "].fileValue");
                                    file = new StreamContent(stream);
                                    file.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
                                    {
                                        Name = "Metadata[" + index + "].fileValue",
                                        FileName = "BackImgCCCD"
                                    };
                                    multipartFormContent.Add(file);
                                    profileTemp.IDCardBack = "/" + profiles.Data.Username + "/BackImgCCCD";
                                    index++;
                                }
                                var image3x4 = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Image3x4);
                                if (image3x4 != null && model.UserInfo != null && model.UserInfo.IMG3X4File != null && model.UserInfo.IMG3X4File.Length > 0)
                                {
                                    multipartFormContent.Add(new StringContent(image3x4.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent("1"), name: "Metadata[" + index + "].dataType");
                                    MemoryStream stream = new MemoryStream();
                                    model.UserInfo.IMG3X4File.CopyTo(stream);
                                    var fileBytes = stream.ToArray();
                                    stream = new MemoryStream(fileBytes);
                                    HttpContent file = new StringContent("Metadata[" + index + "].fileValue");
                                    file = new StreamContent(stream);
                                    file.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
                                    {
                                        Name = "Metadata[" + index + "].fileValue",
                                        FileName = "IMG3X4"
                                    };
                                    multipartFormContent.Add(file);
                                    profileTemp.Image3x4 = "/" + profiles.Data.Username + "/IMG3X4";
                                    index++;
                                }
                                var birthCertificate = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.BirthCertificate);
                                if (birthCertificate != null && model.UserInfo != null && model.UserInfo.BirthCertificateFile != null && model.UserInfo.BirthCertificateFile.Length > 0)
                                {
                                    multipartFormContent.Add(new StringContent(birthCertificate.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent("1"), name: "Metadata[" + index + "].dataType");
                                    MemoryStream stream = new MemoryStream();
                                    model.UserInfo.BirthCertificateFile.CopyTo(stream);
                                    var fileBytes = stream.ToArray();
                                    stream = new MemoryStream(fileBytes);
                                    HttpContent file = new StringContent("Metadata[" + index + "].fileValue");
                                    file = new StreamContent(stream);
                                    file.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
                                    {
                                        Name = "Metadata[" + index + "].fileValue",
                                        FileName = "BirthCertificate"
                                    };
                                    multipartFormContent.Add(file);
                                    profileTemp.BirthCertificate = "/" + profiles.Data.Username + "/BirthCertificate";
                                    index++;
                                }

                                unitOfWork.Repository<SysUserProfileRegistered>().InsertOrUpdate(profileTemp);
                                string profileId = await HttpHelper.UpdateProfileUser(apiBasicUriUser, "b2cuser/" + model.UserId, multipartFormContent, accessToken != null ? accessToken : "");
                                if (Utils.IsGuid(profileId))
                                {
                                    var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.UserProfileId == exist.UserProfileId);
                                    if (examRoomDivided != null)
                                    {
                                        examRoomDivided.UserProfileId = new Guid(profileId);
                                        examRoomDivided.CandidateBirthday = profileTemp.Birthday;
                                        examRoomDivided.CandidateEmail = profileTemp.Email;
                                        examRoomDivided.CandidateName = profileTemp.FullName;
                                        examRoomDivided.CandidatePhone = profileTemp.Phone;
                                        unitOfWork.Repository<SysExamRoomDivided>().Update(examRoomDivided);
                                        unitOfWork.Save();
                                    }
                                    exist.UserProfileId = new Guid(profileId);

                                }
                            }
                        }
                    }

                    exist.Id = model.Id;
                    exist.ExamPurpose = model.ExamPurpose;
                    exist.KnowWhere = model.KnowWhere;
                    exist.IsTestTOPIK = model.IsTestTOPIK;

                    unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Update(exist);
                    unitOfWork.Save();
                    return new ResponseData(Code.Success, "");
                }
                return new ResponseDataError(Code.ServerError, "Tham số truyền vào bị rỗng ");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData DeleteSlot(SlotRegister model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysSlotRegister>().FirstOrDefault(x => x.ExamTopikId == model.ExamTopikId && x.PlaceId == model.PlaceId && x.UserName == model.UserName);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy lượt giữ chỗ");
                unitOfWork.Repository<SysSlotRegister>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetHeaderQuater(Guid areaId, Guid examTopikId, string? accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                var headerQuaters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter/GetByAreaId/" + areaId.ToString(), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var res = new List<HeadQuarterResponseTopikModel>();
                if (headerQuaters != null && headerQuaters.Code == Code.Success && headerQuaters.Data != null)
                {
                    foreach (var item in headerQuaters.Data)
                    {
                        long now = DateTimeOffset.Now.ToUnixTimeSeconds();
                        int slot = unitOfWork.Repository<SysSlotRegister>().Count(x => x.ExamTopikId == examTopikId && x.PlaceId == item.Id && x.EndTime > now);
                        int coutRegisted = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Count(p => p.PlaceTest == item.Id && p.TestScheduleId == examTopikId && p.IsPaid == (int)Constant.StatusPaid.Paid);
                        res.Add(new HeadQuarterResponseTopikModel
                        {
                            Address = item.Address,
                            AreaId = item.AreaId,
                            CanRegisterExam = item.CanRegisterExam,
                            Code = item.Code,
                            Id = item.Id,
                            IsShow = item.IsShow,
                            Name = item.Name,
                            Note = item.Note,
                            IsTopik = item.IsTopik,
                            MaxQuantity = item.MaxQuantity,
                            Registed = slot + coutRegisted,
                            EnglishName = item.EnglishName,
                            KoreaName = item.KoreaName,
                        });
                    }

                }
                return new ResponseDataObject<List<HeadQuarterResponseTopikModel>>(res, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> CheckSlot(Guid placeId, Guid examTopikId, Guid userId, string fullName, DateTime dob, string? accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                long now = DateTimeOffset.Now.ToUnixTimeSeconds();
                bool warning = false;

                var checkRe = unitOfWork.Repository<SysSlotRegister>().Get(p => p.UserId == userId && placeId == p.PlaceId).OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                if (checkRe != null && checkRe.EndTime > now)
                {
                    var soP = (checkRe.EndTime - now) / 60;
                    return new ResponseDataObject<object>(soP > 1 ? soP : 1, Code.Forbidden, "inprocesspay");
                }
                else
                {
                    var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + placeId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (headerQuater != null && headerQuater.Data != null)
                    {
                        var topikActive = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.Status == (int)Constant.StatusExamShedule.Open);
                        var idsTopik = new List<Guid>();
                        if (topikActive != null)
                        {
                            idsTopik = topikActive.Select(p => p.Id).ToList();
                        }
                        bool isRegisted = false;
                        var getdata = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(p => p.UserId == userId && p.TestScheduleId == examTopikId && p.IsPaid == (int)Constant.StatusPaid.Paid);
                        if (getdata != null)
                        {
                            isRegisted = true;
                        }
                        int slot = unitOfWork.Repository<SysSlotRegister>().Count(x => x.ExamTopikId == examTopikId && x.PlaceId == placeId && x.EndTime > now);
                        int coutRegisted = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Count(p => p.PlaceTest == placeId && p.TestScheduleId == examTopikId && p.IsPaid == (int)Constant.StatusPaid.Paid);

                        var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.FullName == Utils.RemoveUnicode(fullName) && p.DateOfBirth.Date == dob.Date);
                        if (checkBlacklist != null)
                            warning = true;

                        return new ResponseDataObject<object>(new
                        {
                            Type = warning ? checkBlacklist?.Type : 0,
                            Warning = warning,
                            Registed = isRegisted,
                            Continute = headerQuater.Data.MaxQuantity > (slot + coutRegisted)
                        }, Code.Success, string.Empty);
                    }
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy địa điểm thi");
                }
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetInfoAfterPaid(Guid id, string accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy bản ghi");

                var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == id);
                var koreaName = profile?.FullNameKorea ?? string.Empty;
                var vietnameseName = profile?.FullName ?? string.Empty;
                var birthDay = profile?.Birthday.ToString("dd/MM/yyyy") ?? string.Empty;

                var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, $"HeadQuarter/{existData.PlaceTest}", accessToken ?? string.Empty, tenant ?? string.Empty);
                var placeTest = headerQuater?.Data?.Name ?? string.Empty;
                var addressTest = headerQuater?.Data?.Address ?? string.Empty;

                var area = await HttpHelper.Get<ResponseDataObject<AreaModel>>(apiBasicUriCatalog, $"Area/{existData.AreaTest}", accessToken ?? string.Empty, tenant ?? string.Empty);
                var areaTest = area?.Data?.Name ?? string.Empty;

                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, $"Exam/{existData.ExamId}", accessToken ?? string.Empty, tenant ?? string.Empty);
                var examName = exam?.Data?.Name ?? string.Empty;

                var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(existData.TestScheduleId);
                var timeTest = examCalendar?.ExamTime ?? string.Empty;
                var dateTest = examCalendar?.ExamDate.ToString("dd/MM/yyyy") ?? string.Empty;
                var noteTimeEnterExamRoom = examCalendar?.NoteTimeEnterExamRoom ?? string.Empty;

                return new ResponseDataObject<object>(new
                {
                    profileId = existData.UserProfileId,
                    vietnameseName,
                    koreaName,
                    birthDay,
                    examName,
                    areaTest,
                    placeTest,
                    addressTest,
                    dateTest,
                    timeTest,
                    noteTimeEnterExamRoom
                });
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetByUserB2C(string? accessToken, string? tenant = "")
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var result = new List<ManageRegisteredCandidateTopikModel>();

                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                if (profiles != null && profiles.Data != null && profiles.Data.Id != Guid.Empty && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {

                    var historyRegisterTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(x => x.UserId == profiles.Data.Id && x.IsPaid == (int)Constant.StatusPaid.Paid);
                    var historyTopikIds = historyRegisterTopik.Select(x => x.Id).ToList();
                    var userRegisterProfiles = unitOfWork.Repository<SysUserProfileRegistered>().Get(x => historyTopikIds.Contains(x.CandidateRegisterId));

                    var provinceIds = userRegisterProfiles.Select(x => x.ContactAddressCityId).ToList();
                    var stringQueryProvince = string.Join("&ids=", provinceIds);

                    var districtIds = userRegisterProfiles.Select(x => x.ContactAddressDistrictId).ToList();
                    var stringQueryDistrict = string.Join("&ids=", districtIds);

                    var wardIds = userRegisterProfiles.Select(x => x.ContactAddressWardId).ToList();
                    var stringQueryWard = string.Join("&ids=", wardIds);
                    var languageData = await HttpHelper.Get<ResponseDataObject<List<LanguageModel>>>(apiBasicUriCatalog, "Language", accessToken != null ? accessToken : "");
                    var countryData = await HttpHelper.Get<ResponseDataObject<List<CountryModel>>>(apiBasicUriCatalog, "Countries", accessToken != null ? accessToken : "");
                    var listCountries = countryData.Data;
                    var provinceData = await HttpHelper.Get<ResponseDataObject<List<ProvinceModel>>>(apiBasicUriCatalog, "Province/multiple?ids=" + stringQueryProvince, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                    var districtData = await HttpHelper.Get<ResponseDataObject<List<ProvinceModel>>>(apiBasicUriCatalog, "District/multiple?ids=" + stringQueryDistrict, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                    var wardData = await HttpHelper.Get<ResponseDataObject<List<ProvinceModel>>>(apiBasicUriCatalog, "Ward/multiple?ids=" + stringQueryWard, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);

                    var exams = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                    var examWorkShifts = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                    var areas = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                    var headQuarters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);

                    foreach (var item in historyRegisterTopik)
                    {
                        var userInfo = new UserInfoModel();

                        var info = userRegisterProfiles.FirstOrDefault(x => x.CandidateRegisterId == item.Id);
                        if (info != null)
                        {
                            var getCountry = listCountries?.FirstOrDefault(p => p.Code == info.CountryCode);
                            var province = provinceData?.Data?.FirstOrDefault(x => x.Id == info.ContactAddressCityId);
                            var district = districtData?.Data?.FirstOrDefault(x => x.Id == info.ContactAddressDistrictId);
                            var ward = wardData?.Data?.FirstOrDefault(x => x.Id == info.ContactAddressWardId);

                            userInfo.ContactAddressCityName = province?.Name;
                            userInfo.ContactAddressDistrictName = district?.Name;
                            userInfo.ContactAddressWardsName = ward?.Name;
                            userInfo.FullName = info.FullName;
                            userInfo.FullNameKorea = info.FullNameKorea;
                            userInfo.SDT = info.Phone;
                            userInfo.CCCD = info.CCCD;
                            userInfo.CMND = info.CMND;
                            userInfo.Country = getCountry?.EnglishName;
                            userInfo.DOB = info.Birthday;
                            userInfo.DOBString = info.Birthday.ToString("dd/MM/yyyy");
                            userInfo.Sex = info.Sex;
                            userInfo.Passport = info.Passport;
                            userInfo.DateOfCCCDString = info.DateOfCCCD != null ? info.DateOfCCCD.Value.ToString("dd/MM/yyyy") : string.Empty;
                            userInfo.PlaceOfCCCD = info.PlaceOfCCCD;
                            userInfo.Email = info.Email;
                            userInfo.ContactAddressCityId = info.ContactAddressCityId;
                            userInfo.ContactAddressDistrictId = info.ContactAddressDistrictId;
                            userInfo.ContactAddressWardsId = info.ContactAddressWardId;
                            userInfo.ContactAddress = info.ContactAddress;
                            userInfo.Job = info.Job;
                            userInfo.OptionJob = info.OptionJob;
                            userInfo.IsKorean = info.IsKorean;
                            try
                            {
                                userInfo.IMG3X4 = (info.Image3x4 != null && info.Image3x4.Length > 1000) ? info.Image3x4 : (info.Image3x4 != null ? await MinioHelpers.GetBase64Minio(info.Image3x4) : string.Empty);
                            }
                            catch (Exception ex)
                            {
                                userInfo.IMG3X4 = string.Empty;
                            }
                        }

                        var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(item.TestScheduleId);
                        var examCalendarModel = new ExamScheduleTopikModel();
                        var examInfo = new ExamInfoModel();
                        var examWorkShift = examWorkShifts?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamWorkShiftId);
                        var examModel = exams?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamId);

                        if (examCalendar != null)
                        {
                            examCalendarModel = new ExamScheduleTopikModel
                            {
                                Id = examCalendar.Id,
                                Status = examCalendar.Status,
                                Note = examCalendar.Note,
                                EndRegister = examCalendar.EndRegister.ToString("dd/MM/yyyy"),
                                ExamDate = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                                ExamDateString = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                                ExaminationName = examCalendar.ExaminationName,
                                ExamTime = examCalendar.ExamTime,
                                ExamWorkShiftId = examCalendar.ExamWorkShiftId,
                                StartRegister = examCalendar.StartRegister.ToString("dd/MM/yyyy"),
                                NoteTimeEnterExamRoom = examCalendar.NoteTimeEnterExamRoom,
                            };
                            examInfo.ExamName = examModel?.Name;
                            examInfo.Price = item.Price;
                            examInfo.RegistrationCode = examModel?.RegistrationCode;
                            examInfo.ExamShift = examWorkShift?.Name;
                            examInfo.DateTest = examCalendarModel != null ? examCalendar.ExamDate : null;
                            examInfo.TimeTest = examCalendarModel != null ? (examCalendarModel.ExamTime) : null;
                        }

                        var areaModel = areas?.Data?.FirstOrDefault(x => x.Id == item.AreaTest);
                        var headQuaterModel = headQuarters?.Data?.FirstOrDefault(x => x.Id == item.PlaceTest);

                        var manageRegister = new ManageRegisteredCandidateTopikModel
                        {
                            Id = item.Id,
                            ExamPurpose = item.ExamPurpose,
                            PlaceTest = item.PlaceTest,
                            PlaceTestName = headQuaterModel?.Name,
                            PlaceTestAddress = headQuaterModel?.Address,
                            IsPaid = item.IsPaid,
                            KnowWhere = item.KnowWhere,
                            IsTestTOPIK = item.IsTestTOPIK,
                            AreaTest = item.AreaTest,
                            AreaTestName = areaModel?.Name,
                            UserInfo = userInfo,
                            ExamInfo = examInfo,
                            TestSchedule = examCalendarModel,
                            DateRegister = item.CreatedOnDate,
                            DateRegisterString = item.CreatedOnDate.ToString("dd/MM/yyyy"),
                            Price = item.Price
                        };

                        var paymentRequest = unitOfWork.Repository<SysPaymentRequestLog>().FirstOrDefault(x => x.TxnRef == item.Id);
                        if (paymentRequest != null)
                        {
                            var paymentResponse = unitOfWork.Repository<SysPaymentResponseLog>()
                                .Get(x => x.PaymentRequestId == paymentRequest.Id)
                                .Where(x => x.ResponseCode == "00" && x.TransactionStatus == "00")
                                .OrderByDescending(x => x.DateCreateRecord).FirstOrDefault();
                            if (paymentResponse != null)
                            {
                                manageRegister.TransactionNo = paymentResponse.TransactionNo;
                                manageRegister.PayDate = paymentResponse.PayDate != null ? DateTime.ParseExact(paymentResponse.PayDate, "yyyyMMddHHmmss", CultureInfo.InvariantCulture) : null;
                            }
                        }
                        if (examCalendar != null && examCalendar.Public)
                        {
                            var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>()
                                .FirstOrDefault(x => x.ExamScheduleTopikId == item.TestScheduleId && x.ExamAreaId == item.AreaTest && x.ExamPlaceId == item.PlaceTest);
                            if (dividingExamPlace != null)
                            {
                                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(x => x.DividingExamPlaceId == dividingExamPlace.Id && x.UserProfileId == item.UserProfileId);
                                if (examRoomDivided != null && unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) == null)
                                {
                                    manageRegister.CandidateNumber = examRoomDivided.CandidateNumber;
                                    manageRegister.ExamRoomId = examRoomDivided.ExamRoomId;
                                    var responseExamRoom = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, "ExamRoom/" + examRoomDivided.ExamRoomId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                                    if (responseExamRoom != null && responseExamRoom.Data != null)
                                    {
                                        manageRegister.ExamRoomName = responseExamRoom.Data.Name;
                                    }
                                }
                            }
                        }

                        result.Add(manageRegister);

                    }

                    result = result.OrderByDescending(x => x.DateRegister).ToList();

                    return new ResponseDataObject<List<ManageRegisteredCandidateTopikModel>>(result, Code.Success, "");
                }
                return new ResponseDataError(Code.ServerError, "Thông tin tài khoản không chính xác !");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetDataTicket(Guid id, string? accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var historyRegisterTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(x => x.Id == id);
                if (historyRegisterTopik == null)
                {
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi !");
                }
                var userRegisterProfile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(x => x.CandidateRegisterId == id);
                if (userRegisterProfile == null)
                {
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi thông tin !");
                }

                var provinceData = await HttpHelper.Get<ResponseDataObject<ProvinceModel>>(apiBasicUriCatalog, "Province/" + userRegisterProfile.ContactAddressCityId, accessToken != null ? accessToken : "");
                var districtData = await HttpHelper.Get<ResponseDataObject<DistrictModel>>(apiBasicUriCatalog, "District/" + userRegisterProfile.ContactAddressDistrictId, accessToken != null ? accessToken : "");
                var wardData = await HttpHelper.Get<ResponseDataObject<WardModel>>(apiBasicUriCatalog, "Ward/" + userRegisterProfile.ContactAddressWardId, accessToken != null ? accessToken : "");
                var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + userRegisterProfile.CountryCode, accessToken != null ? accessToken : "");
                var exams = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : "");
                var examWorkShifts = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : "");
                var areas = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : "");
                var headQuarters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "");
                var userInfo = new UserInfoModel();

                userInfo.ContactAddressCityName = provinceData?.Data?.Name;
                userInfo.ContactAddressDistrictName = districtData?.Data?.Name;
                userInfo.ContactAddressWardsName = wardData?.Data?.Name;
                userInfo.FullName = userRegisterProfile.FullName;
                userInfo.FullNameKorea = userRegisterProfile.FullNameKorea;
                userInfo.SDT = userRegisterProfile.Phone;
                userInfo.CCCD = userRegisterProfile.CCCD;
                userInfo.CMND = userRegisterProfile.CMND;
                userInfo.Country = countryModel?.Data?.EnglishName;
                userInfo.DOB = userRegisterProfile.Birthday;
                userInfo.DOBString = userRegisterProfile.Birthday.ToString("dd/MM/yyyy");
                userInfo.Sex = userRegisterProfile.Sex;
                userInfo.Passport = userRegisterProfile.Passport;
                userInfo.DateOfCCCDString = userRegisterProfile.DateOfCCCD != null ? userRegisterProfile.DateOfCCCD.Value.ToString("dd/MM/yyyy") : string.Empty;
                userInfo.PlaceOfCCCD = userRegisterProfile.PlaceOfCCCD;
                userInfo.Email = userRegisterProfile.Email;
                userInfo.ContactAddressCityId = userRegisterProfile.ContactAddressCityId;
                userInfo.ContactAddressDistrictId = userRegisterProfile.ContactAddressDistrictId;
                userInfo.ContactAddressWardsId = userRegisterProfile.ContactAddressWardId;
                userInfo.ContactAddress = userRegisterProfile.ContactAddress;
                userInfo.Job = userRegisterProfile.Job;
                userInfo.OptionJob = userRegisterProfile.OptionJob;
                userInfo.IsKorean = userRegisterProfile.IsKorean;
                try
                {
                    userInfo.IMG3X4 = (userRegisterProfile.Image3x4 != null && userRegisterProfile.Image3x4.Length > 1000) ? userRegisterProfile.Image3x4 : (userRegisterProfile.Image3x4 != null ? await MinioHelpers.GetBase64Minio(userRegisterProfile.Image3x4) : string.Empty);
                }
                catch (Exception ex)
                {
                    userInfo.IMG3X4 = string.Empty;
                }

                var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(historyRegisterTopik.TestScheduleId);
                var examCalendarModel = new ExamScheduleTopikModel();
                var examInfo = new ExamInfoModel();
                var examWorkShift = examWorkShifts?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamWorkShiftId);
                var examModel = exams?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamId);

                if (examCalendar != null)
                {
                    examCalendarModel = new ExamScheduleTopikModel
                    {
                        Id = examCalendar.Id,
                        Status = examCalendar.Status,
                        Note = examCalendar.Note,
                        EndRegister = examCalendar.EndRegister.ToString("dd/MM/yyyy"),
                        ExamDate = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                        ExamDateString = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                        ExaminationName = examCalendar.ExaminationName,
                        ExamTime = examCalendar.ExamTime,
                        ExamWorkShiftId = examCalendar.ExamWorkShiftId,
                        StartRegister = examCalendar.StartRegister.ToString("dd/MM/yyyy"),
                    };
                    examInfo.ExamName = examModel?.Name;
                    examInfo.Price = historyRegisterTopik.Price;
                    examInfo.RegistrationCode = examModel?.RegistrationCode;
                    examInfo.ExamShift = examWorkShift?.Name;
                    examInfo.DateTest = examCalendarModel != null ? examCalendar.ExamDate : null;
                    examInfo.TimeTest = examCalendarModel != null ? (examCalendarModel.ExamTime) : null;
                }

                var areaModel = areas?.Data?.FirstOrDefault(x => x.Id == historyRegisterTopik.AreaTest);
                var headQuaterModel = headQuarters?.Data?.FirstOrDefault(x => x.Id == historyRegisterTopik.PlaceTest);

                var manageRegister = new ManageRegisteredCandidateTopikModel
                {
                    Id = historyRegisterTopik.Id,
                    ExamPurpose = historyRegisterTopik.ExamPurpose,
                    PlaceTest = historyRegisterTopik.PlaceTest,
                    PlaceTestName = headQuaterModel?.Name,
                    PlaceTestAddress = headQuaterModel?.Address,
                    IsPaid = historyRegisterTopik.IsPaid,
                    KnowWhere = historyRegisterTopik.KnowWhere,
                    IsTestTOPIK = historyRegisterTopik.IsTestTOPIK,
                    AreaTest = historyRegisterTopik.AreaTest,
                    AreaTestName = areaModel?.Name,
                    UserInfo = userInfo,
                    ExamInfo = examInfo,
                    TestSchedule = examCalendarModel,
                    DateRegister = historyRegisterTopik.CreatedOnDate,
                    DateRegisterString = historyRegisterTopik.CreatedOnDate.ToString("dd/MM/yyyy"),
                    Price = historyRegisterTopik.Price
                };

                var paymentRequest = unitOfWork.Repository<SysPaymentRequestLog>().FirstOrDefault(x => x.TxnRef == historyRegisterTopik.Id);
                if (paymentRequest != null)
                {
                    var paymentResponse = unitOfWork.Repository<SysPaymentResponseLog>()
                        .Get(x => x.PaymentRequestId == paymentRequest.Id)
                        .Where(x => x.ResponseCode == "00" && x.TransactionStatus == "00")
                        .OrderByDescending(x => x.DateCreateRecord).FirstOrDefault();
                    if (paymentResponse != null)
                    {
                        manageRegister.TransactionNo = paymentResponse.TransactionNo;
                        manageRegister.PayDate = paymentResponse.PayDate != null ? DateTime.ParseExact(paymentResponse.PayDate, "yyyyMMddHHmmss", CultureInfo.InvariantCulture) : null;
                    }
                }
                if (examCalendar != null && examCalendar.Public)
                {
                    var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>()
                        .FirstOrDefault(x => x.ExamScheduleTopikId == historyRegisterTopik.TestScheduleId && x.ExamAreaId == historyRegisterTopik.AreaTest && x.ExamPlaceId == historyRegisterTopik.PlaceTest);
                    if (dividingExamPlace != null)
                    {
                        var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(x => x.DividingExamPlaceId == dividingExamPlace.Id && x.UserProfileId == historyRegisterTopik.UserProfileId);
                        if (examRoomDivided != null && unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) == null)
                        {
                            manageRegister.CandidateNumber = examRoomDivided.CandidateNumber;
                            manageRegister.ExamRoomId = examRoomDivided.ExamRoomId;
                            var responseExamRoom = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, "ExamRoom/" + examRoomDivided.ExamRoomId, accessToken != null ? accessToken : string.Empty);
                            if (responseExamRoom != null && responseExamRoom.Data != null)
                            {
                                manageRegister.ExamRoomName = responseExamRoom.Data.Name;
                            }
                        }
                    }
                }

                return new ResponseDataObject<ManageRegisteredCandidateTopikModel>(manageRegister, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> ExportPdfTicket(Guid id, string? accessToken, string? tenant = "")
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exitsData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(p => p.Id == id);
                if (exitsData == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi !");
                var userRegisterProfile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(x => x.CandidateRegisterId == id);
                if (userRegisterProfile == null)
                {
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi thông tin !");
                }

                var provinceData = await HttpHelper.Get<ResponseDataObject<ProvinceModel>>(apiBasicUriCatalog, "Province/" + userRegisterProfile.ContactAddressCityId, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var districtData = await HttpHelper.Get<ResponseDataObject<DistrictModel>>(apiBasicUriCatalog, "District/" + userRegisterProfile.ContactAddressDistrictId, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var wardData = await HttpHelper.Get<ResponseDataObject<WardModel>>(apiBasicUriCatalog, "Ward/" + userRegisterProfile.ContactAddressWardId, accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + userRegisterProfile.CountryCode, accessToken != null ? accessToken : "");
                var exams = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var examWorkShifts = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var areas = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var headQuarters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                var userInfo = new UserInfoModel();

                userInfo.ContactAddressCityName = provinceData?.Data?.Name;
                userInfo.ContactAddressDistrictName = districtData?.Data?.Name;
                userInfo.ContactAddressWardsName = wardData?.Data?.Name;
                userInfo.FullName = userRegisterProfile.FullName;
                userInfo.FullNameKorea = userRegisterProfile.FullNameKorea;
                userInfo.SDT = userRegisterProfile.Phone;
                userInfo.CCCD = userRegisterProfile.CCCD;
                userInfo.CMND = userRegisterProfile.CMND;
                userInfo.Country = countryModel?.Data?.EnglishName;
                userInfo.DOB = userRegisterProfile.Birthday;
                userInfo.DOBString = userRegisterProfile.Birthday.ToString("dd/MM/yyyy");
                userInfo.Sex = userRegisterProfile.Sex;
                userInfo.Passport = userRegisterProfile.Passport;
                userInfo.DateOfCCCDString = userRegisterProfile.DateOfCCCD != null ? userRegisterProfile.DateOfCCCD.Value.ToString("dd/MM/yyyy") : string.Empty;
                userInfo.PlaceOfCCCD = userRegisterProfile.PlaceOfCCCD;
                userInfo.Email = userRegisterProfile.Email;
                userInfo.ContactAddressCityId = userRegisterProfile.ContactAddressCityId;
                userInfo.ContactAddressDistrictId = userRegisterProfile.ContactAddressDistrictId;
                userInfo.ContactAddressWardsId = userRegisterProfile.ContactAddressWardId;
                userInfo.ContactAddress = userRegisterProfile.ContactAddress;
                userInfo.Job = userRegisterProfile.Job;
                userInfo.OptionJob = userRegisterProfile.OptionJob;
                userInfo.IsKorean = userRegisterProfile.IsKorean;
                try
                {
                    userInfo.IMG3X4 = (userRegisterProfile.Image3x4 != null && userRegisterProfile.Image3x4.Length > 1000) ? userRegisterProfile.Image3x4 : (userRegisterProfile.Image3x4 != null ? await MinioHelpers.GetBase64Minio(userRegisterProfile.Image3x4) : string.Empty);
                }
                catch (Exception ex)
                {
                    userInfo.IMG3X4 = string.Empty;
                }

                var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(exitsData.TestScheduleId);
                var examCalendarModel = new ExamScheduleTopikModel();
                var examInfo = new ExamInfoModel();
                var examWorkShift = examWorkShifts?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamWorkShiftId);
                var examModel = exams?.Data?.FirstOrDefault(x => x.Id == examCalendar?.ExamId);

                if (examCalendar != null)
                {
                    examCalendarModel = new ExamScheduleTopikModel
                    {
                        Id = examCalendar.Id,
                        Status = examCalendar.Status,
                        Note = examCalendar.Note,
                        EndRegister = examCalendar.EndRegister.ToString("dd/MM/yyyy"),
                        ExamDate = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                        ExamDateString = examCalendar.ExamDate.ToString("dd/MM/yyyy"),
                        ExaminationName = examCalendar.ExaminationName,
                        ExamTime = examCalendar.ExamTime,
                        ExamWorkShiftId = examCalendar.ExamWorkShiftId,
                        StartRegister = examCalendar.StartRegister.ToString("dd/MM/yyyy"),
                    };
                    examInfo.ExamName = examModel?.Name;
                    examInfo.Price = exitsData.Price;
                    examInfo.RegistrationCode = examModel?.RegistrationCode;
                    examInfo.ExamShift = examWorkShift?.Name;
                    examInfo.DateTest = examCalendarModel != null ? examCalendar.ExamDate : null;
                    examInfo.TimeTest = examCalendarModel != null ? (examCalendarModel.ExamTime) : null;
                }

                var areaModel = areas?.Data?.FirstOrDefault(x => x.Id == exitsData.AreaTest);
                var headQuaterModel = headQuarters?.Data?.FirstOrDefault(x => x.Id == exitsData.PlaceTest);

                var manageRegister = new ManageRegisteredCandidateTopikModel
                {
                    Id = exitsData.Id,
                    ExamPurpose = exitsData.ExamPurpose,
                    PlaceTest = exitsData.PlaceTest,
                    PlaceTestName = headQuaterModel?.Name,
                    PlaceTestAddress = headQuaterModel?.Address,
                    IsPaid = exitsData.IsPaid,
                    KnowWhere = exitsData.KnowWhere,
                    IsTestTOPIK = exitsData.IsTestTOPIK,
                    AreaTest = exitsData.AreaTest,
                    AreaTestName = areaModel?.Name,
                    UserInfo = userInfo,
                    ExamInfo = examInfo,
                    TestSchedule = examCalendarModel,
                    DateRegister = exitsData.CreatedOnDate,
                    DateRegisterString = exitsData.CreatedOnDate.ToString("dd/MM/yyyy"),
                    Price = exitsData.Price
                };

                var paymentRequest = unitOfWork.Repository<SysPaymentRequestLog>().FirstOrDefault(x => x.TxnRef == exitsData.Id);
                if (paymentRequest != null)
                {
                    var paymentResponse = unitOfWork.Repository<SysPaymentResponseLog>()
                        .Get(x => x.PaymentRequestId == paymentRequest.Id)
                        .Where(x => x.ResponseCode == "00" && x.TransactionStatus == "00")
                        .OrderByDescending(x => x.DateCreateRecord).FirstOrDefault();
                    if (paymentResponse != null)
                    {
                        manageRegister.TransactionNo = paymentResponse.TransactionNo;
                        manageRegister.PayDate = paymentResponse.PayDate != null ? DateTime.ParseExact(paymentResponse.PayDate, "yyyyMMddHHmmss", CultureInfo.InvariantCulture) : null;
                    }
                }
                if ((examCalendar != null && examCalendar.Public) || string.IsNullOrEmpty(tenant))
                {
                    var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>()
                        .FirstOrDefault(x => x.ExamScheduleTopikId == exitsData.TestScheduleId && x.ExamAreaId == exitsData.AreaTest && x.ExamPlaceId == exitsData.PlaceTest);
                    if (dividingExamPlace != null)
                    {
                        var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(x => x.DividingExamPlaceId == dividingExamPlace.Id && x.UserProfileId == exitsData.UserProfileId);
                        if (examRoomDivided != null && unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) == null)
                        {
                            manageRegister.CandidateNumber = examRoomDivided.CandidateNumber;
                            manageRegister.ExamRoomId = examRoomDivided.ExamRoomId;
                            var responseExamRoom = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, "ExamRoom/" + examRoomDivided.ExamRoomId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                            if (responseExamRoom != null && responseExamRoom.Data != null)
                            {
                                manageRegister.ExamRoomName = responseExamRoom.Data.Name;
                            }
                        }
                    }
                }
                string html = Commonyy.HtmlTicketTopik(manageRegister);
                return new ResponseDataObject<object>(new { Html = html }, Code.Success, string.Empty);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.BadRequest, exception.Message);
            }
        }

        public async Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var ticket = new TopikTicketModel();

                var exitsData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(p => p.Id == id);
                if (exitsData == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi !");

                var userRegisterProfile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(x => x.CandidateRegisterId == id);
                if (userRegisterProfile == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi thông tin !");

                var examGet = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + exitsData.ExamId.ToString(), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                if (examGet == null || examGet.Data == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bài thi !");

                var headQuarter = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + exitsData.PlaceTest.ToString(), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                if (headQuarter == null || headQuarter.Data == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy địa điểm thi !");

                var area = await HttpHelper.Get<ResponseDataObject<AreaModel>>(apiBasicUriCatalog, "Area/" + exitsData.AreaTest.ToString(), accessToken != null ? accessToken : "", tenant != null ? tenant : string.Empty);
                if (area == null || area.Data == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy khu vực thi !");
                var examCalendar = unitOfWork.Repository<SysExamScheduleTopik>().GetById(exitsData.TestScheduleId);
                if (examCalendar == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy lịch thi !");
                var examPeriod = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.Id == examCalendar.ExamPeriodId);
                if (examPeriod == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy kỳ thi !");
                if (examPeriod.Id.ToString().ToLower() == "B955B56B-3D04-40F0-8C81-E067C1B2C198".ToLower())
                    return await ExportPdfTicket(id, accessToken, tenant);

                string tmplFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates");
                if (string.IsNullOrEmpty(language))
                    language = Language.VietNam;
                string filePath = AppDomain.CurrentDomain.BaseDirectory + "/Templates/" + examPeriod.Number + "/Ticket-topik-" + (examGet.Data.RegistrationCode == "7" ? "1" : "2") + "-" + language.ToLower() + ".cshtml";
                if (!File.Exists(filePath))
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy template !");

                using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var sr = new StreamReader(fs, Encoding.Default);
                string template = sr.ReadToEnd();
                sr.Close();

                ticket.DateTest = examCalendar.ExamDate.ToString("dd/MM/yyyy");
                ticket.PlaceTest = headQuarter.Data.Name;
                ticket.FullName = userRegisterProfile.FullName;
                ticket.OldCardIDNumber = !string.IsNullOrEmpty(userRegisterProfile.OldCardIDNumber) ? userRegisterProfile.OldCardIDNumber : string.Empty;

                if (userRegisterProfile.TypeIdCard == TypeIDCard.CMND)
                    ticket.NumberOfIdCard = !string.IsNullOrEmpty(userRegisterProfile.CMND) ? userRegisterProfile.CMND : string.Empty;
                if (userRegisterProfile.TypeIdCard == TypeIDCard.CCCD)
                    ticket.NumberOfIdCard = !string.IsNullOrEmpty(userRegisterProfile.CCCD) ? userRegisterProfile.CCCD : string.Empty;
                if (userRegisterProfile.TypeIdCard == TypeIDCard.Passport)
                    ticket.NumberOfIdCard = !string.IsNullOrEmpty(userRegisterProfile.Passport) ? userRegisterProfile.Passport : string.Empty;

                ticket.NumberOfExamPeriod = examPeriod.Number;
                ticket.KoreanName = userRegisterProfile.FullNameKorea;
                if (language.Trim().ToLower() == Language.VietNam)
                {
                    ticket.Sex = userRegisterProfile.Sex == "man" ? "Nam (Male)" : "Nữ (Female)";
                    ticket.PlaceTest = headQuarter.Data.Name;
                    ticket.AreaTest = area.Data.Name;
                }
                else if (language.Trim().ToLower() == Language.Korea)
                {
                    ticket.Sex = userRegisterProfile.Sex == "man" ? "남 (Male)" : "여 (Female)";
                    ticket.PlaceTest = !string.IsNullOrEmpty(headQuarter.Data.KoreaName) ? headQuarter.Data.KoreaName : headQuarter.Data.Name;
                    ticket.AreaTest = !string.IsNullOrEmpty(area.Data.KoreaName) ? area.Data.KoreaName : area.Data.Name;
                }
                else
                {
                    ticket.Sex = userRegisterProfile.Sex == "man" ? "Male" : "Female";
                    ticket.PlaceTest = !string.IsNullOrEmpty(headQuarter.Data.EnglishName) ? headQuarter.Data.EnglishName : headQuarter.Data.Name;
                    ticket.AreaTest = !string.IsNullOrEmpty(area.Data.EnglishName) ? area.Data.EnglishName : area.Data.Name;
                }

                ticket.Dob = userRegisterProfile.Birthday.ToString("dd/MM/yyyy");

                if (examCalendar.Public || string.IsNullOrEmpty(tenant))
                {
                    var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(x => x.ExamScheduleTopikId == exitsData.TestScheduleId && x.ExamAreaId == exitsData.AreaTest && x.ExamPlaceId == exitsData.PlaceTest);
                    if (dividingExamPlace != null)
                    {
                        var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(x => x.DividingExamPlaceId == dividingExamPlace.Id && x.UserProfileId == exitsData.UserProfileId);
                        if (examRoomDivided != null && unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) == null)
                        {
                            ticket.SBD = examRoomDivided.CandidateNumber;
                            var responseExamRoom = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, "ExamRoom/" + examRoomDivided.ExamRoomId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                            if (responseExamRoom != null && responseExamRoom.Data != null)
                            {

                                if (language.Trim().ToLower() == Language.VietNam)
                                {
                                    ticket.RoomName = responseExamRoom.Data.Name;
                                }
                                else if (language.Trim().ToLower() == Language.Korea)
                                {
                                    ticket.RoomName = !string.IsNullOrEmpty(responseExamRoom.Data.NameInKorean) ? responseExamRoom.Data.NameInKorean : responseExamRoom.Data.Name;
                                }
                                else
                                {
                                    ticket.RoomName = !string.IsNullOrEmpty(responseExamRoom.Data.NameInEnglish) ? responseExamRoom.Data.NameInEnglish : responseExamRoom.Data.Name;
                                }
                            }
                        }
                    }
                }

                try
                {
                    ticket.IMG3X4 = !string.IsNullOrEmpty(userRegisterProfile.Image3x4) ? (userRegisterProfile.Image3x4.Length > 1000 ? "data:image/png;base64," + userRegisterProfile.Image3x4 : "data:image/png;base64," + await MinioHelpers.GetBase64Minio(userRegisterProfile.Image3x4)) : string.Empty;
                }
                catch (Exception ex)
                {
                    ticket.IMG3X4 = string.Empty;
                }
                IRazorEngine razorEngine = new RazorEngine();
                IRazorEngineCompiledTemplate modifiedTemplate = razorEngine.Compile(template);
                var html = modifiedTemplate.Run(ticket);
                return new ResponseDataObject<object>(new { Html = html }, Code.Success, string.Empty);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.BadRequest, exception.Message);
            }
        }

        public async Task<ResponseData> ExportDataTestSchedule(Guid testScheduleId, string? accessToken)
        {

            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.TestScheduleId == testScheduleId);
                var sysExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == testScheduleId);
                if (data != null && sysExamScheduleTopik != null)
                {
                    if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip")))
                        File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip"));
                    using var archive = ZipFile.Open(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip"), ZipArchiveMode.Create);
                    var firstItem = data.FirstOrDefault();
                    if (firstItem != null)
                    {
                        var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + firstItem.ExamId, accessToken != null ? accessToken : string.Empty);
                        var countryData = await HttpHelper.Get<ResponseDataObject<List<CountryModel>>>(apiBasicUriCatalog, "Countries", accessToken != null ? accessToken : string.Empty);
                        var languageData = await HttpHelper.Get<ResponseDataObject<List<LanguageModel>>>(apiBasicUriCatalog, "Language", accessToken != null ? accessToken : string.Empty);
                        string listPlaceString = "HeadQuarter/GetByListId?ids=" + string.Join(",", data.DistinctBy(p => p.PlaceTest).Select(p => p.PlaceTest));
                        var getHeaderQuater = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, listPlaceString, accessToken != null ? accessToken : string.Empty);
                        if (getHeaderQuater != null && getHeaderQuater.Data != null && getHeaderQuater.Data.Count() > 0)
                        {
                            foreach (var item in getHeaderQuater.Data.Where(p => p.IsTopik))
                            {
                                DataTable detail = new DataTable();
                                detail.Columns.Add("FullNameKorea");
                                detail.Columns.Add("FullName");
                                detail.Columns.Add("Birthday");
                                detail.Columns.Add("Sex");
                                detail.Columns.Add("CountryKoreanName");
                                detail.Columns.Add("LanguageKoreanName");
                                detail.Columns.Add("OptionJob");
                                detail.Columns.Add("KnowWhere");
                                detail.Columns.Add("ExamPurpose");
                                detail.Columns.Add("SBD");
                                detail.TableName = "data";
                                var listRegister = data.Where(p => p.PlaceTest == item.Id && p.IsPaid == (int)Constant.StatusPaid.Paid);
                                foreach (var child in listRegister)
                                {
                                    //var sbd = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.UserProfileId == child.UserProfileId);
                                    var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                               join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                               where examRoomDivided.UserProfileId == child.UserProfileId && dividingExamPlace.ExamScheduleTopikId == testScheduleId
                                               select examRoomDivided
                                   ).FirstOrDefault();
                                    var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == child.Id);
                                    if (profile != null && profile.Image3x4 != null)
                                    {
                                        // image
                                        var getBase64 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                                        if (getBase64 != null)
                                        {
                                            byte[] file = Convert.FromBase64String(getBase64);
                                            using (var stream = new MemoryStream(file))
                                            {
                                                if (sbd != null && sbd.CandidateNumber != null)
                                                {
                                                    var zipEntry = archive.CreateEntry(exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + "/" + sbd.CandidateNumber + ".jpg");

                                                    using (var zipEntryStream = zipEntry.Open())
                                                    {
                                                        stream.CopyTo(zipEntryStream);
                                                    }
                                                }
                                            }
                                        }
                                        var getCountry = countryData?.Data?.FirstOrDefault(p => p.Code == profile.CountryCode);
                                        var getLanguage = languageData?.Data?.FirstOrDefault(p => p.Code == profile.LanguageCode);
                                        detail.Rows.Add(new object[] { profile.FullNameKorea, profile.FullName.ToUpper(), profile.Birthday.ToString("yyyyMMdd"), profile.Sex == "man" ? 1 : 2, (!string.IsNullOrEmpty(getCountry?.KoreanName) ? getCountry?.KoreanName : ""), getLanguage.KoreanName, !string.IsNullOrEmpty(profile.OptionJob) ? profile.OptionJob : 1, !string.IsNullOrEmpty(child.KnowWhere) ? child.KnowWhere : 1, !string.IsNullOrEmpty(child.ExamPurpose) ? child.ExamPurpose : 1, sbd != null ? (!string.IsNullOrEmpty(sbd.CandidateNumber) ? sbd.CandidateNumber : string.Empty) : string.Empty });
                                    }
                                }
                                detail.DefaultView.Sort = "SBD";
                                detail = detail.DefaultView.ToTable();
                                var ds = new DataSet();
                                ds.Tables.Add(detail);
                                var fileName = exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + ".xlsx";
                                string tmpFile = "TemplateDataZip.xlsx";
                                ExcelFillData.FillReportGrid(fileName, tmpFile, ds, new string[] { "{", "}" }, 1);
                                var tempFile = Directory.GetCurrentDirectory() + "/OutputExcel/" + exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + ".xlsx";
                                var streamExcel = new MemoryStream(File.ReadAllBytes(tempFile));

                                var zipEntryExcel = archive.CreateEntry(exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + ".xlsx");

                                using (var zipEntryStream = zipEntryExcel.Open())
                                {
                                    streamExcel.CopyTo(zipEntryStream);
                                }
                                File.Delete(tempFile);
                            }

                        }
                    }
                    return new ResponseDataObject<object>(new { FileName = "/FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip" }, Code.Success, "/FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip");
                }
                return new ResponseData(Code.NotFound, "Không tìm thấy bản ghi");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }

        }

        public async Task<ResponseData> ExportImageByTestSchedule(Guid testScheduleId, string? accessToken)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataCandidate = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.TestScheduleId == testScheduleId);
                var sysExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == testScheduleId);
                string listPlaceString = "HeadQuarter/GetByListId?ids=" + string.Join(",", dataCandidate.DistinctBy(p => p.PlaceTest).Select(p => p.PlaceTest));
                if (sysExamScheduleTopik == null)
                    return new ResponseData(Code.NotFound, "Không tìm thấy kỳ thi");
                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + sysExamScheduleTopik.ExamId, accessToken != null ? accessToken : string.Empty);
                if (exam == null)
                    return new ResponseData(Code.NotFound, "Không tìm thấy bài thi");
                if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Card.zip")))
                    File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Card.zip"));

                using var archive = ZipFile.Open(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Card.zip"), ZipArchiveMode.Create);
                var getHeaderQuater = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, listPlaceString, accessToken != null ? accessToken : string.Empty);
                if (getHeaderQuater != null && getHeaderQuater.Data != null && getHeaderQuater.Data.Count() > 0)
                {
                    foreach (var item in getHeaderQuater.Data.Where(p => p.IsTopik))
                    {
                        var listRegister = dataCandidate.Where(p => p.PlaceTest == item.Id && p.IsPaid == (int)Constant.StatusPaid.Paid);
                        foreach (var child in listRegister)
                        {
                            var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                       join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                       where examRoomDivided.UserProfileId == child.UserProfileId && dividingExamPlace.ExamScheduleTopikId == testScheduleId
                                       select examRoomDivided
                           ).FirstOrDefault();
                            var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == child.Id);
                            if (profile != null)
                            {
                                if (profile.IDCardBack != null)
                                {
                                    var getBase64IDCardBack = profile.IDCardBack.Length > 1000 ? profile.IDCardBack : await MinioHelpers.GetBase64Minio(profile.IDCardBack);
                                    if (getBase64IDCardBack != null)
                                    {
                                        byte[] file = Convert.FromBase64String(getBase64IDCardBack);
                                        using (var stream = new MemoryStream(file))
                                        {
                                            string filename = sbd != null ? (sbd.CandidateNumber != null ? sbd.CandidateNumber : profile.IDNumber) : (profile.IDNumber);
                                            var zipEntry = archive.CreateEntry(exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + "/" + filename + "_back_" + (profile.TypeIdCard == "1" ? "CMND" : (profile.TypeIdCard == "2" ? "CCCD" : "HC")) + ".jpg");
                                            using (var zipEntryStream = zipEntry.Open())
                                            {
                                                stream.CopyTo(zipEntryStream);
                                            }
                                        }
                                    }
                                }
                                if (profile.IDCardFront != null)
                                {
                                    var getBase64IDCardFront = profile.IDCardFront.Length > 1000 ? profile.IDCardFront : await MinioHelpers.GetBase64Minio(profile.IDCardFront);
                                    if (getBase64IDCardFront != null)
                                    {
                                        byte[] file = Convert.FromBase64String(getBase64IDCardFront);
                                        using (var stream = new MemoryStream(file))
                                        {
                                            string filename = sbd != null ? (sbd.CandidateNumber != null ? sbd.CandidateNumber : profile.IDNumber) : (profile.IDNumber);
                                            var zipEntry = archive.CreateEntry(exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + "/" + filename + "_front_" + (profile.TypeIdCard == "1" ? "CMND" : (profile.TypeIdCard == "2" ? "CCCD" : "HC")) + ".jpg");
                                            using (var zipEntryStream = zipEntry.Open())
                                            {
                                                stream.CopyTo(zipEntryStream);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return new ResponseDataObject<object>(new { FileName = "/FileDownload/" + exam.Data?.Code + "_Card.zip" }, Code.Success, "/FileDownload/" + exam.Data?.Code + "_Card.zip");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }
        public async Task<ResponseData> ExportImageAvatarByTestSchedule(Guid testScheduleId, string? accessToken)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataCandidate = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.TestScheduleId == testScheduleId);
                var sysExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == testScheduleId);
                string listPlaceString = "HeadQuarter/GetByListId?ids=" + string.Join(",", dataCandidate.DistinctBy(p => p.PlaceTest).Select(p => p.PlaceTest));
                if (sysExamScheduleTopik == null)
                    return new ResponseData(Code.NotFound, "Không tìm thấy kỳ thi");
                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + sysExamScheduleTopik.ExamId, accessToken != null ? accessToken : string.Empty);
                if (exam == null)
                    return new ResponseData(Code.NotFound, "Không tìm thấy bài thi");
                if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Avatar.zip")))
                    File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Avatar.zip"));

                using var archive = ZipFile.Open(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + "_Avatar.zip"), ZipArchiveMode.Create);
                var getHeaderQuater = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, listPlaceString, accessToken != null ? accessToken : string.Empty);
                if (getHeaderQuater != null && getHeaderQuater.Data != null && getHeaderQuater.Data.Count() > 0)
                {
                    foreach (var item in getHeaderQuater.Data.Where(p => p.IsTopik))
                    {
                        var listRegister = dataCandidate.Where(p => p.PlaceTest == item.Id && p.IsPaid == (int)Constant.StatusPaid.Paid);
                        foreach (var child in listRegister)
                        {
                            var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                       join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                       where examRoomDivided.UserProfileId == child.UserProfileId && dividingExamPlace.ExamScheduleTopikId == testScheduleId
                                       select examRoomDivided
                           ).FirstOrDefault();
                            var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == child.Id);
                            if (profile != null)
                            {
                                if (profile.Image3x4 != null)
                                {
                                    var getBase64Image3x4 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                                    if (getBase64Image3x4 != null)
                                    {
                                        byte[] file = Convert.FromBase64String(getBase64Image3x4);
                                        using (var stream = new MemoryStream(file))
                                        {
                                            string filename = sbd != null ? (sbd.CandidateNumber != null ? sbd.CandidateNumber : profile.IDNumber) : (profile.IDNumber);
                                            var zipEntry = archive.CreateEntry(exam?.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + "/" + filename + "_avatar_" + (profile.TypeIdCard == "1" ? "CMND" : (profile.TypeIdCard == "2" ? "CCCD" : "HC")) + ".jpg");
                                            using (var zipEntryStream = zipEntry.Open())
                                            {
                                                stream.CopyTo(zipEntryStream);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
                return new ResponseDataObject<object>(new { FileName = "/FileDownload/" + exam.Data?.Code + "_Avatar.zip" }, Code.Success, "/FileDownload/" + exam.Data?.Code + "_Avatar.zip");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> ExportDataTestScheduleByHeadQuarter(Guid testScheduleId, Guid headQuarter, string? accessToken)
        {

            try
            {
                if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip")))
                    File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip"));
                using (var archive = ZipFile.Open(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip"), ZipArchiveMode.Create))
                {
                    var unitOfWork = new UnitOfWork(_httpContextAccessor);
                    var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.TestScheduleId == testScheduleId);
                    if (data != null)
                    {
                        var firstItem = data.FirstOrDefault();
                        if (firstItem != null)
                        {
                            var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + firstItem.ExamId, accessToken != null ? accessToken : string.Empty);
                            var getHeaderQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + headQuarter, accessToken != null ? accessToken : string.Empty);
                            var countryData = await HttpHelper.Get<ResponseDataObject<List<CountryModel>>>(apiBasicUriCatalog, "Countries", accessToken != null ? accessToken : string.Empty);
                            var languageData = await HttpHelper.Get<ResponseDataObject<List<LanguageModel>>>(apiBasicUriCatalog, "Language", accessToken != null ? accessToken : string.Empty);
                            if (getHeaderQuater != null && getHeaderQuater.Data != null)
                            {
                                var headerQuater = getHeaderQuater.Data;
                                DataTable detail = new DataTable();
                                detail.Columns.Add("FullNameKorea");
                                detail.Columns.Add("FullName");
                                detail.Columns.Add("Birthday");
                                detail.Columns.Add("Sex");
                                detail.Columns.Add("CountryKoreanName");
                                detail.Columns.Add("LanguageKoreanName");
                                detail.Columns.Add("OptionJob");
                                detail.Columns.Add("KnowWhere");
                                detail.Columns.Add("ExamPurpose");
                                detail.Columns.Add("SBD");
                                detail.TableName = "data";
                                var listRegister = data.Where(p => p.PlaceTest == headerQuater.Id && p.IsPaid == (int)Constant.StatusPaid.Paid);
                                foreach (var child in listRegister)
                                {
                                    var sbd = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.UserProfileId == child.UserProfileId);
                                    var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == child.Id);
                                    if (profile != null && profile.Image3x4 != null)
                                    {
                                        // image
                                        var getBase64 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                                        if (getBase64 != null)
                                        {
                                            byte[] file = Convert.FromBase64String(getBase64);
                                            using (var stream = new MemoryStream(file))
                                            {
                                                if (sbd != null && sbd.CandidateNumber != null)
                                                {
                                                    var zipEntry = archive.CreateEntry(exam?.Data?.Code + "_" + (headerQuater.KoreaName != null ? headerQuater.KoreaName : headerQuater.Code) + "/" + sbd.CandidateNumber + ".jpg");

                                                    using (var zipEntryStream = zipEntry.Open())
                                                    {
                                                        stream.CopyTo(zipEntryStream);
                                                    }
                                                }
                                            }
                                        }
                                        var getCountry = countryData?.Data?.FirstOrDefault(p => p.Code == profile.CountryCode);
                                        var getLanguage = languageData?.Data?.FirstOrDefault(p => p.Code == profile.LanguageCode);
                                        detail.Rows.Add(new object[] { profile.FullNameKorea, profile.FullName, profile.Birthday.ToString("yyyyMMdd"), profile.Sex == "man" ? 1 : 2, getCountry.KoreanName, getLanguage.KoreanName, profile.OptionJob, child.KnowWhere, child.ExamPurpose, sbd != null ? sbd?.CandidateNumber : string.Empty });
                                    }
                                }
                                detail.DefaultView.Sort = "SBD";
                                detail = detail.DefaultView.ToTable();
                                var ds = new DataSet();
                                ds.Tables.Add(detail);
                                var fileName = exam?.Data?.Code + "_" + (headerQuater.KoreaName != null ? headerQuater.KoreaName : headerQuater.Code) + ".xlsx";
                                string tmpFile = "TemplateDataZip.xlsx";
                                ExcelFillData.FillReportGrid(fileName, tmpFile, ds, new string[] { "{", "}" }, 1);
                                var tempFile = Directory.GetCurrentDirectory() + "/OutputExcel/" + exam?.Data?.Code + "_" + (headerQuater.KoreaName != null ? headerQuater.KoreaName : headerQuater.Code) + ".xlsx";
                                var streamExcel = new MemoryStream(File.ReadAllBytes(tempFile));

                                var zipEntryExcel = archive.CreateEntry(exam?.Data?.Code + "_" + (headerQuater.KoreaName != null ? headerQuater.KoreaName : headerQuater.Code) + ".xlsx");

                                using (var zipEntryStream = zipEntryExcel.Open())
                                {
                                    streamExcel.CopyTo(zipEntryStream);
                                }
                                File.Delete(tempFile);
                            }
                            else
                                return new ResponseDataError(Code.NotFound, "Không tìm thấy trụ sở !");
                        }
                    }
                }
                if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip")))
                {
                    var getFile = new MemoryStream(File.ReadAllBytes(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip")));
                    File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/Image3x4.zip"));
                    return new ResponseDataObject<MemoryStream>(getFile, Code.Success, string.Empty);
                }

                return new ResponseDataError(Code.NotFound, "Không tìm thấy dữ liệu !");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }

        }

        public async Task<ResponseData> CheckFileCanDown(Guid testScheduleId, int type, string accessToken)
        {
            var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var sysExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == testScheduleId);
            int canDownFile = (int)CanDownFile.IdNotfound;
            string link = "Not found !";

            if (sysExamScheduleTopik != null)
            {
                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + sysExamScheduleTopik.ExamId, accessToken);
                if (exam == null)
                    link = "Không tìm thấy bài thi";
                else
                {
                    switch (type)
                    {
                        case TypeCheckCandown.AllData:
                            if (File.Exists(Directory.GetCurrentDirectory() + "/FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip"))
                            {
                                try
                                {
                                    using (FileStream fileStream = File.Open(Directory.GetCurrentDirectory() + "/FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip", FileMode.Open, FileAccess.ReadWrite, FileShare.None))
                                    {
                                        if (fileStream != null) fileStream.Close();
                                        link = "/FileDownload/" + Utils.RemoveUnicode(Utils.RemoveSpecialCharacters(sysExamScheduleTopik.ExaminationName)) + ".zip";
                                        canDownFile = (int)CanDownFile.CanDown;
                                    }
                                }
                                catch (IOException ex)
                                {
                                    canDownFile = (int)CanDownFile.CanNotDown;
                                    link = ex.Message;
                                }
                            }
                            else
                            {
                                canDownFile = (int)CanDownFile.FileNotExits;
                            }
                            break;
                        case TypeCheckCandown.ImageCard:
                            if (File.Exists(Directory.GetCurrentDirectory() + "/FileDownload/" + exam.Data?.Code + "_Card.zip"))
                            {
                                try
                                {
                                    using (FileStream fileStream = File.Open(Directory.GetCurrentDirectory() + "/FileDownload/" + exam.Data?.Code + "_Card.zip", FileMode.Open, FileAccess.ReadWrite, FileShare.None))
                                    {
                                        if (fileStream != null) fileStream.Close();
                                        link = "/FileDownload/" + exam.Data?.Code + "_Card.zip";
                                        canDownFile = (int)CanDownFile.CanDown;
                                    }
                                }
                                catch (IOException ex)
                                {
                                    canDownFile = (int)CanDownFile.CanNotDown;
                                    link = ex.Message;
                                }
                            }
                            else
                            {
                                canDownFile = (int)CanDownFile.FileNotExits;
                            }
                            break;
                        case TypeCheckCandown.ImageAvatar:
                            if (File.Exists(Directory.GetCurrentDirectory() + "/FileDownload/" + exam.Data?.Code + "_Avatar.zip"))
                            {
                                try
                                {
                                    using (FileStream fileStream = File.Open(Directory.GetCurrentDirectory() + "/FileDownload/" + exam.Data?.Code + "_Avatar.zip", FileMode.Open, FileAccess.ReadWrite, FileShare.None))
                                    {
                                        if (fileStream != null) fileStream.Close();
                                        link = "/FileDownload/" + exam.Data?.Code + "_Avatar.zip";
                                        canDownFile = (int)CanDownFile.CanDown;
                                    }
                                }
                                catch (IOException ex)
                                {
                                    canDownFile = (int)CanDownFile.CanNotDown;
                                    link = ex.Message;
                                }
                            }
                            else
                            {
                                canDownFile = (int)CanDownFile.FileNotExits;
                            }
                            break;
                    }
                }


            }
            return new ResponseDataObject<int>(canDownFile, Code.Success, link);
        }

        public ResponseData DeleteFile(string filePath)
        {
            try
            {
                if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), filePath)))
                {
                    File.Delete(Path.Combine(Directory.GetCurrentDirectory(), filePath));
                    return new ResponseData(Code.Success, "Xóa thành công");
                }
                return new ResponseData(Code.Success, "Không tồn tại file");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> ExportExcel(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, string? accessToken, string? username, string? sbdSearch, Guid? examPeriod, bool? blacklist)
        {
            DataTable detail = new DataTable();
            detail.Columns.Add("FullName");
            detail.Columns.Add("FullNameEng");
            detail.Columns.Add("FullNameKorean");
            detail.Columns.Add("BirthDay");
            detail.Columns.Add("SDT");
            detail.Columns.Add("CCCD");
            detail.Columns.Add("Email");
            detail.Columns.Add("ExamName");
            detail.Columns.Add("SBD");
            detail.Columns.Add("ExamRoom");
            detail.Columns.Add("Area");
            detail.Columns.Add("PlaceTest");
            detail.Columns.Add("IsKorean");
            detail.Columns.Add("CountryEnglishName");
            detail.Columns.Add("IsDisabilities");
            detail.Columns.Add("DateCreate");
            detail.Columns.Add("Price", typeof(Decimal));
            detail.Columns.Add("Job");
            detail.Columns.Add("ExamPurpose");
            detail.Columns.Add("KnowWhere");
            detail.TableName = "DSTSDK";
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var examScheduleTopikIds = new List<Guid>();
                if (examPeriod != null)
                {
                    examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriod).Select(p => p.Id).ToList();
                }
                else
                {
                    var examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.IsCurrent);
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriod>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).Select(p => p.Id).ToList();
                }
                var listData = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetAll();
                var listBlacklist = unitOfWork.Repository<SysBlackListTopik>().GetAll();
                var listProfile = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();
                var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.IsPaid == (int)Constant.StatusPaid.Paid && examScheduleTopikIds.Contains(p.TestScheduleId));
                if (blacklist != null && (bool)blacklist)
                {
                    data = (from SysUserProfileRegistered in listProfile
                            join SysBlackListTopik in listBlacklist on SysUserProfileRegistered.FullName equals SysBlackListTopik.FullName
                            join SysManageRegisteredCandidateTopik in listData on SysUserProfileRegistered.CandidateRegisterId equals SysManageRegisteredCandidateTopik.Id
                            where SysManageRegisteredCandidateTopik.IsPaid == (int)StatusPaid.Paid && SysUserProfileRegistered.Birthday.Date == SysBlackListTopik.DateOfBirth.Date
                            select SysManageRegisteredCandidateTopik).ToList();

                }
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.PlaceTest));
                else
                    data = data.Where(p => p.Id == Guid.Empty);
                if (areaId != null)
                    data = data.Where(p => p.AreaTest == areaId);
                if (exam != null)
                    data = data.Where(p => p.ExamId == exam);
                if (placeTest != null)
                    data = data.Where(p => p.PlaceTest == placeTest);
                if (examVersion != null)
                    data = data.Where(p => p.TestScheduleId == examVersion);

                if (!string.IsNullOrEmpty(dateReceive))
                {
                    var date = dateReceive.Split(",");
                    DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data = data.Where(p => p.CreatedOnDate.Date >= dateConvert1 && p.CreatedOnDate.Date <= dateConvert2);
                }

                if (!string.IsNullOrEmpty(fullname))
                {
                    var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullName.Contains(fullname)).Select(p => p.CandidateRegisterId);
                    data = data.Where(p => candidateRegisters.Contains(p.Id));
                }

                if (!string.IsNullOrEmpty(username))
                {
                    var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.UserName.Contains(username)).Select(p => p.CandidateRegisterId);
                    data = data.Where(p => candidateRegisters.Contains(p.Id));
                }
                if (!string.IsNullOrEmpty(cccd))
                {
                    var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CCCD.Contains(cccd) || p.CMND.Contains(cccd) || p.Passport.Contains(cccd)).Select(p => p.CandidateRegisterId);
                    data = data.Where(p => candidateRegisters.Contains(p.Id));
                }
                if (!string.IsNullOrEmpty(sbdSearch))
                {
                    //var sbd = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.CandidateNumber == sbdSearch);
                    var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                               join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                               where examRoomDivided.CandidateNumber == sbdSearch && examScheduleTopikIds.Contains(dividingExamPlace.ExamScheduleTopikId)
                               select examRoomDivided
                                  ).FirstOrDefault();
                    if (sbd != null)
                    {
                        var sysDividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.Id == sbd.DividingExamPlaceId);
                        if (sysDividingExamPlace != null)
                            data = data.Where(p => p.UserProfileId == sbd.UserProfileId && sysDividingExamPlace.ExamScheduleTopikId == p.TestScheduleId);
                    }
                    else
                        data = data.Where(p => p.Id == Guid.Empty);
                }
                var ids = data.Select(p => p.Id).ToList();
                var result = new List<ManageRegisteredCandidateTopikModel>();
                var userProfiles = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => ids.Contains(p.CandidateRegisterId));
                var userProfilesIds = data.Select(p => p.UserProfileId);
                var sbds = unitOfWork.Repository<SysExamRoomDivided>().Get(p => userProfilesIds.Contains(p.UserProfileId));
                var examGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty);
                var areaGet = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : string.Empty);
                var examRoomsGets = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>("https://ssoapi.iigvietnam.com/catalog/v1/ExamRoom", "", accessToken != null ? accessToken : string.Empty);
                var countryData = await HttpHelper.Get<ResponseDataObject<List<CountryModel>>>(apiBasicUriCatalog, "Countries", accessToken != null ? accessToken : "");
                List<ExamRoomModel> examRooms = new List<ExamRoomModel>();
                if (examRoomsGets != null && examRoomsGets.Data != null)
                {
                    examRooms = examRoomsGets.Data;
                }
                var areas = new List<AreaModel>();
                if (areaGet != null && areaGet.Code == Code.Success && areaGet.Data != null && areaGet.Data.Count > 0)
                    areas = areaGet.Data;
                if (data != null && data.Count() > 0)
                {
                    foreach (var item in data)
                    {
                        var userProfile = userProfiles.FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        //var sbd = sbds.FirstOrDefault(p => p.UserProfileId == item.UserProfileId && );
                        var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                   join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                   where examRoomDivided.CandidateRegisterId == item.Id && item.TestScheduleId == dividingExamPlace.ExamScheduleTopikId
                                   select examRoomDivided
                                    ).FirstOrDefault();
                        var examRoom = examRooms.FirstOrDefault(p => p.Id == sbd?.ExamRoomId);
                        var area = areas.FirstOrDefault(p => p.Id == item.AreaTest);
                        var examF = examGet?.Data?.FirstOrDefault(p => p.Id == item.ExamId);
                        var idCard = string.Empty;
                        if (userProfile != null)
                        {
                            var getCountry = countryData?.Data?.FirstOrDefault(p => p.Code == userProfile.CountryCode);

                            if (userProfile.TypeIdCard == TypeIDCard.CMND)
                                idCard = !string.IsNullOrEmpty(userProfile.CMND) ? userProfile.CMND : string.Empty;
                            if (userProfile.TypeIdCard == TypeIDCard.CCCD)
                                idCard = !string.IsNullOrEmpty(userProfile.CCCD) ? userProfile.CCCD : string.Empty;
                            if (userProfile.TypeIdCard == TypeIDCard.Passport)
                                idCard = !string.IsNullOrEmpty(userProfile.Passport) ? userProfile.Passport : string.Empty;

                            detail.Rows.Add(new object[] { userProfile.FullNameOrigin.ToUpper(), userProfile.FullName.ToUpper(), userProfile.FullNameKorea, userProfile.Birthday.ToString("dd/MM/yyyy"), userProfile.Phone, idCard, userProfile.Email, examF != null ? examF.Name : string.Empty, sbd != null ? sbd.CandidateNumber : string.Empty, examRoom != null ? examRoom.Name : string.Empty, area != null ? area.Name : string.Empty, item.PlaceTestName != null ? item.PlaceTestName : string.Empty, userProfile.IsKorean == "true" ? "Có" : "Không", !string.IsNullOrEmpty(getCountry?.EnglishName) ? getCountry.EnglishName : string.Empty, userProfile.IsDisabilities ? "Có" : "Không", item.CreatedOnDate.ToString("dd-MM-yyyy HH:mm:ss"), item.Price, Utils.ConvertJob(!string.IsNullOrEmpty(userProfile.OptionJob) ? userProfile.OptionJob : string.Empty, userProfile.Job), Utils.ConvertPurposeTopik(item.ExamPurpose.Length > 0 ? item.ExamPurpose : "1"), Utils.ConvertKnowWhere(item.KnowWhere.Length > 0 ? item.KnowWhere : "1") });

                        }
                    }
                }
                var ds = new DataSet();
                detail.DefaultView.Sort = "DateCreate desc";
                detail = detail.DefaultView.ToTable();
                ds.Tables.Add(detail);
                var fileName = "DSTSDK.xlsx";
                ExcelFillData.FillReportGrid(fileName, fileName, ds, new string[] { "{", "}" }, 1);
                return new ResponseDataObject<object>(new { FileName = "/OutputExcel/DSTSDK.xlsx" }, Code.Success, "/OutputExcel/DSTSDK.xlsx");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> CheckResgisted(string accessToken, ResponseDataObject<B2CUserModel>? profileIn)
        {
            try
            {
                var profiles = new ResponseDataObject<B2CUserModel>();
                bool periodRegisted = false;
                bool registed = false;
                if (profileIn != null)
                    profiles = profileIn;
                else
                    profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                    var period = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.Status);
                    if (period == null)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy Kỳ thi Topik đang mở");

                    var scheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == period.Id);
                    if (scheduleTopik.Count() == 0)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy lịch thi cho bài thi này");
                    var scheduleTopikIds = scheduleTopik.Select(p => p.Id).ToList();
                    var getHistory = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().FirstOrDefault(p => scheduleTopikIds.Contains(p.TestScheduleId) && p.UserId == profiles.Data.Id && p.IsPaid == (int)StatusPaid.Paid);
                    if (getHistory != null)
                        periodRegisted = true;

                    var checkRegisted = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.UserId == profiles.Data.Id && p.IsPaid == (int)StatusPaid.Paid).OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    if (checkRegisted != null)
                        registed = true;

                    return new ResponseDataObject<object>(new
                    {
                        PeriodRegisted = periodRegisted,
                        Registed = registed,
                        UserProfileIdRecent = checkRegisted?.UserProfileId.ToString()
                    }, Code.Success, string.Empty);
                }
                return new ResponseDataError(Code.NotFound, "Không tìm thấy thông tin user");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetAllImageCandidate(Guid testScheduleId, string accessToken)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.TestScheduleId == testScheduleId);
                var sysExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(p => p.Id == testScheduleId);

                if (data.Count() > 0 && sysExamScheduleTopik != null)
                {
                    var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + sysExamScheduleTopik.ExamId, accessToken != null ? accessToken : string.Empty);
                    if (File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + ".zip")))
                        File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + ".zip"));
                    using var archive = ZipFile.Open(Path.Combine(Directory.GetCurrentDirectory(), "FileDownload/" + exam.Data?.Code + ".zip"), ZipArchiveMode.Create);
                    string listPlaceString = "HeadQuarter/GetByListId?ids=" + string.Join(",", data.DistinctBy(p => p.PlaceTest).Select(p => p.PlaceTest));
                    var getHeaderQuater = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, listPlaceString, accessToken != null ? accessToken : string.Empty);
                    if (getHeaderQuater != null && getHeaderQuater.Data != null && getHeaderQuater.Data.Count() > 0)
                    {
                        foreach (var item in getHeaderQuater.Data.Where(p => p.IsTopik))
                        {

                            var listRegister = data.Where(p => p.PlaceTest == item.Id && p.IsPaid == (int)Constant.StatusPaid.Paid);
                            foreach (var child in listRegister)
                            {
                                var sbd = (from examRoomDivided in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                                           join dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivided.DividingExamPlaceId equals dividingExamPlace.Id
                                           where examRoomDivided.UserProfileId == child.UserProfileId && dividingExamPlace.ExamScheduleTopikId == testScheduleId
                                           select examRoomDivided
                               ).FirstOrDefault();
                                var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == child.Id);
                                if (profile != null && profile.Image3x4 != null)
                                {
                                    // image
                                    var getBase64 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                                    if (getBase64 != null)
                                    {
                                        byte[] file = Convert.FromBase64String(getBase64);
                                        using (var stream = new MemoryStream(file))
                                        {
                                            if (sbd != null && sbd.CandidateNumber != null)
                                            {
                                                var zipEntry = archive.CreateEntry(exam.Data?.Code + "_" + (item.KoreaName != null ? item.KoreaName : item.Code) + "/" + sbd.CandidateNumber + ".jpg");

                                                using (var zipEntryStream = zipEntry.Open())
                                                {
                                                    stream.CopyTo(zipEntryStream);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return new ResponseDataObject<object>(new { FileName = "/FileDownload/" + exam.Data?.Code + ".zip" }, Code.Success, "/FileDownload/" + exam.Data?.Code + ".zip");
                }
                return new ResponseDataError(Code.NotFound, "Không tìm thấy danh sách");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> UpdateInfoCandidate(string accessToken)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullName == string.Empty);
                var candidateRegisters = data.Select(p => p.CandidateRegisterId);
                var dataResgisters = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => candidateRegisters.Contains(p.Id) && p.IsPaid == (int)StatusPaid.Paid);
                foreach (var saveProfile in data)
                {
                    var userProfileId = dataResgisters.FirstOrDefault(p => p.Id == saveProfile.CandidateRegisterId);
                    if (userProfileId != null)
                    {
                        var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + userProfileId.UserId + "?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                        if (profiles != null)
                        {
                            var metadata = profiles.Data.Profiles.FirstOrDefault().Metadata;
                            var contactAddressCityId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CityContact);
                            if (contactAddressCityId != null && contactAddressCityId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressCityId = new Guid(contactAddressCityId.Value);
                            }
                            var contactAddressDistrictId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DistrictContact);
                            if (contactAddressDistrictId != null && contactAddressDistrictId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressDistrictId = new Guid(contactAddressDistrictId.Value);
                            }
                            var contactAddressWardsId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WardContact);
                            if (contactAddressWardsId != null && contactAddressWardsId.Value.Length == 36)
                            {
                                saveProfile.ContactAddressWardId = new Guid(contactAddressWardsId.Value);
                            }
                            var birthDay = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthDay);
                            if (birthDay != null)
                            {
                                saveProfile.Birthday = DateTime.ParseExact(birthDay.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                saveProfile.Month = saveProfile.Birthday.Month;
                                saveProfile.Date = saveProfile.Birthday.Day;
                            }
                            var email = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Email);
                            if (email != null)
                            {
                                saveProfile.Email = email.Value;
                            }
                            var vietnameseName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.VietnameseName);
                            if (vietnameseName != null)
                            {
                                string fullName = vietnameseName.Value.Trim();
                                Regex trimmer = new Regex(@"\s\s+");
                                fullName = trimmer.Replace(fullName, " ");
                                saveProfile.FullNameOrigin = vietnameseName.Value.Trim();
                                saveProfile.FullName = Utils.RemoveUnicode(fullName);
                                saveProfile.LastName = saveProfile.FullName.Split(" ").LastOrDefault();
                                saveProfile.FirstName = saveProfile.FullName.Replace(" " + saveProfile.LastName, "");
                            }
                            var koreaName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.KoreaName);
                            if (koreaName != null)
                            {
                                saveProfile.FullNameKorea = koreaName.Value;
                            }
                            var countryCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Country);
                            if (countryCode != null)
                            {
                                var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + countryCode.Value.ToString(), accessToken != null ? accessToken : "");
                                saveProfile.CountryEnglishName = countryModel?.Data?.EnglishName;
                                saveProfile.CountryKoreanName = countryModel?.Data?.KoreanName;
                                saveProfile.CountryCode = countryCode.Value;
                            }
                            var languageCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Language);
                            if (languageCode != null)
                            {
                                var languageModel = await HttpHelper.Get<ResponseDataObject<LanguageModel>>(apiBasicUriCatalog, "Language/code/" + languageCode.Value.ToString(), accessToken != null ? accessToken : "");
                                saveProfile.LanguageEnglishName = languageModel?.Data?.EnglishName;
                                saveProfile.LanguageKoreanName = languageModel?.Data?.KoreanName;
                                saveProfile.LanguageCode = languageCode.Value;
                            }
                            var phone = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Phone);
                            if (phone != null)
                            {
                                saveProfile.Phone = phone.Value;
                            }
                            var houseNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.HouseNumber);
                            if (houseNumber != null)
                            {
                                saveProfile.ContactAddress = houseNumber.Value;
                            }
                            var gender = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Gender);
                            if (gender != null)
                            {
                                saveProfile.Sex = gender.Value;
                            }
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            if (typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                            }
                            //var idCardNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            //if (idCardNumber != null)
                            //{
                            //    var checkBlacklist = unitOfWork.Repository<SysBlackListTopik>().FirstOrDefault(p => p.IdentityCard == idCardNumber.Value.Trim());
                            //    if (checkBlacklist != null)
                            //    {
                            //        if (checkBlacklist.FinishPunishmentDate == null || (checkBlacklist.FinishPunishmentDate.Value.Date > examSchedule.ExamDate.Date))
                            //        {
                            //            if (saveProfile.Birthday.Date == checkBlacklist.DateOfBirth.Date && saveProfile.FullName.Trim().ToLower() == checkBlacklist.FullName.Trim().ToLower())
                            //                return new ResponseDataObject<object>(new
                            //                {
                            //                    FinishDate = checkBlacklist.FinishPunishmentDate,
                            //                    StartDate = checkBlacklist.NotifyResultDate
                            //                }, Code.Forbidden, "blacklist");
                            //        }
                            //    }

                            //    saveProfile.IDNumber = idCardNumber.Value;
                            //}
                            var cccdT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CCCD);
                            if (cccdT != null)
                            {
                                saveProfile.CCCD = cccdT.Value;
                            }
                            var cmndT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            if (cmndT != null)
                            {
                                saveProfile.CMND = cmndT.Value;
                            }
                            var passport = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Passport);
                            if (passport != null)
                            {
                                saveProfile.Passport = passport.Value;
                            }

                            if (saveProfile.TypeIdCard == TypeIDCard.CMND)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CMND) ? saveProfile.CMND : string.Empty;
                            else if (saveProfile.TypeIdCard == TypeIDCard.CCCD)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CCCD) ? saveProfile.CCCD : string.Empty;
                            else
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.Passport) ? saveProfile.Passport : string.Empty;

                            var dateOfIssueOfIDCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DateOfIssueOfIDCard);
                            if (dateOfIssueOfIDCard != null)
                            {
                                saveProfile.DateOfCCCD = DateTime.ParseExact(dateOfIssueOfIDCard.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                            }
                            var placeProvideIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard);
                            if (placeProvideIdCard != null)
                            {
                                saveProfile.PlaceOfCCCD = placeProvideIdCard.Value;
                            }

                            var iDCardFront = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardFront);
                            if (iDCardFront != null)
                            {
                                saveProfile.IDCardFront = iDCardFront.TextValue;
                            }
                            var iDCardBack = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardBack);
                            if (iDCardBack != null)
                            {
                                saveProfile.IDCardBack = iDCardBack.TextValue;
                            }
                            var image3x4 = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Image3x4);
                            if (image3x4 != null)
                            {
                                saveProfile.Image3x4 = image3x4.TextValue;
                            }
                            var studentCardImage = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.StudentCardImage);
                            if (studentCardImage != null)
                            {
                                saveProfile.StudentCardImage = studentCardImage.TextValue;
                            }
                            var isKorean = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IsKorean);
                            if (isKorean != null)
                            {
                                saveProfile.IsKorean = isKorean.Value;
                            }
                            var schoolCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.SchoolCertificate);
                            if (schoolCertificate != null)
                            {
                                saveProfile.SchoolCertificate = schoolCertificate.TextValue;
                            }
                            var birthCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthCertificate);
                            if (birthCertificate != null)
                            {
                                saveProfile.BirthCertificate = birthCertificate.TextValue;
                            }

                            saveProfile.PlaceOfCCCD = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard)?.Value;
                            saveProfile.Job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job)?.Value;
                            saveProfile.OptionJob = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OptionJob)?.Value;
                            unitOfWork.Save();
                        }
                    }
                }

                return new ResponseDataError(Code.NotFound, "Không tìm thấy danh sách");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> ExportExcelTotalCandidate(Guid examPeriod, string accessToken)
        {

            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var examPeriodGet = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.Id == examPeriod);
                if (examPeriodGet == null)
                    return new ResponseDataError(Code.NotFound, "ExamPeriodNotFound");

                var examScheduleTopikIds = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriod).Select(p => p.Id).ToList();

                var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.IsPaid == (int)Constant.StatusPaid.Paid && examScheduleTopikIds.Contains(p.TestScheduleId));
                var examModelGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken);
                var headQuartersGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken);

                var exams = new List<ExamModel>();
                if (examModelGet != null && examModelGet.Data != null)
                {
                    exams = examModelGet.Data;
                }
                var headQuarters = new List<HeadQuarterModel>();
                if (headQuartersGet != null && headQuartersGet.Data != null)
                {
                    headQuarters = headQuartersGet.Data;
                }
                DataTable detail = new DataTable();
                detail.Columns.Add("Title");
                detail.TableName = "Title";

                DataRow dr = detail.NewRow();
                dr["Title"] = $"제 {examPeriodGet.Number}회 한국어능력시험 지원자 현황";
                long totalTopik1 = 0, totalTopik2 = 0;
                var topik1 = exams.FirstOrDefault(p => p.Code == "TOPIK_I");
                var topik2 = exams.FirstOrDefault(p => p.Code == "TOPIK_II");
                if (topik1 != null && topik2 != null)
                {
                    DataTable dataSheet = new DataTable();
                    dataSheet.Columns.Add("Name");
                    dataSheet.Columns.Add("Topik1");
                    dataSheet.Columns.Add("Topik2");
                    dataSheet.Columns.Add("Total");
                    dataSheet.TableName = "Total";
                    foreach (var headQuarter in headQuarters.Where(p => p.IsTopik))
                    {

                        var totalTopik1ByHeadQuarter = data.Count(p => p.PlaceTest == headQuarter.Id && p.ExamId == topik1.Id);
                        var totalTopik2ByHeadQuarter = data.Count(p => p.PlaceTest == headQuarter.Id && p.ExamId == topik2.Id);
                        totalTopik1 += totalTopik1ByHeadQuarter;
                        totalTopik2 += totalTopik2ByHeadQuarter;
                        dataSheet.Rows.Add(new object[] { !string.IsNullOrEmpty(headQuarter.KoreaName) ? headQuarter.KoreaName : string.Empty, data.Count(p => p.PlaceTest == headQuarter.Id && p.ExamId == topik1.Id), data.Count(p => p.PlaceTest == headQuarter.Id && p.ExamId == topik2.Id), totalTopik1ByHeadQuarter + totalTopik2ByHeadQuarter });
                    }
                    dataSheet.Rows.Add(new object[] { "합계", totalTopik1, totalTopik2, totalTopik1 + totalTopik2 });

                    var ds = new DataSet();

                    ds.Tables.Add(dataSheet);
                    detail.Rows.Add(dr);

                    ds.Tables.Add(detail);

                    var fileName = "ThongKeTopik.xlsx";
                    ExcelFillData.FillReportGrid(fileName, fileName, ds, new string[] { "{", "}" }, 1);
                    return new ResponseDataObject<object>(new { FileName = "/OutputExcel/ThongKeTopik.xlsx" }, Code.Success, "/OutputExcel/ThongKeTopik.xlsx");
                }
                else
                {
                    return new ResponseDataError(Code.NotFound, "ExamIDNotFound");
                }

            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> UpdateUserInfo(string accessToken)
        {

            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullName == "");
                if (userProfileRegistereds == null)
                    return new ResponseDataError(Code.NotFound, "NotFoundDataNull");

                var candidateRegisteds = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.IsPaid == (int)StatusPaid.Paid && userProfileRegistereds.Select(p => p.CandidateRegisterId).Contains(p.Id));

                foreach (var item in candidateRegisteds)
                {
                    var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + item.UserId + "?includeData=profile&isCurrentProfile=true", accessToken);
                    if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                    {
                        var profileUse = profiles?.Data?.Profiles.FirstOrDefault();
                        if (profileUse != null)
                        {
                            var metadata = profileUse.Metadata;
                            var saveProfile = userProfileRegistereds.FirstOrDefault(p => p.CandidateRegisterId == item.Id);

                            if (metadata != null && saveProfile != null)
                            {
                                var contactAddressCityId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CityContact);
                                if (contactAddressCityId != null && contactAddressCityId.Value.Length == 36)
                                {
                                    saveProfile.ContactAddressCityId = new Guid(contactAddressCityId.Value);
                                }
                                var contactAddressDistrictId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DistrictContact);
                                if (contactAddressDistrictId != null && contactAddressDistrictId.Value.Length == 36)
                                {
                                    saveProfile.ContactAddressDistrictId = new Guid(contactAddressDistrictId.Value);
                                }
                                var contactAddressWardsId = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WardContact);
                                if (contactAddressWardsId != null && contactAddressWardsId.Value.Length == 36)
                                {
                                    saveProfile.ContactAddressWardId = new Guid(contactAddressWardsId.Value);
                                }
                                var birthDay = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthDay);
                                if (birthDay != null)
                                {
                                    saveProfile.Birthday = DateTime.ParseExact(birthDay.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                    saveProfile.Month = saveProfile.Birthday.Month;
                                    saveProfile.Date = saveProfile.Birthday.Day;
                                }
                                var email = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Email);
                                if (email != null)
                                {
                                    saveProfile.Email = email.Value;
                                }
                                var vietnameseName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.VietnameseName);
                                if (vietnameseName != null)
                                {
                                    string fullName = vietnameseName.Value.Trim();
                                    Regex trimmer = new Regex(@"\s\s+");
                                    fullName = trimmer.Replace(fullName, " ");
                                    saveProfile.FullNameOrigin = vietnameseName.Value.Trim();
                                    saveProfile.FullName = Utils.RemoveUnicode(fullName);
                                    saveProfile.LastName = saveProfile.FullName.Split(" ").LastOrDefault();
                                    saveProfile.FirstName = saveProfile.FullName.Replace(" " + saveProfile.LastName, "");
                                }
                                var koreaName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.KoreaName);
                                if (koreaName != null)
                                {
                                    saveProfile.FullNameKorea = koreaName.Value;
                                }
                                var countryCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Country);
                                if (countryCode != null)
                                {
                                    var countryModel = await HttpHelper.Get<ResponseDataObject<CountryModel>>(apiBasicUriCatalog, "Countries/code/" + countryCode.Value.ToString(), accessToken);
                                    saveProfile.CountryEnglishName = countryModel?.Data?.EnglishName;
                                    saveProfile.CountryKoreanName = countryModel?.Data?.KoreanName;
                                    saveProfile.CountryCode = countryCode.Value;
                                }
                                var languageCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Language);
                                if (languageCode != null)
                                {
                                    var languageModel = await HttpHelper.Get<ResponseDataObject<LanguageModel>>(apiBasicUriCatalog, "Language/code/" + languageCode.Value.ToString(), accessToken);
                                    saveProfile.LanguageEnglishName = languageModel?.Data?.EnglishName;
                                    saveProfile.LanguageKoreanName = languageModel?.Data?.KoreanName;
                                    saveProfile.LanguageCode = languageCode.Value;
                                }
                                var phone = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Phone);
                                if (phone != null)
                                {
                                    saveProfile.Phone = phone.Value;
                                }
                                var houseNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.HouseNumber);
                                if (houseNumber != null)
                                {
                                    saveProfile.ContactAddress = houseNumber.Value;
                                }
                                var gender = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Gender);
                                if (gender != null)
                                {
                                    saveProfile.Sex = gender.Value;
                                }
                                var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                                if (typeIdCard != null)
                                {
                                    saveProfile.TypeIdCard = typeIdCard.Value;
                                }
                                var cccdT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CCCD);
                                if (cccdT != null)
                                {
                                    saveProfile.CCCD = cccdT.Value;
                                }
                                var cmndT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                                if (cmndT != null)
                                {
                                    saveProfile.CMND = cmndT.Value;
                                }
                                var passport = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Passport);
                                if (passport != null)
                                {
                                    saveProfile.Passport = passport.Value;
                                }

                                if (saveProfile.TypeIdCard == TypeIDCard.CMND)
                                    saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CMND) ? saveProfile.CMND : string.Empty;
                                else if (saveProfile.TypeIdCard == TypeIDCard.CCCD)
                                    saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CCCD) ? saveProfile.CCCD : string.Empty;
                                else
                                    saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.Passport) ? saveProfile.Passport : string.Empty;

                                var dateOfIssueOfIDCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DateOfIssueOfIDCard);
                                if (dateOfIssueOfIDCard != null)
                                {
                                    saveProfile.DateOfCCCD = DateTime.ParseExact(dateOfIssueOfIDCard.Value, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                                }
                                var placeProvideIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard);
                                if (placeProvideIdCard != null)
                                {
                                    saveProfile.PlaceOfCCCD = placeProvideIdCard.Value;
                                }

                                var iDCardFront = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardFront);
                                if (iDCardFront != null)
                                {
                                    saveProfile.IDCardFront = iDCardFront.TextValue;
                                }
                                var iDCardBack = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IDCardBack);
                                if (iDCardBack != null)
                                {
                                    saveProfile.IDCardBack = iDCardBack.TextValue;
                                }
                                var image3x4 = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Image3x4);
                                if (image3x4 != null)
                                {
                                    saveProfile.Image3x4 = image3x4.TextValue;
                                }
                                var studentCardImage = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.StudentCardImage);
                                if (studentCardImage != null)
                                {
                                    saveProfile.StudentCardImage = studentCardImage.TextValue;
                                }
                                var isKorean = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IsKorean);
                                if (isKorean != null)
                                {
                                    saveProfile.IsKorean = isKorean.Value;
                                }
                                var schoolCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.SchoolCertificate);
                                if (schoolCertificate != null)
                                {
                                    saveProfile.SchoolCertificate = schoolCertificate.TextValue;
                                }
                                var birthCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthCertificate);
                                if (birthCertificate != null)
                                {
                                    saveProfile.BirthCertificate = birthCertificate.TextValue;
                                }

                                saveProfile.PlaceOfCCCD = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard)?.Value;
                                saveProfile.Job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job)?.Value;
                                saveProfile.OptionJob = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OptionJob)?.Value;
                                unitOfWork.Repository<SysUserProfileRegistered>().Update(saveProfile);
                            }
                        }
                    }
                    unitOfWork.Save();
                }
                return new ResponseData(Code.Success, string.Empty);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> ExportFileHtml()
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                string queryGet = $"SELECT * FROM [IIG.Core.Framework.EOS].[dbo].[EmailHistories] where [Subject] like N'%Đăng ký%' and ToEmail in (SELECT [UserEmail] FROM [IIG.Core.Framework.EOS].[dbo].[SysPaymentRequestLog] where Id in (SELECT [PaymentRequestId] FROM [IIG.Core.Framework.EOS].[dbo].[SysPaymentResponseLog] where TransactionNo in ('101478879','101478918','101524430','101550652','101480387','101480509','101480685','101480858','101483522','101484644','101484786','101484249','101484440','101485252','101485985','101487582','101490855','101493633','101493927','101494382','101495335','101497638','101498234','101502120','101503940','101504202','101504439','101506321','101505105','101508109','101508375','101509749','101511492','101511995','101517429','101517616','101537081','101539704','101542819','101543751','101543938','101565117','101566348')))";
                var data = await _dapperUnit.GetRepository().QueryAsync<SysEmailHistory>(queryGet);
                int i = 1;
                foreach (var item in data)
                {
                    i++;
                    string fileName = Directory.GetCurrentDirectory() + "/FileDownload/" + item.ToEmail + ".html";
                    if (File.Exists(fileName))
                    {
                        fileName = Directory.GetCurrentDirectory() + "/FileDownload/" + item.ToEmail + i.ToString() + ".html";
                    }
                    File.WriteAllText(fileName, item.Body);
                }
                return new ResponseData(Code.Success, "");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }


        public async Task<ResponseData> ExportExcellSatisticExamPeriod(Guid examPeriod, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var headQuartersGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken);
                var examPeriodGet = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.Id == examPeriod);
                if (examPeriodGet == null)
                    return new ResponseDataError(Code.NotFound, "ExamPeriodNotFound");

                var examScheduleTopiks = unitOfWork.Repository<SysExamScheduleTopik>().Get(p => p.ExamPeriodId == examPeriod).ToList();

                //var data = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(p => p.IsPaid == (int)Constant.StatusPaid.Paid && examScheduleTopikIds.Contains(p.TestScheduleId));
                var examModelGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken);
                var areaGet = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken);
                var examRoomGet = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, "ExamRoom", accessToken);
                var examRooms = new List<ExamRoomModel>();
                if (areaGet != null && examRoomGet.Data != null)
                {
                    examRooms = examRoomGet.Data;
                }
                var areas = new List<AreaModel>();
                if (areaGet != null && areaGet.Data != null)
                {
                    areas = areaGet.Data;
                }
                var exams = new List<ExamModel>();
                if (examModelGet != null && examModelGet.Data != null)
                {
                    exams = examModelGet.Data;
                }
                var headQuarters = new List<HeadQuarterModel>();
                if (headQuartersGet != null && headQuartersGet.Data != null)
                {
                    headQuarters = headQuartersGet.Data.Where(p => p.IsTopik).ToList();
                }

                string fileName = Directory.GetCurrentDirectory() + "/FileDownload/test.xlsx";
                if (File.Exists(fileName))
                    File.Delete(fileName);

                var memoryStream = new MemoryStream();
                if (1 != 2)
                {
                    var currentRequest = _httpContextAccessor.HttpContext!.Request;
                    using var excelPackage = new ExcelPackage();
                    var sheet = excelPackage.Workbook.Worksheets.Add("MienBac-Trung");
                    sheet.View.FreezePanes(7, 8);
                    sheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    sheet.Cells.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    sheet.Column(1).Width = 20;
                    sheet.Column(2).Width = 20;
                    sheet.Column(3).Width = 20;
                    sheet.Column(4).Width = 20;
                    sheet.Column(5).Width = 40;
                    sheet.Column(6).Width = 10;
                    sheet.Column(7).Width = 10;
                    sheet.Column(8).Width = 10;

                    var headerRow = sheet.Cells[2, 1, 2, 8];
                    headerRow.Merge = true;
                    headerRow.Value = $"제 {examPeriodGet.Number}회 한국어능력시험 지원자 현황";
                    headerRow.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    headerRow.Style.Font.Bold = true;
                    headerRow.Style.Font.Size = 20;

                    var title1 = sheet.Cells[4, 1, 4, 5];
                    title1.Merge = true;
                    title1.Value = "□ 시행기관: IIG VIETNAM";
                    title1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    title1.Style.Font.Size = 11;
                    var title2 = sheet.Cells[4, 6, 4, 8];
                    title2.Merge = true;
                    title2.Value = "□ 확인자: ";
                    title2.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    title2.Style.Font.Size = 11;
                    //table
                    var col1 = sheet.Cells[5, 1, 6, 1];
                    col1.Merge = true;
                    col1.Value = "시험지역";
                    col1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col1.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col1.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col1.Style.Font.Size = 10;
                    col1.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col1.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col2 = sheet.Cells[5, 2, 6, 2];
                    col2.Merge = true;
                    col2.Value = "시험장명";
                    col2.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col2.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col2.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col2.Style.Font.Size = 10;
                    col2.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col2.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col3 = sheet.Cells[5, 3, 6, 3];
                    col3.Merge = true;
                    col3.Value = "시험실명";
                    col3.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col3.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col3.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col3.Style.Font.Size = 10;
                    col3.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col3.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col4 = sheet.Cells[5, 4, 6, 4];
                    col4.Merge = true;
                    col4.Value = "시험수준";
                    col4.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col4.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col4.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col4.Style.Font.Size = 10;
                    col4.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col4.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col5 = sheet.Cells[5, 5, 5, 6];
                    col5.Merge = true;
                    col5.Value = "수험번호 구간 및 시험실 수";
                    col5.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col5.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col5.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col5.Style.Font.Size = 10;
                    col5.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col5.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col6 = sheet.Cells[6, 5];
                    col6.Merge = true;
                    col6.Value = "수 험 번 호 구 간";
                    col6.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col6.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col6.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col6.Style.Font.Size = 10;
                    col6.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col6.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));


                    var col7 = sheet.Cells[6, 6];
                    col7.Merge = true;
                    col7.Value = "시험실수";
                    col7.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col7.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col7.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col7.Style.Font.Size = 10;
                    col7.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col7.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));

                    var col8 = sheet.Cells[5, 7, 6, 7];
                    col8.Merge = true;
                    col8.Value = "지원자수";
                    col8.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col8.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col8.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col8.Style.Font.Size = 10;
                    col8.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col8.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));
                    col8.Style.Border.BorderAround(ExcelBorderStyle.Thin);

                    var col9 = sheet.Cells[5, 7, 6, 8];
                    col9.Merge = true;
                    col9.Value = "시험실감독관 수";
                    col9.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    col9.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col9.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    col9.Style.Font.Size = 10;
                    col9.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    col9.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(127, 127, 127));
                    col9.Style.Border.BorderAround(ExcelBorderStyle.Thin);

                    ExcelWorksheet sheet1 = excelPackage.Workbook.Worksheets.Copy("MienBac-Trung", "MienNam");

                    var topik1 = exams.FirstOrDefault(p => p.Code == "TOPIK_I");
                    var topik2 = exams.FirstOrDefault(p => p.Code == "TOPIK_II");

                    int row = 7;
                    if (topik1 != null && topik2 != null)
                    {
                        var schedule1 = examScheduleTopiks.FirstOrDefault(p => p.ExamId == topik1.Id);
                        var schedule2 = examScheduleTopiks.FirstOrDefault(p => p.ExamId == topik2.Id);
                        if (schedule1 != null && schedule2 != null)
                        {
                            foreach (var area in areas.Where(p => p.Region == (int)RegionNumber.MienBac || p.Region == (int)RegionNumber.MienTrung))
                            {
                                int startArea = row;
                                var headQuarterByArea = headQuarters.Where(p => p.AreaId == area.Id && p.IsTopik);
                                if (headQuarterByArea.Any())
                                {
                                    foreach (var headQuarter in headQuarterByArea)
                                    {
                                        var rooms = examRooms.Where(p => p.HeadQuarterId == headQuarter.Id && p.IsShow);
                                        int tongPhongThi = 0, tongThiSinh = 0, tongGiamThi = 0, startHeadQuarter = row;
                                        //topik1
                                        foreach (var room in rooms)
                                        {
                                            var divided = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.ExamPlaceId == headQuarter.Id && p.ExamScheduleTopikId == schedule1.Id);
                                            if (divided != null)
                                            {
                                                var examRoomData = unitOfWork.Repository<SysExamRoomDivided>().Get(p => p.ExamRoomId == room.Id && p.DividingExamPlaceId == divided.Id).OrderBy(p => p.CandidateNumber);
                                                if (examRoomData != null && examRoomData.Count() > 0)
                                                {
                                                    sheet.Cells[row, 3].Value = room.NameInKorean;
                                                    sheet.Cells[row, 4].Value = topik1.Name;
                                                    var firstSbd = examRoomData?.FirstOrDefault()?.CandidateNumber;
                                                    var lastSbd = examRoomData?.LastOrDefault()?.CandidateNumber;
                                                    sheet.Cells[row, 5].Value = firstSbd + " ~ " + lastSbd;
                                                    sheet.Cells[row, 6].Value = 1;
                                                    sheet.Cells[row, 7].Value = examRoomData != null ? examRoomData.Count() : 0;
                                                    sheet.Cells[row, 8].Value = SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    tongPhongThi++;
                                                    tongThiSinh += examRoomData != null ? examRoomData.Count() : 0;
                                                    tongGiamThi += SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    row++;
                                                }
                                            }
                                        }
                                        var tong1 = sheet.Cells[row, 3, row, 5];
                                        tong1.Merge = true;
                                        tong1.Value = "소       계";
                                        tong1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        tong1.Style.Font.Size = 11;
                                        tong1.Style.Font.Bold = true;
                                        sheet.Cells[row, 6].Value = tongPhongThi;
                                        sheet.Cells[row, 6].Style.Font.Bold = true;
                                        sheet.Cells[row, 7].Value = tongThiSinh;
                                        sheet.Cells[row, 7].Style.Font.Bold = true;
                                        sheet.Cells[row, 8].Value = tongGiamThi;
                                        sheet.Cells[row, 8].Style.Font.Bold = true;
                                        row++;
                                        tongPhongThi = 0; tongThiSinh = 0; tongGiamThi = 0;
                                        //topik2
                                        foreach (var room in rooms)
                                        {
                                            var divided = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.ExamPlaceId == headQuarter.Id && p.ExamScheduleTopikId == schedule2.Id);
                                            if (divided != null)
                                            {
                                                var examRoomData = unitOfWork.Repository<SysExamRoomDivided>().Get(p => p.ExamRoomId == room.Id && p.DividingExamPlaceId == divided.Id).OrderBy(p => p.CandidateNumber);
                                                if (examRoomData != null && examRoomData.Count() > 0)
                                                {
                                                    sheet.Cells[row, 3].Value = room.NameInKorean;
                                                    sheet.Cells[row, 4].Value = topik2.Name;
                                                    var firstSbd = examRoomData?.FirstOrDefault()?.CandidateNumber;
                                                    var lastSbd = examRoomData?.LastOrDefault()?.CandidateNumber;
                                                    sheet.Cells[row, 5].Value = firstSbd + " ~ " + lastSbd;
                                                    sheet.Cells[row, 6].Value = 1;
                                                    sheet.Cells[row, 7].Value = examRoomData != null ? examRoomData.Count() : 0;
                                                    sheet.Cells[row, 8].Value = SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    tongPhongThi++;
                                                    tongThiSinh += examRoomData != null ? examRoomData.Count() : 0;
                                                    tongGiamThi += SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    row++;
                                                }
                                            }
                                        }
                                        var tong2 = sheet.Cells[row, 3, row, 5];
                                        tong2.Merge = true;
                                        tong2.Value = "소       계";
                                        tong2.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        tong2.Style.Font.Size = 11;
                                        tong2.Style.Font.Bold = true;
                                        sheet.Cells[row, 6].Value = tongPhongThi;
                                        sheet.Cells[row, 6].Style.Font.Bold = true;
                                        sheet.Cells[row, 7].Value = tongThiSinh;
                                        sheet.Cells[row, 7].Style.Font.Bold = true;
                                        sheet.Cells[row, 8].Value = tongGiamThi;
                                        sheet.Cells[row, 8].Style.Font.Bold = true;
                                        row++;
                                        var headQuarterText = sheet.Cells[startHeadQuarter, 2, row - 1, 2];
                                        headQuarterText.Merge = true;
                                        headQuarterText.Value = headQuarter.KoreaName + "(" + headQuarter.EnglishName + ")";
                                        headQuarterText.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        headQuarterText.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                        headQuarterText.Style.Font.Size = 11;
                                    }
                                    var areaText = sheet.Cells[startArea, 1, row - 1, 1];
                                    areaText.Merge = true;
                                    areaText.Value = area.KoreaName + "(" + area.EnglishName + ")";
                                    areaText.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    areaText.Style.Font.Size = 11;
                                }
                            }
                            row = 7;
                            foreach (var area in areas.Where(p => p.Region == (int)RegionNumber.MienNam))
                            {
                                int startArea = row;
                                var headQuarterByArea = headQuarters.Where(p => p.AreaId == area.Id && p.IsTopik);
                                if (headQuarterByArea.Any())
                                {
                                    foreach (var headQuarter in headQuarterByArea)
                                    {
                                        var rooms = examRooms.Where(p => p.HeadQuarterId == headQuarter.Id && p.IsShow);
                                        int tongPhongThi = 0, tongThiSinh = 0, tongGiamThi = 0, startHeadQuarter = row;
                                        //topik1
                                        foreach (var room in rooms)
                                        {
                                            var divided = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.ExamPlaceId == headQuarter.Id && p.ExamScheduleTopikId == schedule1.Id);
                                            if (divided != null)
                                            {
                                                var examRoomData = unitOfWork.Repository<SysExamRoomDivided>().Get(p => p.ExamRoomId == room.Id && p.DividingExamPlaceId == divided.Id).OrderBy(p => p.CandidateNumber);
                                                if (examRoomData != null && examRoomData.Count() > 0)
                                                {
                                                    sheet1.Cells[row, 3].Value = room.NameInKorean;
                                                    sheet1.Cells[row, 4].Value = topik1.Name;
                                                    var firstSbd = examRoomData?.FirstOrDefault()?.CandidateNumber;
                                                    var lastSbd = examRoomData?.LastOrDefault()?.CandidateNumber;
                                                    sheet1.Cells[row, 5].Value = firstSbd + " ~ " + lastSbd;
                                                    sheet1.Cells[row, 6].Value = 1;
                                                    sheet1.Cells[row, 7].Value = examRoomData != null ? examRoomData.Count() : 0;
                                                    sheet1.Cells[row, 8].Value = SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    tongPhongThi++;
                                                    tongThiSinh += examRoomData != null ? examRoomData.Count() : 0;
                                                    tongGiamThi += SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    row++;
                                                }
                                            }
                                        }
                                        var tong1 = sheet1.Cells[row, 3, row, 5];
                                        tong1.Merge = true;
                                        tong1.Value = "소       계";
                                        tong1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        tong1.Style.Font.Size = 11;
                                        tong1.Style.Font.Bold = true;
                                        sheet1.Cells[row, 6].Value = tongPhongThi;
                                        sheet1.Cells[row, 6].Style.Font.Bold = true;
                                        sheet1.Cells[row, 7].Value = tongThiSinh;
                                        sheet1.Cells[row, 7].Style.Font.Bold = true;
                                        sheet1.Cells[row, 8].Value = tongGiamThi;
                                        sheet1.Cells[row, 8].Style.Font.Bold = true;
                                        row++;
                                        tongPhongThi = 0; tongThiSinh = 0; tongGiamThi = 0;
                                        //topik2
                                        foreach (var room in rooms)
                                        {
                                            var divided = unitOfWork.Repository<SysDividingExamPlace>().FirstOrDefault(p => p.ExamPlaceId == headQuarter.Id && p.ExamScheduleTopikId == schedule2.Id);
                                            if (divided != null)
                                            {
                                                var examRoomData = unitOfWork.Repository<SysExamRoomDivided>().Get(p => p.ExamRoomId == room.Id && p.DividingExamPlaceId == divided.Id).OrderBy(p => p.CandidateNumber);
                                                if (examRoomData != null && examRoomData.Count() > 0)
                                                {
                                                    sheet1.Cells[row, 3].Value = room.NameInKorean;
                                                    sheet1.Cells[row, 4].Value = topik2.Name;
                                                    var firstSbd = examRoomData?.FirstOrDefault()?.CandidateNumber;
                                                    var lastSbd = examRoomData?.LastOrDefault()?.CandidateNumber;
                                                    sheet1.Cells[row, 5].Value = firstSbd + " ~ " + lastSbd;
                                                    sheet1.Cells[row, 6].Value = 1;
                                                    sheet1.Cells[row, 7].Value = examRoomData != null ? examRoomData.Count() : 0;
                                                    sheet1.Cells[row, 8].Value = SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    tongPhongThi++;
                                                    tongThiSinh += examRoomData != null ? examRoomData.Count() : 0;
                                                    tongGiamThi += SoGiamThi(examRoomData != null ? examRoomData.Count() : 0);
                                                    row++;
                                                }
                                            }
                                        }
                                        var tong2 = sheet1.Cells[row, 3, row, 5];
                                        tong2.Merge = true;
                                        tong2.Value = "소       계";
                                        tong2.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        tong2.Style.Font.Size = 11;
                                        tong2.Style.Font.Bold = true;
                                        sheet1.Cells[row, 6].Value = tongPhongThi;
                                        sheet1.Cells[row, 6].Style.Font.Bold = true;
                                        sheet1.Cells[row, 7].Value = tongThiSinh;
                                        sheet1.Cells[row, 7].Style.Font.Bold = true;
                                        sheet1.Cells[row, 8].Value = tongGiamThi;
                                        sheet1.Cells[row, 8].Style.Font.Bold = true;
                                        row++;
                                        var headQuarterText = sheet1.Cells[startHeadQuarter, 2, row - 1, 2];
                                        headQuarterText.Merge = true;
                                        headQuarterText.Value = headQuarter.KoreaName + "(" + headQuarter.EnglishName + ")";
                                        headQuarterText.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                        headQuarterText.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                        headQuarterText.Style.Font.Size = 11;
                                    }
                                    var areaText = sheet1.Cells[startArea, 1, row - 1, 1];
                                    areaText.Merge = true;
                                    areaText.Value = area.KoreaName + "(" + area.EnglishName + ")";
                                    areaText.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    areaText.Style.Font.Size = 11;
                                }
                            }
                        }
                    }
                    //sheet.Cells.AutoFitColumns();
                    excelPackage.SaveAs(memoryStream);
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    FileStream file = new FileStream(Directory.GetCurrentDirectory() + "/FileDownload/MoHinhPhongThi.xlsx", FileMode.Create, FileAccess.Write);
                    memoryStream.WriteTo(file);
                }
                return new ResponseDataObject<object>(new { FileName = "/FileDownload/MoHinhPhongThi.xlsx" }, Code.Success, "/FileDownload/MoHinhPhongThi.xlsx");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData CheckFileSatisticCanDown(Guid examPeriod, int type)
        {
            var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var sysExamPeriod = unitOfWork.Repository<SysExamPeriod>().FirstOrDefault(p => p.Id == examPeriod);
            int canDownFile = (int)CanDownFile.IdNotfound;
            string link = "Not found !";

            if (sysExamPeriod != null)
            {
                switch (type)
                {
                    case TypeCheckCandown.StatusOfApplicants:
                        if (File.Exists(Directory.GetCurrentDirectory() + "/FileDownload/ThongKeTopik.xlsx"))
                        {
                            try
                            {
                                using (FileStream fileStream = File.Open(Directory.GetCurrentDirectory() + "/FileDownload/ThongKeTopik.xlsx", FileMode.Open, FileAccess.ReadWrite, FileShare.None))
                                {
                                    if (fileStream != null) fileStream.Close();
                                    link = "/FileDownload/ThongKeTopik.xlsx";
                                    canDownFile = (int)CanDownFile.CanDown;
                                }
                            }
                            catch (IOException ex)
                            {
                                canDownFile = (int)CanDownFile.CanNotDown;
                                link = ex.Message;
                            }
                        }
                        else
                        {
                            canDownFile = (int)CanDownFile.FileNotExits;
                        }
                        break;
                    case TypeCheckCandown.ModelExamRoom:
                        if (File.Exists(Directory.GetCurrentDirectory() + "/FileDownload/MoHinhPhongThi.xlsx"))
                        {
                            try
                            {
                                using (FileStream fileStream = File.Open(Directory.GetCurrentDirectory() + "/FileDownload/MoHinhPhongThi.xlsx", FileMode.Open, FileAccess.ReadWrite, FileShare.None))
                                {
                                    if (fileStream != null) fileStream.Close();
                                    link = "/FileDownload/MoHinhPhongThi.xlsx";
                                    canDownFile = (int)CanDownFile.CanDown;
                                }
                            }
                            catch (IOException ex)
                            {
                                canDownFile = (int)CanDownFile.CanNotDown;
                                link = ex.Message;
                            }
                        }
                        else
                        {
                            canDownFile = (int)CanDownFile.FileNotExits;
                        }
                        break;
                }
            }
            return new ResponseDataObject<int>(canDownFile, Code.Success, link);
        }

        public async Task<ResponseData> SendEmailAgain(string accessToken)
        {
            try
            {
                string res = string.Empty;
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                string queryGet = $"select * from ManageRegisteredCandidateTopik where id in (SELECT TOP (1000) CandidateRegisterId FROM [IIG.Core.Framework.EOS].[dbo].[UserProfileRegistered] where email in ('dinhbahung05@gmail.com','nguyenhuudoc2005@gmail.com','Thu93002@st.vimaru.edu.vn','Thanhkhuc2005@gmail.com','hien231105@gmail.com','cuonghit159@gmail.com','dao14290@gmail.com','phuochongdinh2005@gmail.com','oanh1982hihi@gmail.com','phupro1906@gmail.com','vhphuclinh09@gmail.com','nguyenlinhzyz25@gmail.com') and CreatedOnDate >= '2023-08-24') and IsPaid = 2";
                var dataRegisteds = await _dapperUnit.GetRepository().QueryAsync<SysManageRegisteredCandidateTopik>(queryGet);
                var ids = dataRegisteds.Select(p => p.Id);
                var requestPayments = unitOfWork.Repository<SysPaymentRequestLog>().Get(p => ids.Contains(p.TxnRef));
                var idRequests = requestPayments.Select(p => p.Id);
                var responsePayments = unitOfWork.Repository<SysPaymentResponseLog>().Get(p => idRequests.Contains(p.PaymentRequestId));
                var userProfiles = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => ids.Contains(p.CandidateRegisterId));
                var areaQuery = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, $"Area", accessToken);
                var areas = new List<AreaModel>();
                if (areaQuery != null && areaQuery.Data != null)
                {
                    areas = areaQuery.Data;
                }
                var headQuartersGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken);
                var headQuarters = new List<HeadQuarterModel>();
                if (headQuartersGet != null && headQuartersGet.Data != null)
                {
                    headQuarters = headQuartersGet.Data;
                }
                foreach (var profile in userProfiles)
                {
                    var itemRegisted = dataRegisteds.FirstOrDefault(p => p.Id == profile.CandidateRegisterId);
                    if (itemRegisted != null)
                    {
                        var headQuarter = headQuarters.FirstOrDefault(p => p.Id == itemRegisted.PlaceTest);
                        var area = areas.FirstOrDefault(p => p.Id == itemRegisted.AreaTest);
                        if (headQuarter != null)
                        {
                            var model = new EmailTestDateWrongModel();
                            model.FullNameKorea = profile.FullNameKorea;
                            model.FullName = profile.FullName;
                            model.Birthday = profile.Birthday.ToString("dd/MM/yyyy");
                            model.AreaTest = area.Name;
                            model.PlaceTest = headQuarter.Name;
                            model.Address = headQuarter.Address;
                            var request = requestPayments.FirstOrDefault(p => p.TxnRef == itemRegisted.Id);
                            if (request != null)
                            {
                                var response = responsePayments.FirstOrDefault(p => p.PaymentRequestId == request.Id);
                                if (response != null)
                                {
                                    model.Trans = !string.IsNullOrEmpty(response.TransactionNo) ? response.TransactionNo : string.Empty;
                                    model.DateTimePaid = response.DateCreateRecord.ToString("dd/MM/yyyy HH:mm:ss");
                                }
                            }
                            string templateBody = _emailTemplateHandler.GenerateEmailTemplate("email-testdatewrong", model);
                            var email = new EmailRequest()
                            {
                                ToAddress = profile.Email,
                                Body = templateBody,
                                HTMLBody = templateBody,
                                Subject = "Đính chính nội dung Email “Thông báo: Đăng ký thành công bài thi TOPIK I” - Kỳ thi TOPIK lần thứ 91",
                                ToEmail = new List<string> { profile.Email }
                            };

                            var resEmail = await _emailTemplateHandler.SendOneZetaEmail(email);

                            if (resEmail != null && resEmail.Code == Code.Success)
                            {
                                res += "Gửi thành công tới " + profile.Email + "\r\n";
                            }
                        }
                    }

                }
                return new ResponseDataObject<string>(res, Code.Success, "");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        private int SoGiamThi(int soThiSinh)
        {
            if (soThiSinh > 1 && soThiSinh <= 30)
                return 2;
            else if (soThiSinh > 30 && soThiSinh <= 45)
                return 3;
            else if (soThiSinh > 45 && soThiSinh <= 60)
                return 4;
            else return 0;
        }

        public static string Purpose(int number)
        {
            string result = string.Empty;
            switch (number)
            {
                case 1:
                    result = "Du học";
                    break;
                case 2:
                    result = "Xin việc";
                    break;
                case 3:
                    result = "Du lịch";
                    break;
                case 4:
                    result = "Nghiên cứu";
                    break;
                case 5:
                    result = "Đánh giá trình độ";
                    break;
                case 6:
                    result = "Tìm hiểu văn hóa HQ";
                    break;
                case 7:
                    result = "Khác";
                    break;
                case 8:
                    result = "Xin visa, định cư";
                    break;
                case 9:
                    result = "Xét tốt nghệp";
                    break;
                case 10:
                    result = "Korea Immigration & Integration Program";
                    break;
            }
            return result;
        }
        public static string Job(int number)
        {
            string result = string.Empty;
            switch (number)
            {
                case 1:
                    result = "HS/SV";
                    break;
                case 2:
                    result = "Viên chức";
                    break;
                case 3:
                    result = "Nhân viên VP";
                    break;
                case 4:
                    result = "KD tự do";
                    break;
                case 5:
                    result = "Nội trợ";
                    break;
                case 6:
                    result = "Giáo viên";
                    break;
                case 7:
                    result = "Thất nghiệp";
                    break;
                case 8:
                    result = "Khác";
                    break;
            }
            return result;
        }
    }
}
