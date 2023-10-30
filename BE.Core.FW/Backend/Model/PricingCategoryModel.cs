namespace Backend.Model
{
    public class PricingCategoryModel
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Mapping với bảng quyết định giá
        /// </summary>
        public Guid? PricingDecisionId { get; set; }

        public string? PricingDecisionName { get; set; }

        public string? PricingDecisionUrl { get; set; }

        /// <summary>
        /// Mapping với bảng sản phẩm
        /// </summary>
        public Guid? ProductId { get; set; }

        public string? ProductName { get; set; }

        /// <summary>
        /// Tên quy định
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// Ghi chú
        /// </summary>
        public string? Description { get; set; }
    }
}
