using Backend.Infrastructure.Utils;

namespace Backend.HoldPosition
{
    public interface IHoldPositionHandler
    {
        ResponseData Get();
        ResponseData Create(HoldPositionModel model);
        ResponseData GetByCalendarId(Guid id);
        ResponseData Update(HoldPositionModel model);
    }
}
