using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IImportStockReceiptHandler
    {
        ResponseData Get(ImportStockReceiptSearch ImportStockReceiptSearch);
        ResponseData GetDetail(Guid id);
        ResponseData Create(ImportStockReceiptModel model);
        ResponseData Update(ImportStockReceiptModel model);
        ResponseData Delete(IEnumerable<string> ids);
        ResponseData SendForApproval(Guid id);
        ResponseData Approve(ApproveReceiptModel approveReceiptModel);
        Stream DownloadReceipt(Guid id);
    }
}
