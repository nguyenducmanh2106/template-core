/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";
import { UserModel } from "../models/UserModel";
import { TokenResponse } from "../models/TokenResponse";

/**
 * @param tenant
 * @returns boolean Success
 * @throws ApiError
 */
export const getAuth = (tenant?: string): CancelablePromise<boolean> => {
  return __request({
    method: "GET",
    path: `/Auth`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param code
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getToken = (
  code?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Auth/GetToken`,
    headers: {
      Tenant: tenant,
    },
    query: {
      code: code,
    },
  });
};
/**
 * @param tenant
 * @param requestBody
 * @returns TokenResponse Success
 * @throws ApiError
 */
export const postAuth = (
  tenant?: string,
  requestBody?: UserModel
): CancelablePromise<TokenResponse> => {
  return __request({
    method: "POST",
    path: `/Auth/whoiam`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};