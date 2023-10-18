using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ISupplierHandler
    {
        ResponseData Get(SupplierSearch SupplierSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(SupplierModel model);
        ResponseData Update(SupplierModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
