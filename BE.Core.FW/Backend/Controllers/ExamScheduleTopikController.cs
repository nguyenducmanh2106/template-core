using Backend.Business.ExamScheduleTopik;
using Backend.Business.TestScore;
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
    public class ExamScheduleTopikController : ControllerBase
    {
        private readonly IExamScheduleTopikHandler _handler;

        public ExamScheduleTopikController(IExamScheduleTopikHandler handler)
        {
            _handler = handler;
        }


        [HttpGet]
        public ResponseData Get(Guid? examId, bool? isCong, int? status, Guid? examPeriodId)
        {
            return _handler.Get(examId, isCong, status, examPeriodId);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] ExamScheduleTopikModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] ExamScheduleTopikModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpDelete]
        [Route("DeleteMany")]
        public ResponseData DeleteMany([FromBody] List<string> ids)
        {
            return _handler.DeleteMany(ids);
        }
    }
}
