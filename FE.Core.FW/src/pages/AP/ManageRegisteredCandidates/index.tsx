import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Row,
    Table,
    Image,
    Tabs,
    Select,
    PaginationProps,
    Modal,
    Checkbox,
    Dropdown,
    MenuProps,
    Typography,
    Space,
    Tooltip,
    Menu,
    Spin,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleAPModel, ExamScheduleTopikModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';

import {
    ConvertAreaOption,
    ConvertCountryOptionModel,
    ConvertDistrictOptionModel,
    ConvertExamOptionModel,
    ConvertExamRoomOptionModel,
    ConvertExamScheduleOptionModel,
    ConvertExamShiftOptionModel,
    ConvertHeaderQuarterOptionModel,
    ConvertIntToCurrencyFormat,
    ConvertLanguageOptionModel,
    ConvertOptionSelectModel,
    ConvertProvinceOptionModel,
    ConvertWardOptionModel,
    SumPriceString,
    getAcessHeaderQuater,
    getAreaByAcessHeaderQuater,
} from '@/utils/convert';
import {
    ExamModel,
    HeadQuarterModel,
    SelectOptionModel,
    AreaModel,
    ProfileCatalogModel,
    DistrictModel,
    WardModel,
    ExamRoomModel,
    ExportFileModel,
    CountryModel,
    LanguageModel,
    ExamPeriodResponse,
    OptionModel,
    ExamWorkShiftModel,
    UpdateManageRegisteredCandidateAPAdminModel
} from '@/apis/models/data';
import {
    getExam,
    getExamWorkShift,
} from '@/apis/services/PageService';
import {
    exportExcelRegisteredCandidateTopik,
    getManageRegisteredCandidateTopikById,
    putManageRegisteredCandidateTopik,
} from '@/apis/services/ManageRegisteredCandidateTopikService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import React from 'react';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { getExamPeriodAp } from '@/apis/services/ExamPeriodApService';
import { exportExcel, getManageRegisteredCandidateAp, getManageRegisteredCandidateApById, putManageRegisteredCandidateAp } from '@/apis/services/ManageRegisteredCandidateApService';
import UpdateForm from './UpdateForm';
import { getExamScheduleAp } from '@/apis/services/ExamScheduleApService';

const { Panel } = Collapse;
var manageRegisteredCandidates: UpdateManageRegisteredCandidateAPAdminModel[] = [];
var examPeriodOption: SelectOptionModel[] = [];
var examSelect: SelectOptionModel[] = [];
var examWorkShift: SelectOptionModel[] = [];
var exams: ExamModel[] = [];
var examScheduleAp: ExamScheduleAPModel[] = [];

