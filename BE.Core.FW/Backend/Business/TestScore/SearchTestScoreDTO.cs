using Backend.Infrastructure.Utils;

namespace Backend.Business.TestScore
{
    public class SearchTestScoreDTO : Pageable
    {
        public string? FirstName { get; set; } = string.Empty;
        public string? LastName { get; set; } = string.Empty;
        public string? IdOrPassport { get; set; } = string.Empty;
        public DateTime? DOB { get; set; }
    }
}
