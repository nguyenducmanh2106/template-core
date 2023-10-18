using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysTimeReciveApplication : BaseTable<SysTimeReciveApplication>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid HeaderQuarterId { get; set; }
        [Required]
        public string Weekdays { get; set; } = string.Empty;
        [Required]
        public string Weekend { get; set; } = string.Empty;
    }
}
