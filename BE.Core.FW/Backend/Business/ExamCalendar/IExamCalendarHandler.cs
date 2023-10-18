using Backend.Infrastructure.Utils;

namespace Backend.Business.ExamCalendar
{
    public interface IExamCalendarHandler
    {
        Task<ResponseData> Get(Guid? areaId, Guid? headerQuarter, Guid? exam, string? dateReceive, string? dateAccept, string? accessToken);
        ResponseData GetById(Guid id);
        ResponseData Create(ExamCalendarModel model);
        ResponseData Update(ExamCalendarModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
    }
}
