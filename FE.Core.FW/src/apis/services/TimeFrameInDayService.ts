/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { TimeFrameInDayModel } from "../models/TimeFrameInDayModel";
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
export const getTimeFrameInDay = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TimeFrameInDay`,
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
export const putTimeFrameInDay = (
  tenant?: string,
  requestBody?: TimeFrameInDayModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/TimeFrameInDay`,
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
export const postTimeFrameInDay = (
  tenant?: string,
  requestBody?: TimeFrameInDayModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TimeFrameInDay`,
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
export const getTimeFrameInDay1 = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TimeFrameInDay/${id}`,
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
export const deleteTimeFrameInDay = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TimeFrameInDay/${id}`,
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
export const deleteManyTimeFrameInDay = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TimeFrameInDay/DeleteMany`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};