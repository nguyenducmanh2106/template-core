using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSupplies : BaseTable<SysSupplies>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required]
        public Guid SuppliesGroupId { get; set; }
        [Required]
        public Guid SuppliesKindId { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
