namespace Backend.Model
{
    public class ContractProductModel
    {
        public Guid? Id { get; set; }
        public Guid ContractId { get; set; }
        public Guid ProductId { get; set; }
        public string? ProductName { get; set; }
        public Guid PricingDecisionId { get; set; }
        public string? PricingDecisionName { get; set; }
        public Guid? PricingCategoryId { get; set; }
        public string? PricingCategoryName { get; set; }
        public decimal DefaultPrice { get; set; }
        public decimal ImplementationPrice { get; set; }
        public decimal Quantily { get; set; }
        public float VAT { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Description { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;
    }
}
