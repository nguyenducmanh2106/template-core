import { Code } from '@/apis';
import { PaginationConfig, ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    PaginationProps,
    Row,
    Select,
    Space,
    Table,
    TimeRangePickerProps,
    Typography,
    message
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useReducer, useState } from 'react';

import { OptionModel, SelectOptionModel } from '@/apis/models/data';
import { DivisionModel } from '@/apis/models/toefl-challenge/DivisionModel';
import { RegistrationModel } from '@/apis/models/toefl-challenge/RegistrationModel';
import { getAministrativeDivisions, getAministrativeDivisions1 } from '@/apis/services/toefl-challenge/AministrativeDivisionsService';
import { getDepartment } from '@/apis/services/toefl-challenge/DepartmentService';
import { deleteDivision, deleteManyDivision } from '@/apis/services/toefl-challenge/DivisionService';
import { deleteRegistration, getRegistration, getRegistration1 } from '@/apis/services/toefl-challenge/RegistrationService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import locale from "antd/es/date-picker/locale/vi_VN"
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { CreditCardOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { RegistrationRound } from '@/apis/models/toefl-challenge/RegistrationRound';
import { RangePicker } from 'rc-picker';
import dayjs from 'dayjs';
import moment from 'moment';
import { getExam } from '@/apis/services/toefl-challenge/ExamService';
import { ProvinceModel } from '@/apis/models/toefl-challenge/ProvinceModel';
import { getSchool } from '@/apis/services/toefl-challenge/SchoolService';
import { SchoolModel } from '@/apis/models/toefl-challenge/SchoolModel';
import { PaymentStatus } from '@/apis/models/toefl-challenge/PaymentStatus';
import { PaymentType } from '@/apis/models/toefl-challenge/PaymentType';
import DebounceSelect from '../registration/debounce-select';
import { PaymentHistoryModel } from '@/apis/models/toefl-challenge/PaymentHistoryModel';
import { getTransaction2 } from '@/apis/services/toefl-challenge/TransactionService';
import { TransactionStatus } from '@/apis/models/toefl-challenge/TransactionStatus';
function PaymentHistoryTFC() {
    const navigate = useNavigate();
    // Load
    const { Panel } = Collapse;
    const initState = {
        provinces: [],
        districts: [],
        registrationRounds: [
            {
                key: RegistrationRound._1,
                label: 'Vòng 1',
                value: RegistrationRound._1,
            },
            {
                key: RegistrationRound._2,
                label: 'Vòng 2',
                value: RegistrationRound._2,
            },
            {
                key: RegistrationRound._3,
                label: 'Vòng 3',
                value: RegistrationRound._3,
            },
        ],
        isSelfRegistration: [
            {
                key: 'Default',
                label: '-Chọn-',
                value: '',
            },
            {
                key: 1,
                label: 'TS tự do',
                value: 1,
            },
            {
                key: 0,
                label: 'Không phải TS tự do',
                value: 0,
            },
        ],
        isUsedForCommunication: [
            {
                key: 'Default',
                label: '-Chọn-',
                value: '',
            },
            {
                key: 1,
                label: 'Cho phép',
                value: 1,
            },
            {
                key: 0,
                label: 'Không cho phép',
                value: 0,
            },
        ],
        blocks: [],
        exams: [],
        recordView: {},
        departments: [],
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [list, setList] = useState<PaymentHistoryModel[]>([]);
    const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
    const [pagination, setPagination] = useState<PaginationConfig>({
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
    });
    const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
    const { Title, Paragraph, Text, Link } = Typography;
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );

    const getList = async (current: number, pageSize: number = 20): Promise<void> => {
        setLoading(true);
        searchFormSubmit(current, pageSize);
        setLoading(false);
    };
    useEffect(() => {
        const fnGetInitState = async () => {
            const responseProvinces: ResponseData = await getAministrativeDivisions();
            const responseExam: ResponseData = await getExam(JSON.stringify({
                status: 1
            }));

            const provinceOptions = ConvertOptionSelectModel(responseProvinces.data as OptionModel[]);
            const examOptions = ConvertOptionSelectModel(responseExam.data as OptionModel[]);
            let blocks: SelectOptionModel[] = []
            for (let idx = 1; idx <= 12; idx++) {
                blocks.push({
                    key: `${idx}`,
                    label: `${idx}`,
                    value: `${idx}`,
                })
            }
            const stateDispatcher = {
                provinces: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }].concat(provinceOptions),
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }],
                exams: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }].concat(examOptions),
                blocks: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }].concat(blocks)
            };
            dispatch(stateDispatcher);
        }
        fnGetInitState()
        getList(1);
    }, []);

    const deleteRecord = (id: string) => {
        Modal.confirm({
            title: 'Cảnh báo',
            content: `Xác nhận xóa bản ghi này?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                const response = await deleteRegistration(id);
                if (response.code === Code._200) {
                    message.success(response.message)
                    getList(1);
                }
                else {
                    message.success(response.message)
                }
            },
        });
    };

    const multiDeleteRecord = () => {
        setLoadingDelete(true)
        Modal.confirm({
            title: 'Cảnh báo',
            content: `Xác nhận xóa những bản ghi đã chọn?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                const response = await deleteManyDivision(selectedRowDeleteKeys);
                setLoadingDelete(false)
                if (response.code === Code._200) {
                    message.success(response.message)
                    setSelectedRowDeleteKeys([])
                    getList(1);
                }
                else {
                    message.success(response.message)
                }
            },
        });
    };

    // Data
    const [showModelRegistrationPayment, setShowModelRegistrationPayment] = useState<boolean>(false);
    const [buttonLoading, setButtonLoading] = useState<any>({});
    const [buttonLoadingRegistrationPayment, setButtonLoadingRegistrationPayment] = useState<any>({});
    const [showModelImport, setShowModelImport] = useState<boolean>(false);

    const onHandleShowModelCreate = async () => {
        navigate(`/toefl-challenge/registration/create`)
    };

    const onHandleShowImportRegistrationPayments = async () => {
        setShowModelImport(true)
    }

    const onHandleShowModelViewDetail = async (id: string) => {
        setShowDetail(false)
        setButtonLoading((prevState: any) => ({ ...prevState, [id]: true }));
        const response: ResponseData<RegistrationModel> = await getRegistration1(id) as ResponseData<RegistrationModel>;
        if (response.code == Code._200) {
            const stateDispatcher = {
                recordView: response.data,
            };
            dispatch(stateDispatcher);
            setShowDetail(true)
            setButtonLoading((prevState: any) => ({ ...prevState, [id]: false }));
        }
    };

    const onHandleShowModelUpdateRegistrationPayment = async (id: string) => {
        setShowModelRegistrationPayment(false)
        setButtonLoadingRegistrationPayment((prevState: any) => ({ ...prevState, [id]: true }));
        const response: ResponseData<RegistrationModel> = await getRegistration1(id) as ResponseData<RegistrationModel>;
        if (response.code == Code._200) {
            const stateDispatcher = {
                recordView: response.data,
            };
            dispatch(stateDispatcher);
            setShowModelRegistrationPayment(true)
            setButtonLoadingRegistrationPayment((prevState: any) => ({ ...prevState, [id]: false }));
        }
    };

    // searchForm
    const [searchForm] = Form.useForm();
    const searchFormSubmit = async (current: number = 1, pageSize: number = 20): Promise<void> => {
        try {
            const fieldsValue = await searchForm.validateFields();
            setLoading(true)
            const filter = {
                ...fieldsValue,
                provinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
                ExamId: fieldsValue.ExamId ? fieldsValue.ExamId : undefined,
                SchoolId: fieldsValue.SchoolId ? fieldsValue.SchoolId.value : undefined,
                page: current,
                size: pageSize,
            }
            const response: ResponseData = await getTransaction2(
                JSON.stringify(filter)
            );
            setList((response.data || []) as PaymentHistoryModel[]);
            setPagination({
                ...pagination,
                current,
                total: response.totalCount || 0,
                pageSize: pageSize,
            });

            setLoading(false);
        } catch (error: any) {
            console.log(error);
        }
    };

    const onGetSchoolDebounce = async (search: string, page: number = 1): Promise<ResponseData<SelectOptionModel[]>> => {
        const fieldsValue = await searchForm.validateFields();
        const filter = {
            provinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
            districtId: fieldsValue.DistrictId ? fieldsValue.DistrictId : undefined,
            page: page,
            size: 20,
            textSearch: search,
        }
        return getSchool(
            JSON.stringify(filter)
        ).then((body: ResponseData | ResponseData<SchoolModel[]>) => {
            const recordOptions = ConvertOptionSelectModel(body.data as OptionModel[]);
            return {
                ...body,
                data: recordOptions
            }
        });
    }
    const onChangeProvince = async () => {

        const fieldsValue = await searchForm.validateFields();
        const filter = {
            provinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
        }
        if (!fieldsValue.ProvinceId) {
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
        const response: ResponseData = await getAministrativeDivisions1(fieldsValue.ProvinceId);
        const data = await response.data as ProvinceModel
        const districtOptions = ConvertOptionSelectModel(data.districts as OptionModel[]);

        const stateDispatcher = {
            districts: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(districtOptions),
        }
        dispatch(stateDispatcher)
    };

    const columns: ColumnsType<PaymentHistoryModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 60,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Họ tên',
            width: 180,
            dataIndex: 'fullName',
            render: (_, record) => <span>{record.objectRegistrationRef?.fullName}</span>,
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birthDay',
            width: 120,
            render: (_, record) => <span>{String(record?.objectRegistrationRef?.dayOfBirth).padStart(2, '0')}/{String(record?.objectRegistrationRef?.monthOfBirth).padStart(2, '0')}/{String(record?.objectRegistrationRef?.yearOfBirth).padStart(2, '0')}</span>,
        },
        {
            title: 'Lớp/Khối',
            dataIndex: 'districtName',
            width: 120,
            render: (_, record) => <span>{record.objectRegistrationRef?.class + "/" + record?.objectRegistrationRef?.block}</span>,
        },
        {
            title: 'Trường',
            dataIndex: 'schoolName',
            width: 240,
            render: (_, record) => <span>{record?.objectRegistrationRef?.schoolName}</span>,
        },
        {
            title: 'Cuộc thi',
            dataIndex: 'examName',
            width: 220,
            render: (_, record) => <span>{record?.objectRegistrationRef?.examName}</span>,
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDate',
            width: 220,
            render: (_, record) => <span>{moment(record.transaction?.createdOnDate).format('DD/MM/yyyy HH:mm:ss')}</span>,
        },
        // {
        //     title: 'Vòng thi',
        //     width: 120,
        //     dataIndex: 'round',
        //     render: (_, record) => <span>{record.round === RegistrationRound._1 ? "Vòng 1" : record.round === RegistrationRound._2 ? "Vòng 2" : record.round === RegistrationRound._3 ? "Vòng 3" : ""}</span>,
        // },
        // {
        //     title: 'Họ tên phụ huynh(bố)',
        //     dataIndex: 'fatherName',
        //     width: 260,
        //     render: (_, record) => <span>{record.fatherName}</span>,
        // },
        // {
        //     title: 'Họ tên phụ huynh(mẹ)',
        //     dataIndex: 'motherName',
        //     width: 260,
        //     render: (_, record) => <span>{record.motherName}</span>,
        // },
        {
            title: 'SĐT',
            dataIndex: 'tel',
            width: 160,
            render: (_, record) => <span>{record?.objectRegistrationRef?.tel}</span>,
        },
        {
            title: 'Email',
            width: 280,
            dataIndex: 'email',
            render: (_, record) => <span>{record?.objectRegistrationRef?.email}</span>,
        },
        {
            title: 'Lệ phí',
            dataIndex: 'priceExam',
            width: 180,
            align: 'right',
            render: (_, record) => <span>{record?.objectRegistrationRef?.priceExam?.toLocaleString('vi-VN') ?? ""}</span>,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            width: 160,
            render: (_, record) => <span>{record?.transaction?.status === TransactionStatus._0 ? "Chưa thanh toán" : record?.transaction?.status === TransactionStatus._1 ? "Thành công" : record?.transaction?.status === TransactionStatus._2 ? "Không thành công" : ""}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Permission noNode navigation={layoutCode.toeflChallengeRegistration as string} bitPermission={PermissionAction.View}>
                        {/* <Button type='ghost' size='small' title='Xem chi tiết' loading={buttonLoading[record.transaction?.id as string]} onClick={() => onHandleShowModelViewDetail(record.id as string)}>
                            <EyeOutlined />
                        </Button> */}
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Row gutter={16} justify='start'>
                            <Col span={24} className='gutter-row' style={{ marginBottom: '8px' }}>
                                <Space>
                                    <Permission noNode navigation={layoutCode.toeflChallengeRegistration as string} bitPermission={PermissionAction.Add}>
                                        <Button htmlType='button' type='default' onClick={() => onHandleShowModelCreate()}>
                                            <PlusOutlined />
                                            Tạo mới
                                        </Button>
                                    </Permission>
                                    {/* <Permission noNode navigation={layoutCode.toeflChallengeRegistration as string} bitPermission={PermissionAction.Edit}>
                                        <Button htmlType='button' type='default' onClick={() => onHandleShowImportRegistrationPayments()}>
                                            <ImportOutlined />
                                            Import DS thanh toán
                                        </Button>
                                    </Permission> */}
                                    <Permission noNode navigation={layoutCode.toeflChallengeRegistration as string} bitPermission={PermissionAction.Delete}>
                                        {selectedRowDeleteKeys.length > 0 &&
                                            <Button htmlType='button' danger loading={loadingDelete} type='dashed' onClick={() => multiDeleteRecord()}>
                                                <DeleteOutlined />
                                                Xóa
                                            </Button>
                                        }
                                    </Permission>
                                </Space>
                            </Col>
                            <Col span={24} className='gutter-row'>
                                <Collapse>
                                    <Panel header='Tìm kiếm' key='1'>
                                        <Form
                                            form={searchForm}
                                            name='search'
                                            initialValues={{
                                                ['DayReception']: '',
                                                ['ExamId']: undefined,
                                                ['Rounds']: undefined,
                                                ['IsSelfRegistration']: '',
                                                ['IsUsedForCommunication']: '',
                                                ['ProvinceId']: '',
                                                ['DistrictId']: '',
                                                // ['SchoolId']: '',
                                                ['Block']: '',
                                                ['Class']: '',
                                                ['RegistrationNumber']: '',
                                                ['FullName']: '',
                                                ['Tel']: '',
                                                ['Email']: '',
                                            }}
                                        >
                                            <Row gutter={16} justify='start'>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Cuộc thi'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='ExamId'
                                                    >
                                                        <Select
                                                            placeholder='-Chọn-'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            filterSort={(optionA, optionB) =>
                                                                (optionA?.label ?? '')
                                                                    .toString()
                                                                    .toLowerCase()
                                                                    .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                                            }
                                                            options={state.exams}
                                                        // onChange={() => onChangeProvince()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Ngày tiếp nhận đăng ký'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='DayReception'
                                                    >
                                                        <DatePicker.RangePicker allowClear
                                                            ranges={{
                                                                'Hôm nay': [moment(), moment()],
                                                                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                                                                '7 ngày trước': [moment().add(-7, 'd'), moment()]
                                                            }}
                                                            placeholder={['Từ', 'Đến']}
                                                            locale={locale}
                                                            format="DD/MM/YYYY"
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Vòng thi'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='Rounds'
                                                    >
                                                        <Select
                                                            placeholder='-Chọn-'
                                                            showSearch
                                                            mode='multiple'
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            filterSort={(optionA, optionB) =>
                                                                (optionA?.label ?? '')
                                                                    .toString()
                                                                    .toLowerCase()
                                                                    .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                                            }
                                                            options={state.registrationRounds}
                                                        // onChange={() => onChangeProvince()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Đối tượng'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='IsSelfRegistration'
                                                    >
                                                        <Select
                                                            placeholder='-Chọn-'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            options={state.isSelfRegistration}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Sd hình ảnh để truyền thông'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='IsUsedForCommunication'
                                                    >
                                                        <Select
                                                            placeholder='-Chọn-'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            options={state.isUsedForCommunication}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={16} justify='start'>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Tỉnh/TP'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='ProvinceId'
                                                    >
                                                        <Select
                                                            placeholder='Chọn Tỉnh/TP'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            filterSort={(optionA, optionB) =>
                                                                (optionA?.label ?? '')
                                                                    .toString()
                                                                    .toLowerCase()
                                                                    .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                                            }
                                                            options={state.provinces}
                                                            onChange={() => onChangeProvince()}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Quận/Huyện'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='DistrictId'
                                                    >
                                                        <Select
                                                            placeholder='Chọn'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            filterSort={(optionA, optionB) =>
                                                                (optionA?.label ?? '')
                                                                    .toString()
                                                                    .toLowerCase()
                                                                    .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                                            }
                                                            options={state.districts}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Trường học'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='SchoolId'
                                                    >
                                                        <DebounceSelect
                                                            // mode="multiple"
                                                            showSearch
                                                            allowClear
                                                            placeholder="Chọn trường"
                                                            fetchOptions={onGetSchoolDebounce}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Khối'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='Block'
                                                    >
                                                        <Select
                                                            placeholder='Chọn'
                                                            showSearch
                                                            allowClear
                                                            optionFilterProp='children'
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            options={state.blocks}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Lớp'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='Class'
                                                    >
                                                        <Input
                                                            placeholder='Nhập lớp'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Divider />
                                            <Row gutter={16} justify='start'>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Số báo danh'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='RegistrationNumber'
                                                    >
                                                        <Input
                                                            placeholder='Nhập số báo danh'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Họ tên'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='FullName'
                                                    >
                                                        <Input
                                                            placeholder='Nhập họ tên'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Số điện thoại'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='Tel'
                                                    >
                                                        <Input
                                                            placeholder='Nhập số điện thoại'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Email'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 24 }}
                                                        name='Email'
                                                    >
                                                        <Input
                                                            placeholder='Nhập email'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={24}>
                                                    <Space>
                                                        <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                                                            Tìm kiếm
                                                        </Button>
                                                        <Button htmlType='button' onClick={() => searchForm.resetFields()}>
                                                            Làm lại
                                                        </Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                    </>
                }
                extra={<div></div>}
            >
                <Table
                    rowKey={(record) => record.transaction?.id as string}
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            getList(page, pageSize);
                        },
                        showTotal
                    }}
                    // rowSelection={{
                    //     selectedRowKeys: selectedRowDeleteKeys,
                    //     onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
                    // }}
                    scroll={{ x: '100vw', y: '460px' }}
                />
            </Card>

            {/* {showModelRegistrationPayment && (
                <RegistrationPaymentTFC
                    open={showModelRegistrationPayment}
                    setOpen={setShowModelRegistrationPayment}
                    reload={searchFormSubmit}
                    recordEdit={state.recordView}
                />
            )}
             */}
        </div>
    );
}

export default PaymentHistoryTFC;
