using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ResonBlacklist
{
    public class ResonBlacklistModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string CreatedOnDate { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
