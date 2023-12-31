import { EmailTemplateType } from '@/apis/models/toefl-challenge/EmailTemplateType';
import { CheckboxOptionType } from "antd";
import { lazy } from 'react';

//#region Dùng để phân quyền
export const PermissionAction = {
  View: 1,//0
  ViewDetail: 2,//1
  Add: 4,//2
  Edit: 8,//3
  Delete: 16,//4
  Import: 32,//5
  ImportDepartment: 64,//6
}

export const permissionOptions: CheckboxOptionType[] = [
  {
    "label": "Xem",
    "value": PermissionAction.View
  },
  {
    "label": "Xem chi tiết",
    "value": PermissionAction.ViewDetail
  },
  {
    "label": "Thêm",
    "value": PermissionAction.Add
  },
  {
    "label": "Sửa",
    "value": PermissionAction.Edit
  },
  {
    "label": "Xóa",
    "value": PermissionAction.Delete
  },
  {
    "label": "Import",
    "value": PermissionAction.Import
  },
  {
    "label": "Import mục tiêu phòng",
    "value": PermissionAction.ImportDepartment
  }
];
//#endregion

//#region Dùng để khai báo router sử dụng lazy(Phương án xử lý tạm thời)
export const layoutCode = {
  userManager: "userManager",
  user: "user",
  role: "role",
  permission: "permission",
  permissions: "permissions",
  tuieditor: "tuieditor",
  detail: "detail",
  complex: "complex",
  svg: "svg",
  component: "component",
  test: "test",
  form: "form",
  core: "core",
  basic: "basic",
  home: "home",
  resource: "resource",
  workplace: "workplace",
  navigations: "navigations",
  pages: "pages",
  catalog: "catalog",
  catalogBranch: "catalog-branch",
  catalogBranchCreate: "catalog-branch__create",
  catalogBranchEdit: "catalog-branch__edit",
  catalogDepartment: "catalog-department",
  catalogDepartmentCreate: "catalog-department__create",
  catalogDepartmentEdit: "catalog-department__edit",
  catalogProductCategory: "catalog-product-category",
  catalogProductCategoryCreate: "catalog-product-category__create",
  catalogProductCategoryEdit: "catalog-product-category__edit",
  catalogProductType: "catalog-product-type",
  catalogProductTypeCreate: "catalog-product-type__create",
  catalogProductTypeEdit: "catalog-product-type__edit",
  catalogProduct: "catalog-product",
  catalogProductCreate: "catalog-product__create",
  catalogProductEdit: "catalog-product__edit",
  catalogCustomerCategory: "catalog-customer-category",
  catalogCustomerCategoryCreate: "catalog-customer-category__create",
  catalogCustomerCategoryEdit: "catalog-customer-category__edit",
  catalogCustomerType: "catalog-customer-type",
  catalogCustomerTypeCreate: "catalog-customer-type__create",
  catalogCustomerTypeEdit: "catalog-customer-type__edit",
  catalogCustomer: "catalog-customer",
  catalogCustomerCreate: "catalog-customer__create",
  catalogCustomerEdit: "catalog-customer__edit",
  catalogContractType: "catalog-contract-type",
  catalogContractTypeCreate: "catalog-contract-type__create",
  catalogContractTypeEdit: "catalog-contract-type__edit",
  catalogPricingDecision: "catalog-pricing-decision",
  catalogPricingDecisionCreate: "catalog-pricing-decision__create",
  catalogPricingDecisionEdit: "catalog-pricing-decision__edit",
  catalogPricingCategory: "catalog-pricing-category",
  catalogPricingCategoryCreate: "catalog-pricing-category__create",
  catalogPricingCategoryEdit: "catalog-pricing-category__edit",
  bussinessIcom: "bussiness-icom",
  icomTarget: "icom-target",
  icomTargetNavigate: "icom-target-navigate",
  icomTargetPractice: "icom-target-practice",
  icomTargetDetail: "icom-target-detail",
  icomContract: "icom-contract",
  icomContractCreate: "icom-contract__create",
}
export const routeArrays = [
  {
    "Code": layoutCode.userManager,
    "ComponentPath": lazy(() => import('../pages/CoreManager/UserManager'))
  },
  {
    "Code": layoutCode.user,
    "ComponentPath": lazy(() => import('../pages/roles/user'))
  },
  {
    "Code": layoutCode.role,
    "ComponentPath": lazy(() => import('../pages/roles/list'))
  },
  {
    "Code": layoutCode.permission,
    "ComponentPath": lazy(() => import('../pages/roles/permission'))
  },
  {
    "Code": layoutCode.permissions,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.tuieditor,
    "ComponentPath": lazy(() => import('../pages/component/editor/TuiEditor'))
  },
  {
    "Code": layoutCode.detail,
    "ComponentPath": lazy(() => import('../pages/pagesample/detail/basic'))
  },
  {
    "Code": layoutCode.complex,
    "ComponentPath": lazy(() => import('../pages/pagesample/form/complex'))
  },
  {
    "Code": layoutCode.svg,
    "ComponentPath": lazy(() => import('../pages/component/icon/svg'))
  },
  {
    "Code": layoutCode.component,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.test,
    "ComponentPath": lazy(() => import('../pages/roles/test'))
  },
  {
    "Code": layoutCode.form,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.core,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.basic,
    "ComponentPath": lazy(() => import('../pages/pagesample/form/basic'))
  },
  {
    "Code": layoutCode.home,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.resource,
    "ComponentPath": lazy(() => import('../pages/CoreManager/ResourceManager'))
  },
  {
    "Code": layoutCode.workplace,
    "ComponentPath": lazy(() => import('../pages/Home'))
  },
  {
    "Code": layoutCode.navigations,
    "ComponentPath": lazy(() => import('../pages/CoreManager/NavigationManager'))
  },
  {
    "Code": layoutCode.pages,
    "ComponentPath": ""
  },
  //#region catalog
  {
    "Code": layoutCode.catalog,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.catalogBranch,
    "ComponentPath": lazy(() => import('../pages/catalog/branch'))
  },
  {
    "Code": layoutCode.catalogBranchCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/branch/create'))
  },
  {
    "Code": layoutCode.catalogBranchEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/branch/edit'))
  },
  {
    "Code": layoutCode.catalogDepartment,
    "ComponentPath": lazy(() => import('../pages/catalog/department'))
  },
  {
    "Code": layoutCode.catalogDepartmentCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/department/create'))
  },
  {
    "Code": layoutCode.catalogDepartmentEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/department/edit'))
  },
  {
    "Code": layoutCode.catalogProductCategory,
    "ComponentPath": lazy(() => import('../pages/catalog/product-category'))
  },
  {
    "Code": layoutCode.catalogProductCategoryCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/product-category/create'))
  },
  {
    "Code": layoutCode.catalogProductCategoryEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/product-category/edit'))
  },
  {
    "Code": layoutCode.catalogProductType,
    "ComponentPath": lazy(() => import('../pages/catalog/product-type'))
  },
  {
    "Code": layoutCode.catalogProductTypeCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/product-type/create'))
  },
  {
    "Code": layoutCode.catalogProductTypeEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/product-type/edit'))
  },
  {
    "Code": layoutCode.catalogProduct,
    "ComponentPath": lazy(() => import('../pages/catalog/product'))
  },
  {
    "Code": layoutCode.catalogProductCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/product/create'))
  },
  {
    "Code": layoutCode.catalogProductEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/product/edit'))
  },
  {
    "Code": layoutCode.catalogCustomerCategory,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-category'))
  },
  {
    "Code": layoutCode.catalogCustomerCategoryCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-category/create'))
  },
  {
    "Code": layoutCode.catalogCustomerCategoryEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-category/edit'))
  },
  {
    "Code": layoutCode.catalogCustomerType,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-type'))
  },
  {
    "Code": layoutCode.catalogCustomerTypeCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-type/create'))
  },
  {
    "Code": layoutCode.catalogCustomerTypeEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/customer-type/edit'))
  },
  {
    "Code": layoutCode.catalogCustomer,
    "ComponentPath": lazy(() => import('../pages/catalog/customer'))
  },
  {
    "Code": layoutCode.catalogCustomerCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/customer/create'))
  },
  {
    "Code": layoutCode.catalogCustomerEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/customer/edit'))
  },
  {
    "Code": layoutCode.catalogContractType,
    "ComponentPath": lazy(() => import('../pages/catalog/contract-type'))
  },
  {
    "Code": layoutCode.catalogContractTypeCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/contract-type/create'))
  },
  {
    "Code": layoutCode.catalogContractTypeEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/contract-type/edit'))
  },
  {
    "Code": layoutCode.catalogPricingDecision,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-decision'))
  },
  {
    "Code": layoutCode.catalogPricingDecisionCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-decision/create'))
  },
  {
    "Code": layoutCode.catalogPricingDecisionEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-decision/edit'))
  },
  {
    "Code": layoutCode.catalogPricingCategory,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-category'))
  },
  {
    "Code": layoutCode.catalogPricingCategoryCreate,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-category/create'))
  },
  {
    "Code": layoutCode.catalogPricingCategoryEdit,
    "ComponentPath": lazy(() => import('../pages/catalog/pricing-category/edit'))
  },
  //#endregion

  //#region Nghiệp vụ icom
  {
    "Code": layoutCode.bussinessIcom,
    "ComponentPath": ""
  },
  {
    "Code": layoutCode.icomTarget,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/target'))
  },
  {
    "Code": layoutCode.icomTargetNavigate,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/target'))
  },
  {
    "Code": layoutCode.icomTargetPractice,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/target/edit'))
  },
  {
    "Code": layoutCode.icomTargetDetail,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/target/detail'))
  },
  {
    "Code": layoutCode.icomContract,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/contract'))
  },
  {
    "Code": layoutCode.icomContractCreate,
    "ComponentPath": lazy(() => import('../pages/bussiness-icom/contract/create'))
  },
  //#endregion
]
//#endregion


export const errorMessage: Map<string, string> = new Map([
  ['incorrectFormat', 'Chỉ nhập ký tự chữ, số, " - " hoặc "_"'],
  ['required', 'Không được để trống']
]);

export const patternValidate: Map<string, RegExp> = new Map([
  ['code', /^[a-zA-Z0-9-_]+$/g]
]);

export const tabContract = {
  Waiting: 'waiting',
  All: 'all',
  Approved: 'approved',
  No_Approved: 'no_approver',
}

export const paginationDefault = {
  total: 0,
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

