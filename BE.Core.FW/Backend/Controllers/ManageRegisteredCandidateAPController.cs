using Backend.Business.ManagerCandidateInvalidTopik;
using Backend.Business.ManageRegisteredCandidateAP;
using Backend.Business.TimeFrame;
using Backend.Business.User;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    [EnableCors]
    public class ManageRegisteredCandidateAPController : ControllerBase
    {
        private readonly IManageRegisteredCandidateAPHandler _handler;

        public ManageRegisteredCandidateAPController(IManageRegisteredCandidateAPHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public async Task<ResponseData> Get(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone, int? pageIndex, int? pageSize)
        {
            return await _handler.Get(examPeriodId, examScheduleId, examId, idNumber, sbd, fullname, email, phone, HttpHelper.GetAccessFromHeader(Request), pageIndex, pageSize);
        }

        [HttpPost]
        public async Task<ResponseData> Create([FromBody] ManageRegisteredCandidateAPModel model)
        {
            return await _handler.Create(model, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpPut]
        public async Task<ResponseData> Update([FromBody] UpdateManageRegisteredCandidateAPAdminModel model)
        {
            return await _handler.Update(model, HttpHelper.GetAccessFromHeader(Request));
        }


        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("GetInfoAfterPaidAsync/{id}")]
        public async Task<ResponseData> GetInfoAfterPaidAsync(Guid id)
        {
            return await _handler.GetInfoAfterPaidAsync(id, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpPost]
        [Route("UpdateApId/{id}")]
        public async Task<ResponseData> UpdateApId(Guid id, string apId)
        {
            return await _handler.UpdateApId(id, apId, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
        }

        [HttpGet]
        [Route("GetHistoryRegister")]
        public async Task<ResponseData> GetHistoryRegister(Guid? Id)
        {
            return await _handler.GetHistoryRegister(HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request), Id);
        }

        [HttpGet]
        [Route("ExportExcel")]
        public async Task<ResponseData> ExportExcel(Guid? examPeriodId, Guid? examScheduleId, Guid? examId, string? idNumber, string? sbd, string? fullname, string? email, string? phone)
        {
            return await _handler.ExportExcel(examPeriodId, examScheduleId, examId, idNumber, sbd, fullname, email, phone, HttpHelper.GetAccessFromHeader(Request));
        }

    }
}
