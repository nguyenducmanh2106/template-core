/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DecisionBlacklistModel } from "../models/DecisionBlacklistModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDecisionBlacklist = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DecisionBlacklist/GetByBlacklistId/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putDecisionBlacklist = (
  tenant?: string,
  requestBody?: DecisionBlacklistModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/DecisionBlacklist`,
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
export const postDecisionBlacklist = (
  tenant?: string,
  requestBody?: DecisionBlacklistModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DecisionBlacklist`,
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
export const deleteDecisionBlacklist = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/DecisionBlacklist/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};
/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDecisionBlacklistById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DecisionBlacklist/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param approve
 * @param note
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const approveBlacklist = (
  id?: string,
  approve?: boolean,
  note?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DecisionBlacklist/Approve`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
      approve: approve,
      note: note,
    },
  });
};

