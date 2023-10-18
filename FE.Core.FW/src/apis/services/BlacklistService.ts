/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlacklistModel } from "../models/BlacklistModel";
import type { DecisionBlacklistModel } from "../models/DecisionBlacklistModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param dob
 * @param cccd
 * @param isDeleted
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getBlacklist = (
  name?: string,
  dob?: string,
  cccd?: string,
  isDeleted?: boolean,
  pageIndex?: number,
  pageSize?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Blacklist`,
    headers: {
      Tenant: tenant,
    },
    query: {
      name: name,
      dob: dob,
      cccd: cccd,
      isDeleted: isDeleted,
      pageIndex: pageIndex,
      pageSize: pageSize,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putBlacklist = (
  tenant?: string,
  requestBody?: BlacklistModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Blacklist`,
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
export const postBlacklist = (
  tenant?: string,
  formData?: {
    Id?: string;
    FullName?: string;
    DateOfBirth?: string;
    IDNumberCard?: string;
    Sex?: string;
    TypeIdCard?: number;
    Target?: number;
    ExamId?: string;
    IsAutoFill?: boolean;
    BlacklistId?: string;
    DecisionNumber?: string;
    DecisionDate?: string;
    StartDate?: string;
    EndDate?: string;
    Reason?: string;
    FormProcess?: number;
    ExamIdBan?: string;
    DateApprove?: string;
    CreatedBy?: string;
    ApproveBy?: string;
    Note?: string;
    Status?: number;
    FilePath?: string;
    CreatedOnDate?: string;
    FileFile?: Blob;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Blacklist`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getBlacklistById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Blacklist/${id}`,
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
export const deleteBlacklist = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Blacklist/${id}`,
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
export const readDataFromFile = (
  tenant?: string,
  formData?: {
    formFile?: Blob;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Blacklist/ReadDataFromFile`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

