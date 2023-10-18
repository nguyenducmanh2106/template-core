import { SelectOptionModel, SelectStatusOption } from '@/apis/models/data';
import { EmailTemplateType } from '@/apis/models/toefl-challenge/EmailTemplateType';
import { CheckboxOptionType } from "antd";
import { lazy } from 'react';

//#region Dùng để phân quyền
export const PermissionAction = {
  View: 1,
  Add: 2,
  Edit: 4,
  Delete: 8,
  Import: 16
}

export const permissionOptions: CheckboxOptionType[] = [
  {
    "label": "Xem",
    "value": PermissionAction.View
  },
  {
    "label": "Thêm",
    "value": PermissionAction.Add
  },
  {
    "label": "Sửa",
    "value": PermissionAction.Edit
  },
  {
    "label": "Xóa",
    "value": PermissionAction.Delete
  },
  {
    "label": "Import",
    "value": PermissionAction.Import
  }
];
//#endregion

//#region Dùng để khai báo router sử dụng lazy(Phương án xử lý tạm thời)
export const layoutCode = {
  statisticalRegisterTopik: "statistical-register-topik",
  userManager: "userManager",
  user: "user",
  role: "role",
  permission: "permission",
  blacklist: "blacklist",
  permissions: "permissions",
  tuieditor: "tuieditor",
  coreTct: "core-tct",
  detail: "detail",
  timeFrame: "time-frame",
  complex: "complex",
  examCalendarTopik: "exam-calendar-topik",
  manageRegisteredCandidateTopik: "manage-registered-candidate-topik",
  dividingExamRoomId: "dividing-exam-room-id",
  dividingExamRoom: "dividing-exam-room",
  dividingExamRoomCandidate: "dividing-exam-room-candidate",
  svg: "svg",
  component: "component",
  blacklistDelete: "blacklist-delete",
  test: "test",
  form: "form",
  applicationTime: "application-time",
  core: "core",
  basic: "basic",
  manageRegisteredCandidates: "manage-registered-candidates",
  listBlacklist: "list-blacklist",
  resonBlacklist: "reson-blacklist",
  home: "home",
  resource: "resource",
  examCalendar: "exam-calendar",
  timeFrameInDay: "time-frame-in-day",
  workplace: "workplace",
  navigations: "navigations",
  pages: "pages",
  payment: "payment",
  customer: "Customer",
  suppliesGroup: "SuppliesGroup",
  supplier: "Supplier",
  stockList: "StockList",
  kho: "Kho",
  suppliesCategory: "SuppliesCategory",
  suppliesKind: "SuppliesKind",
  supplies: "Supplies",
  userManageStock: "UserManageStock",
  importStockReceipt: "ImportStockReceipt",
  importStockProposal: "ImportStockProposal",
  examPeriod: "ExamPeriod",
  blackListTopik: "BlackListTopik",
  timeReciveApplication: "time-recive-application",
  testMail: "ContactTestMail",
  candidateInvalid: "candidate-invalid",
  faq: "faq",
  examPeriodAp: "examPeriodAp",
  examScheduleAp: "examScheduleAp",
  manageRegisteredCandidateAP: "manage-registered-candidates-ap",
  paymentAp: "paymentAp",
  manageRegisteredCandidateIT: "manage-registered-candidates-it",
  paymentIT: "paymentIT",
  toeflChallenge: "TOEFL_CHALLENGE",
  toeflChallengeDepartment: "toefl-challenge-department",
  toeflChallengeDivision: "toefl-challenge-division",
  toeflChallengeDivisionCreate: "toefl-challenge-division__create",
  toeflChallengeDivisionEdit: "toefl-challenge-division__edit",
  toeflChallengeSchool: "toefl-challenge-school",
  toeflChallengeSchoolCreate: "toefl-challenge-school__create",
  toeflChallengeSchoolEdit: "toefl-challenge-school__edit",
  toeflChallengeCompetition: "toefl-challenge-competition",
  toeflChallengeCompetitionCreate: "toefl-challenge-competition__create",
  toeflChallengeCompetitionEdit: "toefl-challenge-competition__edit",
  toeflChallengeTemplateEmail: "toefl-challenge-template-email",
  toeflChallengeRegistration: "toefl-challenge-registration",
  toeflChallengeRegistrationCreate: "toefl-challenge-registration__create",
  toeflChallengeRegistrationEdit: "toefl-challenge-registration__edit",
  toeflChallengeExamSchedule: "toefl-challenge-exam-schedule",
  toeflChallengeExamScheduleCreate: "toefl-challenge-exam-schedule__create",
  toeflChallengeExamScheduleEdit: "toefl-challenge-exam-schedule__edit",
  toeflChallengePaymentHistory: "toefl-challenge-payment-history",
  toeflChallengeRegistrationCode:"toefl-challenge-registration-code",
  toeflChallengeRegistrationCodeCreate:"toefl-challenge-registration-code__create",
  toeflChallengeRegistrationCodeEdit:"toefl-challenge-registration-code__edit",
}
export const routeArrays = [
  {
    "Code": layoutCode.statisticalRegisterTopik,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/StatisticalRegisterTopik'))
  },
  {
    "Code": layoutCode.userManager,
    "ComponentPath": lazy(() => import('../pages/CoreManager/UserManager'))
  },
  {
    "Code": layoutCode.user,
    "ComponentPath": lazy(() => import('../pages/roles/user'))
  },
  {
    "Code": layoutCode.role,
    "ComponentPath": lazy(() => import('../pages/roles/list'))
  },
  {
    "Code": layoutCode.permission,
    "ComponentPath": lazy(() => import('../pages/roles/permission'))
  },
  {
    "Code": layoutCode.blacklist,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.permissions,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.tuieditor,
    "ComponentPath": lazy(() => import('../pages/component/editor/TuiEditor'))
  },
  {
    "Code": layoutCode.coreTct,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.detail,
    "ComponentPath": lazy(() => import('../pages/pagesample/detail/basic'))
  },
  {
    "Code": layoutCode.timeFrame,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/TimeFrame'))
  },
  {
    "Code": layoutCode.complex,
    "ComponentPath": lazy(() => import('../pages/pagesample/form/complex'))
  },
  {
    "Code": layoutCode.examCalendarTopik,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ExamScheduleTopik'))
  },
  {
    "Code": layoutCode.manageRegisteredCandidateTopik,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ManageRegisteredCandidatesTOPIK'))
  },
  {
    "Code": layoutCode.dividingExamRoomId,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/DividingExamRoom'))
  },
  {
    "Code": layoutCode.dividingExamRoom,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/DividingExamRoom/ManagementDividedExamRoom'))
  },
  {
    "Code": layoutCode.dividingExamRoomCandidate,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/DividingExamRoom/ManagementDividedExamRoom/management-divided-candidate'))
  },
  {
    "Code": layoutCode.svg,
    "ComponentPath": lazy(() => import('../pages/component/icon/svg'))
  },
  {
    "Code": layoutCode.component,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.test,
    "ComponentPath": lazy(() => import('../pages/roles/test'))
  },
  {
    "Code": layoutCode.form,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.applicationTime,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ManageApplicationTime'))
  },
  {
    "Code": layoutCode.core,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.basic,
    "ComponentPath": lazy(() => import('../pages/pagesample/form/basic'))
  },
  {
    "Code": layoutCode.manageRegisteredCandidates,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ManageRegisteredCandidates'))
  },
  {
    "Code": layoutCode.listBlacklist,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/Blacklist'))
  },
  {
    "Code": layoutCode.resonBlacklist,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ResonBlacklist/Index'))
  },
  {
    "Code": layoutCode.home,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.resource,
    "ComponentPath": lazy(() => import('../pages/CoreManager/ResourceManager'))
  },
  {
    "Code": layoutCode.examCalendar,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ExamCalendar'))
  },
  {
    "Code": layoutCode.timeFrameInDay,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/TimeFrameInDay'))
  },
  {
    "Code": layoutCode.workplace,
    "ComponentPath": lazy(() => import('../pages/Home'))
  },
  {
    "Code": layoutCode.navigations,
    "ComponentPath": lazy(() => import('../pages/CoreManager/NavigationManager'))
  },
  {
    "Code": layoutCode.pages,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.payment,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/Payment'))
  },
  {
    "Code": layoutCode.customer,
    "ComponentPath": lazy(() => import('../pages/Stock/Customer'))
  },
  {
    "Code": layoutCode.kho,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.supplier,
    "ComponentPath": lazy(() => import('../pages/Stock/Supplier'))
  },
  {
    "Code": layoutCode.stockList,
    "ComponentPath": lazy(() => import('../pages/Stock/StockList'))
  },
  {
    "Code": layoutCode.suppliesGroup,
    "ComponentPath": lazy(() => import('../pages/Stock/SuppliesGroup'))
  },
  {
    "Code": layoutCode.suppliesCategory,
    "ComponentPath": lazy(() => import('../pages/Stock/SuppliesCategory'))
  },
  {
    "Code": layoutCode.suppliesKind,
    "ComponentPath": lazy(() => import('../pages/Stock/SuppliesKind'))
  },
  {
    "Code": layoutCode.supplies,
    "ComponentPath": lazy(() => import('../pages/Stock/Supplies'))
  },
  {
    "Code": layoutCode.userManageStock,
    "ComponentPath": lazy(() => import('../pages/Stock/UserManageStock'))
  },
  {
    "Code": layoutCode.importStockReceipt,
    "ComponentPath": lazy(() => import('../pages/Stock/ImportStockReceipt'))
  },
  {
    "Code": layoutCode.importStockProposal,
    "ComponentPath": lazy(() => import('../pages/Stock/ImportStockProposal'))
  },
  {
    "Code": layoutCode.examPeriod,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ExamPeriod'))
  },
  {
    "Code": layoutCode.blackListTopik,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/BlacklistTopik'))
  },
  {
    "Code": layoutCode.timeReciveApplication,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/TimeReciveApplication'))
  },
  {
    "Code": layoutCode.testMail,
    "ComponentPath": lazy(() => import('../pages/test-mail'))
  },
  {
    "Code": layoutCode.candidateInvalid,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ManagerCandidateInvalid/Index'))
  },
  {
    "Code": layoutCode.faq,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/Faq'))
  },
  {
    "Code": layoutCode.examPeriodAp,
    "ComponentPath": lazy(() => import('../pages/AP/ExamPeriodAP'))
  },
  {
    "Code": layoutCode.examScheduleAp,
    "ComponentPath": lazy(() => import('../pages/AP/ExamScheduleAP'))
  },
  {
    "Code": layoutCode.manageRegisteredCandidateAP,
    "ComponentPath": lazy(() => import('../pages/AP/ManageRegisteredCandidates'))
  },
  {
    "Code": layoutCode.paymentAp,
    "ComponentPath": lazy(() => import('../pages/AP/PaymentAP'))
  },
  {
    "Code": layoutCode.manageRegisteredCandidateIT,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/ManageRegisteredCandidatesIT'))
  },
  {
    "Code": layoutCode.paymentIT,
    "ComponentPath": lazy(() => import('../pages/CORE_TCT/PaymentIT'))
  },
  {
    "Code": layoutCode.toeflChallenge,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.toeflChallengeDepartment,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/department'))
  },
  {
    "Code": layoutCode.toeflChallengeDivision,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/division'))
  },
  {
    "Code": layoutCode.toeflChallengeDivisionCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/division/create'))
  },
  {
    "Code": layoutCode.toeflChallengeDivisionEdit,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/division/edit'))
  },
  {
    "Code": layoutCode.toeflChallengeSchool,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/school'))
  },
  {
    "Code": layoutCode.toeflChallengeSchoolCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/school/create'))
  },
  {
    "Code": layoutCode.toeflChallengeSchoolEdit,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/school/edit'))
  },
  {
    "Code": layoutCode.toeflChallengeCompetition,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/competition'))
  },
  {
    "Code": layoutCode.toeflChallengeCompetitionCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/competition/create'))
  },
  {
    "Code": layoutCode.toeflChallengeCompetitionEdit,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/competition/edit'))
  },
  {
    "Code": layoutCode.toeflChallengeTemplateEmail,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/template-email'))
  },
  {
    "Code": layoutCode.toeflChallengeRegistration,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration'))
  },
  {
    "Code": layoutCode.toeflChallengeRegistrationCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration/create'))
  },
  {
    "Code": layoutCode.toeflChallengeRegistrationEdit,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration/edit'))
  },
  {
    "Code": layoutCode.toeflChallengeExamSchedule,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/exam-schedule'))
  },
  {
    "Code": layoutCode.toeflChallengeExamScheduleCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/exam-schedule/create'))
  },
  {
    "Code": layoutCode.toeflChallengeExamScheduleEdit,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/exam-schedule/edit'))
  },
  {
    "Code": layoutCode.toeflChallengePaymentHistory,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/payment-history'))
  },
  {
    "Code": layoutCode.toeflChallengeRegistrationCode,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration-code'))
  },
  {
    "Code": layoutCode.toeflChallengeRegistrationCodeCreate,
    "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration-code/create'))
  },
  // {
  //   "Code": layoutCode.toeflChallengeRegistrationCodeEdit,
  //   "ComponentPath": lazy(() => import('../pages/toefl_challenge/registration-code/edit'))
  // },
]
//#endregion

