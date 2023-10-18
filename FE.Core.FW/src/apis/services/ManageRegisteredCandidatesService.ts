/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManageRegisteredCandidatesModel } from "../models/ManageRegisteredCandidatesModel";
import type { RegisteredCandidatesModel } from "../models/RegisteredCandidatesModel";
import type { ResponseData } from "../models/ResponseData";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param areaId
 * @param headerQuaterId
 * @param examId
 * @param status
 * @param statusPaid
 * @param dateAccept
 * @param dateReceive
 * @param submissionTimeId
 * @param codeProfile
 * @param fullName
 * @param cccd
 * @param pageSize
 * @param pageIndex
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidates = (
  areaId?: string,
  headerQuaterId?: string,
  examId?: string,
  status?: number,
  statusPaid?: number,
  dateAccept?: string,
  dateReceive?: string,
  submissionTimeId?: string,
  codeProfile?: string,
  fullName?: string,
  cccd?: string,
  pageSize?: number,
  pageIndex?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      headerQuaterId: headerQuaterId,
      examId: examId,
      status: status,
      statusPaid: statusPaid,
      dateAccept: dateAccept,
      dateReceive: dateReceive,
      submissionTimeId: submissionTimeId,
      codeProfile: codeProfile,
      fullName: fullName,
      cccd: cccd,
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
export const putManageRegisteredCandidates = (
  tenant?: string,
  formData?: {
    Id?: string;
    UserProfileId?: string;
    CodeProfile?: string;
    ExamPurpose?: string;
    "UserInfo.UserName"?: string;
    "UserInfo.FullName"?: string;
    "UserInfo.KoreanName"?: string;
    "UserInfo.FullNameKorea"?: string;
    "UserInfo.CCCD"?: string;
    "UserInfo.IDNumber"?: string;
    "UserInfo.TypeIdCard"?: string;
    "UserInfo.IsKorean"?: string;
    "UserInfo.Country"?: string;
    "UserInfo.DOB"?: string;
    "UserInfo.DOBString"?: string;
    "UserInfo.Sex"?: string;
    "UserInfo.CMND"?: string;
    "UserInfo.Passport"?: string;
    "UserInfo.DateOfCCCD"?: string;
    "UserInfo.DateOfCCCDString"?: string;
    "UserInfo.PlaceOfCCCD"?: string;
    "UserInfo.OtherPapers"?: string;
    "UserInfo.SDT"?: string;
    "UserInfo.Email"?: string;
    "UserInfo.Job"?: string;
    "UserInfo.OptionJob"?: string;
    "UserInfo.IsHSSV"?: boolean;
    "UserInfo.WorkAddressCityId"?: string;
    "UserInfo.WorkAddressDistrictId"?: string;
    "UserInfo.WorkAddressWardsId"?: string;
    "UserInfo.WorkAddress"?: string;
    "UserInfo.ContactAddressCityId"?: string;
    "UserInfo.ContactAddressCityName"?: string;
    "UserInfo.ContactAddressDistrictId"?: string;
    "UserInfo.ContactAddressDistrictName"?: string;
    "UserInfo.ContactAddressWardsId"?: string;
    "UserInfo.ContactAddressWardsName"?: string;
    "UserInfo.ContactAddress"?: string;
    "UserInfo.FrontImgCCCD"?: string;
    "UserInfo.FrontImgCCCDFile"?: Blob;
    "UserInfo.BackImgCCCDFile"?: Blob;
    "UserInfo.BackImgCCCD"?: string;
    "UserInfo.IMG3X4File"?: Blob;
    "UserInfo.IMG3X4"?: string;
    "UserInfo.StudentCardImage"?: string;
    "UserInfo.StudentCardImageFile"?: Blob;
    "UserInfo.SchoolCertificate"?: string;
    "UserInfo.BirthCertificateFile"?: Blob;
    "UserInfo.BirthCertificate"?: string;
    "UserInfo.IsStudent"?: boolean;
    "UserInfo.IsDisabilities"?: boolean;
    "UserInfo.CountryCode"?: string;
    "UserInfo.LanguageCode"?: string;
    "UserInfo.LanguageName"?: string;
    ScoreGoal?: number;
    IsTested?: boolean;
    TestDate?: string;
    PlaceOfRegistration?: string;
    SubmissionTime?: string;
    ExamId?: string;
    ExamVersion?: string;
    TestScheduleDate?: string;
    ReturnResultDate?: string;
    PriorityObject?: string;
    AccompaniedService?: string;
    UserName?: string;
    Password?: string;
    Note?: string;
    ProfileNote?: string;
    ProfileIncludes?: string;
    Status?: number;
    AcceptBy?: string;
    StatusPaid?: number;
    DateAccept?: string;
    DateReceive?: string;
    "ExamInfo.ExamId"?: string;
    "ExamInfo.ExamName"?: string;
    "ExamInfo.DateApply"?: string;
    "ExamInfo.TimeApply"?: string;
    "ExamInfo.ExamShift"?: string;
    "ExamInfo.DateTest"?: string;
    "ExamInfo.ExamRoomId"?: string;
    "ExamInfo.TimeTest"?: string;
    "ExamInfo.SBD"?: string;
    "ExamInfo.Price"?: number;
    "ExamInfo.RegistrationCode"?: string;
    Fee?: number;
    DateApply?: string;
    TimeApply?: string;
    IsChangeUserInfo?: boolean;
    CanTest?: boolean;
    ExamScheduleId?: string;
    Receipt?: number;
    FullNameReceipt?: string;
    PhoneReceipt?: string;
    AddReceipt?: string;
    CreatedOnDate?: string;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageRegisteredCandidates`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postManageRegisteredCandidates = (
  tenant?: string,
  requestBody?: RegisteredCandidatesModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageRegisteredCandidates`,
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
export const getManageRegisteredCandidatesById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/${id}`,
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
export const deleteManageRegisteredCandidates = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageRegisteredCandidates/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param id
 * @param approve
 * @param note
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const approveData = (
  id?: string,
  approve?: boolean,
  note?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageRegisteredCandidates/Approve`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
      approve: approve,
      note: note,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const reNewApprove = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageRegisteredCandidates/ReNewApprove`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param fullName
 * @param birthDay
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getHistoryByName = (
  fullName?: string,
  birthDay?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/GetHistoryByName`,
    headers: {
      Tenant: tenant,
    },
    query: {
      fullName: fullName,
      birthDay: birthDay,
    },
  });
};

