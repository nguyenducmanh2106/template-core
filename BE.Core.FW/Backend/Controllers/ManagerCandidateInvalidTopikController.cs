using Backend.Business.ManagerCandidateInvalidTopik;
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
    public class ManagerCandidateInvalidTopikController : ControllerBase
    {
        private readonly IManagerCandidateInvalidTopikHandler _handler;

        public ManagerCandidateInvalidTopikController(IManagerCandidateInvalidTopikHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get()
        {
            return _handler.Get();
        }

        [HttpPost]
        public ResponseData Create([FromBody] ManagerCandidateInvalidTopikModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpPost]
        [Route("Import")]
        public ResponseData Import(IFormFile file)
        {
            return _handler.Import(file);
        }
    }
}
