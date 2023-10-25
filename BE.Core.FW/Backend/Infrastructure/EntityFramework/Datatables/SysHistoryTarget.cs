namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysHistoryTarget : BaseTable<SysHistoryTarget>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Loại mục tiêu: Phòng ban hay cá nhân
        /// </summary>
        public int Type { get; set; }

        /// <summary>
        /// Năm giao mục tiêu
        /// </summary>
        public int Year { get; set; }

        /// <summary>
        /// Id phòng ban giao mục tiêu
        /// </summary>
        public Guid DepartmentId { get; set; }

        /// <summary>
        /// Người thực hiện chỉnh sửa
        /// </summary>
        public string? Username { get; set; }

        /// <summary>
        /// Ngày chỉnh sửa
        /// </summary>
        public DateTime? ActionDate { get; set; }

        /// <summary>
        /// Nộ dung chỉnh sửa
        /// </summary>
        public string? Description { get; set; }
    }
}
