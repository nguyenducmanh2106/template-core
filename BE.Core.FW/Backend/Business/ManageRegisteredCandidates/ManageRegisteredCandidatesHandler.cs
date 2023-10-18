using AutoMapper;
using Backend.Business.Metadata;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using IIG.Core.Framework.ICom.Infrastructure.Utils;
using Serilog;
using System.Dynamic;
using System.Data;
using System.Globalization;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using static Backend.Infrastructure.Utils.Constant;
using DataTable = System.Data.DataTable;
using RazorEngineCore;
using System.Text;
using Backend.Business.Mailing;
using Backend.Business.ExamSubject;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Backend.Business.ManageRegisteredCandidates
{
    public class ManageRegisteredCandidatesHandler : IManageRegisteredCandidatesHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOldData oldData;
        private IWebHostEnvironment _hostingEnvironment;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");
        private static readonly string apiBasicUriUser = Backend.Infrastructure.Utils.Utils.GetConfig("User");
        private readonly IEmailTemplateHandler _emailTemplateHandler;

        public ManageRegisteredCandidatesHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment, IEmailTemplateHandler emailTemplateHandler, IOldData oldData)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            _emailTemplateHandler = emailTemplateHandler;
            this.oldData = oldData;
        }

        public async Task<ResponseData> Create(RegisteredCandidatesModel model, string? accessToken, string? tenant)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var submission = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == model.SubmissionTime);
                if (submission == null)
                    return new ResponseDataError(Code.NotFound, "Thời gian nộp hồ sơ không đúng !");
                if (submission.MaxRegistry <= unitOfWork.Repository<SysUserSubmitTime>().Count(p => p.SubmissionTimeId == submission.Id))
                    return new ResponseDataError(Code.NotFound, "Khung giờ nộp hồ sơ đã hết số lượng đăng ký !");

                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");


                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var submited = unitOfWork.Repository<SysUserSubmitTime>().Get(p => p.UserId == profiles.Data.Id).OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    if (submited != null && submited.ExamId == model.ExamId && submited.ExpireDate.Date >= DateTime.Now.Date)
                    {
                        var exits = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == submited.SubmissionTimeId);
                        if (exits != null)
                        {
                            return new ResponseDataError(Code.Forbidden, "waitfor5day");
                        }
                    }
                    model.Id = Guid.NewGuid();
                    var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + model.ExamId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (exam == null || exam.Data == null)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy bài thi !");
                    var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + model.PlaceOfRegistration, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (headerQuater == null || headerQuater.Data == null)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy địa điểm !");
                    if (!headerQuater.Data.CanRegisterExam)
                        return new ResponseDataError(Code.Forbidden, "Địa điểm không cho phép đăng ký đâu cưng !");
                    if (string.IsNullOrEmpty(headerQuater.Data.ProfileCode))
                        return new ResponseDataError(Code.Forbidden, "Địa điểm không có mã tạo hồ sơ !");
                    model.UserId = profiles.Data.Id;
                    model.Status = (int)StatusProfile.Receive;
                    string last = unitOfWork.Repository<SysManageRegisteredCandidates>().Count(p => p.PlaceOfRegistration.ToString().ToLower() == model.PlaceOfRegistration.ToString().ToLower()).ToString("D6");
                    model.StatusPaid = (int)StatusPaid.UnPaid;
                    model.CodeProfile = DateTime.Now.ToString("yy") + headerQuater.Data.ProfileCode + last;
                    model.Price = exam.Data.Price;
                    model.AreaId = headerQuater.Data.AreaId;
                    var saveProfile = new SysUserProfileRegistered();

                    var profileUse = profiles?.Data?.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                    if (profileUse != null)
                    {
                        var metadata = profileUse.Metadata;
                        if (metadata != null)
                        {
                            saveProfile.UserName = profiles?.Data.Email;
                            saveProfile.CandidateRegisterId = (Guid)model.Id;
                            var isStudent = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IsStudent);
                            if (isStudent != null)
                            {
                                saveProfile.IsStudent = isStudent.Value == "1";
                            }
                            var wardWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WardWork);
                            if (wardWork != null && wardWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressWardsId = new Guid(wardWork.Value);
                            }
                            var cityWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CityWork);
                            if (cityWork != null && cityWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressCityId = new Guid(cityWork.Value);
                                if (string.IsNullOrEmpty(exam.Data.ProvinceApply) || (!string.IsNullOrEmpty(exam.Data.ProvinceApply) && !exam.Data.ProvinceApply.Contains(cityWork.Value)))
                                {
                                    return new ResponseDataError(Code.Forbidden, "AreaCanNotRegister");
                                }
                            }
                            var districtWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DistrictWork);
                            if (districtWork != null && districtWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressDistrictId = new Guid(districtWork.Value);
                            }
                            var workAddress = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WorkAddress);
                            if (workAddress != null)
                            {
                                saveProfile.WorkAddress = workAddress.Value;
                            }
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
                                saveProfile.FullNameOrigin = fullName;
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
                            var idCardNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            if (idCardNumber != null)
                            {
                                var type = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard)?.Value;
                                switch (type)
                                {
                                    case "1":
                                        saveProfile.CMND = idCardNumber.Value;
                                        break;
                                    case "2":
                                        saveProfile.CCCD = idCardNumber.Value;
                                        break;
                                    case "3":
                                        saveProfile.Passport = idCardNumber.Value;
                                        break;
                                }
                            }
                            var cccdT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CCCD);
                            if (cccdT != null)
                            {
                                saveProfile.CCCD = cccdT.Value;
                            }
                            var cmndT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CMND);
                            if (cmndT != null)
                            {
                                saveProfile.CMND = cmndT.Value;
                            }
                            var passport = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Passport);
                            if (passport != null)
                            {
                                saveProfile.Passport = passport.Value;
                            }
                            var oldCardID = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OldCardID);
                            if (oldCardID != null)
                            {
                                saveProfile.OldCardID = oldCardID.Value == "1";
                            }
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            if (typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                            }
                            if (saveProfile.TypeIdCard == TypeIDCard.CMND)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CMND) ? saveProfile.CMND : string.Empty;
                            else if (saveProfile.TypeIdCard == TypeIDCard.CCCD)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CCCD) ? saveProfile.CCCD : string.Empty;
                            else
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.Passport) ? saveProfile.Passport : string.Empty;

                            var oldCardIDNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OldCardIDNumber);
                            if (oldCardIDNumber != null)
                            {
                                saveProfile.OldCardIDNumber = oldCardIDNumber.Value;
                            }
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
                            var allowUsePersonalData = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.AllowUsePersonalData);
                            if (allowUsePersonalData != null)
                            {
                                saveProfile.AllowUsePersonalData = allowUsePersonalData.Value == "1";
                            }

                            saveProfile.PlaceOfCCCD = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard)?.Value;
                            saveProfile.Job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job)?.Value;
                            saveProfile.OptionJob = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OptionJob)?.Value;
                            unitOfWork.Repository<SysUserProfileRegistered>().Insert(saveProfile);
                            unitOfWork.Repository<SysManageRegisteredCandidates>().Insert(_mapper.Map<SysManageRegisteredCandidates>(model));

                            unitOfWork.Repository<SysUserSubmitTime>().Insert(new SysUserSubmitTime
                            {
                                ExamId = model.ExamId,
                                SubmissionTimeId = model.SubmissionTime,
                                UserName = profiles.Data.Username,
                                UserId = profiles.Data.Id,
                                CreatedOnDate = DateTime.Now,
                                ExpireDate = DateTime.Now.AddDays(6),
                            });
                            unitOfWork.Save();

                            await SendEmailNotification(new SendMailModel
                            {
                                ExamId = exam.Data.Id,
                                EmailTemplateType = 1,
                                UserEmail = saveProfile.Email,
                                SendMailObject = new SendEmailRegistrationModel
                                {
                                    CandidateBirthday = saveProfile.Birthday.ToString("dd/MM/yyyy"),
                                    CandidateName = saveProfile.FullNameOrigin,
                                    FileCode = model.CodeProfile,
                                    ExamLocation = headerQuater.Data.Name,
                                    DateApplyFile = submission.ReceivedDate.ToString("dd/MM/yyyy"),
                                    TimeApplyFile = submission.TimeStart + " - " + submission.TimeEnd,
                                    ExamName = exam.Data.Name
                                }
                            }, accessToken ?? string.Empty, tenant ?? string.Empty);
                        }
                    }
                    return new ResponseDataObject<object>(new
                    {
                        Id = model.Id,
                        CodeProfile = model.CodeProfile,
                        ExamName = exam.Data.Name,
                        DateCreate = submission.ReceivedDate.ToString("dd/MM/yyyy"),
                        TimeCreate = submission.TimeStart + " - " + submission.TimeEnd,
                        Place = headerQuater.Data.Name,
                        FullName = saveProfile.FullNameOrigin,
                        BirthDay = saveProfile.Birthday.ToString("dd/MM/yyyy")
                    }, Code.Success, "Tạo thành công rồi đó cưng");
                }
                return new ResponseDataError(Code.ServerError, "Thông tin hồ sơ không có đâu cưng !");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData RestoreDelete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysManageRegisteredCandidates>().Update(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData ReNewApprove(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(x => x.Id == id);
                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                exits.Status = (int)StatusProfile.Receive;
                unitOfWork.Repository<SysManageRegisteredCandidates>().Update(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Approve(Guid id, bool approve, string? note)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                string username = !string.IsNullOrEmpty(_httpContextAccessor!.HttpContext!.User.Identity!.Name!) ? _httpContextAccessor!.HttpContext!.User.Identity!.Name! : "";
                var exits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(x => x.Id == id);
                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                var submited = unitOfWork.Repository<SysUserSubmitTime>().Get(p => p.UserId == exits.UserId).OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                if (submited != null)
                    unitOfWork.Repository<SysUserSubmitTime>().Delete(submited);
                exits.AcceptBy = username;
                exits.DateAccept = DateTime.Now;
                if (!string.IsNullOrEmpty(note))
                    exits.RejectNote = note;
                exits.Status = approve ? (int)StatusProfile.Approved : (int)StatusProfile.UnApproved;
                unitOfWork.Repository<SysManageRegisteredCandidates>().Update(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
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
                var exits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysManageRegisteredCandidates>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Get(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeProfile, string? fullName, string? cccd, string? accessToken, int? pageSize, int? pageIndex)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysManageRegisteredCandidates>().Get();
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.PlaceOfRegistration));
                else
                    data = data.Where(p => p.Id == Guid.Empty);
                var result = new List<ManageRegisteredCandidatesModel>();
                var examss = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty);
                int totalCount = data.Count();
                if (data != null && data.Count() > 0)
                {
                    data = data.OrderByDescending(p => p.CreatedOnDate);
                    if (areaId != null)
                    {
                        data = data.Where(p => p.AreaId == areaId);
                    }
                    if (headerQuaterId != null)
                    {
                        data = data.Where(p => p.PlaceOfRegistration == headerQuaterId);
                    }
                    if (examId != null)
                    {
                        data = data.Where(p => p.ExamId == examId);
                    }
                    if (statusPaid != null)
                    {
                        data = data.Where(p => p.StatusPaid == statusPaid);
                    }
                    if (status != null)
                    {
                        data = data.Where(p => p.Status == status);
                    }
                    if (!string.IsNullOrEmpty(dateReceive))
                    {
                        var date = dateReceive.Split(",");
                        DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.CreatedOnDate.Date >= dateConvert1 && p.CreatedOnDate.Date <= dateConvert2);
                    }
                    if (!string.IsNullOrEmpty(dateAccept))
                    {
                        var date = dateAccept.Split(",");
                        DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.DateAccept.HasValue && p.DateAccept.Value.Date >= dateConvert1 && p.DateAccept.Value.Date <= dateConvert2);
                    }

                    if (!string.IsNullOrEmpty(fullName))
                    {
                        var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullNameOrigin.ToUpper().Contains(fullName.Trim().ToUpper())).Select(p => p.CandidateRegisterId);
                        data = data.Where(p => candidateRegisters.Contains(p.Id));
                    }

                    if (!string.IsNullOrEmpty(codeProfile))
                    {
                        data = data.Where(p => p.CodeProfile == codeProfile);
                    }

                    if (!string.IsNullOrEmpty(cccd))
                    {
                        List<Guid> checkList = new List<Guid>();
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CCCD != null && p.CCCD.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CMND != null && p.CMND.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.Passport != null && p.Passport.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        data = data.Where(p => checkList.Contains(p.Id)).ToList();
                    }
                    totalCount = data.Count();

                    if (pageSize != null && pageIndex != null)
                        data = data.Skip((int)(pageIndex - 1) * (int)pageSize).Take((int)pageSize).ToList();
                    else
                        data = data.Skip(0).Take(10).ToList();

                    foreach (var item in data)
                    {
                        var userInfo = new UserInfoModel();
                        var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        if (profile != null)
                        {
                            userInfo.WorkAddress = profile.WorkAddress;
                            userInfo.WorkAddressWardsId = profile.WorkAddressWardsId;
                            userInfo.WorkAddressCityId = profile.WorkAddressCityId;
                            userInfo.WorkAddressDistrictId = profile.WorkAddressDistrictId;
                            userInfo.ContactAddressCityId = profile.ContactAddressCityId;
                            userInfo.ContactAddressDistrictId = profile.ContactAddressDistrictId;
                            userInfo.ContactAddressWardsId = profile.ContactAddressWardId;
                            userInfo.DOB = profile.Birthday;
                            userInfo.Email = profile.Email;
                            userInfo.FullName = profile.FullNameOrigin.ToUpper();
                            userInfo.FullNameKorea = profile.FullNameKorea;
                            userInfo.SDT = profile.Phone;
                            userInfo.ContactAddress = profile.ContactAddress;
                            userInfo.Sex = profile.Sex;
                            userInfo.CCCD = profile.CCCD;
                            userInfo.CMND = profile.CMND;
                            userInfo.Passport = profile.Passport;
                            userInfo.DateOfCCCD = profile.DateOfCCCD;
                            userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                            userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                            userInfo.Job = profile.Job;
                            userInfo.OptionJob = profile.OptionJob;
                            userInfo.UserName = profile.UserName;
                            userInfo.IsStudent = profile.IsStudent;
                        }

                        var submitTime = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == item.SubmissionTime);
                        var exam = examss?.Data?.FirstOrDefault(p => p.Id == item.ExamId);
                        result.Add(new ManageRegisteredCandidatesModel
                        {
                            Id = item.Id,
                            UserProfileId = item.UserProfileId,
                            ExamPurpose = item.ExamPurpose,
                            IsTested = item.IsTested,
                            ExamId = item.ExamId,
                            UserInfo = userInfo,
                            StatusPaid = item.StatusPaid,
                            PlaceOfRegistration = item.PlaceOfRegistration,
                            Status = item.Status,
                            AcceptBy = item.AcceptBy,
                            SubmissionTime = item.SubmissionTime,
                            ScoreGoal = item.ScoreGoal,
                            TestDate = item.TestDate,
                            TestScheduleDate = item.TestScheduleDate,
                            DateApply = submitTime?.ReceivedDate,
                            TimeApply = submitTime?.TimeStart + " - " + submitTime?.TimeEnd,
                            Fee = exam != null ? Convert.ToInt64(exam.Price) : 0,
                            AccompaniedService = item.AccompaniedService,
                            DateAccept = item.DateAccept,
                            DateReceive = item.DateReceive,
                            Note = item.Note,
                            PriorityObject = item.PriorityObject,
                            ProfileNote = item.ProfileNote,
                            UserName = item.UserName,
                            Password = item.Password,
                            CodeProfile = item.CodeProfile,
                            ProfileIncludes = item.ProfileIncludes,
                            ReturnResultDate = item.ReturnResultDate,
                            ExamVersion = item.ExamVersion,
                            ExamScheduleId = item.ExamScheduleId,
                            CanTest = item.CanTest,
                            AddReceipt = item.AddReceipt,
                            FullNameReceipt = item.FullNameReceipt,
                            PhoneReceipt = item.PhoneReceipt,
                            Receipt = item.Receipt,
                            CreatedOnDate = item.CreatedOnDate.ToString("dd-MM-yyyy HH:mm:ss")
                        });
                    }
                }
                var pagination = new Pagination(Convert.ToInt32(pageIndex), Convert.ToInt32(pageSize), totalCount, totalCount / 10);
                return new PageableData<List<ManageRegisteredCandidatesModel>>(result, pagination, Code.Success, "");
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
                var item = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(p => p.Id == id);
                if (item == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi");
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0 && roles.AccessDataHeaderQuater.Contains(item.PlaceOfRegistration))
                {
                    var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : string.Empty);
                    var examss = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty);

                    var userInfo = new UserInfoModel();
                    var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                    if (profile != null)
                    {
                        userInfo.WorkAddress = profile.WorkAddress;
                        userInfo.WorkAddressWardsId = profile.WorkAddressWardsId;
                        userInfo.WorkAddressCityId = profile.WorkAddressCityId;
                        userInfo.WorkAddressDistrictId = profile.WorkAddressDistrictId;
                        userInfo.ContactAddressCityId = profile.ContactAddressCityId;
                        userInfo.ContactAddressDistrictId = profile.ContactAddressDistrictId;
                        userInfo.ContactAddressWardsId = profile.ContactAddressWardId;
                        userInfo.DOB = profile.Birthday;
                        userInfo.Email = profile.Email;
                        userInfo.FullName = profile.FullNameOrigin;
                        userInfo.FullNameKorea = profile.FullNameKorea;
                        userInfo.SDT = profile.Phone;
                        userInfo.ContactAddress = profile.ContactAddress;
                        userInfo.Sex = profile.Sex;
                        userInfo.CCCD = profile.CCCD;
                        userInfo.CMND = profile.CMND;
                        userInfo.Passport = profile.Passport;
                        userInfo.DateOfCCCD = profile.DateOfCCCD;
                        userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                        userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                        userInfo.Job = profile.Job;
                        userInfo.OptionJob = profile.OptionJob;
                        userInfo.UserName = profile.UserName;
                        userInfo.IsStudent = profile.IsStudent;
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
                    }

                    var submitTime = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == item.SubmissionTime);
                    var exam = examss?.Data?.FirstOrDefault(p => p.Id == item.ExamId);
                    return new ResponseDataObject<ManageRegisteredCandidatesModel>(new ManageRegisteredCandidatesModel
                    {
                        Id = item.Id,
                        UserProfileId = item.UserProfileId,
                        ExamPurpose = item.ExamPurpose,
                        IsTested = item.IsTested,
                        ExamId = item.ExamId,
                        UserInfo = userInfo,
                        StatusPaid = item.StatusPaid,
                        PlaceOfRegistration = item.PlaceOfRegistration,
                        Status = item.Status,
                        AcceptBy = item.AcceptBy,
                        SubmissionTime = item.SubmissionTime,
                        ScoreGoal = item.ScoreGoal,
                        TestDate = item.TestDate,
                        TestScheduleDate = item.TestScheduleDate,
                        DateApply = submitTime?.ReceivedDate,
                        TimeApply = submitTime?.TimeStart + " - " + submitTime?.TimeEnd,
                        Fee = exam != null ? Convert.ToInt64(exam.Price) : 0,
                        AccompaniedService = item.AccompaniedService,
                        DateAccept = item.DateAccept,
                        DateReceive = item.DateReceive,
                        Note = item.Note,
                        PriorityObject = item.PriorityObject,
                        ProfileNote = item.ProfileNote,
                        UserName = item.UserName,
                        Password = item.Password,
                        CodeProfile = item.CodeProfile,
                        ProfileIncludes = item.ProfileIncludes,
                        ReturnResultDate = item.ReturnResultDate,
                        ExamVersion = item.ExamVersion,
                        ExamScheduleId = item.ExamScheduleId,
                        CanTest = item.CanTest,
                        AddReceipt = item.AddReceipt,
                        FullNameReceipt = item.FullNameReceipt,
                        PhoneReceipt = item.PhoneReceipt,
                        Receipt = item.Receipt,
                    }, Code.Success, "");
                }


                return new ResponseDataError(Code.Forbidden, "Tài khoản không có quyền xem dữ liệu này");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Update(ManageRegisteredCandidatesModel model, string accessToken)
        {
            try
            {
                if (model != null)
                {
                    using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                    var request = new Dictionary<string, string>();
                    int index = 0;
                    var multipartFormContent = new MultipartFormDataContent();

                    var exist = unitOfWork.Repository<SysManageRegisteredCandidates>().GetById(model.Id);
                    if (exist == null)
                        return new ResponseDataError(Code.NotFound, "Id not found");
                    var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + exist.UserId + "?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
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
                                    string fullName = model.UserInfo.FullName.Trim();
                                    Regex trimmer = new Regex(@"\s\s+");
                                    fullName = trimmer.Replace(fullName, " ");
                                    profileTemp.FullName = Utils.RemoveUnicode(fullName);
                                    profileTemp.LastName = fullName.Split(" ").LastOrDefault();
                                    profileTemp.FirstName = fullName.Replace(" " + profileTemp.LastName, "");
                                    profileTemp.FullNameOrigin = model.UserInfo.FullName;

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
                                if (typeIdCard != null)
                                {
                                    var type = current.Metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard)?.Value;
                                    multipartFormContent.Add(new StringContent(typeIdCard.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(type != null ? type : "1"), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.TypeIdCard = type != null ? type : "1";
                                }

                                var metaIdCardNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CCCD);
                                if (metaIdCardNumber != null && model.UserInfo != null && model.UserInfo.CCCD != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaIdCardNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.CCCD), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.CCCD = model.UserInfo.CCCD;
                                }

                                var cmnd = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CMND);
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

                                var metaWorkAddress = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.WorkAddress);
                                if (metaWorkAddress != null && model.UserInfo != null && model.UserInfo.WorkAddress != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaWorkAddress.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddress), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddress = model.UserInfo.WorkAddress;
                                }

                                var metaWardWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.WardWork);
                                if (metaWardWork != null && model.UserInfo != null && model.UserInfo.WorkAddressWardsId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaWardWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressWardsId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressWardsId = (Guid)model.UserInfo.WorkAddressWardsId;
                                }

                                var metaDistrictWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.DistrictWork);
                                if (metaDistrictWork != null && model.UserInfo != null && model.UserInfo.WorkAddressDistrictId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaDistrictWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressDistrictId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressDistrictId = (Guid)model.UserInfo.WorkAddressDistrictId;
                                }

                                var metaCityWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CityWork);
                                if (metaCityWork != null && model.UserInfo != null && model.UserInfo.WorkAddressCityId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaCityWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressCityId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressCityId = (Guid)model.UserInfo.WorkAddressCityId;
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
                                string profileId = await HttpHelper.UpdateProfileUser(apiBasicUriUser, "b2cuser/" + exist.UserId, multipartFormContent, accessToken != null ? accessToken : "");
                                if (Utils.IsGuid(profileId))
                                {
                                    var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().FirstOrDefault(p => p.UserProfileId == exist.UserProfileId);
                                    if (examRoomDivided != null)
                                    {
                                        examRoomDivided.UserProfileId = new Guid(profileId);
                                        unitOfWork.Repository<SysExamRoomDivided>().Update(examRoomDivided);
                                        unitOfWork.Save();
                                    }
                                    exist.UserProfileId = new Guid(profileId);

                                }
                                var submited = unitOfWork.Repository<SysUserSubmitTime>().Get(p => p.UserId == profiles.Data.Id && p.ExamId == model.ExamId && p.SubmissionTimeId == exist.SubmissionTime).FirstOrDefault();
                                if (submited != null)
                                {
                                    submited.SubmissionTimeId = model.SubmissionTime;
                                    unitOfWork.Repository<SysUserSubmitTime>().Update(submited);
                                    unitOfWork.Save();
                                }
                            }
                        }
                    }

                    exist.ExamPurpose = model.ExamPurpose;
                    exist.ScoreGoal = model.ScoreGoal;
                    exist.IsTested = model.IsTested;
                    exist.TestDate = model.TestDate;
                    //exist.PlaceOfRegistration = model.PlaceOfRegistration;
                    exist.SubmissionTime = model.SubmissionTime;
                    //exist.ExamId = model.ExamId;
                    exist.ExamVersion = model.ExamVersion;
                    exist.TestScheduleDate = model.TestScheduleDate;
                    exist.ReturnResultDate = model.ReturnResultDate;
                    exist.PriorityObject = model.PriorityObject;
                    exist.AccompaniedService = model.AccompaniedService;
                    exist.UserName = model.UserName;
                    exist.ProfileIncludes = model.ProfileIncludes;
                    exist.ProfileNote = model.ProfileNote;
                    exist.Password = model.Password;
                    exist.Note = model.Note;
                    //exist.StatusPaid = model.StatusPaid;
                    //exist.Status = model.Status;
                    exist.CanTest = model.CanTest;
                    exist.ExamScheduleId = model.ExamScheduleId;
                    exist.Receipt = model.Receipt;
                    exist.AddReceipt = model.AddReceipt;
                    exist.PhoneReceipt = model.PhoneReceipt;
                    exist.FullNameReceipt = model.FullNameReceipt;

                    unitOfWork.Repository<SysManageRegisteredCandidates>().Update(exist);
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

        public ResponseData GetHistoryByName(string fullName, string birthDay)
        {
            try
            {
                var res = new List<HistoryRegisteredModel>();
                var date = DateTime.ParseExact(birthDay, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysUserProfileRegistered>().Get(x => x.Birthday.Date == date.Date && x.FullName.ToLower() == fullName.ToLower());
                if (data != null && data.Count() > 0)
                {
                    var ids = data.Select(p => p.CandidateRegisterId);
                    res = unitOfWork.Repository<SysManageRegisteredCandidates>().Get(p => ids.Contains(p.Id)).Select(o => new HistoryRegisteredModel
                    {
                        BirthDay = birthDay,
                        DateTest = o.TestScheduleDate?.ToString("dd/MM/yyyy"),
                        IDcard = data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.CCCD != null ? data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.CCCD : (data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.CMND != null ? data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.CMND : data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.Passport),
                        FirstName = data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.FirstName,
                        LastName = data.FirstOrDefault(l => l.CandidateRegisterId == o.Id)?.LastName
                    }).ToList();
                }
                return new ResponseDataObject<List<HistoryRegisteredModel>>(res, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> CheckContinute(Guid examId, string accessToken, string? tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + examId, accessToken, tenant != null ? tenant : string.Empty);
                if (exam == null || exam.Data == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bài thi !");

                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                if (profiles != null && profiles.Data != null)
                {
                    var check = unitOfWork.Repository<SysUserSubmitTime>().Get(p => p.UserId == profiles.Data.Id).OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    if (check != null)
                    {
                        if (check != null && check.ExamId == examId)
                        {
                            var exits = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == check.SubmissionTimeId);
                            if (exits != null)
                            {
                                if (exits.ReceivedDate.Date > DateTime.Now.Date)
                                    return new ResponseDataObject<SysManageApplicationTime>(exits, Code.Forbidden, "Cưng đã đăng ký nộp hồ sơ rồi nhé !");
                            }
                        }
                    }
                    return new ResponseData(Code.Success, "Cưng có thể tiếp tục đăng ký đấy !");
                }
                return new ResponseDataError(Code.NotFound, "Không tìm thấy thông tin user !");
            }
            catch (Exception exception)
            {
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetHistoryRegister(string accessToken, string? tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : string.Empty);


                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null)
                {
                    var histories = unitOfWork.Repository<SysManageRegisteredCandidates>().Get(p => p.UserId == profiles.Data.Id).OrderByDescending(l => l.CreatedOnDate);
                    if (histories.Count() == 0)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy lịch sử đăng ký !");
                    var headerQuatersGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    var serviceAlongExams = await HttpHelper.Get<ResponseDataObject<List<ServiceAlongExamModel>>>(apiBasicUriCatalog, "ServiceAlongExam", accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    var examVersions = await HttpHelper.Get<ResponseDataObject<List<ExamVersionModel>>>(apiBasicUriCatalog, "ExamVersion", accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    var exams = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    var headerQuaters = headerQuatersGet.Data;
                    var res = new List<object>();
                    HoSoDangKyModel inp = new HoSoDangKyModel()
                    {
                        PageNumber = 1,
                        PageSize = 100,
                        UserEmail = profiles.Data.Username
                    };

                    var totalCount = new SqlParameter
                    {
                        ParameterName = "TotalCount",
                        SqlDbType = System.Data.SqlDbType.Int,
                        Direction = System.Data.ParameterDirection.Output
                    };


                    foreach (var item in histories)
                    {
                        bool canEdit = true;
                        var submission = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == item.SubmissionTime);
                        if (submission == null)
                            return new ResponseDataError(Code.NotFound, "Không tìm thấy thời gian đặt lịch !");
                        var headquarter = headerQuaters?.FirstOrDefault(p => p.Id == item.PlaceOfRegistration);
                        if (headquarter != null)
                        {
                            var timeSetup = unitOfWork.Repository<SysTimeReciveApplication>().FirstOrDefault(p => p.HeaderQuarterId == headquarter.Id);
                            if (timeSetup != null)
                            {
                                if (DateTime.Today.DayOfWeek == DayOfWeek.Sunday)
                                {
                                    if (DateTime.Now.AddDays(1).Date == submission.ReceivedDate.Date)
                                        canEdit = false;
                                }
                                else
                                {
                                    var timeEnd = timeSetup.Weekdays;
                                    if (DateTime.Today.DayOfWeek == DayOfWeek.Saturday)
                                    {
                                        timeEnd = timeSetup.Weekend;
                                    }
                                    var timeSpan = new TimeSpan(Convert.ToInt32(timeEnd.Split(":")[0]), Convert.ToInt32(timeEnd.Split(":")[1]), 00);
                                    if (DateTime.Now.AddDays(1) > submission.ReceivedDate.Date.Add(timeSpan))
                                        canEdit = false;
                                }

                            }
                        }
                        var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        var submit = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == item.SubmissionTime);
                        var headerQuater = headerQuaters?.FirstOrDefault(p => p.Id == item.PlaceOfRegistration);
                        var exam = exams?.Data?.FirstOrDefault(p => p.Id == item.ExamId);
                        var examCalendar = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(p => p.Id == item.ExamScheduleId);
                        if (exam == null)
                            return new ResponseDataError(Code.NotFound, "Không tìm thấy bài thi !");
                        string serviceName = string.Empty;
                        var listService = new List<ServiceAlongExamModel>();
                        if (!string.IsNullOrEmpty(item.AccompaniedService) && serviceAlongExams != null && serviceAlongExams.Data != null)
                        {
                            var services = item.AccompaniedService.Split(",");
                            foreach (var service in services)
                            {
                                var get = serviceAlongExams.Data.FirstOrDefault(p => p.Id.ToString().ToLower() == service.ToLower());
                                if (get != null)
                                {
                                    listService.Add(get);
                                    if (string.IsNullOrEmpty(serviceName))
                                        serviceName = get.Name;
                                    else
                                        serviceName += ", " + get.Name;
                                }

                            }

                        }
                        dynamic data = new ExpandoObject();
                        data.ID = item.Id;
                        data.CodeProfile = item.CodeProfile;
                        data.FullName = profile?.FullName;
                        data.BirthDay = profile?.Birthday.ToString("dd/MM/yyyy");
                        data.Sex = profile?.Sex == "man" ? "Nam" : "Nữ";
                        data.DateApply = submit?.ReceivedDate.ToString("dd/MM/yyyy");
                        data.TimeApply = submit?.TimeStart + " - " + submit?.TimeEnd;
                        data.HeaderQuater = headerQuater?.Name;
                        data.ExamName = exam?.Name;
                        data.Status = item.Status;
                        data.StatusText = Utils.ConvertStatus(Convert.ToInt32(item.Status));

                        data.StatusPaid = Utils.ConvertStatusPaid(Convert.ToInt32(item.StatusPaid));

                        data.Note = item.Note;
                        data.Price = (item.Receipt != null ? (item.Receipt != 1 ? 30000 : 0) : 0) + (!string.IsNullOrEmpty(item.ExamVersion) ? examVersions?.Data?.Where(p => item.ExamVersion.Split(",").Contains(p.Id.ToString())).Select(o => new ExamVersionResModel
                        {
                            Price = Convert.ToInt64(exam?.Price)
                        }).ToList().Sum(p => p.Price) : exam?.Price) + listService.Sum(p => p.Price);

                        //if (item.Status == 2)
                        //{
                        data.DateTest = examCalendar?.DateTest != null ? examCalendar.DateTest.ToString("dd/MM/yyyy") : string.Empty;
                        data.TimeTest = examCalendar?.TimeTest;
                        data.ExamVersionName = string.Empty; // thêm tên với bài thi tin học
                        data.PlaceTest = headerQuaters?.FirstOrDefault(p => p.Id == examCalendar?.HeaderQuarterId)?.Name;
                        data.ReturnDateResult = examCalendar?.Note;
                        data.ServiceName = serviceName;
                        data.Receipt = item.Receipt != null ? (item.Receipt == 1 ? "Nhận tại quầy" : "Nhận tại nhà") : string.Empty;
                        data.Address = item.Receipt == 2 ? item.FullNameReceipt + " - " + item.PhoneReceipt + " - " + item.AddReceipt : string.Empty;
                        data.ExamVersionData = !string.IsNullOrEmpty(item.ExamVersion) ? examVersions?.Data?.Where(p => item.ExamVersion.Split(",").Contains(p.Id.ToString())).Select(o => new ExamVersionResModel
                        {
                            Id = o.Id,
                            Name = o.Name,
                            Price = Convert.ToInt64(exam?.Price)
                        }).ToList() : new List<ExamVersionResModel>() { new ExamVersionResModel
                            {
                                Name = exam != null ? !string.IsNullOrEmpty(exam.Name) ? exam.Name : string.Empty: string.Empty,
                                Price = Convert.ToInt64(exam?.Price)
                            }};
                        data.ListService = listService;
                        data.CreatedOnDate = item.CreatedOnDate.ToString("dd/MM/yyyy");
                        data.CanEdit = item.Status != (int)StatusProfile.Approved && canEdit;
                        data.ReceiptFee = item.Receipt != null ? (item.Receipt != 1 ? 30000 : 0) : 0;


                        //}
                        //else
                        //{
                        //    data.DateTest = string.Empty;
                        //    data.TimeTest = string.Empty;
                        //    data.ExamVersionName = string.Empty; // thêm tên với bài thi tin học
                        //    data.PlaceTest = string.Empty;
                        //    data.ReturnDateResult = string.Empty;
                        //    data.ServiceName = string.Empty;
                        //    data.Receipt = string.Empty;
                        //    data.Address = string.Empty;
                        //    data.ExamVersionData = string.Empty;
                        //    data.ListService = string.Empty;
                        //    data.ReceiptFee = string.Empty;
                        //}
                        res.Add(data);
                    }
                    var spResult = unitOfWork.Repository<RegisteredHistorySpResponse>().dbSet.FromSqlRaw(
                    "SP_ThanhVien_LichSuHoSoDangKy @UserEmail = {0}, @PageNumber = {1}, @RowspPage = {2}, @TotalCount = {3} OUTPUT, @IDNhomMonThi = {4}",
                    inp.UserEmail, inp.PageNumber, inp.PageSize, totalCount, inp.ExamType.HasValue ? (int)inp.ExamType : DBNull.Value).ToList();

                    if (spResult != null && spResult.Count() > 0)
                    {
                        foreach (var item in spResult)
                        {
                            dynamic inse = new ExpandoObject();
                            inse.ID = item.Id.ToString();
                            inse.CodeProfile = item.MaHoSo;
                            inse.FullName = item.Hoten;
                            inse.BirthDay = item.NgaySinh;
                            inse.Sex = item.GioiTinh.GetValueOrDefault() ? "Nam" : "Nữ";
                            inse.DateApply = item.NgayThuHoSo?.ToString("dd/MM/yyyy");
                            inse.TimeApply = $"{item.GioBatDau?.Hours.ToString("D2")}:{item.GioBatDau?.Minutes.ToString("D2")} - {item.GioKetThuc?.Hours.ToString("D2")}:{item.GioKetThuc?.Minutes.ToString("D2")}";
                            inse.HeaderQuater = item.TenPhongBan;
                            inse.ExamName = item.TenMonThi;
                            inse.Status = item.IDTrangThaiHoSo;
                            inse.StatusText = item.TenTrangThai;
                            inse.StatusPaid = item.IsDaThanhToan.GetValueOrDefault() ? "Đã thanh toán" : "Chưa thanh toán";
                            inse.Note = item.DangKyGhiChu;
                            inse.Price = item.ThanhTien;
                            inse.DateTest = item.NgayThi?.ToString("dd/MM/yyyy");
                            inse.TimeTest = item.GioThi;
                            inse.ExamVersionName = "";
                            inse.PlaceTest = item.TenHoiDongThi;
                            inse.ReturnDateResult = item.LichThiGhiChu;
                            inse.ServiceName = "";
                            inse.Receipt = item.HinhThucNhanKetQua;
                            inse.Address = item.DiaChiNguoiNhan;
                            inse.ExamVersionData = item.IDPhienBanMonThi.HasValue ? new
                            {
                                Id = item.IDPhienBanMonThi,
                                Name = item.TenPhienBan,
                                Price = item.DonGia
                            } : default;
                            inse.ListService = Array.Empty<object>();
                            inse.CanEdit = false;
                            inse.ReceiptFee = 0;
                            inse.CreatedOnDate = item.NgayDangKy != null ? item.NgayDangKy.Value.ToString("dd/MM/yyyy") : string.Empty;
                            res.Add(inse);
                        }
                    }
                    return new ResponseDataObject<List<object>>(res, Code.Success, string.Empty);
                }
                return new ResponseDataError(Code.NotFound, "Không tìm thấy thông tin user !");
            }
            catch (Exception exception)
            {
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> ExportExcel(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeProfile, string? fullName, string? cccd, string accessToken)
        {
            DataTable detail = new DataTable();
            detail.Columns.Add("STT");//số thứ tự
            detail.Columns.Add(nameof(SysManageRegisteredCandidates.CodeProfile));//mã hồ sơ
            detail.Columns.Add("FirstName");//họ tên thí sinh
            detail.Columns.Add("LastName");//họ tên thí sinh
            detail.Columns.Add("Gender");//giới tính
            detail.Columns.Add("Birthday");//ngày sinh
            detail.Columns.Add("CMND");//số CMND
            detail.Columns.Add("CMND_Other");//-----------sử dụng số CMND khác(chưa biết)
            detail.Columns.Add("CMND_Original");//số CMND gốc
            detail.Columns.Add("ExamName");//bài thi/Chứng chỉ
            detail.Columns.Add("IsTested");//đã từng thi chưa
            detail.Columns.Add("TestDateLatest");//----------ngày thi gần nhất (chưa biết)
            detail.Columns.Add("Address");//địa chỉ
            detail.Columns.Add("Phone");//số điện thoại
            detail.Columns.Add("Email");//Email
            detail.Columns.Add("Job");//Nghề nghiệp
            detail.Columns.Add("WorkAddress");//Nơi công tác
            detail.Columns.Add("ExamPurpose");//Mục đích dự thi
            detail.Columns.Add("ScoreGoal", typeof(long));//Mục tiêu điểm số
            detail.Columns.Add("IsPost"); //--------Cho phép IIG post thông tin điểm thi lên Website(chưa biết)
            detail.Columns.Add("CandidateRoom"); //-------Phòng thi(chưa biết)
            detail.Columns.Add("TestScheduleDate"); //Ngày thi
            detail.Columns.Add("ExamTime"); //----------------Giờ thi(chưa biết)
            detail.Columns.Add("ExamPlace"); //Địa điểm thi
            detail.Columns.Add("DateApply"); //Thời gian tiếp nhận hồ sơ(ngày + giờ)
            detail.Columns.Add("ReturnResultDate"); //Ngày trả kết quả
            detail.Columns.Add("CreateOnDate"); //Ngày đăng ký
            detail.Columns.Add("FullNameReceipt"); //nhân viên đăng ký
            detail.Columns.Add("ConfirmEmail"); //--------------xác nhận email(chưa biết)
            detail.Columns.Add("AddressReceiveResults"); //--------------Địa chỉ nhận giấy báo(chưa biết)
            detail.Columns.Add("Status"); //Trạng thái hồ sơ
            detail.Columns.Add("Reason"); //--------------Lý do(chưa biết)
            detail.Columns.Add("FullnameParent"); //--------------Họ tên phụ huynh(chưa biết)
            detail.Columns.Add("ProfileNote"); //--------------Đặc điểm hồ sơ cần lưu ý nếu có
            detail.Columns.Add("ProfileIncludes"); //--------------Hồ sơ của thí sinh bao gồm
            detail.Columns.Add("AccompaniedService"); //--------------Dịch vụ đi kèm
            detail.TableName = "details";

            // Tạo bảng dữ liệu chung ( Master ) 
            DataTable Master = new DataTable();
            Master.TableName = "Master";
            Master.Columns.Add("UserCreate");
            Master.Columns.Add("CreateDate");
            DataRow dr = Master.NewRow();

            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                int stt = 1;
                var data = unitOfWork.Repository<SysManageRegisteredCandidates>().Get();
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                {
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.PlaceOfRegistration));

                    dr[$"UserCreate"] = roles.Fullname;
                    dr[$"CreateDate"] = $"{System.Threading.Thread.CurrentThread.CurrentUICulture.DateTimeFormat.GetDayName(System.DateTime.Now.DayOfWeek)}, ngày {DateTime.Now.ToString("dd")} tháng {DateTime.Now.ToString("MM")} năm {DateTime.Now.Year}";
                }
                else
                    data = data.Where(p => p.Id == Guid.Empty);

                var result = new List<ManageRegisteredCandidatesModel>();

                var examGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken);
                var responseProvince = await HttpHelper.Get<ResponseDataObject<List<ProvinceModel>>>(apiBasicUriCatalog, "Province", accessToken);
                var responseDistrict = await HttpHelper.Get<ResponseDataObject<List<DistrictModel>>>(apiBasicUriCatalog, "District", accessToken);
                var responseWard = await HttpHelper.Get<ResponseDataObject<List<WardModel>>>(apiBasicUriCatalog, "Ward", accessToken);
                var responseServiceAlongExam = await HttpHelper.Get<ResponseDataObject<List<ServiceAlongExamModel>>>(apiBasicUriCatalog, "ServiceAlongExam", accessToken);
                List<ProvinceModel> provinces = new List<ProvinceModel>();
                if (responseProvince != null && responseProvince.Code == Code.Success && responseProvince.Data != null)
                {
                    provinces = responseProvince.Data;
                }

                List<DistrictModel> districts = new List<DistrictModel>();
                if (responseDistrict != null && responseDistrict.Code == Code.Success && responseDistrict.Data != null)
                {
                    districts = responseDistrict.Data;
                }

                List<WardModel> wards = new List<WardModel>();
                if (responseWard != null && responseWard.Code == Code.Success && responseWard.Data != null)
                {
                    wards = responseWard.Data;
                }

                List<ServiceAlongExamModel> serviceAlongExams = new List<ServiceAlongExamModel>();
                if (responseServiceAlongExam != null && responseServiceAlongExam.Code == Code.Success && responseServiceAlongExam.Data != null)
                {
                    serviceAlongExams = responseServiceAlongExam.Data;
                }
                if (data != null && data.Count() > 0)
                {
                    data = data.OrderByDescending(p => p.CreatedOnDate);
                    if (areaId != null)
                    {
                        data = data.Where(p => p.AreaId == areaId);
                    }
                    if (headerQuaterId != null)
                    {
                        data = data.Where(p => p.PlaceOfRegistration == headerQuaterId);
                    }
                    if (examId != null)
                    {
                        data = data.Where(p => p.ExamId == examId);
                    }
                    if (statusPaid != null)
                    {
                        data = data.Where(p => p.StatusPaid == statusPaid);
                    }
                    if (status != null)
                    {
                        data = data.Where(p => p.Status == status);
                    }
                    if (!string.IsNullOrEmpty(dateReceive))
                    {
                        var date = dateReceive.Split(",");
                        DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.CreatedOnDate.Date >= dateConvert1 && p.CreatedOnDate.Date <= dateConvert2);
                    }
                    if (!string.IsNullOrEmpty(dateAccept))
                    {
                        var date = dateAccept.Split(",");
                        DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.DateAccept.HasValue && p.DateAccept.Value.Date >= dateConvert1 && p.DateAccept.Value.Date <= dateConvert2);
                    }

                    if (!string.IsNullOrEmpty(fullName))
                    {
                        var candidateRegisters = unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.FullNameOrigin.ToUpper().Contains(fullName.Trim().ToUpper())).Select(p => p.CandidateRegisterId);
                        data = data.Where(p => candidateRegisters.Contains(p.Id));
                    }

                    if (!string.IsNullOrEmpty(codeProfile))
                    {
                        data = data.Where(p => p.CodeProfile == codeProfile);
                    }

                    if (!string.IsNullOrEmpty(cccd))
                    {
                        List<Guid> checkList = new List<Guid>();
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CCCD != null && p.CCCD.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.CMND != null && p.CMND.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        checkList.AddRange(unitOfWork.Repository<SysUserProfileRegistered>().Get(p => p.Passport != null && p.Passport.ToLower() == cccd.Trim().ToLower()).Select(p => p.CandidateRegisterId));
                        data = data.Where(p => checkList.Contains(p.Id)).ToList();
                    }

                    foreach (var item in data)
                    {
                        var userInfo = new UserInfoModel();
                        var profile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        if (profile != null)
                        {
                            var submitTime = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == item.SubmissionTime);
                            var exam = examGet?.Data?.FirstOrDefault(p => p.Id == item.ExamId);

                            string contactAddress = !string.IsNullOrEmpty(profile.ContactAddress) ? $"{profile.ContactAddress}-{wards?.FirstOrDefault(g => g.Id == profile.ContactAddressWardId)?.Name ?? ""}-{districts?.FirstOrDefault(g => g.Id == profile.ContactAddressDistrictId)?.Name ?? ""}-{provinces?.FirstOrDefault(g => g.Id == profile.ContactAddressCityId)?.Name ?? ""}" : "";
                            string workAddress = !string.IsNullOrEmpty(profile.WorkAddress) ? $"{profile.WorkAddress}-{wards?.FirstOrDefault(g => g.Id == profile.WorkAddressWardsId)?.Name ?? ""}-{districts?.FirstOrDefault(g => g.Id == profile.WorkAddressDistrictId)?.Name ?? ""}-{provinces?.FirstOrDefault(g => g.Id == profile.WorkAddressCityId)?.Name ?? ""}" : "";
                            var serviceAlongExamNames = !string.IsNullOrEmpty(item.AccompaniedService) ? serviceAlongExams.Where(g => item.AccompaniedService.Contains(g.Id.ToString())).Select(g => g.Name).ToList() : new List<string>();
                            string strServiceAlongExamNames = string.Join(Environment.NewLine, serviceAlongExamNames);
                            string candidateRoom = string.Empty;
                            string examTime = string.Empty;
                            string examPlace = string.Empty;
                            string confirmEmail = string.Empty;
                            string reason = string.Empty;
                            string fullnameParent = string.Empty;
                            string dateApply = $"{submitTime?.ReceivedDate.ToString("dd/MM/yyyy") ?? ""} {submitTime?.TimeStart ?? "" + " - " + submitTime?.TimeEnd ?? ""}";
                            item.AccompaniedService = strServiceAlongExamNames;
                            detail.Rows.Add(new object[] {
                                stt,
                                item.CodeProfile,
                                !string.IsNullOrEmpty(profile.FirstName) ? profile.FirstName.ToUpper() : string.Empty,
                                !string.IsNullOrEmpty(profile.LastName) ? profile.LastName.ToUpper() : string.Empty,
                                profile.Sex == "man" ? "Nam" : "Nữ", profile.Birthday.ToString("dd/MM/yyyy"),
                                profile.IDNumber, profile.OldCardID ? "v" : string.Empty,
                                !string.IsNullOrEmpty(profile.OldCardIDNumber) ? profile.OldCardIDNumber : string.Empty,
                                (exam != null ? (!string.IsNullOrEmpty(exam.Name) ? exam.Name : string.Empty) : string.Empty),
                                item.IsTested ? "v" : string.Empty,item.TestDate != null ? item.TestDate : string.Empty,
                                contactAddress,
                                profile.Phone,
                                profile.Email,
                                Utils.ConvertJob(!string.IsNullOrEmpty(profile.OptionJob) ? profile.OptionJob : "1",profile.Job),
                                workAddress,
                                Utils.ConvertPurpose(item.ExamPurpose),
                                item.ScoreGoal,
                                profile.AllowUsePersonalData ? "Đồng ý" : "Không đồng ý",
                                candidateRoom,
                                item.TestScheduleDate != null ? item.TestScheduleDate : string.Empty,
                                examTime,
                                examPlace,
                                dateApply,
                                item.ReturnResultDate != null ? item.ReturnResultDate : string.Empty,
                                item.CreatedOnDate.ToString("dd/MM/yyyy"),
                                item.FullNameReceipt != null ? item.FullNameReceipt : string.Empty,
                                confirmEmail,
                                item.AddReceipt != null ? item.AddReceipt : string.Empty,
                                item.Status != null ? Utils.ConvertStatus(Convert.ToInt32(item.Status)) : string.Empty,
                                reason,
                                fullnameParent,
                                item.ProfileNote != null ? item.ProfileNote : string.Empty,
                                item.ProfileIncludes != null ? item.ProfileIncludes : string.Empty,
                                item.AccompaniedService});
                            stt++;
                        }
                    }
                }

                Master.Rows.Add(dr);
                var ds = new DataSet();
                //detail.DefaultView.Sort = "CreateOnDate desc";
                //detail = detail.DefaultView.ToTable();
                ds.Tables.Add(detail);
                ds.Tables.Add(Master);
                var fileNameOutput = $"duyet-ho-so-dang-ky-{DateTime.Now.ToString("dd-MM-yyyy-hhmmss")}.xlsx";
                var fileTemplate = "duyet-ho-so-dang-ky.xlsx";
                ExcelFillData.FillReportGrid(fileNameOutput, fileTemplate, ds, new string[] { "{", "}" }, 1);
                return new ResponseDataObject<object>(new { FileName = $"/OutputExcel/{fileNameOutput}" }, Code.Success, $"/OutputExcel/{fileNameOutput}");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public async Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var ticket = new TicketModel();

                var exitsData = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(p => p.Id == id);
                if (exitsData == null)
                    return new ResponseDataError(Code.NotFound, "IDNotFound");

                var submissionTime = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == exitsData.SubmissionTime);
                if (submissionTime == null)
                    return new ResponseDataError(Code.NotFound, "SubmissionIdNotFound");

                var userRegisterProfile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(x => x.CandidateRegisterId == id);
                if (userRegisterProfile == null)
                    return new ResponseDataError(Code.NotFound, "ProfileNotFound");

                var examGet = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + exitsData.ExamId.ToString(), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var wardGet = await HttpHelper.Get<ResponseDataObject<WardModel>>(apiBasicUriCatalog, "Ward/" + userRegisterProfile.ContactAddressWardId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var districtGet = await HttpHelper.Get<ResponseDataObject<DistrictModel>>(apiBasicUriCatalog, "District/" + userRegisterProfile.ContactAddressDistrictId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var cityGet = await HttpHelper.Get<ResponseDataObject<ProvinceModel>>(apiBasicUriCatalog, "Province/" + userRegisterProfile.ContactAddressCityId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var serviceGet = await HttpHelper.Get<ResponseDataObject<List<ServiceAlongExamModel>>>(apiBasicUriCatalog, "ServiceAlongExam", accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);

                var wardWGet = await HttpHelper.Get<ResponseDataObject<WardModel>>(apiBasicUriCatalog, "Ward/" + userRegisterProfile.WorkAddressWardsId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var districtWGet = await HttpHelper.Get<ResponseDataObject<DistrictModel>>(apiBasicUriCatalog, "District/" + userRegisterProfile.WorkAddressDistrictId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var cityWGet = await HttpHelper.Get<ResponseDataObject<ProvinceModel>>(apiBasicUriCatalog, "Province/" + userRegisterProfile.WorkAddressCityId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);

                if (examGet == null || examGet.Data == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bài thi !");
                string nameTemplate = string.Empty;
                switch (examGet.Data.RegistrationCode)
                {
                    case CodeExam.TOEIC_SPW:
                        nameTemplate = "TOEIC_SPW.cshtml"; break;
                    case CodeExam.TOEFL_ITP:
                        nameTemplate = "TOEFL_ITP.cshtml"; break;
                    case CodeExam.TOEIC:
                        nameTemplate = "TOEIC.cshtml"; break;
                    case CodeExam.IT:
                        nameTemplate = "IT.cshtml"; break;
                }

                ticket.ExamNameIT = examGet.Data.Name;

                string tmplFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates");
                if (string.IsNullOrEmpty(language))
                    language = Language.VietNam;
                //string filePath = AppDomain.CurrentDomain.BaseDirectory + "/Templates/TOEIC.cshtml";
                string filePath = AppDomain.CurrentDomain.BaseDirectory + "/Templates/" + nameTemplate;
                if (!File.Exists(filePath))
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy template !");

                using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                using var sr = new StreamReader(fs, Encoding.Default);
                string template = sr.ReadToEnd();
                sr.Close();


                ticket.AllowUsePersonalData = userRegisterProfile.AllowUsePersonalData;
                ticket.SubmissionTime = submissionTime.ReceivedDate.ToString("dd/MM/yyyy") + " " + submissionTime.TimeStart + " - " + submissionTime.TimeEnd;
                ticket.FullName = userRegisterProfile.FullNameOrigin.ToUpper();
                ticket.OldCardIDNumber = !string.IsNullOrEmpty(userRegisterProfile.OldCardIDNumber) ? userRegisterProfile.OldCardIDNumber : string.Empty;
                ticket.NumberOfIdCard = !string.IsNullOrEmpty(userRegisterProfile.CCCD) ? userRegisterProfile.CCCD : (!string.IsNullOrEmpty(userRegisterProfile.CMND) ? userRegisterProfile.CMND : (!string.IsNullOrEmpty(userRegisterProfile.Passport) ? userRegisterProfile.Passport : string.Empty));
                ticket.Sex = userRegisterProfile.Sex;
                ticket.Dob = userRegisterProfile.Birthday.ToString("dd/MM/yyyy");
                ticket.Phone = userRegisterProfile.Phone;
                ticket.Address = userRegisterProfile.ContactAddress + " - " + (wardGet != null ? wardGet.Data?.Name : string.Empty) + " - " + (districtGet != null ? districtGet.Data?.Name : string.Empty) + " - " + (cityGet != null ? cityGet.Data?.Name : string.Empty);
                ticket.Email = userRegisterProfile.Email;
                ticket.Job = !string.IsNullOrEmpty(userRegisterProfile.OptionJob) ? Utils.ConvertJob(userRegisterProfile.OptionJob, userRegisterProfile.Job) : string.Empty;
                ticket.AddressWork = (!string.IsNullOrEmpty(userRegisterProfile.WorkAddress) ? userRegisterProfile.WorkAddress : string.Empty) + " - " + (wardWGet != null ? wardWGet.Data?.Name : string.Empty) + " - " + (districtWGet != null ? districtWGet.Data?.Name : string.Empty) + " - " + (cityWGet != null ? cityWGet.Data?.Name : string.Empty); ;
                ticket.PurposeTest = Utils.ConvertPurpose(exitsData.ExamPurpose);
                ticket.PurposePoint = exitsData.ScoreGoal.ToString();
                ticket.IsTested = exitsData.IsTested;
                ticket.DateTestRecent = exitsData.TestDate != null ? exitsData.TestDate.Value.ToString("dd/MM/yyyy") : string.Empty;
                ticket.ExamName = examGet.Data.Name;
                ticket.DateTest = exitsData.TestScheduleDate != null ? exitsData.TestScheduleDate.Value.ToString("dd/MM/yyyy") : string.Empty;
                ticket.TimeTest = string.Empty;
                ticket.PlaceTest = string.Empty;
                ticket.ProfileInclude = !string.IsNullOrEmpty(exitsData.ProfileIncludes) ? exitsData.ProfileIncludes : string.Empty;
                ticket.ProfileNote = !string.IsNullOrEmpty(exitsData.Note) ? exitsData.Note : string.Empty;
                ticket.AcceptBy = !string.IsNullOrEmpty(exitsData.AcceptBy) ? exitsData.AcceptBy : string.Empty;
                if (!string.IsNullOrEmpty(exitsData.AccompaniedService) && serviceGet != null && serviceGet.Data != null)
                {
                    var idsService = exitsData.AccompaniedService.Split(",");
                    foreach (var idss in idsService)
                    {
                        if (string.IsNullOrEmpty(idss))
                        {
                            var checkid = serviceGet.Data.FirstOrDefault(p => p.Id.ToString().ToLower() == idss.ToLower());
                            if (checkid != null)
                            {
                                if (ticket.Service.Length == 0)
                                    ticket.Service += checkid.Name;
                                else
                                    ticket.Service += ", " + checkid.Name;
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

        private async Task SendEmailNotification(SendMailModel model, string accessToken, string tenant)
        {
            try
            {
                if (!string.IsNullOrEmpty(accessToken))
                {
                    var responseData = await HttpHelper.Get<ResponseDataObject<EmailTemplateModel>>(apiBasicUriCatalog,
                        $"EmailTemplate/GetExamTemplateContent?examId={model.ExamId}&emailTemplateType={model.EmailTemplateType}", accessToken, tenant);
                    var emailTemplate = responseData.Data;
                    if (emailTemplate != null && emailTemplate.Status)
                    {
                        var emailBody = string.Empty;
                        switch (emailTemplate.Type)
                        {
                            case 1:
                                emailBody = ReplaceEmailRegistration(emailTemplate.ContentInVietnamese, (SendEmailRegistrationModel)model.SendMailObject);
                                break;
                            default:
                                break;
                        }

                        if (!string.IsNullOrEmpty(emailBody))
                        {
                            await _emailTemplateHandler.SendOneZetaEmail(new EmailRequest()
                            {
                                ToAddress = model.UserEmail,
                                Subject = emailTemplate.SubjectInVietnamese,
                                HTMLBody = emailBody
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
            }
        }

        private string ReplaceEmailRegistration(string content, SendEmailRegistrationModel model)
        {
            if (!string.IsNullOrEmpty(content))
            {
                content = content
                    .Replace("@MaHoSo", model.FileCode, StringComparison.OrdinalIgnoreCase)
                    .Replace("@HoTen", model.CandidateName, StringComparison.OrdinalIgnoreCase)
                    .Replace("@NgaySinh", model.CandidateBirthday, StringComparison.OrdinalIgnoreCase)
                    .Replace("@NgayTiepNhan", model.DateApplyFile, StringComparison.OrdinalIgnoreCase)
                    .Replace("@GioTiepNhan", model.TimeApplyFile, StringComparison.OrdinalIgnoreCase)
                    .Replace("@DiaDiemThi", model.ExamLocation, StringComparison.OrdinalIgnoreCase)
                    .Replace("@MonThi", model.ExamName, StringComparison.OrdinalIgnoreCase);
            }

            return content;
        }

        public async Task<ResponseData> Duplicate(ManageRegisteredCandidatesModel model, string accessToken)
        {
            try
            {
                if (model != null)
                {
                    using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                    var request = new Dictionary<string, string>();
                    int index = 0;
                    var multipartFormContent = new MultipartFormDataContent();
                    var currentData = unitOfWork.Repository<SysManageRegisteredCandidates>().GetById(model.Id);
                    if (currentData == null)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy dữ liệu !");
                    var exist = new SysManageRegisteredCandidates();
                    exist.UserId = currentData.UserId;
                    var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + model.PlaceOfRegistration, accessToken != null ? accessToken : string.Empty);
                    if (headerQuater == null || headerQuater.Data == null)
                        return new ResponseDataError(Code.NotFound, "Không tìm thấy địa điểm !");

                    string last = unitOfWork.Repository<SysManageRegisteredCandidates>().Count(p => p.PlaceOfRegistration.ToString().ToLower() == model.PlaceOfRegistration.ToString().ToLower()).ToString("D6");
                    exist.Id = Guid.NewGuid();
                    exist.CodeProfile = DateTime.Now.ToString("yy") + headerQuater.Data.ProfileCode + last;
                    exist.AreaId = headerQuater.Data.AreaId;
                    var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + exist.UserId + "?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                    if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                    {
                        var current = profiles.Data.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                        var profileCurrent = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == model.Id);
                        var profileTemp = new SysUserProfileRegistered();
                        profileTemp.Id = Guid.NewGuid();
                        profileTemp.CandidateRegisterId = exist.Id;

                        if (model.IsChangeUserInfo)
                        {
                            profileTemp.UserName = profileCurrent?.UserName;
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
                                    string fullName = model.UserInfo.FullName.Trim();
                                    Regex trimmer = new Regex(@"\s\s+");
                                    fullName = trimmer.Replace(fullName, " ");
                                    profileTemp.FullName = Utils.RemoveUnicode(fullName);
                                    profileTemp.LastName = profileTemp.FullName.Split(" ").LastOrDefault();
                                    profileTemp.FirstName = profileTemp.FullName.Replace(" " + profileTemp.LastName, "");
                                    profileTemp.FullNameOrigin = model.UserInfo.FullName;
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
                                if (typeIdCard != null)
                                {
                                    var type = current.Metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard)?.Value;
                                    multipartFormContent.Add(new StringContent(typeIdCard.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(type != null ? type : "1"), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.TypeIdCard = type != null ? type : "1";
                                }

                                var metaIdCardNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CCCD);
                                if (metaIdCardNumber != null && model.UserInfo != null && model.UserInfo.CCCD != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaIdCardNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.CCCD), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.CCCD = model.UserInfo.CCCD;
                                }

                                var cmnd = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CMND);
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

                                var metaWorkAddress = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.WorkAddress);
                                if (metaWorkAddress != null && model.UserInfo != null && model.UserInfo.WorkAddress != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaWorkAddress.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddress), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddress = model.UserInfo.WorkAddress;
                                }

                                var metaWardWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.WardWork);
                                if (metaWardWork != null && model.UserInfo != null && model.UserInfo.WorkAddressWardsId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaWardWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressWardsId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressWardsId = (Guid)model.UserInfo.WorkAddressWardsId;
                                }

                                var metaDistrictWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.DistrictWork);
                                if (metaDistrictWork != null && model.UserInfo != null && model.UserInfo.WorkAddressDistrictId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaDistrictWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressDistrictId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressDistrictId = (Guid)model.UserInfo.WorkAddressDistrictId;
                                }

                                var metaCityWork = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.CityWork);
                                if (metaCityWork != null && model.UserInfo != null && model.UserInfo.WorkAddressCityId != null)
                                {
                                    multipartFormContent.Add(new StringContent(metaCityWork.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                    multipartFormContent.Add(new StringContent(model.UserInfo.WorkAddressCityId.Value.ToString()), name: "Metadata[" + index + "].textValue");
                                    multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                    index++;
                                    profileTemp.WorkAddressCityId = (Guid)model.UserInfo.WorkAddressCityId;
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

                                unitOfWork.Repository<SysUserProfileRegistered>().Insert(profileTemp);
                                string profileId = await HttpHelper.UpdateProfileUser(apiBasicUriUser, "b2cuser/" + exist.UserId, multipartFormContent, accessToken != null ? accessToken : "");
                                if (Utils.IsGuid(profileId))
                                {
                                    exist.UserProfileId = new Guid(profileId);

                                }
                            }
                        }
                    }

                    exist.ExamPurpose = model.ExamPurpose;
                    exist.ScoreGoal = model.ScoreGoal;
                    exist.IsTested = model.IsTested;
                    exist.TestDate = model.TestDate;
                    exist.PlaceOfRegistration = model.PlaceOfRegistration;
                    exist.SubmissionTime = model.SubmissionTime;
                    exist.ExamId = model.ExamId;
                    exist.ExamVersion = model.ExamVersion;
                    exist.TestScheduleDate = model.TestScheduleDate;
                    exist.ReturnResultDate = model.ReturnResultDate;
                    exist.PriorityObject = model.PriorityObject;
                    exist.AccompaniedService = model.AccompaniedService;
                    exist.UserName = model.UserName;
                    exist.ProfileIncludes = model.ProfileIncludes;
                    exist.ProfileNote = model.ProfileNote;
                    exist.Password = model.Password;
                    exist.Note = model.Note;
                    exist.StatusPaid = (int)StatusPaid.UnPaid;
                    exist.Status = (int)StatusProfile.Receive;
                    exist.CanTest = model.CanTest;
                    exist.ExamScheduleId = model.ExamScheduleId;
                    exist.Receipt = model.Receipt;
                    exist.AddReceipt = model.AddReceipt;
                    exist.PhoneReceipt = model.PhoneReceipt;
                    exist.FullNameReceipt = model.FullNameReceipt;

                    unitOfWork.Repository<SysManageRegisteredCandidates>().Insert(exist);
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

        public ResponseData Statistic(StatisticModel model, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listCandidates = unitOfWork.Repository<SysManageRegisteredCandidates>().GetQueryable(item => item.CreatedOnDate.Date >= model.DateFrom.Date && item.CreatedOnDate.Date <= model.DateTo.Date);
                var returnObject = new ResponseDataObject<object>();
                switch (model.Type)
                {
                    case 1:
                        returnObject.Data = listCandidates.GroupBy(item => item.CreatedOnDate.Date).Select(item => new { Date = item.Key.ToString("dd/MM/yyyy"), Quantity = item.Count() }).ToList();
                        break;
                    case 2:
                        returnObject.Data = listCandidates.GroupBy(item => new { item.CreatedOnDate.Year, item.CreatedOnDate.Month }).Select(item => new { Month = $"{item.Key.Month:00}-{item.Key.Year}", Quantity = item.Count() }).ToList();
                        break;
                    case 3:
                        returnObject.Data = listCandidates.GroupBy(item => item.CreatedOnDate.Year).Select(item => new { Year = item.Key, Quantity = item.Count() }).ToList();
                        break;
                    default:
                        break;
                }

                return returnObject;
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData StatisticDetail(DateTime dateFrom, DateTime dateTo, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listCandidates = unitOfWork.Repository<SysManageRegisteredCandidates>().GetQueryable(item => item.CreatedOnDate.Date >= dateFrom.Date && item.CreatedOnDate.Date <= dateTo.Date);
                var returnObject = new ResponseDataObject<IEnumerable<StatisticDetailModel>>();
                var dataReturn = new List<StatisticDetailModel>();
                var statisticDetailData = listCandidates.GroupBy(item => new { item.PlaceOfRegistration, item.CreatedOnDate.Date }, (Key, listCandidate) => new { Key, Value = listCandidate.Count() }).ToList();
                var listHeadQuater = HttpHelper.Get<ResponseDataObject<IEnumerable<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken, string.Empty).Result.Data;
                if (listHeadQuater != null)
                {
                    foreach (var headQuarter in listHeadQuater)
                    {
                        var statisticHeadQuarter = statisticDetailData.Where(item => item.Key.PlaceOfRegistration == headQuarter.Id);
                        foreach (var item in statisticHeadQuarter)
                        {
                            dataReturn.Add(new StatisticDetailModel
                            {
                                Name = headQuarter.Name,
                                Date = item.Key.Date,
                                DateString = item.Key.Date.ToString("dd/MM/yyyy"),
                                Value = item.Value
                            });
                        }
                    }
                }

                returnObject.Data = dataReturn.OrderByDescending(item => item.Date);
                return returnObject;
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetInfoTicketUpdate(Guid id, string accessToken, string tenant)
        {
            try
            {
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken);

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                    var checkExits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(p => p.Id == id && p.UserId == profiles.Data.Id);
                    if (checkExits == null)
                        return new ResponseDataError(Code.NotFound, "IDNotFound");

                    var checkRegisted = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(p => p.Status == (int)StatusProfile.Approved && p.UserId == profiles.Data.Id);
                    var getSubmisstionTime = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == checkExits.SubmissionTime);
                    if (getSubmisstionTime == null)
                        return new ResponseDataError(Code.NotFound, "IDNotFound");

                    var timeInWeek = unitOfWork.Repository<SysTimeReciveApplication>().FirstOrDefault(p => p.HeaderQuarterId == getSubmisstionTime.HeaderQuarterId);
                    if (timeInWeek == null)
                        return new ResponseDataError(Code.Forbidden, "HeadQuarterNotInclude");

                    var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + checkExits.ExamId, accessToken, tenant);
                    if (exam == null || (exam != null && exam.Data == null))
                        return new ResponseDataError(Code.NotFound, "ExamNotFound");

                    if (DateTime.Today.DayOfWeek == DayOfWeek.Sunday)
                    {
                        if (DateTime.Now.AddDays(1).Date == getSubmisstionTime.ReceivedDate.Date)
                            return new ResponseDataError(Code.Forbidden, "CanNotEditTomorow");
                    }
                    else
                    {
                        var timeEnd = timeInWeek.Weekdays;
                        if (DateTime.Today.DayOfWeek == DayOfWeek.Saturday)
                        {
                            timeEnd = timeInWeek.Weekend;
                        }
                        var timeSpan = new TimeSpan(Convert.ToInt32(timeEnd.Split(":")[0]), Convert.ToInt32(timeEnd.Split(":")[1]), 00);
                        if (DateTime.Now.AddDays(1) > getSubmisstionTime.ReceivedDate.Date.Add(timeSpan))
                            return new ResponseDataError(Code.Forbidden, "CanNotEditAfter" + timeEnd);
                    }

                    var res = new
                    {
                        ExamId = checkExits.ExamId,
                        ExamCode = exam?.Data?.Code,
                        AreaId = checkExits.AreaId,
                        PlaceOfRegistration = checkExits.PlaceOfRegistration,
                        SubmissionTime = checkExits.SubmissionTime,
                        ExamPurpose = checkExits.ExamPurpose,
                        UserProfileId = checkExits.UserProfileId,
                        ExamVersion = checkExits.ExamVersion,
                        ScoreGoal = checkExits.ScoreGoal,
                        IsTested = checkExits.IsTested,
                        TestedDate = checkExits.TestDate,
                        Registed = checkRegisted != null

                    };
                    return new ResponseDataObject<object>(res, Code.Success, "");
                }
                return new ResponseDataError(Code.Forbidden, "Forbidden");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> UpdateByCandidate(RegisteredCandidatesModel model, string? accessToken, string? tenant)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var submission = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(p => p.Id == model.SubmissionTime);
                if (submission == null)
                    return new ResponseDataError(Code.NotFound, "TimeFormNotFound!");

                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var checkExits = unitOfWork.Repository<SysManageRegisteredCandidates>().FirstOrDefault(p => p.Id == model.Id && p.UserId == profiles.Data.Id);
                    if (checkExits == null)
                        return new ResponseDataError(Code.NotFound, "IDNotFound");

                    if (checkExits.SubmissionTime != model.SubmissionTime)
                    {
                        if (submission.MaxRegistry <= unitOfWork.Repository<SysUserSubmitTime>().Count(p => p.SubmissionTimeId == submission.Id))
                            return new ResponseDataError(Code.Forbidden, "SubmissionTimeFull");
                    }
                    if (checkExits.Status == (int)StatusProfile.Approved)
                        return new ResponseDataError(Code.Forbidden, "CanNotEdit");

                    var timeInWeek = unitOfWork.Repository<SysTimeReciveApplication>().FirstOrDefault(p => p.HeaderQuarterId == submission.HeaderQuarterId);
                    if (timeInWeek == null)
                        return new ResponseDataError(Code.Forbidden, "HeadQuarterNotInclude");

                    if (DateTime.Today.DayOfWeek == DayOfWeek.Sunday)
                    {
                        if (DateTime.Now.AddDays(1).Date == submission.ReceivedDate.Date)
                            return new ResponseDataError(Code.Forbidden, "CanNotEditTomorow");
                    }
                    else
                    {
                        var timeEnd = timeInWeek.Weekdays;
                        if (DateTime.Today.DayOfWeek == DayOfWeek.Saturday)
                        {
                            timeEnd = timeInWeek.Weekend;
                        }
                        var timeSpan = new TimeSpan(Convert.ToInt32(timeEnd.Split(":")[0]), Convert.ToInt32(timeEnd.Split(":")[1]), 00);
                        if (DateTime.Now.AddDays(1) > submission.ReceivedDate.Date.Add(timeSpan))
                            return new ResponseDataError(Code.Forbidden, "CanNotEditAfter" + timeEnd);
                    }

                    var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + model.ExamId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (exam == null || exam.Data == null)
                        return new ResponseDataError(Code.NotFound, "ExamNotFound");
                    var headerQuater = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + model.PlaceOfRegistration, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (headerQuater == null || headerQuater.Data == null)
                        return new ResponseDataError(Code.NotFound, "HeadQuarterNotFound");
                    if (!headerQuater.Data.CanRegisterExam)
                        return new ResponseDataError(Code.Forbidden, "HeadQuarterNotAcept");
                    if (string.IsNullOrEmpty(headerQuater.Data.ProfileCode))
                        return new ResponseDataError(Code.Forbidden, "HeadQuarterNotIncludeProfileCode");
                    checkExits.UserId = profiles.Data.Id;
                    checkExits.Status = (int)StatusProfile.Receive;
                    checkExits.StatusPaid = (int)StatusPaid.UnPaid;
                    checkExits.Price = exam.Data.Price;
                    checkExits.IsTested = model.IsTested;
                    checkExits.TestDate = model.TestDate;
                    checkExits.SubmissionTime = model.SubmissionTime;
                    checkExits.ExamPurpose = model.ExamPurpose;
                    checkExits.PlaceOfRegistration = model.PlaceOfRegistration;
                    checkExits.ExamId = model.ExamId;
                    checkExits.ScoreGoal = model.ScoreGoal;
                    checkExits.AreaId = headerQuater.Data.AreaId;
                    var saveProfile = unitOfWork.Repository<SysUserProfileRegistered>().FirstOrDefault(p => p.CandidateRegisterId == checkExits.Id);

                    var profileUse = profiles?.Data?.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                    if (profileUse != null && saveProfile != null)
                    {
                        checkExits.UserProfileId = profileUse.Id;
                        var metadata = profileUse.Metadata;
                        if (metadata != null)
                        {
                            saveProfile.UserName = profiles?.Data.Email;
                            saveProfile.CandidateRegisterId = (Guid)model.Id;
                            var isStudent = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IsStudent);
                            if (isStudent != null)
                            {
                                saveProfile.IsStudent = isStudent.Value == "1";
                            }
                            var wardWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WardWork);
                            if (wardWork != null && wardWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressWardsId = new Guid(wardWork.Value);
                            }
                            var cityWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CityWork);
                            if (cityWork != null && cityWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressCityId = new Guid(cityWork.Value);
                                if (string.IsNullOrEmpty(exam.Data.ProvinceApply) || (!string.IsNullOrEmpty(exam.Data.ProvinceApply) && !exam.Data.ProvinceApply.Contains(cityWork.Value)))
                                {
                                    return new ResponseDataError(Code.Forbidden, "AreaCanNotRegister");
                                }
                            }
                            var districtWork = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.DistrictWork);
                            if (districtWork != null && districtWork.Value.Length == 36)
                            {
                                saveProfile.WorkAddressDistrictId = new Guid(districtWork.Value);
                            }
                            var workAddress = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.WorkAddress);
                            if (workAddress != null)
                            {
                                saveProfile.WorkAddress = workAddress.Value;
                            }
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
                                saveProfile.FullNameOrigin = fullName;
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
                            var idCardNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            if (idCardNumber != null)
                            {
                                var type = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard)?.Value;
                                switch (type)
                                {
                                    case "1":
                                        saveProfile.CMND = idCardNumber.Value;
                                        break;
                                    case "2":
                                        saveProfile.CCCD = idCardNumber.Value;
                                        break;
                                    case "3":
                                        saveProfile.Passport = idCardNumber.Value;
                                        break;
                                }
                            }
                            var cccdT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CCCD);
                            if (cccdT != null)
                            {
                                saveProfile.CCCD = cccdT.Value;
                            }
                            var cmndT = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.CMND);
                            if (cmndT != null)
                            {
                                saveProfile.CMND = cmndT.Value;
                            }
                            var passport = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Passport);
                            if (passport != null)
                            {
                                saveProfile.Passport = passport.Value;
                            }
                            var oldCardID = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OldCardID);
                            if (oldCardID != null)
                            {
                                saveProfile.OldCardID = oldCardID.Value == "1";
                            }
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            if (typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                            }
                            if (saveProfile.TypeIdCard == TypeIDCard.CMND)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CMND) ? saveProfile.CMND : string.Empty;
                            else if (saveProfile.TypeIdCard == TypeIDCard.CCCD)
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.CCCD) ? saveProfile.CCCD : string.Empty;
                            else
                                saveProfile.IDNumber = !string.IsNullOrEmpty(saveProfile.Passport) ? saveProfile.Passport : string.Empty;

                            var oldCardIDNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OldCardIDNumber);
                            if (oldCardIDNumber != null)
                            {
                                saveProfile.OldCardIDNumber = oldCardIDNumber.Value;
                            }
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
                            var allowUsePersonalData = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.AllowUsePersonalData);
                            if (allowUsePersonalData != null)
                            {
                                saveProfile.AllowUsePersonalData = allowUsePersonalData.Value == "1";
                            }

                            saveProfile.PlaceOfCCCD = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.PlaceProvideIdCard)?.Value;
                            saveProfile.Job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job)?.Value;
                            saveProfile.OptionJob = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OptionJob)?.Value;
                            unitOfWork.Repository<SysUserProfileRegistered>().Update(saveProfile);
                            unitOfWork.Repository<SysManageRegisteredCandidates>().Update(_mapper.Map<SysManageRegisteredCandidates>(checkExits));
                            var slot = unitOfWork.Repository<SysUserSubmitTime>().FirstOrDefault(p => p.ExamId == model.ExamId && p.UserId == profiles.Data.Id && p.UserName == profiles.Data.Username);
                            if (slot != null)
                            {
                                slot.SubmissionTimeId = model.SubmissionTime;
                                unitOfWork.Repository<SysUserSubmitTime>().Update(slot);
                            }
                            unitOfWork.Save();

                            await SendEmailNotification(new SendMailModel
                            {
                                ExamId = exam.Data.Id,
                                EmailTemplateType = 1,
                                UserEmail = saveProfile.Email,
                                SendMailObject = new SendEmailRegistrationModel
                                {
                                    CandidateBirthday = saveProfile.Birthday.ToString("dd/MM/yyyy"),
                                    CandidateName = saveProfile.FullNameOrigin,
                                    FileCode = model.CodeProfile,
                                    ExamLocation = headerQuater.Data.Name,
                                    DateApplyFile = submission.ReceivedDate.ToString("dd/MM/yyyy"),
                                    TimeApplyFile = submission.TimeStart + " - " + submission.TimeEnd,
                                    ExamName = exam.Data.Name
                                }
                            }, accessToken ?? string.Empty, tenant ?? string.Empty);
                        }
                    }
                    return new ResponseDataObject<object>(new
                    {
                        Id = model.Id,
                        CodeProfile = model.CodeProfile,
                        ExamName = exam.Data.Name,
                        DateCreate = submission.ReceivedDate.ToString("dd/MM/yyyy"),
                        TimeCreate = submission.TimeStart + " - " + submission.TimeEnd,
                        Place = headerQuater.Data.Name,
                        FullName = saveProfile.FullNameOrigin,
                        BirthDay = saveProfile.Birthday.ToString("dd/MM/yyyy")
                    }, Code.Success, "Success");
                }
                return new ResponseDataError(Code.NotFound, "ProfileNotFound");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetDataExamSubjectByExamCode(Guid areaId, string examCode, string accessToken, string tenant)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var headQuarterGets = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter/GetByAreaId/" + areaId, accessToken, tenant);
                if (headQuarterGets == null)
                    return new ResponseDataError(Code.NotFound, "AreaNotFound");
                var examGet = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/GetByCode/" + examCode, accessToken, tenant);
                if (examGet == null || (examGet != null && examGet.Data == null))
                    return new ResponseDataError(Code.NotFound, "ExamCodeNotFound");

                var exam = examGet?.Data;
                if (exam == null)
                    return new ResponseDataError(Code.NotFound, "ExamNotFound");

                var headQuarters = new List<HeadQuarterModel>();
                if (headQuarterGets.Data != null)
                {
                    headQuarters = headQuarterGets.Data.Where(p => p.CanRegisterExam).ToList();
                }
                var examCalendars = unitOfWork.Repository<SysExamCalendar>().Get(p => headQuarters.Select(o => o.Id).Contains(p.HeaderQuarterId) && p.ExamId.ToLower().Contains(exam.Id.ToString().ToLower())).ToList();


                var examSubjects = await HttpHelper.Get<ResponseDataObject<List<ExamSubjectModel>>>(apiBasicUriCatalog, "ExamSubject/GetByExamId/" + exam?.Id, accessToken, tenant);
                if (examSubjects != null && examSubjects.Data != null && exam != null)
                {

                    var res = new List<ExpandoObject>();
                    foreach (var examSubject in examSubjects.Data.Where(p => p.Status))
                    {
                        dynamic examSubjectOut = new ExpandoObject();
                        examSubjectOut.Id = examSubject.Id;
                        examSubjectOut.ExamSubjectName = examSubject.Name;
                        var examVersion = exam.ExamVersion?.Where(p => p.ExamSubjectId == examSubject.Id && p.IsShow).ToList();
                        examSubjectOut.ExamVersion = examVersion;
                        res.Add(examSubjectOut);

                    }
                    return new ResponseDataObject<object>(new
                    {
                        ExamSubject = res,
                        ExamCalendar = examCalendars,
                    }, Code.Success, "Success");
                }
                return new ResponseDataError(Code.NotFound, "ExamSubjectNotFound");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
