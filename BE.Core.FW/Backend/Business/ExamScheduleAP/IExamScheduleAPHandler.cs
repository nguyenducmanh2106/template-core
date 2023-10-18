using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IExamScheduleAPHandler
    {
        ResponseData Get(ExamScheduleAPSearchModel model);
        ResponseData GetById(Guid id);
        ResponseData Create(ExamScheduleAPModel model);
        ResponseData Update(ExamScheduleAPModel model);
        ResponseData Delete(IEnumerable<Guid> ids);
        ResponseData GetExamIdInPeriod(Guid examPeriodId, Guid? examScheduleId);
        Task<ResponseData> GetFromPortal(ExamScheduleAPSearchModel model, string accessToken, string tenant);
    }
}
