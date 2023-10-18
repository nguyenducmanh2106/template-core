using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysCandidateInvalidTopik : BaseTable<SysCandidateInvalidTopik>
    {
        [Key]
        public Guid Id { get; set; }
        public string SBD { get; set; } = string.Empty;
    }
}
