/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExamInfoModel } from "./ExamInfoModel";
import type { ExamScheduleTopikModel } from "./ExamScheduleTopikModel";
import type { UserInfoModel } from "./UserInfoModel";

export type ManageRegisteredCandidateTopikModel = {
  id?: string;
  userId?: string;
  userProfileId?: string;
  examPurpose?: string | null;
  areaTest?: string;
  areaTestName?: string | null;
  placeTest?: string;
  placeTestName?: string | null;
  placeTestAddress?: string | null;
  isTestTOPIK?: boolean;
  examId?: string;
  testScheduleId?: string;
  testSchedule?: ExamScheduleTopikModel;
  knowWhere?: string | null;
  isPaid?: number | null;
  price?: number;
  userInfo?: UserInfoModel;
  examInfo?: ExamInfoModel;
  dateRegister?: string;
  dateRegisterString?: string | null;
  transactionNo?: string | null;
  payDate?: string | null;
  examRoomId?: string | null;
  examRoomName?: string | null;
  candidateNumber?: string | null;
  isChangeUserInfo?: boolean;
};

