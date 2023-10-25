using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningPaymentCosts : BaseTable<SysSalesPlaningPaymentCosts>
    {
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// khóa ngoài liên kết với bảng SalePlanningPayment
        /// </summary>
        public Guid SalesPlaningPaymentId { get; set; }

        /// <summary>
        /// Số tiền chi
        /// </summary>
        public decimal Price { get; set; }
        /// <summary>
        /// Ghi chú
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Nội dung
        /// </summary>
        public string? Content { get; set; }
    }
}
