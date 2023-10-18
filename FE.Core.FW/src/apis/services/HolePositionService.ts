/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HoldPositionModel } from "../models/HoldPositionModel";
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
export const getHolePosition = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/HolePosition`,
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
export const putHolePosition = (
  tenant?: string,
  requestBody?: HoldPositionModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/HolePosition`,
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
export const postHolePosition = (
  tenant?: string,
  requestBody?: HoldPositionModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/HolePosition`,
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
export const getGetByCalendarId = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/HolePosition/GetByCalendarId/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

