using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPaymentApRequestLog
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(8)]
        public string TmnCode { get; set; } = null!;
        [Required]
        public Guid TxnRef { get; set; }
        [Required, MaxLength(8)]
        public string Version { get; set; } = null!;
        public uint Amount { get; set; }
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
        public DateTime DateCreateRecord { get; set; } = DateTime.Now;
        public string VietnameseName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public DateTime DOB { get; set; }
        public string ExamSubject { get; set; } = null!;
        public DateTime ExamDate { get; set; }
        public bool IsSendMailPaymentConfirm { get; set; }
        public string FullRequestUrl { get; set; } = null!;
        public int Type { get; set; }
    }
}
