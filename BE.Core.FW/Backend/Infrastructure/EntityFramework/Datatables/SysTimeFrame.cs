using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysTimeFrame : BaseTable<SysTimeFrame>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public Guid HeadQuarterId { get; set; }
        [Required]
        public bool IsShow { get; set; } = true;
    }
}
