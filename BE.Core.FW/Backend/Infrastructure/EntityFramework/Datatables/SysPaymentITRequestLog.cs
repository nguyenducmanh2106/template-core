using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPaymentITRequestLog
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid CandidateId { get; set; }
        public uint Amount { get; set; }
        [Required, MaxLength(3)]
        public string CurrencyCode { get; set; } = null!;
        [Required, MaxLength(255)]
        public string OrderInfo { get; set; } = null!;
        [Required, MaxLength(255)]
        public string ReturnUrl { get; set; } = null!;
        public DateTime DateCreateRecord { get; set; } = DateTime.Now;
        public string VietnameseName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public DateTime DOB { get; set; }
        public string ExamSubject { get; set; } = null!;
        public string ExamSubjectDetail { get; set; } = null!;
        public bool IsSendMailPaymentConfirm { get; set; }
        public string FullRequestUrl { get; set; } = null!;
        public int Type { get; set; }
    }
}
