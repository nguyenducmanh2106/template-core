/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManagerCandidateInvalidTopikModel } from "../models/ManagerCandidateInvalidTopikModel";
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
export const getManagerCandidateInvalidTopik = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManagerCandidateInvalidTopik`,
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
export const postManagerCandidateInvalidTopik = (
  tenant?: string,
  requestBody?: ManagerCandidateInvalidTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManagerCandidateInvalidTopik`,
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
export const deleteManagerCandidateInvalidTopik = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManagerCandidateInvalidTopik/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const Import = (
  tenant?: string,
  formData?: {
    file?: Blob;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManagerCandidateInvalidTopik/Import`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};