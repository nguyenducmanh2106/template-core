using Backend.Infrastructure.Utils;

namespace Backend.Business.ManageRegisteredCandidateIT
{
    public interface IManageRegisteredCandidateITHandler
    {
        Task<ResponseData> Create(InputManageRegisteredCandidateITModel model, string accessToken, string tenant);
        Task<ResponseData> Get(string accessToken, Guid? areaId, Guid? headerQuaterId, Guid? examId, string? fullName, string? idNumber, string? studentCode, int? pageSize, int? pageIndex);
        Task<ResponseData> GetById(Guid id, string accessToken);
        Task<ResponseData> CheckContinute(Guid examId, string accessToken, string? tenant);
        Task<ResponseData> GetHistoryRegister(string accessToken, string tenant);
        Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant);
        Task<ResponseData> GetDataExamSubjectByExamCode(Guid areaId, string examCode, string accessToken, string tenant);
        Task<ResponseData> GetInfoAfterPaid(Guid id, string accessToken, string tenant);
    }
}
