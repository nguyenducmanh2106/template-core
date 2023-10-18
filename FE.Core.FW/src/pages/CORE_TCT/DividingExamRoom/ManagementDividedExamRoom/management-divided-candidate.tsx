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
  Typography,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel, ManageApplicationTimeModel, OpenAPI, UserReceiveEmailTestModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';

import {
  ConvertAreaOption,
  ConvertExamOptionModel,
  ConvertExamScheduleOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertIntToCurrencyFormat,
  ConvertOptionModel,
  ConvertTimeApplicationOptionModel,
  ConvertUserReceiveMailOptionModel,
} from '@/utils/convert';
import { ExamModel, HeadQuarterModel, SelectOptionModel, ServiceAlongExamModel, AreaModel } from '@/apis/models/data';
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
} from '@/apis/services/DividingExamPlaceService';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { DividingExamPlaceModel } from '@/apis/models/DividingExamPlaceModel';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamRoomDividedModel } from '@/apis/models/ExamRoomDividedModel';
import EditCandidate from './update-candidate';
import Title from 'antd/lib/typography/Title';
import { DownloadOutlined, RotateRightOutlined, SendOutlined } from '@ant-design/icons';
import { getAllUserReceiveEmailTests } from '@/apis/services/UserReceiveEmailTestService';
import SendMailTestComponent from '../send-mail-test';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
type typeOption = {
  id: string,
  name: string
};
function ManagementDividedCandidate() {
  const navigate = useNavigate();
  const params = useParams()
  // Load
  const { Panel } = Collapse;
  const initState = {
    userReceiveMails: [], candidateInfo: {}
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ExamRoomDividedModel[]>([]);
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const [loadingModelSendTestMail, setLoadingModelSendTestMail] = useState<boolean>(false);
  const [showModelSendTestMail, setShowModelSendTestMail] = useState<boolean>(false);
  const { Title, Paragraph, Text, Link } = Typography;
  const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
    (prevState: any, updatedProperty: any) => ({
      ...prevState,
      ...updatedProperty,
    }),
    initState,
  );
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

  const [rooms, setRooms] = useState<SelectOptionModel[]>([]);


  const onHandleShowSendTestMail = async () => {
    setShowModelSendTestMail(false);
    setLoadingModelSendTestMail(true)
    let candidate = list.find((item: ExamRoomDividedModel) => {
      return item.id === selectedRowDeleteKeys[0]
    })
    const response: ResponseData = await getAllUserReceiveEmailTests("", 1,);
    if (response.code === Code._200) {
      var data = ConvertUserReceiveMailOptionModel((response.data ?? []) as UserReceiveEmailTestModel[]);
      const stateDispatcher = {
        userReceiveMails: data,
        candidateInfo: candidate
      };
      dispatch(stateDispatcher);
      setShowModelSendTestMail(true);
      setLoadingModelSendTestMail(false)
    }
    else {
      setShowModelSendTestMail(false);
      setLoadingModelSendTestMail(false)
      message.error(response.message || "Thất bại")
    }
  };

  /**
   * Lấy danh sách phòng thuộc địa điểm thi đang trống thí sinh
   * @param id 
   */
  const getSlotRooms = async (): Promise<void> => {
    const response: ResponseData = await checkSlotRoom(params.dividingExamPlaceId);
    if (response && response.code === Code._200) {
      const getUserCurrent = response.data as typeOption[] ?? [];
      const dataConvert = ConvertOptionModel<typeOption>(getUserCurrent)
      setRooms(dataConvert)
    }
  };

  useEffect(() => {
    getList(1);
    getSlotRooms()
  }, []);

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [candidateEdit, setCandidateEdit] = useState<ExamRoomDividedModel>({});
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
      if (!current) current = pagination.current
      if (!pageSize) pageSize = pagination.pageSize
      const fieldsValue = await searchForm.validateFields();
      // console.log(fieldsValue)
      // return

      const response: ResponseData = await getQueryDividedCandidates(
        params.dividingExamPlaceId,
        params.examRoomId,
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

  const onHandleDeleteDividingRoom = async (id: string) => {
    // console.log(id)
    const response = await deleteDividingRoom(id)
    if (response.code == Code._200) {
      message.success(response.message || "Xóa thành công");
      searchFormSubmit(1, 10)
    }
    else {
      message.error(response.message || "Xóa thất bại");
    }
  }

  const onHandleExportExcelCandidateDividingRoom = async () => {
    // console.log(id)
    setConfirmLoading(true);
    const fieldsValue = await searchForm.validateFields();
    const response = await exportExcelManagementDividedCandidate(
      params.dividingExamPlaceId,
      params.examRoomId,
      fieldsValue.candidateName ?? "",
      fieldsValue.candidatePhone ?? "",
      fieldsValue.candidateEmail ?? "",)
    if (response.code == Code._200) {
      console.log(response)
      window.location.href = import.meta.env.VITE_HOST + "/" + response.data;
      setConfirmLoading(false);
    }
    else {
      message.error(response.message || "Xuất file thất bại");
      setConfirmLoading(false);
    }
  }

  const onHandleShowFormEdit = async (candidateEdit: ExamRoomDividedModel) => {
    setCandidateEdit(candidateEdit)
    setShowEditForm(true)
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
      title: 'Ngôn ngữ email',
      dataIndex: 'languageSendMail',
      render: (_, record) => (
        <span>{record?.languageSendMail}</span>
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
      width: 300,
      render: (_, record) => (
        <Space>
          <Permission noNode navigation={layoutCode.dividingExamRoomId as string} bitPermission={PermissionAction.Edit}>
            <Button
              type='primary'
              size={"small"}
              loading={false}
              disabled={record.isDisable}
              onClick={() => sendMail(record.id ?? "", record.isSendMail as number, record.candidateName ?? "")}
              style={{ marginRight: '4px' }}
            >
              <Tooltip title="Gửi email">
                <SendOutlined />
              </Tooltip>
            </Button>
            <Button
              type='ghost'
              size={"small"}
              loading={false}
              disabled={record.isDisable}
              onClick={() => onHandleShowFormEdit(record)}
              style={{ marginRight: '4px' }}
            >
              <Tooltip title="Cập nhật SBD và chuyển phòng thi">
                <RotateRightOutlined />
              </Tooltip>
            </Button>
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
              <Col span={24} className="gutter-row" style={{ marginBottom: '8px' }}>
                <div className="d-flex" style={{ background: "#fff" }}>
                  <div className="left">
                    <Tooltip title="Quay lại">
                      <a className="btn-link back icon--back_24" href='javascript://' onClick={() => navigate(-1)}></a>
                    </Tooltip>
                  </div>
                  <div className="right">
                    <div className="avatar d-flex">
                      <div className="img-default" style={{ fontSize: "16px", fontWeight: "600", marginRight: "8px" }}>Danh sách thí sinh</div>
                      <Space>
                        <Button type="default" icon={<DownloadOutlined />} size={"middle"}
                          onClick={() => onHandleExportExcelCandidateDividingRoom()} loading={confirmLoading}>
                          Xuất Excel
                        </Button>
                        {selectedRowDeleteKeys.length == 1 &&
                          <Button htmlType='button' loading={loadingModelSendTestMail} type='dashed' onClick={() => onHandleShowSendTestMail()}>
                            <SendOutlined />
                            <Text>Gửi email test</Text>
                          </Button>
                        }
                      </Space>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={24} className="gutter-row" style={{ marginBottom: '8px' }}>
                <div><span style={{ fontWeight: "400" }}>Kỳ thi:&nbsp;</span>{list?.length > 0 ? list[0].examScheduleTopikName : ""}</div>
                <div className='d-flex'>
                  <div style={{ marginRight: "18px" }}><span style={{ fontWeight: "400" }}>Trụ sở:&nbsp;</span>{list?.length > 0 ? list[0].examAreaName : ""}</div>
                  <div style={{ marginRight: "18px" }}><span style={{ fontWeight: "400" }}>Địa điểm:&nbsp;</span>{list?.length > 0 ? list[0].examPlaceName : ""}</div>
                  <div><span style={{ fontWeight: "400" }}>Phòng:&nbsp;</span>{list?.length > 0 ? list[0].examRoomName : ""}</div>
                </div>
              </Col>
              <Col span={24} className="gutter-row">
                <Collapse>
                  <Panel header='Tìm kiếm' key='1'>
                    <Form form={searchForm} name='search'>
                      <Row gutter={16} justify='start'>
                        <Col span={6}>
                          <Form.Item label={'Họ tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='candidateName'>
                            <Input placeholder='Nhập họ tên' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Số điện thoại'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='candidatePhone'
                          >
                            <Input placeholder='Nhập số điện thoại' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label={'Email'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='candidateEmail'>
                            <Input placeholder='Nhập email' />
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
          rowSelection={{
            selectedRowKeys: selectedRowDeleteKeys,
            onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
          }}
        />
      </Card>

      {showEditForm && (
        <EditCandidate
          open={showEditForm}
          setOpen={setShowEditForm}
          reload={searchFormSubmit}
          candidateEdit={candidateEdit}
          rooms={[{ key: list[0].examRoomId as string, label: list[0].examRoomName as string, value: list[0].examRoomId as string }, ...rooms]}
        />
      )}

      {showModelSendTestMail && (
        <SendMailTestComponent
          userReceiveMails={state.userReceiveMails}
          open={showModelSendTestMail}
          setOpen={setShowModelSendTestMail}
          candidateInfo={state.candidateInfo}
        />
      )}
    </div>
  );
}

export default ManagementDividedCandidate;
