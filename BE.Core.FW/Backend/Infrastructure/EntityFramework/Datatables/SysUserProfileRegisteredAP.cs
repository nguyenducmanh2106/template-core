using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysUserProfileRegisteredAP : BaseTable<SysUserProfileRegisteredAP>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid CandidateRegisterId { get; set; }
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        [Required]
        public string Sex { get; set; } = string.Empty;
        [Required]
        public DateTime Birthday { get; set; }
        public string TypeIdCard { get; set; } = string.Empty;
        public string IDNumber { get; set; } = string.Empty;
        [Required]
        public string Phone { get; set; } = string.Empty;
        [Required]
        public string ParentPhone { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string School { get; set; } = string.Empty;
        [Required]
        public string Class { get; set; } = string.Empty;
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string FullNameOrigin { get; set; } = string.Empty;
    }
}
