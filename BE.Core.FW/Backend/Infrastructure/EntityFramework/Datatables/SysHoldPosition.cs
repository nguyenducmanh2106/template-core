using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysHoldPosition : BaseTable<SysHoldPosition>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public Guid ExamCalendarId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public string Note { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
