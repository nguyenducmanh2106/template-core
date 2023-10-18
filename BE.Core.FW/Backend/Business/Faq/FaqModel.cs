namespace Backend.Business
{
    public class FaqModel
    {
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
        public bool IsShow { get; set; }
        public bool HasDetail { get; set; }
        public uint Order { get; set; }
    }

    public class FaqSearchModel
    {
        public string? Keyword { get; set; }
        public Guid? ExamTypeId { get; set; }
        public bool? IsShow { get; set; }
        public bool IncludeShortAnswer { get; set; } = true;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Language { get; set; }
    }
}
