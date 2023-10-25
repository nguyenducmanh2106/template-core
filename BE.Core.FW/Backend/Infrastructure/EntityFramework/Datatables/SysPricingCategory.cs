namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPricingCategory : BaseTable<SysPricingCategory>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Mapping với bảng quyết định giá
        /// </summary>
        public Guid? PricingDecisionId { get; set; }

        /// <summary>
        /// Mapping với bảng sản phẩm
        /// </summary>
        public Guid? ProductId { get; set; }

        /// <summary>
        /// Tên quyết định
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Ghi chú
        /// </summary>
        public string? Description { get; set; }
    }
}
