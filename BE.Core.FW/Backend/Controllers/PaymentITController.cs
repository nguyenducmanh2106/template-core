using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize, EnableCors]
    public class PaymentITController : ControllerBase
    {
        private readonly IPaymentIT _handler;

        public PaymentITController(IPaymentIT handler) => _handler = handler;

        [HttpPost("CreatePaymentUrl")]
        public async Task<ResponseData> CreatePaymentUrl(PaymentITModel paymentModel) => await _handler.CreatePaymentITUrl(paymentModel);

        [HttpGet("GetCandicateIdFromTxnRef")]
        public async Task<ResponseData> GetCandicateIdFromTxnRef(Guid requestPaymentId) => await _handler.GetCandicateIdFromTxnRef(requestPaymentId);

        [HttpGet("PaymentHistory")]
        public ResponseData PaymentHistory([FromQuery] PaymentITHistorySearchModel searchModel) => _handler.GetListPaymentITHistory(searchModel);

        [HttpGet("ExportPaymentHistory")]
        public IActionResult ExportPaymentHistory([FromQuery] PaymentITHistorySearchModel searchModel)
        {
            var fileStream = _handler.ExportExcelPaymentITHistory(searchModel);
            if (fileStream.Length > 0)
                return File(fileStream, "application/octet-stream", $"PaymentHistory_{DateTime.Now:ddMMyyyyHHmmss}.xlsx");
            else
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
        }

        [HttpPost("SendMailIndividual")]
        public ResponseData SendMailIndividual([FromBody] IEnumerable<Guid> listPaymentRequestId) => _handler.SendMailIndividual(listPaymentRequestId);

        [HttpGet("GetPaymentRequestDetail")]
        public ResponseData GetPaymentRequestDetail(Guid paymentRequestId) => _handler.GetPaymentITRequestDetail(paymentRequestId);

        [HttpPut("UpdatePayment"), AllowAnonymous]
        public ResponseData UpdatePayment([FromBody] ReceivePaymentModel model) => _handler.UpdatePayment(model);
    }
}
