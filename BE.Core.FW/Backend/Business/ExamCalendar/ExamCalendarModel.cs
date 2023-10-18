using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ExamCalendar
{
    public class ExamCalendarModel
    {
        public Guid Id { get; set; }
        public Guid HeaderQuarterId { get; set; }
        public Guid Room { get; set; }
        public DateTime DateTest { get; set; }
        public DateTime EndDateRegister { get; set; }
        public Guid ExamShift { get; set; }
        public string TimeTest { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string ExamId { get; set; } = string.Empty;
        public int Status { get; set; }
        public int QuantityCandidate { get; set; }
        public int Registed { get; set; }
        public int Limit { get; set; }
    }
}
