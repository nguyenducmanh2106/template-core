/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerModel } from "../models/CustomerModel";
import type { ResponseData } from "../models/ResponseData";
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
export const getCustomer = (
  code?: string,
  name?: string,
  isActive?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Customer`,
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
export const putCustomer = (
  tenant?: string,
  requestBody?: CustomerModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Customer`,
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
export const postCustomer = (
  tenant?: string,
  requestBody?: CustomerModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Customer`,
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
export const deleteCustomer = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Customer`,
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
export const getCustomerById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Customer/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

