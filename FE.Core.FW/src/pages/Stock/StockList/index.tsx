import { Code, StockListModel } from '@/apis';
import { AreaModel, SelectOptionModel } from '@/apis/models/data';
import { getArea } from '@/apis/services/PageService';
import { deleteStockList, getStockList, postStockList, putStockList } from '@/apis/services/StockListService';
import Permission from '@/components/Permission';
import CreateForm from '@/components/StockList/CreateForm';
import UpdateForm from '@/components/StockList/UpdateForm';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { ConvertAreaOption } from '@/utils/convert';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
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
  const [updateModel, setUpdateModel] = useState<Partial<StockListModel>>({});
  const [areaData, setAreaData] = useState<SelectOptionModel[]>([]);
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
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
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(1); }, [searchParams]);

  useEffect(() => {
    getArea().then(responseArea => {
      setAreaData(ConvertAreaOption(responseArea.data as AreaModel[]));
    });
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

  const submitCreateForm = async (model: Omit<StockListModel, 'id'>): Promise<void> => {
    let responseData = await postStockList('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    setOpenCreateForm(false);
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: StockListModel): Promise<void> => {
    let responseData = await putStockList('', model);
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
          <Permission navigation={layoutCode.stockList} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
            }}>Sửa</Button>
          </Permission>
          <Permission navigation={layoutCode.stockList} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteStockList('', [record.id]);
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
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.stockList} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.stockList} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type="primary" danger={true} onClick={event => {
              event.currentTarget.blur();
              if (selectedRowDeleteKeys.length == 0) {
                Modal.warning({
                  title: "Vui lòng chọn thông tin muốn xóa"
                });
              }
              else {
                Modal.confirm({
                  title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk: async () => {
                    setLoadingDataState(true);
                    try {
                      let responseData: ResponseData = await deleteStockList('', selectedRowDeleteKeys);
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
            setSelectedRowDeleteKeys([]);
          },
          showTotal: (total: number) => `Total ${total} items`
        }}
        rowSelection={{
          selectedRowKeys: selectedRowDeleteKeys,
          onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
        }}
      />
      <CreateForm openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm} areaData={areaData} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm} areaData={areaData} />
    </div>
  );
}

export default App;
