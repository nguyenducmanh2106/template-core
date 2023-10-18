using System.ComponentModel.DataAnnotations;

namespace Backend.Model
{
    public class ExamInfoModel
    {
        public Guid ExamId { get; set; }
        public string? ExamName { get; set; }
        public DateTime? DateApply { get; set; }
        public string? TimeApply { get; set; }
        public string? ExamShift { get; set; }
        public DateTime? DateTest { get; set; }
        public Guid? ExamRoomId { get; set; }
        public string? TimeTest { get; set; }
        public string? SBD { get; set; }
        public long? Price { get; set; }
        public string? RegistrationCode { get; set; }
    }
}
