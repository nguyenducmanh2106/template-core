using Backend.Business.ManageRegisteredCandidates;
using Backend.Model;

namespace Backend.Business.ManageRegisteredCandidateIT
{
    public class ManageRegisteredCandidateITModel
    {
        public Guid Id { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string ExamPurpose { get; set; } = string.Empty;
        public long ScoreGoal { get; set; }
        public bool IsTested { get; set; }
        public string? TestDate { get; set; }
        public long Price { get; set; }
        public List<ExamTestInfoModel> ExamTestInfo { get; set; } = new List<ExamTestInfoModel>();
        public UserInfoITModel UserInfoITModel { get; set; } = new UserInfoITModel();
        public string CreatedOnDate { get; set; } = string.Empty;
    }

    public class InputManageRegisteredCandidateITModel
    {
        public Guid Id { get; set; }
        public Guid UserProfileId { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public long ScoreGoal { get; set; }
        public bool IsTested { get; set; }
        public string? TestDate { get; set; }
        public Guid AreaId { get; set; }
        public Guid ExamId { get; set; }
        public List<ExamSubjectDataModel> ExamRegistedData { get; set; } = new List<ExamSubjectDataModel>();
        public int StatusPaid { get; set; }
        public Guid UserId { get; set; }
        public long Price { get; set; }
    }

    public class ExamSubjectDataModel
    {
        public string ExamVersionId { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string ExamScheduleId { get; set; } = string.Empty;
    }

    public class ExamTestInfoModel
    {
        public string ExamName { get; set; } = string.Empty;
        public string ExamVersion { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string ExamTime { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class ListManageRegisteredCandidatesITModel
    {
        public Guid Id { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string ExamVersionName { get; set; } = string.Empty;
        public UserInfoModel? UserInfo { get; set; }
        public long ScoreGoal { get; set; }
        public long Price { get; set; }
        public bool IsTested { get; set; }
        public Guid ExamId { get; set; }
        public List<ExamTestInfoModel> ExamTestInfo { get; set; } = new List<ExamTestInfoModel>();
        public string CreatedOnDate { get; set; } = string.Empty;
    }
}
