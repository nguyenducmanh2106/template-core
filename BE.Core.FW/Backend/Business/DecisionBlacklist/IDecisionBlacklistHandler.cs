using Backend.Infrastructure.Utils;

namespace Backend.Business.DecisionBlacklist
{
    public interface IDecisionBlacklistHandler
    {
        ResponseData GetByBlacklistId(Guid id);
        ResponseData Create(DecisionBlacklistModel model);
        ResponseData Update(DecisionBlacklistModel model);
        ResponseData Delete(Guid id);
        ResponseData GetById(Guid id);
        ResponseData Approve(Guid id, bool approve, string? note);
    }
}