function App() {
    // Load
    const [loading, setLoading] = useState<boolean>(false);
    const [examScheduleTemp, setExamScheduleTemp] = useState<SelectOptionModel[]>();
    const [examScheduleO, setExamScheduleO] = useState<ExamScheduleTopikModel[]>([]);
    const [examPeriodValue, setExamPeriodValue] = useState<string>();
    const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
    const [list, setList] = useState<UpdateManageRegisteredCandidateAPAdminModel[]>([]);
    const [pagination, setPagination] = useState<PaginationConfig>({
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
    });

    const getList = async (current: number, pageSize: number = 10): Promise<void> => {
        setLoading(true);
        const responseExam: ResponseData = await getExam();
        const responseExamShift: ResponseData = await getExamWorkShift();
        const responseExamScheduleAp: ResponseData = await getExamScheduleAp();
        examScheduleAp = responseExamScheduleAp.data as ExamScheduleAPModel[];
        examWorkShift = ConvertExamShiftOptionModel(responseExamShift.data as ExamWorkShiftModel[]);
        exams = responseExam.data as ExamModel[]
        examSelect = ConvertOptionSelectModel<OptionModel>(responseExam.data as OptionModel[]);
        const responseExamPeriod: ResponseData = await getExamPeriodAp();
        examPeriodOption = ConvertOptionSelectModel(responseExamPeriod.data as ExamPeriodResponse[]);
        var examPeriods = responseExamPeriod.data as ExamPeriodResponse[]
        const response: ResponseData = await getManageRegisteredCandidateAp(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        manageRegisteredCandidates = (response.data || []) as UpdateManageRegisteredCandidateAPAdminModel[];
        setList((response.data || []) as UpdateManageRegisteredCandidateAPAdminModel[]);
        setPagination({
            ...pagination,
            current,
            total: response.totalCount || 0,
            pageSize: pageSize,
        });

        setLoading(false);
    };
    useEffect(() => {
        getList(1);
    }, []);

    const [ticketLoading, setTicketLoading] = useState<string[]>([]);
    const [visibleTicket, setVisibleTicket] = useState<boolean>(false);
    const [printData, setPrintData] = useState<string>();
    const printTicket = async (value: UpdateManageRegisteredCandidateAPAdminModel) => {
        setTicketLoading([value.id as string]);
        const header = {
            'apikey': import.meta.env.VITE_APIKEY,
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
        await fetch(import.meta.env.VITE_SERVER_BE + '/ManageRegisteredCandidateTopik/ExportPdfTicket?id=' + value.id as string, { method: "GET", headers: header })
            .then(response => {
                response.blob().then(blob => {
                    let url = window.URL.createObjectURL(blob);
                    const pdfWindow: Window = window.open() as Window;
                    pdfWindow.location.href = url;
                    // let a = document.createElement('a');
                    // a.href = url;
                    // a.download = value.userInfo?.fullName + `.pdf`;
                    // a.click();
                    setPrintData(url as string)
                    // setVisibleTicket(true)
                });
            });
        setTicketLoading([]);
    };

    const printTicketsss = async (id: string, lang: string) => {
        setTicketLoading([id as string]);
        setShowSpin(true)
        const header = {
            'apikey': import.meta.env.VITE_APIKEY,
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
        await fetch(import.meta.env.VITE_SERVER_BE + '/ManageRegisteredCandidateTopik/GetPdfTicket?id=' + id + '&language=' + lang, { method: "GET", headers: header })
            .then(response => {
                response.blob().then(blob => {
                    let url = window.URL.createObjectURL(blob);
                    const pdfWindow: Window = window.open() as Window;
                    pdfWindow.location.href = url;
                    setPrintData(url as string)
                });
            });
        setTicketLoading([]);
        setShowSpin(false)
    };
    const antIcon = <LoadingOutlined style={{ fontSize: 70 }} spin />;
    type MenuItem = Required<MenuProps>['items'][number];
    function getItem(
        label: React.ReactNode,
        key?: React.Key | null,
        icon?: React.ReactNode,
        children?: MenuItem[],
        type?: 'group',
    ): MenuItem {
        return {
            key,
            icon,
            children,
            label,
            type,
        } as MenuItem;
    }
    const items: MenuItem[] = [
        getItem('In phiếu', 'sub', null, [
            getItem('vi', 'vi'),
            getItem('en', 'en'),
            getItem('ko', 'ko'),
        ]),
    ];

    // Data
    const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
    const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
    const [viewDetailVisible, setViewDetailVisible] = useState<boolean>(false);
    const [showSpin, setShowSpin] = useState<boolean>(false);
    const [updateData, setUpdateData] = useState<Partial<UpdateManageRegisteredCandidateAPAdminModel>>({});
    const [viewData, setViewData] = useState<Partial<UpdateManageRegisteredCandidateAPAdminModel>>({});
    const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
    const [viewDetailLoading, setViewDetailLoading] = useState<string[]>([]);
    const detailUpdateData = async (dataInput: UpdateManageRegisteredCandidateAPAdminModel) => {
        setDetailUpdateLoading([dataInput.id as string]);
        setUpdateData({
            ...dataInput,
        });
        setUpdateFormVisible(true);
        setDetailUpdateLoading([]);
    };

    const updataFormCancel = async () => {
        setUpdateData({});
        setUpdateFormVisible(false);
    };

    const updateSubmit = async (values: any) => {
        setUpdateSubmitLoading(true);
        const res = await putManageRegisteredCandidateAp(undefined, values);
        if (res.code == Code._200) {
            updataFormCancel();
            message.success('Thành công !');
            searchFormSubmit(pagination.current);
        } else {
            message.error(res.message);
        }
        setUpdateSubmitLoading(false);
    };

    // searchForm
    const [exportExcelLoading, setExportExcelLoading] = useState<boolean>(false);
    const [searchForm] = Form.useForm();
    const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
        try {
            setLoading(true);
            const fieldsValue = await searchForm.validateFields();

            const response: ResponseData = await getManageRegisteredCandidateAp(
                fieldsValue.examPeriodId,
                fieldsValue.examScheduleId,
                fieldsValue.examId,
                fieldsValue.idNumber,
                fieldsValue.sbd,
                fieldsValue.fullname != undefined ? fieldsValue.fullname.trim() : undefined,
                fieldsValue.email != undefined ? fieldsValue.email.trim() : undefined,
                fieldsValue.phone,
                current,
                pageSize,
            );
            manageRegisteredCandidates = (response.data || []) as UpdateManageRegisteredCandidateAPAdminModel[];
            setList((response.data || []) as UpdateManageRegisteredCandidateAPAdminModel[]);
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

    const onChangeExamPeriod = async (id: string) => {
        const data = examScheduleO.filter((item: ExamScheduleTopikModel) => {
            return item.examPeriodId == id;
        });
        setExamScheduleTemp(ConvertExamScheduleOptionModel(data));
    };

    // const onChangeArea = async (id: string) => {
    //     const placeTemp = headQuarter.filter((item: SelectOptionModel) => {
    //         return item.parrentId == id;
    //     });
    //     setPlaceTestC(placeTemp);
    // };

    const resetForm = async () => {
        searchForm.resetFields();
        // setPlaceTestC(headQuarter);
    };

    const exportExcels = async (): Promise<void> => {
        try {
            setExportExcelLoading(true);
            const fieldsValue = await searchForm.validateFields();
            const response: ResponseData = await exportExcel(
                fieldsValue.examPeriodId,
                fieldsValue.examScheduleId,
                fieldsValue.examId,
                fieldsValue.idNumber,
                fieldsValue.sbd,
                fieldsValue.fullname != undefined ? fieldsValue.fullname.trim() : undefined,
                fieldsValue.email != undefined ? fieldsValue.email.trim() : undefined,
                fieldsValue.phone
            );
            if (response.code == Code._200) {
                const res = response.data as ExportFileModel;
                window.location.href = import.meta.env.VITE_HOST + res.fileName;
            } else {
                message.error(response.message || 'Thất bại');
            }
            setExportExcelLoading(false);
        } catch (error: any) {
            console.log(error);
        }
    };

    const columns: ColumnsType<UpdateManageRegisteredCandidateAPAdminModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            render: (_, record) => <span>{record.firstName + " " + record.lastName}</span>,
        },
        {
            title: 'SĐT',
            dataIndex: 'sdt',
            render: (_, record) => <span>{record.phone}</span>,
        },
        {
            title: 'Bài thi',
            dataIndex: 'examName',
            render: (_, record) => <span>{record.examName}</span>,
        },
        {
            title: 'SBD(AP ID)',
            dataIndex: 'sbd',
            render: (_, record) => <span>{record.sbd}</span>,
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'dateRegister',
            render: (_, record) => (
                <span>{record.createdOnDate}</span>
            ),
        },
        {
            title: 'Lệ phí',
            dataIndex: 'price',
            render: (_, record) => <span>{record.price.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <>
                    <Permission noNode navigation={layoutCode.manageRegisteredCandidateAP as string} bitPermission={PermissionAction.Edit}>
                        <Button
                            type='link'
                            loading={detailUpdateLoading.includes(record.id || '')}
                            onClick={() => detailUpdateData(record)}
                        >
                            Sửa
                        </Button>
                    </Permission>
                </>
            ),
        },
    ];

    return (
        <div className='layout-main-conent'>
            <Modal closable={false} style={{ backgroundColor: 'transparent', textAlign: 'center' }} footer={null} open={showSpin}>
                <Spin style={{ display: 'inline', left: '50%' }} size='large' indicator={antIcon} />
            </Modal>
            <Card
                bordered={false}
                title={
                    <Collapse>
                        <Panel header='Tìm kiếm' key='1'>
                            <Form form={searchForm} name='search'>
                                <Row gutter={24} justify='end'>
                                    <Col span={5}>
                                        <Form.Item label={'Kỳ thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='examPeriodId'>
                                            <Select placeholder='Chọn kỳ thi' options={examPeriodOption} defaultValue={examPeriodValue} onChange={onChangeExamPeriod} />
                                        </Form.Item>
                                        <Form.Item label={'Họ và tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='fullname'>
                                            <Input placeholder='Nhập họ tên' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='examScheduleId'>
                                            <Select placeholder='Chọn lịch thi' options={examPeriodOption} defaultValue={examPeriodValue} onChange={onChangeExamPeriod} />
                                        </Form.Item>
                                        <Form.Item label={'Email đăng ký tài khoản'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='email'>
                                            <Input placeholder='Nhập email' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item label={'Bài thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='examId'>
                                            <Select placeholder='Chọn bài thi' options={examSelect} />
                                        </Form.Item>
                                        <Form.Item label={'Số điện thoại'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='phone'>
                                            <Input placeholder='Nhập số điện thoại' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item label={'Số báo danh'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='sbd'>
                                            <Input placeholder='Nhập số báo danh' />
                                        </Form.Item>
                                        <Form.Item label={'CCCD/CMND/HC'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='idNumber'>
                                            <Input placeholder='Nhập CCCD/CMND/HC' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Row>
                                            <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                                                Tìm kiếm
                                            </Button>
                                        </Row>
                                        <Row>
                                            <Button type='primary' style={{ marginTop: 8 }} loading={exportExcelLoading} htmlType='submit' onClick={() => exportExcels()}>
                                                Xuất excel
                                            </Button>
                                        </Row>
                                        <Row>
                                            <Button htmlType='button' style={{ marginTop: 8 }} onClick={() => resetForm()}>
                                                Làm lại
                                            </Button>
                                        </Row>


                                    </Col>
                                </Row>
                            </Form>
                        </Panel>
                    </Collapse>
                }
                extra={<div></div>}
            >
                <Table
                    rowKey='id'
                    size='small'
                    columns={columns}
                    dataSource={list}
                    loading={loading}

                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            searchFormSubmit(page, pageSize);
                        },
                        showTotal,
                    }}
                />
            </Card>

            {updateFormVisible && Object.keys(updateData).length > 0 ? (
                <UpdateForm
                    values={updateData}
                    onCancel={() => updataFormCancel()}
                    visible={updateFormVisible}
                    onSubmit={updateSubmit}
                    onSubmitLoading={updateSubmitLoading}
                    examWorkShifts={examWorkShift}
                    exams={exams}
                    examPeriod={examPeriodOption}
                    examScheduleAp={examScheduleAp}
                />
            ) : null}
        </div>
    );
}

export default App;
