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
        public DbSet<SysTimeFrame>? TimeFrames { get; set; }
        public DbSet<SysTimeFrameInDay>? TimeFrameInDays { get; set; }
        public DbSet<SysManageApplicationTime>? ManageApplicationTimes { get; set; }
        public DbSet<SysTestScore>? TestScores { get; set; }
        public DbSet<SysBlacklist>? Blacklist { get; set; }
        public DbSet<SysExamScheduleTopik>? ExamScheduleTopiks { get; set; }
        public DbSet<SysManageRegisteredCandidates>? ManageRegisteredCandidates { get; set; }
        public DbSet<SysManageRegisteredCandidateTopik>? ManageRegisteredCandidateTopik { get; set; }
        public DbSet<SysExamFeeInformation>? ExamFeeInformation { get; set; }
        public DbSet<SysExamCalendar>? ExamCalendar { get; set; }
        public DbSet<SysSlotRegister>? SysSlotRegisters { get; set; }
        public DbSet<SysPaymentRequestLog>? SysPaymentRequestLog { get; set; }
        public DbSet<SysPaymentResponseLog>? SysPaymentResponseLog { get; set; }
        public DbSet<SysDividingExamPlace>? SysDividingExamPlace { get; set; }
        public DbSet<SysExamRoomDivided>? SysExamRoomDivided { get; set; }
        public DbSet<SysUserProfileRegistered>? UserProfileRegistered { get; set; }
        public DbSet<SysUserSubmitTime>? UserSubmitTime { get; set; }
        public DbSet<SysStockList>? SysStockList { get; set; }
        public DbSet<SysSupplier>? SysSupplier { get; set; }
        public DbSet<SysCustomer>? SysCustomer { get; set; }
        public DbSet<SysSuppliesGroup>? SysSuppliesGroup { get; set; }
        public DbSet<SysCandidateInvalidTopik>? CandidateInvalidTopik { get; set; }
        public DbSet<SysSuppliesCategory>? SysSuppliesCategory { get; set; }
        public DbSet<SysSuppliesKind>? SysSuppliesKind { get; set; }
        public DbSet<SysSupplies>? SysSupplies { get; set; }
        public DbSet<SysImportStockProposal>? SysImportStockProposal { get; set; }
        public DbSet<SysImportStockProposalDetail>? SysImportStockProposalDetail { get; set; }
        public DbSet<SysImportStockReceipt>? SysImportStockReceipt { get; set; }
        public DbSet<SysImportStockReceiptDetail>? SysImportStockReceiptDetail { get; set; }
        public DbSet<SysUserManageStock>? SysUserManageStock { get; set; }
        public DbSet<SysExamPeriod>? ExamPeriod { get; set; }
        public DbSet<SysBlackListTopik>? BlackListTopik { get; set; }
        public DbSet<SysUserReceiveEmailTest>? UserReceiveEmailTests { get; set; }
        public DbSet<SysEmailHistory>? EmailHistories { get; set; }
        public DbSet<SysDecisionBlacklist>? DecisionBlacklists { get; set; }
        public DbSet<SysResonBlacklist>? ResonBlacklists { get; set; }
        public DbSet<SysFaq>? SysFaq { get; set; }
        public DbSet<SysExamPeriodAP>? SysExamPeriodAP { get; set; }
        public DbSet<SysTimeReciveApplication>? SysTimeReciveApplications { get; set; }
        public DbSet<SysExamScheduleAP>? SysExamScheduleAP { get; set; }
        public DbSet<SysExamScheduleDetailAP>? SysExamScheduleDetailAP { get; set; }
        public DbSet<SysManageRegistedCandidateAP>? ManageRegistedCandidateAPs { get; set; }
        public DbSet<SysUserProfileRegisteredAP>? UserProfileRegisteredAPs { get; set; }
        public DbSet<SysPaymentApRequestLog>? SysPaymentRequestApLog { get; set; }
        public DbSet<SysPaymentApResponseLog>? SysPaymentResponseApLog { get; set; }
        public DbSet<SysNumberOfRegistration>? NumberOfRegistrations { get; set; }
        public DbSet<SysFileData>? FileDatas { get; set; }
        public DbSet<SysHoldPosition>? HoldPositions { get; set; }
        public DbSet<SysUserProfileRegisteredIT>? UserProfileRegisteredIT { get; set; }
        public DbSet<SysManageRegisteredCandidateIT>? ManageRegisteredCandidateIT { get; set; }
        public virtual DbSet<RegisteredHistorySpResponse>? RegisteredHistorySpResponse { get; set; }
        public virtual DbSet<SysPaymentITRequestLog>? SysPaymentITRequestLog { get; set; }
        public virtual DbSet<SysPaymentITResponseLog>? SysPaymentITResponseLog { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connectionString = Backend.Infrastructure.Utils.Utils.GetConfig("ConnectionStrings:Core.Framework");
            optionsBuilder.UseSqlServer(connectionString);
            //optionsBuilder.LogTo(Console.WriteLine);
        }
    }
}
