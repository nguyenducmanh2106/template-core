using Backend.Business.ExamFeeInformation;
using Backend.Business.ManageRegisteredCandidates;
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
    public class ExamFeeInformationController : ControllerBase
    {
        private readonly IExamFeeInformationHandler _handler;

        public ExamFeeInformationController(IExamFeeInformationHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get()
        {
            return _handler.Get();
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] ExamFeeInformationModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] ExamFeeInformationModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }
    }
}
