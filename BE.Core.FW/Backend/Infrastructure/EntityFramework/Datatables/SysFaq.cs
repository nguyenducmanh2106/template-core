using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysFaq : BaseTable<SysFaq>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ExamTypeId { get; set; }
        public string Question { get; set; } = null!;
        public string QuestionEnglish { get; set; } = null!;
        public string QuestionKorean { get; set; } = null!;
        public string ShortAnswer { get; set; } = null!;
        public string ShortAnswerEnglish { get; set; } = null!;
        public string ShortAnswerKorean { get; set; } = null!;
        public string? FullAnswer { get; set; }
        public string? FullAnswerEnglish { get; set; }
        public string? FullAnswerKorean { get; set; }
        public uint View { get; set; }
        public uint Like { get; set; }
        public uint Dislike { get; set; }
        public bool IsShow { get; set; }
        public bool HasDetail { get; set; }
        public uint Order { get; set; }
    }
}
