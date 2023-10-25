namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysPricingDecision : BaseTable<SysPricingDecision>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Số quyết định
        /// </summary>
        public string DecisionNo { get; set; } = default!;

        /// <summary>
        /// Tên quyết định
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// Ghi chú
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Trạng thái: Còn/hết hiệu lực
        /// </summary>
        public bool Status { get; set; } = default!;

        /// <summary>
        /// Ngày hiệu lực
        /// </summary>
        public DateTime? EffectiveDate { get; set; }

        /// <summary>
        /// Đường dẫn file
        /// </summary>
        public string? FilePath { get; set; }

        /// <summary>
        /// Tên file
        /// </summary>
        public string? FileName { get; set; }
    }
}
