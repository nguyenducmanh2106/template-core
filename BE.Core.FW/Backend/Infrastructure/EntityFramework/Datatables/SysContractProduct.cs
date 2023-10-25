namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysContractProduct : BaseTable<SysContractProduct>
    {
        public Guid Id { get; set; }
        public Guid ContractId { get; set; }
        public Guid ProductId { get; set; }
        public Guid PricingDecisionId { get; set; }
        public Guid? PricingCategoryId { get; set; }
        public string? PricingCategoryName { get; set; }
        public decimal DefaultPrice { get; set; }
        public decimal ImplementationPrice { get; set; }
        public decimal Quantily { get; set; }
        public float VAT { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Description { get; set; }
    }
}
