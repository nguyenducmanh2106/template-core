using AutoMapper;
using Backend.Business.ManageRegisteredCandidates;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static Backend.Infrastructure.Utils.Constant;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Linq;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Backend.Business.ManageRegisteredCandidateTopik;
using System.Collections.Generic;
using System.Linq.Expressions;
using Backend.Business.DividingRoom;
using Backend.Infrastructure.Dapper.Interfaces;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using System;
using DocumentFormat.OpenXml.Drawing.Charts;
using System.Dynamic;
using Backend.Business.Metadata;
using IIG.Core.Framework.ICom.Infrastructure.Utils;
using System.Data;
using System.Drawing.Printing;
using Backend.Business.Mailing;

namespace Backend.Business.ManageRegisteredCandidateAP
{
    public class ManageRegisteredCandidateAPHandler : IManageRegisteredCandidateAPHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");
        private static readonly string apiBasicUriUser = Backend.Infrastructure.Utils.Utils.GetConfig("User");
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private readonly IDapperUnitOfWork _dapper;

        public ManageRegisteredCandidateAPHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IDapperUnitOfWork dapper, IEmailTemplateHandler emailTemplateHandler)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _dapper = dapper;
            _emailTemplateHandler = emailTemplateHandler;
        }

        public async Task<ResponseData> Create(ManageRegisteredCandidateAPModel model, string accessToken, string tenant)
        {
            try
            {
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken);

                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var saveProfile = new SysUserProfileRegisteredAP();
                    var saveData = new SysManageRegistedCandidateAP();
                    if (profiles.Data.Id != model.UserId)
                    {
                        return new ResponseDataError(Code.Forbidden, "ProfileIncorrect");
                    }
                    string SBD = string.Empty;
                    saveData.Id = Guid.NewGuid();
                    saveData.IsPaid = (int)Constant.StatusPaid.UnPaid;
                    saveData.UserId = model.UserId;
                    saveData.Language = model.Language;
                    saveData.UserProfileId = model.UserProfileId;
                    string scheduleDetailString = string.Empty;
                    string priceString = string.Empty;
                    var examScheduleDetails = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => model.ScheduleDetailIds.ToLower().Contains(p.Id.ToString().ToLower())).ToList();
                    if (examScheduleDetails == null || examScheduleDetails.Count() == 0)
                        return new ResponseDataError(Code.NotFound, "ExamScheduleDetailsNotFound");

                    var examSchedules = examScheduleDetails.Select(p => p.ExamScheduleId).Distinct().ToList();
                    var schedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => examSchedules.Contains(p.Id));
                    foreach (var item in examScheduleDetails)
                    {
                        var schedule = schedules.FirstOrDefault(p => p.Id == item.ExamScheduleId);
                        if (schedule != null)
                        {
                            var scheduleCheck = schedules.Where(p => p.ExamDate == schedule.ExamDate);
                            foreach (var checkE in scheduleCheck)
                            {
                                if (scheduleCheck.Count(p => p.ExamWorkShiftId == checkE.ExamWorkShiftId) > 1)
                                    return new ResponseDataError(Code.Forbidden, "CanNotChoose2WorkShiftInTime");
                            }
                        }
                    }
                    // check apid
                    #region checkAPID
                    var checkExistSBD = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.IsPaid == (int)StatusPaid.Paid && p.UserId == model.UserId && !string.IsNullOrEmpty(p.SBD));
                    if (checkExistSBD != null)
                    {
                        var firstItem = schedules.FirstOrDefault();
                        if (firstItem == null)
                            return new ResponseDataError(Code.NotFound, "ExamScheduleNotFound");

                        var examPeriod = unitOfWork.Repository<SysExamPeriodAP>().FirstOrDefault(p => p.Id == firstItem.ExamPeriodId);
                        if (examPeriod == null)
                            return new ResponseDataError(Code.NotFound, "ExamPeriodNotFound");

                        var getExamScheduleCheck = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriod.Id).Select(p => p.Id).ToList();
                        var detailsCheck = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => getExamScheduleCheck.Contains(p.ExamScheduleId));
                        foreach (var itemn in detailsCheck)
                        {
                            var managerRegistedGet = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.IsPaid == (int)StatusPaid.Paid && p.SBD != null && p.ScheduleDetailIds.ToLower().Contains(itemn.Id.ToString().ToLower()));
                            if (managerRegistedGet != null && !string.IsNullOrEmpty(managerRegistedGet.SBD))
                            {
                                saveData.SBD = managerRegistedGet.SBD;
                                break;
                            }
                        }
                    }

                    #endregion
                    var getExamScheduleDetails = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examSchedules.Contains(p.ExamScheduleId));
                    foreach (var item in getExamScheduleDetails)
                    {
                        if (unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.UserId == profiles.Data.Id && p.IsPaid == (int)StatusPaid.Paid && p.ScheduleDetailIds.ToLower().Contains(item.Id.ToString().ToLower())) != null)
                            return new ResponseDataError(Code.Forbidden, "TestScheduleRegisted");
                    }

                    var examIds = string.Join(",", examScheduleDetails.Select(p => p.ExamId).ToArray());
                    var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam/GetByListId?ids=" + examIds, accessToken, tenant);
                    List<ExamModel> exams = new List<ExamModel>();
                    if (examGets != null && examGets.Data != null)
                        exams = examGets.Data;

                    foreach (var item in examScheduleDetails)
                    {
                        var exam = exams.FirstOrDefault(p => p.Id == item.ExamId);
                        if (exam != null)
                        {
                            if (priceString.Length > 0)
                            {
                                priceString += "," + exam.Price.ToString();
                                scheduleDetailString += "," + item.Id.ToString();
                            }
                            else
                            {
                                priceString += exam.Price.ToString();
                                scheduleDetailString += item.Id.ToString();
                            }
                        }
                        else
                            return new ResponseDataError(Code.NotFound, "ExamNotFound");
                    }
                    saveData.ScheduleDetailIds = scheduleDetailString;
                    saveData.Price = priceString;

                    var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken, tenant);
                    List<ExamWorkShiftModel> examWorkShiftModels = new List<ExamWorkShiftModel>();
                    if (examWorkShiftGets != null && examWorkShiftGets.Data != null)
                        examWorkShiftModels = examWorkShiftGets.Data;
                    else
                        return new ResponseDataError(Code.NotFound, "ExamWorkShiftNotFound");

                    var profileUse = profiles.Data.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                    if (profileUse != null)
                    {
                        var metadata = profileUse.Metadata;
                        if (metadata != null)
                        {
                            saveProfile.UserName = profiles.Data.Email;
                            saveProfile.CandidateRegisterId = saveData.Id;
                            string fullNameOrigin = string.Empty;

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
                            var firstName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.FirstName);
                            if (firstName != null)
                            {
                                fullNameOrigin = firstName.Value.Trim();
                                string name = firstName.Value.Trim();
                                Regex trimmer = new Regex(@"\s\s+");
                                name = trimmer.Replace(name, " ");
                                saveProfile.FirstName = Utils.RemoveUnicode(name);
                            }
                            var lastName = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.LastName);
                            if (lastName != null)
                            {
                                fullNameOrigin += " " + lastName.Value.Trim();
                                string name = lastName.Value.Trim();
                                Regex trimmer = new Regex(@"\s\s+");
                                name = trimmer.Replace(name, " ");
                                saveProfile.LastName = Utils.RemoveUnicode(name);
                            }
                            saveProfile.FullNameOrigin = fullNameOrigin;
                            var phone = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Phone);
                            if (phone != null)
                            {
                                saveProfile.Phone = phone.Value;
                            }
                            var gender = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Gender);
                            if (gender != null)
                            {
                                saveProfile.Sex = gender.Value;
                            }
                            var typeIdCard = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.TypeIdCard);
                            var idCardNumber = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.IdCardNumber);
                            if (idCardNumber != null && typeIdCard != null)
                            {
                                saveProfile.TypeIdCard = typeIdCard.Value;
                                saveProfile.IDNumber = idCardNumber.Value;
                            }
                            var school = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.School);
                            if (school != null)
                            {
                                saveProfile.School = school.Value;
                            }
                            var classS = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.Class);
                            if (classS != null)
                            {
                                saveProfile.Class = classS.Value;
                            }
                            var parentPhone = metadata.FirstOrDefault(p => p.MetadataCode == Constant.Metadata.ParentPhone);
                            if (parentPhone != null)
                            {
                                saveProfile.ParentPhone = parentPhone.Value;
                            }

                            unitOfWork.Repository<SysUserProfileRegisteredAP>().Insert(saveProfile);
                            unitOfWork.Repository<SysManageRegistedCandidateAP>().Insert(saveData);
                            unitOfWork.Save();
                        }
                    }

                    return new ResponseDataObject<object>(new { Id = saveData.Id }, Code.Success, "");
                }
                return new ResponseDataError(Code.NotFound, "UserLoginIncorect");
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
                var dataEntitiesInDb = unitOfWork.Repository<SysExamPeriodAP>().Get(x => x.Id == id);
                if (dataEntitiesInDb == null)
                    return new ResponseDataError(Code.NotFound, "NotFound");

                unitOfWork.Repository<SysExamPeriodAP>().Delete(dataEntitiesInDb);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Get(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone, string accessToken, int? pageIndex, int? pageSize)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var examScheduleIds = new List<Guid>();
                var examPeriodRecent = unitOfWork.Repository<SysExamPeriodAP>().FirstOrDefault(p => p.IsOpen);
                var examSchedules = new List<SysExamScheduleAP>();

                if (examPeriodId != null)
                {
                    examSchedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriodId).ToList();
                }
                else
                {
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriodAP>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examSchedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).ToList();
                }
                examScheduleIds = examSchedules.Select(p => p.Id).ToList();
                var examDetails = examScheduleId != null ? unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => p.ExamScheduleId == examScheduleId).ToList() : unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examScheduleIds.Contains(p.ExamScheduleId)).ToList();
                var examIds = string.Join(",", examDetails.Select(p => p.ExamId).ToArray());
                var examDetailStrings = examDetails.Select(p => p.Id.ToString()).ToList();
                var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken);
                List<ExamWorkShiftModel> examWorkShiftModels = new List<ExamWorkShiftModel>();
                if (examWorkShiftGets != null && examWorkShiftGets.Data != null)
                    examWorkShiftModels = examWorkShiftGets.Data;
                else
                    return new ResponseDataError(Code.NotFound, "ExamWorkShiftNotFound");

                string queryGet = $"SELECT m.Id, m.IsPaid, m.Price, m.SBD, m.ScheduleDetailIds, m.UserId, m.UserProfileId, m.CreatedOnDate FROM [IIG.Core.Framework.EOS].[dbo].[ManageRegistedCandidateAPs] as m join [IIG.Core.Framework.EOS].[dbo].[UserProfileRegisteredAPs] as  u on m.Id = u.CandidateRegisterId where m.IsPaid = {(int)StatusPaid.Paid}";
                int i = 0, skip = 0, take = 10;
                if (pageSize != null && pageIndex != null)
                {
                    skip = (int)(pageIndex - 1) * (int)pageSize;
                    take = (int)pageSize != 0 ? (int)pageSize : 10;
                }

                bool checkAndOr = false;
                if (examDetailStrings.Count() > 0)
                {
                    i = 0;
                    queryGet += " and (";
                    foreach (var detail in examDetailStrings)
                    {
                        if (i == 0)
                            queryGet += $"m.ScheduleDetailIds like '%{detail}%'";
                        else
                            queryGet += $" or m.ScheduleDetailIds like '%{detail}%'";
                        i++;
                        checkAndOr = true;
                    }
                    queryGet += ")";
                }
                if (examId != null)
                {
                    var detailIds = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => p.ExamId == examId).Select(p => p.Id).ToList();
                    i = 0;
                    if (detailIds.Count() > 1)
                    {
                        queryGet += "(";
                    }
                    foreach (var detail in detailIds)
                    {
                        if (i == 0)
                            queryGet += $"m.ScheduleDetailIds like '%{detail}%'";
                        else
                            queryGet += $" or m.ScheduleDetailIds like '%{detail}%'";
                        i++;
                        checkAndOr = true;
                    }
                    if (detailIds.Count() > 1)
                    {
                        queryGet += ")";
                    }
                }
                if (sbd != null)
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"m.SBD = '{sbd}'";
                    checkAndOr = true;
                }

                if (!string.IsNullOrEmpty(idNumber))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.IDNumber = '{idNumber}'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(fullname))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.FullNameOrigin like '%{fullname}%'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(email))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.Email like '%{email}%'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(phone))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.Phone like '%{phone}%'";
                    checkAndOr = true;
                }
                string queryCount = "SELECT COUNT(*) from (" + queryGet + ") as y";
                queryGet += " order by m.CreatedOnDate desc";
                queryGet += $" OFFSET {skip} ROWS FETCH NEXT {take} ROWS ONLY";
                string queryData = queryGet;
                var data = await _dapper.GetRepository().QueryAsync<SysManageRegistedCandidateAP>(queryData);
                var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam/GetByListId?ids=" + examIds, accessToken);
                List<ExamModel> exams = new List<ExamModel>();
                if (examGets != null && examGets.Data != null)
                    exams = examGets.Data;

                var result = new List<UpdateManageRegisteredCandidateAPAdminModel>();
                var totalCount = Convert.ToInt32(_dapper.GetRepository().Query<int>(queryCount).FirstOrDefault());
                if (examPeriodRecent != null && data != null && data.Count() > 0)
                {
                    foreach (var item in data)
                    {
                        var profile = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        string examString = string.Empty;
                        long price = 0;
                        int stt = 1, iu = 0;
                        var examInfo = new List<ExamInfoModel>();
                        foreach (string pr in item.Price.Split(","))
                        {
                            price += Convert.ToInt64(pr);
                        }
                        foreach (string detail in item.ScheduleDetailIds.Split(','))
                        {
                            var getDetail = examDetails.FirstOrDefault(p => p.Id.ToString().ToLower() == detail.ToLower());
                            if (getDetail != null)
                            {
                                var getSchedule = examSchedules.FirstOrDefault(p => p.Id == getDetail.ExamScheduleId);
                                var exam = exams.FirstOrDefault(p => p.Id == getDetail.ExamId);
                                if (exam != null && getSchedule != null)
                                {
                                    if (examString.Length > 0)
                                        examString += "; " + exam.Name;
                                    else
                                        examString += exam.Name;
                                    var examWorkshift = examWorkShiftModels.FirstOrDefault(p => p.Id == getSchedule.ExamWorkShiftId);
                                    examInfo.Add(new ExamInfoModel
                                    {
                                        STT = stt,
                                        Code = exam.Code,
                                        Name = exam.Name,
                                        DateTest = getSchedule.ExamDate.ToString("dd/MM/yyyy"),
                                        TimeTest = !string.IsNullOrEmpty(getSchedule.ExamTime) ? getSchedule.ExamTime : string.Empty,
                                        Price = item.Price.Split(",")[iu],
                                        ExamWorkshift = examWorkshift != null ? (!string.IsNullOrEmpty(examWorkshift.Name) ? examWorkshift.Name : string.Empty) : string.Empty
                                    });
                                    stt++;
                                    iu++;
                                }
                            }
                        }
                        result.Add(new UpdateManageRegisteredCandidateAPAdminModel
                        {
                            SBD = item.SBD,
                            Birthday = profile.Birthday.ToString("dd/MM/yyyy"),
                            Email = profile.Email,
                            Sex = profile.Sex,
                            ExamInfo = examInfo,
                            TypeIDCard = profile.TypeIdCard,
                            IDCardNumber = profile.IDNumber,
                            Class = profile.Class,
                            School = profile.School,
                            ExamName = examString,
                            Id = item.Id,
                            ExamPeriodName = examPeriodRecent.Name,
                            CreatedOnDate = item.CreatedOnDate.ToString("dd/MM/yyyy HH:mm:ss"),
                            Phone = profile != null ? profile.Phone : string.Empty,
                            ParentPhone = profile != null ? profile.ParentPhone : string.Empty,
                            FirstName = profile != null ? profile.FirstName : string.Empty,
                            LastName = profile != null ? profile.LastName : string.Empty,
                            Price = price.ToString()
                        });
                    }
                }
                var pagination = new Pagination(Convert.ToInt32(pageIndex), Convert.ToInt32(pageSize), totalCount, totalCount / 10);
                return new PageableData<List<UpdateManageRegisteredCandidateAPAdminModel>>(result, pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetById(Guid id, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exitsItem = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.Id == id);
                if (exitsItem == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                var profile = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == exitsItem.Id);
                if (profile == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy profile");

                var data = new UpdateManageRegisteredCandidateAPAdminModel();
                data.SBD = exitsItem.SBD;
                data.IDCardNumber = profile.IDNumber;
                data.Birthday = profile.Birthday.ToString("dd/MM/yyyy");
                data.FirstName = profile.FirstName;
                data.LastName = profile.LastName;
                data.School = profile.School;
                data.Class = profile.Class;
                data.TypeIDCard = profile.TypeIdCard;
                data.Sex = profile.Sex;

                return new ResponseDataObject<UpdateManageRegisteredCandidateAPAdminModel>(data, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> UpdateApId(Guid id, string apId, string accessToken, string tenant)
        {
            try
            {
                if (id.ToString().ToLower() == "b197e04a-a7cc-4db5-931d-7615c3667503" || id.ToString().ToLower() == "af1c49aa-b703-4ba4-8a32-98068c437aca" || id.ToString().ToLower() == "ea17ff23-8c21-4d64-b511-48da95169465")
                    return new ResponseDataError(Code.BadRequest, "CanNotUpdate");
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken);

                using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var exitsItem = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.Id == id && p.UserId == profiles.Data.Id);
                    if (exitsItem == null)
                        return new ResponseDataError(Code.BadRequest, "IDNotFound");
                    var userProfile = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == exitsItem.Id);

                    if (userProfile == null)
                        return new ResponseDataError(Code.BadRequest, "ProfileNotFound");

                    exitsItem.SBD = apId;
                    var model = new EmailTestApModel();
                    model.FullName = userProfile.FullNameOrigin;
                    model.Birthday = userProfile.Birthday.ToString("dd/MM/yyyy");
                    var request = unitOfWork.Repository<SysPaymentApRequestLog>().FirstOrDefault(p => p.TxnRef == exitsItem.Id);
                    if (request != null)
                    {
                        var response = unitOfWork.Repository<SysPaymentApResponseLog>().FirstOrDefault(p => p.PaymentRequestId == request.Id);
                        if (response != null)
                        {
                            model.Trans = !string.IsNullOrEmpty(response.TransactionNo) ? response.TransactionNo : string.Empty;
                            model.DateTimePaid = response.DateCreateRecord.ToString("dd/MM/yyyy HH:mm:ss");
                        }
                    }

                    var examScheduleDetails = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => exitsItem.ScheduleDetailIds.ToLower().Contains(p.Id.ToString().ToLower())).ToList();
                    if (examScheduleDetails == null || examScheduleDetails.Count() == 0)
                        return new ResponseDataError(Code.NotFound, "ExamScheduleDetailsNotFound");

                    #region Send email
                    var examSchedules = examScheduleDetails.Select(p => p.ExamScheduleId).Distinct().ToList();
                    var examScheduleAPs = unitOfWork.Repository<SysExamScheduleAP>().Get(p => examSchedules.Contains(p.Id));
                    var getExamScheduleDetails = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examSchedules.Contains(p.ExamScheduleId));
                    var examIds = string.Join(",", examScheduleDetails.Select(p => p.ExamId).ToArray());
                    var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam/GetByListId?ids=" + examIds, accessToken, tenant);
                    List<ExamModel> exams = new List<ExamModel>();
                    if (examGets != null && examGets.Data != null)
                        exams = examGets.Data;
                    string row = string.Empty;
                    foreach (var item in examScheduleDetails)
                    {
                        var examSchedule = examScheduleAPs.FirstOrDefault(p => p.Id == item.ExamScheduleId);
                        var exam = exams.FirstOrDefault(p => p.Id == item.ExamId);
                        if (exam != null && examSchedule != null)
                        {
                            row += "<tr><td style=\"border: 1px solid #dddddd; border-top: none; text-align: left; padding: 8px;\">" + exam.Name + "</td>" +
                                "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + exam.Code + "</td>" +
                                "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + examSchedule.ExamTime + " " + examSchedule.ExamDate.ToString("dd/MM/yyyy") + "</td></tr>";
                        }
                    }
                    model.TestInfo = row;
                    string fileName = "email-payment-confirmation-ap-update";
                    string title = "[IIG Việt Nam] Thông báo: Thanh toán và đăng ký thành công bài thi AP";
                    if (exitsItem.Language == "en")
                    {
                        fileName = "email-payment-confirmation-ap-update-en";
                        title = "[IIG Vietnam] Important: Successful Payment and Registration for AP Exam";
                    }
                    string templateBody = _emailTemplateHandler.GenerateEmailTemplate(fileName, model);
                    var email = new EmailRequest()
                    {
                        ToAddress = userProfile.Email,
                        Body = templateBody,
                        HTMLBody = templateBody,
                        Subject = title,
                        ToEmail = new List<string> { userProfile.Email }
                    };

                    await _emailTemplateHandler.SendOneZetaEmail(email);
                    #endregion
                    #region UpdateAPID
                    var firstItem = examScheduleAPs.FirstOrDefault();
                    if (firstItem != null)
                    {
                        var examPeriod = unitOfWork.Repository<SysExamPeriodAP>().FirstOrDefault(p => p.Id == firstItem.ExamPeriodId);
                        if (examPeriod != null)
                        {
                            var examScheduleGet = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriod.Id);
                            if (examScheduleGet != null)
                            {
                                var examSCheduleDetailsGet = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examScheduleGet.Select(l => l.Id).Contains(p.ExamScheduleId));
                                var managerRegistedUserGet = unitOfWork.Repository<SysManageRegistedCandidateAP>().Get(p => p.IsPaid == (int)StatusPaid.Paid && p.UserId == profiles.Data.Id);

                                foreach (var detail in examSCheduleDetailsGet)
                                {
                                    var checkExist = managerRegistedUserGet.FirstOrDefault(p => p.ScheduleDetailIds.ToLower().Contains(detail.Id.ToString().ToLower()));
                                    if (checkExist != null)
                                    {
                                        checkExist.SBD = apId;
                                        unitOfWork.Repository<SysManageRegistedCandidateAP>().Update(checkExist);
                                    }
                                }
                            }
                        }
                    }
                    #endregion

                    unitOfWork.Repository<SysManageRegistedCandidateAP>().Update(exitsItem);
                    unitOfWork.Save();
                    return new ResponseData(Code.Success, "");
                }
                return new ResponseDataError(Code.Forbidden, "ProfileIncorect");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        public async Task<ResponseData> GetInfoAfterPaidAsync(Guid id, string accessToken, string tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exitsItem = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(p => p.Id == id);
                if (exitsItem == null)
                    return new ResponseDataError(Code.NotFound, "IDNotFound");

                var profile = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == exitsItem.Id);
                if (profile == null)
                    return new ResponseDataError(Code.BadRequest, "ProfileNotFound");

                var examScheduleDetails = exitsItem.ScheduleDetailIds.ToLower().Split(',').ToList();
                if (examScheduleDetails == null || examScheduleDetails.Count() == 0)
                    return new ResponseDataError(Code.NotFound, "ExamScheduleDetailsNotFound");

                var examScheduleDetailss = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examScheduleDetails.Contains(p.Id.ToString().ToLower())).ToList();
                var examSchedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => examScheduleDetailss.Select(o => o.ExamScheduleId).Contains(p.Id));
                if (examScheduleDetailss.Count() > 0)
                {
                    string examsString = string.Empty;
                    var examIds = string.Join(",", examScheduleDetailss.Select(p => p.ExamId).ToArray());
                    var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam/GetByListId?ids=" + examIds, accessToken, tenant);
                    List<ExamModel> exams = new List<ExamModel>();
                    if (examGets != null && examGets.Data != null)
                        exams = examGets.Data;
                    var examsssss = new List<ExpandoObject>();
                    foreach (var item in examScheduleDetails)
                    {
                        dynamic insertT = new ExpandoObject();
                        var detail = examScheduleDetailss.FirstOrDefault(p => p.Id.ToString().ToLower() == item);
                        if (detail != null)
                        {
                            var examSchedule = examSchedules.FirstOrDefault(p => p.Id == detail.ExamScheduleId);
                            var exam = exams.FirstOrDefault(p => p.Id == detail.ExamId);
                            if (exam != null && examSchedule != null)
                            {
                                insertT.Code = exam.Code;
                                insertT.Name = exam.Name;
                                insertT.Price = exam.Price;
                                insertT.ExamDate = examSchedule.ExamDate;
                                insertT.ExamTime = examSchedule.ExamTime;
                                examsssss.Add(insertT);
                            }
                        }
                    }
                    var res = new
                    {
                        Name = profile.FullNameOrigin,
                        BirthDay = profile.Birthday.ToString("dd/MM/yyyy"),
                        Exams = examsssss,
                    };
                    return new ResponseDataObject<object>(res, Code.Success, "");
                }
                return new ResponseDataError(Code.Forbidden, "ScheduleDetaisIsNull");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        public async Task<ResponseData> GetHistoryRegister(string accessToken, string tenant, Guid? Id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/me?includeData=profile&isCurrentProfile=true", accessToken);


                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null)
                {
                    var histories = unitOfWork.Repository<SysManageRegistedCandidateAP>().Get(p => p.UserId == profiles.Data.Id && p.IsPaid == (int)StatusPaid.Paid);
                    if (Id.HasValue)
                    {
                        histories = histories.Where(item => item.Id == Id);
                    }

                    if (histories.Count() == 0)
                        return new ResponseData(Code.Success, "");
                    histories = histories.OrderByDescending(l => l.CreatedOnDate);
                    var examPeriods = unitOfWork.Repository<SysExamPeriodAP>().Get();
                    var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam", accessToken, tenant);
                    var examWordShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken, tenant);
                    var res = new List<object>();
                    var candidateIds = histories.Select(x => x.Id).ToList();
                    var examScheduleGets = unitOfWork.Repository<SysExamScheduleAP>().GetAll();
                    var profilesGet = unitOfWork.Repository<SysUserProfileRegisteredAP>().Get(p => candidateIds.Contains(p.CandidateRegisterId));
                    if (profilesGet.Count() == 0)
                        return new ResponseDataError(Code.BadRequest, "ProfileNotFound");

                    List<ExamModel> exams = new List<ExamModel>();
                    if (examGets != null && examGets.Data != null)
                        exams = examGets.Data;

                    List<ExamWorkShiftModel> examWordShifts = new List<ExamWorkShiftModel>();
                    if (examWordShiftGets != null && examWordShiftGets.Data != null)
                        examWordShifts = examWordShiftGets.Data;

                    foreach (var item in histories)
                    {
                        dynamic data = new ExpandoObject();
                        data.SBD = item.SBD;
                        data.ID = item.Id;
                        data.Paid = item.IsPaid;
                        data.DateRegisted = item.CreatedOnDate.ToString("dd/MM/yyyy");
                        dynamic oneItem = new ExpandoObject();
                        oneItem.ExamList = string.Empty;
                        oneItem.FullName = string.Empty;
                        oneItem.BirthDay = string.Empty;
                        oneItem.PaymentDate = string.Empty;
                        oneItem.Code = string.Empty;
                        var examScheduleDetails = item.ScheduleDetailIds.ToLower().Split(',').ToList();
                        if (examScheduleDetails == null || examScheduleDetails.Count() == 0)
                            return new ResponseDataError(Code.NotFound, "ExamScheduleDetailsNotFound");

                        var examScheduleDetailss = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examScheduleDetails.Contains(p.Id.ToString().ToLower())).ToList();
                        if (examScheduleDetailss.Count() > 0)
                        {
                            string examsString = string.Empty;
                            var examIds = string.Join(",", examScheduleDetailss.Select(p => p.ExamId).ToArray());
                            var profile = profilesGet.FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                            var examListGet = new List<object>();
                            int i = 0;
                            foreach (var detail in examScheduleDetails)
                            {
                                var detailGet = examScheduleDetailss.FirstOrDefault(p => p.Id.ToString().ToLower() == detail);
                                if (detailGet != null)
                                {

                                    var examSchedule = examScheduleGets.FirstOrDefault(p => p.Id == detailGet.ExamScheduleId);
                                    if (examSchedule != null)
                                    {
                                        var examPeriod = examPeriods.FirstOrDefault(p => p.Id == examSchedule.ExamPeriodId);
                                        data.ExamPeriod = examPeriod?.Id;
                                        var exam = exams.FirstOrDefault(p => p.Id == detailGet.ExamId);
                                        var examWorkShift = examWordShifts.FirstOrDefault(p => p.Id == examSchedule.ExamWorkShiftId);
                                        if (exam != null && examWorkShift != null)
                                        {
                                            if (examsString.Length > 0)
                                                examsString += "; " + exam.Name;
                                            else
                                                examsString += exam.Name;

                                            examListGet.Add(new
                                            {
                                                Name = exam.Name,
                                                Code = exam.Code,
                                                Price = item.Price.Split(",")[i],
                                                ExamWorkShift = examWorkShift.Name,
                                                TimeTest = examSchedule.ExamTime,
                                                DateTest = examSchedule.ExamDate.ToString("dd/MM/yyyy"),
                                            });
                                            data.ExamName = examsString;
                                        }
                                    }
                                }
                                i++;
                            }
                            oneItem.ExamList = examListGet;
                            var requestPayment = unitOfWork.Repository<SysPaymentApRequestLog>().FirstOrDefault(p => p.TxnRef == item.Id);
                            if (requestPayment != null)
                            {
                                var responsePayment = unitOfWork.Repository<SysPaymentApResponseLog>().FirstOrDefault(p => p.PaymentRequestId == requestPayment.Id);
                                if (responsePayment != null)
                                {
                                    string payDate = !string.IsNullOrEmpty(responsePayment.PayDate) ? responsePayment.PayDate : string.Empty;
                                    string year = payDate.Substring(0, 4);
                                    string month = payDate.Substring(4, 2);
                                    string day = payDate.Substring(6, 2);
                                    string hour = payDate.Substring(8, 2);
                                    string minute = payDate.Substring(10, 2);
                                    string secons = payDate.Substring(12, 2);

                                    data.FullName = profile?.FullNameOrigin;

                                    oneItem.FullName = profile?.FullNameOrigin;
                                    oneItem.BirthDay = profile?.Birthday.ToString("dd/MM/yyyy");
                                    oneItem.PaymentDate = day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + secons;
                                    oneItem.Code = responsePayment.TransactionNo;
                                }
                            }
                            data.Details = oneItem;
                            res.Add(data);
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


        public async Task<ResponseData> Update(UpdateManageRegisteredCandidateAPAdminModel model, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysManageRegistedCandidateAP>().GetById(model.Id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");
                var multipartFormContent = new MultipartFormDataContent();
                int index = 0;
                var birthDay = DateTime.ParseExact(model.Birthday, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var profiles = await HttpHelper.Get<ResponseDataObject<B2CUserModel>>(apiBasicUriUser, "b2cuser/" + dataEntityInDb.UserId + "?includeData=profile&isCurrentProfile=true", accessToken != null ? accessToken : "");
                if (profiles != null && profiles.Data != null && profiles.Data.Profiles != null && profiles.Data.Profiles.Count() > 0)
                {
                    var current = profiles.Data.Profiles.FirstOrDefault(p => p.IsCurrentProfile);
                    var profileTemp = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == model.Id);
                    if (profileTemp == null)
                    {
                        profileTemp = new SysUserProfileRegisteredAP();
                        profileTemp.Id = Guid.NewGuid();
                        profileTemp.CandidateRegisterId = model.Id;
                    }
                    if (model.IsChangeUserInfo && current != null)
                    {
                        var metaDataListRes = await HttpHelper.Get<ResponseDataObject<List<MetadataModel>>>(apiBasicUriUser, "metadata", accessToken != null ? accessToken : "");
                        if (metaDataListRes != null && metaDataListRes.Data != null)
                        {
                            string fullName = string.Empty;
                            var metaDataList = metaDataListRes.Data;
                            var metaFirstName = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.FirstName);
                            if (metaFirstName != null && model.FirstName != null)
                            {
                                multipartFormContent.Add(new StringContent(metaFirstName.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.FirstName), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                fullName = model.FirstName;
                                profileTemp.FirstName = Utils.RemoveUnicode(model.FirstName);
                            }

                            var metaLastName = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.LastName);
                            if (metaLastName != null && model.LastName != null)
                            {
                                multipartFormContent.Add(new StringContent(metaLastName.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.LastName), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.LastName = Utils.RemoveUnicode(model.LastName);
                                profileTemp.FullNameOrigin = fullName + " " + model.LastName.Trim();
                            }

                            var metaBirthDay = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.BirthDay);
                            if (metaBirthDay != null && model.Birthday != null && !string.IsNullOrEmpty(model.Birthday))
                            {
                                multipartFormContent.Add(new StringContent(metaBirthDay.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.Birthday), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.Birthday = DateTime.ParseExact(model.Birthday, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            }

                            var metaGender = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Gender);
                            if (metaGender != null && model.Sex != null)
                            {
                                multipartFormContent.Add(new StringContent(metaGender.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.Sex), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.Sex = model.Sex;
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

                            var metaIdCardNumber = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.IdCardNumber);
                            if (metaIdCardNumber != null && model.IDCardNumber != null)
                            {
                                multipartFormContent.Add(new StringContent(metaIdCardNumber.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.IDCardNumber), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.IDNumber = model.IDCardNumber;
                            }

                            var metaPhone = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Phone);
                            if (metaPhone != null && model.Phone != null)
                            {
                                multipartFormContent.Add(new StringContent(metaPhone.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.Phone), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.Phone = model.Phone;
                            }

                            var metaEmail = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Email);
                            if (metaEmail != null && model.Email != null)
                            {
                                multipartFormContent.Add(new StringContent(metaEmail.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.Email), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.Email = model.Email;
                            }

                            var metaSchool = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.School);
                            if (metaSchool != null && model.Phone != null)
                            {
                                multipartFormContent.Add(new StringContent(metaSchool.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.School), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.School = model.School;
                            }

                            var metaClass = metaDataList.FirstOrDefault(p => p.Code == Constant.Metadata.Class);
                            if (metaClass != null && model.Email != null)
                            {
                                multipartFormContent.Add(new StringContent(metaClass.Id.ToString()), name: "Metadata[" + index + "].metadataId");
                                multipartFormContent.Add(new StringContent(model.Class), name: "Metadata[" + index + "].textValue");
                                multipartFormContent.Add(new StringContent("0"), name: "Metadata[" + index + "].dataType");
                                index++;
                                profileTemp.Class = model.Class;
                            }

                            unitOfWork.Repository<SysUserProfileRegisteredAP>().InsertOrUpdate(profileTemp);
                            string profileId = await HttpHelper.UpdateProfileUser(apiBasicUriUser, "b2cuser/" + dataEntityInDb.UserId, multipartFormContent, accessToken != null ? accessToken : "");
                            if (Utils.IsGuid(profileId))
                            {
                                dataEntityInDb.UserProfileId = new Guid(profileId);
                            }
                        }
                    }
                }
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;
                dataEntityInDb.SBD = model.SBD;
                unitOfWork.Repository<SysManageRegistedCandidateAP>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> ExportExcel(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone, string accessToken)
        {
            System.Data.DataTable dataTable = new System.Data.DataTable();
            dataTable.Columns.Add("STT");
            dataTable.Columns.Add("FirstName");
            dataTable.Columns.Add("LastName");
            dataTable.Columns.Add("Sex");
            dataTable.Columns.Add("Birthday");
            dataTable.Columns.Add("School");
            dataTable.Columns.Add("Class");
            dataTable.Columns.Add("Email");
            dataTable.Columns.Add("Phone");
            dataTable.Columns.Add("SBD");
            dataTable.Columns.Add("IDNumber");
            dataTable.Columns.Add("Exam");
            dataTable.TableName = "AP";
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var examScheduleIds = new List<Guid>();
                var examPeriodRecent = unitOfWork.Repository<SysExamPeriodAP>().FirstOrDefault(p => p.IsOpen);
                var examSchedules = new List<SysExamScheduleAP>();
                int i = 0;
                int stt = 1;
                if (examPeriodId != null)
                {
                    examSchedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriodId).ToList();
                }
                else
                {
                    if (examPeriodRecent == null)
                    {
                        examPeriodRecent = unitOfWork.Repository<SysExamPeriodAP>().Get().OrderByDescending(p => p.CreatedOnDate).FirstOrDefault();
                    }
                    if (examPeriodRecent != null)
                        examSchedules = unitOfWork.Repository<SysExamScheduleAP>().Get(p => p.ExamPeriodId == examPeriodRecent.Id).ToList();
                }
                examScheduleIds = examSchedules.Select(p => p.Id).ToList();
                var examDetails = examScheduleId != null ? unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => p.ExamScheduleId == examScheduleId).ToList() : unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => examScheduleIds.Contains(p.ExamScheduleId)).ToList();
                var examIds = string.Join(",", examDetails.Select(p => p.ExamId).ToArray());
                var examDetailStrings = examDetails.Select(p => p.Id.ToString()).ToList();
                var examWorkShiftGets = await HttpHelper.Get<ResponseDataObject<List<ExamWorkShiftModel>>>(apiBasicUriCatalog, "ExamWorkShift", accessToken);
                List<ExamWorkShiftModel> examWorkShiftModels = new List<ExamWorkShiftModel>();
                if (examWorkShiftGets != null && examWorkShiftGets.Data != null)
                    examWorkShiftModels = examWorkShiftGets.Data;
                else
                    return new ResponseDataError(Code.NotFound, "ExamWorkShiftNotFound");

                string queryGet = $"SELECT m.Id, m.IsPaid, m.Price, m.SBD, m.ScheduleDetailIds, m.UserId, m.UserProfileId, m.CreatedOnDate FROM [IIG.Core.Framework.EOS].[dbo].[ManageRegistedCandidateAPs] as m join [IIG.Core.Framework.EOS].[dbo].[UserProfileRegisteredAPs] as  u on m.Id = u.CandidateRegisterId where m.IsPaid = {(int)StatusPaid.Paid}";

                bool checkAndOr = false;
                if (examDetailStrings.Count() > 0)
                {
                    i = 0;
                    queryGet += " and (";
                    foreach (var detail in examDetailStrings)
                    {
                        if (i == 0)
                            queryGet += $"m.ScheduleDetailIds like '%{detail}%'";
                        else
                            queryGet += $" or m.ScheduleDetailIds like '%{detail}%'";
                        i++;
                        checkAndOr = true;
                    }
                    queryGet += ")";
                }
                if (examId != null)
                {
                    var detailIds = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(p => p.ExamId == examId).Select(p => p.Id).ToList();
                    i = 0;
                    if (detailIds.Count() > 1)
                    {
                        queryGet += "(";
                    }
                    foreach (var detail in detailIds)
                    {
                        if (i == 0)
                            queryGet += $"m.ScheduleDetailIds like '%{detail}%'";
                        else
                            queryGet += $" or m.ScheduleDetailIds like '%{detail}%'";
                        i++;
                        checkAndOr = true;
                    }
                    if (detailIds.Count() > 1)
                    {
                        queryGet += ")";
                    }
                }
                if (sbd != null)
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"m.SBD = '{sbd}'";
                    checkAndOr = true;
                }

                if (!string.IsNullOrEmpty(idNumber))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.IDNumber = '{idNumber}'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(fullname))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.FullNameOrigin like '%{fullname}%'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(email))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.Email like '%{email}%'";
                    checkAndOr = true;
                }
                if (!string.IsNullOrEmpty(phone))
                {
                    if (checkAndOr)
                        queryGet += "and ";
                    queryGet += $"u.Phone like '%{phone}%'";
                    checkAndOr = true;
                }
                queryGet += " order by m.CreatedOnDate desc";
                string queryData = queryGet;
                var data = await _dapper.GetRepository().QueryAsync<SysManageRegistedCandidateAP>(queryData);
                var examGets = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam/GetByListId?ids=" + examIds, accessToken);
                List<ExamModel> exams = new List<ExamModel>();
                if (examGets != null && examGets.Data != null)
                    exams = examGets.Data;

                var result = new List<UpdateManageRegisteredCandidateAPAdminModel>();
                if (examPeriodRecent != null && data != null && data.Count() > 0)
                {
                    foreach (var item in data)
                    {
                        var profile = unitOfWork.Repository<SysUserProfileRegisteredAP>().FirstOrDefault(p => p.CandidateRegisterId == item.Id);
                        string examString = string.Empty;
                        long price = 0;
                        var examInfo = new List<ExamInfoModel>();
                        foreach (string pr in item.Price.Split(","))
                        {
                            price += Convert.ToInt64(pr);
                        }
                        foreach (string detail in item.ScheduleDetailIds.Split(','))
                        {
                            var getDetail = examDetails.FirstOrDefault(p => p.Id.ToString().ToLower() == detail.ToLower());
                            if (getDetail != null)
                            {
                                var getSchedule = examSchedules.FirstOrDefault(p => p.Id == getDetail.ExamScheduleId);
                                var exam = exams.FirstOrDefault(p => p.Id == getDetail.ExamId);
                                if (exam != null && getSchedule != null)
                                {
                                    if (examString.Length > 0)
                                        examString += "; " + exam.Name;
                                    else
                                        examString += exam.Name;

                                    dataTable.Rows.Add(new object[] { stt, profile != null ? profile.FirstName : string.Empty, profile != null ? profile.LastName : string.Empty, profile != null && profile.Sex == "man" ? "Nam" : "Nữ", profile != null ? profile.Birthday.ToString("dd/MM/yyyy") : string.Empty, profile != null ? profile.School : string.Empty, profile != null ? profile.Class : string.Empty, profile != null ? profile.Email : string.Empty, profile != null ? profile.Phone : string.Empty, !string.IsNullOrEmpty(item.SBD) ? item.SBD : string.Empty, profile != null ? profile.IDNumber : string.Empty, exam.Name });
                                    stt++;
                                }
                            }
                        }
                    }
                }

                var ds = new DataSet();
                dataTable = dataTable.DefaultView.ToTable();
                ds.Tables.Add(dataTable);
                var fileName = "DanhSachAp.xlsx";
                ExcelFillData.FillReportGrid(fileName, fileName, ds, new string[] { "{", "}" }, 1);
                return new ResponseDataObject<object>(new { FileName = "/OutputExcel/DanhSachAp.xlsx" }, Code.Success, "/OutputExcel/DanhSachAp.xlsx");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }
    }
}
