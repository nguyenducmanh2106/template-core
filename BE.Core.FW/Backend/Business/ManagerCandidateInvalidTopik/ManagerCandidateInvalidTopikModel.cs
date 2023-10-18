using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ManagerCandidateInvalidTopik
{
    public class ManagerCandidateInvalidTopikModel
    {
        public Guid Id { get; set; }
        public string SBD { get; set; } = string.Empty;
    }

    public class ManagerCandidateInvalidTopikShowInfoModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string FullNameKorea { get; set; } = string.Empty;
        public DateTime BirthDay { get; set; }
        public string Sex { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}
