using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysDecisionBlacklist : BaseTable<SysDecisionBlacklist>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid BlacklistId { get; set; }
        public string? DecisionNumber { get; set; }
        public DateTime? DecisionDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? Reason { get; set; }
        public int? FormProcess { get; set; }
        public string? ExamIdBan { get; set; }
        public string? CreatedBy { get; set; }
        public string? ApproveBy { get; set; }
        public DateTime? DateApprove { get; set; }
        public string? Note { get; set; } = string.Empty;
        public int Status { get; set; }
        public string? FilePath { get; set; }
    }
}
