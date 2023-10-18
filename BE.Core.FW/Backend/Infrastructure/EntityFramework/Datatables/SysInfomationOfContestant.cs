using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysInfomationOfContestant
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

    }
}
