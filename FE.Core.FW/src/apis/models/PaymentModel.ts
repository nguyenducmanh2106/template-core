/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaymentModel = {
  candidateTopikId?: string | null;
  amount?: number;
  returnUrl?: string | null;
  userName?: string | null;
  profileCode?: string | null;
  koreanName?: string | null;
  vietnameseName?: string | null;
  dob?: string | null;
  examName?: string | null;
  examAreaName?: string | null;
  examLocation?: string | null;
  examAddress?: string | null;
  examDate?: string | null;
  userEmail?: string | null;
  phoneNumber?: string | null;
  examWorkShift?: string | null;
};

export type PaymentSearchModel = {
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

export type PaymentDetail = {
  paymentRequest: PaymentRequest,
  paymentResponse: PaymentResponse[],
  paymentStatus?: number
};

export type PaymentRequest = {
  id: string,
  txnRef: string,
  amount: string,
  currencyCode: string,
  ipAddress: string,
  createDate: string,
  expireDate: string,
  userName: string | null,
  profileCode: string,
  koreanName: string,
  vietnameseName: string,
  dob: string,
  examName: string,
  examAreaName: string,
  examLocation: string,
  examAddress: string,
  examDate: string,
  userEmail: string,
  phoneNumber: string
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
