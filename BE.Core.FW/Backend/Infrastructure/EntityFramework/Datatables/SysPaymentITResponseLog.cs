using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPaymentITResponseLog
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid PaymentRequestId { get; set; }
        public ulong Amount { get; set; }
        public string? BankCode { get; set; }
        public string? BankTranNo { get; set; }
        public string? CardType { get; set; }
        public DateTime? PayDate { get; set; }
        public string? TransactionNo { get; set; }
        public string? IpAddress { get; set; }
        public bool Result { get; set; }
        public string? RawResponse { get; set; }
        public DateTime DateCreateRecord { get; set; } = DateTime.Now;
    }
}
