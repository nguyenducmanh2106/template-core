namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public class StatisticalRegisterTopikDTO
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public Guid AreaId { get; set; }
        public string? AreaName { get; set; }
        public Guid HeadQuaterId { get; set; }
        public string? HeadQuaterName { get; set; }
        public Guid ExaminationId { get; set; }
        public string? ExaminationName { get; set; }
        public int? TotalQuantity { get; set; }
        public int? MaxQuantity { get; set; }
        public int? Status { get; set; }
    }
}
