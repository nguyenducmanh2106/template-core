using System.ComponentModel.DataAnnotations;

namespace Backend.Business.TimeReciveApplication
{
    public class TimeReciveApplicationModel
    {
        public Guid Id { get; set; }
        public Guid HeaderQuarterId { get; set; }
        public string Weekdays { get; set; } = string.Empty;
        public string Weekend { get; set; } = string.Empty;
    }
}
