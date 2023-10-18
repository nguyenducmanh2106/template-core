/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentApModel, PaymentApSearchModel } from "../models/PaymentApModel";
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
export const postPaymentAp = (
  tenant?: string,
  requestBody?: PaymentApModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/api/PaymentAp/CreatePaymentUrl`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param candicateName
 * @param phoneNumber
 * @param status
 * @param fromDate
 * @param toDate
 * @param transactionNo
 * @param examPeriodId
 * @param userEmail
 * @param pageNumber
 * @param pageSize
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const searchPayment = (model: Partial<PaymentApSearchModel>): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/PaymentAp/PaymentHistory`,
    query: model
  });
};

/**
 * @param candicateName
 * @param phoneNumber
 * @param status
 * @param fromDate
 * @param toDate
 * @param transactionNo
 * @param examPeriodId
 * @param userEmail
 * @param pageNumber
 * @param pageSize
 * @param tenant
 * @returns any Success
 * @throws ApiError
 */
export const exportPaymentHistory = (model: Partial<PaymentApSearchModel>): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/api/PaymentAp/ExportPaymentHistory`,
    query: model
  });
};

/**
 * @param tenant
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postPaymentApSendEmail = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/api/PaymentAp/SendMailIndividual`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @param paymentRequestId
 * @param tenant
 * @returns ResponseData Success
 * @throws ApiError
 */
export const getPaymentApDetail = (
  paymentRequestId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/PaymentAp/GetPaymentRequestDetail`,
    headers: {
      Tenant: tenant,
    },
    query: {
      paymentRequestId: paymentRequestId,
    },
  });
};

