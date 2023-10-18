/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaymentITRequest = {
  id: string,
  candidateId: string,
  amount: string,
  currencyCode: string,
  vietnameseName: string,
  dob: Date,
  examSubject: string,
  examSubjectDetail: string,
  examDate: Date,
  userEmail: string,
  phoneNumber: string,
  isSendMailPaymentConfirm: boolean,
  type: number,
  dateCreateRecord: Date,
}

export type PaymentResponse = {
  id: string,
  amount: number,
  bankCode?: string,
  bankTranNo?: string,
  cardType?: string,
  payDate?: Date,
  transactionNo?: string,
  result: boolean,
  rawResponse: string,
  dateCreateRecord: Date
}

export type PaymentITDetail = {
  paymentRequest: PaymentITRequest,
  paymentStatus?: number
};

export type PaymentITSearchModel = {
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
