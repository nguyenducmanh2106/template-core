using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.TaxCategory;

public interface ITaxCategoryHandler
{
    ResponseData Get(string filter);
    ResponseData GetById(Guid id);
    ResponseData Create(TaxCategoryModel model);
    ResponseData Update(Guid id, TaxCategoryModel model);
    ResponseData Delete(Guid id);
}