namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class SysSalesPlaning : BaseTable<SysSalesPlaning>
    {
        public Guid Id { get; set; }
        public string? ContractNumber { get; set; }
        public string? Name { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ImplementationDate { get; set; }
        public decimal ContractValue { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? ProvinceId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? CustomerType { get; set; }
        public int CustomerStatus { get; set; }

        /// <summary>
        /// Đối tượng khách hàng
        /// </summary>
        public Guid? CustomerCategory { get; set; }

        /// <summary>
        /// Tính chất khách hàng
        /// </summary>
        public int CustomerProperty { get; set; }
        public bool IsMOU { get; set; }
        public Guid? ContractId { get; set; }
        public int State { get; set; }
        public decimal Cost { get; set; }
        public decimal CostTaxRate { get; set; }
        public decimal TotalCostTax { get; set; }
        public decimal ImplementationCost { get; set; }
        public string? CostDescription { get; set; }
        public Guid? DepartmentId { get; set; }
        public string Username { get; set; }
        public int ContractProperty { get; set; }
        public string? ContractName { get; set; }
    }
}
