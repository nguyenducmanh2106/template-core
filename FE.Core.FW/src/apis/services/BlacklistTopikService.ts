/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlacklistTopikModel } from "../models/BlacklistTopikModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param fullName
 * @param dateOfBirth
 * @param identityCard
 * @param citizenIdentityCard
 * @param passport
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getBlacklistTopik = (
  fullName?: string,
  dateOfBirth?: string,
  identityNo?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/BlacklistTopik`,
    headers: {
      Tenant: tenant,
    },
    query: {
      FullName: fullName,
      DateOfBirth: dateOfBirth,
      IdentityNo: identityNo,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postBlacklistTopik = (
  tenant?: string,
  requestBody?: BlacklistTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/BlacklistTopik`,
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
export const deleteBlacklistTopik = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/BlacklistTopik`,
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
export const getBlacklistTopikById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/BlacklistTopik/${id}`,
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
export const putBlacklistTopik = (
  id: string,
  tenant?: string,
  requestBody?: BlacklistTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/BlacklistTopik/${id}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postBlacklistTopikImport = (
  tenant?: string,
  formData?: {
    formFile: Blob
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/BlacklistTopik/ImportList`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

export const getDownloadImportTemplate = (): CancelablePromise<Blob> => {
  return __request({
    method: "GET",
    path: `/BlacklistTopik/DownloadImportTemplate`
  });
}
