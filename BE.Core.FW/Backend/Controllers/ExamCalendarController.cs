using Backend.Business.ExamCalendar;
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
    public class ExamCalendarController : ControllerBase
    {
        private readonly IExamCalendarHandler _handler;

        public ExamCalendarController(IExamCalendarHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public async Task<ResponseData> Get(Guid? areaId, Guid? headerQuarter, Guid? exam, string? dateReceive, string? dateAccept)
        {
            return await _handler.Get(areaId, headerQuarter, exam, dateReceive, dateAccept, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] ExamCalendarModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] ExamCalendarModel model)
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
