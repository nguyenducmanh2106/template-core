/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TimeFrameInDayModel = {
  id?: string;
  sysTimeFrameId?: string;
  maxRegistry?: number;
  timeStart?: string | null;
  timeEnd?: string | null;
  isShow?: boolean;
};

export type TimeFrameInDayModelCustom = {
  id?: string;
  sysTimeFrameName?: string;
  maxRegistry?: number;
  timeStart?: string | null;
  timeEnd?: string | null;
  isShow?: boolean;
};