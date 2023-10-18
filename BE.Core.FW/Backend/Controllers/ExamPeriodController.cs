using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors]
    [Authorize]
    public class ExamPeriodController : ControllerBase
    {
        private readonly IExamPeriodHandler _handler;

        public ExamPeriodController(IExamPeriodHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] ExamPeriodSearch ExamPeriodSearchModel) => _handler.Get(ExamPeriodSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut("{id}")]
        public ResponseData Update(Guid id, [FromBody] ExamPeriodModel model) => _handler.Update(id, model);

        [HttpPost]
        public ResponseData Create([FromBody] ExamPeriodModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
