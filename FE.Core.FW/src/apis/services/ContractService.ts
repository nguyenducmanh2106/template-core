/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContractModel } from "../models/ContractModel";
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
export const postContract = (
  tenant?: string,
  requestBody?: ContractModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Contract`,
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
export const getContract = (
  filter: string = "{}",
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Contract`,
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
export const deleteContract = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Contract/id`,
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
export const getContract1 = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Contract/id`,
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
export const putContract = (
  id?: string,
  tenant?: string,
  requestBody?: ContractModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Contract/id`,
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

export const usePostContractService = (
  options: UseRequestOption
): {
  run: (tenant?: string, requestBody?: ContractModel) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(postContract, options);
};

export const useGetContractService = (
  options: UseRequestOption
): {
  run: (filter: string, tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(getContract, options);
};

export const useDeleteContractService = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(deleteContract, options);
};

export const useGetContractService1 = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(getContract1, options);
};

export const usePutContractService = (
  options: UseRequestOption
): {
  run: (id?: string, tenant?: string, requestBody?: ContractModel) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(putContract, options);
};

