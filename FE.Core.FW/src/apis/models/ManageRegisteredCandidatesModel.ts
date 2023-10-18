/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExamFeeInformationModel } from "./ExamFeeInformationModel";
import type { ExamInfoModel } from "./ExamInfoModel";
import type { UserInfoModel } from "./UserInfoModel";

export type ManageRegisteredCandidatesModel = {
  id?: string;
  userProfileId?: string;
  codeProfile?: string | null;
  examPurpose?: string | null;
  userInfo?: UserInfoModel;
  scoreGoal?: number;
  isTested?: boolean;
  testDate?: string | null;
  placeOfRegistration?: string;
  submissionTime?: string;
  examId?: string;
  examVersion?: string | null;
  testScheduleDate?: string | null;
  returnResultDate?: string | null;
  priorityObject?: string | null;
  accompaniedService?: string | null;
  userName?: string | null;
  password?: string | null;
  note?: string | null;
  profileNote?: string | null;
  profileIncludes?: string | null;
  status?: number | null;
  acceptBy?: string | null;
  statusPaid?: number | null;
  dateAccept?: string | null;
  dateReceive?: string | null;
  examInfo?: ExamInfoModel;
  examFee?: Array<ExamFeeInformationModel> | null;
  fee?: number;
  statusWarning?: number;
  dateApply?: string | null;
  timeApply?: string | null;
  isChangeUserInfo?: boolean;
  canTest?: boolean | null;
  examScheduleId?: string | null;
  receipt?: number | null;
  fullNameReceipt?: string | null;
  phoneReceipt?: string | null;
  addReceipt?: string | null;
  createdOnDate?: string | null;
};

