namespace Backend.Business.User
{
    public class EmailModel
    {
        public string Subject { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public string? TextBody { get; set; }
        public string? HTMLBody { get; set; }
    }

    public class EmailServiceModel
    {
        public List<string> ToEmail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public List<IFormFile> Attachments { get; set; }
    }
}
