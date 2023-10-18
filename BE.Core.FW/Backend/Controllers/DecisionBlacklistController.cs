using Backend.Business.DecisionBlacklist;
using Backend.Business.Navigation;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class DecisionBlacklistController : ControllerBase
    {
        private readonly IDecisionBlacklistHandler _handler;

        public DecisionBlacklistController(IDecisionBlacklistHandler handler)
        {
            _handler = handler;
        }


        [HttpGet]
        [Route("GetByBlacklistId/{id}")]
        public ResponseData GetByBlacklistId(Guid id)
        {
            return _handler.GetByBlacklistId(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] DecisionBlacklistModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] DecisionBlacklistModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpGet]
        [Route("Approve")]
        public ResponseData Approve(Guid id, bool approve, string? note)
        {
            return _handler.Approve(id, approve, note);
        }
    }
}
