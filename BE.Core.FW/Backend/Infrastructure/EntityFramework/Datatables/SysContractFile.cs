namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysContractFile : BaseTable<SysContractFile>
    {
        public Guid Id { get; set; }
        public Guid? ContractId { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }

        /// <summary>
        /// check xem file này là của văn thư đã ký upload lên
        /// </summary>
        public bool IsSignature { get; set; }
    }
}
