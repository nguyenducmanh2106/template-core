using System.ComponentModel.DataAnnotations;

namespace Backend.Model
{
    public class SlotRegister
    {
        public Guid Id { get; set; }
        public Guid PlaceId { get; set; }
        public Guid ExamTopikId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public long EndTime { get; set; }
    }
}
