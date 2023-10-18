/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { TimeReciveApplicationModel } from "../models/TimeReciveApplicationModel";
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
export const getTimeReciveApplication = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TimeReciveApplication`,
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
export const putTimeReciveApplication = (
  tenant?: string,
  requestBody?: TimeReciveApplicationModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/TimeReciveApplication`,
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
export const postTimeReciveApplication = (
  tenant?: string,
  requestBody?: TimeReciveApplicationModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TimeReciveApplication`,
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
export const deleteTimeReciveApplication = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TimeReciveApplication/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};