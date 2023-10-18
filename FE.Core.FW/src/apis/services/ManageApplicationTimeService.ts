/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManageApplicationTimeModel } from "../models/ManageApplicationTimeModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param headerQuarterId
 * @param from
 * @param to
 * @param isCong
 * @param pageNumber
 * @param pageSize
 * @param isFullData
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageApplicationTime = (
  headerQuarterId?: string,
  from?: string,
  to?: string,
  isCong: boolean = false,
  pageNumber: number = 1,
  pageSize: number = 10,
  isFullData: boolean = false,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageApplicationTime`,
    headers: {
      Tenant: tenant,
    },
    query: {
      headerQuarterId: headerQuarterId,
      from: from,
      to: to,
      isCong: isCong,
      pageNumber: pageNumber,
      pageSize: pageSize,
      isFullData: isFullData,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putManageApplicationTime = (
  tenant?: string,
  requestBody?: ManageApplicationTimeModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageApplicationTime`,
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
export const postManageApplicationTime = (
  tenant?: string,
  requestBody?: ManageApplicationTimeModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageApplicationTime`,
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
export const getManageApplicationTime1 = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageApplicationTime/${id}`,
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
export const deleteManageApplicationTime = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageApplicationTime/${id}`,
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
export const deleteManyManageApplicationTime = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageApplicationTime/DeleteMany`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};
