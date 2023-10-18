using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public class PaymentApModel
    {
        public string CandidateId { get; set; } = null!;
        public string ReturnUrl { get; set; } = null!;
        public string VietnameseName { get; set; } = null!;
        public DateTime DOB { get; set; }
        public string ExamSubject { get; set; } = null!;
        public DateTime ExamDate { get; set; }
        public string UserEmail { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public bool UseEnglishLanguage { get; set; } = false;
        public int Type { get; set; } = (int)Constant.PaymentPortalType.Vnpay;
    }

    public class PaymentApHistorySearchModel
    {
        public string? CandicateName { get; set; }
        public string? PhoneNumber { get; set; }
        public int? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? TransactionNo { get; set; }
        public Guid? ExamPeriodId { get; set; }
        public string? UserEmail { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class PaymentApSearchResponse
    {
        public SysPaymentApRequestLog PaymentRequest { get; set; } = default!;
        public IEnumerable<SysPaymentApResponseLog>? PaymentResponse { get; set; }
        public int? PaymentStatus { get; set; }
    }

    public class PaymentApConfirmationEmailModel
    {
        public SysPaymentApRequestLog PaymentRequest { get; set; } = null!;
        public SysPaymentApResponseLog PaymentResponse { get; set; } = null!;
        public Dictionary<string, string> LocalazationText { get; set; } = new Dictionary<string, string>();
        public string? ExamDetailHtml { get; set; }
    }

    public class ExamApDetailModel
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public int Price { get; set; }
        public string? Date { get; set; }
        public string? Time { get; set; }
    }

    public class ReceivePaymentModel
    {
        public string UpdateId { get; set; } = null!;
        public string Key { get; set; } = null!;
        public string Code { get; set; } = null!;
        public bool Result { get; set; }
        public uint Amount { get; set; }
        public string? BankCode { get; set; }
        public string? BankTransactionNo { get; set; }
        public string? PaymentTransactionNo { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime? PayDate { get; set; }
        public int Type { get; set; }
        public string RawResponse { get; set; } = null!;
    }
}
