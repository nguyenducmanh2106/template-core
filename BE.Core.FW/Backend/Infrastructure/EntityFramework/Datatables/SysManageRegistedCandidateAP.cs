using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysManageRegistedCandidateAP : BaseTable<SysManageRegistedCandidateAP>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserProfileId { get; set; }
        public string? SBD { get; set; }
        [Required]
        public string ScheduleDetailIds { get; set; } = string.Empty;
        [Required]
        public int IsPaid { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public string Price { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;

    }
}
