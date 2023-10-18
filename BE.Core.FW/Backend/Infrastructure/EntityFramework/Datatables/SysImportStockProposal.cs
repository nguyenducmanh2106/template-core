using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysImportStockProposal : BaseTable<SysImportStockProposal>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required]
        public int Type { get; set; }
        [Required]
        public Guid SupplierId { get; set; }
        [Required]
        public Guid StockId { get; set; }
        [Required]
        public DateTime DatePropose { get; set; }
        [Required]
        public DateTime DateImportExpected { get; set; }
        [Required, MaxLength(1000)]
        public string FileImportSavedPath { get; set; } = null!;
        [MaxLength(1000)]
        public string? Note { get; set; }
        public int Status { get; set; }
        public DateTime? DateSendForApprove { get; set; }
        [MaxLength(100)]
        public string? UserApprove { get; set; }
        public DateTime? DateApprove { get; set; }
        [MaxLength(1000)]
        public string? ReasonReject { get; set; }
    }
}
