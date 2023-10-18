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
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierHandler _handler;

        public SupplierController(ISupplierHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] SupplierSearch SupplierSearchModel) => _handler.Get(SupplierSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] SupplierModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] SupplierModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
