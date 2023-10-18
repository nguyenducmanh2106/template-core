using System.ComponentModel.DataAnnotations;

namespace Backend.Business.TimeFrameInDay
{
    public class TimeFrameInDayModel
    {
        public Guid Id { get; set; }
        public Guid SysTimeFrameId { get; set; }
        public int MaxRegistry { get; set; }
        public string TimeStart { get; set; } = string.Empty;
        public string TimeEnd { get; set; } = string.Empty;
        public bool IsShow { get; set; } = true;
    }
}
