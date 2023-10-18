import { Code, ExamPeriodAPModel } from '@/apis';
import { deleteExamPeriodAp, getExamPeriodAp, postExamPeriodAp, putExamPeriodAp } from '@/apis/services/ExamPeriodApService';
import CreateForm from '@/components/ExamPeriodAp/CreateForm';
import UpdateForm from '@/components/ExamPeriodAp/UpdateForm';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface ExamPeriodApResponse extends ExamPeriodAPModel {
  id: string;
  createdByUserId: string | null;
  createdOnDate: Date
}

interface ExamPeriodApSearchParam {
  name?: string;
  isOpen?: boolean
}

function App() {
  const [searchForm] = Form.useForm();
  const [examPeriodList, setExamPeriodList] = useState<ExamPeriodApResponse[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ExamPeriodApSearchParam>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<ExamPeriodAPModel>>({});
  const [updateId, setUpdateId] = useState<string>('');
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getExamPeriodAp(searchParams.name, searchParams.isOpen);
    setExamPeriodList((response.data || []) as ExamPeriodApResponse[]);
    setPagination({ ...pagination, current: page, total: response.totalCount || 0 });
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(1); }, [searchParams]);

  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({ ...searchParams, ...value });
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: Omit<ExamPeriodAPModel, 'id'>): Promise<void> => {
    let responseData = await postExamPeriodAp('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    closeCreateForm();
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: ExamPeriodAPModel): Promise<void> => {
    let responseData = await putExamPeriodAp(updateId, '', model);
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

  const columns: ColumnsType<ExamPeriodApResponse> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
    },
    {
      title: 'Tên kỳ thi',
      dataIndex: 'name',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      render: (_, record) => <>{moment(record.createdOnDate).format('DD/MM/yyyy HH:mm:ss')}</>
    },
    {
      title: 'Trạng thái',
      dataIndex: ['status'],
      render: (_, record) => {
        if (record.isOpen)
          return <Tag color='blue'>Đang mở</Tag>;
        else
          return <Tag color='red'>Đã kết thúc</Tag>;
      }
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      render: (_, record) =>
        <Space>
          <Permission navigation={layoutCode.examPeriodAp} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateModel({ ...updateModel, ...record });
              setUpdateId(record.id);
            }}>Sửa</Button>
          </Permission>
          <Permission navigation={layoutCode.examPeriodAp} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteExamPeriodAp('', [record.id]);
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
    }
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label='Tên kỳ thi' name='name'>
              <Input placeholder='Nhập tên kỳ thi' />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Trạng thái' name='isOpen'>
              <Select allowClear options={[{ label: 'Đang mở', value: true }, { label: 'Đã kết thúc', value: false }]} />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.examPeriodAp} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.examPeriodAp} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
                      let responseData: ResponseData = await deleteExamPeriodAp('', selectedRowDeleteKeys);
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
        dataSource={examPeriodList}
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
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} updateId={updateId} closeUpdateForm={closeUpdateForm} />
    </div>
  );
}

export default App;
