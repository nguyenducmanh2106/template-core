using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IExamPeriodHandler
    {
        ResponseData Get(ExamPeriodSearch SupplierSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(ExamPeriodModel model);
        ResponseData Update(Guid id, ExamPeriodModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
