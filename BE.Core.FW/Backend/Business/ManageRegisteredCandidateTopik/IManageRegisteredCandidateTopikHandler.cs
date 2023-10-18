using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public interface IManageRegisteredCandidateTopikHandler
    {
        Task<ResponseData> Get(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, string? accessToken, int? pageIndex, int? pageSize, string? username, string? sbd, Guid? examPeriod, bool? blacklist);
        Task<ResponseData> Statistical(Guid? areaId, Guid? placeTest, Guid? examinationId, int? status, Guid? examPeriodId, string? accessToken, string? tenant = "");
        Task<ResponseData> ExportExcelStatistical(Guid? areaId, Guid? placeTest, Guid? examinationId, int? status, Guid? examPeriodId, string? accessToken, string? tenant = "");
        Task<ResponseData> GetById(Guid id, string accessToken);
        Task<ResponseData> GetByUserB2C(string? accessToken, string? tenant = "");
        Task<ResponseData> Create(RegisteredCandidateTopikModel model, string userName, string accessToken = "", string? tenant = "");
        Task<ResponseData> Update(ManageRegisteredCandidateTopikModel model, string accessToken);
        ResponseData Delete(Guid id);
        ResponseData DeleteSlot(SlotRegister model);
        Task<ResponseData> GetHeaderQuater(Guid areaId, Guid examTopikId, string? accessToken, string? tenant = "");
        Task<ResponseData> CheckSlot(Guid placeId, Guid examTopikIdk, Guid userId, string fullName, DateTime dob, string? accessToken, string? tenant = "");
        Task<ResponseData> GetInfoAfterPaid(Guid id, string accessToken, string? tenant = "");
        Task<ResponseData> ExportDataTestSchedule(Guid testScheduleId, string? accessToken);
        ResponseData DeleteFile(string filePath);
        Task<ResponseData> GetDataTicket(Guid id, string? accessToken);
        Task<ResponseData> ExportPdfTicket(Guid id, string? accessToken, string? tenant = "");
        Task<ResponseData> ExportDataTestScheduleByHeadQuarter(Guid testScheduleId, Guid headQuarter, string? accessToken);
        Task<ResponseData> GetPdfTicket(Guid id, string? language, string? accessToken, string? tenant);
        Task<ResponseData> ExportExcel(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, string? accessToken, string? username, string? sbdSearch, Guid? examPeriod, bool? blacklist);
        Task<ResponseData> CheckResgisted(string accessToken, ResponseDataObject<B2CUserModel>? profileIn);
        Task<ResponseData> CheckFileCanDown(Guid testScheduleId, int type, string accessToken);
        Task<ResponseData> GetAllImageCandidate(Guid examPeriodId, string accessToken);
        Task<ResponseData> UpdateInfoCandidate(string accessToken);
        Task<ResponseData> ExportImageByTestSchedule(Guid testScheduleId, string? accessToken);
        Task<ResponseData> ExportImageAvatarByTestSchedule(Guid testScheduleId, string? accessToken);
        Task<ResponseData> ExportExcelTotalCandidate(Guid examPeriod, string accessToken);
        Task<ResponseData> ExportFileHtml();
        Task<ResponseData> ExportExcellSatisticExamPeriod(Guid examPeriod, string accessToken);
        ResponseData CheckFileSatisticCanDown(Guid examPeriod, int type);
        Task<ResponseData> UpdateUserInfo(string accessToken);
        Task<ResponseData> SendEmailAgain(string accessToken);
    }
}
