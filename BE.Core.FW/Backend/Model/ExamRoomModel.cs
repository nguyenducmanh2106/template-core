using System.ComponentModel.DataAnnotations;

namespace Backend.Model
{
    public class ExamRoomModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? NameInEnglish { get; set; }
        public string? NameInKorean { get; set; }
        public uint MaxAcceptNumber { get; set; }
        public uint AcceptanceLimit { get; set; }
        public string? Note { get; set; }
        public uint Order { get; set; }
        public bool IsShow { get; set; } = false;
        public string? ColorCode { get; set; }
        public string? Code { get; set; }
        public Guid? HeadQuarterId { get; set; }
    }
}
