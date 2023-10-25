using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaningProduct : BaseTable<SysSalesPlaningProduct>
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SalesPlaningId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? PricingCategoryId { get; set; }
        public string? PricingCategoryName { get; set; }
        public decimal DefaultPrice { get; set; }
        public decimal ImplementationPrice { get; set; }
        public int Quantily { get; set; }
        public float VAT { get; set; }
        public float L1Rate { get; set; }
        public decimal L1Cost { get; set; }
        public float L2Rate { get; set; }
        public decimal L2Cost { get; set; }
        public float L3Rate { get; set; }
        public decimal L3Cost { get; set; }
        public float L4Rate { get; set; }
        public decimal L4Cost { get; set; }

        //Chi phí hỗ trợ CSVC &NC theo quy định
        public float L1RateDefault { get; set; }
        public decimal L1CostDefault { get; set; }
        public float L2RateDefault { get; set; }
        public decimal L2CostDefault { get; set; }
        public float L3RateDefault { get; set; }
        public decimal L3CostDefault { get; set; }
        public float L4RateDefault { get; set; }
        public decimal L4CostDefault { get; set; }
        public float ComRate { get; set; }
        public float CompareRate { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TotalPriceWithRate { get; set; }
        public float TotalRate { get; set; }
    }
}
