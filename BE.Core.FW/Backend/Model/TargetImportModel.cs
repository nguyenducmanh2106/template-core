namespace Backend.Model
{
    public class TargetImportModel
    {
        public int Type { get; set; }
        public int Year { get; set; }
        public Guid? DepartmentId { get; set; }
        public string? Username { get; set; }

        public string? linkFile_Vz { get; set; }
        public List<Guid>? UserNotification { get; set; }

        public string? Description { get; set; }
    }
}
