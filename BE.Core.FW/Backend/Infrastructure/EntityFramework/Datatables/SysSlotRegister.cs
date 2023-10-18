using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSlotRegister : BaseTable<SysSlotRegister>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid PlaceId { get; set; }
        [Required]
        public Guid ExamTopikId { get; set; }
        [Required]
        public string UserName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        [Required]
        public long EndTime { get; set; }
    }
}
