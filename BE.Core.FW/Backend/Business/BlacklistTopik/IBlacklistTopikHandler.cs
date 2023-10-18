using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IBlacklistTopikHandler
    {
        ResponseData Get(BlackListTopikSearchModel model);
        ResponseData GetById(Guid id);
        ResponseData Create(BlacklistTopikModel model);
        ResponseData Update(Guid id, BlacklistTopikModel model);
        ResponseData Delete(IEnumerable<Guid> ids);
        ResponseData ImportList(IFormFile formFile, bool IsOverwrite);
    }
}
