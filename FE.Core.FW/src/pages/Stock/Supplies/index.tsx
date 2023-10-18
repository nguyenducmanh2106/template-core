import { Code, SuppliesGroupModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { getSuppliesKind } from '@/apis/services/SuppliesKindService';
import { getSuppliesGroup } from '@/apis/services/SuppliesGroupService';
import { deleteSupplies, getSupplies, postSupplies, putSupplies } from '@/apis/services/SuppliesService';
import Permission from '@/components/Permission';
import CreateForm from '@/components/Supplies/CreateForm';
import UpdateForm from '@/components/Supplies/UpdateForm';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface EntityFromDb {
  id: string;
  code: string | undefined;
  suppliesGroupId: string | undefined;
  suppliesKindId: string | undefined;
  createdByUserId: string | null;
  createdOnDate: Date;
  expiryDate: string | null;
}

function App() {
  const [searchForm] = Form.useForm();
  const [suppliesList, setsuppliesList] = useState<EntityFromDb[]>([]);
  const [suppliesKindList, setsuppliesKindList] = useState<SuppliesKindModel[]>([]);
  const [suppliesGroupList, setSuppliesGroupList] = useState<SuppliesGroupModel[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<Partial<EntityFromDb>>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<SuppliesModel>>({});
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getSupplies(searchParams.code, searchParams.suppliesGroupId, searchParams.suppliesKindId);
    setsuppliesList((response.data || []) as EntityFromDb[]);
    setPagination({
      ...pagination,
      current: page,
      total: response.totalCount || 0,
    });
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(1); }, [searchParams]);
  useEffect(() => {
    getSuppliesKind().then(response => setsuppliesKindList(response.data as SuppliesKindModel[]));
    getSuppliesGroup().then(response => setSuppliesGroupList(response.data as SuppliesGroupModel[]));
  }, []);

  const searchFormSubmit = async (value: any) => {
    try {
      console.log(value);
      setSearchParams({
        ...searchParams,
        ...value
      });

      setPagination({
        ...pagination,
        current: 1
      });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: Omit<SuppliesModel, 'id'>): Promise<void> => {
    let responseData = await postSupplies('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    setOpenCreateForm(false);
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: SuppliesModel): Promise<void> => {
    let responseData = await putSupplies('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Cập nhật thông tin thành công');
    setOpenUpdateForm(false);
    getData(pagination.current);
  };

  const closeCreateForm = () => setOpenCreateForm(false);
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
      title: 'Mã vật tư',
      dataIndex: ['code'],
    },
    {
      title: 'Loại vật tư',
      dataIndex: ['suppliesKindId'],
      render: (_, record) => <>{suppliesKindList.find(item => item.id == record.suppliesKindId)?.name}</>
    },
    {
      title: 'Nhóm vật tư',
      dataIndex: ['suppliesGroupId'],
      render: (_, record) => {
        let suppliesKind = suppliesKindList.find(item => item.id == record.suppliesKindId);
        return <>{suppliesGroupList.find(item => item.id == suppliesKind?.suppliesGroupId)?.name}</>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      render: (_, record) => <>{moment(record.createdOnDate).format('DD/MM/yyyy HH:mm:ss')}</>
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByUserId',
      render: (_, record) => <>{''}</>
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      render: (_, record) =>
        <Space>
          <Permission navigation={layoutCode.supplies} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
            }}>Sửa</Button>
          </Permission>
          <Permission navigation={layoutCode.supplies} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteSupplies('', [record.id]);
                    if (responseData.code != Code._200)
                      message.error(responseData.message);
                    else {
                      getData(pagination.current);
                      message.success('Xóa thông tin thành công');
                    }
                  }
                  catch (error) {
                    console.log(error);
                  }
                  setLoadingDataState(false);
                }
              })
            }}>Xóa</Button>
          </Permission>
        </Space>
    }
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label='Mã vật tư' name='code'>
              <Input placeholder='Nhập mã loại vật tư' />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Nhóm vật tư' name='suppliesGroupId'>
              <Select allowClear showSearch optionFilterProp='label' options={suppliesGroupList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Loại vật tư' name='suppliesKindId'>
              <Select allowClear showSearch optionFilterProp='label' options={suppliesKindList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.supplies} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.supplies} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type="primary" danger={true} onClick={event => {
              event.currentTarget.blur();
              if (selectedRowDeleteKeys.length == 0) {
                Modal.warning({
                  title: "Vui lòng chọn thông tin muốn xóa"
                });
                return;
              }
              else {
                Modal.confirm({
                  title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk: async () => {
                    setLoadingDataState(true);
                    try {
                      let responseData: ResponseData = await deleteSupplies('', selectedRowDeleteKeys);
                      if (responseData.code != Code._200)
                        message.error(responseData.message);
                      else {
                        getData(pagination.current);
                        message.success('Xóa thông tin thành công');
                      }
                    }
                    catch (error) {
                      console.log(error);
                    }
                    setLoadingDataState(false);
                    getData(pagination.current);
                  }
                })
              }
            }}>Xóa</Button>
          </Permission>
        </Space>
      </Divider>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={suppliesList}
        loading={loadingDataState}
        pagination={{
          ...pagination,
          onChange: (page: number, pageSize: number) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize
            });
            setSelectedRowDeleteKeys([]);
          },
          showTotal: (total: number) => `Total ${total} items`
        }}
        rowSelection={{
          selectedRowKeys: selectedRowDeleteKeys,
          onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
        }}
      />
      <CreateForm openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm}
        suppliesKindList={suppliesKindList} suppliesGroupList={suppliesGroupList} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm}
        suppliesKindList={suppliesKindList} suppliesGroupList={suppliesGroupList} />
    </div>
  );
}

export default App;
