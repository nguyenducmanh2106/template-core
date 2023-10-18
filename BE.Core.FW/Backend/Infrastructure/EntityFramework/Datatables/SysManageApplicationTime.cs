using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysManageApplicationTime : BaseTable<SysManageApplicationTime>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SysTimeFrameId { get; set; }
        [Required]
        public Guid HeaderQuarterId { get; set; }
        [Required]
        public DateTime ReceivedDate { get; set; }
        [Required]
        public int MaxRegistry { get; set; }
        public int Registed { get; set; }
        [Required]
        public string TimeStart { get; set; } = string.Empty;
        [Required]
        public string TimeEnd { get; set; } = string.Empty;
        public bool IsShow { get; set; } = true;
    }
}
