using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamScheduleDetailAP : BaseTable<SysExamScheduleDetailAP>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid ExamScheduleId { get; set; }
        [Required]
        public Guid ExamId { get; set; }
    }
}
