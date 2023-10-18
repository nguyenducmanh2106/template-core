using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ISuppliesCategoryHandler
    {
        ResponseData Get(SuppliesCategorySearch SuppliesCategorySearch);
        ResponseData GetById(Guid id);
        ResponseData Create(SuppliesCategoryModel model);
        ResponseData Update(SuppliesCategoryModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
