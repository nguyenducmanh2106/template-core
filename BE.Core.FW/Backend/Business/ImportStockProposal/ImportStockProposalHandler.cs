using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Serilog;
using System;

namespace Backend.Business
{
    public class ImportStockProposalHandler : IImportStockProposalHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserManageStockHandler _userManageStockHandler;

        public ImportStockProposalHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserManageStockHandler userManageStockHandler)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _userManageStockHandler = userManageStockHandler;
        }

        public ResponseData Approve(ApproveProposalModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var listStockUserManageProposal = GetListStockUserManageProposal();
                var entity = unitOfWork.Repository<SysImportStockProposal>().FirstOrDefault(
                    item => item.Id == model.Id && listStockUserManageProposal.Any() && listStockUserManageProposal.Contains(item.StockId));

                if (entity == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                if (entity.Status != (int)ImportStockProposalStatus.WaitingApprove)
                    return new ResponseDataError(Code.BadRequest, "Không duyệt được vì phiếu không ở trạng thái chờ duyệt");

                entity.Status = model.IsApprove ? (int)ImportStockProposalStatus.Approve : (int)ImportStockProposalStatus.Reject;
                entity.UserApprove = GetCurrentUserId().ToString();
                entity.DateApprove = DateTime.Now;
                if (!model.IsApprove)
                    entity.ReasonReject = model.ReasonReject;

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Create(ImportStockProposalModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (model.DatePropose.Date > model.DateImportExpected.Date)
                    return new ResponseDataError(Code.BadRequest, "Ngày dự kiến không được nhỏ hơn ngày đề xuất");

                if (model.FileImport == null)
                    return new ResponseDataError(Code.BadRequest, "Thiếu tệp đính kèm chi tiết đề xuất nhập kho");

                model.Id = Guid.NewGuid();
                var sysImportStockProposal = _mapper.Map<SysImportStockProposal>(model);
                sysImportStockProposal.Code = GenerateProposalCode();
                sysImportStockProposal.DatePropose = model.DatePropose.Date;
                sysImportStockProposal.DateImportExpected = model.DateImportExpected.Date;
                sysImportStockProposal.CreatedOnDate = DateTime.Now;
                sysImportStockProposal.CreatedByUserId = GetCurrentUserId();
                sysImportStockProposal.Status = (int)ImportStockProposalStatus.Draft;
                var importStockProposalDetail = GetProposalDetailFromFileImport(model.FileImport, sysImportStockProposal.Id);
                sysImportStockProposal.FileImportSavedPath = SaveFileImport(model.FileImport);
                unitOfWork.Repository<SysImportStockProposal>().Insert(sysImportStockProposal);
                unitOfWork.Repository<SysImportStockProposalDetail>().InsertRange(importStockProposalDetail);

                unitOfWork.Save();
                return new ResponseDataObject<Guid>(sysImportStockProposal.Id);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<string> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var userId = GetCurrentUserId();
                var dataEntitiesInDb = unitOfWork.Repository<SysImportStockProposal>().Get(
                    x => ids.Any(item => item == x.Id.ToString()) && x.Status == (int)ImportStockProposalStatus.Draft && x.CreatedByUserId == userId);

                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysImportStockProposal>().Delete(item);

                var importStockProposalDetail = unitOfWork.Repository<SysImportStockProposalDetail>().Get(item => ids.Contains(item.ImportStockProposalId.ToString()));
                foreach (var item in importStockProposalDetail)
                    unitOfWork.Repository<SysImportStockProposalDetail>().Delete(item);

                var listFileImport = dataEntitiesInDb.Select(x => x.FileImportSavedPath);
                unitOfWork.Save();
                Task.Run(() => MinioHelpers.DeleteFileInMinIO(listFileImport.ToList()));
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(ImportStockProposalSearch model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listStockUserManageProposal = GetListStockUserManageProposal();
                var dataEntityInDb = unitOfWork.Repository<SysImportStockProposal>().GetQueryable(
                    item => item.CreatedByUserId == GetCurrentUserId()
                    || (listStockUserManageProposal.Any() && listStockUserManageProposal.Contains(item.StockId) && item.Status != (int)ImportStockProposalStatus.Draft));

                if (!string.IsNullOrEmpty(model.Code))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Code, $"%{model.Code}%"));

                if (model.Type.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.Type == model.Type);

                if (model.StockId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.StockId == model.StockId);

                if (model.SupplierId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SupplierId == model.SupplierId);

                if (model.Status.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.Status == model.Status);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysImportStockProposal>>(dataEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetDetail(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var entityInDb = unitOfWork.Repository<SysImportStockProposalDetail>().Get(item => item.ImportStockProposalId == id);
                if (entityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<IEnumerable<SysImportStockProposalDetail>>(entityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData SendForApproval(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var entity = unitOfWork.Repository<SysImportStockProposal>().FirstOrDefault(item => item.Id == id && item.CreatedByUserId == GetCurrentUserId());
                if (entity == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                if (entity.Status != (int)ImportStockProposalStatus.Draft)
                    return new ResponseDataError(Code.BadRequest, "Không gửi phê duyệt do sai trạng thái của phiếu");

                entity.Status = (int)ImportStockProposalStatus.WaitingApprove;
                entity.DateSendForApprove = DateTime.Now;

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ImportStockProposalModel model)
        {
            try
            {
                if (model.DatePropose.Date > model.DateImportExpected.Date)
                    return new ResponseDataError(Code.BadRequest, "Ngày dự kiến không được nhỏ hơn ngày đề xuất");

                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysImportStockProposal>().FirstOrDefault(
                    item => item.Id == model.Id && item.Status == (int)ImportStockProposalStatus.Draft && item.CreatedByUserId == GetCurrentUserId());

                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Status != (int)ImportStockProposalStatus.Draft)
                    return new ResponseDataError(Code.BadRequest, "Không được phép chỉnh sửa phiếu");

                dataEntityInDb.DatePropose = model.DatePropose.Date;
                dataEntityInDb.DateImportExpected = model.DateImportExpected.Date;
                dataEntityInDb.Type = model.Type;
                dataEntityInDb.SupplierId = model.SupplierId;
                dataEntityInDb.StockId = model.StockId;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;
                dataEntityInDb.LastModifiedByUserId = GetCurrentUserId();

                if (model.FileImport != null)
                {
                    var oldImportStockProposalDetail = unitOfWork.Repository<SysImportStockProposalDetail>().GetQueryable(item => item.ImportStockProposalId == model.Id);
                    foreach (var item in oldImportStockProposalDetail)
                        unitOfWork.Repository<SysImportStockProposalDetail>().Delete(item);

                    var newImportStockProposalDetail = GetProposalDetailFromFileImport(model.FileImport, model.Id);
                    unitOfWork.Repository<SysImportStockProposalDetail>().InsertRange(newImportStockProposalDetail);
                    Task.Run(() => MinioHelpers.DeleteFileInMinIO(new List<string> { dataEntityInDb.FileImportSavedPath }));
                    dataEntityInDb.FileImportSavedPath = SaveFileImport(model.FileImport);
                }

                unitOfWork.Repository<SysImportStockProposal>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private List<SysImportStockProposalDetail> GetProposalDetailFromFileImport(IFormFile fileImport, Guid importStockProposalId)
        {
            var proposalDetails = new List<SysImportStockProposalDetail>();
            using var fileImportStream = fileImport.OpenReadStream();
            using (var package = new ExcelPackage(fileImportStream))
            {
                var sheet = package.Workbook.Worksheets[0];
                var headerRow = new List<string>();
                for (int i = 1; i <= 4; i++)
                    headerRow.Add(sheet.GetValue<string>(1, i));

                var headerRowTemplate = HeaderRowTemplate();
                var matchTemplate = headerRow.SequenceEqual(headerRowTemplate, StringComparer.OrdinalIgnoreCase);
                if (!matchTemplate)
                    throw new Exception("Sai mẫu file import");

                var rowData = sheet.Dimension.Rows;
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listSuppliesKind = unitOfWork.Repository<SysSuppliesKind>().Get();
                var listSupplies = unitOfWork.Repository<SysSupplies>().Get();

                for (int i = 2; i <= rowData; i++)
                {
                    var suppliesKindCode = sheet.GetValue<string>(i, 1).Trim();
                    var suppliesCode = sheet.GetValue<string>(i, 2).Trim();
                    var supplies = listSupplies.FirstOrDefault(item => item.Code == suppliesCode);
                    var suppliesKind = listSuppliesKind.FirstOrDefault(item => item.Code == suppliesKindCode);

                    if (supplies == null || suppliesKind == null || supplies.SuppliesKindId != suppliesKind.Id)
                        throw new Exception("File import sai mã loại vật tư hoặc mã vật tư");

                    var quantity = sheet.GetValue<string>(i, 3);
                    var canParseQuantity = int.TryParse(quantity, out var quantityValue);
                    if (!canParseQuantity || quantityValue <= 0)
                        throw new Exception("Số lượng không hợp lệ");

                    var note = sheet.GetValue<string>(i, 4).Trim();
                    if (note.Length > 1000)
                        throw new Exception("Ghi chú không được dài hơn 1000 ký tự");

                    proposalDetails.Add(new SysImportStockProposalDetail
                    {
                        Id = Guid.NewGuid(),
                        ImportStockProposalId = importStockProposalId,
                        SuppliesId = supplies.Id,
                        Quantity = quantityValue,
                        Note = note
                    });
                }
            }

            return proposalDetails;
        }

        private static IEnumerable<string> HeaderRowTemplate()
        {
            return new List<string>
            {
                "Loại vật tư",
                "Mã vật tư",
                "Số lượng",
                "Ghi chú"
            };
        }

        private static string SaveFileImport(IFormFile fileImport)
        {
            var filePath = $"/import_stock_proposal_detail/{DateTime.Now:ddMMyyyyHHmmss}/{fileImport.FileName}";
            Task.Run(() => MinioHelpers.UploadFileToMinIO(fileImport.OpenReadStream(), filePath));
            return filePath;
        }

        private enum ImportStockProposalStatus
        {
            Draft = 1,
            WaitingApprove = 2,
            Approve = 3,
            Reject = 4
        }

        private Guid GetCurrentUserId() => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty);

        public Stream DownloadProposal(Guid id)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var memoryStream = new MemoryStream();
            var importStockProposal = unitOfWork.Repository<SysImportStockProposal>().GetById(id);
            if (importStockProposal != null)
            {
                var importStockProposalDetail = unitOfWork.Repository<SysImportStockProposalDetail>().Get(item => item.ImportStockProposalId == importStockProposal.Id);
                var currentRequest = _httpContextAccessor.HttpContext!.Request;
                var stock = unitOfWork.Repository<SysStockList>().FirstOrDefault(item => item.Id == importStockProposal.StockId);
                var supplier = unitOfWork.Repository<SysSuppliesCategory>().FirstOrDefault(item => item.Id == importStockProposal.SupplierId);
                var listSupplies = unitOfWork.Repository<SysSupplies>().Get();
                var listSuppliesKind = unitOfWork.Repository<SysSuppliesKind>().Get();
                var listSuppliesCategory = unitOfWork.Repository<SysSuppliesCategory>().Get();
                using var excelPackage = new ExcelPackage();
                var sheet = excelPackage.Workbook.Worksheets.Add("Sheet1");

                var headerRow = sheet.Cells[1, 1, 1, 6];
                headerRow.Merge = true;
                headerRow.Value = "PHIẾU ĐỀ XUẤT NHẬP HÀNG TRONG NƯỚC VÀ NGOÀI NƯỚC";
                headerRow.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                headerRow.Style.Font.Bold = true;

                sheet.Cells[2, 1].Value = "Ngày:";
                sheet.Cells[2, 3].Value = importStockProposal.DatePropose.ToString("dd/MM/yyyy");

                sheet.Cells[3, 1].Value = "Loại đề xuất:";
                sheet.Cells[3, 3].Value = importStockProposal.Type == 1 ? "Trong nước" : "Ngoài nước";

                sheet.Cells[4, 1].Value = "Nhà cung cấp:";
                sheet.Cells[4, 3].Value = supplier?.Name;

                sheet.Cells[5, 1].Value = "Kho đặt hàng:";
                sheet.Cells[5, 3].Value = stock?.Name;

                sheet.Cells[6, 1].Value = "Dự kiến trả hàng:";
                sheet.Cells[6, 3].Value = importStockProposal.DateImportExpected.ToString("dd/MM/yyyy");

                sheet.Cells[7, 1].Value = "Diễn giải:";
                sheet.Cells[7, 3].Value = importStockProposal.Note;

                sheet.Cells[9, 1].Value = "STT";
                sheet.Cells[9, 2].Value = "Loại vật tư";
                sheet.Cells[9, 3].Value = "Mã vật tư";
                sheet.Cells[9, 4].Value = "Danh mục vật tư";
                sheet.Cells[9, 5].Value = "Số lượng";
                sheet.Cells[9, 6].Value = "Ghi chú";
                int row = 10;
                var ordinalNumber = 1;
                foreach (var detail in importStockProposalDetail)
                {
                    var supplies = listSupplies.FirstOrDefault(supplies => supplies.Id == detail.SuppliesId);
                    var suppliesKind = listSuppliesKind.FirstOrDefault(kind => kind.Id == supplies?.SuppliesKindId);
                    sheet.Cells[row, 1].Value = ordinalNumber;
                    sheet.Cells[row, 2].Value = suppliesKind?.Code;
                    sheet.Cells[row, 3].Value = supplies?.Code;
                    sheet.Cells[row, 4].Value = listSuppliesCategory.FirstOrDefault(item => item.Id == suppliesKind?.SuppliesCategoryId)?.Name;
                    sheet.Cells[row, 5].Value = detail.Quantity;
                    sheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    sheet.Cells[row, 6].Value = detail.Note;
                    row++;
                    ordinalNumber++;
                }

                sheet.Cells[10, 1, row - 1, 6].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[10, 1, row - 1, 6].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                sheet.Cells[10, 1, row - 1, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                sheet.Cells[10, 1, row - 1, 6].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                sheet.Cells[row, 3].Value = "Total";
                sheet.Cells[row, 5].Value = importStockProposalDetail.Sum(item => item.Quantity);
                sheet.Cells[row, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                sheet.Cells[row + 2, 1].Value = "Người đề xuất";
                sheet.Cells[row + 2, 5].Value = "Người phê duyệt";

                excelPackage.SaveAs(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);
            }

            return memoryStream;
        }

        public ResponseData GetListProposalCodeApproved()
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysImportStockProposal>().Get(item => item.Status == (int)ImportStockProposalStatus.Approve).Select(item => item.Code);
                return new ResponseDataObject<IEnumerable<string>>(dataEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private IEnumerable<Guid> GetListStockUserManageProposal()
        {
            return (_userManageStockHandler.GetListStockUserManage(Constant.StockApproveType.Proposal) as ResponseDataObject<IEnumerable<Guid>>)?.Data ?? new List<Guid>();
        }

        private string GenerateProposalCode()
        {
            return Path.GetRandomFileName().Replace(".", "").Substring(0, 10);
        }
    }
}
