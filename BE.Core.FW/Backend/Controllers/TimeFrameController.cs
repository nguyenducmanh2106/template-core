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
    public class TimeFrameController : ControllerBase
    {
        private readonly ITimeFrameHandler _handler;

        public TimeFrameController(ITimeFrameHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public async Task<ResponseData> Get()
        {
            return await _handler.GetAsync(HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<ResponseData> GetById(Guid id)
        {
            return await _handler.GetByIdAsync(id, HttpHelper.GetAccessFromHeader(Request));
        }

        [HttpPut]
        public ResponseData Update([FromBody] TimeFrameModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] TimeFrameModel model)
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
