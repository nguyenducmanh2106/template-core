using Backend.Business.TimeFrame;
using Backend.Infrastructure.Utils;

namespace Backend.Business.TimeFrameInDay
{
    public interface ITimeFrameInDayHandler
    {
        Task<ResponseData> GetAsync(string accessToken);
        Task<ResponseData> GetById(Guid id, string accessToken);
        ResponseData Create(TimeFrameInDayModel model);
        ResponseData Update(TimeFrameInDayModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
    }
}
