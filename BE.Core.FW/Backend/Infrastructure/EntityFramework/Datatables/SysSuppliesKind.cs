using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSuppliesKind : BaseTable<SysSuppliesKind>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [Required]
        public Guid SuppliesGroupId { get; set; }
        [Required]
        public Guid SuppliesCategoryId { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
        public bool IsActive { get; set; }
    }
}
