using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ManageRegisteredCandidateAP
{
    public class ManageRegisteredCandidateAPModel
    {
        public Guid Id { get; set; }
        public Guid UserProfileId { get; set; }
        public string ScheduleDetailIds { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    public class ManageRegisteredCandidateAPAdminModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string CreatedOnDate { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string? SBD { get; set; }
        public string ScheduleDetailIds { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public int IsPaid { get; set; }
        public ExamInfoModel ExamInfo { get; set; } = new ExamInfoModel();
    }

    public class UpdateManageRegisteredCandidateAPAdminModel
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public string Birthday { get; set; } = string.Empty;
        public string TypeIDCard { get; set; } = string.Empty;
        public string IDCardNumber { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public string? SBD { get; set; }
        public string School { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string ExamPeriodName { get; set; } = string.Empty;
        public List<ExamInfoModel> ExamInfo { get; set; } = new List<ExamInfoModel>();
        public string CreatedOnDate { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public bool IsChangeUserInfo { get; set; }
    }

    public class ExamInfoModel
    {
        public int STT { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string DateTest { get; set; } = string.Empty;
        public string TimeTest { get; set; } = string.Empty;
        public string ExamWorkshift { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
    }
}
