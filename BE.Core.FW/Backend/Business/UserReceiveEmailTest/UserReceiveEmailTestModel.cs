using Backend.Business.Policy;
using System.ComponentModel.DataAnnotations;

namespace Backend.Business.User
{
    public class UserReceiveEmailTestModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// trạng thái
        /// </summary>
        public int Status { get; set; }

        /// <summary>
        /// Ngôn ngữ thí sinh chọn để đăng ký TOPIK - dùng để gửi mail thông báo SBD về đúng ngôn ngữ thí sinh đã đăng ký
        /// </summary>
        public string? LanguageSendMail { get; set; }

        public DateTime CreatedOnDate { get; set; }
        public DateTime LastModifiedOnDate { get; set; }
    }
}
