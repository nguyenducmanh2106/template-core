using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class TicketModel
    {
        public bool AllowUsePersonalData { get; set; }
        public string SubmissionTime { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string NumberOfIdCard { get; set; } = string.Empty;
        public string OldCardIDNumber { get; set; } = string.Empty;
        public string NumberOfIdCardOther { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public string IMG3X4 { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Job { get; set; } = string.Empty;
        public string AddressWork { get; set; } = string.Empty;
        public string PurposeTest { get; set; } = string.Empty;
        public string PurposePoint { get; set; } = string.Empty;
        public bool IsTested { get; set; }
        public string DateTestRecent { get; set; } = string.Empty;
        public string ExamName { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string DateTest { get; set; } = string.Empty;
        public string TimeTest { get; set; } = string.Empty;
        public string PlaceTest { get; set; } = string.Empty;
        public string ProfileInclude { get; set; } = string.Empty;
        public string ProfileNote { get; set; } = string.Empty;
        public string AcceptBy { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string ExamNameIT { get; set; } = string.Empty;
        public string ExamSChedule { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;

    }
}
