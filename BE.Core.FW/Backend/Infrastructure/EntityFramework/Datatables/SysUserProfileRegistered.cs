using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysUserProfileRegistered : BaseTable<SysUserProfileRegistered>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid CandidateRegisterId { get; set; }
        [Required]
        public string FullName { get; set; } = string.Empty;
        public string FullNameOrigin { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        [Required]
        public string FullNameKorea { get; set; } = string.Empty;
        [Required]
        public string Phone { get; set; } = string.Empty;
        [Required]
        public DateTime Birthday { get; set; }
        [Required]
        public string Sex { get; set; } = string.Empty;
        public string? TypeIdCard { get; set; }
        public string IDNumber { get; set; } = string.Empty;
        public string? CCCD { get; set; }
        public string? CMND { get; set; }
        public string? Passport { get; set; }
        public DateTime? DateOfCCCD { get; set; }
        public string? PlaceOfCCCD { get; set; }
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public Guid ContactAddressCityId { get; set; }
        [Required]
        public Guid ContactAddressDistrictId { get; set; }
        public Guid? ContactAddressWardId { get; set; }
        [Required]
        public string ContactAddress { get; set; } = string.Empty;
        public string? CountryEnglishName { get; set; }
        public string? CountryKoreanName { get; set; }
        public string? LanguageName { get; set; }
        public string? LanguageEnglishName { get; set; }
        public string? LanguageKoreanName { get; set; }
        public string? CountryCode { get; set; }
        public string? LanguageCode { get; set; }
        public string? Job { get; set; }
        public string? OptionJob { get; set; }
        public string? IDCardFront { get; set; }
        public string? IDCardBack { get; set; }
        public string? StudentCardImage { get; set; }
        public string? Image3x4 { get; set; }
        public string? SchoolCertificate { get; set; }
        public string? BirthCertificate { get; set; }
        public string? IsKorean { get; set; }
        public Guid? WorkAddressCityId { get; set; }
        public Guid? WorkAddressDistrictId { get; set; }
        public Guid? WorkAddressWardsId { get; set; }
        public string? WorkAddress { get; set; }
        public string? OldCardIDNumber { get; set; }
        public bool OldCardID { get; set; }
        public bool IsStudent { get; set; }
        public bool IsDisabilities { get; set; }
        public int Month { get; set; }
        public int Date { get; set; }
        public bool AllowUsePersonalData { get; set; }
    }
}
