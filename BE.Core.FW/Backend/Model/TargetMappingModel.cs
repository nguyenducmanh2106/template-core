namespace Backend.Model
{
    public class TargetMappingModel
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public Guid? TargetId { get; set; }
        public Guid? ProductTypeId { get; set; }
        public string? ProductTypeName { get; set; }
        public Guid? CustomerCategoryId { get; set; }
        public string? CustomerCategoryName { get; set; }
        public decimal Jan { get; set; }
        public int QuantityJan { get; set; }
        public decimal Feb { get; set; }
        public int QuantityFeb { get; set; }
        public decimal Mar { get; set; }
        public int QuantityMar { get; set; }
        public decimal Apr { get; set; }
        public int QuantityApr { get; set; }
        public decimal May { get; set; }
        public int QuantityMay { get; set; }
        public decimal Jun { get; set; }
        public int QuantityJun { get; set; }
        public decimal July { get; set; }
        public int QuantityJuly { get; set; }
        public decimal Aug { get; set; }
        public int QuantityAug { get; set; }
        public decimal Sep { get; set; }
        public int QuantitySep { get; set; }
        public decimal Oct { get; set; }
        public int QuantityOct { get; set; }
        public decimal Nov { get; set; }
        public int QuantityNov { get; set; }
        public decimal Dec { get; set; }
        public int QuantityDec { get; set; }
        public decimal Total { get; set; }
        public int TotalQuantity { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;

    }
}
