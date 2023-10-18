using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysUserManageStock : BaseTable<SysUserManageStock>
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid StockId { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public int ApproveType { get; set; }
    }
}
