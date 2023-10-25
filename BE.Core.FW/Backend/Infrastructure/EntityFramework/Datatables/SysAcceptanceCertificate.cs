namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysAcceptanceCertificate : BaseTable<SysAcceptanceCertificate>
    {
        public Guid Id { get; set; }
        public Guid ContractId { get; set; }
        public string? ContractName { get; set; }
        public string? ContractNumber { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public DateTime Date { get; set; }
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

        public int? Type { get; set; }

        /// <summary>
        /// Là văn bản trình ký nội bộ
        /// </summary>
        public bool? IsSignInternal { get; set; }

        public string? FilePathSignatured { get; set; }
        public string? FileNameSignatured { get; set; }
    }
}
