/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DecisionBlacklistModel = {
  id?: string;
  blacklistId?: string;
  decisionNumber?: string | null;
  decisionDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  formProcess?: number | null;
  examIdBan?: string | null;
  dateApprove?: string | null;
  isInclude?: boolean;
  typeOfDecision?: number;
  createdBy?: string | null;
  approveBy?: string | null;
  note?: string | null;
  status?: number | null;
  filePath?: string | null;
  createdOnDate?: string | null;
  fileFile?: Blob | null;
};

