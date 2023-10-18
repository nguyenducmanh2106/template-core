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
    public class PaymentApController : ControllerBase
    {
        private readonly IPaymentAp _handler;

        public PaymentApController(IPaymentAp handler) => _handler = handler;

        [HttpPost("CreatePaymentUrl")]
        public async Task<ResponseData> CreatePaymentUrl(PaymentApModel paymentModel) => await _handler.CreatePaymentApUrl(paymentModel);

        [HttpGet("GetCandicateIdFromTxnRef")]
        public async Task<ResponseData> GetCandicateIdFromTxnRef(Guid requestPaymentId) => await _handler.GetCandicateIdFromTxnRef(requestPaymentId);

        [HttpGet("PaymentHistory")]
        public ResponseData PaymentHistory([FromQuery] PaymentApHistorySearchModel searchModel) => _handler.GetListPaymentApHistory(searchModel);

        [HttpGet("ExportPaymentHistory")]
        public IActionResult ExportPaymentHistory([FromQuery] PaymentApHistorySearchModel searchModel)
        {
            var fileStream = _handler.ExportExcelPaymentApHistory(searchModel);
            if (fileStream.Length > 0)
                return File(fileStream, "application/octet-stream", $"PaymentHistory_{DateTime.Now:ddMMyyyyHHmmss}.xlsx");
            else
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
        }

        [HttpPost("SendMailIndividual")]
        public ResponseData SendMailIndividual([FromBody] IEnumerable<Guid> listPaymentRequestId) => _handler.SendMailIndividual(listPaymentRequestId);

        [HttpGet("GetPaymentRequestDetail")]
        public ResponseData GetPaymentRequestDetail(Guid paymentRequestId) => _handler.GetPaymentApRequestDetail(paymentRequestId);

        [HttpPut("UpdatePayment"), AllowAnonymous]
        public ResponseData UpdatePayment([FromBody] ReceivePaymentModel model) => _handler.UpdatePayment(model);
    }
}
