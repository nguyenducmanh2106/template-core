/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { UserManageStockUpdateModel } from "../models/UserManageStockUpdateModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param stockId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getUserManageStock = (
  stockId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/UserManageStock`,
    headers: {
      Tenant: tenant,
    },
    query: {
      stockId: stockId,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postUserManageStock = (
  tenant?: string,
  requestBody?: UserManageStockUpdateModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/UserManageStock`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param approveType
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getListStockUserManage = (
  approveType?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/UserManageStock/ListStockUserManage`,
    headers: {
      Tenant: tenant,
    },
    query: {
      approveType: approveType,
    },
  });
};

