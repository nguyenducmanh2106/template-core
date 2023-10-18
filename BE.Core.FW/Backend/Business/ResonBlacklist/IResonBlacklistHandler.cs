using Backend.Infrastructure.Utils;

namespace Backend.Business.ResonBlacklist
{
    public interface IResonBlacklistHandler
    {
        ResponseData Get();
        ResponseData Create(ResonBlacklistModel model);
        ResponseData Update(ResonBlacklistModel model);
        ResponseData Delete(Guid id);
    }
}
