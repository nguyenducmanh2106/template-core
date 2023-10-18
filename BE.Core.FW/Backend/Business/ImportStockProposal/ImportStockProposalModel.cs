using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ImportStockProposalModel
    {
        public Guid Id { get; set; }
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
        public IFormFile? FileImport { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class ImportStockProposalSearch
    {
        public string? Code { get; set; }
        public int? Type { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? StockId { get; set; }
        public int? Status { get; set; }
    }

    public class ApproveProposalModel
    {
        public Guid Id { get; set; }
        public bool IsApprove { get; set; }
        public string? ReasonReject { get; set; }
    }
}
