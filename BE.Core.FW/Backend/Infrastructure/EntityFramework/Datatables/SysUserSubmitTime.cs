using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysUserSubmitTime : BaseTable<SysUserSubmitTime>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public Guid SubmissionTimeId { get; set; }
        [Required]
        public string UserName { get; set; } = string.Empty;
        public DateTime ExpireDate { get; set; }
        public Guid ExamId { get; set; }
    }
}
