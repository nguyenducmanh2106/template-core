namespace Backend.Model
{
    public class TaxCategoryModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public bool Status { get; set; } = default!;
        public decimal Value { get; set; }
    }
}
