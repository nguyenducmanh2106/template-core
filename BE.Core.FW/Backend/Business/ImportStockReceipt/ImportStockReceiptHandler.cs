using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Serilog;

namespace Backend.Business
{
    public class ImportStockReceiptHandler : IImportStockReceiptHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserManageStockHandler _userManageStockHandler;

        public ImportStockReceiptHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserManageStockHandler userManageStockHandler)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _userManageStockHandler = userManageStockHandler;
        }

        public ResponseData Approve(ApproveReceiptModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var listStockUserManageReceipt = GetListStockUserManageReceipt();
                var entity = unitOfWork.Repository<SysImportStockReceipt>().FirstOrDefault(
                    item => item.Id == model.Id && listStockUserManageReceipt.Any() && listStockUserManageReceipt.Contains(item.StockId));

                if (entity == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                if (entity.Status != (int)ImportStockReceiptStatus.WaitingApprove)
                    return new ResponseDataError(Code.BadRequest, "Không duyệt được vì phiếu không ở trạng thái chờ duyệt");

                entity.Status = model.IsApprove ? (int)ImportStockReceiptStatus.Approve : (int)ImportStockReceiptStatus.Reject;
                entity.UserApprove = GetCurrentUserId();
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

        public ResponseData Create(ImportStockReceiptModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (model.FileImport == null)
                    return new ResponseDataError(Code.BadRequest, "Thiếu tệp đính kèm chi tiết đề xuất nhập kho");

                model.Id = Guid.NewGuid();
                var sysImportStockReceipt = _mapper.Map<SysImportStockReceipt>(model);
                sysImportStockReceipt.ImportStockProposalCode = sysImportStockReceipt.ImportStockProposalCode?.Trim();
                sysImportStockReceipt.DatePropose = model.DatePropose.Date;
                sysImportStockReceipt.CreatedOnDate = DateTime.Now;
                sysImportStockReceipt.CreatedByUserId = GetCurrentUserId();
                sysImportStockReceipt.Code = GenerateReceiptCode();
                sysImportStockReceipt.Status = (int)ImportStockReceiptStatus.Draft;
                var importStockReceiptDetail = GetReceiptDetailFromFileImport(model.FileImport, sysImportStockReceipt.Id, sysImportStockReceipt.ImportMethod);
                sysImportStockReceipt.FileImportSavedPath = SaveFileImport(model.FileImport, model.Id);
                unitOfWork.Repository<SysImportStockReceipt>().Insert(sysImportStockReceipt);
                unitOfWork.Repository<SysImportStockReceiptDetail>().InsertRange(importStockReceiptDetail);

                unitOfWork.Save();
                return new ResponseDataObject<Guid>(sysImportStockReceipt.Id);
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
                var dataEntitiesInDb = unitOfWork.Repository<SysImportStockReceipt>().Get(
                    x => ids.Contains(x.Id.ToString()) && x.Status == (int)ImportStockReceiptStatus.Draft && x.CreatedByUserId == GetCurrentUserId());

                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysImportStockReceipt>().Delete(item);

                var importStockReceiptDetail = unitOfWork.Repository<SysImportStockReceiptDetail>().Get(item => ids.Contains(item.ImportStockReceiptId.ToString()));
                foreach (var item in importStockReceiptDetail)
                    unitOfWork.Repository<SysImportStockReceiptDetail>().Delete(item);

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

        public ResponseData Get(ImportStockReceiptSearch model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listStockUserManageReceipt = GetListStockUserManageReceipt();
                var dataEntityInDb = unitOfWork.Repository<SysImportStockReceipt>().GetQueryable(
                    item => item.CreatedByUserId == GetCurrentUserId()
                    || (listStockUserManageReceipt.Any() && listStockUserManageReceipt.Contains(item.StockId) && item.Status != (int)ImportStockReceiptStatus.Draft));

                if (!string.IsNullOrEmpty(model.ImportStockProposalCode))
                    dataEntityInDb = dataEntityInDb.Where(item => !string.IsNullOrEmpty(item.ImportStockProposalCode) && EF.Functions.Like(item.ImportStockProposalCode, $"%{model.ImportStockProposalCode}%"));

                if (model.ImportMethod.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.ImportMethod == model.ImportMethod);

                if (model.StockId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.StockId == model.StockId);

                if (model.SupplierId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SupplierId == model.SupplierId);

                if (model.Status.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.Status == model.Status);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysImportStockReceipt>>(dataEntityInDb);
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
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listStockUserManageReceipt = GetListStockUserManageReceipt();
                var receipt = unitOfWork.Repository<SysImportStockReceipt>().GetQueryable(
                    item => item.CreatedByUserId == GetCurrentUserId() || (listStockUserManageReceipt.Any() && listStockUserManageReceipt.Contains(item.StockId)) && item.Id == id);
                var receiptDetail = unitOfWork.Repository<SysImportStockReceiptDetail>().Get(item => item.ImportStockReceiptId == id);
                if (receipt == null || receiptDetail == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<IEnumerable<SysImportStockReceiptDetail>>(receiptDetail);
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
                var entity = unitOfWork.Repository<SysImportStockReceipt>().FirstOrDefault(item => item.Id == id && item.CreatedByUserId == GetCurrentUserId());
                if (entity == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                if (entity.Status != (int)ImportStockReceiptStatus.Draft)
                    return new ResponseDataError(Code.BadRequest, "Không gửi phê duyệt do sai trạng thái của phiếu");

                entity.Status = (int)ImportStockReceiptStatus.WaitingApprove;
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

        public ResponseData Update(ImportStockReceiptModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysImportStockReceipt>().FirstOrDefault(
                    item => item.Id == model.Id && item.Status == (int)ImportStockReceiptStatus.Draft && item.CreatedByUserId == GetCurrentUserId());

                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.ImportMethod != model.ImportMethod && model.FileImport == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                dataEntityInDb.DatePropose = model.DatePropose.Date;
                dataEntityInDb.ImportStockProposalCode = model.ImportStockProposalCode?.Trim();
                dataEntityInDb.StockId = model.StockId;
                dataEntityInDb.SupplierId = model.SupplierId;
                dataEntityInDb.ImportMethod = model.ImportMethod;
                dataEntityInDb.BatchNote = model.BatchNote;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;
                dataEntityInDb.LastModifiedByUserId = GetCurrentUserId();

                if (model.FileImport != null)
                {
                    var oldImportStockReceiptDetail = unitOfWork.Repository<SysImportStockReceiptDetail>().GetQueryable(item => item.ImportStockReceiptId == model.Id);
                    foreach (var item in oldImportStockReceiptDetail)
                        unitOfWork.Repository<SysImportStockReceiptDetail>().Delete(item);

                    var newImportStockReceiptDetail = GetReceiptDetailFromFileImport(model.FileImport, model.Id, model.ImportMethod);
                    unitOfWork.Repository<SysImportStockReceiptDetail>().InsertRange(newImportStockReceiptDetail);
                    Task.Run(() => MinioHelpers.DeleteFileInMinIO(new List<string> { dataEntityInDb.FileImportSavedPath }));
                    dataEntityInDb.FileImportSavedPath = SaveFileImport(model.FileImport, model.Id);
                }

                unitOfWork.Repository<SysImportStockReceipt>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public Stream DownloadReceipt(Guid id)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var memoryStream = new MemoryStream();
            var receipt = unitOfWork.Repository<SysImportStockReceipt>().GetById(id);
            if (receipt != null)
            {
                var receiptDetail = unitOfWork.Repository<SysImportStockReceiptDetail>().Get(item => item.ImportStockReceiptId == receipt.Id);
                var currentRequest = _httpContextAccessor.HttpContext!.Request;
                var listArea = HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(Utils.GetConfig("Catalog"), "Area", HttpHelper.GetAccessFromHeader(currentRequest), HttpHelper.GetTenantFromHeader(currentRequest)).Result.Data;
                var stock = unitOfWork.Repository<SysStockList>().FirstOrDefault(item => item.Id == receipt.StockId);
                var supplier = unitOfWork.Repository<SysSuppliesCategory>().FirstOrDefault(item => item.Id == receipt.SupplierId);
                var listSupplies = unitOfWork.Repository<SysSupplies>().Get();
                var listSuppliesKind = unitOfWork.Repository<SysSuppliesKind>().Get();
                var listSuppliesCategory = unitOfWork.Repository<SysSuppliesCategory>().Get();
                using var excelPackage = new ExcelPackage();
                var sheet = excelPackage.Workbook.Worksheets.Add("Sheet1");

                var headerRow = sheet.Cells[1, 1, 1, 6];
                headerRow.Merge = true;
                headerRow.Value = "PHIẾU NHẬP KHO VẬT TƯ";
                headerRow.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Font.Size = 14f;

                sheet.Cells[2, 1].Value = "Mã phiếu:";
                sheet.Cells[2, 3].Value = receipt.Code;

                sheet.Cells[3, 1].Value = "Ngày:";
                sheet.Cells[3, 3].Value = receipt.DatePropose.ToString("dd/MM/yyyy");

                sheet.Cells[4, 1].Value = "Số đề nghị:";
                sheet.Cells[4, 3].Value = receipt.Code;

                sheet.Cells[5, 1].Value = "Chi nhánh:";
                sheet.Cells[5, 3].Value = listArea?.FirstOrDefault(item => item.Id == stock?.AreaId)?.Name;

                sheet.Cells[6, 1].Value = "Kho nhập:";
                sheet.Cells[6, 3].Value = stock?.Name;

                sheet.Cells[7, 1].Value = "Nhà cung cấp:";
                sheet.Cells[7, 3].Value = supplier?.Name;

                sheet.Cells[8, 1].Value = "Đợt nhập:";
                sheet.Cells[8, 3].Value = receipt.BatchNote;

                sheet.Cells[9, 1].Value = "Phương thức:";
                sheet.Cells[9, 3].Value = receipt.ImportMethod == (int)ImportMethod.Supplies ? "Vật tư" : "Đề thi";

                sheet.Cells[10, 1].Value = "Diễn giải:";
                sheet.Cells[10, 3].Value = receipt.Note;
                sheet.Cells[10, 3].Style.WrapText = false;

                sheet.Cells[12, 1].Value = "STT";
                sheet.Cells[12, 2].Value = "Loại vật tư";
                sheet.Cells[12, 3].Value = "Mã vật tư";
                sheet.Cells[12, 4].Value = "Danh mục vật tư";
                sheet.Cells[12, 5].Value = "Số lượng";
                sheet.Cells[12, 6].Value = "Ghi chú";
                int row = 13;
                var ordinalNumber = 1;
                foreach (var detail in receiptDetail)
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

                sheet.Cells[12, 1, row - 1, 6].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[12, 1, row - 1, 6].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                sheet.Cells[12, 1, row - 1, 6].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                sheet.Cells[12, 1, row - 1, 6].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                sheet.Cells[row, 4].Value = "Total";
                sheet.Cells[row, 5].Value = receiptDetail.Sum(item => item.Quantity);
                sheet.Cells[row, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                sheet.Cells[row + 2, 1].Value = "Người đề xuất";
                sheet.Cells[row + 2, 5].Value = "Người phê duyệt";

                sheet.Cells.AutoFitColumns();

                excelPackage.SaveAs(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);
            }

            return memoryStream;
        }

        private string GenerateReceiptCode()
        {
            return Path.GetRandomFileName().Replace(".", "").Substring(0, 10);
        }

        private List<SysImportStockReceiptDetail> GetReceiptDetailFromFileImport(IFormFile fileImport, Guid importStockReceiptId, int importMethod)
        {
            var receiptDetails = new List<SysImportStockReceiptDetail>();
            using var fileImportStream = fileImport.OpenReadStream();
            using (var package = new ExcelPackage(fileImportStream))
            {
                var sheet = package.Workbook.Worksheets[0];
                var column = importMethod == (int)ImportMethod.Supplies ? 3 : 4;
                var headerRow = new List<string>();
                for (int i = 1; i <= column; i++)
                    headerRow.Add(sheet.GetValue<string>(1, i));

                var headerRowTemplate = importMethod == (int)ImportMethod.Supplies ? HeaderRowTemplateSupplies() : HeaderRowTemplateExam();
                var matchTemplate = headerRow.SequenceEqual(headerRowTemplate, StringComparer.OrdinalIgnoreCase);
                if (!matchTemplate)
                    throw new Exception("Sai mẫu file import");

                var rowData = sheet.Dimension.Rows;
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listSupplies = unitOfWork.Repository<SysSupplies>().Get();
                for (int i = 2; i <= rowData; i++)
                {
                    var quantity = importMethod == (int)ImportMethod.Supplies ? sheet.GetValue<string>(i, 2) : sheet.GetValue<string>(i, 3);
                    var canParseQuantity = int.TryParse(quantity, out var quantityValue);
                    if (!canParseQuantity || quantityValue <= 0)
                        throw new Exception("Số lượng không hợp lệ");

                    var note = importMethod == (int)ImportMethod.Supplies ? sheet.GetValue<string>(i, 3) : sheet.GetValue<string>(i, 4);
                    note = note.Trim();
                    if (note.Length > 1000)
                        throw new Exception("Ghi chú không được dài hơn 1000 ký tự");

                    receiptDetails.Add(new SysImportStockReceiptDetail
                    {
                        Id = Guid.NewGuid(),
                        ImportStockReceiptId = importStockReceiptId,
                        SuppliesId = listSupplies.FirstOrDefault(item => item.Code == sheet.GetValue<string>(i, 1).Trim())?.Id ?? throw new Exception("File import tồn tại mã vật tư không hợp lệ"),
                        AdditionalInfo = importMethod == (int)ImportMethod.Supplies ? string.Empty : sheet.GetValue<string>(i, 2),
                        Quantity = quantityValue,
                        Note = note
                    });
                }
            }

            return receiptDetails;
        }

        private static string SaveFileImport(IFormFile fileImport, Guid id)
        {
            var filePath = $"/import_stock_receipt_detail/{id}/{fileImport.FileName}";
            Task.Run(() => MinioHelpers.UploadFileToMinIO(fileImport.OpenReadStream(), filePath));
            return filePath;
        }

        private enum ImportStockReceiptStatus
        {
            Draft = 1,
            WaitingApprove = 2,
            Approve = 3,
            Reject = 4
        }

        private enum ImportMethod
        {
            Supplies = 1,
            Exam = 2,
        }

        private static IEnumerable<string> HeaderRowTemplateExam()
        {
            return new List<string>
            {
                "Mã vật tư",
                "Từ số",
                "Số lượng",
                "Ghi chú"
            };
        }

        private static IEnumerable<string> HeaderRowTemplateSupplies()
        {
            return new List<string>
            {
                "Mã vật tư",
                "Số lượng",
                "Ghi chú"
            };
        }

        private Guid GetCurrentUserId() => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty);

        private IEnumerable<Guid> GetListStockUserManageReceipt()
        {
            return (_userManageStockHandler.GetListStockUserManage(Constant.StockApproveType.Receipt) as ResponseDataObject<IEnumerable<Guid>>)?.Data ?? new List<Guid>();
        }
    }
}
