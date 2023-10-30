namespace Backend.Model
{
    public class MessageModel
    {
        public List<Guid> Users { get; set; } = new List<Guid>();
        public List<Guid> Topics { get; set; } = new List<Guid>();
        public int Type { get; set; } // 0 - Notification message; 1 - Data message
        public FirebaseAdmin.Messaging.Notification? Notification { get; set; }
        public Dictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    }
}
