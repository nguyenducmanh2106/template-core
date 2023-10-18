using Backend.Business.Blacklist;
using Backend.Business.Navigation;
using Backend.Business.ResonBlacklist;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class ResonBlacklistController : ControllerBase
    {
        private readonly IResonBlacklistHandler _handler;

        public ResonBlacklistController(IResonBlacklistHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get()
        {
            return _handler.Get();
        }

        [HttpPut]
        public ResponseData Update([FromBody] ResonBlacklistModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] ResonBlacklistModel model)
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
