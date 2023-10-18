namespace Backend.Model
{

    public class DepartmentTreeModel
    {
        public string Title { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public List<DepartmentTreeModel> Children { get; set; } = new List<DepartmentTreeModel>();
    }
}
