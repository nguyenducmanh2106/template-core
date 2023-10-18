using Backend.Business.Blacklist;
using Backend.Business.Navigation;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class BlacklistController : ControllerBase
    {
        private readonly IBlacklistHandler _handler;

        public BlacklistController(IBlacklistHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get(string? name, string? dob, string? cccd, bool? isDeleted)
        {
            return _handler.Get(name, dob, cccd, isDeleted);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] BlacklistModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromForm] BlacklistShowModel model)
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
        [Route("ReadDataFromFile")]
        public ResponseData ReadDataFromFile(bool isCheck, string fileName)
        {
            return _handler.ReadDataFromFile(isCheck, fileName);
        }

    }
}
