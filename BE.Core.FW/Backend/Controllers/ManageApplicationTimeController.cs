using Backend.Business.ManageApplicationTime;
using Backend.Business.TimeFrameInDay;
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
    public class ManageApplicationTimeController : ControllerBase
    {
        private readonly IManageApplicationTimeHandler _handler;

        public ManageApplicationTimeController(IManageApplicationTimeHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public async Task<ResponseData> Get(Guid headerQuarterId = default(Guid), string? from = default(string), string? to = default(string), bool isCong = false, int pageNumber = 1, int pageSize = 10, bool isFullData = false)
        {
            return await _handler.Get(headerQuarterId, from, to, isCong, pageNumber, pageSize, HttpHelper.GetAccessFromHeader(Request), isFullData);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] ManageApplicationTimeModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] ManageApplicationTimeModel model)
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
