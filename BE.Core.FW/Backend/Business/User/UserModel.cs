using Backend.Business.Policy;

namespace Backend.Business.User
{
    public class UserModel
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string Phone { get; set; } = string.Empty;
        public List<UserMetadataModel> Metadata { get; set; } = new List<UserMetadataModel>();
        public Guid? RoleId { get; set; }
        public string? RoleName { get; set; }
        public Guid SyncId { get; set; }

        /// <summary>
        /// mặc định tài khoản ở trạng thái khóa
        /// </summary>
        public bool IsDisabled { get; set; } = false;

        /// <summary>
        /// id phòng ban
        /// </summary>
        public Guid? IIGDepartmentId { get; set; }
        public string? IIGDepartmentName { get; set; }

        public List<PolicyModel> Permissions { get; set; } = new List<PolicyModel>();

        public DateTime CreatedOnDate { get; set; }
    }

    public class UserMetadataModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid MetadataId { get; set; }
        public string MetadataCode { get; set; } = string.Empty;
        public string MetadataName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class UserChangePassword
    {
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }

    public class UserLoginInfo : UserModel
    {
        public List<Guid> AccessDataHeaderQuater { get; set; } = new List<Guid>();
        public string? AccessDataHeaderQuaterString { get; set; }
    }
}
