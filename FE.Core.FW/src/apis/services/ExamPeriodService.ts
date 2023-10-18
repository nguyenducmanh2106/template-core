/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamPeriodModel } from "../models/ExamPeriodModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param status
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamPeriod = (
  name?: string,
  status?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamPeriod`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      Status: status,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postExamPeriod = (
  tenant?: string,
  requestBody?: ExamPeriodModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamPeriod`,
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
export const deleteExamPeriod = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamPeriod`,
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
export const getExamPeriodById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamPeriod/${id}`,
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
export const putExamPeriod = (
  id: string,
  tenant?: string,
  requestBody?: ExamPeriodModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamPeriod/${id}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

