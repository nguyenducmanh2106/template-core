/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ImportStockReceiptModel = {
  id?: string;
  datePropose: string;
  importStockProposalCode?: string;
  stockId: string;
  supplierId: string;
  batchNote?: string;
  importMethod: number;
  fileImport?: Blob;
  note?: string;
};

