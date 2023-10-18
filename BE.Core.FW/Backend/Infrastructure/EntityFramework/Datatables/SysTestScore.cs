using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysTestScore : BaseTable<SysTestScore>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        [Required]
        public DateTime DOB { get; set; }
        [Required]
        public string IdOrPassport { get; set; } = string.Empty;
        public int Listening { get; set; } = 0;
        public int Reading { get; set; } = 0;
        public int Total { get; set; } = 0;
        public DateTime TestDate { get; set; }
        public string FormCode { get; set; } = string.Empty;

    }
}
