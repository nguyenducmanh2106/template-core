namespace Backend.Model
{
    public class SalesPlaningCommisionModel
    {
        public Guid Id { get; set; }
        public Guid SalesPlaningId { get; set; }
        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }
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
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;
    }
}
