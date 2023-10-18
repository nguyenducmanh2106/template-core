using Backend.Infrastructure.Utils;

namespace Backend.Business.ManagerCandidateInvalidTopik
{
    public interface IManagerCandidateInvalidTopikHandler
    {
        ResponseData Get();
        ResponseData Create(ManagerCandidateInvalidTopikModel model);
        ResponseData Delete(Guid id);
        ResponseData Import(IFormFile file);
    }
}
