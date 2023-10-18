/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResonBlacklistModel } from "../models/ResonBlacklistModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getResonBlacklist = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ResonBlacklist`,
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
export const putResonBlacklist = (
  tenant?: string,
  requestBody?: ResonBlacklistModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ResonBlacklist`,
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
export const postResonBlacklist = (
  tenant?: string,
  requestBody?: ResonBlacklistModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ResonBlacklist`,
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
export const deleteResonBlacklist = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ResonBlacklist/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};