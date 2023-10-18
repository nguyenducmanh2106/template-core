import { StockListModel, UserManageStockUpdateModel, UserModel } from '@/apis';
import { AreaModel, SelectOptionModel } from '@/apis/models/data';
import { getArea } from '@/apis/services/PageService';
import { getStockList } from '@/apis/services/StockListService';
import { postUserManageStock } from '@/apis/services/UserManageStockService';
import { getUser } from '@/apis/services/UserService';
import Permission from '@/components/Permission';
import UpdateForm from '@/components/UserManageStock/UpdateForm';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { ConvertAreaOption } from '@/utils/convert';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, Divider, Form, Input, message, Row, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';

interface EntityFromDb {
  id: string;
  code: string | undefined;
  name: string | undefined;
  note: string | undefined;
  areaId: string | undefined;
  createdByUserId: string | null;
  createdOnDate: Date
}

function App() {
  const [searchForm] = Form.useForm();
  const [stockList, setStockList] = useState<EntityFromDb[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<Partial<EntityFromDb>>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<StockListModel>>({});
  const [areaData, setAreaData] = useState<SelectOptionModel[]>([]);
  const [listUser, setListUser] = useState<UserModel[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getStockList('', searchParams.name, searchParams.areaId);
    setStockList((response.data || []) as EntityFromDb[]);
    setPagination({
      ...pagination,
      current: page,
      total: response.totalCount || 0,
    });
    setLoadingDataState(false);
  };

  useEffect(() => { getData(1); }, [searchParams]);

  useEffect(() => {
    getArea().then(responseArea => {
      setAreaData(ConvertAreaOption(responseArea.data as AreaModel[]));
    });

    getUser('', 1, Math.pow(2, 31) - 1)
      .then(response => setListUser(response.data as UserModel[]))
  }, []);

  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({
        ...searchParams,
        areaId: value.areaId,
        name: value.name
      });

      setPagination({
        ...pagination,
        current: 1
      });

    } catch (error) {
      console.log(error);
    }
  };

  const submitUpdateForm = async (model: UserManageStockUpdateModel): Promise<void> => {
    let responseData = await postUserManageStock('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Cập nhật thông tin thành công');
    setOpenUpdateForm(false);
    getData(pagination.current);
  };

  const closeUpdateForm = () => setOpenUpdateForm(false);

  const columns: ColumnsType<EntityFromDb> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
    },
    {
      title: 'Tên kho',
      dataIndex: ['name'],
    },
    {
      title: 'Mã kho',
      dataIndex: ['code'],
    },
    {
      title: 'Khu vực',
      dataIndex: ['areaId'],
      render: (_, record) => <>{areaData.find(value => value.key == record.areaId)?.label}</>
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      render: (_, record) =>
        <Space>
          <Permission navigation={layoutCode.stockList} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
            }}>Phân quyền</Button>
          </Permission>
        </Space>
    }
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label='Tên kho' name='name'>
              <Input placeholder='Nhập tên kho' />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Khu vực' name='areaId'>
              <Select options={areaData} placeholder='Nhập khu vực' allowClear={true} />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider />
      <Table
        rowKey='id'
        columns={columns}
        dataSource={stockList}
        loading={loadingDataState}
        pagination={{
          ...pagination,
          onChange: (page: number, pageSize: number) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize
            });
          },
          showTotal: (total: number) => `Total ${total} items`
        }}
      />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm} listUser={listUser} />
    </div>
  );
}

export default App;
