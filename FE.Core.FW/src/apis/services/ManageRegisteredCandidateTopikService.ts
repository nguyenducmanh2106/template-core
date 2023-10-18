/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManageRegisteredCandidateTopikModel } from "../models/ManageRegisteredCandidateTopikModel";
import type { RegisteredCandidateTopikModel } from "../models/RegisteredCandidateTopikModel";
import type { ResponseData } from "../models/ResponseData";
import type { SlotRegister } from "../models/SlotRegister";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param areaId
 * @param placeTest
 * @param examVersion
 * @param exam
 * @param fullname
 * @param cccd
 * @param dateReceive
 * @param pageIndex
 * @param pageSize
 * @param username
 * @param sbd
 * @param examPeriod
 * @param blacklist
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik = (
  areaId?: string,
  placeTest?: string,
  examVersion?: string,
  exam?: string,
  fullname?: string,
  cccd?: string,
  dateReceive?: string,
  pageIndex?: number,
  pageSize?: number,
  username?: string,
  sbd?: string,
  examPeriod?: string,
  blacklist?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examVersion: examVersion,
      exam: exam,
      fullname: fullname,
      cccd: cccd,
      dateReceive: dateReceive,
      pageIndex: pageIndex,
      pageSize: pageSize,
      username: username,
      sbd: sbd,
      examPeriod: examPeriod,
      blacklist: blacklist,
    },
  });
};

/**
 * @param tenant
 * @param formData
 * @returns ResponseData Success
 * @throws ApiError
 */
export const putManageRegisteredCandidateTopik = (
  tenant?: string,
  formData?: {
    Id?: string;
    UserId?: string;
    UserProfileId?: string;
    ExamPurpose?: string;
    AreaTest?: string;
    AreaTestName?: string;
    PlaceTest?: string;
    PlaceTestName?: string;
    PlaceTestAddress?: string;
    IsTestTOPIK?: boolean;
    ExamId?: string;
    TestScheduleId?: string;
    "TestSchedule.Id"?: string;
    "TestSchedule.ExaminationName"?: string;
    "TestSchedule.ExamDate"?: string;
    "TestSchedule.ExamDateString"?: string;
    "TestSchedule.ExamTime"?: string;
    "TestSchedule.ExamId"?: string;
    "TestSchedule.ExamWorkShiftId"?: string;
    "TestSchedule.StartRegister"?: string;
    "TestSchedule.EndRegister"?: string;
    "TestSchedule.Note"?: string;
    "TestSchedule.Status"?: number;
    "TestSchedule.Public"?: boolean;
    "TestSchedule.EnglishName"?: string;
    "TestSchedule.KoreaName"?: string;
    "TestSchedule.ExamPeriodId"?: string;
    "TestSchedule.NoteTimeEnterExamRoom"?: string;
    KnowWhere?: string;
    IsPaid?: number;
    Price?: number;
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
    DateRegister?: string;
    DateRegisterString?: string;
    TransactionNo?: string;
    PayDate?: string;
    ExamRoomId?: string;
    ExamRoomName?: string;
    CandidateNumber?: string;
    IsChangeUserInfo?: boolean;
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/ManageRegisteredCandidateTopik`,
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
export const postManageRegisteredCandidateTopik = (
  tenant?: string,
  requestBody?: RegisteredCandidateTopikModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/ManageRegisteredCandidateTopik`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik1 = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/b2cUser`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param areaId
 * @param placeTest
 * @param examScheduleId
 * @param status
 * @param examPeriodId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik2 = (
  areaId?: string,
  placeTest?: string,
  examScheduleId?: string,
  status?: number,
  examPeriodId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/statistical`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examScheduleId: examScheduleId,
      status: status,
      examPeriodId: examPeriodId,
    },
  });
};

