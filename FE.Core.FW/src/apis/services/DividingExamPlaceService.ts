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
import { DividingExamPlaceModel } from "../models/DividingExamPlaceModel";
import { ExamRoomDividedModel } from "../models/ExamRoomDividedModel";

/**
 * Hàm lấy về danh sách quản lý địa điểm thi đã được chia
 * @param ExamScheduleTopikId 
 * @param ExamAreaId 
 * @param ExamPlaceId 
 * @returns 
 */
export const getQueryList = (
  ExamPeriodId?: string,
  ExamScheduleTopikId?: string,
  ExamAreaId?: string,
  ExamPlaceId?: string,
  IsSendMail?: number,
  pageIndex?: number,
  pageSize?: number,
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DividingRoom/ManagementPlaceDividedExamRoom?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    body: {
      ExamPeriodId,
      ExamScheduleTopikId,
      ExamAreaId,
      ExamPlaceId,
      IsSendMail
    },
  });
};

/**
 * Hàm lấy về danh sách phòng thi theo địa điểm thi
 * @param dividingExamPlaceId 
 * @param examPlaceId 
 * @returns 
 */
export const getQueryExamRooms = (
  dividingExamPlaceId?: string,
  examPlaceId?: string,
  pageIndex?: number,
  pageSize?: number,
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ManagementDividedExamRoom?dividingExamPlaceId=${dividingExamPlaceId}&examPlaceId=${examPlaceId}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
  });
};

/**
 * Hàm lấy về danh sách phòng thi theo địa điểm thi
 * @param dividingExamPlaceId 
 * @param examPlaceId 
 * @param current 
 * @param pageSize 
 * @returns 
 */
export const getQueryDividedCandidates = (
  dividingExamPlaceId?: string,
  examRoomId?: string,
  candidateName?: string,
  candidatePhone?: string,
  candidateEmail?: string,
  current?: number,
  pageSize?: number
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ManagementDividedCandidate?dividingExamPlaceId=${dividingExamPlaceId}&examRoomId=${examRoomId}&candidateName=${candidateName}&candidatePhone=${candidatePhone}&candidateEmail=${candidateEmail}&pageNumber=${current}&pageSize=${pageSize}`,
  });
};

/**
 * Thực hiện tạo số báo danh và phòng thi cho thí sinh
 * @param objBody 
 * @returns 
 */
export const generateCandidateNumber = (
  objBody: {
    TypeOrdering: number,
    ExamScheduleTopikId?: string,
    ExamAreaId?: string,
    ExamPlaceId?: string,
  }
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/DividingRoom/DivideExamRoom`,
    body: objBody
  });
};

/**
 * Hàm lấy về danh sách quản lý địa điểm thi đã được chia
 * @param ExamScheduleTopikId 
 * @param ExamAreaId 
 * @param ExamPlaceId 
 * @returns 
 */
export const checkExamScheduleTopik = (
  ExamPlaceId?: string,
): CancelablePromise<ResponseData<DividingExamPlaceModel[]>> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/CheckExamScheduleTopik`,
    query: {
      ExamPlaceId,
    },
  });
};

/**
 * @param id
 * @returns ResponseData Success
 * @throws ApiError
 */
export const deleteDividingRoom = (
  id: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "DELETE",
    path: `/DividingRoom/DeleteManagementPlaceDividedExamRoom/${id}`,
  });
};

/**
 * Xuất danh sách thí sinh
 * @param dividingExamPlaceId 
 * @param examRoomId 
 * @param candidateName 
 * @param candidatePhone 
 * @param candidateEmail 
 * @returns 
 */
export const exportExcelManagementDividedCandidate = (
  dividingExamPlaceId?: string,
  examRoomId?: string,
  candidateName?: string,
  candidatePhone?: string,
  candidateEmail?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ExportExcelManagementDividedCandidate?dividingExamPlaceId=${dividingExamPlaceId}&examRoomId=${examRoomId}&candidateName=${candidateName}&candidatePhone=${candidatePhone}&candidateEmail=${candidateEmail}`,
  });
};

/**
 * Xuất danh sách thí sinh
 * @param dividingExamPlaceId 
 * @param examRoomId 
 * @param candidateName 
 * @param candidatePhone 
 * @param candidateEmail 
 * @returns 
 */
export const exportExcelManagementDividedCandidateByExamPlace = (
  dividingExamPlaceId?: string,
  examPlaceId?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/ExportExcelManagementDividedCandidateByExamPlace?dividingExamPlaceId=${dividingExamPlaceId}&examPlaceId=${examPlaceId}`,
  });
};

/**
 * Gửi email thông báo SBD và phòng thi cho cả địa điểm thi
 * @param dividingExamPlaceId 
 * @returns 
 */
export const sendMailCandidates = (
  dividingExamPlaceId?: string,
): CancelablePromise<ResponseData<boolean>> => {
  return __request({
    method: "PUT",
    path: `/DividingRoom/SendMailCandidates/${dividingExamPlaceId}`,
  });
};

/**
 * Gửi email thông báo SBD và phòng thi cho 1 thí sinh
 * @param examRoomDividedId 
 * @returns 
 */
export const sendMailCandidate = (
  examRoomDividedId?: string,
): CancelablePromise<ResponseData<boolean>> => {
  return __request({
    method: "PUT",
    path: `/DividingRoom/SendMailCandidate/${examRoomDividedId}`,
  });
};


/**
 * @param id
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const updateCandidateNumberAndMoveCandidateRoom = (
  id: string,
  tenant?: string,
  requestBody?: ExamRoomDividedModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "PUT",
    path: `/DividingRoom/UpdateCandidateNumberAndMoveCandidateRoom/${id}`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * Hàm lấy về danh sách quản lý địa điểm thi đã được chia
 * @param ExamScheduleTopikId 
 * @param ExamAreaId 
 * @param ExamPlaceId 
 * @returns 
 */
export const checkSlotRoom = (
  dividingExamPlaceId?: string,
): CancelablePromise<ResponseData<DividingExamPlaceModel[]>> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/CheckSlotRoom/${dividingExamPlaceId}`,
  });
};


/**
 * Hàm lấy tìm kiếm thí sinh
 * @param candidateName 
 * @param candidatePhone 
 * @param candidateEmail 
 * @param current 
 * @param pageSize 
 * @returns 
 */
export const searchCandidates = (
  ExamPeriodId?: string,
  ExamScheduleTopikId?: string,
  candidateName?: string,
  candidatePhone?: string,
  candidateEmail?: string,
  current?: number,
  pageSize?: number
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/DividingRoom/SearchCandidate?ExamPeriodId=${ExamPeriodId}&ExamScheduleTopikId=${ExamScheduleTopikId}&candidateName=${candidateName}&candidatePhone=${candidatePhone}&candidateEmail=${candidateEmail}&pageNumber=${current}&pageSize=${pageSize}`,
  });
};