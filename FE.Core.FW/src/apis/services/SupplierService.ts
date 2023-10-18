/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SupplierModel } from "../models/SupplierModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param code
 * @param name
 * @param isActive
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getSupplier = (
  code?: string,
  name?: string,
  isActive?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Supplier`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Code: code,
      Name: name,
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
export const putSupplier = (
  tenant?: string,
  requestBody?: SupplierModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Supplier`,
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
export const postSupplier = (
  tenant?: string,
  requestBody?: SupplierModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Supplier`,
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
export const deleteSupplier = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Supplier`,
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
export const getSupplierById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Supplier/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

