using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningPaymentMapping : BaseTable<SysSalesPlaningPaymentMapping>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SalesPlaningPaymentId { get; set; }

        public decimal? PaymentPrice { get; set; }

        /// <summary>
        /// Ngày thanh toán
        /// </summary>
        public DateTime? PaymentDate { get; set; }
        public string? Description { get; set; }

        public string? FilePath { get; set; }
        public string? FileName { get; set; }
    }
}
