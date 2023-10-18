using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSuppliesGroup : BaseTable<SysSuppliesGroup>
    {
        [Key]
        public Guid Id { get; set; }
        [MaxLength(255)]
        public string? Code { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}
