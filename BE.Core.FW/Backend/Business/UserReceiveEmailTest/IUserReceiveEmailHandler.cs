using Backend.Business.User;
using Backend.Infrastructure.Utils;

namespace Backend.Business.UserReceiveEmail
{
    public interface IUserReceiveEmailHandler
    {
        ResponseData Get(string? name, int status, int pageIndex = 1, int pageSize = 10);
        ResponseData GetAll(string? name, int status);
        ResponseData GetById(Guid id);
        ResponseData Create(UserReceiveEmailTestModel model);
        ResponseData Update(Guid id, UserReceiveEmailTestModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
    }
}
