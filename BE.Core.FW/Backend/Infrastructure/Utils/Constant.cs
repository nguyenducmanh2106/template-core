using Backend.Business.Payment;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using DocumentFormat.OpenXml.Office2019.Presentation;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Identity;
using Microsoft.Office.Core;
using Minio.DataModel.Replication;
using static Backend.Infrastructure.Middleware.CustomAuthenticationHandler;
using static Backend.Infrastructure.Utils.Constant;
using System.ComponentModel;

namespace Backend.Infrastructure.Utils
{
    public class Constant
    {
        public enum Action
        {
            Create,
            Details,
            Edit,
            Delete,
            List,
        }

        /// <summary>
        /// Kiểu dữ liệu tiêu chí sắp xếp
        /// </summary>
        public enum TypeOrdering
        {
            /// <summary>
            /// không sắp xếp
            /// </summary>
            NoSort,

            /// <summary>
            /// tên tăng dần
            /// </summary>
            Name_Ascing,//

            /// <summary>
            /// tên giảm dần
            /// </summary>
            Name_Descing,//

            /// <summary>
            /// ngày sinh tăng dần
            /// </summary>
            Birthday_Ascing,//

            /// <summary>
            /// ngày sinh giảm dần
            /// </summary>
            Birthday_Descing,//

            /// <summary>
            /// ngày đăng ký tăng dần
            /// </summary>
            RegistrationDate_Ascing,//

            /// <summary>
            /// ngày đăng ký giảm dần
            /// </summary>
            RegistrationDate_Descing,//
        }

        public enum TypeExamFee
        {
            ServiceAlong = 1,
            ExamPrice = 2,
        }

        public enum StatusExamShedule
        {
            Open = 0,
            Close = 1,
        }
        public struct TestScoreFormColumns
        {
            public const string col0 = "FIRST_NAME";
            public const string col1 = "LAST_NAME";
            public const string col2 = "DOB";
            public const string col3 = "ID_or_PASSPORT";
            public const string col4 = "LISTENING";
            public const string col5 = "READING";
            public const string col6 = "TOTAL";
            public const string col7 = "TEST_DATE";
            public const string col8 = "FORM_CODE";
        }

        public struct TestScoreFormCheck
        {
            public const string col0 = "FIRST_NAME";
            public const string col1 = "LAST_NAME";
            public const string col2 = "DOB";
        }

        public struct TextStatusProfile
        {
            public const string ChuaDuyet = "Chưa duyệt";
            public const string DaDuyet = "Đã duyệt";
            public const string DoiLich = "Đổi lịch";
            public const string HoanLich = "Hoãn lịch";
            public const string HuyLich = "Hủy lịch";
            public const string IIGDoiLich = "IIG thay thay đổi lịch";
        }

        public struct TextStatusPaid
        {
            public const string ChuaThanhToan = "Chưa thanh toán";
            public const string DaThanhToan = "Đã thanh toán";
            public const string HoanTra = "Hoàn trả";
        }

        public struct Language
        {
            public const string VietNam = "vi";
            public const string England = "en";
            public const string Korea = "ko";
        }

        public struct LayoutCode
        {
            public const string statisticalRegisterTopik = "statistical-register-topik";
            public const string userManager = "userManager";
            public const string user = "user";
            public const string role = "role";
            public const string permission = "permission";
            public const string blacklist = "blacklist";
            public const string permissions = "permissions";
            public const string tuieditor = "tuieditor";
            public const string coreTct = "core-tct";
            public const string detail = "detail";
            public const string timeFrame = "time-frame";
            public const string complex = "complex";
            public const string examCalendarTopik = "exam-calendar-topik";
            public const string manageRegisteredCandidateTopik = "manage-registered-candidate-topik";
            public const string dividingExamRoomId = "dividing-exam-room-id";
            public const string dividingExamRoom = "dividing-exam-room";
            public const string dividingExamRoomCandidate = "dividing-exam-room-candidate";
            public const string svg = "svg";
            public const string component = "component";
            public const string blacklistDelete = "blacklist-delete";
            public const string test = "test";
            public const string form = "form";
            public const string applicationTime = "application-time";
            public const string core = "core";
            public const string basic = "basic";
            public const string manageRegisteredCandidates = "manage-registered-candidates";
            public const string listBlacklist = "list-blacklist";
            public const string home = "home";
            public const string resource = "resource";
            public const string examCalendar = "exam-calendar";
            public const string timeFrameInDay = "time-frame-in-day";
            public const string workplace = "workplace";
            public const string navigations = "navigations";
            public const string pages = "pages";
            public const string payment = "payment";
            public const string customer = "Customer";
            public const string suppliesGroup = "SuppliesGroup";
            public const string supplier = "Supplier";
            public const string stockList = "StockList";
            public const string kho = "Kho";
            public const string suppliesCategory = "SuppliesCategory";
            public const string suppliesKind = "SuppliesKind";
            public const string supplies = "Supplies";
            public const string userManageStock = "UserManageStock";
            public const string importStockReceipt = "ImportStockReceipt";
            public const string importStockProposal = "ImportStockProposal";
            public const string examPeriod = "ExamPeriod";
            public const string blackListTopik = "BlackListTopik";
            public const string testMail = "ContactTestMail";
            public const string candidateInvalid = "candidate-invalid";
        }

        public struct ActionPermission
        {
            public const int View = 1;
            public const int Create = 2;
            public const int Edit = 4;
            public const int Delete = 8;
        }

        public struct CodeExam
        {
            public const string TopikI = "7";
            public const string TopikII = "8";
            public const string TOEFL_ITP = "6";
            public const string TOEIC_SPW = "4";
            public const string IT = "3";
            public const string TOEIC = "2";
        }

