using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysImportStockProposalDetail
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid ImportStockProposalId { get; set; }
        [Required]
        public Guid SuppliesId { get; set; }
        [Required]
        public int Quantity { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}
