using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysManageRegisteredCandidateTopik : BaseTable<SysManageRegisteredCandidateTopik>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public Guid UserProfileId { get; set; }
        [Required]
        public string ExamPurpose { get; set; } = string.Empty;
        [Required]
        public Guid AreaTest { get; set; }
        [Required]
        public Guid PlaceTest { get; set; }
        public string? PlaceTestName { get; set; }
        [Required]
        public bool IsTestTOPIK { get; set; }
        [Required]
        public Guid ExamId { get; set; }
        [Required]
        public Guid TestScheduleId { get; set; }
        [Required]
        public string KnowWhere { get; set; } = string.Empty;
        [Required]
        public int? IsPaid { get; set; }
        public int? Status { get; set; }
        public long Price { get; set; }
        public string? RegistrationCode { get; set; }
    }
}
