/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SuppliesGroupModel } from "../models/SuppliesGroupModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param isActive
 * @param code
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getSuppliesGroup = (
  name?: string,
  isActive?: boolean,
  code?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesGroup`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      IsActive: isActive,
      Code: code,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putSuppliesGroup = (
  tenant?: string,
  requestBody?: SuppliesGroupModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/SuppliesGroup`,
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
export const postSuppliesGroup = (
  tenant?: string,
  requestBody?: SuppliesGroupModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/SuppliesGroup`,
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
export const deleteSuppliesGroup = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/SuppliesGroup`,
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
export const getSuppliesGroupById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesGroup/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

