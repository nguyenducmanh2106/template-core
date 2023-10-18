namespace Backend.Infrastructure.EntityFramework.Datatables
{

    /// <summary>
    /// Danh sách phòng thi được chia theo địa điểm
    /// </summary>
    public class SysExamRoomDivided : BaseTable<SysExamRoomDivided>
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Địa điểm thi đã được chia phòng(liên kết với bảng DividingExamPlaces)
        /// </summary>
        public Guid DividingExamPlaceId { get; set; }

        /// <summary>
        /// Phòng thi(Liên kết với bảng ExamRoom)
        /// </summary>
        public Guid ExamRoomId { get; set; }

        /// <summary>
        /// Sức chứa thí sinh tối đa của phòng
        /// </summary>
        public int Capacity { get; set; }

        /// <summary>
        /// Số lượng thực tế được chia vào
        /// </summary>
        public int ActualQuantity { get; set; }

        /// <summary>
        /// Tên thí sinh
        /// </summary>
        public string CandidateName { get; set; } = default!;

        /// <summary>
        /// Email của thí sinh
        /// </summary>
        public string CandidateEmail { get; set; } = default!;

        /// <summary>
        /// Số điện thoại thí sinh
        /// </summary>
        public string CandidatePhone { get; set; } = default!;

        /// <summary>
        /// ngày sinh
        /// </summary>
        public DateTime? CandidateBirthday { get; set; } = default!;

        /// <summary>
        /// Số báo danh của thí sinh
        /// </summary>
        public string CandidateNumber { get; set; } = default!;

        /// <summary>
        /// Id của profile
        /// </summary>
        public Guid UserProfileId { get; set; }

        /// <summary>
        /// Trạng thái đã gửi mail thông báo phòng thi và SBD(0: chưa gửi, 1: đã gửi,2: đang gửi)
        /// </summary>
        public int IsSendMail { get; set; }

        /// <summary>
        /// Ngôn ngữ thí sinh chọn để đăng ký TOPIK - dùng để gửi mail thông báo SBD về đúng ngôn ngữ thí sinh đã đăng ký
        /// </summary>
        public string LanguageSendMail { get; set; }

        /// <summary>
        /// Id của thí sinh đăng ký(liên kết với bảng ManageRegisteredCandidateTopik)
        /// </summary>
        public Guid CandidateRegisterId { get; set; }
    }
}
