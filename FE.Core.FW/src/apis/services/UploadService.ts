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

/**
 * @param tenant
 * @param formData
 * @returns any Success
 * @throws ApiError
 */
export const postUpload = (
  tenant?: string,
  formData?: {
    files?: Array<Blob>;
  }
): CancelablePromise<any> => {
  return __request({
    method: "POST",
    path: `/Upload/UploadFiles`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param url
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteUpload = (
  url?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Upload/DeleteFile`,
    headers: {
      Tenant: tenant,
    },
    query: {
      url: url,
    },
  });
};