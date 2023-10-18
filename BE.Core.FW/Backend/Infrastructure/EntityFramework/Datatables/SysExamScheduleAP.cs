using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamScheduleAP : BaseTable<SysExamScheduleAP>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = null!;
        [Required]
        public DateTime ExamDate { get; set; }
        [Required]
        public Guid ExamWorkShiftId { get; set; }
        [Required]
        public Guid ExamPeriodId { get; set; }
        public string? ExamTime { get; set; }
        public bool IsOpen { get; set; }
    }
}
