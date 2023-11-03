/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SalesPlaningCommisionModel = {
  id?: string;
  salesPlaningId?: string;
  productId?: string;
  productName?: string | null;
  pricingCategoryId?: string | null;
  pricingCategoryName?: string | null;
  comRate?: number;
  staffId?: string | null;
  staffFullname?: string | null;
  staffComRate?: number;
  staffCompareComRate?: number;
  totalCom?: number;
  staffRevenueRate?: number;
  totalRevenue?: number;
  createdByUserId?: string;
  lastModifiedByUserId?: string;
  lastModifiedOnDate?: string;
  createdOnDate?: string;
};

