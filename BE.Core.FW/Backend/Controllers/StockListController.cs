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
    public class StockListController : ControllerBase
    {
        private readonly IStockListHandler _handler;

        public StockListController(IStockListHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] StockListSearch stockListSearchModel) => _handler.Get(stockListSearchModel);

        [HttpGet("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut]
        public ResponseData Update([FromBody] StockListModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromBody] StockListModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);
    }
}
