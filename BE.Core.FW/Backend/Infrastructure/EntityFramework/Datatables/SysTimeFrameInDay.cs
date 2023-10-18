using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysTimeFrameInDay : BaseTable<SysTimeFrameInDay>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid SysTimeFrameId { get; set;}
        [Required]
        public int MaxRegistry { get; set; }
        [Required]
        public string TimeStart { get; set; } = string.Empty;
        [Required]
        public string TimeEnd { get; set; } = string.Empty;
        public bool IsShow { get; set; } = true;
    }
}
