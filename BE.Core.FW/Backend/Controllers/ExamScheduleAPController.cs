using Backend.Business;
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
    public class ExamScheduleAPController : ControllerBase
    {
        private readonly IExamScheduleAPHandler _handler;

        public ExamScheduleAPController(IExamScheduleAPHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] ExamScheduleAPSearchModel model) => _handler.Get(model);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] ExamScheduleAPModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] ExamScheduleAPModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<Guid> id) => _handler.Delete(id);

        [HttpGet("/ExamIdInPeriod")]
        public ResponseData GetExamIdInPeriod(Guid examPeriodId, Guid? examScheduleId) => _handler.GetExamIdInPeriod(examPeriodId, examScheduleId);

        [HttpGet("Portal")]
        public Task<ResponseData> GetFromPortal([FromQuery] ExamScheduleAPSearchModel model) => _handler.GetFromPortal(model, HttpHelper.GetAccessFromHeader(Request), HttpHelper.GetTenantFromHeader(Request));
    }
}
