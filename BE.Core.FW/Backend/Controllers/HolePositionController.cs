using Backend.Business.Blacklist;
using Backend.Business.Navigation;
using Backend.Business.ResonBlacklist;
using Backend.HoldPosition;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class HolePositionController : ControllerBase
    {
        private readonly IHoldPositionHandler _handler;

        public HolePositionController(IHoldPositionHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get()
        {
            return _handler.Get();
        }

        [HttpGet]
        [Route("GetByCalendarId/{id}")]
        public ResponseData GetByCalendarId(Guid id)
        {
            return _handler.GetByCalendarId(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] HoldPositionModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] HoldPositionModel model)
        {
            return _handler.Create(model);
        }

    }
}
