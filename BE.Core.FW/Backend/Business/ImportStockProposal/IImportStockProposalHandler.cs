using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IImportStockProposalHandler
    {
        ResponseData Get(ImportStockProposalSearch ImportStockProposalSearch);
        ResponseData GetDetail(Guid id);
        ResponseData Create(ImportStockProposalModel model);
        ResponseData Update(ImportStockProposalModel model);
        ResponseData Delete(IEnumerable<string> ids);
        ResponseData SendForApproval(Guid id);
        ResponseData Approve(ApproveProposalModel approveProposalModel);
        ResponseData GetListProposalCodeApproved();
        Stream DownloadProposal(Guid id);
    }
}
