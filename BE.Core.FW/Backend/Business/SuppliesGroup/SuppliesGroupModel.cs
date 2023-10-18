using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class SuppliesGroupModel
    {
        public Guid Id { get; set; }
        [MaxLength(255)]
        public string? Code { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; } = false;
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class SuppliesGroupSearch
    {
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
        public string? Code { get; set; }
    }
}
