import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Form,
    Row,
    Table,
    Select,
    Space,
    message,
    Modal,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { StatisticalRegisterTopikModel, getStatisticalRegisterTopikSearch } from '@/apis/models/StatisticalRegisterTopikModel';
import { ColumnsType } from 'antd/lib/table';

import {
    ConvertAreaOption,
    ConvertHeaderQuarterOptionModel,
    ConvertOptionSelectModel,
} from '@/utils/convert';
import { HeadQuarterModel, SelectOptionModel, ServiceAlongExamModel, AreaModel } from '@/apis/models/data';
import { getArea, getHeadQuarter } from '@/apis/services/PageService';
import { Tag } from 'antd';
import { exportStatisticalRegisterTopik, getStatisticalRegisterTopik } from '@/apis/services/StatisticalRegisterTopikService';
import { getExamScheduleTopik } from '../../../apis/services/ExamScheduleTopikService';
import { ConvertExamScheduleOptionModel } from '../../../utils/convert';
import { ExamScheduleTopikModel } from '../../../apis/models/ExamScheduleTopikModel';
import { useNavigate } from 'react-router-dom';
import { getExamPeriod } from '@/apis/services/ExamPeriodService';
import { ExamPeriodResponse } from '@/apis/models/data';
import { Code } from '@/apis';
import { ExportOutlined } from '@ant-design/icons';
import { checkFileCanDown, checkFileSatisticCanDown, exportExcelTotalCandidate, exportExcellSatisticExamPeriod } from '@/apis/services/ManageRegisteredCandidateTopikService';
import { TypeCheckCandownFile } from '@/utils/constants';
import { ExportFileModel } from '@/apis/models/data';

const { Panel } = Collapse;
var area: SelectOptionModel[] = [];
var examinations: SelectOptionModel[] = [];
var examPeriodOption: SelectOptionModel[] = [];
var statisticalRegisterTopikModels: StatisticalRegisterTopikModel[] = [];

