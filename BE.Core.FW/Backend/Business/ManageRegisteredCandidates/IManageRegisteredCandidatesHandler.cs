using Backend.Infrastructure.Utils;

namespace Backend.Business.ManageRegisteredCandidates
{
    public interface IManageRegisteredCandidatesHandler
    {
        Task<ResponseData> Get(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeRegisted, string? fullName, string? cccd, string? accessToken, int? pageSize, int? pageIndex);
        Task<ResponseData> GetById(Guid id, string accessToken);
        Task<ResponseData> Create(RegisteredCandidatesModel model, string? accessToken, string? tenant);
        Task<ResponseData> Update(ManageRegisteredCandidatesModel model, string accessToken);
        ResponseData Delete(Guid id);
        ResponseData RestoreDelete(Guid id);
        ResponseData Approve(Guid id, bool approve, string? note);
        ResponseData ReNewApprove(Guid id);
        ResponseData GetHistoryByName(string fullName, string birthDay);
        Task<ResponseData> CheckContinute(Guid examId, string accessToken, string? tenant);
        Task<ResponseData> GetHistoryRegister(string accessToken, string? tenant);
        Task<ResponseData> ExportExcel(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeProfile, string? fullName, string? cccd, string accessToken);
        Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant);
        Task<ResponseData> Duplicate(ManageRegisteredCandidatesModel model, string accessToken);
        ResponseData Statistic(StatisticModel model, string accessToken);
        public ResponseData StatisticDetail(DateTime dateFrom, DateTime dateTo, string accessToken);
        Task<ResponseData> GetInfoTicketUpdate(Guid id, string accessToken, string tenant);
        Task<ResponseData> UpdateByCandidate(RegisteredCandidatesModel model, string? accessToken, string? tenant);
        Task<ResponseData> GetDataExamSubjectByExamCode(Guid areaId, string examCode, string accessToken, string tenant);
    }
}
