import { ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    FormInstance,
    Input,
    Row,
    Select,
    Space,
    Spin,
    Tooltip,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { OptionModel, SelectOptionModel } from '@/@types/data';
import { Code } from '@/apis';
import { TargetMappingModel } from '@/apis/models/TargetMappingModel';
import { TargetModel } from '@/apis/models/TargetModel';
import { putBranch } from '@/apis/services/BranchService';
import { getProductType } from '@/apis/services/ProductTypeService';
import { getTarget1, postTarget2 } from '@/apis/services/TargetService';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

function TargetEdit() {
    console.log('render component')
    const navigate = useNavigate();
    const params = useParams()
    let [searchParams, setSearchParams] = useSearchParams();

    const type = searchParams.get('type')
    const departmentId: string | undefined = searchParams.get('departmentId') ? searchParams.get('departmentId')?.toString() : undefined
    const year = searchParams.get('year')
    const userName = searchParams.get('userName')?.toString();
    // console.log(searchParams.get('type'));
    // Load
    const initState = {
        recordEdit: {},
        productTypes: []
    };
    const [loading, setLoading] = useState<boolean>(false);

    const { Title, Paragraph, Text, Link } = Typography;
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

            const response: ResponseData<TargetModel> = await getTarget1(params.id, +(type ?? 0), departmentId, +(year ?? 0), userName) as ResponseData<TargetModel>;
            const responseProductType: ResponseData = await getProductType();
            const productTypeOptions = ConvertOptionSelectModel(responseProductType.data as OptionModel[]);
            const stateDispatcher = {
                recordEdit: response.data,
                productTypes: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(productTypeOptions),
            };
            // setDataSource(response.data?.targets as TargetMappingModel[])
            dataSource.current = response.data?.targets as TargetMappingModel[]
            const key = response.data?.targets?.map((item) => item.id)
            setEditableRowKeys(key as React.Key[])
            dispatch(stateDispatcher);
            setLoading(false);
        }
        fnGetInitState()
    }, []);

    // Data
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [buttonOkText, setButtonOkText] = useState<string>('Lưu');

    // searchForm
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>(null);


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

    const handleOk = async (values: any) => {
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);

        const objBody: TargetModel = {
            ...fieldsValue,
            departmentId,
            type,
            username: userName,
            year
            // targets: dataSource.current
        }
        // console.log(objBody);

        // return
        const response = await postTarget2(params.id, "", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            navigate(`/icom/target`)
        }
        else {
            message.error(response.message || "Thất bại")
        }
    };

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    // const [dataSource, setDataSource] = useState<readonly TargetMappingModel[]>([]);
    const dataSource = useRef<readonly TargetMappingModel[]>([]);

    const columns: ProColumns<TargetMappingModel>[] = [
        {
            title: 'Loại sản phẩm',
            dataIndex: 'productTypeId',
            key: 'productTypeId',
            width: '220px',
            valueType: 'select',
            fixed: 'left',
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
                        options={state.productTypes}
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
                    ({ getFieldValue, getFieldsValue }) => ({
                        validator(_, value) {
                            // console.log(_, value)
                            const id = value as string
                            const keyProductTypes = dataSource?.current?.map((item) => item.productTypeId)
                            // const checkExist = keyProductTypes?.some((item) => item === id)
                            const occurrences = keyProductTypes.reduce((count, item) => (item === id ? count + 1 : count), 0);
                            // console.log(occurrences)
                            if (occurrences < 2) {
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
            title: 'Tháng 1',
            dataIndex: 'jan',
            key: 'jan',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'jan',
                    key: 'jan',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJan',
                    key: 'quantityJan',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 2',
            dataIndex: 'feb',
            key: 'feb',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'feb',
                    key: 'feb',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityFeb',
                    key: 'quantityFeb',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 3',
            dataIndex: 'mar',
            key: 'mar',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'mar',
                    key: 'mar',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityMar',
                    key: 'quantityMar',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 4',
            dataIndex: 'apr',
            key: 'apr',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'apr',
                    key: 'apr',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityApr',
                    key: 'quantityApr',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 5',
            dataIndex: 'may',
            key: 'may',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'may',
                    key: 'may',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityMay',
                    key: 'quantityMay',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 6',
            dataIndex: 'jun',
            key: 'jun',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'jun',
                    key: 'jun',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJun',
                    key: 'quantityJun',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 7',
            dataIndex: 'july',
            key: 'july',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'july',
                    key: 'july',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJuly',
                    key: 'quantityJuly',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 8',
            dataIndex: 'aug',
            key: 'aug',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'aug',
                    key: 'aug',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityAug',
                    key: 'quantityAug',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 9',
            dataIndex: 'sep',
            key: 'sep',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'sep',
                    key: 'sep',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantitySep',
                    key: 'quantitySep',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 10',
            dataIndex: 'oct',
            key: 'oct',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'oct',
                    key: 'oct',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityOct',
                    key: 'quantityOct',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 11',
            dataIndex: 'nov',
            key: 'nov',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'nov',
                    key: 'nov',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityNov',
                    key: 'quantityNov',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
        },
        {
            title: 'Tháng 12',
            dataIndex: 'nov',
            key: 'nov',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'dec',
                    key: 'dec',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    },
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityDec',
                    key: 'quantityDec',
                    width: '180px',
                    valueType: 'digit',
                    fieldProps: {
                        formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                        parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
                        style: { width: '100%' },
                        controls: false
                    }
                }
            ]
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

    const onHandleChangeSource = (value: readonly TargetMappingModel[]) => {
        // setDataSource(value)
        dataSource.current = value;
    }
    const onHandleFinishFailed = ({ values, errorFields, outOfDate }: any) => {
        console.log('error')
    }
    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate('/icom/target')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Cập nhật mục tiêu</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="dashed" onClick={() => navigate('/icom/target')}>
                            Hủy bỏ
                        </Button>
                        <Button disabled={buttonLoading} htmlType="submit" type='primary' onClick={handleOk}>
                            {buttonOkText}
                        </Button>
                    </Space>
                }
            >
                {loading ? <Spin /> :
                    <>
                        <Form
                            // form={searchForm}
                            ref={formRef}
                            name='nest-messages' id="myFormCreate"
                            onFinish={handleOk}
                            autoComplete="off"
                            onFinishFailed={onHandleFinishFailed}
                            validateMessages={validateMessages}
                            initialValues={{
                                ["TypeName"]: state.recordEdit?.typeName,
                                ["Year"]: state.recordEdit?.year,
                                ["DepartmentName"]: state.recordEdit?.departmentName,
                                ["FullName"]: state.recordEdit?.fullname,
                                ["Targets"]: dataSource.current,
                            }}
                        >
                            <Row gutter={16} justify='start'>
                                <Col span={12}>
                                    <Form.Item label={'Loại mục tiêu'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TypeName'>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={'Năm thực hiện'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Year'>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                {state.recordEdit?.type === 0 ?
                                    <Col span={12}>
                                        <Form.Item label={'Phòng ban'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='DepartmentName'>
                                            <Input disabled />
                                        </Form.Item>
                                    </Col> :
                                    <Col span={12}>
                                        <Form.Item label={'Nhân viên'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='FullName'>
                                            <Input disabled />
                                        </Form.Item>
                                    </Col>
                                }

                            </Row>
                            <Divider orientation="left" plain>
                                Danh sách sản phẩm
                            </Divider>
                            <EditableProTable<TargetMappingModel>
                                // headerTitle="可编辑表格"
                                columns={columns}
                                name="Targets"
                                rowKey="id"
                                scroll={{ x: '100vw', y: '400px' }}
                                // value={dataSource.current}
                                onChange={onHandleChangeSource}
                                recordCreatorProps={{
                                    newRecordType: 'dataSource',
                                    record: () => ({
                                        id: uuidv4(),
                                    }),
                                }}

                                // toolBarRender={() => {
                                //     return [
                                //         <Button
                                //             type="primary"
                                //             key="save"
                                //             onClick={() => {
                                //                 // dataSource 就是当前数据，可以调用 api 将其保存
                                //                 console.log(dataSource);
                                //             }}
                                //         >
                                //             Lưu
                                //         </Button>,
                                //     ];
                                // }}
                                editable={{
                                    type: 'multiple',
                                    deleteText: <Tooltip title="Xóa">
                                        <Button type="text" shape='circle'>
                                            <DeleteOutlined />
                                        </Button>
                                    </Tooltip>,
                                    deletePopconfirmMessage: <>Đồng ý xóa?</>,
                                    editableKeys,
                                    actionRender: (row, config, defaultDoms) => {
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
                        </Form>

                    </>
                }


            </Card>


        </div>
    );
}

export default TargetEdit;
