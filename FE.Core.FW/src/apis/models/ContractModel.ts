/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContractFileModel } from "./ContractFileModel";
import type { ContractProductModel } from "./ContractProductModel";
import type { CustomerModel } from "./CustomerModel";
import type { DocumentCommandModel } from "./DocumentCommandModel";
import { SalesPlaningModel } from "./SalesPlaningModel";

export type ContractModel = {
  salesPlaning?: SalesPlaningModel;
  id?: string;
  contractNumber?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  ownerId?: string | null;
  provinceId?: string | null;
  provinceName?: string | null;
  districtId?: string | null;
  districtName?: string | null;
  contractTypeId?: string | null;
  contractTypeName?: string | null;
  departmentName?: string | null;
  contractValue?: number;
  startDate?: string | null;
  endDate?: string | null;
  files?: Array<Blob> | null;
  contractFiles?: Array<ContractFileModel> | null;
  uploadUser?: string | null;
  uploadDate?: string;
  contractProducts?: Array<ContractProductModel> | null;
  createdByUserId?: string;
  lastModifiedByUserId?: string;
  lastModifiedOnDate?: string;
  createdOnDate?: string;
  description?: string | null;
  linkFile_Vz?: string | null;
  nameFile_Vz?: string | null;
  documentId?: string | null;
  departmentId?: string | null;
  commands?: Array<DocumentCommandModel> | null;
  state?: string | null;
  stateName?: string | null;
  parentId?: string | null;
  fileFormPath?: string | null;
  fileFormName?: string | null;
  isShowApprove?: boolean;
  customer?: CustomerModel;
  signProcessDocumentId?: string | null;
  implementationCost?: number;
  isSignInternal?: boolean | null;
  workFlowPerson?: string | null;
  persionApprove?: string | null;
  isCompleted?: boolean | null;
  salePlanningId?: string | null;
  workflowUrl?: string | null;
};