/**
 * @param areaId
 * @param placeTest
 * @param examVersion
 * @param exam
 * @param fullname
 * @param cccd
 * @param dateReceive
 * @param username
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportExcelRegisteredCandidate = (
  areaId?: string,
  placeTest?: string,
  exam?: string,
  paidStatus?: number,
  dateApply?: string,
  dateRecive?: string,
  timeApplication?: string,
  status?: number,
  codeProfile?: string,
  fullname?: string,
  cccd?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/ExportExcel`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      placeTest: placeTest,
      exam: exam,
      paidStatus: paidStatus,
      dateApply: dateApply,
      dateRecive: dateRecive,
      timeApplication: timeApplication,
      status: status,
      codeProfile: codeProfile,
      fullname: fullname,
      cccd: cccd,
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
export const getPdfTicket = (
  id?: string,
  language?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/GetPdfTicket`,
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
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const duplicate = (
  tenant?: string,
  formData?: {
    Id?: string;
    UserProfileId?: string;
    CodeProfile?: string;
    ExamPurpose?: string;
    "UserInfo.UserName"?: string;
    "UserInfo.FullName"?: string;
    "UserInfo.KoreanName"?: string;
    "UserInfo.FullNameKorea"?: string;
    "UserInfo.CCCD"?: string;
    "UserInfo.IsKorean"?: string;
    "UserInfo.Country"?: string;
    "UserInfo.DOB"?: string;
    "UserInfo.DOBString"?: string;
    "UserInfo.Sex"?: string;
    "UserInfo.CMND"?: string;
    "UserInfo.Passport"?: string;
    "UserInfo.DateOfCCCD"?: string;
    "UserInfo.DateOfCCCDString"?: string;
    "UserInfo.PlaceOfCCCD"?: string;
    "UserInfo.OtherPapers"?: string;
    "UserInfo.SDT"?: string;
    "UserInfo.Email"?: string;
    "UserInfo.Job"?: string;
    "UserInfo.OptionJob"?: string;
    "UserInfo.IsHSSV"?: boolean;
    "UserInfo.WorkAddressCityId"?: string;
    "UserInfo.WorkAddressDistrictId"?: string;
    "UserInfo.WorkAddressWardsId"?: string;
    "UserInfo.WorkAddress"?: string;
    "UserInfo.ContactAddressCityId"?: string;
    "UserInfo.ContactAddressCityName"?: string;
    "UserInfo.ContactAddressDistrictId"?: string;
    "UserInfo.ContactAddressDistrictName"?: string;
    "UserInfo.ContactAddressWardsId"?: string;
    "UserInfo.ContactAddressWardsName"?: string;
    "UserInfo.ContactAddress"?: string;
    "UserInfo.FrontImgCCCD"?: string;
    "UserInfo.FrontImgCCCDFile"?: Blob;
    "UserInfo.BackImgCCCDFile"?: Blob;
    "UserInfo.BackImgCCCD"?: string;
    "UserInfo.IMG3X4File"?: Blob;
    "UserInfo.IMG3X4"?: string;
    "UserInfo.StudentCardImage"?: string;
    "UserInfo.StudentCardImageFile"?: Blob;
    "UserInfo.SchoolCertificate"?: string;
    "UserInfo.BirthCertificateFile"?: Blob;
    "UserInfo.BirthCertificate"?: string;
    "UserInfo.IsStudent"?: boolean;
    "UserInfo.IsDisabilities"?: boolean;
    "UserInfo.CountryEnglishName"?: string;
    "UserInfo.LanguageEnglishName"?: string;
    "UserInfo.LanguageName"?: string;
    ScoreGoal?: number;
    IsTested?: boolean;
    TestDate?: string;
    PlaceOfRegistration?: string;
    SubmissionTime?: string;
    ExamId?: string;
    ExamVersion?: string;
    TestScheduleDate?: string;
    ReturnResultDate?: string;
    PriorityObject?: string;
    AccompaniedService?: string;
    UserName?: string;
    Password?: string;
    Note?: string;
    ProfileNote?: string;
    ProfileIncludes?: string;
    Status?: number;
    AcceptBy?: string;
    StatusPaid?: number;
    DateAccept?: string;
    DateReceive?: string;
    "ExamInfo.ExamId"?: string;
    "ExamInfo.ExamName"?: string;
    "ExamInfo.DateApply"?: string;
    "ExamInfo.TimeApply"?: string;
    "ExamInfo.ExamShift"?: string;
    "ExamInfo.DateTest"?: string;
    "ExamInfo.ExamRoomId"?: string;
    "ExamInfo.TimeTest"?: string;
    "ExamInfo.SBD"?: string;
    "ExamInfo.Price"?: number;
    "ExamInfo.RegistrationCode"?: string;
    ExamFee?: Array<object>;
    Fee?: number;
    DateApply?: string;
    TimeApply?: string;
    IsChangeUserInfo?: boolean;
    CanTest?: boolean;
    ExamScheduleId?: string;
    Receipt?: number;
    FullNameReceipt?: string;
    PhoneReceipt?: string;
    AddReceipt?: string;
    CreatedOnDate?: string;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageRegisteredCandidates/Duplicate`,
    headers: {
      Tenant: tenant,
    },
    formData: formData,
    mediaType: "multipart/form-data",
  });
};

export const Statistic = (
  dateFrom: string,
  dateTo: string,
  type: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/Statistic`,
    headers: {
      Tenant: tenant,
    },
    query: {
      dateFrom: dateFrom,
      dateTo: dateTo,
      type: type
    },
  });
};

export const StatisticDetail = (
  dateFrom: string,
  dateTo: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidates/StatisticDetail`,
    headers: {
      Tenant: tenant,
    },
    query: {
      dateFrom: dateFrom,
      dateTo: dateTo
    },
  });
};
