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
using Backend.Business.ManageRegisteredCandidates;
using DocumentFormat.OpenXml.Office2016.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Backend.Infrastructure.Dapper.Interfaces;
using System.Linq;

namespace Backend.Business.ManageRegisteredCandidateIT
{
    public class ManageRegisteredCandidateITHandler : IManageRegisteredCandidateITHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");
        private static readonly string apiBasicUriUser = Backend.Infrastructure.Utils.Utils.GetConfig("User");
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private readonly IDapperUnitOfWork _dapper;

        public ManageRegisteredCandidateITHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment, IEmailTemplateHandler emailTemplateHandler, IDapperUnitOfWork dapper)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            _emailTemplateHandler = emailTemplateHandler;
            _dapper = dapper;
        }

        public async Task<ResponseData> Create(InputManageRegisteredCandidateITModel model, string accessToken, string tenant)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var examGet = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + model.ExamId, accessToken, tenant);
                if (examGet == null)
                    return new ResponseDataError(Code.NotFound, "ExamNotFound");
                if (examGet.Data == null)
                    return new ResponseDataError(Code.NotFound, "ExamDataNotFound");
                if (!model.ExamRegistedData.Any())
                    return new ResponseDataError(Code.BadRequest, "ExamDataIncorect");

                var examScheduleInputIds = model.ExamRegistedData.Select(p => p.ExamScheduleId.ToLower()).ToList();
                var examCalendars = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleInputIds.Contains(p.Id.ToString().ToLower()));
                foreach (var item in model.ExamRegistedData)
                {
                    if (model.ExamRegistedData.Count(p => p.ExamVersionId == item.ExamVersionId) > 1 || model.ExamRegistedData.Count(p => p.ExamScheduleId == item.ExamScheduleId) > 1)
                        return new ResponseDataError(Code.BadRequest, "ExamDataInputIncorect");
                    var examCalendar = examCalendars.FirstOrDefault(p => p.Id.ToString().ToLower() == item.ExamScheduleId.ToLower());
                    if (examCalendar == null)
                        return new ResponseDataError(Code.BadRequest, "ExamScheduleIncorect");
                    var duCho = unitOfWork.Repository<SysHoldPosition>().Get(p => p.ExamCalendarId == examCalendar.Id).Sum(p => p.Quantity);
                    var registed = unitOfWork.Repository<SysManageRegisteredCandidateIT>().Get(p => p.StatusPaid == (int)StatusPaid.Paid && p.ExamScheduleString.Contains(item.ExamScheduleId)).Count();
                    if (registed + duCho >= examCalendar.QuantityCandidate)
                        return new ResponseDataError(Code.BadRequest, "QuantityWasFull");
                }

                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var saveData = new SysManageRegisteredCandidateIT();
                    saveData.Id = Guid.NewGuid();
                    saveData.IsTested = model.IsTested;
                    if (!string.IsNullOrEmpty(model.TestDate))
                        saveData.TestDate = DateTime.ParseExact(model.TestDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                    saveData.UserId = profiles.Data.Id;
                    saveData.StatusPaid = (int)StatusPaid.UnPaid;
                    saveData.Price = (examGet.Data.IsSetCombo && model.ExamRegistedData.Count() == 3) ? Convert.ToInt64(examGet.Data.PriceCombo) * model.ExamRegistedData.Count() : Convert.ToInt64(examGet.Data.Price) * model.ExamRegistedData.Count();
                    if (saveData.Price != model.Price)
                        return new ResponseDataError(Code.BadRequest, "PriceWrong");
                    saveData.ScoreGoal = model.ScoreGoal;
                    saveData.UserProfileId = model.UserProfileId;
                    saveData.ExamPurpose = model.ExamPurpose;
                    saveData.ExamId = model.ExamId;
                    saveData.AreaId = model.AreaId;
                    var saveProfile = new SysUserProfileRegisteredIT();

                    var profileUse = profiles?.Data?.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                    if (profileUse != null)
                    {
                        var metadata = profileUse.Metadata;
                        if (metadata != null)
                        {
                            saveProfile.UserName = profiles?.Data.Email;
                            saveProfile.CandidateRegisterId = saveData.Id;
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
                            }
                            var studentCode = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.StudentCode);
                            if (studentCode != null)
                            {
                                saveProfile.StudentCode = studentCode.Value;
                            }

                            var language = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Language);
                            if (language != null)
                            {
                                saveProfile.Language = language.Value;
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
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            if (idCardNumber != null && typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                                saveProfile.IDNumber = idCardNumber.Value;
                            }
                            var oldCardID = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.OldCardID);
                            if (oldCardID != null)
                            {
                                saveProfile.OldCardID = oldCardID.Value == "1";
                            }
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
                            var birthCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.BirthCertificate);
                            if (birthCertificate != null)
                            {
                                saveProfile.BirthCertificate = birthCertificate.TextValue;
                            }
                            var schoolCertificate = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.SchoolCertificate);
                            if (schoolCertificate != null)
                            {
                                saveProfile.SchoolCertificate = schoolCertificate.TextValue;
                            }
                            var allowUsePersonalData = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.AllowUsePersonalData);
                            if (allowUsePersonalData != null)
                            {
                                saveProfile.AllowUsePersonalData = allowUsePersonalData.Value == "1";
                            }
                            var job = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Job);
                            if (job != null)
                            {
                                saveProfile.Job = job.Value;
                            }
                            saveData.ExamRegistedData = Newtonsoft.Json.JsonConvert.SerializeObject(model.ExamRegistedData);
                            unitOfWork.Repository<SysUserProfileRegisteredIT>().Insert(saveProfile);
                            unitOfWork.Repository<SysManageRegisteredCandidateIT>().Insert(saveData);
                            unitOfWork.Save();
                        }
                    }
                    return new ResponseDataObject<object>(new
                    {
                        Id = saveData.Id,
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

        public async Task<ResponseData> Get(string accessToken, Guid? areaId, Guid? headerQuaterId, Guid? examId, string? fullName, string? idNumber, string? studentCode, int? pageSize, int? pageIndex)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                var examCalendars = new List<SysExamCalendar>();
                var pagination = new Pagination(Convert.ToInt32(pageIndex), Convert.ToInt32(pageSize), 0, 0 / 10);

                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                {
                    examCalendars = unitOfWork.Repository<SysExamCalendar>().Get(p => roles.AccessDataHeaderQuater.Contains(p.HeaderQuarterId)).ToList();
                }
                else
                    return new PageableData<List<ManageRegisteredCandidateITModel>>(new List<ManageRegisteredCandidateITModel>(), pagination, Code.Success, "");

                string queryGet = $"SELECT m.Id, m.UserProfileId, m.ExamPurpose, m.ScoreGoal, m.IsTested, m.TestDate, m.AreaId, m.ExamId, m.ExamRegistedData, m.StatusPaid, m.UserId, m.Price, m.CreatedOnDate FROM [IIG.Core.Framework.EOS].[dbo].[ManageRegisteredCandidateIT] as m join [IIG.Core.Framework.EOS].[dbo].[UserProfileRegisteredIT] as u on m.Id like u.CandidateRegisterId where m.StatusPaid = {(int)StatusPaid.Paid}";
                int i = 0, skip = 0, take = 10;
                if (pageSize != null && pageIndex != null)
                {
                    skip = (int)(pageIndex - 1) * (int)pageSize;
                    take = (int)pageSize != 0 ? (int)pageSize : 10;
                }

                if (examCalendars.Count() > 0)
                {
                    i = 0;
                    queryGet += " and (";
                    foreach (var detail in examCalendars)
                    {
                        if (i == 0)
                            queryGet += $"m.ExamRegistedData like '%{detail.Id}%'";
                        else
                            queryGet += $" or m.ExamRegistedData like '%{detail.Id}%'";
                        i++;
                    }
                    queryGet += ")";
                }
                if (areaId != null)
                {
                    queryGet += $"and u.AreaId = '{areaId}'";
                }
                if (!string.IsNullOrEmpty(idNumber))
                {
                    queryGet += $"and u.IDNumber = '{idNumber}'";
                }
                if (!string.IsNullOrEmpty(fullName))
                {
                    queryGet += $"and u.FullNameOrigin like '%{fullName}%'";
                }
                if (!string.IsNullOrEmpty(studentCode))
                {
                    queryGet += $"and u.StudentCode like '%{studentCode}%'";
                }
                string queryCount = "SELECT COUNT(*) from (" + queryGet + ") as y";
                queryGet += " order by m.CreatedOnDate desc";
                queryGet += $" OFFSET {skip} ROWS FETCH NEXT {take} ROWS ONLY";
                string queryData = queryGet;
                var data = await _dapper.GetRepository().QueryAsync<SysManageRegisteredCandidateIT>(queryData);

                var result = new List<ManageRegisteredCandidateITModel>();
                var examGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken);
                var exams = new List<ExamModel>();
                if (examGet != null)
                {
                    exams = examGet.Data;
                }

                int totalCount = data.Count();
                if (data != null && data.Count() > 0)
                {
                    data = data.OrderByDescending(p => p.CreatedOnDate);

                    foreach (var item in data.ToList())
                    {
                        var userInfo = new UserInfoModel();
                        var profile = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);

                        var exam = exams?.FirstOrDefault(p => p.Id == item.ExamId);
                        result.Add(new ManageRegisteredCandidateITModel
                        {
                            Id = item.Id,
                            ExamPurpose = item.ExamPurpose,
                            IsTested = item.IsTested,
                            ScoreGoal = item.ScoreGoal,
                            TestDate = item.TestDate != null ? item.TestDate.Value.ToString("dd/MM/yyyy") : string.Empty,
                            ExamName = exam != null ? exam.Name : string.Empty,
                            FullName = profile != null ? profile.FullNameOrigin.ToUpper() : string.Empty,
                            Phone = profile != null ? profile.Phone : string.Empty,
                            Price = item.Price,
                            StudentCode = profile != null ? profile.StudentCode : string.Empty,
                            CreatedOnDate = item.CreatedOnDate.ToString("dd-MM-yyyy HH:mm:ss")
                        });
                    }
                }
                pagination = new Pagination(Convert.ToInt32(pageIndex), Convert.ToInt32(pageSize), totalCount, totalCount / 10);
                return new PageableData<List<ManageRegisteredCandidateITModel>>(result, pagination, Code.Success, "");
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
                var item = unitOfWork.Repository<SysManageRegisteredCandidateIT>().FirstOrDefault(p => p.Id == id);

                if (item == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy bản ghi");
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                {
                    var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken != null ? accessToken : string.Empty);
                    var headerQuaterQuerys = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : string.Empty);
                    List<HeadQuarterModel> headQuarters = new List<HeadQuarterModel>();
                    if (headerQuaterQuerys != null && headerQuaterQuerys.Code == Code.Success && headerQuaterQuerys.Data != null)
                    {
                        headQuarters = headerQuaterQuerys.Data;
                    }
                    var examss = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken != null ? accessToken : string.Empty);

                    var userInfo = new UserInfoITModel();
                    var profile = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                    if (profile != null)
                    {
                        userInfo.WorkAddress = profile.WorkAddress;
                        userInfo.WorkAddressWardsId = profile.WorkAddressWardsId;
                        userInfo.WorkAddressCityId = profile.WorkAddressCityId;
                        userInfo.WorkAddressDistrictId = profile.WorkAddressDistrictId;
                        userInfo.ContactAddressCityId = profile.ContactAddressCityId;
                        userInfo.ContactAddressDistrictId = profile.ContactAddressDistrictId;
                        userInfo.ContactAddressWardId = profile.ContactAddressWardId;
                        userInfo.Birthday = profile.Birthday;
                        userInfo.Email = profile.Email;
                        userInfo.FullName = profile.FullNameOrigin;
                        userInfo.Phone = profile.Phone;
                        userInfo.ContactAddress = profile.ContactAddress;
                        userInfo.Sex = profile.Sex;
                        userInfo.IDNumber = profile.IDNumber;
                        userInfo.OldCardIDNumber = profile.OldCardIDNumber;
                        userInfo.OldCardID = profile.OldCardID;
                        userInfo.DateOfCCCD = profile.DateOfCCCD;
                        userInfo.PlaceOfCCCD = profile.PlaceOfCCCD;
                        userInfo.TypeIdCard = profile.TypeIdCard;
                        userInfo.Job = profile.Job;
                        userInfo.UserName = profile.UserName;
                        userInfo.IsStudent = profile.IsStudent;
                        if (profile.IDCardFront != null)
                            userInfo.IDCardFront = profile.IDCardFront.Length > 1000 ? profile.IDCardFront : await MinioHelpers.GetBase64Minio(profile.IDCardFront);
                        if (profile.IDCardBack != null)
                            userInfo.IDCardBack = profile.IDCardBack.Length > 1000 ? profile.IDCardBack : await MinioHelpers.GetBase64Minio(profile.IDCardBack);
                        if (profile.Image3x4 != null)
                            userInfo.Image3x4 = profile.Image3x4.Length > 1000 ? profile.Image3x4 : await MinioHelpers.GetBase64Minio(profile.Image3x4);
                        if (profile.BirthCertificate != null)
                            userInfo.BirthCertificate = profile.BirthCertificate.Length > 1000 ? profile.BirthCertificate : await MinioHelpers.GetBase64Minio(profile.BirthCertificate);
                        if (profile.SchoolCertificate != null)
                            userInfo.SchoolCertificate = profile.SchoolCertificate.Length > 1000 ? profile.SchoolCertificate : await MinioHelpers.GetBase64Minio(profile.SchoolCertificate);
                    }

                    var exam = examss?.Data?.FirstOrDefault(p => p.Id == item.ExamId);
                    var listExamInfo = new List<ExamTestInfoModel>();
                    string examVersionName = string.Empty;
                    var dataRegisteds = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExamSubjectDataModel>>(item.ExamRegistedData);

                    if (dataRegisteds != null && exam != null)
                    {
                        var examVersions = exam.ExamVersion?.ToList();
                        var examScheduleIds = dataRegisteds.Select(p => p.ExamScheduleId.ToLower());
                        var examScheduleGet = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleIds.Contains(p.Id.ToString().ToLower()));
                        foreach (var data in dataRegisteds)
                        {
                            var examTest = new ExamTestInfoModel();
                            var examCalendar = examScheduleGet.FirstOrDefault(p => p.Id.ToString().ToLower() == data.ExamScheduleId.ToLower());
                            if (examCalendar != null && examVersions != null)
                            {

                                var examVersion = examVersions.FirstOrDefault(p => p.Id.ToString().ToLower() == data.ExamVersionId.ToLower());
                                if (examVersion != null)
                                {
                                    if (!string.IsNullOrEmpty(examVersionName))
                                        examVersionName += ", " + examVersion.Name;
                                    else
                                        examVersionName = examVersion?.Name;
                                }


                                listExamInfo.Add(new ExamTestInfoModel
                                {
                                    Address = headQuarters.FirstOrDefault(p => p.Id == examCalendar.HeaderQuarterId)?.Address,
                                    ExamName = exam.Name,
                                    ExamTime = examCalendar.TimeTest + " " + examCalendar.DateTest.ToString("dd/MM/yyyy"),
                                    ExamVersion = exam.ExamVersion.FirstOrDefault(p => p.Id.ToString().ToLower() == data.ExamVersionId.ToLower())?.Name,
                                    Language = data.Language == "vie" ? "Tiềng Việt" : "Tiếng Anh"
                                });
                            }

                        }
                    }

                    return new ResponseDataObject<ManageRegisteredCandidateITModel>(new ManageRegisteredCandidateITModel
                    {
                        Id = item.Id,
                        UserInfoITModel = userInfo,
                        ExamTestInfo = listExamInfo,
                        ExamName = exam?.Name,
                        Price = item.Price,
                        ExamPurpose = item.ExamPurpose,
                        IsTested = item.IsTested,
                        ScoreGoal = item.ScoreGoal,
                        TestDate = item.TestDate != null ? item.TestDate.Value.ToString("dd/MM/yyyy") : string.Empty,
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

        public async Task<ResponseData> GetHistoryRegister(string accessToken, string tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken, tenant);


                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null)
                {
                    var histories = unitOfWork.Repository<SysManageRegisteredCandidateIT>().Get(p => p.UserId == profiles.Data.Id && p.StatusPaid == (int)StatusPaid.Paid);
                    if (histories.Count() == 0)
                        return new ResponseDataError(Code.NotFound, "HistoryNotFound");
                    var examIds = histories.Select(p => p.ExamId);
                    var examGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam/GetByListId?ids=" + string.Join(",", examIds), accessToken, tenant);
                    var exams = new List<ExamModel>();
                    if (examGet != null && examGet.Data != null)
                    {
                        exams = examGet.Data;
                    }
                    var headerQuaterGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken, tenant);
                    var headQuarters = new List<HeadQuarterModel>();
                    if (headerQuaterGet != null && headerQuaterGet.Data != null)
                    {
                        headQuarters = headerQuaterGet.Data;
                    }

                    var res = new List<object>();

                    foreach (var history in histories)
                    {
                        dynamic dataHistory = new ExpandoObject();
                        var exam = exams.FirstOrDefault(p => p.Id == history.ExamId && p.IsShow);
                        var examRegistedDatas = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExamSubjectDataModel>>(history.ExamRegistedData);
                        var profile = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstOrDefault(p => p.CandidateRegisterId == history.Id);
                        if (profile != null && exam != null && examRegistedDatas != null && examRegistedDatas.Any())
                        {
                            dataHistory.id = history.Id;
                            dataHistory.examName = exam.Name;
                            dataHistory.fullName = profile.FullName;
                            dataHistory.birthDay = profile.Birthday.ToString("dd/MM/yyyy");
                            dataHistory.dateRegisted = history.CreatedOnDate.ToString("dd/MM/yyyy");
                            var paymentRequest = unitOfWork.Repository<SysPaymentITRequestLog>().FirstOrDefault(p => p.CandidateId == history.Id);
                            if (paymentRequest != null)
                            {
                                var paymentRes = unitOfWork.Repository<SysPaymentITResponseLog>().FirstOrDefault(p => p.PaymentRequestId == paymentRequest.Id);
                                if (paymentRes != null)
                                {
                                    dataHistory.trans = paymentRes.TransactionNo;
                                    dataHistory.paymentDate = paymentRes.PayDate != null ? paymentRes.PayDate.Value.ToString("dd/MM/yyyy") : string.Empty;
                                }
                            }
                            var examScheduleIds = examRegistedDatas.Select(p => p.ExamScheduleId.ToLower());
                            var examScheduleGet = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleIds.Contains(p.Id.ToString().ToLower()));
                            var headQuarterids = examScheduleGet.Select(p => p.HeaderQuarterId);
                            var examVersion = exam.ExamVersion?.ToList();
                            var dataRegisted = new List<object>();
                            for (int i = 0; i < examIds.Count(); i++)
                            {
                                if (examRegistedDatas[i] != null)
                                {
                                    var getExamVersion = examVersion?.FirstOrDefault(p => p.Id.ToString().ToLower() == examRegistedDatas[i].ExamVersionId.ToLower() && p.IsShow);
                                    var examShedule = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(p => p.Id.ToString().ToLower() == examRegistedDatas[i].ExamScheduleId.ToLower());
                                    var headQuarter = headerQuaterGet?.Data?.FirstOrDefault(p => p.Id == examShedule?.HeaderQuarterId);
                                    dynamic examInfo = new
                                    {
                                        examVersionName = getExamVersion?.Name,
                                        language = examRegistedDatas[i].Language,
                                        dateTest = examShedule?.DateTest,
                                        timeTest = examShedule?.TimeTest,
                                        address = headQuarter?.Address
                                    };
                                    dataRegisted.Add(examInfo);
                                }
                            }
                            dataHistory.examInfo = dataRegisted;
                        }

                        res.Add(dataHistory);
                    }
                    return new ResponseDataObject<List<object>>(res, Code.Success, string.Empty);
                }
                return new ResponseDataError(Code.NotFound, "UserIncorect");
            }
            catch (Exception exception)
            {
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var ticket = new TicketModel();

                var exitsData = unitOfWork.Repository<SysManageRegisteredCandidateIT>().FirstOrDefault(p => p.Id == id);
                if (exitsData == null)
                    return new ResponseDataError(Code.NotFound, "IDNotFound");

                var userRegisterProfile = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstOrDefault(x => x.CandidateRegisterId == id);
                if (userRegisterProfile == null)
                    return new ResponseDataError(Code.NotFound, "ProfileNotFound");

                var examGet = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, "Exam/" + exitsData.ExamId.ToString(), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var wardGet = await HttpHelper.Get<ResponseDataObject<WardModel>>(apiBasicUriCatalog, "Ward/" + userRegisterProfile.ContactAddressWardId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var districtGet = await HttpHelper.Get<ResponseDataObject<DistrictModel>>(apiBasicUriCatalog, "District/" + userRegisterProfile.ContactAddressDistrictId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                var cityGet = await HttpHelper.Get<ResponseDataObject<ProvinceModel>>(apiBasicUriCatalog, "Province/" + userRegisterProfile.ContactAddressCityId, accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);

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
                ticket.SubmissionTime = exitsData.CreatedOnDate.ToString("dd/MM/yyyy HH:mm:ss");
                ticket.FullName = userRegisterProfile.FullNameOrigin.ToUpper();
                ticket.OldCardIDNumber = !string.IsNullOrEmpty(userRegisterProfile.OldCardIDNumber) ? userRegisterProfile.OldCardIDNumber : string.Empty;
                ticket.NumberOfIdCard = !string.IsNullOrEmpty(userRegisterProfile.IDNumber) ? userRegisterProfile.IDNumber : string.Empty;
                ticket.Sex = userRegisterProfile.Sex;
                ticket.Dob = userRegisterProfile.Birthday.ToString("dd/MM/yyyy");
                ticket.Phone = userRegisterProfile.Phone;
                ticket.Address = userRegisterProfile.ContactAddress + " - " + (wardGet != null ? wardGet.Data?.Name : string.Empty) + " - " + (districtGet != null ? districtGet.Data?.Name : string.Empty) + " - " + (cityGet != null ? cityGet.Data?.Name : string.Empty);
                ticket.Email = userRegisterProfile.Email;
                ticket.Job = !string.IsNullOrEmpty(userRegisterProfile.Job) ? Utils.ConvertJob(userRegisterProfile.Job, null) : string.Empty;
                ticket.AddressWork = (!string.IsNullOrEmpty(userRegisterProfile.WorkAddress) ? userRegisterProfile.WorkAddress : string.Empty) + " - " + (wardWGet != null ? wardWGet.Data?.Name : string.Empty) + " - " + (districtWGet != null ? districtWGet.Data?.Name : string.Empty) + " - " + (cityWGet != null ? cityWGet.Data?.Name : string.Empty); ;
                ticket.PurposeTest = Utils.ConvertPurpose(exitsData.ExamPurpose);
                ticket.PurposePoint = exitsData.ScoreGoal.ToString();
                ticket.IsTested = exitsData.IsTested;
                ticket.Date = exitsData.CreatedOnDate.ToString("dd");
                ticket.Month = exitsData.CreatedOnDate.ToString("MM");
                ticket.Year = exitsData.CreatedOnDate.ToString("yyyy");
                ticket.DateTestRecent = exitsData.TestDate != null ? exitsData.TestDate.Value.ToString("dd/MM/yyyy") : string.Empty;
                ticket.ExamName = examGet.Data.Name;
                var examIds = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExamSubjectDataModel>>(exitsData.ExamRegistedData);
                string row = string.Empty;
                if (examIds != null && examIds.Count > 0)
                {
                    var examScheduleIds = examIds.Select(p => p.ExamScheduleId.ToLower());
                    var examScheduleGet = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleIds.Contains(p.Id.ToString().ToLower()));
                    var headQuarterids = examScheduleGet.Select(p => p.HeaderQuarterId);
                    var headerQuaterGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter/GetByListId?ids=" + string.Join(",", headQuarterids), accessToken != null ? accessToken : string.Empty, tenant != null ? tenant : string.Empty);
                    if (headerQuaterGet == null || (headerQuaterGet != null && headerQuaterGet.Data == null))
                        return new ResponseDataError(Code.ServerError, "PlaceTestNotFound");
                    var examVersion = examGet?.Data?.ExamVersion?.ToList();
                    for (int i = 0; i < examIds.Count(); i++)
                    {
                        if (examIds[i] != null)
                        {
                            var getExamVersion = examVersion?.FirstOrDefault(p => p.Id.ToString().ToLower() == examIds[i].ExamVersionId.ToLower());
                            var examShedule = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(p => p.Id.ToString().ToLower() == examIds[i].ExamScheduleId.ToLower());
                            var headQuarter = headerQuaterGet?.Data?.FirstOrDefault(p => p.Id == examShedule?.HeaderQuarterId);

                            row += "<tr>\r\n<td class=\"tbsjk\">" + (i + 1) + "</td>\r\n<td class=\"tbsjk\">" + ticket.ExamNameIT + "</td>\r\n<td class=\"tbsjk\">" + getExamVersion?.Name + "</td>\r\n<td class=\"tbsjk\">" + examIds[i].Language + "</td>\r\n<td class=\"tbsjk\">" + examShedule?.TimeTest + " " + examShedule?.DateTest.ToString("dd/MM/yyyy") + "</td>\r\n<td class=\"tbsjk\">" + headQuarter?.Address + "</td>\r\n</tr>";
                        }
                    }
                    ticket.ExamSChedule = row;
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

                var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken, tenant);
                List<ExamWorkShiftModel> examWorkShiftModels = new List<ExamWorkShiftModel>();
                if (examWorkShiftGets != null && examWorkShiftGets.Data != null)
                    examWorkShiftModels = examWorkShiftGets.Data;
                else
                    return new ResponseDataError(Code.NotFound, "ExamWorkShiftNotFound");

                var headQuarters = new List<HeadQuarterModel>();
                if (headQuarterGets.Data != null)
                {
                    headQuarters = headQuarterGets.Data.Where(p => p.CanRegisterExam).ToList();
                }
                var examCalendars = unitOfWork.Repository<SysExamCalendar>().Get(p => headQuarters.Select(o => o.Id).Contains(p.HeaderQuarterId) && p.ExamId.ToLower().Contains(exam.Id.ToString().ToLower()) && DateTime.Now.Date <= p.EndDateRegister.Date && p.Status == 0).ToList();
                var examSchedules = new List<ExpandoObject>();
                var examRoomGet = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, "ExamRoom", accessToken, tenant);
                var examRooms = new List<ExamRoomModel>();
                if (examRoomGet != null && examRoomGet.Data != null)
                {
                    examRooms = examRoomGet.Data;
                }


                foreach (var item in examCalendars)
                {
                    var duCho = unitOfWork.Repository<SysHoldPosition>().Get(p => p.ExamCalendarId == item.Id).Sum(p => p.Quantity);
                    var registed = unitOfWork.Repository<SysManageRegisteredCandidateIT>().Get(p => p.StatusPaid == (int)StatusPaid.Paid && p.ExamScheduleString.Contains(item.Id.ToString().ToLower())).Count();
                    if ((registed + duCho) < item.QuantityCandidate)
                    {
                        dynamic examSchedule = new ExpandoObject();
                        examSchedule.id = item.Id;
                        examSchedule.headerQuarterId = item.HeaderQuarterId;
                        examSchedule.headerQuarterName = headQuarters.FirstOrDefault(p => p.Id == item.HeaderQuarterId)?.Name;
                        examSchedule.room = item.Room;
                        examSchedule.roomName = examRooms.FirstOrDefault(p => p.Id == item.Room)?.Name;
                        examSchedule.dateTest = item.DateTest;
                        examSchedule.endDateRegister = item.EndDateRegister;
                        examSchedule.examShift = item.ExamShift;
                        examSchedule.examShiftName = examWorkShiftModels.FirstOrDefault(p => p.Id == item.ExamShift)?.Name;
                        examSchedule.timeTest = item.TimeTest;
                        examSchedule.examId = item.ExamId;
                        examSchedule.quantityCandidate = item.QuantityCandidate;
                        examSchedule.status = item.Status;
                        examSchedules.Add(examSchedule);
                    }
                }
                var examSubjects = await HttpHelper.Get<ResponseDataObject<List<ExamSubjectModel>>>(apiBasicUriCatalog, "ExamSubject/GetByExamId/" + exam?.Id, accessToken, tenant);
                if (examSubjects != null && examSubjects.Data != null && exam != null)
                {
                    var res = new List<ExpandoObject>();
                    foreach (var examSubject in examSubjects.Data.Where(p => p.Status))
                    {
                        dynamic examSubjectOut = new ExpandoObject();
                        examSubjectOut.id = examSubject.Id;
                        examSubjectOut.examSubjectName = examSubject.Name;
                        var examVersion = exam.ExamVersion?.Where(p => p.ExamSubjectId == examSubject.Id && p.IsShow).ToList();
                        examSubjectOut.examVersion = examVersion;
                        res.Add(examSubjectOut);

                    }
                    return new ResponseDataObject<object>(new
                    {
                        Exam = exam,
                        ExamSubject = res,
                        ExamSchedules = examSchedules,
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

        public async Task<ResponseData> GetInfoAfterPaid(Guid id, string accessToken, string tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysManageRegisteredCandidateIT>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "DataNotFound");

                var profile = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstOrDefault(p => p.CandidateRegisterId == id);

                var exam = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, $"Exam/{existData.ExamId}", accessToken, tenant);
                if (exam == null)
                    return new ResponseDataError(Code.BadRequest, "ExamNotFound");
                var examName = exam?.Data?.Name ?? string.Empty;

                var examIds = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExamSubjectDataModel>>(existData.ExamRegistedData);
                string row = string.Empty;
                if (examIds != null && examIds.Count > 0)
                {
                    var examScheduleIds = examIds.Select(p => p.ExamScheduleId.ToLower());
                    var examScheduleGet = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleIds.Contains(p.Id.ToString().ToLower()));
                    var headQuarterids = examScheduleGet.Select(p => p.HeaderQuarterId);
                    var headerQuaterGet = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter/GetByListId?ids=" + string.Join(",", headQuarterids), accessToken, tenant);
                    if (headerQuaterGet == null || (headerQuaterGet != null && headerQuaterGet.Data == null))
                        return new ResponseDataError(Code.ServerError, "PlaceTestNotFound");
                    var examInfoList = new List<ExpandoObject>();
                    foreach (var item in examIds)
                    {
                        dynamic examInfo = new ExpandoObject();
                        var examVersion = exam?.Data?.ExamVersion?.ToList();
                        var getExamVersion = examVersion?.FirstOrDefault(p => p.Id.ToString().ToLower() == item.ExamVersionId.ToLower());
                        var examShedule = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(p => p.Id.ToString().ToLower() == item.ExamScheduleId.ToLower());
                        var headQuarter = headerQuaterGet?.Data?.FirstOrDefault(p => p.Id == examShedule?.HeaderQuarterId);
                        examInfo.examVersionName = getExamVersion?.Name;
                        examInfo.language = item.Language;
                        examInfo.dateTest = examShedule?.DateTest;
                        examInfo.timeTest = examShedule?.TimeTest;
                        examInfo.address = headQuarter?.Address;
                        examInfoList.Add(examInfo);
                    }

                    return new ResponseDataObject<object>(new
                    {
                        fullName = profile?.FullName,
                        birthDay = profile?.Birthday.ToString("dd/MM/yyyy"),
                        examName = exam?.Data?.Name,
                        examInfoList = examInfoList,
                    });
                }
                return new ResponseDataError(Code.BadRequest, "DataNull");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
