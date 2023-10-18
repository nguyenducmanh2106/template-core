using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamScheduleTopik : BaseTable<SysExamScheduleTopik>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string ExaminationName { get; set; } = string.Empty;
        [Required]
        public DateTime ExamDate { get; set; }
        [Required]
        public string ExamTime { get; set; } = string.Empty;
        [Required]
        public Guid ExamId { get; set; }
        [Required]
        public Guid ExamWorkShiftId { get; set; }
        [Required]
        public DateTime StartRegister { get; set; }
        [Required]
        public DateTime EndRegister { get; set; }
        public string? Note { get; set; }
        [Required]
        public int Status { get; set; }
        public bool Public { get; set; }

        public string? EnglishName { get; set; }

        public string? KoreaName { get; set; }
        public Guid ExamPeriodId { get; set; }
        [MaxLength(1000)]
        public string? NoteTimeEnterExamRoom { get; set; }
    }
}