function App() {
    // Load
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [examPeriod, setExamPeriod] = useState<string>();
    const [list, setList] = useState<StatisticalRegisterTopikModel[]>([]);
    const [headQuarter, setHeadQuarter] = useState<SelectOptionModel[]>([]);
    const [examScheduleO, setExamScheduleO] = useState<ExamScheduleTopikModel[]>([]);
    const [examScheduleTemp, setExamScheduleTemp] = useState<SelectOptionModel[]>();
    const [examPeriodValue, setExamPeriodValue] = useState<string>();
    const [visibleExportQuantity, setVisibleExportQuantity] = useState<boolean>(false);
    const [visibleExportExamRoom, setVisibleExportExamRoom] = useState<boolean>(false);
    const [linkDown, setLinkDown] = useState<string>();
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [buttonDown, setButtonDown] = useState<boolean>(true);
    const [buttonExport, setButtonExport] = useState<boolean>(true);
    const [buttonWaiting, setButtonWaiting] = useState<boolean>(true);
    const [linkDownModelExamRool, setLinkDownModelExamRool] = useState<string>();
    const [buttonLoadingModelExamRool, setButtonLoadingModelExamRool] = useState<boolean>(false);
    const [buttonDownModelExamRool, setButtonDownModelExamRool] = useState<boolean>(true);
    const [buttonExportModelExamRool, setButtonExportModelExamRool] = useState<boolean>(true);
    const [buttonWaitingModelExamRool, setButtonWaitingModelExamRool] = useState<boolean>(true);
    const [pagination, setPagination] = useState<PaginationConfig>({
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
    });
    const [loadingExport, setLoadingExport] = useState<boolean>(false);

    const [searchForm] = Form.useForm();
    const [exportForm] = Form.useForm();
    const statusProfile: SelectOptionModel[] = [
        {
            key: '1',
            label: 'Đang mở',
            value: '0',
        },
        {
            key: '2',
            label: 'Đã đóng',
            value: '1',
        },
    ];

    const getListFilter = async (): Promise<void> => {
        // setLoading(true);
        const response: ResponseData = await getStatisticalRegisterTopik();
        statisticalRegisterTopikModels = (response.data || []) as StatisticalRegisterTopikModel[];
        const responseExamPeriod: ResponseData = await getExamPeriod();
        examPeriodOption = ConvertOptionSelectModel(responseExamPeriod.data as ExamPeriodResponse[]);
        var examPeriods = responseExamPeriod.data as ExamPeriodResponse[]
        const getD = examPeriods.find(p => p.isCurrent as boolean) as ExamPeriodResponse
        setExamPeriodValue(getD != null ? getD.id : '')
        const responseExaminationTopik: ResponseData = await getExamScheduleTopik();
        const responseCheckFileStatus: ResponseData = await checkFileSatisticCanDown((responseExaminationTopik.data as ExamScheduleTopikModel[])[0].examPeriodId, TypeCheckCandownFile.StatusOfApplicants);
        showHideButton(TypeCheckCandownFile.StatusOfApplicants, responseCheckFileStatus)
        const responseCheckFileModelExamRoom: ResponseData = await checkFileSatisticCanDown((responseExaminationTopik.data as ExamScheduleTopikModel[])[0].examPeriodId, TypeCheckCandownFile.ModelExamRoom);
        showHideButton(TypeCheckCandownFile.ModelExamRoom, responseCheckFileModelExamRoom)
        setExamPeriod((responseExaminationTopik.data as ExamScheduleTopikModel[])[0].examPeriodId)
        examinations = ConvertExamScheduleOptionModel(responseExaminationTopik.data as ExamScheduleTopikModel[]);
        const eSData = responseExaminationTopik.data as ExamScheduleTopikModel[]
        setExamScheduleO(eSData)
        setExamScheduleTemp(ConvertExamScheduleOptionModel(eSData.filter((item: ExamScheduleTopikModel) => {
            return item.examPeriodId == getD.id
        })))
        // setList((response.data || []) as StatisticalRegisterTopikModel[]);
        // setPagination({
        //     ...pagination,
        //     current,
        //     total: response.totalCount || 0,
        //     pageSize: pageSize,
        // });
        // setLoading(false);
    };

    const onChangeExamPeriod = async (id: string) => {
        const data = examScheduleO.filter((item: ExamScheduleTopikModel) => {
            return item.examPeriodId == id;
        });
        searchForm.setFieldValue("examScheduleId", null);
        setExamScheduleTemp(ConvertExamScheduleOptionModel(data));
    };

    const getDataArea = async () => {
        const responseArea: ResponseData = await getArea();
        area = ConvertAreaOption(responseArea.data as AreaModel[]);
    }

    const getDataHeadQuarter = async (areaId?: string) => {
        const responseHeadQuarter: ResponseData = await getHeadQuarter(areaId);
        var headQuarter = ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]);
        setHeadQuarter(headQuarter);
    }

    const onChangeArea = async (value: string) => {
        getDataHeadQuarter(value);
        searchForm.setFieldValue("placeTest", null);
    }

    const submitSearch = async (value: getStatisticalRegisterTopikSearch, current: number = 1, pageSize: number = 10) => {
        const fieldsValue = await searchForm.validateFields();
        const { areaTest, placeTest, examScheduleId, status, examPeriodId } = fieldsValue;
        setLoading(true);
        const response: ResponseData = await getStatisticalRegisterTopik(areaTest, placeTest, examScheduleId, status, fieldsValue.examPeriodId);
        const statisticalRegisterTopikModels = (response.data || []) as StatisticalRegisterTopikModel[];
        setList(statisticalRegisterTopikModels);
        setPagination({
            ...pagination,
            current,
            total: statisticalRegisterTopikModels?.length ?? 0,
            pageSize: pageSize,
        });
        setLoading(false);
    }

    const handleResetSearch = async () => {
        searchForm.resetFields();
        submitSearch({});
    }

    useEffect(() => {
        getListFilter();
        submitSearch({});
        getDataArea();
        getDataHeadQuarter();
    }, []);

    /**
     * Xuất báo cáo thống kê theo mẫu
     */
    const onHandleExportExcelRegisterCandidate = async () => {
        setLoadingExport(true);
        const fieldsValue = await searchForm.validateFields();
        const { areaTest, placeTest, examScheduleId, status, examPeriodId } = fieldsValue;
        const response = await exportStatisticalRegisterTopik(areaTest, placeTest, examScheduleId, status, examPeriodId)
        if (response.code == Code._200) {
            window.location.href = import.meta.env.VITE_HOST + "/" + response.data;
            setLoadingExport(false);
        }
        else {
            message.error(response.message || "Xuất file thất bại");
            setLoadingExport(false);
        }
    }
    const onExportFile = async () => {
        setButtonLoading(true);
        setButtonWaiting(false)
        setButtonExport(true)
        setButtonDown(true)
        const response = await exportExcelTotalCandidate(examPeriod);
        if (response.code == Code._200) {
            const res = response.data as ExportFileModel;
            window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
            setVisibleExportQuantity(false);
        } else {
            message.error(response.message || 'Tạo thất bại');
        }
        setButtonLoading(false);
        setButtonWaiting(true)
        setButtonExport(false)
        setButtonDown(true)
    };
    const onExportFileModelExamRoom = async () => {
        setButtonLoading(true);
        setButtonWaiting(false)
        setButtonExport(true)
        setButtonDown(true)
        const response = await exportExcellSatisticExamPeriod(examPeriod);
        if (response.code == Code._200) {
            const res = response.data as ExportFileModel;
            window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
            setVisibleExportExamRoom(false);
        } else {
            message.error(response.message || 'Tạo thất bại');
        }
        setButtonLoading(false);
        setButtonWaiting(true)
        setButtonExport(false)
        setButtonDown(true)
    };
    const onDownFile = async () => {
        setButtonLoading(true);
        window.location.href = import.meta.env.VITE_HOST + linkDown as string;
        setButtonLoading(false);
    };
    const showHideButton = async (type: number, response: ResponseData) => {
        setLinkDown(undefined)
        if (response.code == Code._200) {

            switch (response.data) {
                case 1:
                    if (type == TypeCheckCandownFile.StatusOfApplicants) {
                        setButtonDown(false)
                        setButtonExport(false)
                        setButtonWaiting(true)
                        setLinkDown(response.message)
                    } else if (type == TypeCheckCandownFile.ModelExamRoom) {
                        setButtonDownModelExamRool(false)
                        setButtonExportModelExamRool(false)
                        setButtonWaitingModelExamRool(true)
                        setLinkDownModelExamRool(response.message)
                    }
                    break;
                case 2:
                    if (type == TypeCheckCandownFile.StatusOfApplicants) {
                        setButtonWaiting(false)
                        setButtonExport(true)
                        setButtonDown(true)
                    } else if (type == TypeCheckCandownFile.ModelExamRoom) {
                        setButtonWaitingModelExamRool(false)
                        setButtonExportModelExamRool(true)
                        setButtonDownModelExamRool(true)
                    }
                    break;
                case 3:
                    if (type == TypeCheckCandownFile.StatusOfApplicants) {
                        setButtonExport(false)
                        setButtonDown(true)
                        setButtonWaiting(true)
                    } else if (type == TypeCheckCandownFile.ModelExamRoom) {
                        setButtonExportModelExamRool(false)
                        setButtonDownModelExamRool(true)
                        setButtonWaitingModelExamRool(true)
                    }
                    break;
                case 4:
                    if (type == TypeCheckCandownFile.StatusOfApplicants) {
                        setButtonExport(false)
                    } else if (type == TypeCheckCandownFile.ModelExamRoom) {
                        setButtonExportModelExamRool(false)
                    }
                    message.error(response.message || 'Không tìm thấy kỳ thi');
                    break;
            }
        } else {
            message.error(response.message || 'Thất bại');
        }
    };
    const onDownFileModelExamRoom = async () => {
        setButtonLoading(true);
        window.location.href = import.meta.env.VITE_HOST + linkDownModelExamRool as string;
        setButtonLoading(false);
    };
    const onHandleShowModalExport = async () => {
        setVisibleExportQuantity(true);
    };
    const onHandleShowModalExportExamRoom = async () => {
        setVisibleExportExamRoom(true);
    };
    const onChangeExamShedule = async (type: number) => {
        setLinkDown(undefined)
        const fieldsValue = await exportForm.validateFields();
        const response = await checkFileCanDown(fieldsValue.TestScheduleTopikId, type);
        if (response.code == Code._200) {

            setButtonDown(false)
            setButtonExport(false)
            setButtonWaiting(true)
            setLinkDown(response.message)
        } else {
            message.error(response.message || 'Thất bại');
        }
    };

    const columns: ColumnsType<StatisticalRegisterTopikModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Khu vực',
            dataIndex: 'areaName',
        },
        {
            title: 'Địa điểm thi',
            dataIndex: 'headQuaterName',
        },
        {
            title: 'Kỳ thi',
            dataIndex: 'examinationName',
        },
        {
            title: 'Đã đăng ký',
            dataIndex: 'totalQuantity',
        },
        {
            title: 'Tổng số',
            dataIndex: 'maxQuantity',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (_, record) => {
                if (record.status == 0) {
                    return <Tag color='blue'>Đang mở</Tag>;
                }
                return <Tag color='red'>Đã khóa</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 200,
            render: (_, record) => (
                <>
                    <Button
                        onClick={() => navigate('/topik/dividing-exam-room')}
                    >
                        Sắp phòng thi
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className='layout-main-conent'>
            <Card
                bordered={false}
                title={
                    <>
                        <Row gutter={16} justify='start'>
                            <Col span={24} className='gutter-row' style={{ marginBottom: '8px' }}>
                                <Space>
                                    <Button htmlType='button' type='default' onClick={() => onHandleShowModalExport()}>
                                        <ExportOutlined />
                                        <label>Xuất thông tin tình hình đăng ký</label>
                                    </Button>
                                    <Button htmlType='button' type='default' onClick={() => onHandleShowModalExportExamRoom()}>
                                        <ExportOutlined />
                                        <label>Xuất thông tin bố trí phòng thi</label>
                                    </Button>
                                </Space>
                            </Col>
                            <Col span={24} className='gutter-row'>
                                <Collapse>
                                    <Panel header='Tìm kiếm' key='1'>
                                        <Form
                                            form={searchForm}
                                            name='search'
                                            onFinish={submitSearch}
                                            initialValues={{
                                                areaTest: null,
                                                placeTest: null,
                                                examPeriodId: examPeriodValue,
                                                examScheduleId: null,
                                                status: null,
                                            }}
                                        >
                                            <Row gutter={24} justify='start'>
                                                <Col span={4}>
                                                    <Form.Item label={'Khu vực'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='areaTest'>
                                                        <Select placeholder='Chọn khu vực' options={area} onChange={(e) => onChangeArea(e)} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={'Địa điểm thi'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 17 }}
                                                        name='placeTest'
                                                    >
                                                        <Select placeholder='Chọn địa điểm' options={headQuarter} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item label={'Kỳ thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='examPeriodId'>
                                                        <Select placeholder='Chọn kỳ thi' options={examPeriodOption} onChange={onChangeExamPeriod} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='examScheduleId'>
                                                        <Select placeholder='Chọn lịch thi' options={examScheduleTemp} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item label={'Trạng thái'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='status'>
                                                        <Select placeholder='Chọn trạng thái' options={statusProfile} />
                                                    </Form.Item>
                                                </Col>

                                            </Row>
                                            <Row gutter={24} justify='start'>
                                                <Col span={12}>
                                                    <Form.Item label={'Thao tác'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }}>
                                                        <Button type='primary' htmlType='submit'>
                                                            Tìm kiếm
                                                        </Button>
                                                        <Button type='primary' loading={loadingExport} style={{ marginLeft: 8 }} onClick={onHandleExportExcelRegisterCandidate}>
                                                            Xuất excel
                                                        </Button>
                                                        <Button htmlType='button' style={{ marginLeft: 8 }} onClick={handleResetSearch}>
                                                            Làm lại
                                                        </Button>
                                                    </Form.Item>
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
                    rowKey='id'
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            submitSearch({}, page, pageSize);
                        },
                    }}
                />
            </Card>

            <Modal
                destroyOnClose
                width={'40%'}
                maskClosable={false}
                title='Xuất tình hình đăng ký thi'
                open={visibleExportQuantity}
                onCancel={() => setVisibleExportQuantity(false)}
                footer={[
                    <Button key='submit' type='primary' htmlType='submit' hidden={buttonDown} loading={buttonLoading} onClick={() => onDownFile()}>
                        Tải file
                    </Button>,
                    <Button key='submit' type='primary' htmlType='submit' loading={buttonLoading} hidden={buttonExport} onClick={() => onExportFile()}>
                        Xuất danh sách
                    </Button>,
                    <Button key='submit' type='primary' htmlType='submit' hidden={buttonWaiting} loading={true} >
                        Đang tạo file
                    </Button>
                ]}
            >
            </Modal>
            <Modal
                destroyOnClose
                width={'40%'}
                maskClosable={false}
                title='Xuất bố trí phòng thi'
                open={visibleExportExamRoom}
                onCancel={() => setVisibleExportExamRoom(false)}
                footer={[
                    <Button key='submit' type='primary' htmlType='submit' hidden={buttonDownModelExamRool} loading={buttonLoadingModelExamRool} onClick={() => onDownFileModelExamRoom()}>
                        Tải file
                    </Button>,
                    <Button key='submit' type='primary' htmlType='submit' loading={buttonLoadingModelExamRool} hidden={buttonExportModelExamRool} onClick={() => onExportFileModelExamRoom()}>
                        Xuất danh sách
                    </Button>,
                    <Button key='submit' type='primary' htmlType='submit' hidden={buttonWaitingModelExamRool} loading={true} >
                        Đang tạo file
                    </Button>
                ]}
            >
            </Modal>
        </div>
    );
}

export default App;
