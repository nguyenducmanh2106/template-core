using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamPeriodAP : BaseTable<SysExamPeriodAP>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [MaxLength(1000)]
        public string? Note { get; set; }
        public bool IsOpen { get; set; }
    }
}
