using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class SuppliesModel
    {
        public Guid Id { get; set; }
        [Required, MaxLength(255)]
        public string Code { get; set; } = null!;
        [Required]
        public Guid SuppliesGroupId { get; set; }
        [Required]
        public Guid SuppliesKindId { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class SuppliesSearch
    {
        public string? Code { get; set; }
        public Guid? SuppliesGroupId { get; set; }
        public Guid? SuppliesKindId { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
