/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamFeeInformationModel } from "../models/ExamFeeInformationModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getExamFeeInformation = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamFeeInformation`,
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
export const putExamFeeInformation = (
  tenant?: string,
  requestBody?: ExamFeeInformationModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ExamFeeInformation`,
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
export const postExamFeeInformation = (
  tenant?: string,
  requestBody?: ExamFeeInformationModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ExamFeeInformation`,
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
export const getExamFeeInformation1 = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ExamFeeInformation/${id}`,
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
export const deleteExamFeeInformation = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ExamFeeInformation/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};