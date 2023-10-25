using System.ComponentModel.DataAnnotations;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysTaxCategory : BaseTable<SysTaxCategory>
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Code { get; set; } = default!;
        public bool Status { get; set; }
        public decimal Value { get; set; }

    }
}
