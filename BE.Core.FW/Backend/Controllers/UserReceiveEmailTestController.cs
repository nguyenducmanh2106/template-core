using Backend.Business.User;
using Backend.Business.UserReceiveEmail;
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
    public class UserReceiveEmailTestController : ControllerBase
    {
        private readonly IUserReceiveEmailHandler _handler;
        private readonly IHttpContextAccessor _contextAccessor;

        public UserReceiveEmailTestController(IUserReceiveEmailHandler handler, IHttpContextAccessor contextAccessor)
        {
            _handler = handler;
            _contextAccessor = contextAccessor;
        }

        [HttpGet]
        public ResponseData Get([FromQuery] string? name, int status, int pageIndex = 1, int pageSize = 10)
        {
            return _handler.Get(name, status, pageIndex, pageSize);
        }

        [HttpGet]
        [Route("GetAll")]
        public ResponseData GetAll([FromQuery] string? name, int status)
        {
            return _handler.GetAll(name, status);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        [Route("{id}")]
        public ResponseData Update(Guid id, [FromBody] UserReceiveEmailTestModel model)
        {
            return _handler.Update(id, model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] UserReceiveEmailTestModel model)
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
