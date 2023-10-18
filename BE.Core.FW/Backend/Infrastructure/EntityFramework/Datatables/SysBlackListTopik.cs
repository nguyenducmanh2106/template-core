using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysBlackListTopik : BaseTable<SysBlackListTopik>
    {
        [Key]
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string FullName { get; set; } = null!;
        [Required]
        public DateTime DateOfBirth { get; set; }
        public string? IdentityCard { get; set; }
        public string? CitizenIdentityCard { get; set; }
        public string? Passport { get; set; }
        public int Type { get; set; }
        public DateTime? StartWorkDate { get; set; }
        public DateTime? FinishWorkDate { get; set; }
        public DateTime? NotifyResultDate { get; set; }
        public DateTime? FinishPunishmentDate { get; set; }
        [MaxLength(1000)]
        public string? PunishmentAction { get; set; }
        [MaxLength(1000)]
        public string? CandicateNumber { get; set; }
        [MaxLength(1000)]
        public string? ExamPeriod { get; set; }
        [MaxLength(1000)]
        public string? Country { get; set; }
        [MaxLength(1000)]
        public string? Area { get; set; }
        [MaxLength(1000)]
        public string? Location { get; set; }
        [MaxLength(1000)]
        public string? Exam { get; set; }
        public int Status { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}
