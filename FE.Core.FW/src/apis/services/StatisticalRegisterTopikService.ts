/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticalRegisterTopikModel } from "../models/StatisticalRegisterTopikModel";
import type { RegisteredCandidateTopikModel } from "../models/RegisteredCandidateTopikModel";
import type { ResponseData } from "../models/ResponseData";
import type { SlotRegister } from "../models/SlotRegister";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
} from "../core/request";

/**
 * @param areaId
 * @param placeTest
 * @param examScheduleId
 * @param status
 * @returns ResponseData Success
 * @throws ApiErrors
 */
export const getStatisticalRegisterTopik = (
  areaId?: string,
  placeTest?: string,
  examScheduleId?: string,
  status?: number,
  examPeriodId?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/statistical`,
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examScheduleId: examScheduleId,
      status: status,
      examPeriodId: examPeriodId
    },
  });
};

/**
 * @param areaId
 * @param placeTest
 * @param examScheduleId
 * @param status
 * @returns ResponseData Success
 * @throws ApiErrors
 */
export const exportStatisticalRegisterTopik = (
  areaId?: string,
  placeTest?: string,
  examScheduleId?: string,
  status?: number,
  examPeriodId?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/export-statistical`,
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examScheduleId: examScheduleId,
      status: status,
      examPeriodId: examPeriodId
    },
  });
};