using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IFaqHandler
    {
        ResponseData Get(FaqSearchModel SupplierSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(FaqModel model);
        ResponseData Update(Guid id, FaqModel model);
        ResponseData Delete(IEnumerable<string> ids);
        ResponseData Rate(Guid id, bool IsLike);
        ResponseData GetDetailAndRelateFaq(Guid id, bool countView, string lang);
        ResponseData GetFromPortal(FaqSearchModel SupplierSearch);
    }
}
