using Backend.Model;

namespace Backend.Business.ManageRegisteredCandidates
{
    public class ManageRegisteredCandidatesModel
    {
        public Guid Id { get; set; }
        public Guid UserProfileId { get; set; }
        public string? CodeProfile { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public UserInfoModel? UserInfo { get; set; }
        public long ScoreGoal { get; set; }
        public bool IsTested { get; set; }
        public DateTime? TestDate { get; set; }
        public Guid PlaceOfRegistration { get; set; }
        public Guid SubmissionTime { get; set; }
        public Guid ExamId { get; set; }

        public string? ExamVersion { get; set; }

        public DateTime? TestScheduleDate { get; set; }
        public DateTime? ReturnResultDate { get; set; }
        public Guid? PriorityObject { get; set; }
        public string? AccompaniedService { get; set; } = string.Empty;
        public string? UserName { get; set; } = string.Empty; // Tài khoản thi tin học
        public string? Password { get; set; } = string.Empty; // Mật khẩu thi bài thi tin học
        public string? Note { get; set; } = string.Empty;
        public string? ProfileNote { get; set; }
        public string? ProfileIncludes { get; set; }
        public int? Status { get; set; }
        public string? AcceptBy { get; set; }
        public int? StatusPaid { get; set; }
        public DateTime? DateAccept { get; set; }
        public DateTime? DateReceive { get; set; }
        public ExamInfoModel? ExamInfo { get; set; }
        public List<ExamFeeInformationModel>? ExamFee { get; set; }
        public long Fee { get; set; }
        public DateTime? DateApply { get; set; }
        public string? TimeApply { get; set; }
        public bool IsChangeUserInfo { get; set; } = false;
        public bool? CanTest { get; set; }
        public Guid? ExamScheduleId { get; set; }
        public int? Receipt { get; set; }
        public string? FullNameReceipt { get; set; }
        public string? PhoneReceipt { get; set; }
        public string? AddReceipt { get; set; }
        public string CreatedOnDate { get; set; } = string.Empty;
    }

    public class HistoryRegisteredModel
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? BirthDay { get; set; }
        public string? IDcard { get; set; }
        public string? DateTest { get; set; }
    }

    public class RegisteredCandidatesModel
    {
        public Guid Id { get; set; }
        public string? CodeProfile { get; set; }
        public Guid UserProfileId { get; set; }
        public string ExamPurpose { get; set; } = string.Empty;
        public long ScoreGoal { get; set; }
        public bool IsTested { get; set; }
        public DateTime? TestDate { get; set; }
        public Guid PlaceOfRegistration { get; set; }
        public string ExamVersion { get; set; } = string.Empty;
        public Guid SubmissionTime { get; set; }
        public Guid ExamId { get; set; }
        public Guid? UserId { get; set; }
        public int? Status { get; set; }
        public int? StatusPaid { get; set; }
        public long? Price { get; set; }
        public Guid? AreaId { get; set; }
    }

    public class ExportManageRegisteredCandidatesModel
    {
        /// <summary>
        /// Số thứ tự
        /// </summary>
        public int Ordering { get; set; }

        /// <summary>
        /// Mã hồ sơ
        /// </summary>
        public string? CodeProfile { get; set; }

        /// <summary>
        /// Họ
        /// </summary>
        public string? FirstName { get; set; }

        /// <summary>
        /// Tên
        /// </summary>
        public string? LastName { get; set; }

        /// <summary>
        /// Giới tính
        /// </summary>
        public string? Gender { get; set; }

        /// <summary>
        /// Ngày sinh
        /// </summary>
        public DateTime? Birthday { get; set; }

        /// <summary>
        /// Số CMND
        /// </summary>
        public string? CMND { get; set; }

        /// <summary>
        /// Sử dụng CMND khác
        /// </summary>
        public string? CMND_Other { get; set; }

        /// <summary>
        /// Số CMND gốc
        /// </summary>
        public string? CMND_Original { get; set; }

        /// <summary>
        /// Bằng cấp/ chứng chỉ
        /// </summary>
        public string? ExamName { get; set; }
        public Guid? ExamId { get; set; }

