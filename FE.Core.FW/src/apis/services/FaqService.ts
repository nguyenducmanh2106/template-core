/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FaqModel } from "../models/FaqModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param keyword
 * @param examTypeId
 * @param isShow
 * @param includeShortAnswer
 * @param pageNumber
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getFaq = (
  keyword?: string,
  examTypeId?: string,
  isShow?: boolean,
  includeShortAnswer?: boolean,
  pageNumber?: number,
  pageSize?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Faq`,
    headers: {
      Tenant: tenant,
    },
    query: {
      Keyword: keyword,
      ExamTypeId: examTypeId,
      IsShow: isShow,
      IncludeShortAnswer: includeShortAnswer,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postFaq = (
  tenant?: string,
  requestBody?: FaqModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Faq`,
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
export const deleteFaq = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/Faq`,
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
export const getFaqById = (
  id: string,
  countView: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/Faq/${id}`,
    headers: {
      Tenant: tenant,
    },
    query: {
      countView
    }
  });
};

/**
 * @param id
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putFaq = (
  id: string,
  tenant?: string,
  requestBody?: FaqModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/Faq/${id}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param isShow
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const updateShowHide = (
  isShow: boolean = false,
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/Faq/UpdateShowHide`,
    headers: {
      Tenant: tenant,
    },
    query: {
      isShow: isShow,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

