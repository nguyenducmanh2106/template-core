using Backend.Infrastructure.Utils;

namespace Backend.Model
{
    public class ContractModel
    {
        public SalesPlaningModel? SalesPlaning { get; set; }
        public Guid Id { get; set; }
        public string? ContractNumber { get; set; }
        public Guid? CustomerId { get; set; }
        public string? CustomerName { get; set; }

        /// <summary>
        /// Id của người sở hữu hợp đồng
        /// </summary>
        public Guid? OwnerId { get; set; }
        public Guid? ProvinceId { get; set; }
        public string? ProvinceName { get; set; }
        public Guid? DistrictId { get; set; }
        public string? DistrictName { get; set; }
        public Guid? ContractTypeId { get; set; }
        public string? ContractTypeName { get; set; }
        public string? DepartmentName { get; set; }
        public decimal ContractValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<IFormFile> Files { get; set; }
        public List<ContractFileModel>? ContractFiles { get; set; }
        public string? UploadUser { get; set; }
        public DateTime UploadDate { get; set; }
        public List<ContractProductModel>? ContractProducts { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;
        public string? Description { get; set; }
        public string? linkFile_Vz { get; set; }
        public string? nameFile_Vz { get; set; }

        public Guid? DocumentId { get; set; }
        public Guid? DepartmentId { get; set; }
        public List<DocumentCommandModel>? Commands { get; set; }

        public string? State { get; set; }
        public string? StateName { get; set; }

        /// <summary>
        /// Lưu lại id hợp đồng cha(dùng cho phụ lục hợp đồng)
        /// </summary>
        public Guid? ParentId { get; set; }
        public string? FileFormPath { get; set; }
        public string? FileFormName { get; set; }
        public bool IsShowApprove { get; set; }
        public CustomerModel? Customer { get; set; }

        /// <summary>
        /// Lưu lại id file văn bản trình ký(dùng cho phụ lục hợp đồng)
        /// </summary>
        public Guid? SignProcessDocumentId { get; set; }
        public decimal ImplementationCost { get; set; }

        /// <summary>
        /// Là hợp đồng trình ký nội bộ
        /// </summary>
        public bool? IsSignInternal { get; set; }

        public string? WorkFlowPerson { get; set; }
        public string? PersionApprove { get; set; }

        /// <summary>
        /// Đánh dấu là hợp đồng này đã được hoàn thành hay chưa
        /// </summary>
        public bool? IsCompleted { get; set; }

        public Guid? SalePlanningId { get; set; }

        /// <summary>
        /// URL của workflow
        /// </summary>
        public string? WorkflowUrl { get; set; }
    }

    public class ContractFilterModel : RequestData
    {
        public Guid? DepartmentId { get; set; }

        public Guid? CustomerId { get; set; }

        public string? Tab { get; set; }
    }
}
