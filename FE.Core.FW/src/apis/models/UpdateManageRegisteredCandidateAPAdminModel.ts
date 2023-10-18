/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExamInfoModel } from "./ExamInfoModel";

export type UpdateManageRegisteredCandidateAPAdminModel = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
  birthday?: string | null;
  typeIDCard?: string | null;
  idCardNumber?: string | null;
  sex?: string | null;
  sbd?: string | null;
  school?: string | null;
  email?: string | null;
  class?: string | null;
  examName?: string | null;
  examPeriodName?: string | null;
  examInfo?: Array<ExamInfoModel> | null;
  createdOnDate?: string | null;
  price?: string | null;
  isChangeUserInfo?: boolean;
};

