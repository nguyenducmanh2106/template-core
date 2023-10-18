namespace Backend.Business.ExamScheduleTopik
{
    public class ExamScheduleTopikModel
    {
        public Guid Id { get; set; }
        public string? ExaminationName { get; set; }
        public string ExamDate { get; set; } = string.Empty;
        public string? ExamDateString { get; set; }
        public string? ExamTime { get; set; }
        public Guid ExamId { get; set; }
        public Guid ExamWorkShiftId { get; set; }
        public string StartRegister { get; set; } = string.Empty;
        public string EndRegister { get; set; } = string.Empty;
        public string? Note { get; set; } = "";
        public int Status { get; set; }
        public bool Public { get; set; }
        public string? EnglishName { get; set; }

        public string? KoreaName { get; set; }
        public Guid ExamPeriodId { get; set; }
        public string? NoteTimeEnterExamRoom { get; set; }
    }
}
