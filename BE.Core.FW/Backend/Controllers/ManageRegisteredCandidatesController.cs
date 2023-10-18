using Backend.Business.ManageRegisteredCandidates;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    [EnableCors]
    public class ManageRegisteredCandidatesController : ControllerBase
    {
        private readonly IManageRegisteredCandidatesHandler _handler;

        public ManageRegisteredCandidatesController(IManageRegisteredCandidatesHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public Task<ResponseData> Get(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeProfile, string? fullName, string? cccd, int? pageSize, int? pageIndex)
        {
            return _handler.Get(areaId, headerQuaterId, examId, status, statusPaid, dateAccept, dateReceive, submissionTimeId, codeProfile, fullName, cccd, HttpHelper.GetAccessFromHeader(Request), pageSize, pageIndex);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ResponseData> GetById(Guid id)
        {
            return await _handler.GetById(id, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpPut]
        public async Task<ResponseData> Update([FromForm] ManageRegisteredCandidatesModel model)
        {
            return await _handler.Update(model, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpPost]
        public async Task<ResponseData> Create([FromBody] RegisteredCandidatesModel model)
        {
            return await _handler.Create(model, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }


        [HttpDelete]
        [Route("Approve")]
        public ResponseData Approve(Guid id, bool approve, string? note)
        {
            return _handler.Approve(id, approve, note);
        }

        [HttpPut]
        [Route("ReNewApprove")]
        public ResponseData ReNewApprove(Guid id)
        {
            return _handler.ReNewApprove(id);
        }

        [HttpGet]
        [Route("GetHistoryByName")]
        public ResponseData GetHistoryByName(string fullName, string birthDay)
        {
            return _handler.GetHistoryByName(fullName, birthDay);
        }

        [HttpGet]
        [Route("CheckContinute")]
        public async Task<ResponseData> CheckContinute(Guid examId)
        {
            return await _handler.CheckContinute(examId, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("GetHistoryRegister")]
        public async Task<ResponseData> GetHistoryRegister()
        {
            return await _handler.GetHistoryRegister(HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("ExportExcel")]
        public async Task<ResponseData> ExportExcel(Guid? areaId, Guid? headerQuaterId, Guid? examId, int? status, int? statusPaid, string? dateAccept, string? dateReceive, Guid? submissionTimeId, string? codeProfile, string? fullName, string? cccd)
        {
            return await _handler.ExportExcel(areaId, headerQuaterId, examId, status, statusPaid, dateAccept, dateReceive, submissionTimeId, codeProfile, fullName, cccd, HttpHelper.GetAccessFromHeader(Request));
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

        [HttpPost]
        [Route("Duplicate")]
        public async Task<ResponseData> Duplicate([FromForm] ManageRegisteredCandidatesModel model)
        {
            return await _handler.Duplicate(model, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet("Statistic")]
        public ResponseData Statistic([FromQuery] StatisticModel model) => _handler.Statistic(model, HttpHelper.GetAccessFromHeader(Request));

        [HttpGet("StatisticDetail")]
        public ResponseData StatisticDetail(DateTime dateFrom, DateTime dateTo) => _handler.StatisticDetail(dateFrom, dateTo, HttpHelper.GetAccessFromHeader(Request));


        [HttpGet]
        [Route("GetInfoTicketUpdate")]
        public async Task<ResponseData> GetInfoTicketUpdate(Guid id)
        {
            return await _handler.GetInfoTicketUpdate(id, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpPost]
        [Route("UpdateByCandidate")]
        public async Task<ResponseData> UpdateByCandidate([FromBody] RegisteredCandidatesModel model)
        {
            return await _handler.UpdateByCandidate(model, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("GetDataExamSubjectByExamCode")]
        public async Task<ResponseData> GetDataExamSubjectByExamCode(Guid areaId, string examCode)
        {
            return await _handler.GetDataExamSubjectByExamCode(areaId, examCode, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }
    }
}
