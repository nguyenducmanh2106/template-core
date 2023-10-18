/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import {
    request as __request
} from "../core/request";
import type { PaymentITSearchModel } from "../models/PaymentITModel";
import type { ResponseData } from "../models/ResponseData";

export const searchPayment = (model: Partial<PaymentITSearchModel>): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/PaymentIT/PaymentHistory`,
    query: model
  });
};

export const exportPaymentHistory = (model: Partial<PaymentITSearchModel>): CancelablePromise<any> => {
  return __request({
    method: "GET",
    path: `/api/PaymentIT/ExportPaymentHistory`,
    query: model
  });
};

export const postPaymentSendEmail = (
  tenant?: string,
  requestBody?: Array<string>
): CancelablePromise<ResponseData> => {
  return __request({
    method: "POST",
    path: `/api/PaymentIT/SendMailIndividual`,
    headers: {
      Tenant: tenant,
    },
    body: requestBody,
    mediaType: "application/json",
  });
};

export const getPaymentITDetail = (
  paymentRequestId?: string,
  tenant?: string
): CancelablePromise<ResponseData> => {
  return __request({
    method: "GET",
    path: `/api/PaymentIT/GetPaymentRequestDetail`,
    headers: {
      Tenant: tenant,
    },
    query: {
      paymentRequestId: paymentRequestId,
    },
  });
};
