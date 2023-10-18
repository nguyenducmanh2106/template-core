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
import { TimeFrameModel } from '@/apis/models/TimeFrameModel';
import IconSvg from '@/components/IconSvg';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

import { TableRowSelection } from 'antd/lib/table/interface';
import { values } from 'lodash';
import {
  getTimeFrame,
  deleteTimeFrame,
  deleteManyTimeFrame,
  putTimeFrame,
  postTimeFrame,
} from '@/apis/services/TimeFrameService';
import { Code } from '@/apis';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import UpdateForm from './UpdateForm';
import CreateForm from './CreateForm';
import { HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import { getHeadQuarter } from '@/apis/services/PageService';
import { ConvertHeaderQuarterOptionModel, getAcessHeaderQuater } from '@/utils/convert';

const searchFormItemLayout = {
  labelCol: { span: 3, offset: 0 },
};

var timeFrame: TimeFrameModel[] = [];
var checkedList: string[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const [headQuarters, setHeadQuarters] = useState<SelectOptionModel[]>([]);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<TimeFrameModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    const accessHeadQuarter = getAcessHeaderQuater();
    var dataInclude: SelectOptionModel[] = [];
    ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]).forEach((item: SelectOptionModel) => {
      if (accessHeadQuarter.includes(item.value)) {
        dataInclude.push(item)
      }
    })
    setHeadQuarters(dataInclude);
    const response: ResponseData = await getTimeFrame();
    timeFrame = (response.data || []) as TimeFrameModel[];
    setList((response.data || []) as TimeFrameModel[]);
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
    const list = timeFrame.filter((item: TimeFrameModel) => {
      return item.name?.includes(e.target.value);
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
        const res = await deleteTimeFrame(id);
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
        await deleteManyTimeFrame(undefined, checkedList);
        message.success('Thành công !');
        getList(pagination.current);
        setDeleteLoading([]);
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<TimeFrameModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = timeFrame.find((item: TimeFrameModel) => item.id == id);
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

  const updateSubmit = async (values: TimeFrameModel) => {
    setUpdateSubmitLoading(true);
    const res = await putTimeFrame(undefined, values);
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
  const createSubmit = async (values: Omit<TimeFrameModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postTimeFrame(undefined, values);
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

  const rowSelection: TableRowSelection<TimeFrameModel> = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: TimeFrameModel[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      checkedList = selectedRowKeys as string[];
    },
  };
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  const columns: ColumnsType<TimeFrameModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Khung thời gian',
      dataIndex: 'name',
      render: (_, record) => <span>{record.name}</span>,
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
          <Permission navigation={layoutCode.timeFrame} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Sửa
            </Button>
          </Permission>

          <Divider type='vertical' />
          <Permission navigation={layoutCode.timeFrame} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
            <Permission navigation={layoutCode.timeFrame} bitPermission={PermissionAction.Add} noNode={<></>}>
              <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                Thêm mới
              </Button>
            </Permission>
            <Permission navigation={layoutCode.timeFrame} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
        headQuarters={headQuarters}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          headQuarters={headQuarters}
        />
      ) : null}
    </div>
  );
}

export default App;
