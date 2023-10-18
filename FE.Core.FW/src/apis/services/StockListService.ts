/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { StockListModel } from "../models/StockListModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param code
 * @param name
 * @param areaId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getStockList = (
  code?: string,
  name?: string,
  areaId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/StockList`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Code: code,
      Name: name,
      AreaId: areaId,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putStockList = (
  tenant?: string,
  requestBody?: StockListModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/StockList`,
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
export const postStockList = (
  tenant?: string,
  requestBody?: StockListModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/StockList`,
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
export const deleteStockList = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/StockList`,
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
export const getStockListById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/StockList/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};
