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
  Input,
  Tooltip,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel, ManageApplicationTimeModel, UserReceiveEmailTestModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';
import { getQueryList, deleteDividingRoom, sendMailCandidates } from '@/apis/services/DividingExamPlaceService';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, ExportOutlined, HddOutlined, LoadingOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { deleteUserReceiveEmailTest, getUserReceiveEmailTest, getUserReceiveEmailTests } from '@/apis/services/UserReceiveEmailTestService';
import CreateUserReceiveMailComponent from './create-user-receive-mail';
import EditUserReceiveMailComponent from './edit-user-receive-mail';
import { SelectOptionModel } from '@/apis/models/data';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';

type stateType = {
  recordEdit?: UserReceiveEmailTestModel,
  dataTables?: UserReceiveEmailTestModel[],
  status?: SelectOptionModel[]
}
function UserReceiveEmailTestComponent() {
  const navigate = useNavigate();
  // Load
  const { Panel } = Collapse;
  const initState: stateType = {
    recordEdit: {},
    dataTables: [],
    status: [
      {
        key: 'All',
        label: 'Tất cả',
        value: '0',
      },
      {
        key: 'Active',
        label: 'Hoạt động',
        value: '1',
      },
      {
        key: 'InActive',
        label: 'Ngừng hoạt động',
        value: '2',
      },
    ],
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const { Title, Paragraph, Text, Link } = Typography;
  const [state, dispatch] = useReducer<(prevState: stateType, updatedProperty: stateType) => stateType>(
    (prevState: stateType, updatedProperty: stateType) => ({
      ...prevState,
      ...updatedProperty,
    }),
    initState,
  );

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    // const responseExam: ResponseData = await getExam();

    // const stateDispatcher = {
    //   examSchedule: ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]),
    //   headQuarter: ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[]),
    //   area: ConvertAreaOption(area as AreaModel[]),
    //   exam: ConvertExamOptionModel(responseExam.data as ExamModel[]),
    // };
    // dispatch(stateDispatcher);

    searchFormSubmit(current, pageSize);

    setLoading(false);
  };
  useEffect(() => {
    getList(1);
  }, []);

  const sendMail = (dividingExamPlaceId: string, isSendMail: boolean, examPlaceName: string) => {
    Modal.confirm({
      title: 'Xác nhận gửi mail',
      content: isSendMail
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
  const [showModelCreate, setShowModelCreate] = useState<boolean>(false);
  const [showModelEdit, setShowModelEdit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const onHandleShowModelCreate = async () => {
    setShowModelCreate(true);
  };

  const onHandleShowModelEdit = async (id: string) => {
    setButtonLoading(true);
    const response: ResponseData = await getUserReceiveEmailTest(id);
    if (response.code === Code._200) {
      const stateDispatcher = {
        recordEdit: (response.data || {}) as UserReceiveEmailTestModel,
      };
      dispatch(stateDispatcher);
      setShowModelEdit(true);
      setButtonLoading(false);
    }
    else {
      setShowModelEdit(false);
      setButtonLoading(false);
      message.error(response.message || "Thất bại")
    }
  };

  // searchForm
  const [searchForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();

      console.log(fieldsValue);
      const response: ResponseData = await getUserReceiveEmailTests(
        fieldsValue.FullName,
        +(fieldsValue.Status ?? 0),
        current,
        pageSize,
      );
      // setList((response.data || []) as DividingExamPlaceModel[]);

      const stateDispatcher = {
        dataTables: (response.data || []) as UserReceiveEmailTestModel[],
      };
      dispatch(stateDispatcher);
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
    const response = await deleteUserReceiveEmailTest(id);
    if (response.code == Code._200) {
      message.success(response.message || 'Xóa thành công');
      searchFormSubmit(1, 10);
    } else {
      message.error(response.message || 'Xóa thất bại');
    }
  };

  const columns: ColumnsType<UserReceiveEmailTestModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (_, record) => <span>{record.fullName}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (_, record) => <span>{record.email}</span>,
    },
    {
      title: 'Ngôn ngữ nhận mail',
      dataIndex: 'email',
      render: (_, record) => <span>{record.languageSendMail}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => <>{record?.status == 1 ? 'Hoạt động' : <Text type="danger">Ngừng hoạt động</Text>}</>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      render: (_, record) => <span>{dayjs(record?.createdOnDate).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
      title: 'Ngày sửa',
      dataIndex: 'lastModifiedOnDate',
      render: (_, record) => <span>{dayjs(record?.lastModifiedOnDate).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 300,
      render: (_, record) => (
        <Space>
          <Permission navigation={layoutCode.testMail} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='primary'
              size={"small"}
              loading={buttonLoading}
              onClick={() => onHandleShowModelEdit(record.id || "")}
            >
              <Tooltip title="Chỉnh sửa">
                <EditOutlined />
              </Tooltip>
            </Button>
          </Permission>
          <Permission navigation={layoutCode.testMail} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='ghost' size={"small"} loading={false} onClick={() => deleteRecord(record.id || '')}>
              <Tooltip title="Xóa">
                <DeleteOutlined />
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
              <Col span={24} className='gutter-row' style={{ marginBottom: '8px' }}>
                <Space>
                  <Permission navigation={layoutCode.testMail} bitPermission={PermissionAction.Add} noNode={<></>}>
                    <Button htmlType='button' type='ghost' onClick={() => onHandleShowModelCreate()}>
                      <UserAddOutlined />
                      <Text>Thêm liên hệ</Text>
                    </Button>
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
                        ['Status']: '0',
                        ['FullName']: '',
                      }}
                    >
                      <Row gutter={16} justify='start'>
                        <Col span={6}>
                          <Form.Item
                            label={'Họ tên'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='FullName'
                          >
                            <Input allowClear placeholder='Nhập họ tên' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Trạng thái liên hệ'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='Status'
                          >
                            <Select
                              showSearch
                              placeholder='Trạng thái liên hệ' options={state.status} />
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
          dataSource={state.dataTables}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              getList(page, pageSize);
            },
          }}
        />
      </Card>

      {showModelCreate && (
        <CreateUserReceiveMailComponent
          open={showModelCreate}
          setOpen={setShowModelCreate}
          reload={searchFormSubmit}
        />
      )}

      {showModelEdit && (
        <EditUserReceiveMailComponent
          userEdit={(state.recordEdit ?? {}) as UserReceiveEmailTestModel}
          open={showModelEdit}
          setOpen={setShowModelEdit}
          reload={searchFormSubmit}
        />
      )}

    </div>
  );
}

export default UserReceiveEmailTestComponent;
