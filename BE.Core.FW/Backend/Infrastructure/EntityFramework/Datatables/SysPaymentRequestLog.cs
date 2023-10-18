using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPaymentRequestLog
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(8)]
        public string TmnCode { get; set; } = null!;
        [Required]
        public Guid TxnRef { get; set; }
        [Required, MaxLength(8)]
        public string Version { get; set; } = null!;
        public ulong Amount { get; set; }
        [Required, MaxLength(3)]
        public string CurrencyCode { get; set; } = null!;
        [Required, MaxLength(255)]
        public string OrderInfo { get; set; } = null!;
        [Required, MaxLength(255)]
        public string ReturnUrl { get; set; } = null!;
        [Required, MaxLength(45)]
        public string IpAddress { get; set; } = null!;
        [Required, MaxLength(14)]
        public string CreateDate { get; set; } = null!;
        [Required, MaxLength(14)]
        public string ExpireDate { get; set; } = null!;
        public string? UserName { get; set; }
        public DateTime DateCreateRecord { get; set; } = DateTime.Now;
        public string? ProfileCode { get; set; }
        public string? KoreanName { get; set; }
        public string? VietnameseName { get; set; }
        public string? DOB { get; set; }
        public string? ExamName { get; set; }
        public string? ExamAreaName { get; set; }
        public string? ExamLocation { get; set; }
        public string? ExamAddress { get; set; }
        public string? ExamDate { get; set; }
        public string? UserEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ExamWorkShift { get; set; }
        public string? NoteTimeEnterExamRoom { get; set; }
        public bool? IsSendMailPaymentConfirm { get; set; }
        public string? FullRequestUrl { get; set; }
    }
}
