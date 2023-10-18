using Backend.Business.Payment;
using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IPaymentAp
    {
        Task<ResponseData> CreatePaymentApUrl(PaymentApModel paymentModel);
        Task<ResponseData> GetCandicateIdFromTxnRef(Guid requestPaymentId);
        ResponseData GetListPaymentApHistory(PaymentApHistorySearchModel searchModel);
        Stream ExportExcelPaymentApHistory(PaymentApHistorySearchModel searchModel);
        ResponseData SendMailIndividual(IEnumerable<Guid> listPaymentRequestId);
        ResponseData GetPaymentApRequestDetail(Guid paymentRequestId);
        ResponseData UpdatePayment(ReceivePaymentModel receivePaymentModel);
    }
}