export const statusPaid: SelectStatusOption[] = [
  {
    key: '1',
    label: 'Đã thanh toán',
    value: 2,
  },
  {
    key: '2',
    label: 'Chưa thanh toán',
    value: 1,
  },
  {
    key: '3',
    label: 'Hoàn trả',
    value: 5,
  },
];

export const statusProfile: SelectStatusOption[] = [
  {
    key: '1',
    label: 'Chờ duyệt',
    value: 1,
  },
  {
    key: '2',
    label: 'Đã duyệt',
    value: 2,
  },
  {
    key: '3',
    label: 'Từ chối',
    value: 3,
  }
];

export const errorMessage: Map<string, string> = new Map([
  ['incorrectFormat', 'Chỉ nhập ký tự chữ, số, " - " hoặc "_"'],
  ['required', 'Không được để trống']
]);

export const patternValidate: Map<string, RegExp> = new Map([
  ['code', /^[a-zA-Z0-9-_]+$/g]
]);

export const suppliesSerialStatusConstant = [
  {
    key: 1,
    value: 'Không'
  },
  {
    key: 2,
    value: 'Có'
  },
  {
    key: 3,
    value: 'Tùy chỉnh(Có thể có hoặc không)'
  }
];

export const userApproveType = {
  proposal: 1,
  receipt: 2,
};

