/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaymentApModel = {
  candidateId?: string | null;
  returnUrl?: string | null;
  vietnameseName?: string | null;
  dob?: string;
  examSubject?: string | null;
  examDate?: string;
  userEmail?: string | null;
  phoneNumber?: string | null;
  useEnglishLanguage?: boolean;
};

export type PaymentApRequest = {
  id: string,
  txnRef: string,
  amount: string,
  currencyCode: string,
  ipAddress: string,
  createDate: string,
  expireDate: string,
  userName: string | null,
  vietnameseName: string,
  dob: Date,
  examSubject: string,
  examDate: Date,
  userEmail: string,
  phoneNumber: string,
  dateCreateRecord: Date
}

export type PaymentResponse = {
  id: string,
  responseCode: string,
  responseCodeDescription: string,
  bankCode: string,
  bankTranNo: string,
  cardType: string,
  payDate: string,
  transactionNo: string,
  transactionStatus: string,
  transactionStatusDescription: string,
  responseToVnp: string,
  responseToVnpDescription: string
}

export type PaymentApDetail = {
  paymentRequest: PaymentApRequest,
  paymentResponse: PaymentResponse[],
  paymentStatus?: number
};

export type PaymentApSearchModel = {
  candicateName: string | undefined;
  phoneNumber: string | undefined;
  status: string | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;
  transactionNo: string | undefined;
  pageNumber: number;
  pageSize: number;
  examPeriodId: string | undefined;
  userEmail: string | undefined;
};
