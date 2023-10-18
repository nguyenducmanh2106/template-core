/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { UserReceiveEmailTestModel } from "../models/UserReceiveEmailTestModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getUserReceiveEmailTests = (
  name?: string,
  status?: number,
  pageIndex: number = 1,
  pageSize: number = 10,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/UserReceiveEmailTest`,
    headers: {
      Tenant: tenant,
    },
    query: {
      name: name,
      status: status,
      pageIndex: pageIndex,
      pageSize: pageSize,
    },
  });
};

/**
 * @param name
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getAllUserReceiveEmailTests = (
  name?: string,
  status?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/UserReceiveEmailTest/GetAll`,
    headers: {
      Tenant: tenant,
    },
    query: {
      name: name,
      status: status,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postUserReceiveEmailTest = (
  tenant?: string,
  requestBody?: UserReceiveEmailTestModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/UserReceiveEmailTest`,
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
export const getUserReceiveEmailTest = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/UserReceiveEmailTest/${id}`,
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
export const putUserReceiveEmailTest = (
  id: string,
  tenant?: string,
  requestBody?: UserReceiveEmailTestModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/UserReceiveEmailTest/${id}`,
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
export const deleteUserReceiveEmailTest = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/UserReceiveEmailTest/${id}`,
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
export const deleteUserReceiveEmailTest1 = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/UserReceiveEmailTest/DeleteMany`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

