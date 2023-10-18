using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysBlacklist : BaseTable<SysBlacklist>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string FullName { get; set; } = string.Empty;
        [Required]
        public string Sex { get; set; } = string.Empty;
        [Required]
        public DateTime DateOfBirth { get; set; }
        [Required]
        public string IDNumberCard { get; set; } = string.Empty;
        [Required]
        public int TypeIdCard{ get; set; }
        [Required]
        public int Target { get; set; } /// đối tượng
        [Required]
        public Guid ExamId { get; set; }
        public bool IsAutoFill { get; set; }
        public bool IsDelete { get; set; }
    }
}
