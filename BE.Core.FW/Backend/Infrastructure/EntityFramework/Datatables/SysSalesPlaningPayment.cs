using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningPayment : BaseTable<SysSalesPlaningPayment>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SalesPlaningId { get; set; }

        /// <summary>
        /// phân biệt là thanh toán hợp đồng = 0 | đề nghị thanh toán chi phí = 1
        /// </summary>
        public int Type { get; set; }
        public decimal Amount { get; set; }

        /// <summary>
        /// Ngày kế toán xác nhận
        /// </summary>
        public DateTime? PaymentDate { get; set; }
        public string? Description { get; set; }

        /// <summary>
        /// Nội dung
        /// </summary>
        public string? Content { get; set; }

        /// <summary>
        /// Ngày đề nghị chi
        /// </summary>
        public DateTime? SuggestedDate { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public Guid? DocumentId { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid? CustomerId { get; set; }

        public string? State { get; set; }
        public string? StateName { get; set; }

        /// <summary>
        /// Lưu danh sách người đã tham gia duyệt
        /// </summary>
        public string? WorkFlowPerson { get; set; }

        /// <summary>
        /// Lưu lại người thực hiện hiện tại
        /// </summary>
        public string? PersionApprove { get; set; }

        /// <summary>
        /// Xác nhận khối lượng thực hiện công việc(Dành cho kế toán công nợ xác nhận)
        /// Với trạng thái: (null: đã bị hủy; 0: đã trình lên đợi kế toán duyệt doanh thu; 1:kế toán đã duyệt doanh thu; 2: kế toán đã duyệt)
        /// </summary>
        public bool? IsConfirm { get; set; }

        /// <summary>
        /// Ngày bắt đầu thực hiện hợp đồng do sale xác nhận
        /// </summary>
        public DateTime? ContractPerformStartDate { get; set; }

        /// <summary>
        /// Ngày kết thực hiện hợp đồng do sale xác nhận
        /// </summary>
        public DateTime? ContractPerformEndDate { get; set; }
    }
}
