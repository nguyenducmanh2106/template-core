using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public class PaymentITModel
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
        public string ExamSubjectDetail { get; set; } = null!;
        public int Type { get; set; } = (int)Constant.PaymentPortalType.Vnpay;
    }

    public class PaymentITHistorySearchModel
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

    public class PaymentITSearchResponse
    {
        public SysPaymentITRequestLog PaymentRequest { get; set; } = default!;
        public IEnumerable<SysPaymentITResponseLog>? PaymentResponse { get; set; }
        public int? PaymentStatus { get; set; }
    }

    public class PaymentITConfirmationEmailModel
    {
        public SysPaymentITRequestLog PaymentRequest { get; set; } = null!;
        public SysPaymentITResponseLog PaymentResponse { get; set; } = null!;
        public Dictionary<string, string> LocalazationText { get; set; } = new Dictionary<string, string>();
        public string? ExamDetailHtml { get; set; }
    }

    public class ExamITDetailModel
    {
        public string? VersionName { get; set; }
        public string? Language { get; set; }
        public string? LocationTest { get; set; }
        public string? DateTest { get; set; }
        public string? TimeTest { get; set; }
    }
}
