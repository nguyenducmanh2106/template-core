namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public class StatisticalRegisterTopikExportDTO
    {
        public Guid Id { get; set; }
        public string? RegionName { get; set; }
        public int Region { get; set; }
        public string? Name { get; set; }
        public Guid AreaId { get; set; }
        public string? AreaName { get; set; }
        public Guid HeadQuaterId { get; set; }
        public string? HeadQuaterName { get; set; }
        public int Topik1Register { get; set; }
        public string Topik1RegisterCombine { get; set; }
        public int Topik1SumRegion { get; set; }
        public int Topik2Register { get; set; }
        public string Topik2RegisterCombine { get; set; }
        public int Topik2SumRegion { get; set; }
        public int MaxRegister { get; set; }
    }
}
