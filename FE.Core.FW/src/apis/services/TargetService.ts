/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { TargetImportModel } from "../models/TargetImportModel";
import type { TargetModel } from "../models/TargetModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param filter
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getTarget = (
  filter: string = "{}",
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Target`,
    headers: {
      Tenant: tenant,
    },
    query: {
      filter: filter,
    },
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postTarget = (
  tenant?: string,
  formData?: {
    Type?: number;
    Year?: number;
    DepartmentId?: string;
    Username?: string;
    File?: Blob;
    UserNotification?: Array<string>;
    Description?: string;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Target/import`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};
/**
 * @param departmentId
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postTarget1 = (
  departmentId?: string,
  tenant?: string,
  requestBody?: Array<TargetModel>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Target/UpSertList`,
    headers: {
      Tenant: tenant,
    },
    query: {
      departmentId: departmentId,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param type
 * @param year
 * @param departmentId
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getTarget1 = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Target/PracticeTarget`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param targetId
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postTarget2 = (
  targetId?: string,
  tenant?: string,
  requestBody?: TargetModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Target/UpSertTargetMapping`,
    headers: {
      Tenant: tenant,
    },
    query: {
      targetId: targetId,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getTarget2 = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Target/Download-File-Import`,
    headers: {
      Tenant: tenant,
    },
  });
};
