/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailRequest } from "../models/EmailRequest";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postEmail = (
  tenant?: string,
  requestBody?: EmailRequest
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Email/SendOneEmail`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

export const usePostEmailService = (
  options: UseRequestOption
): {
  run: (tenant?: string, requestBody?: EmailRequest) => void;
  data: ResponseData;
  loading: boolean;
  error?: Error;
  params?: any;
} => {
  return useRequest(postEmail, options);
};

