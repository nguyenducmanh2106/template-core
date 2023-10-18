using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ImportStockReceiptModel
    {
        public Guid Id { get; set; }
        [Required]
        public DateTime DatePropose { get; set; }
        [MaxLength(255)]
        public string? ImportStockProposalCode { get; set; }
        [Required]
        public Guid StockId { get; set; }
        [Required]
        public Guid SupplierId { get; set; }
        [MaxLength(255)]
        public string? BatchNote { get; set; }
        [Required]
        public int ImportMethod { get; set; }
        public IFormFile? FileImport { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class ImportStockReceiptSearch
    {
        public string? ImportStockProposalCode { get; set; }
        public int? ImportMethod { get; set; }
        public Guid? SupplierId { get; set; }
        public Guid? StockId { get; set; }
        public int? Status { get; set; }
    }

    public class ApproveReceiptModel
    {
        public Guid Id { get; set; }
        public bool IsApprove { get; set; }
        public string? ReasonReject { get; set; }
    }
}
