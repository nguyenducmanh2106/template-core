using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ExamPeriodAPModel
    {
        public string Name { get; set; } = null!;
        public string? Note { get; set; }
        public bool IsOpen { get; set; }
    }

    public class ExamPeriodAPSearch
    {
        public string? Name { get; set; }
        public bool? IsOpen { get; set; }
    }
}
