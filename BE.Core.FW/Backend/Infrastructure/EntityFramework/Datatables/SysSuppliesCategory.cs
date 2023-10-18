using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSuppliesCategory : BaseTable<SysSuppliesCategory>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [Required]
        public int SuppliesSerialStatus { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
        public bool IsActive { get; set; }
    }
}
