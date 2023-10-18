import { Code, FaqModel } from '@/apis';
import { ExamTypeModel } from '@/apis/models/data';
import { deleteFaq, getFaq, postFaq, putFaq, updateShowHide } from '@/apis/services/FaqService';
import { getExamType } from '@/apis/services/PageService';
import CreateForm from '@/components/Faq/CreateForm';
import UpdateForm from '@/components/Faq/UpdateForm';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface FaqResponse extends FaqModel {
  id: string,
  createdOnDate: Date
}

interface SearchModel {
  keyword?: string;
  examTypeId?: string;
}

function App() {
  const [searchForm] = Form.useForm();
  const [faqList, setFaqList] = useState<FaqResponse[]>([]);
  const [examTypeList, setExamTypeList] = useState<ExamTypeModel[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: false
  });
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [searchParams, setSearchParams] = useState<Partial<SearchModel>>({});
  const [updateId, setUpdateId] = useState<string>('');
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (): Promise<void> => {
    setLoadingDataState(true);
    const response: ResponseData = await getFaq(searchParams.keyword, searchParams.examTypeId, undefined, undefined, pagination.current, pagination.pageSize);
    setFaqList(response.data as FaqResponse[]);
    setTotalRecord(response.totalCount || 0);
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(); }, [searchParams, pagination]);

  useEffect(() => { getExamType().then(response => setExamTypeList(response.data as ExamTypeModel[])); }, []);

  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({ ...searchParams, ...value });
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: Omit<FaqModel, 'id'>): Promise<void> => {
    let responseData = await postFaq(undefined, model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    closeCreateForm();
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: FaqModel): Promise<void> => {
    let responseData = await putFaq(updateId, undefined, model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Cập nhật thông tin thành công');
    setOpenUpdateForm(false);
    getData();
  };

  const closeCreateForm = () => setOpenCreateForm(false);
  const closeUpdateForm = () => setOpenUpdateForm(false);

  const columns: ColumnsType<FaqResponse> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question'
    },
    {
      title: 'Nhóm bài thi',
      dataIndex: 'examTypeId',
      render: value => <>{examTypeList.find(item => item.id == value)?.name}</>
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isShow',
      render: (_, record) => <>{record.isShow ? <CheckOutlined /> : <CloseOutlined />}</>
    },
    {
      title: 'Vị trí hiển thị',
      dataIndex: 'order'
    },
    {
      title: 'Lượt xem',
      dataIndex: 'view'
    },
    {
      title: 'Lượt thích',
      dataIndex: 'like'
    },
    {
      title: 'Lượt không thích',
      dataIndex: 'dislike'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      render: (_, record) => <>{moment(record.createdOnDate).format('DD/MM/yyyy HH:mm:ss')}</>
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      render: (_, record) =>
        <Space>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setOpenUpdateForm(true);
              setUpdateId(record.id);
            }}>Sửa</Button>
          </Permission>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' onClick={async () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteFaq('', [record.id]);
                    if (responseData.code != Code._200)
                      message.error(responseData.message);
                    else {
                      message.success('Xóa thông tin thành công');
                    }
                  }
                  catch (error) {
                    console.log(error);
                  }
                  setLoadingDataState(false);
                  getData();
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
            <Form.Item label='Tên bài thi' name='examTypeId'>
              <Select
                allowClear
                placeholder='Nhập bài thi'
                options={examTypeList.map(item => ({ label: item.name, value: item.id }))}
                optionFilterProp='label'
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label='Từ khóa tìm kiếm' name='keyword'>
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit'>Tìm kiếm</Button>
          </Col>
        </Row>
      </Form>
      <Divider orientation="left">
        <Space>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Add} noNode={<></>}>
            <Button type="primary" onClick={event => { setOpenCreateForm(true); event.currentTarget.blur(); }}>Thêm mới</Button>
          </Permission>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
                      let responseData: ResponseData = await deleteFaq('', selectedRowDeleteKeys);
                      if (responseData.code != Code._200)
                        message.error(responseData.message);
                      else {
                        message.success('Xóa thông tin thành công');
                        getData();
                      }
                    }
                    catch (error) {
                      console.log(error);
                    }
                    finally {
                      setLoadingDataState(false);
                    }
                  }
                })
              }
            }}>Xóa</Button>
          </Permission>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type="primary" onClick={event => {
              event.currentTarget.blur();
              if (selectedRowDeleteKeys.length == 0) {
                Modal.warning({
                  title: "Vui lòng chọn thông tin muốn ẩn"
                });
                return;
              }
              else {
                Modal.confirm({
                  title: 'Bạn có chắc chắn muốn ẩn thông tin này?',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk: async () => {
                    setLoadingDataState(true);
                    try {
                      let responseData: ResponseData = await updateShowHide(false, undefined, selectedRowDeleteKeys);
                      if (responseData.code != Code._200)
                        message.error(responseData.message);
                      else {
                        message.success('Ẩn thông tin thành công');
                        getData();
                      }
                    }
                    catch (error) {
                      console.log(error);
                    }
                    finally {
                      setLoadingDataState(false);
                    }
                  }
                })
              }
            }}>Ẩn</Button>
          </Permission>
          <Permission navigation={layoutCode.faq} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type="primary" onClick={event => {
              event.currentTarget.blur();
              if (selectedRowDeleteKeys.length == 0) {
                Modal.warning({
                  title: "Vui lòng chọn thông tin muốn hiển thị"
                });
                return;
              }
              else {
                Modal.confirm({
                  title: 'Bạn có chắc chắn muốn hiển thị thông tin này?',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk: async () => {
                    setLoadingDataState(true);
                    try {
                      let responseData: ResponseData = await updateShowHide(true, undefined, selectedRowDeleteKeys);
                      if (responseData.code != Code._200)
                        message.error(responseData.message);
                      else {
                        message.success('Hiển thị thông tin thành công');
                        getData();
                      }
                    }
                    catch (error) {
                      console.log(error);
                    }
                    finally {
                      setLoadingDataState(false);
                    }
                  }
                })
              }
            }}>Hiển thị</Button>
          </Permission>
        </Space>
      </Divider>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={faqList}
        loading={loadingDataState}
        pagination={{
          ...pagination,
          total: totalRecord,
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
      <CreateForm openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm} examTypeList={examTypeList} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateId={updateId} closeUpdateForm={closeUpdateForm} examTypeList={examTypeList} />
    </div>
  );
}

export default App;
