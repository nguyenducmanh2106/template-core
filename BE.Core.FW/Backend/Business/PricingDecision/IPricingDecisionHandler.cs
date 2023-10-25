using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.Branch;

public interface IPricingDecisionHandler
{
    ResponseData Get(string filter);
    ResponseData GetById(Guid id);
    ResponseData Create(PricingDecisionModel model);
    ResponseData Update(Guid id, PricingDecisionModel model);
    ResponseData Delete(Guid id);
}