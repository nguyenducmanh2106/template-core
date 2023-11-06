import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { ContractModel } from '@/apis/models/ContractModel';
import { ContractProductModel } from '@/apis/models/ContractProductModel';
import { getPricingCategory } from '@/apis/services/PricingCategoryService';
import { getPricingDecision } from '@/apis/services/PricingDecisionService';
import { getProduct } from '@/apis/services/ProductService';
import UploadFileComponent from '@/components/UploadFile/Index';
import { findDuplicateObjects, tabContract, uuidv4 } from '@/utils/constants';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
    EditableProTable,
    ProCard,
    ProForm,
    ProFormCheckbox,
    ProFormDatePicker,
    ProFormDateRangePicker,
    ProFormItem,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    StepsForm,
} from '@ant-design/pro-components';
import { Button, Card, Col, DatePicker, Input, Row, Select, Space, Tooltip, Typography, UploadFile, message } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductAndCom from './product-com';
import { getCustomer, getCustomer1 } from '@/apis/services/CustomerService';
import { getContractType } from '@/apis/services/ContractTypeService';
import { getAdministrativeDivision, getAdministrativeDivision2 } from '@/apis/services/AdministrativeDivisionService';
import { CustomerModel } from '@/apis/models/CustomerModel';

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

function ContractCreate() {
    // const formRef = useRef<ProFormInstance>();
    const formMapRef = useRef<
        React.MutableRefObject<ProFormInstance<any> | undefined>[]
    >([]);
    const navigate = useNavigate();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const initState = {
        customers: [],
        contractTypes: [],
        provinces: [],
        districts: [],
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );
    const onHandleChangeFile = (value: UploadFile[]) => {
        // console.log(value)
        setFileList([...value])
    }
    useEffect(() => {
        const fnGetInitState = async () => {
            setLoading(true);
            const responseCustomer: ResponseData = await getCustomer();
            const customerOptions = ConvertOptionSelectModel(responseCustomer.data as OptionModel[]);
            const responseContractType: ResponseData = await getContractType();
            const contractTypeOptions = ConvertOptionSelectModel(responseContractType.data as OptionModel[]);
            const responseProvinces: ResponseData = await getAdministrativeDivision();
            const optionProvinces = ConvertOptionSelectModel(responseProvinces.data as OptionModel[]);
            const stateDispatcher = {
                customers: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(customerOptions),
                contractTypes: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(contractTypeOptions),
                provinces: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionProvinces),
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel],
            };
            dispatch(stateDispatcher);
            setLoading(false);
        }
        fnGetInitState()
    }, []);

    const stepChange = useRef<number>(1);


    const { Title, Paragraph, Text, Link } = Typography;
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const dataSource = useRef<readonly ContractProductModel[]>([]);

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
    const columns: ProColumns<ContractProductModel>[] = [
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
                            const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                            const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
                            if (checkDuplication.length < 1) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                    // {
                    //     message: '必须包含数字',
                    //     pattern: /[0-9]/,
                    // },
                    // {
                    //     max: 16,
                    //     whitespace: true,
                    //     message: '最长为 16 位',
                    // },
                    // {
                    //     min: 6,
                    //     whitespace: true,
                    //     message: '最小为 6 位',
                    // },
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
                            const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                            const checkDuplication = findDuplicateObjects(contractProducts, "productId", "pricingCategoryId")
                            if (checkDuplication.length < 1) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Đã tồn tại'));
                        },
                    }),
                    // {
                    //     message: '必须包含数字',
                    //     pattern: /[0-9]/,
                    // },
                    // {
                    //     max: 16,
                    //     whitespace: true,
                    //     message: '最长为 16 位',
                    // },
                    // {
                    //     min: 6,
                    //     whitespace: true,
                    //     message: '最小为 6 位',
                    // },
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
                            const idxChange = _.field.split('.')[1]
                            const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                            const contractIndex = contractProducts[idxChange]
                            const objReplce = {
                                ...contractIndex,
                                totalPrice: (value ?? 0) * (contractIndex.amount ?? 0)
                            }

                            contractProducts.splice(idxChange, 1, objReplce)
                            setFieldValue('ContractProducts', [...contractProducts])
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
                            const idxChange = _.field.split('.')[1]
                            const contractProducts: ContractProductModel[] = getFieldsValue()?.ContractProducts
                            const contractIndex = contractProducts[idxChange]
                            const objReplce = {
                                ...contractIndex,
                                totalPrice: (value ?? 0) * (contractIndex.implementationPrice ?? 0)
                            }

                            contractProducts.splice(idxChange, 1, objReplce)
                            setFieldValue('ContractProducts', [...contractProducts])
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
            title: 'Ghi chú',
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
            key: "Chia Com và doanh thu",
            tab: 'Đã duyệt',
        },

    ];
    const [activeTabKey, setActiveTabKey] = useState<string>('tab1');

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
    };
    const contentList: Record<string, React.ReactNode> = {
        tab1: <ProFormItem>
            <EditableProTable<ContractProductModel>
                // headerTitle="可编辑表格"
                columns={columns}
                name="Com"
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

    const onChangeProvince = async (value: string) => {

        const filter = {
            ProvinceId: value ? value : undefined,
        }
        if (!value) {
            const stateDispatcher = {
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }],
            }
            dispatch(stateDispatcher)
            return
        }
        const response: ResponseData = await getAdministrativeDivision2(filter.ProvinceId);

        const options = ConvertOptionSelectModel(response.data as OptionModel[]);
        const stateDispatcher = {
            districts: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(options),
        };
        dispatch(stateDispatcher);
    }
    const onChangeCustomer = async (value: string) => {
        console.log(value);

        // const fieldsValue = await formMapRef.current[0]?.current.getFieldsValue();
        const fields = formMapRef.current[0].current?.getFieldsValue()
        const salePlanningFields = formMapRef.current[1].current?.getFieldsValue()

        console.log(fields)
        // formRef?.current?.setFieldsValue({
        //     "DistrictId": '',
        // })
        // const filter = {
        //     ProvinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
        // }
        // if (!value) {
        //     const stateDispatcher = {
        //         districts: [{
        //             key: 'Default',
        //             label: '-Chọn-',
        //             value: '',
        //         }],
        //     }
        //     dispatch(stateDispatcher)
        //     return
        // }
        const response: ResponseData<CustomerModel> = await getCustomer1(value) as ResponseData<CustomerModel>;
        formMapRef.current[0].current?.setFieldValue('ProvinceId', response.data?.provinceId)
        formMapRef.current[0].current?.setFieldValue('DistrictId', response.data?.districtId)
        formMapRef.current[1].current?.setFieldValue('CustomerName', response.data?.name)
        formMapRef.current[1].current?.setFieldValue('CustomerCategory', response.data?.customerCategoryId)
        await onChangeProvince(response.data?.provinceId ?? "")
        // const options = ConvertOptionSelectModel(response.data as OptionModel[]);
        // const stateDispatcher = {
        //     districts: [{
        //         key: 'Default',
        //         label: '-Chọn-',
        //         value: '',
        //     } as SelectOptionModel].concat(options),
        // };
        // dispatch(stateDispatcher);
    };

    return (
        <ProCard
            title={
                <>
                    <Space className="title">
                        <Tooltip title="Quay lại">
                            <Button type="text" shape='circle' onClick={() => navigate('/icom/contract')}>
                                <ArrowLeftOutlined />
                            </Button>
                        </Tooltip>
                        <Text strong>Tạo mới hợp đồng</Text>
                    </Space>
                </>
            }
            extra={
                <Space>
                    <Button type="dashed" onClick={() => navigate('/icom/contract')}>
                        Hủy bỏ
                    </Button>
                    {/* <Button disabled={buttonLoading} htmlType="submit" type='primary' onClick={handleOk}>
                        {buttonOkText}
                    </Button> */}
                </Space>
            }
        >
            <StepsForm<{
                name: string;
            }>
                onCurrentChange={(current: number) => {
                    // console.log(current)
                    stepChange.current = current
                }}
                formMapRef={formMapRef}
                onFinish={handleOk}
                formProps={{
                    validateMessages: validateMessages
                }}
            >
                <StepsForm.StepForm<{
                    name: string;
                }>
                    name="step-1"
                    title="Thông tin hợp đồng"
                    stepProps={{
                        description: 'Nội dung cơ bản',
                    }}
                    onFinish={async () => {
                        const fields = formMapRef.current[0].current?.getFieldsValue()
                        console.log(fields)
                        return true;
                    }}
                    initialValues={{
                        'ContractDate': [dayjs(new Date()), dayjs(new Date())]
                    }}

                >
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
                                name="Description"
                                label="Ghi chú"
                                style={{ width: '100%' }}
                                tooltip="Ghi chú"
                                placeholder="Nhập ghi chú"
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Loại hợp đồng"
                                name="ContractTypeId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                options={state.contractTypes}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Khách hàng"
                                name="CustomerId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                onChange={onChangeCustomer}
                                // initialValue="1"
                                options={state.customers}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Tỉnh/TP"
                                name="ProvinceId"
                                disabled
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                onChange={onChangeProvince}
                                options={state.provinces}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Quận/Huyện"
                                name="DistrictId"
                                disabled
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                options={state.districts}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                name="ContractValue"
                                label="Giá trị hợp đồng"
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                style={{ width: '100%' }}
                                label="Thời hạn hợp đồng"
                                name="ContractDate">
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    // defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
                                    format={'DD/MM/YYYY'}
                                />
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormItem name="FileUpload">
                                <UploadFileComponent fileListInit={fileList} onChangeFile={onHandleChangeFile} />
                            </ProFormItem>
                        </Col>
                    </Row>
                </StepsForm.StepForm>
                {/* <StepsForm.StepForm<{
                    checkbox: string;
                }>
                    name="step-2"
                    title="Sản phẩm"
                    stepProps={{
                        description: 'Sản phẩm trong hợp đồng',
                    }}
                    onFinish={async () => {
                        // const fields = formRef.current?.getFieldsValue()
                        const fields = formMapRef.current[1].current?.getFieldsValue()
                        if (fields.ContractProducts && fields.ContractProducts?.length > 0) {
                            return true;
                        }
                        message.warning("Chưa nhập sản phẩm")
                        return false
                    }}
                >
                    <ProFormItem>
                        <EditableProTable<ContractProductModel>
                            // headerTitle="可编辑表格"
                            columns={columns}
                            name="ContractProducts"
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
                    </ProFormItem>
                </StepsForm.StepForm> */}
                <StepsForm.StepForm<{
                    checkbox: string;
                }>
                    name="step-2"
                    title="Kế hoạch bán hàng"
                    stepProps={{
                        description: 'Thông tin kế hoạch bán hàng',
                    }}
                    onFinish={async () => {
                        const fields = formMapRef.current[1].current?.getFieldsValue()
                        console.log(fields);
                        return true;
                    }}
                >
                    <ProductAndCom />
                </StepsForm.StepForm>
                <StepsForm.StepForm
                    name="step-4"
                    title="Chọn luồng ký"
                    stepProps={{
                        description: 'Chọn luồng trình ký',
                    }}
                // onFinish={async () => {
                //     // console.log(formRef.current?.getFieldsValue());
                //     return true;
                // }}
                >
                    <ProFormCheckbox.Group
                        name="checkbox"
                        label="部署单元"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        options={['部署单元1', '部署单元2', '部署单元3']}
                    />
                    <ProFormSelect
                        label="部署分组策略"
                        name="remark"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        initialValue="1"
                        options={[
                            {
                                value: '1',
                                label: '策略一',
                            },
                            { value: '2', label: '策略二' },
                        ]}
                    />
                    <ProFormSelect
                        label="Pod 调度策略"
                        name="remark2"
                        initialValue="2"
                        options={[
                            {
                                value: '1',
                                label: '策略一',
                            },
                            { value: '2', label: '策略二' },
                        ]}
                    />
                </StepsForm.StepForm>
            </StepsForm>
        </ProCard>
    );
};

export default ContractCreate