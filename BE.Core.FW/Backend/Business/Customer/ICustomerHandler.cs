using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ICustomerHandler
    {
        ResponseData Get(CustomerSearch CustomerSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(CustomerModel model);
        ResponseData Update(CustomerModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
