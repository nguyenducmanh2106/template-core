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
    public class SuppliesCategoryController : ControllerBase
    {
        private readonly ISuppliesCategoryHandler _handler;

        public SuppliesCategoryController(ISuppliesCategoryHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] SuppliesCategorySearch SuppliesCategorySearchModel) => _handler.Get(SuppliesCategorySearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] SuppliesCategoryModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] SuppliesCategoryModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
