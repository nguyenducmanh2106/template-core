/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamCalendarModel } from "../models/ExamCalendarModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param areaId
 * @param headerQuarter
 * @param exam
 * @param dateReceive
 * @param dateAccept
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamCalendar = (
  areaId?: string,
  headerQuarter?: string,
  exam?: string,
  dateReceive?: string,
  dateAccept?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamCalendar`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      headerQuarter: headerQuarter,
      exam: exam,
      dateReceive: dateReceive,
      dateAccept: dateAccept,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putExamCalendar = (
  tenant?: string,
  requestBody?: ExamCalendarModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamCalendar`,
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
export const postExamCalendar = (
  tenant?: string,
  requestBody?: ExamCalendarModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamCalendar`,
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
export const getExamCalendarById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamCalendar/${id}`,
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
export const deleteExamCalendar = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamCalendar/${id}`,
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
export const deleteManyExamCalendar = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamCalendar/DeleteMany`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};