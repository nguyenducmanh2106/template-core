using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class FaqController : ControllerBase
    {
        private readonly IFaqHandler _handler;

        public FaqController(IFaqHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] FaqSearchModel model) => _handler.Get(model);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut("{id}")]
        public ResponseData Update(Guid id, [FromBody] FaqModel model) => _handler.Update(id, model);

        [HttpPost]
        public ResponseData Create([FromBody] FaqModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);

        [HttpPost("Rate/{id}"), AllowAnonymous]
        public ResponseData Rate(Guid id, [FromBody] bool isLike) => _handler.Rate(id, isLike);

        [HttpGet("Detail/{id}"), AllowAnonymous]
        public ResponseData GetDetailAndRelateFaq(Guid id, bool countView = true, string lang = "vn") => _handler.GetDetailAndRelateFaq(id, countView, lang);

        [HttpGet("Portal"), AllowAnonymous]
        public ResponseData GetFromPortal([FromQuery] FaqSearchModel model) => _handler.GetFromPortal(model);
    }
}
