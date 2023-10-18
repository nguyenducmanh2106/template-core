using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysNumberOfRegistration : BaseTable<SysNumberOfRegistration>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid HeadQuarterId { get; set; }
        [Required]
        public Guid ExamPeriodId { get; set; }
        [Required]
        public int Quantity { get; set; }
    }
}
