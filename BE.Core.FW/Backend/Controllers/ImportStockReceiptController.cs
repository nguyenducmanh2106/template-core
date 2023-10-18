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
    public class ImportStockReceiptController : ControllerBase
    {
        private readonly IImportStockReceiptHandler _handler;

        public ImportStockReceiptController(IImportStockReceiptHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] ImportStockReceiptSearch ImportStockReceiptSearchModel) => _handler.Get(ImportStockReceiptSearchModel);

        [HttpGet("Detail")]
        public ResponseData GetDetail(Guid id) => _handler.GetDetail(id);

        [HttpPut]
        public ResponseData Update([FromForm] ImportStockReceiptModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromForm] ImportStockReceiptModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);

        [HttpPost("SendForApproval")]
        public ResponseData SendForApproval([FromBody] Guid id) => _handler.SendForApproval(id);

        [HttpPost("Approve")]
        public ResponseData Approve([FromBody] ApproveReceiptModel model) => _handler.Approve(model);

        [HttpGet("DownloadReceipt")]
        public IActionResult DownloadReceipt(Guid id)
        {
            var fileStream = _handler.DownloadReceipt(id);
            if (fileStream.Length > 0)
                return File(fileStream, "application/octet-stream", $"Receipt_{DateTime.Now:ddMMyyyyHHmmss}.xlsx");
            else
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
