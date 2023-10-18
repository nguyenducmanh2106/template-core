using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamCalendar : BaseTable<SysExamCalendar>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid HeaderQuarterId { get; set; }
        [Required]
        public Guid Room { get; set; }
        [Required]
        public DateTime DateTest { get; set; }
        [Required]
        public DateTime EndDateRegister { get; set; }
        [Required]
        public Guid ExamShift { get; set; }
        [Required]
        public string TimeTest { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        [Required]
        public string ExamId { get; set; } = string.Empty;
        [Required]
        public int Status { get; set; }
        [Required]
        public int QuantityCandidate { get; set; }
    }
}
