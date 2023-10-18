using Backend.Business.DecisionBlacklist;
using System.ComponentModel.DataAnnotations;

namespace Backend.Business.Blacklist
{
    public class BlacklistModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string IDNumberCard { get; set; } = string.Empty;
        public int TypeIdCard { get; set; }
        public int Target { get; set; }
        public Guid ExamId { get; set; }
        public bool IsAutoFill { get; set; }
        public DecisionBlacklistModel DecisionBlackList { get; set; } = new DecisionBlacklistModel();
    }

    public class BlacklistShowDataModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string IDNumberCard { get; set; } = string.Empty;
        public int TypeIdCard { get; set; }
        public int Target { get; set; }
        public Guid ExamId { get; set; }
        public bool IsAutoFill { get; set; }
        public List<DecisionBlacklistModel> DecisionBlackLists { get; set; } = new List<DecisionBlacklistModel>();
    }


    public class BlacklistShowModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string IDNumberCard { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public int TypeIdCard { get; set; }
        public int Target { get; set; }
        public Guid ExamId { get; set; }
        public bool IsAutoFill { get; set; }
        public Guid BlacklistId { get; set; }
        public string? DecisionNumber { get; set; }
        public DateTime? DecisionDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? Reason { get; set; }
        public int? FormProcess { get; set; }
        public string? ExamIdBan { get; set; }
        public DateTime? DateApprove { get; set; }
        public string? CreatedBy { get; set; }
        public string? ApproveBy { get; set; }
        public string? Note { get; set; } = string.Empty;
        public int? Status { get; set; }
        public string? FilePath { get; set; }
        public string? CreatedOnDate { get; set; }
        public IFormFile? FileFile { get; set; }
    }
}
