using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ExamVersionModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Note { get; set; }
        public uint Order { get; set; } = 0;
        public bool IsShow { get; set; } = false;
        public IEnumerable<string>? Language { get; set; }
        public Guid ExamId { get; set; }
        public Guid ExamSubjectId { get; set; }
    }

    public class ExamVersionResModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public long Price { get; set; }
    }
}
