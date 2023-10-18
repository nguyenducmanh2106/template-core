namespace Backend.Model
{
    public class DepartmentModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Level { get; set; } = default!;
        public Guid? ParentId { get; set; }
        public List<DepartmentModel> Children { get; set; } = new List<DepartmentModel>();
    }

}
