import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { SalesPlaningProductModel } from '@/apis/models/SalesPlaningProductModel';
import { getPricingCategory } from '@/apis/services/PricingCategoryService';
import { getPricingDecision } from '@/apis/services/PricingDecisionService';
import { getProduct } from '@/apis/services/ProductService';
import { uuidv4 } from '@/utils/constants';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProFormItem,
    ProFormSelect,
    ProFormText
} from '@ant-design/pro-components';
import { Button, Card, Col, Row, Select, Tooltip, Typography, UploadFile } from 'antd';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const waitTime = (time: number = 0) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};
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

        const responsePricingDecisions: ResponseData = await getPricingDecision();
        const pricingDecisionOptions = ConvertOptionSelectModel(responsePricingDecisions.data as OptionModel[]);
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
            } as SelectOptionModel].concat(pricingDecisionOptions),
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
                            const contractProducts: SalesPlaningProductModel[] = getFieldsValue()?.ContractProducts
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
                    // ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                    //     validator(_: any, value: any) {
                    //         const idxChange = _.field.split('.')[1]
                    //         const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                    //         const contractIndex = contractProducts[idxChange]
                    //         const objReplce = {
                    //             ...contractIndex,
                    //             totalPrice: (value ?? 0) * (contractIndex.amount ?? 0)
                    //         }

                    //         contractProducts.splice(idxChange, 1, objReplce)
                    //         setFieldValue('ContractProducts', [...contractProducts])
                    //         if (true) {
                    //             return Promise.resolve();
                    //         }
                    //         return Promise.reject(new Error('Đã tồn tại'));
                    //     },
                    // }),
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
                    // ({ getFieldValue, getFieldsValue, setFieldValue, setFieldsValue }: any) => ({
                    //     validator(_: any, value: any) {
                    //         const idxChange = _.field.split('.')[1]
                    //         const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                    //         const contractIndex = contractProducts[idxChange]
                    //         const objReplce = {
                    //             ...contractIndex,
                    //             totalPrice: (value ?? 0) * (contractIndex.implementationPrice ?? 0)
                    //         }

                    //         contractProducts.splice(idxChange, 1, objReplce)
                    //         setFieldValue('ContractProducts', [...contractProducts])
                    //         if (true) {
                    //             return Promise.resolve();
                    //         }
                    //         return Promise.reject(new Error('Đã tồn tại'));
                    //     },
                    // }),
                ],
            },
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
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
                        initialValue="1"
                        options={[
                            {
                                value: '1',
                                label: 'Nguyên tắc',
                            },
                            { value: '2', label: 'HĐ sử dụng thực tế' },
                        ]}
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
                                value: '1',
                                label: 'Nguyên tắc',
                            },
                            { value: '2', label: 'HĐ sử dụng thực tế' },
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
                        initialValue="1"
                        options={[
                            {
                                value: '1',
                                label: 'Nguyên tắc',
                            },
                            { value: '2', label: 'HĐ sử dụng thực tế' },
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
                        initialValue="1"
                        options={[
                            {
                                value: '1',
                                label: 'Nguyên tắc',
                            },
                            { value: '2', label: 'HĐ sử dụng thực tế' },
                        ]}
                    />
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