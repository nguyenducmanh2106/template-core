using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class SuppliesKindModel
    {
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        [Required]
        public Guid SuppliesGroupId { get; set; }
        [Required]
        public Guid SuppliesCategoryId { get; set; }
        [MaxLength(1000)]
        public string? Note { get; set; }
        public bool IsActive { get; set; }
    }

    public class SuppliesKindSearch
    {
        public string? Name { get; set; }
        public Guid? SuppliesGroupId { get; set; }
        public Guid? SuppliesCategoryId { get; set; }
        public bool? IsActive { get; set; }
    }
}
