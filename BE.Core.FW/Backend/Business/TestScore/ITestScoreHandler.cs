using Backend.Infrastructure.Utils;

namespace Backend.Business.TestScore
{
    public interface ITestScoreHandler
    {
        ResponseData Get(string filter);
        ResponseData GetById(Guid id);
        ResponseData Create(TestScoreModel model);
        ResponseData Update(TestScoreModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteMany(List<string> ids);
        ResponseData Import(IFormFile file);
        ResponseData CheckByFile(IFormFile file);
    }
}
