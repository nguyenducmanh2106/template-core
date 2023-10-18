using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Serilog;
using System.Data;
using System.Globalization;

namespace Backend.Business
{
    public class BlacklistTopikHandler : IBlacklistTopikHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BlacklistTopikHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(BlacklistTopikModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var sysBlackListTopik = new SysBlackListTopik();
                sysBlackListTopik.Id = new Guid();
                if (model.Type != 1)
                    model.StartWorkDate = model.FinishWorkDate = null;

                if (!ValidateModel(model, out ResponseData responseData))
                    return responseData;

                if (CheckIdentityPaperIsExist(model.IdentityCard) || CheckIdentityPaperIsExist(model.CitizenIdentityCard) || CheckIdentityPaperIsExist(model.Passport))
                    return new ResponseDataError(Code.BadRequest, "Số giấy tờ đã tồn tại");

                sysBlackListTopik.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysBlackListTopik>().Insert(_mapper.Map(model, sysBlackListTopik));
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<Guid> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataInDb = unitOfWork.Repository<SysBlackListTopik>().Get(x => ids.Any(item => item == x.Id));
                if (dataInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataInDb)
                    unitOfWork.Repository<SysBlackListTopik>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetById(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysBlackListTopik>().GetById(id);

                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");

                return new ResponseDataObject<SysBlackListTopik>(existData);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(Guid id, BlacklistTopikModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataInDb = unitOfWork.Repository<SysBlackListTopik>().GetById(id);

                if (dataInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (model.Type != 1)
                    model.StartWorkDate = model.FinishWorkDate = null;

                if (!ValidateModel(model, out ResponseData responseData))
                    return responseData;

                if (CheckIdentityPaperIsExist(model.IdentityCard, dataInDb.Id)
                    || CheckIdentityPaperIsExist(model.CitizenIdentityCard, dataInDb.Id)
                    || CheckIdentityPaperIsExist(model.Passport, dataInDb.Id))
                    return new ResponseDataError(Code.BadRequest, "Số giấy tờ đã tồn tại");

                dataInDb.LastModifiedOnDate = DateTime.Now;
                unitOfWork.Repository<SysBlackListTopik>().Update(_mapper.Map(model, dataInDb));
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(BlackListTopikSearchModel model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysBlackListTopik>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.FullName))
                    data = data.Where(item => EF.Functions.Like(item.FullName, $"%{model.FullName}%"));

                if (model.DateOfBirth.HasValue)
                    data = data.Where(item => item.DateOfBirth.Date == model.DateOfBirth.Value.Date);

                if (!string.IsNullOrEmpty(model.IdentityNo))
                {
                    data = data.Where(item => item.IdentityCard == model.IdentityNo
                    || item.CitizenIdentityCard == model.IdentityNo
                    || item.Passport == model.IdentityNo);
                }

                data = data.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysBlackListTopik>>(data);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData ImportList(IFormFile formFile, bool IsOverwrite)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var fileExtensionAllow = new string[] { ".xls", ".xlsx" };
                var formFileExtension = Path.GetExtension(formFile.FileName);
                if (!fileExtensionAllow.Contains(formFileExtension, StringComparer.OrdinalIgnoreCase))
                    return new ResponseDataError(Code.BadRequest, "Không hỗ trợ tệp tin");

                var listBlacklist = ReadImportFile(formFile);
                unitOfWork.Repository<SysBlackListTopik>().InsertRange(listBlacklist);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private List<SysBlackListTopik> ReadImportFile(IFormFile formFile)
        {
            using var uploadFileStream = formFile.OpenReadStream();
            using var excelPackage = new ExcelPackage(uploadFileStream);
            var sheet = excelPackage.Workbook.Worksheets[0];
            var headerText = new List<string>();
            for (int i = 1; i <= 16; i++)
            {
                headerText.Add(sheet.GetValue<string>(1, i));
            }

            if (!HeaderTemplate().SequenceEqual(headerText))
                throw new Exception("File không đúng mẫu");

            var listBlacklistTopik = new List<SysBlackListTopik>();
            var totalRow = sheet.Dimension.Rows;
            for (int i = 2; i <= totalRow; i++)
            {
                var fullName = sheet.GetValue<string>(i, 10);
                if (string.IsNullOrEmpty(fullName)) continue; // ignore blank row

                var startWorkDate = sheet.GetValue<DateTime>(i, 2);
                var finishWorkDate = sheet.GetValue<DateTime>(i, 3);
                var notifyResultDate = sheet.GetValue<DateTime>(i, 13);
                var finishPunishmentDate = sheet.GetValue<DateTime>(i, 14);
                var sysBlacklistTopik = new SysBlackListTopik
                {
                    Type = string.IsNullOrEmpty(sheet.GetValue<string>(i, 9)) ? 1 : 2,
                    StartWorkDate = startWorkDate != default ? startWorkDate : null,
                    FinishWorkDate = startWorkDate != default ? finishWorkDate : null,
                    ExamPeriod = sheet.GetValue<string>(i, 4)?.Trim(),
                    Country = sheet.GetValue<string>(i, 5)?.Trim(),
                    Area = sheet.GetValue<string>(i, 6)?.Trim(),
                    Location = sheet.GetValue<string>(i, 7)?.Trim(),
                    Exam = sheet.GetValue<string>(i, 8)?.Trim(),
                    CandicateNumber = sheet.GetValue<string>(i, 9)?.Trim(),
                    FullName = fullName.Trim(),
                    DateOfBirth = sheet.GetValue<DateTime>(i, 11),
                    PunishmentAction = sheet.GetValue<string>(i, 12)?.Trim(),
                    NotifyResultDate = notifyResultDate != default ? notifyResultDate : null,
                    FinishPunishmentDate = finishPunishmentDate != default ? finishPunishmentDate : null,
                    Note = sheet.GetValue<string>(i, 16)?.Trim(),
                    CreatedOnDate = DateTime.Now
                };

                if (sysBlacklistTopik.FinishPunishmentDate.HasValue)
                {
                    if (sysBlacklistTopik.FinishPunishmentDate.Value >= DateTime.Now.Date)
                        sysBlacklistTopik.Status = (int)Constant.BlacklistTopikStatus.Inprogress;
                    else
                        sysBlacklistTopik.Status = (int)Constant.BlacklistTopikStatus.Finish;
                }
                else
                    sysBlacklistTopik.Status = (int)Constant.BlacklistTopikStatus.Inprogress;

                var paperNumber = sheet.GetValue<string>(i, 15);
                if (!string.IsNullOrEmpty(paperNumber))
                {
                    if (paperNumber.Length == 9)
                        sysBlacklistTopik.IdentityCard = paperNumber;
                    else if (paperNumber.Length == 12)
                        sysBlacklistTopik.CitizenIdentityCard = paperNumber;
                    else
                        sysBlacklistTopik.Passport = paperNumber;
                }

                listBlacklistTopik.Add(sysBlacklistTopik);
            }

            return listBlacklistTopik;
        }

        private static IEnumerable<string> HeaderTemplate()
        {
            return new[]
            {
                "Phân loại",
                "Ngày bắt đầu làm việc IIG",
                "Ngày kết thúc làm việc IIG",
                "Lần thi",
                "Quốc gia",
                "Khu vực",
                "Địa điểm thi",
                "Bài thi",
                "Số báo danh",
                "Tên tiếng Anh",
                "Ngày sinh",
                "Biện pháp kỷ luật",
                "Ngày thông báo kết quả",
                "Ngày hết hạn kỷ luật",
                "Số CMND/CCCD",
                "Ghi chú"
            };
        }

        private bool ValidateModel(BlacklistTopikModel model, out ResponseData responseData)
        {
            var errorMessage = string.Empty;
            var isValid = true;
            if (model.DateOfBirth.Date > DateTime.Now.Date)
            {
                isValid = false;
                errorMessage = "Ngày sinh không được nhỏ hơn ngày hiện tại";
            }

            else if (model.StartWorkDate.HasValue && model.FinishWorkDate.HasValue && model.FinishWorkDate.Value.Date < model.StartWorkDate.Value.Date)
            {
                isValid = false;
                errorMessage = "Ngày kết thúc làm việc không được nhỏ hơn ngày bắt đầu làm việc";
            }

            else if (model.NotifyResultDate.HasValue && model.FinishPunishmentDate.HasValue && model.FinishPunishmentDate.Value.Date < model.NotifyResultDate.Value.Date)
            {
                isValid = false;
                errorMessage = "Ngày hết hạn kỷ luật không được nhỏ hơn ngày thông báo kết quả";
            }

            else if (model.NotifyResultDate.HasValue && model.StartWorkDate.HasValue && model.NotifyResultDate.Value.Date < model.StartWorkDate.Value.Date)
            {
                isValid = false;
                errorMessage = "Ngày thông báo kết quả không được nhỏ hơn ngày bắt đầu làm việc";
            }

            else if (model.FinishPunishmentDate.HasValue && model.StartWorkDate.HasValue && model.FinishPunishmentDate.Value.Date < model.StartWorkDate.Value.Date)
            {
                isValid = false;
                errorMessage = "Ngày hết hạn kỷ luật không được nhỏ hơn ngày bắt đầu làm việc";
            }

            else if (model.StartWorkDate.HasValue && model.StartWorkDate.Value.Date < model.DateOfBirth.Date)
            {
                isValid = false;
                errorMessage = "Ngày bắt đầu làm việc không được nhỏ hơn ngày sinh";
            }

            else if (model.FinishWorkDate.HasValue && model.FinishWorkDate.Value.Date < model.DateOfBirth.Date)
            {
                isValid = false;
                errorMessage = "Ngày kết thúc làm việc không được nhỏ hơn ngày sinh";
            }

            else if (model.NotifyResultDate.HasValue && model.NotifyResultDate.Value.Date < model.DateOfBirth.Date)
            {
                isValid = false;
                errorMessage = "Ngày thông báo kết quả không được nhỏ hơn ngày sinh";
            }

            else if (model.FinishPunishmentDate.HasValue && model.FinishPunishmentDate.Value.Date < model.DateOfBirth.Date)
            {
                isValid = false;
                errorMessage = "Ngày hết hạn kỷ luật không được nhỏ hơn ngày sinh";
            }

            responseData = new ResponseDataError(Code.BadRequest, errorMessage);
            return isValid;
        }

        private bool CheckIdentityPaperIsExist(string? identityPaperNo, Guid? id = null)
        {
            if (string.IsNullOrEmpty(identityPaperNo))
                return false;

            using UnitOfWork unitOfWork = new(_httpContextAccessor);
            var isDataExist = unitOfWork.Repository<SysBlackListTopik>().GetQueryable(
                item => item.IdentityCard == identityPaperNo || item.CitizenIdentityCard == identityPaperNo || item.Passport == identityPaperNo);
            if (id != null)
                isDataExist = isDataExist.Where(item => item.Id != id);

            return isDataExist.Any();
        }
    }
}
