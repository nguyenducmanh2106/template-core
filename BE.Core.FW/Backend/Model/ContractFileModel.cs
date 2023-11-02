namespace Backend.Model
{
    public class ContractFileModel
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = default!;
        public string FilePath { get; set; } = default!;
        /// <summary>
        /// check xem file này là của văn thư đã ký upload lên
        /// </summary>
        public bool IsSignature { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;
    }
}