export const importStockProposalStatus = {
  draft: 1,
  waitingForApprove: 2,
  approve: 3,
  reject: 4
};

export const importStockReceiptStatus = {
  draft: 1,
  waitingForApprove: 2,
  approve: 3,
  reject: 4
};

export const blackListTopikStatus = {
  waitConfirm: 1,
  InBlacklist: 2,
  OutBlacklist: 3
}

export const blackListTopikType = {
  proctor: 1,
  candicate: 2
}

export const examForm = {
  TiengAnh: "1",
  TinHoc: "2",
  Topik: "3"
}

export const examFormNum = {
  TiengAnh: 1,
  TinHoc: 2,
  Topik: 3
}

export const formProcess = {
  other: 0,
  waitExamine: 1,
  retake: 2,
  expiredRetake: 3,
  resultCancel: 4,
  banTest: 5,
  permanentlyBanned: 6
}

export const typeOfDecision = {
  Other: 0,
  AllOfTest: 1,
  AllOfEngTest: 2,
  AllOfITTest: 3,
}

export const typeIdCard = {
  CMND: 1,
  CCCD: 2,
  Passport: 3,
  DinhDanh: 4
}

export const TypeCheckCandownFile = {
  All: 1,
  ImageCard: 2,
  ImageAvatar: 3,
  StatusOfApplicants: 4,
  ModelExamRoom: 5
}

export const typeIdCardString = {
  CMND: '1',
  CCCD: '2',
  Passport: '3'
}
export const emailTemplateTypeConstant = [
  {
    key: EmailTemplateType._0,
    label: 'Registration',
    value: EmailTemplateType._0
  },
  {
    key: EmailTemplateType._1,
    label: 'RegistrationPayment',
    value: EmailTemplateType._1
  },
  {
    key: EmailTemplateType._2,
    label: 'RegistrationCode',
    value: EmailTemplateType._2
  },
  {
    key: EmailTemplateType._3,
    label: 'RegistrationScheduleRound2',
    value: EmailTemplateType._3
  },
  {
    key: EmailTemplateType._4,
    label: 'RegistrationScheduleRound3',
    value: EmailTemplateType._4
  },
  {
    key: EmailTemplateType._5,
    label: 'RegistrationScoreRound1',
    value: EmailTemplateType._5
  },
  {
    key: EmailTemplateType._6,
    label: 'RegistrationScoreRound2',
    value: EmailTemplateType._6
  },
  {
    key: EmailTemplateType._7,
    label: 'RegistrationScoreRound3',
    value: EmailTemplateType._7
  },
];