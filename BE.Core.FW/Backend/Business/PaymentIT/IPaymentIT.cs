using Backend.Business.Payment;
using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IPaymentIT
    {
        Task<ResponseData> CreatePaymentITUrl(PaymentITModel paymentModel);
        Task<ResponseData> GetCandicateIdFromTxnRef(Guid requestPaymentId);
        ResponseData GetListPaymentITHistory(PaymentITHistorySearchModel searchModel);
        Stream ExportExcelPaymentITHistory(PaymentITHistorySearchModel searchModel);
        ResponseData SendMailIndividual(IEnumerable<Guid> listPaymentRequestId);
        ResponseData GetPaymentITRequestDetail(Guid paymentRequestId);
        ResponseData UpdatePayment(ReceivePaymentModel receivePaymentModel);
    }
}
