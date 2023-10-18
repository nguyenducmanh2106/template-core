import { getStatisticalRegisterTopik } from '../services/StatisticalRegisterTopikService';
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StatisticalRegisterTopikModel = {
  id?: string;
  areaId?: string;
  areaName?: string;
  headQuaterId?: string;
  headQuaterName?: string;
  examinationName?: string;
  totalQuantity?: number;
  maxQuantity?: number;
  status?: number;
};

export type getStatisticalRegisterTopikSearch = {
  areaTest?: string;
  placeTest?: string;
  examScheduleId?: string;
  status?: number;
  examPeriodId?: string;
}