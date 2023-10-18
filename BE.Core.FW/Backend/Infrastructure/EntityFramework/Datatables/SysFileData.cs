using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysFileData : BaseTable<SysFileData>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid TargetId { get; set; }
        public string? FilePath { get; set; }
        public string? Base64String { get; set; }

    }
}
