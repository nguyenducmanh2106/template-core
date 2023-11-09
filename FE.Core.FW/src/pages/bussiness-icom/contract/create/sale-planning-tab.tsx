import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { ContractModel } from '@/apis/models/ContractModel';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
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
import type { FormInstance, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProFormCheckbox,
    ProFormDigit,
    ProFormItem,
    ProFormSelect,
    ProFormText
} from '@ant-design/pro-components';
import { Button, Card, Checkbox, Col, InputNumber, Row, Select, Tabs, TabsProps, Tooltip, Typography, UploadFile } from 'antd';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import ComAndRevenue from './com-revenue-tab';
import { SalesPlaningCommisionModel } from '@/apis/models/SalesPlaningCommisionModel';
import { debounce } from 'lodash';
import ProductAndCom from './product-com-tab';


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
interface props {
    formMapRef?: React.MutableRefObject<React.MutableRefObject<FormInstance<any> | undefined>[]>;
}
function SalePlanning({ formMapRef }: props) {
    console.log("re-render")
    // const [contractAtom, setContractAtom] = useRecoilState(contractState);
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

    const item: TabsProps['items'] = [
        {
            key: 'tab1',
            label: 'Sản phẩm và Com',
            children: <ProductAndCom formMapRef={formMapRef} />,
        },
        {
            key: 'tab2',
            label: 'Chi phí phát sinh',
            children: <Row gutter={16}>
                <Col span={12}>
                    <ProFormItem label="Chi phí phát sinh" name="cost"
                        rules={[
                            // { required: true, whitespace: true },
                            ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                                validator(_: any, value: any) {
                                    const fields = getFieldsValue()
                                    const implementationCost = (value ?? 0) * 0.01 * (100 - (fields.costTaxRate ?? 0))
                                    fields.implementationCost = implementationCost
                                    // const newValue: ContractModel = {
                                    //     ...contractAtom,
                                    //     salesPlaning: {
                                    //         ...contractAtom.salesPlaning,
                                    //         ...fields
                                    //     }
                                    // }
                                    // setContractAtom(newValue)
                                    setFieldValue('implementationCost', implementationCost)
                                    if (true) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Đã tồn tại'));
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(value: any) => value!.replace(/(\.*)/g, '').replace('.', ',')}
                        />
                    </ProFormItem>
                </Col>
                <Col span={12}>
                    <ProFormItem label="Tỷ lệ thuế(%)" name="costTaxRate"
                        rules={[
                            // { required: true, whitespace: true },
                            ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                                validator(_: any, value: any) {
                                    const fields = getFieldsValue()
                                    const implementationCost = (100 - (value ?? 0)) * 0.01 * (fields.cost ?? 0)
                                    fields.implementationCost = implementationCost
                                    // const newValue: ContractModel = {
                                    //     ...contractAtom,
                                    //     salesPlaning: {
                                    //         ...contractAtom.salesPlaning,
                                    //         ...fields
                                    //     }
                                    // }
                                    // setContractAtom(newValue)
                                    setFieldValue('implementationCost', implementationCost)
                                    if (true) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Đã tồn tại'));
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            addonAfter="%"
                            max='100'
                            formatter={(value: any) => `${value.replace('.', ',')}`}
                            parser={(value: any) => Number.parseFloat(value!.replace(',', '.')).toFixed(6)}
                        />
                    </ProFormItem>
                </Col>
                <Col span={12}>
                    <ProFormItem label="Chi phí thực chi" name="implementationCost"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            disabled
                            formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(value: any) => value!.replace(/(\.*)/g, '').replace('.', ',')}
                        />
                    </ProFormItem>
                </Col>
                <Col span={12}>
                    <ProFormText
                        style={{ width: '100%' }}
                        name="costDescription"
                        label="Ghi chú"
                    />
                </Col>
            </Row>,
        },
        {
            key: '3',
            label: 'Chia Com và doanh thu',
            children: <ComAndRevenue />,
        },

    ];

    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormText
                        style={{ width: '100%' }}
                        name="contractNumber"
                        label="Số hiệu hợp đồng"
                        // width="lg"
                        disabled
                        placeholder=""
                        tooltip="Số hiệu hợp đồng"
                    />
                </Col>
                <Col span={12}>
                    <ProFormText
                        name="customerName"
                        label="Tên khách hàng"
                        style={{ width: '100%' }}
                        disabled
                        rules={[{ required: true }]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        label="Loại khách hàng"
                        name="customerType"
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
                        name="customerProperty"
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
                        name="customerStatus"
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
                        name="customerCategory"
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
            <Tabs defaultActiveKey="tab1" type='card' items={item} />
        </>
    );
};

export default SalePlanning