using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysStockList : BaseTable<SysStockList>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [Required]
        public Guid AreaId { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}
