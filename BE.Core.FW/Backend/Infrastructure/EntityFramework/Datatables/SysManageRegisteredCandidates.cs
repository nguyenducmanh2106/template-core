using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysManageRegisteredCandidates : BaseTable<SysManageRegisteredCandidates>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserProfileId { get; set; }
        [Required]
        public string ExamPurpose { get; set; } = string.Empty;
        [Required]
        public long ScoreGoal { get; set; }
        public string CodeProfile { get; set; } = string.Empty;
        [Required]
        public bool IsTested { get; set; }
        public DateTime? TestDate { get; set; }
        [Required]
        public Guid PlaceOfRegistration { get; set; }
        public Guid AreaId { get; set; }
        public Guid SubmissionTime { get; set; }
        [Required]
        public Guid ExamId { get; set; }
        public string? ExamVersion { get; set; }
        public DateTime? TestScheduleDate { get; set; }
        public DateTime? ReturnResultDate { get; set; }
        public string? ProfileIncludes { get; set; }
        public Guid? PriorityObject { get; set; }
        public string? AccompaniedService { get; set; } = string.Empty;
        public string? UserName { get; set; } = string.Empty;
        public string? Password { get; set; } = string.Empty;
        public string? Note { get; set; } = string.Empty;
        public string? ProfileNote { get; set; } = string.Empty;
        public int? Status { get; set; }
        public int? StatusPaid { get; set; }
        public string? AcceptBy { get; set; }
        public DateTime? DateAccept { get; set; }
        public DateTime? DateReceive { get; set; }
        public Guid? UserId { get; set; }
        public bool? CanTest { get; set; }
        public Guid? ExamScheduleId { get; set; }
        public int? Receipt { get; set; }
        public string? FullNameReceipt { get; set; }
        public string? PhoneReceipt { get; set; }
        public string? AddReceipt { get; set; }
        public string? RejectNote { get; set; }
        public long? Price { get; set; }
    }
}
