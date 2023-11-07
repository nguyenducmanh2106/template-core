import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
import { SalesPlaningProductModel } from '@/apis/models/SalesPlaningProductModel';
import { TaxCategoryModel } from '@/apis/models/TaxCategoryModel';
import { getCustomerCategory } from '@/apis/services/CustomerCategoryService';
import { getCustomerType } from '@/apis/services/CustomerTypeService';
import { getPricingCategory } from '@/apis/services/PricingCategoryService';
import { getPricingDecision } from '@/apis/services/PricingDecisionService';
import { getProduct } from '@/apis/services/ProductService';
import { getTaxCategory } from '@/apis/services/TaxCategoryService';
import { uuidv4 } from '@/utils/constants';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProFormCheckbox,
    ProFormItem,
    ProFormSelect,
    ProFormText
} from '@ant-design/pro-components';
import { Button, Card, Checkbox, Col, Row, Select, Tooltip, Typography, UploadFile } from 'antd';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const validateMessages = {
    required: '${label} không được để trống',
    whitespace: '${label} không được để trống',
    types: {
        email: '${label} không đúng định dạng email',
        number: '${label} không đúng định dạng số',
    },
    number: {
        range: '${label} must be between ${min} and ${max}',
    },
};

function ProductAndCom() {
    // const formRef = useRef<ProFormInstance>();

    const initState = {
        products: [],
        pricingCategories: [],
        pricingDecisions: [],
        vats: [],
        customerCategories: [],
        customerTypes: []
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );

    useEffect(() => {
        const fnGetInitState = async () => {
            setLoading(true);
            getInitDataStep2()

            setLoading(false);
        }
        fnGetInitState()
    }, []);


    const getInitDataStep2 = useCallback(async () => {
        const responseProduct: ResponseData = await getProduct();
        const productOptions = ConvertOptionSelectModel(responseProduct.data as OptionModel[]);

        const responsePricingCategories: ResponseData = await getPricingCategory();
        const pricingCategoryOptions = ConvertOptionSelectModel(responsePricingCategories.data as OptionModel[]);

        const responsePricingDecisions: ResponseData<PricingDecisionModel[]> = await getPricingDecision() as ResponseData<PricingDecisionModel[]>;
        const pricingDecisionOptions = ConvertOptionSelectModel(responsePricingDecisions.data as OptionModel[]);
        // const pricingDecisionOptions: SelectOptionModel[] | any = responsePricingDecisions.data?.map((item, idx) => ({
        //     ...item,
        //     label2: item.name,
        //     label: (
        //         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        //             <span>{item.name}</span>
        //             <span>Xem</span>
        //         </div>
        //     ),
        // }));

        const responseVAT: ResponseData<TaxCategoryModel[]> = await getTaxCategory() as ResponseData<TaxCategoryModel[]>;
        const VATOptions = ConvertOptionSelectModel(responseVAT.data as OptionModel[], 'value');

        const responseCustomerCategory: ResponseData = await getCustomerCategory();
        const customerCategoryOptions = ConvertOptionSelectModel(responseCustomerCategory.data as OptionModel[]);

        const responseCustomerType: ResponseData = await getCustomerType();
        const customerTypeOptions = ConvertOptionSelectModel(responseCustomerType.data as OptionModel[]);
        const stateDispatcher = {
            products: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(productOptions),
            pricingCategories: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(pricingCategoryOptions),
            pricingDecisions: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(pricingDecisionOptions as SelectOptionModel[]),
            vats: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(VATOptions),
            customerCategories: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(customerCategoryOptions),
            customerTypes: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(customerTypeOptions),
        };
        dispatch(stateDispatcher);
    }, [])

    const { Title, Paragraph, Text, Link } = Typography;
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const dataSource = useRef<readonly SalesPlaningProductModel[]>([]);

    function findDuplicateObjects<T>(arr: T[], property1: keyof T, property2: keyof T): T[] {
        const seen = new Set<string>();
        const duplicates: T[] = [];

        for (const obj of arr) {
            const key = `${obj[property1]}-${obj[property2]}`;

            if (seen.has(key)) {
                duplicates.push(obj);
            } else {
                seen.add(key);
            }
        }

        return duplicates;
    }

    const onChangeTable = (getFieldsValue: any, _: any): SalesPlaningProductModel[] => {
        const idxChange = _.field.split('.')[1]
        const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.SalesPlaningProducts
        const contractIndex = contractProducts[idxChange]
        const l1RateDefaultToFix = ((contractIndex.l1CostDefault ?? 0) * 100 / ((contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l2RateDefaultToFix = ((contractIndex.l2CostDefault ?? 0) * 100 / ((contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l3RateDefaultToFix = ((contractIndex.l3CostDefault ?? 0) * 100 / ((contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l4RateDefaultToFix = ((contractIndex.l4CostDefault ?? 0) * 100 / ((contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)

        const l1RateToFix = ((contractIndex.l1Cost ?? 0) * 100 / ((contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l2RateToFix = ((contractIndex.l2Cost ?? 0) * 100 / ((contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l3RateToFix = ((contractIndex.l3Cost ?? 0) * 100 / ((contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)
        const l4RateToFix = ((contractIndex.l4Cost ?? 0) * 100 / ((contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0))).toFixed(6)

        const totalPrice = (contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0)
        let totalRate = (contractIndex.l1Rate ?? 0) + (contractIndex.l2Rate ?? 0) + (contractIndex.l3Rate ?? 0) + (contractIndex.l4Rate ?? 0)

        let objReplce = {}
        switch (_.field.split('.')[2]) {
            case 'l1CostDefault':
            case 'l2CostDefault':
            case 'l3CostDefault':
            case 'l4CostDefault':
                objReplce = {
                    ...contractIndex,
                    l1RateDefault: Number.parseFloat(l1RateDefaultToFix),
                    l2RateDefault: Number.parseFloat(l2RateDefaultToFix),
                    l3RateDefault: Number.parseFloat(l3RateDefaultToFix),
                    l4RateDefault: Number.parseFloat(l4RateDefaultToFix),
                    totalRateDefault: Number.parseFloat(l1RateDefaultToFix) + Number.parseFloat(l2RateDefaultToFix) + Number.parseFloat(l3RateDefaultToFix) + Number.parseFloat(l4RateDefaultToFix)
                }
                break;

            case 'l1RateDefault':
            case 'l2RateDefault':
            case 'l3RateDefault':
            case 'l4RateDefault':
                objReplce = {
                    ...contractIndex,
                    l1CostDefault: Math.round((contractIndex.l1RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l2CostDefault: Math.round((contractIndex.l2RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l3CostDefault: Math.round((contractIndex.l3RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l4CostDefault: Math.round((contractIndex.l4RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    totalRateDefault: (contractIndex.l1RateDefault ?? 0) + (contractIndex.l2RateDefault ?? 0) + (contractIndex.l3RateDefault ?? 0) + (contractIndex.l4RateDefault ?? 0)
                }
                break;
            case 'l1Rate':
            case 'l2Rate':
            case 'l3Rate':
            case 'l4Rate':
                objReplce = {
                    ...contractIndex,
                    l1Cost: Math.round((contractIndex.l1Rate ?? 0) * totalPrice * 0.01),
                    l2Cost: Math.round((contractIndex.l2Rate ?? 0) * totalPrice * 0.01),
                    l3Cost: Math.round((contractIndex.l3Rate ?? 0) * totalPrice * 0.01),
                    l4Cost: Math.round((contractIndex.l4Rate ?? 0) * totalPrice * 0.01),
                    totalRate: totalRate,
                    totalPriceWithRate: Math.round(totalRate * totalPrice * 0.01),
                    totalPriceComExcludingVAT: Math.round((100 - totalRate) * totalPrice * 0.01)
                }
                break;
            case 'l1Cost':
            case 'l2Cost':
            case 'l3Cost':
            case 'l4Cost':
                totalRate = Number.parseFloat(l1RateToFix) + Number.parseFloat(l2RateToFix) + Number.parseFloat(l3RateToFix) + Number.parseFloat(l4RateToFix);
                objReplce = {
                    ...contractIndex,
                    l1Rate: Number.parseFloat(l1RateToFix),
                    l2Rate: Number.parseFloat(l2RateToFix),
                    l3Rate: Number.parseFloat(l3RateToFix),
                    l4Rate: Number.parseFloat(l4RateToFix),
                    totalRate: totalRate,
                    totalPriceWithRate: Math.round(totalRate * totalPrice * 0.01),
                    totalPriceComExcludingVAT: Math.round((100 - totalRate) * totalPrice * 0.01)
                }
                break;
            case 'implementationPrice':
                objReplce = {
                    ...contractIndex,
                    l1Cost: Math.round((contractIndex.l1Rate ?? 0) * totalPrice * 0.01),
                    l2Cost: Math.round((contractIndex.l2Rate ?? 0) * totalPrice * 0.01),
                    l3Cost: Math.round((contractIndex.l3Rate ?? 0) * totalPrice * 0.01),
                    l4Cost: Math.round((contractIndex.l4Rate ?? 0) * totalPrice * 0.01),
                    totalPrice: (contractIndex.implementationPrice ?? 0) * (contractIndex.amount ?? 0),
                    totalRate: totalRate,
                    vatCost: Math.round(totalPrice * (contractIndex.vat ?? 0) / ((contractIndex.vat ?? 0) + 100)),
                    totalPriceWithRate: Math.round(totalRate * totalPrice * 0.01),
                    totalPriceComExcludingVAT: Math.round((100 - totalRate) * totalPrice * 0.01)
                }
                break;
            case 'defaultPrice':
                objReplce = {
                    ...contractIndex,
                    l1CostDefault: Math.round((contractIndex.l1RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l2CostDefault: Math.round((contractIndex.l2RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l3CostDefault: Math.round((contractIndex.l3RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l4CostDefault: Math.round((contractIndex.l4RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    totalRateDefault: (contractIndex.l1RateDefault ?? 0) + (contractIndex.l2RateDefault ?? 0) + (contractIndex.l3RateDefault ?? 0) + (contractIndex.l4RateDefault ?? 0)
                }
                break;
            case 'amount':
            case 'vat':
                objReplce = {
                    ...contractIndex,
                    l1Cost: Math.round((contractIndex.l1Rate ?? 0) * totalPrice * 0.01),
                    l2Cost: Math.round((contractIndex.l2Rate ?? 0) * totalPrice * 0.01),
                    l3Cost: Math.round((contractIndex.l3Rate ?? 0) * totalPrice * 0.01),
                    l4Cost: Math.round((contractIndex.l4Rate ?? 0) * totalPrice * 0.01),
                    totalPrice: totalPrice,
                    l1CostDefault: Math.round((contractIndex.l1RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l2CostDefault: Math.round((contractIndex.l2RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l3CostDefault: Math.round((contractIndex.l3RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    l4CostDefault: Math.round((contractIndex.l4RateDefault ?? 0) * (contractIndex.defaultPrice ?? 0) * (contractIndex.amount ?? 0) * 0.01),
                    totalRate: (contractIndex.l1Rate ?? 0) + (contractIndex.l2Rate ?? 0) + (contractIndex.l3Rate ?? 0) + (contractIndex.l4Rate ?? 0),
                    totalRateDefault: (contractIndex.l1RateDefault ?? 0) + (contractIndex.l2RateDefault ?? 0) + (contractIndex.l3RateDefault ?? 0) + (contractIndex.l4RateDefault ?? 0),
                    vatCost: Math.round(totalPrice * (contractIndex.vat ?? 0) / ((contractIndex.vat ?? 0) + 100)),
                    totalPriceWithRate: Math.round(totalRate * totalPrice * 0.01),
                    totalPriceComExcludingVAT: Math.round((100 - totalRate) * totalPrice * 0.01)
                }
                break;
            default:
                objReplce = {
                    ...contractIndex,
                }
                break;
        }

        contractProducts.splice(idxChange, 1, objReplce)
        return contractProducts
    }
    const columns: ProColumns<SalesPlaningProductModel>[] = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            width: '220px',
            valueType: 'select',
            fixed: 'left',
            renderFormItem: (schema, config, form) => {
                return (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                        }
                        placeholder='-Chọn bài thi-'
                        options={state.products}
                    />
                )
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        whitespace: true,
                        message: 'Không được để trống',
                    },
                    ({ getFieldValue, getFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            console.log(getFieldsValue())
                            const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.SalesPlaningProducts
                            const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
                            if (checkDuplication.length < 1) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Quy định giá bán',
            dataIndex: 'pricingCategoryId',
            key: 'pricingCategoryId',
            width: '220px',
            valueType: 'select',
            renderFormItem: (schema, config, form) => {
                return (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                        }
                        placeholder='-Chọn bài thi-'
                        options={state.pricingCategories}
                    />
                )
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        whitespace: true,
                        message: 'Không được để trống',
                    },
                    ({ getFieldValue, getFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.SalesPlaningProducts
                            const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
                            if (checkDuplication.length < 1) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),

                ],
            },
        },
        {
            title: 'Quyết định giá',
            dataIndex: 'pricingDecisionId',
            key: 'pricingDecisionId',
            width: '220px',
            valueType: 'select',
            // valueEnum: {
            //     all: { text: 'Tất cả', status: '4e7befd7-805a-4445-8c12-b7502e075986' },
            //     open: {
            //         text: 'Lỗi',
            //         status: 'Error',
            //     },
            //     closed: {
            //         text: 'Thành công',
            //         status: 'Success',
            //     },
            // },
            renderFormItem: (schema, config, form) => {
                return (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                        }
                        placeholder='-Chọn bài thi-'
                        options={state.pricingDecisions}
                    />
                )
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        whitespace: true,
                        message: 'Không được để trống',
                    },
                ],
            },
        },
        {
            title: 'Đơn giá(quy định)',
            dataIndex: 'defaultPrice',
            key: 'defaultPrice',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Không được để trống',
                    },
                    ({ getFieldValue, getFieldsValue }: any) => ({
                        validator(_: any, value: any) {

                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Đơn giá(thực tế)',
            dataIndex: 'implementationPrice',
            key: 'implementationPrice',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Không được để trống',
                    },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'amount',
            key: 'amount',
            width: '120px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: 'Không được để trống',
                    },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
        },
        {
            title: 'Diễn giải',
            dataIndex: 'description',
            key: 'description',
            width: '260px',
            valueType: 'text',
            // fieldProps: {
            //     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            //     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
            //     style: { width: '100%' },
            //     controls: false
            // },
        },
        {
            title: 'Giá chênh lệch so với QĐ',
            dataIndex: 'comparePrice',
            key: 'comparePrice',
            width: '180px',
            // disable: true,
            readonly: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                controls: false
            },
        },
        {
            title: 'Tỷ lệ hưởng Com phần giá chênh lệch(%)',
            dataIndex: 'compareRate',
            key: 'compareRate',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                // value: 0,
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])

                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Thuế VAT',
            dataIndex: 'vat',
            key: 'vat',
            width: '220px',
            valueType: 'select',
            renderFormItem: (schema, config, form) => {
                return (
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                        // filterSort={(optionA, optionB) =>
                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                        // }
                        placeholder='-Chọn bài thi-'
                        options={state.vats}
                    />
                )
            },
            formItemProps: {
                rules: [
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },

        {
            title: 'Tiền VAT',
            dataIndex: 'vatCost',
            key: 'vatCost',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
        },
        //#region CP CSVC theo quy định
        {
            title: 'L1 theo quy định(%)',
            dataIndex: 'l1RateDefault',
            key: 'l1RateDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])

                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L1 theo quy định',
            dataIndex: 'l1CostDefault',
            key: 'l1CostDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const idxChange = _.field.split('.')[1]
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L2 theo quy định(%)',
            dataIndex: 'l2RateDefault',
            key: 'l2RateDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L2 theo quy định',
            dataIndex: 'l2CostDefault',
            key: 'l2CostDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L3 theo quy định(%)',
            dataIndex: 'l3RateDefault',
            key: 'l3RateDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L3 theo quy định',
            dataIndex: 'l3CostDefault',
            key: 'l3CostDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L4 theo quy định(%)',
            dataIndex: 'l4RateDefault',
            key: 'l4RateDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L4 theo quy định',
            dataIndex: 'l4CostDefault',
            key: 'l4CostDefault',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Tổng CP hỗ trợ theo quy định',
            dataIndex: 'totalRateDefault',
            key: 'totalRateDefault',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                disabled: true,
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        //#endregion
        //#region CP CSVC theo PABH
        {
            title: 'L1 theo PABH(%)',
            dataIndex: 'l1Rate',
            key: 'l1Rate',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L1 theo PABH',
            dataIndex: 'l1Cost',
            key: 'l1Cost',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L2 theo PABH(%)',
            dataIndex: 'l2Rate',
            key: 'l2Rate',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L2 PABH',
            dataIndex: 'l2Cost',
            key: 'l2Cost',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L3 theo PABH(%)',
            dataIndex: 'l3Rate',
            key: 'l3Rate',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L3 theo PABH',
            dataIndex: 'l3Cost',
            key: 'l3Cost',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'L4 theo PABH(%)',
            dataIndex: 'l4Rate',
            key: 'l4Rate',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Số tiền L4 theo PABH',
            dataIndex: 'l4Cost',
            key: 'l4Cost',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Tổng CP hỗ trợ theo PABH',
            dataIndex: 'totalRate',
            key: 'totalRate',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                disabled: true,
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Tiền CP hỗ trợ CSVC',
            dataIndex: 'totalPriceWithRate',
            key: 'totalPriceWithRate',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
        },
        {
            title: 'Doanh thu tính Com(chưa trừ VAT)',
            dataIndex: 'totalPriceComExcludingVAT',
            key: 'totalPriceComExcludingVAT',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
        },
        {
            title: 'Tỷ lệ ghi nhận Com(%)',
            dataIndex: 'comRate',
            key: 'comRate',
            width: '180px',
            // disable: true,
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`,
                parser: (value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6),
                style: { width: '100%' },
                addonAfter: "%",
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            if (value > 100) {
                                return Promise.reject(new Error('Tỷ lệ không hợp lệ'));
                            }
                            const contractProducts = onChangeTable(getFieldsValue, _)
                            setFieldValue('SalesPlaningProducts', [...contractProducts])
                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        {
            title: 'Tiền Com',
            dataIndex: 'totalCom',
            key: 'totalCom',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
        },
        //#endregion
        {
            title: 'Hành động',
            key: 'Action',
            valueType: 'option',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: () => {
                return (
                    <Tooltip title="Xóa">
                        <Button type="text" shape='circle'>
                            <DeleteOutlined />
                        </Button>
                    </Tooltip>
                )
            },
        },
    ];
    const handleOk = async (values: any) => {
        // const fieldsValue = await formRef?.current?.validateFields();
        // setButtonOkText('Đang xử lý...');
        // setButtonLoading(true);

        // const objBody: ContractModel = {
        //     ...fieldsValue,
        //     ...values
        // }
        // console.log(objBody);

        return Promise.resolve(true);
        // const response = await postTarget2(params.id, "", objBody);
        // setButtonOkText('Lưu');
        // setButtonLoading(false);
        // if (response.code === Code._200) {
        //     message.success(response.message || "Cập nhật thành công")
        //     navigate(`/icom/target`)
        // }
        // else {
        //     message.error(response.message || "Thất bại")
        // }
    };
    const tabList = [
        {
            key: 'tab1',
            tab: 'Sản phẩm và Com',
        },
        {
            key: 'tab2',
            tab: 'Chi phí phát sinh',
        },
        {
            key: "tab3",
            tab: 'Chia Com và doanh thu',
        },

    ];
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
    };
    const contentList: Record<string, React.ReactNode> = {
        tab1: <ProFormItem>
            <EditableProTable<SalesPlaningProductModel>
                // headerTitle="可编辑表格"
                columns={columns}
                name="SalesPlaningProducts"
                rowKey="id"
                scroll={{ x: '100vw', y: '400px' }}
                // onChange={onHandleChangeSource}
                recordCreatorProps={{
                    newRecordType: 'dataSource',
                    record: () => ({
                        id: uuidv4(),
                    }),
                }}
                editable={{
                    type: 'multiple',
                    deleteText: <Tooltip title="Xóa">
                        <Button type="text" shape='circle'>
                            <DeleteOutlined />
                        </Button>
                    </Tooltip>,
                    deletePopconfirmMessage: <>Đồng ý xóa?</>,
                    editableKeys,
                    actionRender: (row: any, config: any, defaultDoms: any) => {
                        return [defaultDoms.delete];
                    },
                    onValuesChange: (record, recordList) => {
                        // setDataSource(recordList)
                        dataSource.current = recordList
                    },
                    onChange: setEditableRowKeys,
                    onDelete: (key: any, row: any) => {
                        return new Promise((resolve) => {
                            console.log(key, row)
                            setTimeout(() => {
                                resolve(true);
                            }, 0);
                        });
                    }
                }}
            />
        </ProFormItem>,
        tab2: <p>content2</p>,
    };

    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormText
                        style={{ width: '100%' }}
                        name="ContractNumber"
                        label="Số hiệu hợp đồng"
                        // width="lg"
                        tooltip="Số hiệu hợp đồng"
                        placeholder="Nhập số hiệu hợp đồng"
                    />
                </Col>
                <Col span={12}>
                    <ProFormText
                        name="CustomerName"
                        label="Tên khách hàng"
                        style={{ width: '100%' }}
                        disabled
                        rules={[{ required: true }]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        label="Loại khách hàng"
                        name="CustomerType"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        // initialValue="1"
                        options={state.customerTypes}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        label="Tính chất khách hàng"
                        name="CustomerProperty"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        initialValue="1"
                        options={[
                            {
                                label: '1.KH do NVKD tự tìm kiếm',
                                options: [
                                    { label: 'Mới - Lần đầu', value: '0' },
                                    { label: 'Cũ - Lần sau', value: '1' },
                                ],
                            },
                            {
                                label: '2. KH cũ mua lại sản phẩm',
                                options: [
                                    { label: 'Do NVKD thuyết phục', value: '2' },
                                    { label: 'Do KH tự tìm đến', value: '3' },
                                ],
                            },
                            {
                                label: '3. KH tự đến công ty - NVKD tư vấn',
                                options: [
                                    { label: 'Mới - Lần sau', value: '4' },
                                    { label: 'Cũ - Lần sau', value: '5' },
                                ],
                            },
                        ]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        label="Tình trạng khách hàng"
                        name="CustomerStatus"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        initialValue="0"
                        options={[
                            {
                                value: '0',
                                label: 'Cũ',
                            },
                            { value: '1', label: 'Mới' },
                        ]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        label="Đối tượng khách hàng"
                        name="CustomerCategory"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        // initialValue="1"
                        options={state.customerCategories}
                    />
                </Col>
                <Col span={12}>
                    <ProFormItem labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} name='isMOU' valuePropName="checked">
                        <Checkbox>Tính chất MOU</Checkbox>
                    </ProFormItem>
                </Col>

            </Row>
            <Card
                style={{ width: '100%', padding: '0' }}
                title={
                    <>
                    </>
                }
                // extra={<a href="#">More</a>}
                tabList={tabList}
                activeTabKey={activeTabKey}
                onTabChange={onTabChange}
                tabProps={{
                    size: 'middle',
                    type: 'card'
                }}
            >
                {contentList[activeTabKey]}

            </Card>
        </>
    );
};

export default ProductAndCom