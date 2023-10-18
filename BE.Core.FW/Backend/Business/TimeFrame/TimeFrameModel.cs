using System.ComponentModel.DataAnnotations;

namespace Backend.Business.TimeFrame
{
    public class TimeFrameModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid HeadQuarterId { get; set; }
        public bool IsShow { get; set; } = true;
    }
}
