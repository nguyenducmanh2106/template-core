using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ExamPeriodModel
    {
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [MaxLength(1000)]
        public string? Note { get; set; }
        public string Number { get; set; } = string.Empty;
        public bool Status { get; set; }
        public bool IsCurrent { get; set; }
    }

    public class ExamPeriodSearch
    {
        public string? Name { get; set; }
        public bool? Status { get; set; }
    }
}
