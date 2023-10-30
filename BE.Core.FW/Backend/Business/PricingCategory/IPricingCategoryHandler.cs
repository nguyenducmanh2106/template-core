using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.PricingCategory;

public interface IPricingCategoryHandler
{
    ResponseData Get(string filter);
    ResponseData GetById(Guid id);
    ResponseData Create(PricingCategoryModel model);
    ResponseData Update(Guid id, PricingCategoryModel model);
    ResponseData Delete(Guid id);
}