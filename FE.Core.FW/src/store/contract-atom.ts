import { ContractModel } from './../apis/models/ContractModel';
import { atom, selector } from 'recoil';


export const initialContractValue: ContractModel = {}

//#region hợp đồng
export const contractState = atom({
  key: 'contractState',
  default: initialContractValue,
});
//#endregion



