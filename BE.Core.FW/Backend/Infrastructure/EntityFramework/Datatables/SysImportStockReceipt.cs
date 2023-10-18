using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysImportStockReceipt : BaseTable<SysImportStockReceipt>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public DateTime DatePropose { get; set; }
        [MaxLength(255)]
        public string? ImportStockProposalCode { get; set; } 
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required]
        public Guid StockId { get; set; }
        [Required]
        public Guid SupplierId { get; set; }
        [MaxLength(255)]
        public string? BatchNote { get; set; }
        [Required]
        public int ImportMethod { get; set; }
        [Required, MaxLength(1000)]
        public string FileImportSavedPath { get; set; } = null!;
        [MaxLength(1000)]
        public string? Note { get; set; }
        public int Status { get; set; }
        public DateTime? DateSendForApprove { get; set; }
        public Guid? UserApprove { get; set; }
        public DateTime? DateApprove { get; set; }
        [MaxLength(1000)]
        public string? ReasonReject { get; set; }
    }
}
