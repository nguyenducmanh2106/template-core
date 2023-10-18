using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ManageRegisteredCandidates
{
    public class ExamFeeInformationModel
    {
        public Guid Id { get; set; }
        public Guid ManageRegisteredCandidatesId { get; set; }
        public Guid SeviceId { get; set; }
        public string NameService { get; set; } = string.Empty;
        public long Price { get; set; }
        public int Type { get; set; }
    }
}
