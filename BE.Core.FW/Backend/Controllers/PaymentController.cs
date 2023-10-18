using Backend.Business.Payment;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize, EnableCors]
    public class PaymentController : ControllerBase
    {
        private readonly IPayment _handler;

        public PaymentController(IPayment handler) => _handler = handler;

        [HttpPost("CreatePaymentUrl")]
        public ResponseData CreatePaymentUrl(PaymentModel paymentModel) => _handler.CreatePaymentUrl(paymentModel);

        [HttpGet("GetCandicateIdFromTxnRef")]
        public ResponseData GetCandicateIdFromTxnRef(Guid requestPaymentId) => _handler.GetCandicateIdFromTxnRef(requestPaymentId);

        [HttpGet("PaymentHistory")]
        public ResponseData PaymentHistory([FromQuery] PaymentHistorySearchModel searchModel) => _handler.GetListPaymentHistory(searchModel);

        [HttpGet("ExportPaymentHistory")]
        public IActionResult ExportPaymentHistory([FromQuery] PaymentHistorySearchModel searchModel)
        {
            var fileStream = _handler.ExportExcelPaymentHistory(searchModel);
            if (fileStream.Length > 0)
                return File(fileStream, "application/octet-stream", $"PaymentHistory_{DateTime.Now:ddMMyyyyHHmmss}.xlsx");
            else
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
        }

        [HttpPost("SendMailIndividual")]
        public ResponseData SendMailIndividual([FromBody] IEnumerable<Guid> listPaymentRequestId) => _handler.SendMailIndividual(listPaymentRequestId);

        [HttpGet("GetPaymentRequestDetail")]
        public ResponseData GetPaymentRequestDetail(Guid paymentRequestId) => _handler.GetPaymentRequestDetail(paymentRequestId);
    }
}
