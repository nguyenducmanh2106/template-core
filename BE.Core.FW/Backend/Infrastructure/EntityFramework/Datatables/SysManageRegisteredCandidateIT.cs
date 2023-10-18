using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysManageRegisteredCandidateIT : BaseTable<SysManageRegisteredCandidateIT>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserProfileId { get; set; }
        [Required]
        public string ExamPurpose { get; set; } = string.Empty;
        [Required]
        public long ScoreGoal { get; set; }
        [Required]
        public bool IsTested { get; set; }
        public DateTime? TestDate { get; set; }
        [Required]
        public Guid AreaId { get; set; }
        [Required]
        public Guid ExamId { get; set; }
        [Required]
        public string ExamRegistedData { get; set; } = string.Empty;
        [Required]
        public string ExamScheduleString { get; set; } = string.Empty;
        [Required]
        public int StatusPaid { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public long Price { get; set; }
    }
}
