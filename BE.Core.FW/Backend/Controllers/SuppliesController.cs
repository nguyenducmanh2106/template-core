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
    public class SuppliesController : ControllerBase
    {
        private readonly ISuppliesHandler _handler;

        public SuppliesController(ISuppliesHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] SuppliesSearch SuppliesSearchModel) => _handler.Get(SuppliesSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] SuppliesModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] SuppliesModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
