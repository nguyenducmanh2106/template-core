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
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerHandler _handler;

        public CustomerController(ICustomerHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] CustomerSearch CustomerSearchModel) => _handler.Get(CustomerSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] CustomerModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] CustomerModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
