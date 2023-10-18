using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPaymentApResponseLog
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(100)]
        public Guid PaymentRequestId { get; set; }
        public ulong Amount { get; set; }
        [MaxLength(255)]
        public string? OrderInfo { get; set; }
        [MaxLength(2)]
        public string? ResponseCode { get; set; }
        [MaxLength(200)]
        public string? ResponseCodeDescription { get; set; }
        [MaxLength(20)]
        public string? BankCode { get; set; }
        [MaxLength(255)]
        public string? BankTranNo { get; set; }
        [MaxLength(20)]
        public string? CardType { get; set; }
        [MaxLength(14)]
        public string? PayDate { get; set; }
        [MaxLength(15)]
        public string? TransactionNo { get; set; }
        [MaxLength(2)]
        public string? TransactionStatus { get; set; }
        [MaxLength(200)]
        public string? TransactionStatusDescription { get; set; }
        public DateTime DateCreateRecord { get; set; } = DateTime.Now;
        [MaxLength(10)]
        public string? ResponseToVnp { get; set; }
        [MaxLength(100)]
        public string? ResponseToVnpDescription { get; set; }
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        [MaxLength(1000)]
        public string? RawQueryString { get; set; }
    }
}
