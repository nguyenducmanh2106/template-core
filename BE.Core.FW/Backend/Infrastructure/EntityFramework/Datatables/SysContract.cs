namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysContract : BaseTable<SysContract>
    {
        public Guid Id { get; set; }
        public string? ContractNumber { get; set; }
        public Guid? CustomerId { get; set; }

        /// <summary>
        /// Id của người 
        /// </summary>
        public Guid? OwnerId { get; set; }
        public Guid? ProvinceId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? ContractTypeId { get; set; }
        public decimal? ContractValue { get; set; }
        public string? UploadUser { get; set; }
        public DateTime? UploadDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        public Guid? DocumentId { get; set; }
        public Guid? DepartmentId { get; set; }
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
        /// Lưu lại id hợp đồng cha(dùng cho phụ lục hợp đồng)
        /// </summary>
        public Guid? ParentId { get; set; }
        public string? FileFormPath { get; set; }
        public string? FileFormName { get; set; }

        /// <summary>
        /// Lưu lại id file văn bản trình ký(dùng cho phụ lục hợp đồng)
        /// </summary>
        public Guid? SignProcessDocumentId { get; set; }

        /// <summary>
        /// Là hợp đồng trình ký nội bộ
        /// </summary>
        public bool? IsSignInternal { get; set; }

        /// <summary>
        /// Đánh dấu là hợp đồng này đã được hoàn thành hay chưa
        /// </summary>
        public bool? IsCompleted { get; set; }

        /// <summary>
        /// URL của workflow
        /// </summary>
        public string? WorkflowUrl { get; set; }
    }
}
