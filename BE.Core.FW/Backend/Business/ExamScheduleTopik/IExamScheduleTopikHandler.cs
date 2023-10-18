using Backend.Infrastructure.Utils;

namespace Backend.Business.ExamScheduleTopik
{
    public interface IExamScheduleTopikHandler
    {
        ResponseData Get(Guid? examId, bool? isCong, int? status, Guid? examPeriodId);
        ResponseData GetById(Guid id);
        ResponseData Create(ExamScheduleTopikModel model);
        ResponseData Update(ExamScheduleTopikModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
        Stream DownloadImportTemplate();
    }
}
