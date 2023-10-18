import { Code, SuppliesCategoryModel, SuppliesGroupModel, SuppliesKindModel } from '@/apis';
import { getSuppliesCategory } from '@/apis/services/SuppliesCategoryService';
import { getSuppliesGroup } from '@/apis/services/SuppliesGroupService';
import { deleteSuppliesKind, getSuppliesKind, postSuppliesKind, putSuppliesKind } from '@/apis/services/SuppliesKindService';
import Permission from '@/components/Permission';
import CreateForm from '@/components/SuppliesKind/CreateForm';
import UpdateForm from '@/components/SuppliesKind/UpdateForm';
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
  name: string | undefined;
  suppliesGroupId: string | undefined;
  suppliesCategoryId: string | undefined;
  note: string | undefined;
  isActive: boolean | undefined;
  createdByUserId: string | null;
  createdOnDate: Date
}

function App() {
  const [searchForm] = Form.useForm();
  const [suppliesKindList, setsuppliesKindList] = useState<EntityFromDb[]>([]);
  const [suppliesCategoryList, setSuppliesCategoryList] = useState<SuppliesCategoryModel[]>([]);
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
  const [updateModel, setUpdateModel] = useState<Partial<SuppliesKindModel>>({});
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getSuppliesKind(searchParams.name, searchParams.suppliesGroupId, searchParams.suppliesCategoryId);
    setsuppliesKindList((response.data || []) as EntityFromDb[]);
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
    getSuppliesCategory().then(response => setSuppliesCategoryList(response.data as SuppliesCategoryModel[]));
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

  const submitCreateForm = async (model: Omit<SuppliesKindModel, 'id'>): Promise<void> => {
    let responseData = await postSuppliesKind('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    setOpenCreateForm(false);
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: SuppliesKindModel): Promise<void> => {
    let responseData = await putSuppliesKind('', model);
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
      title: 'Mã loại vật tư',
      dataIndex: ['code'],
    },
    {
      title: 'Tên loại vật tư',
      dataIndex: ['name'],
    },
    {
      title: 'Nhóm vật tư',
      dataIndex: ['suppliesGroupId'],
      render: (_, record) => <>{suppliesGroupList.find(item => item.id == record.suppliesGroupId)?.name}</>
    },
    {
      title: 'Danh mục vật tư',
      dataIndex: ['suppliesCategoryId'],
      render: (_, record) => <>{suppliesCategoryList.find(item => item.id == record.suppliesCategoryId)?.name}</>
    },
    {
      title: 'Trạng thái',
      dataIndex: ['isActive'],
      render: (_, record) => <>{record.isActive ? <CheckOutlined /> : <CloseOutlined />}</>
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
          <Permission navigation={layoutCode.suppliesKind} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
            }}>Sửa</Button>
          </Permission>
          <Permission navigation={layoutCode.suppliesKind} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteSuppliesKind('', [record.id]);
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
            <Form.Item label='Tên loại vật tư' name='name'>
              <Input placeholder='Nhập tên loại vật tư' />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Nhóm vật tư' name='suppliesGroupId'>
              <Select allowClear showSearch optionFilterProp='label' options={suppliesGroupList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Danh mục vật tư' name='suppliesCategoryId'>
              <Select allowClear showSearch optionFilterProp='label' options={suppliesCategoryList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.suppliesKind} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.suppliesKind} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
                      let responseData: ResponseData = await deleteSuppliesKind('', selectedRowDeleteKeys);
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
        dataSource={suppliesKindList}
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
        suppliesCategoryList={suppliesCategoryList} suppliesGroupList={suppliesGroupList} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm}
        suppliesCategoryList={suppliesCategoryList} suppliesGroupList={suppliesGroupList} />
    </div>
  );
}

export default App;
