namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysWorkflowConfig : BaseTable<SysWorkflowConfig>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Mã
        /// </summary>
        public string Code { get; set; } = default!;

        /// <summary>
        /// Tên
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
        /// Đường dẫn 
        /// </summary>
        public string? Url { get; set; }

        /// <summary>
        /// Loại workflow, dùng phân biệt luồng hợp đồng, biên bản nghiệm thu, đề nghị TTCP
        /// </summary>
        public int Type { get; set; }

        /// <summary>
        /// Là luồng ký nội bộ(chi nhánh)
        /// </summary>
        public bool? IsSignInternal { get; set; }


    }
}
