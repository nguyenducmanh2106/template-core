using Backend.Business.ManageRegisteredCandidateIT;
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
    public class ManageRegisteredCandidatesITController : ControllerBase
    {
        private readonly IManageRegisteredCandidateITHandler _handler;

        public ManageRegisteredCandidatesITController(IManageRegisteredCandidateITHandler handler)
        {
            _handler = handler;
        }

        [HttpPost]
        public async Task<ResponseData> Create([FromBody] InputManageRegisteredCandidateITModel model)
        {
            return await _handler.Create(model, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        public Task<ResponseData> Get(Guid? areaId, Guid? headerQuaterId, Guid? examId, string? fullName, string? idNumber, string? studentCode, int? pageSize, int? pageIndex)
        {
            return _handler.Get(HttpHelper.GetAccessFromHeader(Request), areaId, headerQuaterId, examId, fullName, idNumber, studentCode, pageSize, pageIndex);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ResponseData> GetById(Guid id)
        {
            return await _handler.GetById(id, HttpHelper.GetAccessFromHeader(Request));
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
        [Route("GetPdfTicket")]
        public async Task<IActionResult> GetPdfTicket(Guid id, string? language)
        {
            var converter = new SelectPdf.HtmlToPdf();
            converter.Options.PdfPageSize = SelectPdf.PdfPageSize.A4;
            //converter.Options.PdfPageCustomSize = new SizeF(816, 1056);
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
        [Route("GetDataExamSubjectByExamCode")]
        public async Task<ResponseData> GetDataExamSubjectByExamCode(Guid areaId, string examCode)
        {
            return await _handler.GetDataExamSubjectByExamCode(areaId, examCode, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }


        [HttpGet]
        [Route("GetInfoAfterPaid/{id}")]
        public async Task<ResponseData> GetInfoAfterPaid(Guid id)
        {
            return await _handler.GetInfoAfterPaid(id, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }
    }
}
