/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SuppliesKindModel } from "../models/SuppliesKindModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param name
 * @param suppliesGroupId
 * @param suppliesCategoryId
 * @param isActive
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getSuppliesKind = (
  name?: string,
  suppliesGroupId?: string,
  suppliesCategoryId?: string,
  isActive?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesKind`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Name: name,
      SuppliesGroupId: suppliesGroupId,
      SuppliesCategoryId: suppliesCategoryId,
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
export const putSuppliesKind = (
  tenant?: string,
  requestBody?: SuppliesKindModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/SuppliesKind`,
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
export const postSuppliesKind = (
  tenant?: string,
  requestBody?: SuppliesKindModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/SuppliesKind`,
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
export const deleteSuppliesKind = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/SuppliesKind`,
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
export const getSuppliesKindById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/SuppliesKind/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

