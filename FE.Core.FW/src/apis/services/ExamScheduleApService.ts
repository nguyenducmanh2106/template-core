/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamScheduleAPModel } from "../models/ExamScheduleAPModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param examDate
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamScheduleAp = (
  name?: string,
  examDate?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamScheduleAP`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      ExamDate: examDate,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putExamScheduleAp = (
  tenant?: string,
  requestBody?: ExamScheduleAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamScheduleAP`,
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
export const postExamScheduleAp = (
  tenant?: string,
  requestBody?: ExamScheduleAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamScheduleAP`,
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
export const deleteExamScheduleAp = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamScheduleAP`,
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
export const getExamScheduleApById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamScheduleAP/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param examPeriodId
 * @param examScheduleId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamIdInPeriod = (
  examPeriodId?: string,
  examScheduleId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamIdInPeriod`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriodId: examPeriodId,
      examScheduleId: examScheduleId,
    },
  });
};

