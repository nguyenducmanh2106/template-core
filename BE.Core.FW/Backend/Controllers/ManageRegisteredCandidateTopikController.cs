using Backend.Business.ManageRegisteredCandidates;
using Backend.Business.ManageRegisteredCandidateTopik;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SelectPdf;
using System.Drawing;
using System.IO;

namespace Backend.Controllers
{
    [DisableRequestSizeLimit]
    [ApiController]
    [Route("[controller]")]
    [EnableCors]
    [Authorize]
    public class ManageRegisteredCandidateTopikController : ControllerBase
    {
        private readonly IManageRegisteredCandidateTopikHandler _handler;

        public ManageRegisteredCandidateTopikController(IManageRegisteredCandidateTopikHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public Task<ResponseData> Get(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, int? pageIndex, int? pageSize, string? username, string? sbd, Guid? examPeriod, bool? blacklist)
        {
            return _handler.Get(areaId, placeTest, examVersion, exam, fullname, cccd, dateReceive, HttpHelper.GetAccessFromHeader(Request), pageIndex, pageSize, username, sbd, examPeriod, blacklist);
        }

        [HttpGet]
        [Route("b2cUser")]
        public Task<ResponseData> GetByB2CUser()
        {
            return _handler.GetByUserB2C(HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("statistical")]
        public Task<ResponseData> Statistical(Guid? areaId, Guid? placeTest, Guid? examScheduleId, int? status, Guid? examPeriodId)
        {
            return _handler.Statistical(areaId, placeTest, examScheduleId, status, examPeriodId, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("export-statistical")]
        public async Task<ResponseData> ExportExcelStatistical(Guid? areaId, Guid? placeTest, Guid? examScheduleId, int? status, Guid? examPeriodId)
        {
            return await _handler.ExportExcelStatistical(areaId, placeTest, examScheduleId, status, examPeriodId, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("{id}")]
        public Task<ResponseData> GetById(Guid id)
        {
            return _handler.GetById(id, HttpHelper.GetAccessFromHeader(Request));
        }

        [DisableRequestSizeLimit]
        [HttpPut]
        public async Task<ResponseData> Update([FromForm] ManageRegisteredCandidateTopikModel model)
        {
            Utils.LogRequest(Request, model);
            return await _handler.Update(model, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpPost]
        public async Task<ResponseData> Create([FromBody] RegisteredCandidateTopikModel model)
        {
            Utils.LogRequest(Request, model);
            string userName = Request.Headers["username"].ToString();
            userName = userName.Trim();
            return await _handler.Create(model, userName, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpDelete]
        [Route("DeleteSlot")]
        public ResponseData DeleteSlot([FromBody] SlotRegister model)
        {
            return _handler.DeleteSlot(model);
        }

        [HttpGet]
        [Route("GetHeaderQuater/{areaId}/{examTopikId}")]
        public async Task<ResponseData> GetHeaderQuater(Guid areaId, Guid examTopikId)
        {
            return await _handler.GetHeaderQuater(areaId, examTopikId, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }


        [HttpGet]
        [Route("CheckSlot/{placeId}/{examTopikId}/{userId}/{fullName}/{dob}")]
        public async Task<ResponseData> CheckSlot(Guid placeId, Guid examTopikId, Guid userId, string fullName, DateTime dob)
        {
            Utils.LogRequest(Request, new
            {
                placeId = placeId,
                examTopikId = examTopikId,
                userId = userId,
                fullName = fullName,
                dob = dob
            });
            return await _handler.CheckSlot(placeId, examTopikId, userId, fullName, dob, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("GetInfoAfterPaid/{id}")]
        public async Task<ResponseData> GetInfoAfterPaid(Guid id)
        {
            return await _handler.GetInfoAfterPaid(id, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportDataTestSchedule/{testScheduleId}")]
        public async Task<ResponseData> ExportDataTestSchedule(Guid testScheduleId)
        {
            return await _handler.ExportDataTestSchedule(testScheduleId, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportExcel")]
        public async Task<ResponseData> ExportExcel(Guid? areaId, Guid? placeTest, Guid? examVersion, Guid? exam, string? fullname, string? cccd, string? dateReceive, string? username, string? sbdSearch, Guid? examPeriod, bool? blacklist)
        {
            return await _handler.ExportExcel(areaId, placeTest, examVersion, exam, fullname, cccd, dateReceive, HttpHelper.GetAccessFromHeader(Request), username, sbdSearch, examPeriod, blacklist);
        }

        [HttpGet]
        [Route("DeleteFile")]
        public ResponseData DeleteFile(string filePath)
        {
            return _handler.DeleteFile(filePath);
        }

        [HttpGet]
        [Route("GetDataTicket")]
        public Task<ResponseData> GetDataTicket(Guid id)
        {
            return _handler.GetDataTicket(id, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportPdfTicket")]
        public async Task<IActionResult> ExportPdfTicket(Guid id)
        {
            var converter = new SelectPdf.HtmlToPdf();
            converter.Options.PdfPageSize = SelectPdf.PdfPageSize.A4;
            var ms = new MemoryStream();
            var data = await _handler.ExportPdfTicket(id, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
            if (data != null && data.Code == Code.Success)
            {
                var res = data as dynamic;
                var pdf = converter.ConvertHtmlString(res.Data.Html);
                pdf.Save(ms);
                ms.Seek(0, SeekOrigin.Begin);
                return File(ms, System.Net.Mime.MediaTypeNames.Application.Pdf, "Ticket.pdf");
            }

            return Ok();
        }


        [HttpGet]
        [Route("ExportDataTestScheduleByHeadQuarter")]
        public async Task<IActionResult> ExportDataTestScheduleByHeadQuarter(Guid id, Guid headQuarterId)
        {
            var data = await _handler.ExportDataTestScheduleByHeadQuarter(id, headQuarterId, HttpHelper.GetAccessFromHeader(Request)) as ResponseDataObject<MemoryStream>;
            if (data != null && data.Code == Code.Success)
            {
                var res = data.Data as MemoryStream;

                return File(res, System.Net.Mime.MediaTypeNames.Application.Pdf, "Ticket.pdf");
            }

            return Ok();
        }


        [HttpGet]
        [Route("GetPdfTicket")]
        public async Task<IActionResult> GetPdfTicket(Guid id, string? language)
        {
            var converter = new SelectPdf.HtmlToPdf();
            converter.Options.PdfPageSize = SelectPdf.PdfPageSize.Custom;
            converter.Options.PdfPageCustomSize = new SizeF(816, 1056);
            var ms = new MemoryStream();
            var data = await _handler.GetPdfTicket(id, language, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
            if (data != null && data.Code == Code.Success)
            {
                var res = data as dynamic;
                var pdf = converter.ConvertHtmlString(res.Data.Html);
                pdf.Save(ms);
                ms.Seek(0, SeekOrigin.Begin);
                return File(ms, System.Net.Mime.MediaTypeNames.Application.Pdf, "Ticket.pdf");
            }

            return Ok();
        }

        [HttpGet]
        [Route("CheckResgisted")]
        public async Task<ResponseData> CheckResgisted()
        {
            return await _handler.CheckResgisted(HttpHelper.GetAccessFromHeader(Request), null);
        }

        [HttpGet]
        [Route("CheckFileCanDown")]
        public async Task<ResponseData> CheckFileCanDown(Guid testScheduleId, int type)
        {
            return await _handler.CheckFileCanDown(testScheduleId, type, HttpHelper.GetAccessFromHeader(Request));
        }


        [HttpGet]
        [Route("GetAllImageCandidate")]
        public async Task<ResponseData> GetAllImageCandidate(Guid examPeriodId)
        {
            return await _handler.GetAllImageCandidate(examPeriodId, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("UpdateInfoCandidate")]
        public async Task<ResponseData> UpdateInfoCandidate()
        {
            return await _handler.UpdateInfoCandidate(HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportImageByHeadquarter")]
        public async Task<ResponseData> ExportImageByHeadquarter(Guid testScheduleId)
        {
            return await _handler.ExportImageByTestSchedule(testScheduleId, HttpHelper.GetAccessFromHeader(Request));
        }


        [HttpGet]
        [Route("ExportImageAvatarByTestSchedule")]
        public async Task<ResponseData> ExportImageAvatarByTestSchedule(Guid testScheduleId)
        {
            return await _handler.ExportImageAvatarByTestSchedule(testScheduleId, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportExcelTotalCandidate")]
        public async Task<ResponseData> ExportExcelTotalCandidate(Guid examPeriod)
        {
            return await _handler.ExportExcelTotalCandidate(examPeriod, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportFileHtml")]
        public async Task<ResponseData> ExportFileHtml()
        {
            return await _handler.ExportFileHtml();
        }

        [HttpGet]
        [Route("ExportExcellSatisticExamPeriod")]
        public async Task<ResponseData> ExportExcellSatisticExamPeriod(Guid examPeriod)
        {
            return await _handler.ExportExcellSatisticExamPeriod(examPeriod, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("CheckFileSatisticCanDown")]
        public ResponseData CheckFileSatisticCanDown(Guid examPeriod, int type)
        {
            return _handler.CheckFileSatisticCanDown(examPeriod, type);
        }


        [HttpGet]
        [Route("UpdateUserInfo")]
        public async Task<ResponseData> UpdateUserInfo()
        {
            return await _handler.UpdateUserInfo(HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("SendEmailAgain")]
        public async Task<ResponseData> SendEmailAgain()
        {
            return await _handler.SendEmailAgain(HttpHelper.GetAccessFromHeader(Request));
        }
    }
}
