import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ResponseData } from '@/apis';
import { ContractModel } from '@/apis/models/ContractModel';
import { CustomerModel } from '@/apis/models/CustomerModel';
import { getAdministrativeDivision, getAdministrativeDivision2 } from '@/apis/services/AdministrativeDivisionService';
import { getContractType } from '@/apis/services/ContractTypeService';
import { getCustomer, getCustomer1 } from '@/apis/services/CustomerService';
import UploadFileComponent from '@/components/UploadFile/Index';
import { contractState } from '@/store/contract-atom';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
    ProCard,
    ProFormCheckbox,
    ProFormItem,
    ProFormSelect,
    ProFormText,
    StepsForm
} from '@ant-design/pro-components';
import { Button, Col, DatePicker, Input, Row, Space, Tooltip, Typography, UploadFile } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import SalePlanning from './sale-planning-tab';

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
    // const [contractAtom, setContractAtom] = useRecoilState(contractState);
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
        formMapRef.current[0].current?.setFieldValue('provinceId', response.data?.provinceId)
        formMapRef.current[0].current?.setFieldValue('districtId', response.data?.districtId)
        formMapRef.current[1].current?.setFieldValue('customerName', response.data?.name)
        formMapRef.current[1].current?.setFieldValue('customerCategory', response.data?.customerCategoryId)
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

    const onChangeContractNumber = (e: any) => {
        // console.log(e.target.value)
        formMapRef.current[1].current?.setFieldValue('contractNumber', e.target.value)
    }

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
                        // const newValue: ContractModel = {
                        //     ...contractAtom,
                        //     ...fields
                        // }
                        // setContractAtom(newValue)
                        return true;
                    }}
                    initialValues={{
                        'contractDate': [dayjs(new Date()), dayjs(new Date())]
                    }}
                    style={{ width: '100%' }}

                >
                    <Row gutter={16}>
                        <Col span={12}>
                            {/* <ProFormText
                                style={{ width: '100%' }}
                                name="contractNumber"
                                label="Số hiệu hợp đồng"
                                // width="lg"
                                tooltip="Số hiệu hợp đồng"
                                placeholder="Nhập số hiệu hợp đồng"
                            /> */}
                            <ProFormItem
                                name="contractNumber"
                                label="Số hiệu hợp đồng"
                                // width="lg"
                                tooltip="Số hiệu hợp đồng">
                                <Input onBlur={onChangeContractNumber} />
                            </ProFormItem>
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                name="description"
                                label="Ghi chú"
                                tooltip="Ghi chú"
                                placeholder="Nhập ghi chú"
                                rules={[{ required: true }]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Loại hợp đồng"
                                name="contractTypeId"
                                style={{ width: '100%' }}
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
                                name="customerId"
                                style={{ width: '100%' }}
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
                                name="provinceId"
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
                                name="districtId"
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
                                disabled
                                name="contractValue"
                                label="Giá trị hợp đồng"
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormItem
                                style={{ width: '100%' }}
                                label="Thời hạn hợp đồng"
                                name="contractDate">
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
                        const contracts = formMapRef.current[0].current?.getFieldsValue()
                        const salePlannings = formMapRef.current[1].current?.getFieldsValue()
                        console.log(contracts);
                        console.log(salePlannings);
                        return true;
                    }}
                >
                    <SalePlanning formMapRef={formMapRef} />
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