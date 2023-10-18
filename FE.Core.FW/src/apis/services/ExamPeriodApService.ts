/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamPeriodAPModel } from "../models/ExamPeriodAPModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param isOpen
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamPeriodAp = (
  name?: string,
  isOpen?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamPeriodAP`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      IsOpen: isOpen,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postExamPeriodAp = (
  tenant?: string,
  requestBody?: ExamPeriodAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamPeriodAP`,
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
export const deleteExamPeriodAp = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamPeriodAP`,
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
export const getExamPeriodApById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamPeriodAP/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putExamPeriodAp = (
  id: string,
  tenant?: string,
  requestBody?: ExamPeriodAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamPeriodAP/${id}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

