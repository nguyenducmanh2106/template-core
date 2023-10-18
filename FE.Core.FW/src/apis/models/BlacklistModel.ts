/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */import type { DecisionBlacklistModel } from "./DecisionBlacklistModel";

export type BlacklistModel = {
  id?: string;
  fullName?: string | null;
  sex?: string | null;
  dateOfBirth?: string;
  idNumberCard?: string | null;
  typeIdCard?: number;
  target?: number;
  examId?: string;
  isAutoFill?: boolean;
  decisionBlackList?: DecisionBlacklistModel;
};


export type BlacklistShowModel = {
  id?: string;
  fullName?: string | null;
  sex?: string | null;
  dateOfBirth?: string;
  idNumberCard?: string | null;
  typeIdCard?: number;
  target?: number;
  examId?: string;
  isAutoFill?: boolean;
  decisionBlackLists?: Array<DecisionBlacklistModel>;
};

