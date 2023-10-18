using AutoMapper;
using Backend.Business;
using Backend.Business.Blacklist;
using Backend.Business.DecisionBlacklist;
using Backend.Business.DividingRoom;
using Backend.Business.ExamCalendar;
using Backend.Business.ExamScheduleTopik;
using Backend.Business.ManageApplicationTime;
using Backend.Business.ManageRegisteredCandidateAP;
using Backend.Business.ManageRegisteredCandidates;
using Backend.Business.ManageRegisteredCandidateTopik;
using Backend.Business.Navigation;
using Backend.Business.Payment;
using Backend.Business.Policy;
using Backend.Business.ResonBlacklist;
using Backend.Business.Role;
using Backend.Business.TestScore;
using Backend.Business.TimeFrame;
using Backend.Business.TimeFrameInDay;
using Backend.Business.TimeReciveApplication;
using Backend.Business.User;
using Backend.HoldPosition;
using Backend.Infrastructure.EntityFramework.Datatables;

namespace Backend.Infrastructure.Utils
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<SysUser, UserModel>().ReverseMap();
            CreateMap<SysUserMetadata, UserMetadataModel>().ReverseMap();
            CreateMap<SysNavigation, NavigationModel>().ReverseMap();
            CreateMap<SysPolicy, PolicyModel>().ReverseMap();
            CreateMap<SysTimeFrameInDay, TimeFrameInDayModel>().ReverseMap();
            CreateMap<SysTimeFrame, TimeFrameModel>().ReverseMap();
            CreateMap<SysManageApplicationTime, ManageApplicationTimeModel>().ReverseMap();
            CreateMap<SysTestScore, TestScoreModel>().ReverseMap();
            CreateMap<SysBlacklist, BlacklistModel>().ReverseMap();
            CreateMap<SysDecisionBlacklist, DecisionBlacklistModel>().ReverseMap();
            CreateMap<SysResonBlacklist, ResonBlacklistModel>().ReverseMap();
            CreateMap<SysExamScheduleTopik, ExamScheduleTopikModel>().ReverseMap();
            CreateMap<SysManageRegisteredCandidateTopik, RegisteredCandidateTopikModel>().ReverseMap();
            CreateMap<SysManageRegisteredCandidates, RegisteredCandidatesModel>().ReverseMap();
            CreateMap<SysManageRegisteredCandidates, ManageRegisteredCandidatesModel>().ReverseMap();
            CreateMap<SysExamFeeInformation, ExamFeeInformationModel>().ReverseMap();
            CreateMap<SysExamCalendar, ExamCalendarModel>().ReverseMap();
            CreateMap<SysExamRoomDivided, ExamRoomDividedModel>().ReverseMap();
            CreateMap<SysDividingExamPlace, DividingExamPlaceModel>().ReverseMap();
            CreateMap<SysPaymentRequestLog, PaymentModel>().ReverseMap();
            CreateMap<SysRole, RoleModel>().ReverseMap();
            CreateMap<SysStockList, StockListModel>().ReverseMap();
            CreateMap<SysSupplier, SupplierModel>().ReverseMap();
            CreateMap<SysCustomer, CustomerModel>().ReverseMap();
            CreateMap<SysSuppliesGroup, SuppliesGroupModel>().ReverseMap();
            CreateMap<SysSuppliesCategory, SuppliesCategoryModel>().ReverseMap();
            CreateMap<SysSuppliesKind, SuppliesKindModel>().ReverseMap();
            CreateMap<SysSupplies, SuppliesModel>().ReverseMap();
            CreateMap<SysImportStockProposal, ImportStockProposalModel>().ReverseMap();
            CreateMap<SysImportStockReceipt, ImportStockReceiptModel>().ReverseMap();
            CreateMap<SysExamPeriod, ExamPeriodModel>().ReverseMap();
            CreateMap<string, string>().ConvertUsing(s => string.IsNullOrEmpty(s) ? s : s.Trim());
            CreateMap<SysBlackListTopik, BlacklistTopikModel>().ReverseMap();
            CreateMap<SysUserReceiveEmailTest, UserReceiveEmailTestModel>().ReverseMap();
            CreateMap<SysTimeReciveApplication, TimeReciveApplicationModel>().ReverseMap();
            CreateMap<SysManageRegistedCandidateAP, ManageRegisteredCandidateAPModel>().ReverseMap();
            CreateMap<SysHoldPosition, HoldPositionModel>().ReverseMap();
            CreateMap<SysFaq, FaqModel>().ReverseMap();
            CreateMap<SysExamPeriodAP, ExamPeriodAPModel>().ReverseMap();
            CreateMap<SysExamScheduleAP, ExamScheduleAPModel>().ReverseMap();
            CreateMap<SysPaymentApRequestLog, PaymentApModel>().ReverseMap();
            CreateMap<SysPaymentITRequestLog, PaymentITModel>().ReverseMap();
        }
    }
}
