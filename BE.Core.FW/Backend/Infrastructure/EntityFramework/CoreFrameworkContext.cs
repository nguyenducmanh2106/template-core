using Backend.Business;
using Backend.Infrastructure.EntityFramework.Datatables;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.EntityFramework
{
    public class CoreFrameworkContext : DbContext
    {
        public DbSet<SysHistory>? Histories { get; set; }
        public DbSet<SysDeletedItem>? DeletedItems { get; set; }
        public DbSet<SysNavigation>? Navigations { get; set; }
        public DbSet<SysPolicy>? Policies { get; set; }
        public DbSet<SysUser>? Users { get; set; }
        public DbSet<SysRole>? Roles { get; set; }
        public DbSet<SysUserMetadata>? UserMetadata { get; set; }
        public DbSet<SysEmailHistory>? EmailHistories { get; set; }
        public DbSet<SysDepartment>? Departments { get; set; }
        public DbSet<SysBranch> Branchs { get; set; }
        public DbSet<SysProductCategory> ProductCategories { get; set; }
        public DbSet<SysProductType> ProductTypes { get; set; }
        public DbSet<SysProduct> Products { get; set; }
        public DbSet<SysCustomerCategory> CustomerCategories { get; set; }
        public DbSet<SysCustomerType> CustomerTypes { get; set; }
        public DbSet<SysCustomer> Customers { get; set; }
        public DbSet<SysProvince> Provinces { get; set; }
        public DbSet<SysDistrict> Districts { get; set; }
        public DbSet<SysContractType> ContractTypes { get; set; }

        public DbSet<SysContract> Contracts { get; set; }
        public DbSet<SysContractFile> ContractFiles { get; set; }
        public DbSet<SysContractProduct> ContractProducts { get; set; }
        public DbSet<SysTarget> Targets { get; set; }
        public DbSet<SysTargetMapping> TargetMappings { get; set; }
        public DbSet<SysSalesPlaning> SalesPlanings { get; set; }
        public DbSet<SysSalesPlaningProduct> SalesPlaningProducts { get; set; }
        public DbSet<SysSalesPlaningPayment> SalesPlaningPayments { get; set; }
        public DbSet<SysSalesPlaningCommision> SysSalesPlaningCommisions { get; set; }
        public DbSet<SysSalesPlaningPaymentCommision> SysSalesPlaningPaymentCommisions { get; set; }
        public DbSet<SysAcceptanceCertificate> AcceptanceCertificates { get; set; }
        public DbSet<SysPricingDecision> PricingDecisions { get; set; }
        public DbSet<SysTaxCategory> SysTaxCategories { get; set; }
        public DbSet<SysHistoryTarget> HistoryTargets { get; set; }
        public DbSet<SysSalesPlaningProductPayments> SalesPlaningProductPayments { get; set; }
        public DbSet<SysSalesPlaningPaymentCosts> SalesPlaningPaymentCosts { get; set; }
        public DbSet<SysSalesPlaningPaymentMapping> SalesPlaningPaymentMappings { get; set; }
        public DbSet<SysPricingCategory> PricingCategories { get; set; }
        public DbSet<SysWorkflowConfig> WorkflowConfigs { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connectionString = Backend.Infrastructure.Utils.Utils.GetConfig("ConnectionStrings:Core.Framework");
            optionsBuilder.UseSqlServer(connectionString);
            //optionsBuilder.LogTo(Console.WriteLine);
        }
    }
}
