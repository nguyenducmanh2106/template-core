using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningCommision : BaseTable<SysSalesPlaningCommision>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SalesPlaningId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? PricingCategoryId { get; set; }
        public string? PricingCategoryName { get; set; }
        public float ComRate { get; set; }
        public Guid? StaffId { get; set; }
        public string? StaffFullname { get; set; }
        public float StaffComRate { get; set; }
        public float StaffCompareComRate { get; set; }
        public long TotalCom { get; set; }
        public float StaffRevenueRate { get; set; }
        public long TotalRevenue { get; set; }
    }
}
