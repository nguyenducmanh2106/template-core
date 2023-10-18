using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysUserProfileRegisteredIT : BaseTable<SysUserProfileRegisteredIT>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid CandidateRegisterId { get; set; }
        [Required]
        public string FullName { get; set; } = string.Empty;
        public string FullNameOrigin { get; set; } = string.Empty;
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string Phone { get; set; } = string.Empty;
        [Required]
        public DateTime Birthday { get; set; }
        [Required]
        public string Sex { get; set; } = string.Empty;
        public string TypeIdCard { get; set; } = string.Empty;
        public string IDNumber { get; set; } = string.Empty;
        public string Job { get; set; } = string.Empty;
        public DateTime? DateOfCCCD { get; set; }
        public string? PlaceOfCCCD { get; set; }
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public Guid ContactAddressCityId { get; set; }
        [Required]
        public Guid ContactAddressDistrictId { get; set; }
        public Guid ContactAddressWardId { get; set; }
        [Required]
        public string ContactAddress { get; set; } = string.Empty;
        [Required]
        public string Language { get; set; } = string.Empty;
        [Required]
        public string IDCardFront { get; set; } = string.Empty;
        [Required]
        public string IDCardBack { get; set; } = string.Empty;
        public string? BirthCertificate { get; set; }
        public string? SchoolCertificate { get; set; }
        [Required]
        public string Image3x4 { get; set; } = string.Empty;
        [Required]
        public Guid WorkAddressDistrictId { get; set; }
        [Required]
        public Guid WorkAddressWardsId { get; set; }
        [Required]
        public Guid WorkAddressCityId { get; set; }
        [Required]
        public string WorkAddress { get; set; } = string.Empty;
        public string? OldCardIDNumber { get; set; }
        [Required]
        public bool OldCardID { get; set; }
        [Required]
        public bool IsStudent { get; set; }
        [Required]
        public bool AllowUsePersonalData { get; set; }
        [Required]
        public string StudentCode { get; set; } = string.Empty;

    }
}
