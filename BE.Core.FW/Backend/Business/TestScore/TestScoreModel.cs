namespace Backend.Business.TestScore
{
    public class TestScoreModel
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string IdOrPassport { get; set; } = string.Empty;
        public int Listening { get; set; } = 0;
        public int Reading { get; set; } = 0;
        public int Total { get; set; } = 0;
        public DateTime TestDate { get; set; }
        public string FormCode { get; set; } = string.Empty;
    }
}
