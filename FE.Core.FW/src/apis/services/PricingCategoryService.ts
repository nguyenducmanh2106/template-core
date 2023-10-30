/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PricingCategoryModel } from "../models/PricingCategoryModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postPricingCategory = (
  tenant?: string,
  requestBody?: PricingCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/PricingCategory`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param filter
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getPricingCategory = (
  filter: string = "{}",
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/PricingCategory`,
    headers: {
      Tenant: tenant,
    },
    query: {
      filter: filter,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deletePricingCategory = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/PricingCategory/id`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getPricingCategory1 = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/PricingCategory/id`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
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
export const putPricingCategory = (
  id?: string,
  tenant?: string,
  requestBody?: PricingCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/PricingCategory/id`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};
