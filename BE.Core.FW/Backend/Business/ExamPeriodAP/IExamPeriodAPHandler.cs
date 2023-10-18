using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IExamPeriodAPHandler
    {
        ResponseData Get(ExamPeriodAPSearch SupplierSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(ExamPeriodAPModel model);
        ResponseData Update(Guid id, ExamPeriodAPModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