        public struct CandidateInValid
        {
            public const string SBD = "SBD";
        }

        public enum CanDownFile
        {
            CanDown = 1,
            CanNotDown = 2,
            FileNotExits = 3,
            IdNotfound = 4,
        }

        public struct TypeIDCard
        {
            public const string CMND = "1";
            public const string CCCD = "2";
            public const string Passport = "3";
            public const string DinhDanh = "4";
        }
        public struct TypeCheckCandown
        {
            public const int AllData = 1;
            public const int ImageCard = 2;
            public const int ImageAvatar = 3;
            public const int StatusOfApplicants = 4;
            public const int ModelExamRoom = 5;
        }

        public enum StatusPaid
        {
            UnPaid = 1,
            Paid = 2,
            PaymentOverdue = 3,
            NonPayment = 4,
            Refund
        }

        public enum StatusProfile
        {
            Receive = 1,
            Approved,
            UnApproved,
        }

        public enum StatusBlacklist
        {
            WaitingApprove = 1,
            Blacklist,
            ExpiredBlacklist,
        }

        public enum StatusSendMail
        {
            All,
            Sent,
            Unsent,
        }

        public struct Metadata
        {
            public const string LastName = "LastName";
            public const string IsStudent = "IsStudent";
            public const string DistrictContact = "DistrictContact";
            public const string HasOtherIdCard = "HasOtherIdCard";
            public const string TypeIdCard = "TypeIdCard";
            public const string FirstName = "FirstName";
            public const string WardContact = "WardContact";
            public const string CityContact = "CityContact";
            public const string VietnameseName = "VietnameseName";
            public const string DateOfIssueOfIDCard = "DateOfIssueOfIDCard";
            public const string IdCardNumber = "IdCardNumber";
            public const string Gender = "Gender";
            public const string Job = "Job";
            public const string HouseNumber = "HouseNumber";
            public const string IDCardFront = "IDCardFront";
            public const string StudentCardImage = "StudentCardImage";
            public const string IDCardBack = "IDCardBack";
            public const string OldCardIDNumber = "OldCardIDNumber";
            public const string KoreaName = "KoreaName";
            public const string PlaceProvideIdCard = "PlaceProvideIdCard";
            public const string BirthDay = "BirthDay";
            public const string Email = "Email";
            public const string Phone = "Phone";
            public const string OptionJob = "OptionJob";
            public const string Passport = "Passport";
            public const string CCCD = "CCCD";
            public const string CMND = "CMND";
            public const string Country = "Country";
            public const string Language = "Language";
            public const string Image3x4 = "Image3x4";
            public const string SchoolCertificate = "SchoolCertificate";
            public const string BirthCertificate = "BirthCertificate";
            public const string IsKorean = "isKorean";
            public const string IsDisabilities = "IsDisabilities";
            public const string WardWork = "WardWork";
            public const string DistrictWork = "DistrictWork";
            public const string CityWork = "CityWork";
            public const string WorkAddress = "WorkAddress";
            public const string OldCardID = "OldCardID";
            public const string AllowUsePersonalData = "AllowUsePersonalData";
            public const string School = "School";
            public const string Class = "Class";
            public const string StudentCode = "StudentCode";
            public const string ParentPhone = "ParentPhone";
        }
        public static readonly Dictionary<string, string> responseCodeDescription = new()
        {
            { "00", "Giao dịch thành công" },
            { "05", "Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch" },
            { "06", "Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch (OTP)" },
            { "07", "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường) " },
            { "09", "Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking" },
            { "10", "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần" },
            { "11", "Giao dịch không thành công do: Đã hết hạn chờ thanh toán" },
            { "12", "Giao dịch không thành công do: Thẻ/Tài khoản bị khóa" },
            { "13", "Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch (OTP)" },
            { "24", "Giao dịch không thành công do: Khách hàng hủy giao dịch" },
            { "51", "Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch" },
            { "65", "Giao dịch không thành công do: Tài khoản  đã vượt quá hạn mức giao dịch trong ngày" },
            { "75", "Ngân hàng thanh toán đang bảo trì" },
            { "79", "Giao dịch không thành công do: Nhập sai mật khẩu thanh toán quá số lần quy định" },
            { "99", "Các lỗi khác" }
        };

        public static readonly Dictionary<string, string> transactionStatusDescription = new()
        {
            { "00", "Giao dịch thành công" },
            { "01", "Giao dịch chưa hoàn tất" },
            { "02", "Giao dịch bị lỗi" },
            { "04", "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)" },
            { "05", "VNPAY đang xử lý giao dịch này (GD hoàn tiền)" },
            { "06", "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)" },
            { "07", "Giao dịch bị nghi ngờ gian lận" },
            { "09", "GD Hoàn trả bị từ chối" },
            { "10", "Đã giao hàng" },
            { "20", "Giao dịch đã được thanh quyết toán cho merchant" }
        };

        public const string SQL_COLLATION_CASE_SENSITIVE = "SQL_Latin1_General_CP1_CS_AS";

        public enum StockApproveType
        {
            Proposal = 1,
            Receipt = 2
        }

        public enum BlacklistTopikStatus
        {
            NotBegin = 1,
            Inprogress = 2,
            Finish = 3
        }
        public enum RegionNumber
        {
            MienBac = 1,
            MienTrung = 2,
            MienNam = 3
        }

        public enum PaymentPortalType
        {
            Vnpay = 1
        }

        public enum ExamTypeFromAsc
        {
            English = 1,
            IT
        }
    }
}
