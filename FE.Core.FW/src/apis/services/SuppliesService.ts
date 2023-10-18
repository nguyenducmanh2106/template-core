/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SuppliesModel } from "../models/SuppliesModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param code
 * @param suppliesGroupId
 * @param suppliesKindId
 * @param expiryDate
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getSupplies = (
  code?: string,
  suppliesGroupId?: string,
  suppliesKindId?: string,
  expiryDate?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Supplies`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Code: code,
      SuppliesGroupId: suppliesGroupId,
      SuppliesKindId: suppliesKindId,
      ExpiryDate: expiryDate,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putSupplies = (
  tenant?: string,
  requestBody?: SuppliesModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Supplies`,
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
export const postSupplies = (
  tenant?: string,
  requestBody?: SuppliesModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Supplies`,
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
export const deleteSupplies = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Supplies`,
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
export const getSuppliesById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Supplies/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

