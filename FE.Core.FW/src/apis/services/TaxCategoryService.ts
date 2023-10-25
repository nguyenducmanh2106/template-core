/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { TaxCategoryModel } from "../models/TaxCategoryModel";
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
export const postTaxCategory = (
  tenant?: string,
  requestBody?: TaxCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TaxCategory`,
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
export const getTaxCategory = (
  filter: string = "{}",
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TaxCategory`,
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
export const deleteTaxCategory = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TaxCategory/id`,
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
export const getTaxCategory1 = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TaxCategory/id`,
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
export const putTaxCategory = (
  id?: string,
  tenant?: string,
  requestBody?: TaxCategoryModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/TaxCategory/id`,
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

export const usePostTaxCategoryService = (
  options: UseRequestOption
): {
  run: (tenant?: string, requestBody?: TaxCategoryModel) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(postTaxCategory, options);
};

export const useGetTaxCategoryService = (
  options: UseRequestOption
): {
  run: (filter: string = "{}", tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(getTaxCategory, options);
};

export const useDeleteTaxCategoryService = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(deleteTaxCategory, options);
};

export const useGetTaxCategoryService = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(getTaxCategory1, options);
};

export const usePutTaxCategoryService = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string, requestBody?: TaxCategoryModel) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(putTaxCategory, options);
};

