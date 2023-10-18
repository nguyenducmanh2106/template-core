import { Code, ImportStockReceiptModel, StockListModel, SupplierModel, SuppliesCategoryModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { ApproveReceiptModel, AreaModel, ImportStockReceiptResponse, SelectOptionModel } from '@/apis/models/data';
import { deleteImportStockReceipt, getImportStockReceipt, postApprove, postImportStockReceipt, postSendForApproval, putImportStockReceipt } from '@/apis/services/ImportStockReceiptService';
import { getArea } from '@/apis/services/PageService';
import { getStockList } from '@/apis/services/StockListService';
import { getSupplier } from '@/apis/services/SupplierService';
import { getSuppliesCategory } from '@/apis/services/SuppliesCategoryService';
import { getSuppliesKind } from '@/apis/services/SuppliesKindService';
import { getSupplies } from '@/apis/services/SuppliesService';
import { getListStockUserManage } from '@/apis/services/UserManageStockService';
import { getListProposalCodeApproved } from '@/apis/services/ImportStockProposalService';
import CreateForm from '@/components/ImportStockReceipt/CreateForm';
import DetailForm from '@/components/ImportStockReceipt/Detail';
import UpdateForm from '@/components/ImportStockReceipt/UpdateForm';
import Permission from '@/components/Permission';
import { importStockReceiptStatus, layoutCode, PermissionAction, userApproveType } from '@/utils/constants';
import { ConvertAreaOption } from '@/utils/convert';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface SearchParam {
  importStockProposalCode: string | undefined;
  stockId: string | undefined;
  supplierId: string | undefined;
  importMethod: number | undefined;
}

function App() {
  const [searchForm] = Form.useForm();
  const [receiptList, setReceiptList] = useState<ImportStockReceiptResponse[]>([]);
  const [suppliesKindList, setSuppliesKindList] = useState<SuppliesKindModel[]>([]);
  const [suppliesCategoryList, setSuppliesCategoryList] = useState<SuppliesCategoryModel[]>([]);
  const [suppliesList, setSuppliesList] = useState<SuppliesModel[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [openDetailForm, setOpenDetailForm] = useState<boolean>(false);
  const [areaData, setAreaData] = useState<SelectOptionModel[]>([]);
  const [stockList, setStockList] = useState<StockListModel[]>([]);
  const [supplierList, setSupplierList] = useState<SupplierModel[]>([]);
  const [listStockUserManage, setListStockUserManage] = useState<string[]>([]);
  const [listProposalApprovedCode, setListProposalApprovedCode] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<Partial<SearchParam>>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<ImportStockReceiptResponse>>({});
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getImportStockReceipt(searchParams.importStockProposalCode, searchParams.importMethod, searchParams.supplierId, searchParams.stockId);
    setReceiptList((response.data || []) as ImportStockReceiptResponse[]);
    setPagination({
      ...pagination,
      current: page,
      total: response.totalCount || 0,
    });
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({ ...searchParams, ...value });
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: ImportStockReceiptModel, isSendForApproval: boolean = false): Promise<void> => {
    let responseCreate = await postImportStockReceipt('', model);
    if (responseCreate.code != Code._200) {
      message.error(responseCreate.message);
      return;
    }

    if (isSendForApproval) {
      let responseApproval = await postSendForApproval('', responseCreate.data as string);
      if (responseApproval.code != Code._200) {
        message.error(responseCreate.message);
        return;
      }
    }

    message.success('Lưu thông tin thành công');
    closeCreateForm();
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: ImportStockReceiptModel, isSendForApproval: boolean = false): Promise<void> => {
    let responseCreate = await putImportStockReceipt('', model);

    if (responseCreate.code != Code._200) {
      message.error(responseCreate.message);
      return;
    }

    if (isSendForApproval) {
      let responseApproval = await postSendForApproval('', model.id);
      if (responseApproval.code != Code._200) {
        message.error(responseCreate.message);
        return;
      }
    }

    message.success('Cập nhật thông tin thành công');
    closeUpdateForm();
    getData(pagination.current);
  };

  const approveReceipt = async (model: ApproveReceiptModel): Promise<void> => {
    let responseData = await postApprove('', model);
    if (responseData.code != Code._200) {
      message.error(responseData.message);
      return;
    }

    message.success('Cập nhật thông tin thành công');
    closeDetailForm();
    getData(pagination.current);
  };

  const closeCreateForm = () => setOpenCreateForm(false);

  const closeUpdateForm = () => setOpenUpdateForm(false);

  const closeDetailForm = () => setOpenDetailForm(false);

  useEffect(() => { getData(1); }, [searchParams]);

  useEffect(() => {
    getArea().then(responseArea => {
      setAreaData(ConvertAreaOption(responseArea.data as AreaModel[]));
    });
    getStockList().then(response => setStockList(response.data as StockListModel[]));
    getSupplier().then(response => setSupplierList(response.data as StockListModel[]));
    getListStockUserManage(userApproveType.receipt).then(responseData => setListStockUserManage(responseData.data as string[]));
  }, []);

  useEffect(() => {
    if (openUpdateForm || openDetailForm) {
      if (suppliesKindList.length == 0) {
        getSuppliesKind().then(responseData => setSuppliesKindList(responseData.data as SuppliesKindModel[]));
      }

      if (suppliesCategoryList.length == 0) {
        getSuppliesCategory().then(responseData => setSuppliesCategoryList(responseData.data as SuppliesCategoryModel[]));
      }

      if (suppliesList.length == 0) {
        getSupplies().then(responseData => setSuppliesList(responseData.data as SuppliesModel[]));
      }
    }
  }, [openUpdateForm, openDetailForm]);

  useEffect(() => {
    if ((openCreateForm || openUpdateForm) && listProposalApprovedCode.length == 0) {
      getListProposalCodeApproved().then(responseData => setListProposalApprovedCode(responseData.data as string[]));
    }
  }, [openCreateForm, openUpdateForm]);

  const columns: ColumnsType<ImportStockReceiptResponse> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
    },
    {
      title: 'Mã phiếu',
      dataIndex: ['code'],
    },
    {
      title: 'Phương thức nhập',
      dataIndex: ['importMethod'],
      render: (_, record) => <>{record.importMethod == 1 ? 'Vật tư' : 'Đề thi'}</>
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierId',
      render: (_, record) => <>{supplierList.find(item => item.id == record.supplierId)?.name}</>
    },
    {
      title: 'Kho hàng',
      dataIndex: 'stockId',
      render: (_, record) => <>{stockList.find(item => item.id == record.stockId)?.name}</>
    },
    {
      title: 'Ngày đề xuất',
      dataIndex: 'datePropose',
      render: (_, record) => <>{moment(record.datePropose).format('DD/MM/YYYY')}</>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => {
        switch (record.status) {
          case importStockReceiptStatus.draft:
            return <Tag color="default">Bản nháp</Tag>
          case importStockReceiptStatus.waitingForApprove:
            return <Tag color="processing">Chờ duyệt</Tag>
          case importStockReceiptStatus.approve:
            return <Tag color="success">Phê duyệt</Tag>
          case importStockReceiptStatus.reject:
            return <Tag color="error">Từ chối</Tag>
          default:
            return <></>
        }
      }
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      render: (_, record) =>
        record.status == importStockReceiptStatus.draft ? (
          <Space>
            <Permission navigation={layoutCode.importStockReceipt} bitPermission={PermissionAction.Edit} noNode={<></>}>
              <Button type='link' onClick={() => {
                setOpenUpdateForm(true);
                setUpdateModel({ ...updateModel, ...record });
              }}>Sửa</Button>
            </Permission>
            <Permission navigation={layoutCode.importStockReceipt} bitPermission={PermissionAction.Delete} noNode={<></>}>
              <Button type='link' onClick={async () => {
                Modal.confirm({
                  title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk: async () => {
                    setLoadingDataState(true);
                    try {
                      let responseData: ResponseData = await deleteImportStockReceipt('', [record.id]);
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
              }}>Xóa</Button>
            </Permission>
          </Space>
        ) : (
          <Button type='link' onClick={() => { setOpenDetailForm(true); setUpdateModel({ ...updateModel, ...record }); }}>Xem</Button>
        )
    }
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item label='Số đề nghị' name='importStockProposalCode'>
              <Input placeholder='Nhập số đề nghị' />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label='Loại đề xuất' name='importMethod'>
              <Select allowClear options={[{ label: 'Vật tư', value: 1 }, { label: 'Đề thi', value: 2 }]} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label='Nhà cung cấp' name='supplierId'>
              <Select allowClear showSearch optionFilterProp='label' options={supplierList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label='Kho đặt hàng' name='stockId'>
              <Select allowClear showSearch optionFilterProp='label' options={stockList.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.supplier} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.supplier} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
                      let responseData: ResponseData = await deleteImportStockReceipt('', selectedRowDeleteKeys);
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
        dataSource={receiptList}
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
      <CreateForm key={1} openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm} areaData={areaData}
        stockList={stockList} supplierList={supplierList} listProposalApprovedCode={listProposalApprovedCode}
      />
      <UpdateForm key={2} openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} closeUpdateForm={closeUpdateForm} areaData={areaData}
        stockList={stockList} supplierList={supplierList} suppliesCategory={suppliesCategoryList} suppliesKind={suppliesKindList} updateModel={updateModel}
        suppliesList={suppliesList} listProposalApprovedCode={listProposalApprovedCode}
      />
      <DetailForm key={3} openDetailModal={openDetailForm} closeDetailModal={closeDetailForm} areaData={areaData} approveReceipt={approveReceipt}
        stockList={stockList} supplierList={supplierList} suppliesCategory={suppliesCategoryList} suppliesKind={suppliesKindList} updateModel={updateModel}
        suppliesList={suppliesList} listStockUserManage={listStockUserManage}
      />
    </div>
  );
}

export default App;
