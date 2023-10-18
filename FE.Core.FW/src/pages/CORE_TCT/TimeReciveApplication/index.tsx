import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  PaginationProps,
  Space,
  Table,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, TimeFrameModel, TimeReciveApplicationModel } from '@/apis';
import { ConvertHeaderQuarterOptionModel, ConvertTimeFrameOptionModel, getAcessHeaderQuater } from '@/utils/convert';
import { HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { deleteTimeReciveApplication, getTimeReciveApplication, postTimeReciveApplication, putTimeReciveApplication } from '@/apis/services/TimeReciveApplicationService';
import { getHeadQuarter } from '@/apis/services/PageService';
import CreateForm from './CreateForm';
import UpdateForm from './UpdateForm';

var timeFrameInDay: TimeReciveApplicationModel[] = [];
var timeReciveApplication: SelectOptionModel[] = [];
var headQuarter: SelectOptionModel[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<TimeReciveApplicationModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);

    const response: ResponseData = await getTimeReciveApplication();
    const accessHeadQuarter = getAcessHeaderQuater();
    var dataInclude: TimeFrameModel[] = [];
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    headQuarter = ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]);
    timeReciveApplication = ConvertTimeFrameOptionModel(dataInclude);
    setList((response.data || []) as TimeReciveApplicationModel[]);
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
  const [search, setSearch]: [string, (search: string) => void] = useState('');

  const handleChange = (e: { target: { value: string } }) => {
    setSearch(e.target.value);
   
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
        const res = await deleteTimeReciveApplication(id);
        if (res.code == Code._200) {
          message.success('Thành công !');
          getList(pagination.current);
          setDeleteLoading([]);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<TimeReciveApplicationModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = list.find((item: TimeReciveApplicationModel) => item.id == id);
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

  const updateSubmit = async (values: TimeReciveApplicationModel) => {
    setUpdateSubmitLoading(true);
    const res = await putTimeReciveApplication(undefined, values);
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
  const createSubmit = async (values: Omit<TimeReciveApplicationModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postTimeReciveApplication(undefined, values);
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
  const searchFormSubmit = async () => {
    try {
      // const fieldsValue = await searchForm.validateFields();
      message.warning('Tìm kiếm!');
    } catch (error: any) {
      console.log(error);
    }
  };

  const columns: ColumnsType<TimeReciveApplicationModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Trụ sở',
      dataIndex: 'sysTimeFrameId',
      render: (_, record) => <span>{headQuarter.find((p) => p.value == record.headerQuarterId)?.label}</span>,
    },
    {
      title: 'Thời gian trong tuần',
      dataIndex: 'weekdays',
      render: (_, record) => <span>{record.weekdays}</span>,
    },
    {
      title: 'Thời gian cuối tuần',
      dataIndex: 'weekend',
      render: (_, record) => <span>{record.weekend}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.timeFrameInDay} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Sửa
            </Button>
          </Permission>
          <Divider type='vertical' />
          <Permission navigation={layoutCode.timeFrameInDay} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
          <Space>
            <Permission navigation={layoutCode.timeFrameInDay} bitPermission={PermissionAction.Add} noNode={<></>}>
              <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                Thêm mới
              </Button>
            </Permission>
          </Space>
        }
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
            showTotal,
          }}
        />
      </Card>

      <CreateForm
        onCancel={() => setCreateFormVisible(false)}
        visible={createFormVisible}
        onSubmit={createSubmit}
        onSubmitLoading={createSubmitLoading}
        headQuarter={headQuarter}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          headQuarter={headQuarter}
        />
      ) : null}
    </div>
  );
}

export default App;
