using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors]
    [Authorize]
    public class SuppliesGroupController : ControllerBase
    {
        private readonly ISuppliesGroupHandler _handler;

        public SuppliesGroupController(ISuppliesGroupHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] SuppliesGroupSearch suppliesGroupSearchModel) => _handler.Get(suppliesGroupSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] SuppliesGroupModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] SuppliesGroupModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
