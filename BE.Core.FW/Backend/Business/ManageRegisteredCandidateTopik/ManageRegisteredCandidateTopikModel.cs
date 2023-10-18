using Backend.Business.ExamCalendar;
using Backend.Business.ExamScheduleTopik;
using Backend.Business.ManageRegisteredCandidates;
using Backend.Model;
using System.ComponentModel.DataAnnotations;

namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public class ManageRegisteredCandidateTopikModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid UserProfileId { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public Guid AreaTest { get; set; }
        public string? AreaTestName { get; set; }
        public Guid PlaceTest { get; set; }
        public string? PlaceTestName { get; set; }
        public string? PlaceTestAddress { get; set; }
        public bool IsTestTOPIK { get; set; }
        public Guid ExamId { get; set; }
        public Guid TestScheduleId { get; set; }
        public ExamScheduleTopikModel? TestSchedule { get; set; }
        public string KnowWhere { get; set; } = string.Empty;
        public int? IsPaid { get; set; }

        public long Price { get; set; }
        public UserInfoModel? UserInfo { get; set; }
        public ExamInfoModel? ExamInfo { get; set; }
        public DateTime DateRegister { get; set; }
        public string? DateRegisterString { get; set; }

        /// <summary>
        /// Mã giao dịch
        /// </summary>
        public string? TransactionNo { get; set; }

        /// <summary>
        /// Thời gian thanh toán 
        /// </summary>
        public DateTime? PayDate { get; set; }

        /// <summary>
        /// Id của phòng thi
        /// </summary>
        public Guid? ExamRoomId { get; set; }
        public string? ExamRoomName { get; set; }

        /// <summary>
        /// Trường số báo danh
        /// </summary>
        public string? CandidateNumber { get; set; }

        public bool IsChangeUserInfo { get; set; } = false;
    }

    public class RegisteredCandidateTopikModel
    {
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }
        public Guid UserProfileId { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public Guid AreaTest { get; set; }
        public Guid PlaceTest { get; set; }
        public string? PlaceTestName { get; set; }
        public bool IsTestTOPIK { get; set; }
        public Guid ExamId { get; set; }
        public Guid TestScheduleId { get; set; }
        public string KnowWhere { get; set; } = string.Empty;
        public int? IsPaid { get; set; }
        public long Price { get; set; }
        public string? RegistrationCode { get; set; }
        public string? LanguageName { get; set; }
    }

    public class ListCandidateTopikModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Guid ExamId { get; set; }
        public Guid PlaceTest { get; set; }
        public string DateCreated { get; set; } = string.Empty;
        public int IsPaid { get; set; }
        public int Status { get; set; }
        public long Price { get; set; }
    }
}
