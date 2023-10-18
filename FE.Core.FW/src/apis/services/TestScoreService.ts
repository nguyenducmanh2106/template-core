/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { TestScoreModel} from "../models/TestScoreModel";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getTestScore = (
  filter?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TestScore?filter=${filter}`,
  });
};

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putTestScore = (
  requestBody?: TestScoreModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/TestScore`,
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postTestScore = (
  requestBody?: TestScoreModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TestScore`,
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param id
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getTestScore1 = (id: string): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/TestScore/${id}`,
  });
};

/**
 * @param id
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteTestScore = (
  id: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TestScore/${id}`,
  });
};

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteManyTestScore = (
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/TestScore/DeleteMany`,
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const importTestScore = (
  requestBody?: FormData
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TestScore/Import`,
    body: requestBody,
  });
};

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const importCheckTestScore = (
  requestBody?: FormData
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/TestScore/CheckCode`,
    body: requestBody,
  });
};
