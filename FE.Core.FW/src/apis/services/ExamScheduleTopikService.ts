/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamScheduleTopikModel } from "../models/ExamScheduleTopikModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param examId
 * @param isCong
 * @param status
 * @param examPeriodId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamScheduleTopik = (
  examId?: string,
  isCong?: boolean,
  status?: number,
  examPeriodId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamScheduleTopik`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examId: examId,
      isCong: isCong,
      status: status,
      examPeriodId: examPeriodId,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putExamScheduleTopik = (
  tenant?: string,
  requestBody?: ExamScheduleTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamScheduleTopik`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postExamScheduleTopik = (
  tenant?: string,
  requestBody?: ExamScheduleTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamScheduleTopik`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamScheduleTopik1 = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamScheduleTopik/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteExamScheduleTopik = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamScheduleTopik/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteExamScheduleTopik1 = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamScheduleTopik/DeleteMany`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};