using Backend.Business.TimeFrame;
using Backend.Infrastructure.Utils;

namespace Backend.Business.ManageApplicationTime
{
    public interface IManageApplicationTimeHandler
    {
        Task<ResponseData> Get(Guid headerQuarterId, string? from, string? to, bool isCong, int pageNumber, int pageSize, string accessToken, bool isFullData);
        ResponseData GetById(Guid id);
        ResponseData Create(ManageApplicationTimeModel model);
        ResponseData Update(ManageApplicationTimeModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
    }
}
