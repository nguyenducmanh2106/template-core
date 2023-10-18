/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";
import { ApproveProposalModel } from "../models/data";
import { ImportStockProposalModel } from "../models/ImportStockProposalModel";
import type { ResponseData } from "../models/ResponseData";

/**
 * @param code
 * @param type
 * @param supplierId
 * @param stockId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getImportStockProposal = (
  code?: string,
  type?: number,
  supplierId?: string,
  stockId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ImportStockProposal`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Code: code,
      Type: type,
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
export const putImportStockProposal = (
  tenant?: string,
  formData?: ImportStockProposalModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ImportStockProposal`,
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
export const postImportStockProposal = (
  tenant?: string,
  formData?: ImportStockProposalModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ImportStockProposal`,
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
export const deleteImportStockProposal = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ImportStockProposal`,
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
export const getImportStockProposalDetail = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ImportStockProposal/Detail`,
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
    path: `/ImportStockProposal/SendForApproval`,
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
  requestBody?: ApproveProposalModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ImportStockProposal/Approve`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getListProposalCodeApproved = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ImportStockProposal/GetListProposalCodeApproved`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const getDownloadImportStockProposal = (
  id?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ImportStockProposal/DownloadProposal`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

