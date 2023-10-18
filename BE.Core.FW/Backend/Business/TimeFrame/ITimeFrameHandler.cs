using Backend.Infrastructure.Utils;

namespace Backend.Business.TimeFrame
{
    public interface ITimeFrameHandler
    {
        Task<ResponseData> GetAsync(string accessToken);
        Task<ResponseData> GetByIdAsync(Guid id, string accessToken);
        ResponseData Create(TimeFrameModel model);
        ResponseData Update(TimeFrameModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
    }
}
