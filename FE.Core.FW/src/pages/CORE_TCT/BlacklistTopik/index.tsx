import { BlacklistTopikModel, Code } from '@/apis';
import { BlacklistTopikResponse } from '@/apis/models/data';
import { deleteBlacklistTopik, getBlacklistTopik, postBlacklistTopik, postBlacklistTopikImport, putBlacklistTopik } from '@/apis/services/BlacklistTopikService';
import CreateForm from '@/components/BlacklistTopik/CreateForm';
import UpdateForm from '@/components/BlacklistTopik/UpdateForm';
import ImportForm from '@/components/BlacklistTopik/ImportForm';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, DatePicker, Divider, Form, Input, message, Modal, Row, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface SearchParams {
  fullName?: string;
  dateOfBirth?: string;
  identityNo?: string;
}

function App() {
  const dateFormat = 'DD/MM/YYYY';
  const [searchForm] = Form.useForm();
  const [blacklistTopikList, setBlacklistTopikList] = useState<BlacklistTopikResponse[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [openImportForm, setOpenImportForm] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<Partial<SearchParams>>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<BlacklistTopikModel>>({});
  const [updateId, setUpdateId] = useState<string>('');
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getBlacklistTopik(searchParams.fullName, searchParams.dateOfBirth, searchParams.identityNo);
    setBlacklistTopikList((response.data || []) as BlacklistTopikResponse[]);
    setPagination({ ...pagination, current: page, total: response.totalCount || 0 });
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(1); }, [searchParams]);

  const searchFormSubmit = async (value: any) => {
    try {
      console.log(value);
      value.dateOfBirth = value.dateOfBirth != null ? value.dateOfBirth.format('YYYY-MM-DD') : '';
      setSearchParams({ ...searchParams, ...value });
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: BlacklistTopikModel): Promise<void> => {
    let responseData = await postBlacklistTopik('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    setOpenCreateForm(false);
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: BlacklistTopikModel): Promise<void> => {
    let responseData = await putBlacklistTopik(updateId, '', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Cập nhật thông tin thành công');
    setOpenUpdateForm(false);
    getData(pagination.current);
  };

  const submitImportForm = async (file: Blob): Promise<void> => {
    let responseData = await postBlacklistTopikImport('', { formFile: file });
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Nhập dữ liêu thông tin thành công');
    setOpenImportForm(false);
    getData(1);
  };

  const closeCreateForm = () => setOpenCreateForm(false);
  const closeUpdateForm = () => setOpenUpdateForm(false);
  const closeImportForm = () => setOpenImportForm(false);

  const columns: ColumnsType<BlacklistTopikResponse> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (_, record) => <>{record.fullName}</>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      render: (_, record) => <>{moment(record.dateOfBirth).format(dateFormat)}</>,
    },
    {
      title: 'Số giấy tờ',
      dataIndex: 'cccd',
      render: (_, record) => {
        let paperNo = '';
        if (record.identityCard != null && record.identityCard.length > 0) paperNo = record.identityCard
        else if (record.citizenIdentityCard != null && record.citizenIdentityCard.length > 0) paperNo = record.citizenIdentityCard
        else if (record.passport != null && record.passport.length > 0) paperNo = record.passport
        return <>{paperNo}</>
      },
    },
    {
      title: 'Ngày thông báo',
      dataIndex: 'notifyResultDate',
      render: (_, record) => <>{(record.notifyResultDate != null ? moment(record.notifyResultDate).format(dateFormat) : '')}</>
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'finishPunishmentDate',
      render: (_, record) => <>{record.finishPunishmentDate != null ? (moment(record.finishPunishmentDate).format(dateFormat)) : ''}</>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      render: (_, record) => <>{record.note}</>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.blackListTopik} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
              setUpdateId(record.id);
            }}>Sửa</Button>
          </Permission>
          <Divider type='vertical' />
          <Permission navigation={layoutCode.blackListTopik} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteBlacklistTopik('', [record.id]);
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
        </>
      ),
    },
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col>
            <Form.Item label='Họ tên' name='fullName'>
              <Input placeholder='Nhập họ tên' />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label='Ngày sinh' name='dateOfBirth'>
              <DatePicker format='DD/MM/YYYY' placeholder='Nhập ngày sinh' />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label='Số giấy tờ' name='identityNo'>
              <Input placeholder='Nhập số giấy tờ' />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.blackListTopik} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Space>
              <Button key='add' type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
              <Button key='import' type="primary" onClick={event => { setOpenImportForm(true); event.currentTarget.blur(); }}>Import file</Button>
            </Space>
          </Permission>
          <Permission navigation={layoutCode.blackListTopik} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
                      let responseData: ResponseData = await deleteBlacklistTopik('', selectedRowDeleteKeys);
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
        dataSource={blacklistTopikList}
        loading={loadingDataState}
        pagination={{
          ...pagination,
          onChange: (page: number, pageSize: number) => {
            setPagination({ ...pagination, current: page, pageSize: pageSize });
            setSelectedRowDeleteKeys([]);
          },
          showTotal: (total: number) => `Total ${total} items`
        }}
        rowSelection={{
          selectedRowKeys: selectedRowDeleteKeys,
          onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
        }}
      />
      <CreateForm openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm} />
      <ImportForm isOpen={openImportForm} onCancel={closeImportForm} onSubmit={submitImportForm} />
    </div>
  );
}

export default App;
