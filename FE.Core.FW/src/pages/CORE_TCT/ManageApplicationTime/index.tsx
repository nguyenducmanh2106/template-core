import { useEffect, useState } from 'react';
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
  PaginationProps,
  Radio,
  Row,
  Select,
  Space,
  Table,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ManageApplicationTimeModel } from '@/apis/models/ManageApplicationTimeModel';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import CreateForm from '@/components/ManageApplicationTime/CreateForm/CreateForm';
import UpdateForm from '@/components/ManageApplicationTime/UpdateForm/UpdateForm';
import { ColumnsType } from 'antd/lib/table';
import { TableRowSelection } from 'antd/lib/table/interface';
import { Code, TimeFrameModel } from '@/apis';
import {
  getManageApplicationTime,
  deleteManageApplicationTime,
  deleteManyManageApplicationTime,
  putManageApplicationTime,
  postManageApplicationTime,
} from '@/apis/services/ManageApplicationTimeService';
import { getHeadQuarter } from '@/apis/services/PageService';
import { HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import { ConvertHeaderQuarterOptionModel, ConvertTimeFrameOptionModel } from '@/utils/convert';
import { getTimeFrame } from '@/apis/services/TimeFrameService';
import dayjs from 'dayjs';
import IconSvg from '@/components/IconSvg';
import moment from 'moment';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
const { Panel } = Collapse;

var manageApplicationTime: ManageApplicationTimeModel[] = [];
var headQuarter: SelectOptionModel[] = [];
var timeFrames: SelectOptionModel[] = [];
var checkedList: string[] = [];

interface SearchParams {
  headerQuarterId?: string,
  from?: string,
  to?: string,
  pageNumber: number,
  pageSize: number
}

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<ManageApplicationTimeModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({ pageNumber: 1, pageSize: 10 });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const response: ResponseData = await getManageApplicationTime(searchParams.headerQuarterId, searchParams.from, searchParams.to, false, current, pageSize, true);
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    var temp = responseHeadQuarter.data as HeadQuarterModel[];
    temp = temp.filter((item: HeadQuarterModel) => {
      return item.canRegisterExam;
    })
    headQuarter = ConvertHeaderQuarterOptionModel(temp);
    manageApplicationTime = (response.data || []) as ManageApplicationTimeModel[];
    setList((response.data || []) as ManageApplicationTimeModel[]);
    setPagination({
      ...pagination,
      current,
      total: response.totalCount || 0,
      pageSize: pageSize,
    });
    setLoading(false);
  };
  useEffect(() => {
    getTimeFrame().then(responseTimeFrame => {
      timeFrames = ConvertTimeFrameOptionModel(responseTimeFrame.data as TimeFrameModel[]);
    });
    getList(1);
  }, []);
  const [search, setSearch]: [string, (search: string) => void] = useState('');

  const handleChange = (e: { target: { value: string } }) => {
    setSearch(e.target.value);
    const list = manageApplicationTime.filter((item: ManageApplicationTimeModel) => {
      // return item.name?.includes(e.target.value);
    });
    setList(list);
  };
  const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading([id]);
        const res = await deleteManageApplicationTime(id);
        if (res.code == Code._200) {
          message.success('Thành công !');
          getList(pagination.current);
          setDeleteLoading([]);
        } else {
          message.error(res.message);
        }
        setDeleteLoading([]);
      },
    });
  };

  const deleteSelectTableData = () => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(checkedList);
        await deleteManyManageApplicationTime(undefined, checkedList);
        message.success('Thành công !');
        getList(pagination.current);
        setDeleteLoading([]);
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<ManageApplicationTimeModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = manageApplicationTime.find((item: ManageApplicationTimeModel) => item.id == id);
    setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };

  const updataFormCancel = async () => {
    setUpdateData({});
    setUpdateFormVisible(false);
  };

  const updateSubmit = async (values: ManageApplicationTimeModel) => {
    setUpdateSubmitLoading(true);
    const res = await putManageApplicationTime(undefined, values);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      getList(pagination.current);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  // Save
  const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
  const [createFormVisible, setCreateFormVisible] = useState<boolean>(false);
  const createSubmit = async (values: Omit<ManageApplicationTimeModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postManageApplicationTime(undefined, values);
    if (res.code == Code._200) {
      form.resetFields();
      setCreateFormVisible(false);
      message.success('Thành công !');
      getList(1);
    } else {
      message.error(res.message);
    }
    setCreateSubmitLoading(false);
  };

  // searchForm
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();
      const from = fieldsValue.to != null ? moment(fieldsValue.from).format('DD/MM/YYYY') : '';
      const to = fieldsValue.to != null ? moment(fieldsValue.to).format('DD/MM/YYYY') : '';
      const response: ResponseData = await getManageApplicationTime(fieldsValue.headerQuarterId, from, to, false, current, pageSize, true);
      manageApplicationTime = (response.data || []) as ManageApplicationTimeModel[];
      setList((response.data || []) as ManageApplicationTimeModel[]);
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

  const rowSelection: TableRowSelection<ManageApplicationTimeModel> = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ManageApplicationTimeModel[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      checkedList = selectedRowKeys as string[];
    },
  };
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  const columns: ColumnsType<ManageApplicationTimeModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Ngày thu hồ sơ',
      dataIndex: 'receivedDate',
      render: (_, record) => dayjs(record.receivedDate).format('DD-MM-YYYY'),
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'timeStart',
      render: (_, record) => <span>{record.timeStart}</span>,
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'timeEnd',
      render: (_, record) => <span>{record.timeEnd}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'maxRegistry',
      render: (_, record) => <span>{record.maxRegistry}</span>,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'registed',
      render: (_, record) => <span>{record.registed}</span>,
    },
    {
      title: 'Trụ sở',
      dataIndex: 'headerQuarterId',
      render: (_, record) => <span>{headQuarter.find((p) => p.value == record.headerQuarterId)?.label}</span>,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isShow',
      render: (_, record) => <span>{record.isShow ? <CheckOutlined /> : <CloseOutlined />}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.applicationTime} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Sửa
            </Button>
          </Permission>
          <Divider type='vertical' />
          <Permission navigation={layoutCode.applicationTime} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button
              type='link'
              loading={deleteLoading.includes(record.id || '')}
              onClick={() => deleteTableData(record.id || '')}
            >
              Xóa
            </Button>
          </Permission>
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
            <Space style={{ marginBottom: '10px' }}>
              <Permission navigation={layoutCode.applicationTime} bitPermission={PermissionAction.Add} noNode={<></>}>
                <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                  Thêm mới
                </Button>
              </Permission>
            </Space>
            <Row></Row>
            <Collapse>
              <Panel header='Tìm kiếm' key='1'>
                <Form form={searchForm} name='search'>
                  <Row gutter={24}>
                    <Col span={10}>
                      <Form.Item name='headerQuarterId'>
                        <Select placeholder={'Chọn trụ sở'} options={headQuarter}></Select>
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item name='from'>
                        <DatePicker placeholder='Chọn' />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item name='to'>
                        <DatePicker placeholder='Chọn' />
                      </Form.Item>
                    </Col>
                    <Col>
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
          </>

        }
      // extra={

      // }
      >
        <Table
          rowKey='id'
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

      <CreateForm
        onCancel={() => setCreateFormVisible(false)}
        visible={createFormVisible}
        onSubmit={createSubmit}
        onSubmitLoading={createSubmitLoading}
        headerQuater={headQuarter}
        timeFrames={timeFrames}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          headerQuater={headQuarter}
          timeFrames={timeFrames}
        />
      ) : null}
    </div>
  );
}

export default App;
