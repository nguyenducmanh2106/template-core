/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContractModel } from "./ContractModel";
import type { CustomerModel } from "./CustomerModel";
import type { SalesPlaningCommisionModel } from "./SalesPlaningCommisionModel";
import type { SalesPlaningProductModel } from "./SalesPlaningProductModel";

export type SalesPlaningModel = {
  id?: string;
  contractNumber?: string | null;
  contractName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  implementationDate?: string | null;
  contractValue?: number;
  customerId?: string | null;
  customer?: CustomerModel;
  provinceId?: string | null;
  provinceName?: string | null;
  districtId?: string | null;
  districtName?: string | null;
  customerType?: string | null;
  customerTypeName?: string | null;
  customerStatus?: number;
  customerCategory?: string | null;
  customerProperty?: number;
  isMOU?: boolean;
  contractId?: string | null;
  state?: number;
  cost?: number;
  costTaxRate?: number;
  totalCostTax?: number;
  implementationCost?: number;
  costDescription?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  username?: string | null;
  contractProperty?: number;
  salesPlaningProducts?: Array<SalesPlaningProductModel> | null;
  salesPlaningCommisions?: Array<SalesPlaningCommisionModel> | null;
  contract?: ContractModel;
};

