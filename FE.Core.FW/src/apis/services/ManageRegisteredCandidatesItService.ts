/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamTestInfoModel } from "../models/ExamTestInfoModel";
import type { InputManageRegisteredCandidateITModel } from "../models/InputManageRegisteredCandidateITModel";
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
export const postManageRegisteredCandidatesIt = (
  tenant?: string,
  requestBody?: InputManageRegisteredCandidateITModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageRegisteredCandidatesIT`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param areaId
 * @param headerQuaterId
 * @param examId
 * @param fullName
 * @param idNumber
 * @param studentCode
 * @param pageSize
 * @param pageIndex
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesIt = (
  areaId?: string,
  headerQuaterId?: string,
  examId?: string,
  fullName?: string,
  idNumber?: string,
  studentCode?: string,
  pageSize?: number,
  pageIndex?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      headerQuaterId: headerQuaterId,
      examId: examId,
      fullName: fullName,
      idNumber: idNumber,
      studentCode: studentCode,
      pageSize: pageSize,
      pageIndex: pageIndex,
    },
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putManageRegisteredCandidatesIt = (
  tenant?: string,
  formData?: {
    Id?: string;
    ExamName?: string;
    ExamPurpose?: string;
    ScoreGoal?: number;
    IsTested?: boolean;
    IsChangeUserInfo?: boolean;
    TestDate?: string;
    Price?: number;
    ExamTestInfo?: Array<ExamTestInfoModel>;
    "UserInfoITModel.Id"?: string;
    "UserInfoITModel.CandidateRegisterId"?: string;
    "UserInfoITModel.FullName"?: string;
    "UserInfoITModel.FullNameOrigin"?: string;
    "UserInfoITModel.UserName"?: string;
    "UserInfoITModel.Phone"?: string;
    "UserInfoITModel.Birthday"?: string;
    "UserInfoITModel.Sex"?: string;
    "UserInfoITModel.TypeIdCard"?: string;
    "UserInfoITModel.IDNumber"?: string;
    "UserInfoITModel.Job"?: string;
    "UserInfoITModel.DateOfCCCD"?: string;
    "UserInfoITModel.PlaceOfCCCD"?: string;
    "UserInfoITModel.Email"?: string;
    "UserInfoITModel.ContactAddressCityId"?: string;
    "UserInfoITModel.ContactAddressDistrictId"?: string;
    "UserInfoITModel.ContactAddressWardId"?: string;
    "UserInfoITModel.ContactAddress"?: string;
    "UserInfoITModel.Language"?: string;
    "UserInfoITModel.IDCardFront"?: string;
    "UserInfoITModel.IDCardFrontFile"?: Blob;
    "UserInfoITModel.IDCardBack"?: string;
    "UserInfoITModel.IDCardBackFile"?: Blob;
    "UserInfoITModel.BirthCertificate"?: string;
    "UserInfoITModel.BirthCertificateFile"?: Blob;
    "UserInfoITModel.SchoolCertificate"?: string;
    "UserInfoITModel.SchoolCertificateFile"?: Blob;
    "UserInfoITModel.Image3x4"?: string;
    "UserInfoITModel.Image3x4File"?: Blob;
    "UserInfoITModel.WorkAddressDistrictId"?: string;
    "UserInfoITModel.WorkAddressWardsId"?: string;
    "UserInfoITModel.WorkAddressCityId"?: string;
    "UserInfoITModel.WorkAddress"?: string;
    "UserInfoITModel.OldCardIDNumber"?: string;
    "UserInfoITModel.OldCardID"?: boolean;
    "UserInfoITModel.IsStudent"?: boolean;
    "UserInfoITModel.AllowUsePersonalData"?: boolean;
    "UserInfoITModel.StudentCode"?: string;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageRegisteredCandidatesIT`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesItById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param examId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesIt1 = (
  examId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT/CheckContinute`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examId: examId,
    },
  });
};

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesIt2 = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT/GetHistoryRegister`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param language
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesIt3 = (
  id?: string,
  language?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT/GetPdfTicket`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
      language: language,
    },
  });
};

/**
 * @param areaId
 * @param examCode
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidatesIt4 = (
  areaId?: string,
  examCode?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidatesIT/GetDataExamSubjectByExamCode`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      examCode: examCode,
    },
  });
};