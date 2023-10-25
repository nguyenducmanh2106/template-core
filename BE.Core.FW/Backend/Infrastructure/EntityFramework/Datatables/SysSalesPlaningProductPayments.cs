namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningProductPayments : BaseTable<SysSalesPlaningProductPayments>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Khóa ngoại tham chiếu đến bảng SalesPlaningPayment
        /// </summary>
        public Guid SalesPlaningPaymentId { get; set; }

        /// <summary>
        /// Khóa ngoại tham chiếu đến bảng Product
        /// </summary>
        public Guid ProductId { get; set; }

        public Guid? PricingCategoryId { get; set; }
        public string? PricingCategoryName { get; set; }

        /// <summary>
        /// Số lượng
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Đơn giá
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Ghi chú
        /// </summary>
        public string? Description { get; set; }

    }
}
