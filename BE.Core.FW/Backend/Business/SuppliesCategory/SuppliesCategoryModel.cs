using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class SuppliesCategoryModel
    {
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [Required]
        public int SuppliesSerialStatus { get; set; }
        public bool IsActive { get; set; } = false;
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class SuppliesCategorySearch
    {
        public string? Name { get; set; }
        public int? SuppliesSerialStatus { get; set; }
        public bool? IsActive { get; set; }
    }
}
