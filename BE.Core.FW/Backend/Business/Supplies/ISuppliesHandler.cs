using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ISuppliesHandler
    {
        ResponseData Get(SuppliesSearch SuppliesSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(SuppliesModel model);
        ResponseData Update(SuppliesModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
