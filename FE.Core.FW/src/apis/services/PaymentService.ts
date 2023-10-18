/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentModel, PaymentSearchModel } from "../models/PaymentModel";
import type { ResponseData } from "../models/ResponseData";
import type { ResponseToVnpay } from "../models/ResponseToVnpay";
import type { CancelablePromise } from "../core/CancelablePromise";
import {
  request as __request,
  useRequest,
  UseRequestOption,
} from "../core/request";

/**
 * @param requestBody
 * @returns ResponseData Success
 * @throws ApiError
 */
export const postPayment = (
  requestBody?: PaymentModel
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/api/Payment/CreatePaymentUrl`,
    body: requestBody,
    mediaType: "application/json",
  });
};

/**
 * @returns ResponseToVnpay Success
 * @throws ApiError
 */
export const getPayment = (): CancelablePromise<ResponseToVnpay> => {
  return __request({
    method: "GET",
    path: `/api/getResponseVnpay`,
  });
};

export const searchPayment = (model: Partial<PaymentSearchModel>): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/Payment/PaymentHistory`,
    query: model
  });
}

export const getPaymentDetail = (paymentRequestId: string): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/Payment/GetPaymentRequestDetail`,
    query: { paymentRequestId }
  });
}

export const exportPaymentHistory = (model: Partial<PaymentSearchModel>): CancelablePromise<Blob> => {
  return __request({
    method: "GET",
    path: `/api/Payment/ExportPaymentHistory`,
    query: model,
  });
}
