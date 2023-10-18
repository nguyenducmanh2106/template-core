namespace Backend.Model
{
    public class DistrictModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Name_En { get; set; } = string.Empty;
        public int Level { get; set; }
        public Guid ProvinceId { get; set; }
    }
}
