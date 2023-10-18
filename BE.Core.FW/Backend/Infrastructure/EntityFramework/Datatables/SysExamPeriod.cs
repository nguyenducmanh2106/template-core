using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamPeriod : BaseTable<SysExamPeriod>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [MaxLength(1000)]
        public string? Note { get; set; }
        public string Number { get; set; } = string.Empty;
        public bool Status { get; set; }
        public bool IsCurrent { get; set; }
    }
}
