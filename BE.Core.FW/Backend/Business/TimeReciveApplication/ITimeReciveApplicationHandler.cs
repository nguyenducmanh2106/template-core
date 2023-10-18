using Backend.Infrastructure.Utils;

namespace Backend.Business.TimeReciveApplication
{
    public interface ITimeReciveApplicationHandler
    {
        ResponseData Get();
        ResponseData Create(TimeReciveApplicationModel model);
        ResponseData Update(TimeReciveApplicationModel model);
        ResponseData Delete(Guid id);
    }
}
