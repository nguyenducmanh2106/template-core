using System.ComponentModel.DataAnnotations;

namespace Backend.HoldPosition
{
    public class HoldPositionModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ExamCalendarId { get; set; }
        public int Quantity { get; set; }
        public string Note { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
