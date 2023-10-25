namespace Backend.Model
{
    public class PricingDecisionModel
    {
        public Guid Id { get; set; }
        public string? DecisionNo { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public bool Status { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public DateTime EffectiveDate { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;
    }
}
