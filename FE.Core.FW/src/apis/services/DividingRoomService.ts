/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResponseData } from "../models/ResponseData";
import type { SelectionCriterialModel } from "../models/SelectionCriterialModel";
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
export const postDividingRoom = (
  tenant?: string,
  requestBody?: SelectionCriterialModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DividingRoom/DivideExamRoom`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postDividingRoom1 = (
  pageIndex: number = 1,
  pageSize: number = 10,
  tenant?: string,
  requestBody?: SelectionCriterialModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DividingRoom/ManagementPlaceDividedExamRoom`,
    headers: {
      Tenant: tenant,
    },
    query: {
      pageIndex: pageIndex,
      pageSize: pageSize,
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
export const deleteDividingRoom = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/DividingRoom/DeleteManagementPlaceDividedExamRoom/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param typeOrdering
 * @param examScheduleTopikId
 * @param examAreaId
 * @param examPlaceId
 * @param isSendMail
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDividingRoom = (
  typeOrdering?: number,
  examScheduleTopikId?: string,
  examAreaId?: string,
  examPlaceId?: string,
  isSendMail?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/CheckExamScheduleTopik`,
    headers: {
      Tenant: tenant,
    },
    query: {
      TypeOrdering: typeOrdering,
      ExamScheduleTopikId: examScheduleTopikId,
      ExamAreaId: examAreaId,
      ExamPlaceId: examPlaceId,
      IsSendMail: isSendMail,
    },
  });
};

/**
 * @param dividingExamPlaceId
 * @param examPlaceId
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDividingRoom1 = (
  dividingExamPlaceId?: string,
  examPlaceId?: string,
  pageIndex: number = 1,
  pageSize: number = 10,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ManagementDividedExamRoom`,
    headers: {
      Tenant: tenant,
    },
    query: {
      dividingExamPlaceId: dividingExamPlaceId,
      examPlaceId: examPlaceId,
      pageIndex: pageIndex,
      pageSize: pageSize,
    },
  });
};

/**
 * @param dividingExamPlaceId
 * @param examRoomId
 * @param candidateName
 * @param candidatePhone
 * @param candidateEmail
 * @param pageNumber
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDividingRoom2 = (
  dividingExamPlaceId?: string,
  examRoomId?: string,
  candidateName: string = "",
  candidatePhone: string = "",
  candidateEmail: string = "",
  pageNumber: number = 1,
  pageSize: number = 10,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ManagementDividedCandidate`,
    headers: {
      Tenant: tenant,
    },
    query: {
      dividingExamPlaceId: dividingExamPlaceId,
      examRoomId: examRoomId,
      candidateName: candidateName,
      candidatePhone: candidatePhone,
      candidateEmail: candidateEmail,
      pageNumber: pageNumber,
      pageSize: pageSize,
    },
  });
};

/**
 * @param dividingExamPlaceId
 * @param examRoomId
 * @param candidateName
 * @param candidatePhone
 * @param candidateEmail
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDividingRoom3 = (
  dividingExamPlaceId?: string,
  examRoomId?: string,
  candidateName: string = "",
  candidatePhone: string = "",
  candidateEmail: string = "",
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ExportExcelManagementDividedCandidate`,
    headers: {
      Tenant: tenant,
    },
    query: {
      dividingExamPlaceId: dividingExamPlaceId,
      examRoomId: examRoomId,
      candidateName: candidateName,
      candidatePhone: candidatePhone,
      candidateEmail: candidateEmail,
    },
  });
};

/**
 * @param dividingExamPlaceId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putDividingRoom = (
  dividingExamPlaceId: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/DividingRoom/SendMailCandidates/${dividingExamPlaceId}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param examRoomDividedId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putDividingRoom1 = (
  examRoomDividedId: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/DividingRoom/SendMailCandidate/${examRoomDividedId}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * Hàm gửi mail test số báo danh
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const sendMailTestCandidates = (
  tenant?: string,
  examRoomDividedId?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DividingRoom/SendMailTestCandidates/${examRoomDividedId}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};