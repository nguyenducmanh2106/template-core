import { SalesPlaningProductModel } from '@/apis/models/SalesPlaningProductModel';
import { ContractModel } from './../apis/models/ContractModel';
import { atom, selector } from 'recoil';
import { SelectOptionModel } from '@/@types/data';


export const initialContractValue: ContractModel = {}
export const initialSalePlanningProduct: SalesPlaningProductModel[] = []
export const initialProductSelectedValue: SelectOptionModel[] = []

//#region hợp đồng
export const contractState = atom({
  key: 'contractState',
  default: initialContractValue,
});
//#endregion

//#region sản phẩm trong kế hoạch bán hàng
export const salePlanningProductState = atom({
  key: 'salePlanningProductState',
  default: initialSalePlanningProduct,
});
//#endregion

//#region sản phẩm dùng để chọn trong tab Chia Com và doanh thu
export const productSelectedState = atom({
  key: 'productSelectedState',
  default: initialProductSelectedValue,
});
//#endregion



