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
    public class ExamPeriodAPController : ControllerBase
    {
        private readonly IExamPeriodAPHandler _handler;

        public ExamPeriodAPController(IExamPeriodAPHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] ExamPeriodAPSearch ExamPeriodSearchModel) => _handler.Get(ExamPeriodSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut("{id}")]
        public ResponseData Update(Guid id, [FromBody] ExamPeriodAPModel model) => _handler.Update(id, model);

        [HttpPost]
        public ResponseData Create([FromBody] ExamPeriodAPModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);

        
    }
}
