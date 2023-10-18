using Backend.Business.ManageRegisteredCandidates;
using Backend.Infrastructure.Utils;

namespace Backend.Business.ExamFeeInformation
{
    public interface IExamFeeInformationHandler
    {
        ResponseData Get();
        ResponseData GetById(Guid id);
        ResponseData Create(ExamFeeInformationModel model);
        ResponseData Update(ExamFeeInformationModel model);
        ResponseData Delete(Guid id);
        ResponseData RestoreDelete(Guid id);
    }
}