/**
 * @param areaId
 * @param placeTest
 * @param examScheduleId
 * @param status
 * @param examPeriodId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik3 = (
  areaId?: string,
  placeTest?: string,
  examScheduleId?: string,
  status?: number,
  examPeriodId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/export-statistical`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examScheduleId: examScheduleId,
      status: status,
      examPeriodId: examPeriodId,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopikById = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/${id}`,
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
export const deleteManageRegisteredCandidateTopik = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageRegisteredCandidateTopik/${id}`,
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
export const deleteManageRegisteredCandidateTopik1 = (
  tenant?: string,
  requestBody?: SlotRegister
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/ManageRegisteredCandidateTopik/DeleteSlot`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param areaId
 * @param examTopikId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik4 = (
  areaId: string,
  examTopikId: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/GetHeaderQuater/${areaId}/${examTopikId}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param placeId
 * @param examTopikId
 * @param userId
 * @param fullName
 * @param dob
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik5 = (
  placeId: string,
  examTopikId: string,
  userId: string,
  fullName: string,
  dob: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/CheckSlot/${placeId}/${examTopikId}/${userId}/${fullName}/${dob}`,
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
export const getInfoAfterPaid = (
  id: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/GetInfoAfterPaid/${id}`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param testScheduleId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportDataTestSchedule = (
  testScheduleId: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportDataTestSchedule/${testScheduleId}`,
    headers: {
      Tenant: tenant,
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
 * @param sbdSearch
 * @param examPeriod
 * @param blacklist
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportExcelRegisteredCandidateTopik = (
  areaId?: string,
  placeTest?: string,
  examVersion?: string,
  exam?: string,
  fullname?: string,
  cccd?: string,
  dateReceive?: string,
  username?: string,
  sbdSearch?: string,
  examPeriod?: string,
  blacklist?: boolean,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportExcel`,
    headers: {
      Tenant: tenant,
    },
    query: {
      areaId: areaId,
      placeTest: placeTest,
      examVersion: examVersion,
      exam: exam,
      fullname: fullname,
      cccd: cccd,
      dateReceive: dateReceive,
      username: username,
      sbdSearch: sbdSearch,
      examPeriod: examPeriod,
      blacklist: blacklist,
    },
  });
};

/**
 * @param filePath
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik10 = (
  filePath?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/DeleteFile`,
    headers: {
      Tenant: tenant,
    },
    query: {
      filePath: filePath,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getDataTicket = (
  id?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/GetDataTicket`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param id
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const exportPdfTicket = (
  id?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportPdfTicket`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
    },
  });
};

/**
 * @param id
 * @param headQuarterId
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const exportDataTestScheduleByHeadQuarter = (
  id?: string,
  headQuarterId?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportDataTestScheduleByHeadQuarter`,
    headers: {
      Tenant: tenant,
    },
    query: {
      id: id,
      headQuarterId: headQuarterId,
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
export const getManageRegisteredCandidateTopik14 = (
  id?: string,
  language?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/GetPdfTicket`,
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
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik15 = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/CheckResgisted`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param testScheduleId
 * @param type
 * @param accessToken
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const checkFileCanDown = (
  testScheduleId?: string,
  type?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/CheckFileCanDown`,
    headers: {
      Tenant: tenant,
    },
    query: {
      testScheduleId: testScheduleId,
      type: type,
    },
  });
};

/**
 * @param examPeriodId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getAllImageCandidate = (
  examPeriodId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/GetAllImageCandidate`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriodId: examPeriodId,
    },
  });
};

/**
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getManageRegisteredCandidateTopik18 = (
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/UpdateInfoCandidate`,
    headers: {
      Tenant: tenant,
    },
  });
};

/**
 * @param testScheduleId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportImageByHeadquarter = (
  testScheduleId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportImageByHeadquarter`,
    headers: {
      Tenant: tenant,
    },
    query: {
      testScheduleId: testScheduleId,
    },
  });
};

/**
 * @param testScheduleId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportImageAvatarByTestSchedule = (
  testScheduleId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportImageAvatarByTestSchedule`,
    headers: {
      Tenant: tenant,
    },
    query: {
      testScheduleId: testScheduleId,
    },
  });
};
/**
 * @param examPeriod
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const exportExcelTotalCandidate = (
  examPeriod?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportExcelTotalCandidate`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriod: examPeriod,
    },
  });
};


/**
 * @param examPeriod
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const exportExcellSatisticExamPeriod = (
  examPeriod?: string,
  tenant?: string
): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/ExportExcellSatisticExamPeriod`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriod: examPeriod,
    },
  });
};

/**
 * @param examPeriod
 * @param type
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const checkFileSatisticCanDown = (
  examPeriod?: string,
  type?: number,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/ManageRegisteredCandidateTopik/CheckFileSatisticCanDown`,
    headers: {
      Tenant: tenant,
    },
    query: {
      examPeriod: examPeriod,
      type: type,
    },
  });
};

