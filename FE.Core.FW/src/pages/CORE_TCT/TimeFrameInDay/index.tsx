import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  PaginationProps,
  Radio,
  Row,
  Space,
  Table,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { TimeFrameInDayModel, TimeFrameInDayModelCustom } from '@/apis/models/TimeFrameInDayModel';
import IconSvg from '@/components/IconSvg';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

import { TableRowSelection } from 'antd/lib/table/interface';

import { Code, TimeFrameModel } from '@/apis';
import {
  getTimeFrameInDay,
  deleteTimeFrameInDay,
  deleteManyTimeFrameInDay,
  putTimeFrameInDay,
  postTimeFrameInDay,
} from '@/apis/services/TimeFrameInDayService';
import { getTimeFrame } from '@/apis/services/TimeFrameService';
import { ConvertTimeFrameOptionModel, getAcessHeaderQuater } from '@/utils/convert';
import { SelectOptionModel } from '@/apis/models/data';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import UpdateForm from './UpdateForm';
import CreateForm from './CreateForm';

var timeFrameInDay: TimeFrameInDayModel[] = [];
var timeFrame: SelectOptionModel[] = [];
var checkedList: string[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<TimeFrameInDayModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);

    const response: ResponseData = await getTimeFrameInDay();
    const responseTimeFrame: ResponseData = await getTimeFrame();
    const dataRes = (responseTimeFrame.data || []) as TimeFrameModel[];
    const accessHeadQuarter = getAcessHeaderQuater();
    var dataInclude: TimeFrameModel[] = [];
    dataRes.forEach((item: TimeFrameModel) => {
      if (accessHeadQuarter.includes(item.headQuarterId as string)) {
        dataInclude.push(item)
      }
    })
    timeFrame = ConvertTimeFrameOptionModel(dataInclude);
    timeFrameInDay = (response.data || []) as TimeFrameInDayModel[];
    setList((response.data || []) as TimeFrameInDayModel[]);
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
    const listTimeFrame = timeFrame.filter((item: SelectOptionModel) => {
      return item.label?.includes(e.target.value);
    });
    const ids = listTimeFrame.map((p) => p.value);
    const list = timeFrameInDay.filter((item: TimeFrameInDayModel) => {
      return ids.includes(item.sysTimeFrameId as string);
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
        const res = await deleteTimeFrameInDay(id);
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

  const deleteSelectTableData = () => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(checkedList);
        await deleteManyTimeFrameInDay(undefined, checkedList);
        message.success('Thành công !');
        getList(pagination.current);
        setDeleteLoading([]);
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<TimeFrameInDayModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = timeFrameInDay.find((item: TimeFrameInDayModel) => item.id == id);
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

  const updateSubmit = async (values: TimeFrameInDayModel) => {
    setUpdateSubmitLoading(true);
    const res = await putTimeFrameInDay(undefined, values);
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
  const createSubmit = async (values: Omit<TimeFrameInDayModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postTimeFrameInDay(undefined, values);
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

  const rowSelection: TableRowSelection<TimeFrameInDayModel> = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: TimeFrameInDayModel[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      checkedList = selectedRowKeys as string[];
    },
  };
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  const columns: ColumnsType<TimeFrameInDayModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Khung thời gian',
      dataIndex: 'sysTimeFrameId',
      render: (_, record) => <span>{timeFrame.find((p) => p.value == record.sysTimeFrameId)?.label}</span>,
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
            <Permission navigation={layoutCode.timeFrameInDay} bitPermission={PermissionAction.Delete} noNode={<></>}>
              <Button type='primary' danger onClick={() => deleteSelectTableData()}>
                Xóa
              </Button>
            </Permission>

          </Space>
        }
        extra={
          <div>
            <Input.Search
              placeholder='Tìm kiếm'
              style={{ width: '270px', marginLeft: '16px' }}
              onChange={handleChange}
            />
          </div>
        }
      >
        <Table
          rowKey='id'
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
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
        timeFrames={timeFrame}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          timeFrames={timeFrame}
        />
      ) : null}
    </div>
  );
}

export default App;
