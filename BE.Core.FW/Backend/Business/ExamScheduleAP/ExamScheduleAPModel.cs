namespace Backend.Business
{
    public class ExamScheduleAPModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public DateTime ExamDate { get; set; }
        public Guid ExamWorkShiftId { get; set; }
        public Guid ExamPeriodId { get; set; }
        public string? ExamTime { get; set; }
        public bool IsOpen { get; set; }
        public IEnumerable<Guid> ExamId { get; set; } = null!;
    }

    public class ExamScheduleAPSearchModel
    {
        public string? Name { get; set; }
        public DateTime? ExamDate { get; set; }
    }
}