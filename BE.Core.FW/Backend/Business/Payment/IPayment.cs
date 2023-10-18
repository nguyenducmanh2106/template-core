using Backend.Infrastructure.Utils;

namespace Backend.Business.Payment
{
    public interface IPayment
    {
        ResponseData CreatePaymentUrl(PaymentModel paymentModel);
        ResponseToVnpay IpnUrlPayment();
        ResponseData GetCandicateIdFromTxnRef(Guid requestPaymentId);
        ResponseData GetListPaymentHistory(PaymentHistorySearchModel searchModel);
        Stream ExportExcelPaymentHistory(PaymentHistorySearchModel searchModel);
        ResponseData SendMailIndividual(IEnumerable<Guid> listPaymentRequestId);
        ResponseData GetPaymentRequestDetail(Guid paymentRequestId);
    }
}
