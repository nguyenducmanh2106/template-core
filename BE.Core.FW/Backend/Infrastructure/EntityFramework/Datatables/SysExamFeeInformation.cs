using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysExamFeeInformation : BaseTable<SysExamFeeInformation>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid ManageRegisteredCandidatesId { get; set; }
        [Required]
        public Guid SeviceId { get; set; }
        [Required]
        public string NameService { get; set; } = string.Empty;
        [Required]
        public long Price { get; set; }
        public int Type { get; set; }
    }
}
