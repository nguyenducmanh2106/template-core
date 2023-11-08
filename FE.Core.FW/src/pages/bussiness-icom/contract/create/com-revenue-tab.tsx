import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { ContractModel } from '@/apis/models/ContractModel';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
import { SalesPlaningCommisionModel } from '@/apis/models/SalesPlaningCommisionModel';
import { SalesPlaningProductModel } from '@/apis/models/SalesPlaningProductModel';
import { TaxCategoryModel } from '@/apis/models/TaxCategoryModel';
import { getCustomerCategory } from '@/apis/services/CustomerCategoryService';
import { getCustomerType } from '@/apis/services/CustomerTypeService';
import { getPricingCategory } from '@/apis/services/PricingCategoryService';
import { getPricingDecision } from '@/apis/services/PricingDecisionService';
import { getProduct } from '@/apis/services/ProductService';
import { getTaxCategory } from '@/apis/services/TaxCategoryService';
import { contractState } from '@/store/contract-atom';
import { uuidv4 } from '@/utils/constants';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProFormCheckbox,
    ProFormDigit,
    ProFormItem,
    ProFormSelect,
    ProFormText
} from '@ant-design/pro-components';
import { Button, Card, Checkbox, Col, InputNumber, Row, Select, Tooltip, Typography, UploadFile } from 'antd';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';


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

function ComAndRevenue() {
    // const formRef = useRef<ProFormInstance>();
    const [contractAtom, setContractAtom] = useRecoilState(contractState);
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

    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    // const editableKeys = useRef<React.Key[]>([]);

    // const setEditableRowKeys = (value: React.Key[]) => {
    //     console.log(value)
    //     editableKeys.current = [...value]
    // }
    const dataSource = useRef<readonly SalesPlaningCommisionModel[]>([]);

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

    const columnTab3s: ProColumns<SalesPlaningCommisionModel>[] = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productIdCommission',
            key: 'productIdCommission',
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
            // formItemProps: {
            //     rules: [
            //         // {
            //         //     required: true,
            //         //     whitespace: true,
            //         //     message: 'Không được để trống',
            //         // },
            //         ({ getFieldValue, getFieldsValue }: any) => ({
            //             validator(_: any, value: any) {
            //                 return Promise.resolve();
            //                 console.log(getFieldsValue())
            //                 const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.salesPlaningProducts
            //                 const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
            //                 if (checkDuplication.length < 1) {
            //                     return Promise.resolve();
            //                 }
            //                 return Promise.reject(new Error('Đã tồn tại'));
            //             },
            //         }),
            //     ],
            // },
        },
        {
            title: 'Quy định giá bán',
            dataIndex: 'pricingCategoryIdCommission',
            key: 'pricingCategoryIdCommission',
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
            // formItemProps: {
            //     rules: [
            //         // {
            //         //     required: true,
            //         //     whitespace: true,
            //         //     message: 'Không được để trống',
            //         // },
            //         ({ getFieldValue, getFieldsValue }: any) => ({
            //             validator(_: any, value: any) {
            //                 return Promise.resolve();
            //                 const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.salesPlaningProducts
            //                 const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
            //                 if (checkDuplication.length < 1) {
            //                     return Promise.resolve();
            //                 }
            //                 return Promise.reject(new Error('Đã tồn tại'));
            //             },
            //         }),

            //     ],
            // },
        },
        {
            title: 'Tỷ lệ hoa hồng(%)',
            dataIndex: 'staffComRate',
            key: 'staffComRate',
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
                            // const contractProducts = onChangeTable(getFieldsValue, _)
                            // setFieldValue('salesPlaningProducts', [...contractProducts])
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
            title: 'Tỷ lệ hoa hồng Com chênh lệch giá(%)',
            dataIndex: 'staffCompareComRate',
            key: 'staffCompareComRate',
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
                            // const contractProducts = onChangeTable(getFieldsValue, _)
                            // setFieldValue('salesPlaningProducts', [...contractProducts])

                            if (true) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                ],
            },
        },
        //#region CP CSVC theo PABH
        {
            title: 'Tiền hoa hồng',
            dataIndex: 'totalCom',
            key: 'totalCom',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            // const contractProducts = onChangeTable(getFieldsValue, _)
                            // setFieldValue('salesPlaningProducts', [...contractProducts])
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
            title: 'Tỷ lệ doanh thu(%)',
            dataIndex: 'staffRevenueRate',
            key: 'staffRevenueRate',
            width: '180px',
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
                            // const contractProducts = onChangeTable(getFieldsValue, _)
                            // setFieldValue('salesPlaningProducts', [...contractProducts])
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
            title: 'Tiền doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            width: '180px',
            valueType: 'digit',
            fieldProps: {
                formatter: (value: any) => `${value.replace('.', ',')}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => Number.parseFloat(value!.replace(/(\.*)/g, '').replace(',', '.')).toFixed(0),
                style: { width: '100%' },
                disabled: true,
                controls: false
            },
            formItemProps: {
                rules: [
                    // {
                    //     max: 100
                    // },
                    ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                        validator(_: any, value: any) {
                            // const contractProducts = onChangeTable(getFieldsValue, _)
                            // setFieldValue('salesPlaningProducts', [...contractProducts])
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

    return (
        <EditableProTable<SalesPlaningCommisionModel>
            // headerTitle="可编辑表格"
            columns={columnTab3s}
            name="salesPlaningCommisions"
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
                editableKeys: editableKeys,
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
    );
};

export default ComAndRevenue