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
    public class SuppliesKindController : ControllerBase
    {
        private readonly ISuppliesKindHandler _handler;

        public SuppliesKindController(ISuppliesKindHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] SuppliesKindSearch SuppliesKindSearchModel) => _handler.Get(SuppliesKindSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] SuppliesKindModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] SuppliesKindModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
