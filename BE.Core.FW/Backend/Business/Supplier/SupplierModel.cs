using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class SupplierModel
    {
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; } = false;
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class SupplierSearch
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
    }
}
