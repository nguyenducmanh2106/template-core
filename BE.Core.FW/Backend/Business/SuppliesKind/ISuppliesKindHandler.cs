using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ISuppliesKindHandler
    {
        ResponseData Get(SuppliesKindSearch SuppliesKindSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(SuppliesKindModel model);
        ResponseData Update(SuppliesKindModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
