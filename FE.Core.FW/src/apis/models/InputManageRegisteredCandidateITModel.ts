/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExamSubjectDataModel } from "./ExamSubjectDataModel";

export type InputManageRegisteredCandidateITModel = {
  id?: string;
  userProfileId?: string;
  examPurpose?: string | null;
  scoreGoal?: number;
  isTested?: boolean;
  testDate?: string | null;
  areaId?: string;
  examId?: string;
  examRegistedData?: Array<ExamSubjectDataModel> | null;
  statusPaid?: number;
  userId?: string;
  price?: number;
};

