using Backend.Infrastructure.Utils;

namespace Backend.Business.Blacklist
{
    public interface IBlacklistHandler
    {
        ResponseData Get(string? name, string? dob, string? cccd, bool? isDeleted);
        ResponseData GetById(Guid id);
        ResponseData Create(BlacklistShowModel model);
        ResponseData Update(BlacklistModel model);
        ResponseData Delete(Guid id);
        ResponseData ReadDataFromFile(bool isCheck, string fileName);
    }
}
