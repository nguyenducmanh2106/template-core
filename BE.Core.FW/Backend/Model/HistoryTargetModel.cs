namespace Backend.Model
{
    public class HistoryTargetModel
    {
        public Guid Id { get; set; }
        public int Type { get; set; }
        public int Year { get; set; }
        public Guid DepartmentId { get; set; }
        public DateTime? ActionDate { get; set; }
        public string? Description { get; set; }
    }
}