        /// <summary>
        /// Đã tham gia bài thi này chưa
        /// </summary>
        public string? IsTested { get; set; }

        /// <summary>
        /// Ngày thi gần nhất
        /// </summary>
        public DateTime? TestDateLatest { get; set; }

        /// <summary>
        /// Địa chỉ liên hệ(Tỉnh + Huyện + số nhà)
        /// </summary>
        public string? ContactAddress { get; set; }
        public Guid? ContactAddressWardId { get; set; }
        public Guid? ContactAddressDistrictId { get; set; }
        public Guid? ContactAddressCityId { get; set; }

        /// <summary>
        /// Số điện thoại
        /// </summary>
        public string? Phone { get; set; }

        /// <summary>
        /// Email
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Nghề nghiệp
        /// </summary>
        public string? Job { get; set; }

        /// <summary>
        /// Nơi công tác
        /// </summary>
        public string? WorkAddress { get; set; }
        public Guid? WorkAddressDistrictId { get; set; }
        public Guid? WorkAddressWardsId { get; set; }
        public Guid? WorkAddressCityId { get; set; }

        /// <summary>
        /// Mục đích dự thi
        /// </summary>
        public string? ExamPurpose { get; set; }

        /// <summary>
        /// Mục tiêu điểm số
        /// </summary>
        public long? ScoreGoal { get; set; }

        /// <summary>
        /// Cho phép IIG post thông tin điểm thi lên Website
        /// </summary>
        public string? IsPost { get; set; }

        /// <summary>
        /// Phòng thi
        /// </summary>
        public string? CandidateRoom { get; set; }

        /// <summary>
        /// Ngày thi
        /// </summary>
        public string? TestScheduleDate { get; set; }

        /// <summary>
        /// Giờ thi
        /// </summary>
        public string? ExamTime { get; set; }

        /// <summary>
        /// Địa điểm thi
        /// </summary>
        public string? ExamPlace { get; set; }

        /// <summary>
        /// Thời gian tiếp nhận hồ sơ(ngày + giờ)
        /// </summary>
        public string? DateApply { get; set; }

        /// <summary>
        /// Ngày trả kết quả
        /// </summary>
        public string? ReturnResultDate { get; set; }

        /// <summary>
        /// Ngày đăng ký
        /// </summary>
        public DateTime? CreateOnDate { get; set; }

        /// <summary>
        /// Nhân viên đăng ký
        /// </summary>
        public string? FullNameReceipt { get; set; }

        /// <summary>
        /// Xác nhận email
        /// </summary>
        public string? ConfirmEmail { get; set; }

        /// <summary>
        /// Địa chỉ nhận giấy báo
        /// </summary>
        public string? AddressReceiveResults { get; set; }

        /// <summary>
        /// Trạng thái hồ sơ
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Lý do
        /// </summary>
        public string? Reason { get; set; }

        /// <summary>
        /// Họ tên phụ huynh
        /// </summary>
        public string? FullnameParent { get; set; }

        /// <summary>
        /// Hồ sơ của thí sinh bao gồm
        /// </summary>
        public string? ProfileIncludes { get; set; }

        /// <summary>
        /// Đặc điểm hồ sơ cần lưu ý(nếu có)
        /// </summary>
        public string? ProfileNote { get; set; }

        /// <summary>
        /// Dịch vụ đi kèm
        /// </summary>
        public string? AccompaniedService { get; set; }
    }

    public class SendMailModel
    {
        public Guid ExamId { get; set; }
        public int EmailTemplateType { get; set; }
        public string UserEmail { get; set; } = null!;
        public dynamic? SendMailObject { get; set; }
    }

    public class SendEmailRegistrationModel
    {
        public string? FileCode { get; set; }
        public string? CandidateName { get; set; }
        public string? CandidateBirthday { get; set; }
        public string? DateApplyFile { get; set; }
        public string? TimeApplyFile { get; set; }
        public string? ExamLocation { get; set; }
        public string? ExamName { get; set; }
    }

    public class StatisticModel
    {
        public int Type { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
    }

    public class StatisticDetailModel
    {
        public string Name { get; set; } = null!;
        public DateTime Date { get; set; }
        public string DateString { get; set; } = null!;
        public int Value { get; set; }
    }
}
