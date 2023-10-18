using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ExamSubject
{
    public class ExamSubjectModel
    {
        public Guid Id { get; set; }
        public Guid ExamId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool Status { get; set; }
    }
}
