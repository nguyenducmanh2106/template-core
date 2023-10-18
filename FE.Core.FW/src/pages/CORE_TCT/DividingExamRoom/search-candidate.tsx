import { ChangeEvent, useEffect, useReducer, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Row,
  Table,
  Image,
  Tabs,
  Select,
  Tooltip,
  Space,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel, ManageApplicationTimeModel, OpenAPI } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';

import {
  ConvertAreaOption,
  ConvertExamOptionModel,
  ConvertExamScheduleOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertIntToCurrencyFormat,
  ConvertOptionModel,
  ConvertOptionSelectModel,
  ConvertTimeApplicationOptionModel,
} from '@/utils/convert';
import { ExamModel, HeadQuarterModel, SelectOptionModel, ServiceAlongExamModel, AreaModel, ExamPeriodResponse } from '@/apis/models/data';
import { getArea, getExam, getHeadQuarter, getServiceAlongExam } from '@/apis/services/PageService';
import styles from '@/assets/css/index.module.less';
import {
  getQueryList,
  deleteDividingRoom,
  getQueryDividedCandidates,
  exportExcelManagementDividedCandidate,
  sendMailCandidate,
  updateCandidateNumberAndMoveCandidateRoom,
  checkSlotRoom,
  searchCandidates,
} from '@/apis/services/DividingExamPlaceService';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { DividingExamPlaceModel } from '@/apis/models/DividingExamPlaceModel';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamRoomDividedModel } from '@/apis/models/ExamRoomDividedModel';
import Title from 'antd/lib/typography/Title';
import { DownloadOutlined, NodeExpandOutlined, RotateRightOutlined, SendOutlined } from '@ant-design/icons';
import { getExamPeriod } from '@/apis/services/ExamPeriodService';
interface Props {
  open: boolean;
  examPeriods: SelectOptionModel[];
  examPeriodCurrent: ExamPeriodResponse;
  setOpen: (value: boolean) => void;
  reload: (current?: number, pageSize?: number) => void;
}
const ManagementDividedCandidate: React.FC<Props> = ({ open, examPeriods, examPeriodCurrent, setOpen, reload }) => {
  const navigate = useNavigate();
  const params = useParams()
  // Load
  const { Panel } = Collapse;
  const initState = {
    candidateName: "",
    candidatePhone: "",
    candidateEmail: "",
    examSchedule: [],
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ExamRoomDividedModel[]>([]);
  const [examSchedules, setExamSchedules] = useState<SelectOptionModel[]>([]);
  const [modalButtonOkText, setModalButtonOkText] = useState('Lưu');
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    searchFormSubmit(current, pageSize)
  };

  useEffect(() => {
    const fnGetExamSchedule = async () => {
      const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik("", undefined, undefined, examPeriodCurrent?.id);
      const examScheduleData = ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]);
      setExamSchedules(examScheduleData)
    }
    getList(1);
    fnGetExamSchedule()
  }, []);

  const onChangeExamPeriod = async () => {
    const fieldsValue = await searchForm.validateFields();
    searchForm.setFieldValue('ExamScheduleTopikId', undefined)
    const id: string = fieldsValue.ExamPeriodId;
    const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik("", undefined, undefined, id);
    const examSchedule = ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]);
    setExamSchedules(examSchedule);
  };

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const sendMail = (examRoomDividedId: string, isSendMail: number, candidateName: string) => {
    Modal.confirm({
      title: 'Xác nhận gửi mail',
      content: isSendMail == 1 ? `Email đã được gửi đến thí sinh ${candidateName}, có muốn tiếp tục gửi` : `Gửi email đến thí sinh  ${candidateName}`,
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        const res = await sendMailCandidate(examRoomDividedId);
        if (res.code == Code._200) {
          message.success(res.message ?? 'Gửi mail thành công !');
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // searchForm
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current?: number, pageSize?: number): Promise<void> => {
    try {
      setLoading(true);
      if (!current) current = 1
      if (!pageSize) pageSize = pagination.pageSize
      const fieldsValue = await searchForm.validateFields();
      // console.log(fieldsValue)
      // return

      const response: ResponseData = await searchCandidates(
        fieldsValue.ExamPeriodId ?? examPeriodCurrent?.id,
        fieldsValue.ExamScheduleTopikId ?? "",
        fieldsValue.candidateName ?? "",
        fieldsValue.candidatePhone ?? "",
        fieldsValue.candidateEmail ?? "",
        current,
        pageSize
      );
      setList((response.data || []) as ExamRoomDividedModel[]);
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


  const columns: ColumnsType<ExamRoomDividedModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'SBD',
      dataIndex: 'candidateNumber',
      render: (_, record) => <span>{record.candidateNumber}</span>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'candidateName',
      render: (_, record) => <span>{record.candidateName}</span>,
    },

    {
      title: 'Email',
      dataIndex: 'candidateEmail',
      render: (_, record) => <span>{record.candidateEmail}</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'candidatePhone',
      render: (_, record) => <span>{record.candidatePhone}</span>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'candidateBirthday',
      render: (_, record) => (
        <span>{record?.candidateBirthday != null ? dayjs(record?.candidateBirthday).format("DD/MM/YYYY") : ""}</span>
      ),
    },
    {
      title: 'Lịch thi',
      dataIndex: 'examScheduleTopikName',
      render: (_, record) => (
        <span>{record?.examScheduleTopikName}</span>
      ),
    },
    {
      title: 'Khu vực',
      dataIndex: 'examAreaName',
      render: (_, record) => (
        <span>{record?.examAreaName}</span>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'examPlaceName',
      render: (_, record) => (
        <span>{record?.examPlaceName}</span>
      ),
    },
    {
      title: 'Gửi email',
      dataIndex: 'isSendMail',
      render: (_, record) => (
        <span>{record?.isSendMail == 1 ? "Đã gửi" : record?.isSendMail == 0 ? "Chưa gửi" : "Đang gửi..."}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type='primary'
            size={"small"}
            loading={false}
            onClick={() => sendMail(record.id ?? "", record.isSendMail as number, record.candidateName ?? "")}
          >
            <Tooltip title="Gửi email">
              <SendOutlined />
            </Tooltip>
          </Button>

          <Button
            type='ghost'
            size={"small"}
            loading={false}
            onClick={() => { navigate(`/core-tct/management-divided-candidate/${record.dividingExamPlaceId}/${record.examRoomId}`) }}
          >
            <Tooltip title="Chuyển đến phòng thi của thí sinh">
              <NodeExpandOutlined />
            </Tooltip>
          </Button>
        </Space>
      ),
    },
  ];
  const handleCancel = () => {
    console.log('Clicked cancel button');
    searchForm.resetFields()
    setOpen(false);
  };
  const validateMessages = {
    required: '${label} không được để trống',
    types: {
      email: '${label} không đúng định dạng email',
      number: '${label} không đúng định dạng số',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  return (
    <Modal title="Tìm kiếm thí sinh" open={open} okText={modalButtonOkText}
      cancelText="Hủy bỏ" width={'85vw'}
      style={{ top: 20 }} onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okButtonProps={{ form: 'myFormCreate', htmlType: 'submit', style: { display: 'none' } }}
    >
      <div className='layout-main-content'>
        <Card
          bordered={false}
          title={
            <>
              <Row gutter={16} justify='start'>
                <Col span={24} className="gutter-row">
                  <Collapse>
                    <Panel header='Tìm kiếm' key='1'>
                      <Form form={searchForm} name='search'
                        validateMessages={validateMessages}
                        initialValues={{
                          ['ExamPeriodId']: examPeriodCurrent?.id,
                          // ["ExamAreaId"]: '',
                          // ["ExamPlaceId"]: '',
                          // ["ExamScheduleTopikId"]: '',
                        }}
                      >
                        <Row gutter={16} justify='start'>
                          <Col span={4}>
                            <Form.Item label={'Họ tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='candidateName'>
                              <Input allowClear placeholder='Nhập họ tên' />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              label={'Số điện thoại'}
                              labelCol={{ span: 24 }}
                              wrapperCol={{ span: 17 }}
                              name='candidatePhone'
                            >
                              <Input allowClear placeholder='Nhập số điện thoại' />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item label={'Email'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='candidateEmail'
                              rules={[
                                {
                                  type: 'email',
                                  message: 'Không đúng định dạng email',
                                },
                              ]}
                            >
                              <Input allowClear placeholder='Nhập email' />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
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
                                options={examPeriods}
                                onChange={() => onChangeExamPeriod()}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
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
                                options={examSchedules}
                              />
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
      </div>
    </Modal>

  );
}

export default ManagementDividedCandidate;
