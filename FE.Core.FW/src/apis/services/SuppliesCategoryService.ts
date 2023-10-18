/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SuppliesCategoryModel } from "../models/SuppliesCategoryModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param suppliesSerialStatus
 * @param isActive
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getSuppliesCategory = (
  name?: string,
  suppliesSerialStatus?: number,
  isActive?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesCategory`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      SuppliesSerialStatus: suppliesSerialStatus,
      IsActive: isActive,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putSuppliesCategory = (
  tenant?: string,
  requestBody?: SuppliesCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/SuppliesCategory`,
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
export const postSuppliesCategory = (
  tenant?: string,
  requestBody?: SuppliesCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/SuppliesCategory`,
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
export const deleteSuppliesCategory = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/SuppliesCategory`,
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
export const getSuppliesCategoryById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesCategory/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

