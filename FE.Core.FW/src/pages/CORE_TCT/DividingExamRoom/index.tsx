import { useEffect, useReducer, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  message,
  Modal,
  Row,
  Table,
  Select,
  Space,
  Typography,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel, ManageApplicationTimeModel, UserReceiveEmailTestModel } from '@/apis';
import dayjs from 'dayjs';

import {
  ConvertAreaOption,
  ConvertExamOptionModel,
  ConvertExamScheduleOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertOptionSelectModel,
} from '@/utils/convert';
import { ExamModel, HeadQuarterModel, SelectOptionModel, ServiceAlongExamModel, AreaModel, ExportFileModel, ExamPeriodResponse } from '@/apis/models/data';
import { getArea, getExam, getHeadQuarter, getServiceAlongExam } from '@/apis/services/PageService';
import styles from '@/assets/css/index.module.less';
import { getQueryList, deleteDividingRoom, sendMailCandidates } from '@/apis/services/DividingExamPlaceService';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { DividingExamPlaceModel } from '@/apis/models/DividingExamPlaceModel';
import { useNavigate } from 'react-router-dom';
import { checkFileCanDown, exportDataTestSchedule, exportDataTestScheduleByHeadQuarter, exportImageAvatarByTestSchedule, exportImageByHeadquarter } from '@/apis/services/ManageRegisteredCandidateTopikService';
import { ExportOutlined, HddOutlined, LoadingOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import CreateDividingExamRoom from './CreateDividingExamRoom';
import SearchCandidate from './search-candidate';
import { getExamPeriod } from '@/apis/services/ExamPeriodService';
import { PermissionAction, TypeCheckCandownFile, layoutCode } from '@/utils/constants';
import Permission from '@/components/Permission';
var headQuarterOption: SelectOptionModel[] = [];
function DividingExamRoom() {
  const navigate = useNavigate();
  // Load
  const { Panel } = Collapse;
  const initState = {
    examPeriodCurrent: {},
    area: [],
    exam: [],
    userReceiveMails: [],
    headQuarter: [],
    examSchedule: [],
    examPeriods: [],
    isSendMail: [
      {
        value: '0',
        label: 'Tất cả',
        key: '0',
      },
      {
        value: '1',
        label: 'Đã gửi',
        key: '1',
      },
      {
        value: '2',
        label: 'Chưa gửi',
        key: '2',
      },
    ],
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<DividingExamPlaceModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const { Title, Paragraph, Text, Link } = Typography;
  const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
    (prevState: any, updatedProperty: any) => ({
      ...prevState,
      ...updatedProperty,
    }),
    initState,
  );

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    searchFormSubmit(current, pageSize);
    setLoading(false);
  };
  useEffect(() => {
    const fnGetInitState = async () => {
      const responseArea: ResponseData = await getArea();
      const responseExam: ResponseData = await getExam();
      const responseHeadQuarter: ResponseData = await getHeadQuarter();

      const area = ((responseArea.data as AreaModel[]) ?? []).filter((item: AreaModel) => {
        return item.isTopik;
      });
      const headQuarter = ((responseHeadQuarter.data as HeadQuarterModel[]) ?? []).filter((item: HeadQuarterModel) => {
        return item.isTopik;
      });
      const responseExamPeriod: ResponseData = await getExamPeriod();
      const examPeriodOption = ConvertOptionSelectModel(responseExamPeriod.data as ExamPeriodResponse[]);
      const examPeriodCurrent = (responseExamPeriod.data as ExamPeriodResponse[] ?? []).find((item: ExamPeriodResponse) => item.isCurrent)
      const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik("", undefined, undefined, examPeriodCurrent?.id);
      const stateDispatcher = {
        examPeriodCurrent: examPeriodCurrent,
        examSchedule: ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]),
        headQuarter: ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[]),
        area: ConvertAreaOption(area as AreaModel[]),
        exam: ConvertExamOptionModel(responseExam.data as ExamModel[]),
        examPeriods: examPeriodOption
      };
      headQuarterOption = ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[])
      dispatch(stateDispatcher);
    }
    fnGetInitState()
    getList(1);
  }, []);

  const sendMail = (dividingExamPlaceId: string, isSendMail: number, examPlaceName: string) => {
    Modal.confirm({
      title: 'Xác nhận gửi mail',
      content: isSendMail == 1
        ? `Email đã được gửi đến tất cả thí sinh thuộc địa điểm thi ${examPlaceName}, có muốn tiếp tục gửi.`
        : `Gửi email đến tất cả thí sinh thuộc địa điểm thi ${examPlaceName}`,
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        const res = await sendMailCandidates(dividingExamPlaceId);
        if (res.code == Code._200) {
          message.success(res.message ?? 'Gửi mail thành công !');
        } else {
          message.error(res.message);
        }
      },
    });
  };

  const deleteRecord = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: `Xác nhận xóa bản ghi này?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        await onHandleDeleteDividingRoom(id);
      },
    });
  };

  // Data
  const [showModelDividingExamRoomVisible, setShowModelDividingExamRoomVisible] = useState<boolean>(false);
  const [showModelSearchCandidate, setShowModelSearchCandidate] = useState<boolean>(false);
  const [visibleExportFile, setVisibleExportFile] = useState<boolean>(false);
  const [visibleExportImageCard, setVisibleExportImageCard] = useState<boolean>(false);
  const [visibleExportImageAvatar, setVisibleExportImageAvatar] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const onHandleShowModelCreate = async () => {
    setShowModelDividingExamRoomVisible(true);
  };

  const onHandleShowModalExport = async () => {
    setVisibleExportFile(true);
  };

  const closeExportFile = async () => {
    setVisibleExportFile(false);
    exportForm.resetFields();
  };

  const closeExportImageAvatar = async () => {
    setVisibleExportImageAvatar(false);
    exportForm.resetFields();
  };

  const closeExportImageCard = async () => {
    setVisibleExportImageCard(false);
    exportForm.resetFields();
  };

  // searchForm
  const [searchForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();
      setLoading(true)
      const response: ResponseData = await getQueryList(
        fieldsValue.ExamPeriodId ?? state?.examPeriodCurrent?.id,
        fieldsValue.ExamScheduleTopikId,
        fieldsValue.ExamAreaId,
        fieldsValue.ExamPlaceId,
        +(fieldsValue.IsSendMail ?? 0),
        current,
        pageSize,
      );
      setList((response.data || []) as DividingExamPlaceModel[]);
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

  const onExportFile = async () => {
    setButtonLoading(true);
    const fieldsValue = await exportForm.validateFields();

    const header = {
      'apikey': import.meta.env.VITE_APIKEY,
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
    await fetch(import.meta.env.VITE_SERVER_BE + '/ManageRegisteredCandidateTopik/ExportDataTestScheduleByHeadQuarter?id=' + fieldsValue.TestScheduleTopikId + '&headQuarterId=' + fieldsValue.headQuarter, { method: "GET", headers: header })
      .then(response => {
        response.blob().then(blob => {
          let url = window.URL.createObjectURL(blob);
          // const pdfWindow: Window = window.open() as Window;
          // pdfWindow.location.href = url;
          let a = document.createElement('a');
          a.href = url;
          a.download = `data.zip`;
          a.click();
        });
      });
    // const response = await exportDataTestScheduleByHeadQuarter(fieldsValue.TestScheduleTopikId, fieldsValue.headQuarter);
    // if (response.code == Code._200) {
    //   const res = response.data as ExportFileModel;
    //   window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
    //   setVisibleExportFile(false);
    // } else {
    //   message.error(response.message || 'Tạo thất bại');
    // }
    setButtonLoading(false);
  };

  const onDownFile = async () => {
    setButtonLoading(true);
    window.location.href = import.meta.env.VITE_HOST + linkDown as string;
    setButtonLoading(false);
  };

  const onDownFileImageCard = async () => {
    setButtonLoading(true);
    window.location.href = import.meta.env.VITE_HOST + linkDownImageCard as string;
    setButtonLoading(false);
  };

  const onDownFileImageAvatar = async () => {
    setButtonLoading(true);
    window.location.href = import.meta.env.VITE_HOST + linkDownImageAvatar as string;
    setButtonLoading(false);
  };

  const onExportFileDown = async () => {
    setButtonLoading(true);
    setButtonWaiting(false)
    setButtonExport(true)
    setButtonDown(true)
    const fieldsValue = await exportForm.validateFields();
    const response = await exportDataTestSchedule(fieldsValue.TestScheduleTopikId);
    if (response.code == Code._200) {
      const res = response.data as ExportFileModel;
      window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
      setVisibleExportFile(false);
    } else {
      message.error(response.message || 'Tạo thất bại');
    }
    setButtonLoading(false);
    setButtonWaiting(true)
    setButtonExport(false)
    setButtonDown(true)
  };

  const onExportFileDownImageCard = async () => {
    setButtonLoading(true);
    setButtonWaiting(false)
    setButtonExport(true)
    setButtonDown(true)
    const fieldsValue = await exportForm.validateFields();
    const response = await exportImageByHeadquarter(fieldsValue.TestScheduleTopikId);
    if (response.code == Code._200) {
      const res = response.data as ExportFileModel;
      window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
      setVisibleExportFile(false);
    } else {
      message.error(response.message || 'Tạo thất bại');
    }
    setButtonLoading(false);
    setButtonWaiting(true)
    setButtonExport(false)
    setButtonDown(true)
  };

  const onExportFileDownImageAvatar = async () => {
    setButtonLoading(true);
    setButtonWaiting(false)
    setButtonExport(true)
    setButtonDown(true)
    const fieldsValue = await exportForm.validateFields();
    const response = await exportImageAvatarByTestSchedule(fieldsValue.TestScheduleTopikId);
    if (response.code == Code._200) {
      const res = response.data as ExportFileModel;
      window.location.href = import.meta.env.VITE_HOST + res.fileName as string;
      setVisibleExportFile(false);
    } else {
      message.error(response.message || 'Tạo thất bại');
    }
    setButtonLoading(false);
    setButtonWaiting(true)
    setButtonExport(false)
    setButtonDown(true)
  };

  const [linkDown, setLinkDown] = useState<string>();
  const [buttonDown, setButtonDown] = useState<boolean>(true);
  const [buttonExport, setButtonExport] = useState<boolean>(true);
  const [buttonWaiting, setButtonWaiting] = useState<boolean>(true);

  const [linkDownImageCard, setLinkDownImageCard] = useState<string>();
  const [buttonDownImageCard, setButtonDownImageCard] = useState<boolean>(true);
  const [buttonExportImageCard, setButtonExportImageCard] = useState<boolean>(true);
  const [buttonWaitingImageCard, setButtonWaitingImageCard] = useState<boolean>(true);

  const [linkDownImageAvatar, setLinkDownImageAvatar] = useState<string>();
  const [buttonDownImageAvatar, setButtonDownImageAvatar] = useState<boolean>(true);
  const [buttonExportImageAvatar, setButtonExportImageAvatar] = useState<boolean>(true);
  const [buttonWaitingImageAvatar, setButtonWaitingImageAvatar] = useState<boolean>(true);

  const onChangeExamShedule = async (type: number) => {
    setLinkDown(undefined)
    const fieldsValue = await exportForm.validateFields();
    const response = await checkFileCanDown(fieldsValue.TestScheduleTopikId, type);
    if (response.code == Code._200) {

      switch (response.data) {
        case 1:
          if (type == TypeCheckCandownFile.All) {
            setButtonDown(false)
            setButtonExport(false)
            setButtonWaiting(true)
            setLinkDown(response.message)
          } else if (type == TypeCheckCandownFile.ImageCard) {
            setButtonDownImageCard(false)
            setButtonExportImageCard(false)
            setButtonWaitingImageCard(true)
            setLinkDownImageCard(response.message)
          } else if (type == TypeCheckCandownFile.ImageAvatar) {
            setButtonDownImageAvatar(false)
            setButtonExportImageAvatar(false)
            setButtonWaitingImageAvatar(true)
            setLinkDownImageAvatar(response.message)
          }
          break;
        case 2:
          if (type == TypeCheckCandownFile.All) {
            setButtonWaiting(false)
            setButtonExport(true)
            setButtonDown(true)
          } else if (type == TypeCheckCandownFile.ImageCard) {
            setButtonWaitingImageCard(false)
            setButtonExportImageCard(true)
            setButtonDownImageCard(true)
          } else if (type == TypeCheckCandownFile.ImageAvatar) {
            setButtonWaitingImageAvatar(false)
            setButtonExportImageAvatar(true)
            setButtonDownImageAvatar(true)
          }
          break;
        case 3:
          if (type == TypeCheckCandownFile.All) {
            setButtonExport(false)
            setButtonDown(true)
            setButtonWaiting(true)
          } else if (type == TypeCheckCandownFile.ImageCard) {
            setButtonExportImageCard(false)
            setButtonDownImageCard(true)
            setButtonWaitingImageCard(true)
          } else if (type == TypeCheckCandownFile.ImageAvatar) {
            setButtonExportImageAvatar(false)
            setButtonDownImageAvatar(true)
            setButtonWaitingImageAvatar(true)
          }
          break;
        case 4:
          if (type == TypeCheckCandownFile.All) {
            setButtonExport(false)
          } else if (type == TypeCheckCandownFile.ImageCard) {
            setButtonExportImageCard(false)
          } else if (type == TypeCheckCandownFile.ImageAvatar) {
            setButtonExportImageAvatar(false)
          }
          message.error(response.message || 'Không tìm thấy lịch thi');
          break;
      }
    } else {
      message.error(response.message || 'Thất bại');
    }
  };

  const onHandleDeleteDividingRoom = async (id: string) => {
    // console.log(id)
    const response = await deleteDividingRoom(id);
    if (response.code == Code._200) {
      message.success(response.message || 'Xóa thành công');
      searchFormSubmit(1, 10);
    } else {
      message.error(response.message || 'Xóa thất bại');
    }
  };
  const onChangeHeaderQuarter = async () => {
    const fieldsValue = await searchForm.validateFields();
    const id: string = fieldsValue.ExamAreaId;
    const responseHeadQuarter: ResponseData = await getHeadQuarter(id);
    const headQuarter = ((responseHeadQuarter.data as HeadQuarterModel[]) ?? []).filter((item: HeadQuarterModel) => {
      return item.isTopik;
    });
    const stateDispatcher = {
      headQuarter: ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[]),
    };
    dispatch(stateDispatcher);
  };

  const onChangeExamPeriod = async () => {
    const fieldsValue = await searchForm.validateFields();
    searchForm.setFieldValue('ExamScheduleTopikId', undefined)
    const id: string = fieldsValue.ExamPeriodId;
    const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik("", undefined, undefined, id);
    const stateDispatcher = {
      examSchedule: ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]),
    };
    dispatch(stateDispatcher);
  };

  const columns: ColumnsType<DividingExamPlaceModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Khu vực',
      dataIndex: 'examAreaName',
      render: (_, record) => <span>{record.examAreaName}</span>,
    },
    {
      title: 'Địa điểm thi',
      dataIndex: 'examPlaceName',
      render: (_, record) => <span>{record.examPlaceName}</span>,
    },

    {
      title: 'Lịch thi',
      dataIndex: 'examScheduleTopikName',
      render: (_, record) => <span>{record.examScheduleTopikName}</span>,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'actualQuantity',
      render: (_, record) => <span>{record.actualQuantity}</span>,
    },
    {
      title: 'Tiêu chí',
      dataIndex: 'typeOrdering',
      render: (_, record) => <span>{record.typeOrdering === 0 ? "Ngẫu nhiên" : record.typeOrdering === 1 ? "Tên tăng dần" : record.typeOrdering === 2 ? "Tên giảm dần" : record.typeOrdering === 3 ? "Ngày sinh tăng dần" : record.typeOrdering === 4 ? "Ngày sinh giảm dần" : record.typeOrdering === 5 ? "Ngày đăng ký tăng dần" : record.typeOrdering === 6 ? "Ngày đăng ký giảm dần" : ""}</span>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      render: (_, record) => <span>{dayjs(record?.createdOnDate).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
      title: 'Gửi email',
      dataIndex: 'isSendMail',
      render: (_, record) => <span>{record?.isSendMail == 1 ? 'Đã gửi' : record?.isSendMail == 0 ? 'Chưa gửi' : 'Đang gửi...'}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 300,
      render: (_, record) => (
        <>
          <Permission noNode navigation={layoutCode.dividingExamRoomId as string} bitPermission={PermissionAction.Edit}>
            <Button
              type='primary'
              disabled={record.isDisable}
              loading={false}
              onClick={() => sendMail(record.id ?? '', record.isSendMail as number, record.examPlaceName ?? '')}
              style={{ marginRight: '4px' }}
            >
              Gửi email
            </Button>
          </Permission>
          <Button
            type='primary'
            loading={false}
            onClick={() => navigate(`/core-tct/dividing-exam-room/${record.id}/${record.examPlaceId}`)}
            style={{ marginRight: '4px' }}
          >
            DS phòng
          </Button>
          <Permission noNode navigation={layoutCode.dividingExamRoomId as string} bitPermission={PermissionAction.Delete}>
            <Button type='ghost' disabled={record.isDisable} loading={false} onClick={() => deleteRecord(record.id || '')}>
              Xóa
            </Button>
          </Permission>
        </>
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
                  <Permission noNode navigation={layoutCode.dividingExamRoomId as string} bitPermission={PermissionAction.Add}>
                    <Button htmlType='button' type='default' onClick={() => onHandleShowModelCreate()}>
                      <HddOutlined />
                      <Text>Phân phòng thi và đánh SBD</Text>
                    </Button>
                  </Permission>
                  <Button htmlType='button' type='default' onClick={() => onHandleShowModalExport()}>
                    <ExportOutlined />
                    <Text>Xuất danh sách thí sinh và ảnh hồ sơ</Text>
                  </Button>
                  <Button htmlType='button' type='default' onClick={() => setVisibleExportImageCard(true)}>
                    <ExportOutlined />
                    <Text>Xuất ảnh giấy tờ tùy thân</Text>
                  </Button>
                  <Button htmlType='button' type='default' onClick={() => setVisibleExportImageAvatar(true)}>
                    <ExportOutlined />
                    <Text>Xuất ảnh phiếu dự thi</Text>
                  </Button>
                  <Button htmlType='button' type='ghost' onClick={() => setShowModelSearchCandidate(true)}>
                    <SearchOutlined />
                    <Text>Tìm kiếm thí sinh</Text>
                  </Button>
                </Space>
              </Col>
              <Col span={24} className='gutter-row'>
                <Collapse>
                  <Panel header='Tìm kiếm' key='1'>
                    <Form
                      form={searchForm}
                      name='search'
                      initialValues={{
                        ['IsSendMail']: '0',
                        ['ExamPeriodId']: state.examPeriodCurrent?.id,
                        // ["ExamAreaId"]: '',
                        // ["ExamPlaceId"]: '',
                        // ["ExamScheduleTopikId"]: '',
                      }}
                    >
                      <Row gutter={16} justify='start'>
                        <Col span={6}>
                          <Form.Item
                            label={'Khu vực'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='ExamAreaId'
                          >
                            <Select
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
                              placeholder='Chọn khu vực'
                              options={state.area}
                              onChange={() => onChangeHeaderQuarter()}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Địa điểm thi'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='ExamPlaceId'
                          >
                            <Select
                              placeholder='Chọn địa điểm'
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
                              options={state.headQuarter}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Kỳ thi'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='ExamPeriodId'
                          >
                            <Select
                              showSearch
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
                              placeholder='Chọn kỳ thi'
                              options={state.examPeriods}
                              onChange={() => onChangeExamPeriod()}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Lịch thi'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='ExamScheduleTopikId'
                          >
                            <Select
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
                              placeholder='Chọn lịch thi'
                              options={state.examSchedule}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Trạng thái gửi email'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='IsSendMail'
                          >
                            <Select
                              showSearch
                              allowClear
                              placeholder='Trạng thái gửi email' options={state.isSendMail} />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                            Tìm kiếm
                          </Button>
                          <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => searchForm.resetFields()}>
                            Làm lại
                          </Button>
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
              getList(page, pageSize);
            },
          }}
        />
      </Card>

      <Modal
        destroyOnClose
        width={'40%'}
        maskClosable={false}
        title='Xuất danh sách thí sinh và ảnh hồ sơ'
        open={visibleExportFile}
        onCancel={() => closeExportFile()}
        footer={[
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonDown} loading={buttonLoading} onClick={() => onDownFile()}>
            Tải file
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' loading={buttonLoading} hidden={buttonExport} onClick={() => onExportFileDown()}>
            Xuất danh sách
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonWaiting} loading={true} >
            Đang tạo file
          </Button>
        ]}
      >
        <Row gutter={24}>
          <Form form={exportForm} name='exportForm' size='large' style={{ width: '50%' }}>
            <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TestScheduleTopikId'>
              <Select showSearch placeholder='Chọn lịch thi' options={state.examSchedule} onChange={() => onChangeExamShedule(TypeCheckCandownFile.All)} />
            </Form.Item>
          </Form>
        </Row>
        <Row>
          <label style={{ color: 'red' }}>
            Lưu ý: Đảm bảo rằng tất cả các thí sinh trong lịch thi này đều đã được đánh số báo danh.
          </label>
        </Row>
      </Modal>
      <Modal
        destroyOnClose
        width={'40%'}
        maskClosable={false}
        title='Xuất ảnh giấy tờ tùy thân'
        open={visibleExportImageCard}
        onCancel={() => closeExportImageCard()}
        footer={[
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonDownImageCard} loading={buttonLoading} onClick={() => onDownFileImageCard()}>
            Tải file
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' loading={buttonLoading} hidden={buttonExportImageCard} onClick={() => onExportFileDownImageCard()}>
            Xuất danh sách
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonWaitingImageCard} loading={true} >
            Đang tạo file
          </Button>
        ]}
      >
        <Row gutter={24}>
          <Form form={exportForm} name='exportForm' size='large' style={{ width: '50%' }}>
            <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TestScheduleTopikId'>
              <Select showSearch placeholder='Chọn lịch thi' options={state.examSchedule} onChange={() => onChangeExamShedule(TypeCheckCandownFile.ImageCard)} />
            </Form.Item>
          </Form>
        </Row>
      </Modal>
      <Modal
        destroyOnClose
        width={'40%'}
        maskClosable={false}
        title='Xuất ảnh phiếu dự thi'
        open={visibleExportImageAvatar}
        onCancel={() => closeExportImageAvatar()}
        footer={[
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonDownImageAvatar} loading={buttonLoading} onClick={() => onDownFileImageAvatar()}>
            Tải file
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' loading={buttonLoading} hidden={buttonExportImageAvatar} onClick={() => onExportFileDownImageAvatar()}>
            Xuất danh sách
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' hidden={buttonWaitingImageAvatar} loading={true} >
            Đang tạo file
          </Button>
        ]}
      >
        <Row gutter={24}>
          <Form form={exportForm} name='exportForm' size='large' style={{ width: '50%' }}>
            <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TestScheduleTopikId'>
              <Select showSearch placeholder='Chọn lịch thi' options={state.examSchedule} onChange={() => onChangeExamShedule(TypeCheckCandownFile.ImageAvatar)} />
            </Form.Item>
          </Form>
        </Row>
      </Modal>
      {showModelDividingExamRoomVisible && (
        <CreateDividingExamRoom
          open={showModelDividingExamRoomVisible}
          setOpen={setShowModelDividingExamRoomVisible}
          reload={searchFormSubmit}
        />
      )}

      {showModelSearchCandidate && (
        <SearchCandidate
          examPeriods={state.examPeriods}
          examPeriodCurrent={state.examPeriodCurrent}
          open={showModelSearchCandidate}
          setOpen={setShowModelSearchCandidate}
          reload={searchFormSubmit}
        />
      )}
    </div>
  );
}

export default DividingExamRoom;
