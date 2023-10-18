using Backend.Infrastructure.EntityFramework.Datatables;

namespace Backend.Business.Payment
{
    public class PaymentModel
    {
        public string CandidateTopikId { get; set; } = null!;
        public ulong Amount { get; set; }
        public string ReturnUrl { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string ProfileCode { get; set; } = null!;
        public string KoreanName { get; set; } = null!;
        public string VietnameseName { get; set; } = null!;
        public string DOB { get; set; } = null!;
        public string ExamName { get; set; } = null!;
        public string ExamAreaName { get; set; } = null!;
        public string ExamLocation { get; set; } = null!;
        public string ExamAddress { get; set; } = null!;
        public string ExamDate { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string ExamWorkShift { get; set; } = null!;
        public bool UseEnglishLanguage { get; set; } = false;
        public string NoteTimeEnterExamRoom { get; set; } = null!;
    }

    public class ResponseToVnpay
    {
        public string RspCode { get; set; } = null!;
        public string? Message { get; set; }
    }

    public class PaymentHistorySearchModel
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

    public class PaymentSearchResponse
    {
        public SysPaymentRequestLog PaymentRequest { get; set; } = null!;
        public IEnumerable<SysPaymentResponseLog>? PaymentResponse { get; set; }
        public int? PaymentStatus { get; set; }
    }

    public class PaymentConfirmationEmailModel
    {
        public SysPaymentRequestLog PaymentRequest { get; set; } = null!;
        public SysPaymentResponseLog PaymentResponse { get; set; } = null!;
        public Dictionary<string, string> LocalazationText { get; set; } = new Dictionary<string, string>();
    }
}
