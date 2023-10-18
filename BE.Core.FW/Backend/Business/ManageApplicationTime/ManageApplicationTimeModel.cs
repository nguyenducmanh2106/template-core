using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ManageApplicationTime
{
    public class ManageApplicationTimeModel
    {
        public Guid Id { get; set; }
        public Guid SysTimeFrameId { get; set; }
        public Guid HeaderQuarterId { get; set; }
        public int MaxRegistry { get; set; }
        public DateTime ReceivedDate { get; set; }
        public int Registed { get; set; }
        public string TimeStart { get; set; } = string.Empty;
        public string TimeEnd { get; set; } = string.Empty;
        public bool IsShow { get; set; } = true;
        public List<DateTime>? ListReceivedDate { get; set; }
    }
}
