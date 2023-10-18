using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysResonBlacklist : BaseTable<SysResonBlacklist>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        [Required]
        public bool Status { get; set; }
    }
}
