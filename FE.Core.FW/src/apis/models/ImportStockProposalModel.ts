/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ImportStockProposalModel = {
  id?: string;
  type: number;
  supplierId: string;
  stockId: string;
  datePropose: Date;
  dateImportExpected: Date;
  fileImport?: Blob;
  note?: string;
}
