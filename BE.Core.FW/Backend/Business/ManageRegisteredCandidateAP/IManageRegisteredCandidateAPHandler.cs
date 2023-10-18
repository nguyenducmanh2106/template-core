using Backend.Infrastructure.Utils;

namespace Backend.Business.ManageRegisteredCandidateAP
{
    public interface IManageRegisteredCandidateAPHandler
    {
        Task<ResponseData> Get(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone, string accessToken, int? pageIndex, int? pageSize);
        ResponseData GetById(Guid id, string accessToken);
        Task<ResponseData> Create(ManageRegisteredCandidateAPModel model, string accessToken, string tenant);
        Task<ResponseData> Update(UpdateManageRegisteredCandidateAPAdminModel model, string accessToken);
        ResponseData Delete(Guid ids);
        Task<ResponseData> GetInfoAfterPaidAsync(Guid id, string accessToken, string tenant);
        Task<ResponseData> UpdateApId(Guid id, string apId, string accessToken, string tenant);
        Task<ResponseData> GetHistoryRegister(string accessToken, string tenant, Guid? Id);
        Task<ResponseData> ExportExcel(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone, string accessToken);
    }
}
