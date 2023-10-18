/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";
import { ApproveReceiptModel } from "../models/data";
import { ImportStockReceiptModel } from "../models/ImportStockReceiptModel";
import type { ResponseData } from "../models/ResponseData";

/**
 * @param importStockProposalCode
 * @param importMethod
 * @param supplierId
 * @param stockId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getImportStockReceipt = (
  importStockProposalCode?: string,
  importMethod?: number,
  supplierId?: string,
  stockId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ImportStockReceipt`,
    headers: {
      Tenant: tenant,
    },
    query: {
      ImportStockProposalCode: importStockProposalCode,
      ImportMethod: importMethod,
      SupplierId: supplierId,
      StockId: stockId,
    },
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putImportStockReceipt = (
  tenant?: string,
  formData?: ImportStockReceiptModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ImportStockReceipt`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postImportStockReceipt = (
  tenant?: string,
  formData?: ImportStockReceiptModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ImportStockReceipt`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteImportStockReceipt = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ImportStockReceipt`,
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
export const getImportStockReceiptDetail = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ImportStockReceipt/Detail`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postSendForApproval = (
  tenant?: string,
  requestBody?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ImportStockReceipt/SendForApproval`,
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
export const postApprove = (
  tenant?: string,
  requestBody?: ApproveReceiptModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ImportStockReceipt/Approve`,
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
 * @returns any Success
 * @throws ApiError
 */
export const getDownloadImportStockReceipt = (
  id?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ImportStockReceipt/DownloadReceipt`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

