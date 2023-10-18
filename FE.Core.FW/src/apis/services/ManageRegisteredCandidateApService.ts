/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManageRegisteredCandidateAPModel } from "../models/ManageRegisteredCandidateAPModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param examPeriodId
 * @param examScheduleId
 * @param examId
 * @param idNumber
 * @param sbd
 * @param fullname
 * @param email
 * @param phone
 * @param pageIndex
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateAp = (
  examPeriodId?: string,
  examScheduleId?: string,
  examId?: string,
  idNumber?: string,
  sbd?: string,
  fullname?: string,
  email?: string,
  phone?: string,
  pageIndex?: number,
  pageSize?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateAP`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriodId: examPeriodId,
      examScheduleId: examScheduleId,
      examId: examId,
      idNumber: idNumber,
      sbd: sbd,
      fullname: fullname,
      email: email,
      phone: phone,
      pageIndex: pageIndex,
      pageSize: pageSize,
    },
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postManageRegisteredCandidateAp = (
  tenant?: string,
  requestBody?: ManageRegisteredCandidateAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageRegisteredCandidateAP`,
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
export const putManageRegisteredCandidateAp = (
  tenant?: string,
  requestBody?: ManageRegisteredCandidateAPModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageRegisteredCandidateAP`,
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
export const deleteManageRegisteredCandidateAp = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageRegisteredCandidateAP/${id}`,
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
export const getManageRegisteredCandidateApById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateAP/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};
/**
 * @param examPeriodId
 * @param examScheduleId
 * @param examId
 * @param idNumber
 * @param sbd
 * @param fullname
 * @param email
 * @param phone
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportExcel = (
  examPeriodId?: string,
  examScheduleId?: string,
  examId?: string,
  idNumber?: string,
  sbd?: string,
  fullname?: string,
  email?: string,
  phone?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateAP/ExportExcel`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriodId: examPeriodId,
      examScheduleId: examScheduleId,
      examId: examId,
      idNumber: idNumber,
      sbd: sbd,
      fullname: fullname,
      email: email,
      phone: phone,
    },
  });
};

