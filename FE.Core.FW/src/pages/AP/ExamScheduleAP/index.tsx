import { Code, ExamPeriodAPModel } from '@/apis';
import { ExamModel, ExamWorkShiftModel, ExamPeriodResponse } from '@/apis/models/data';
import { ExamScheduleAPModel } from '@/apis/models/ExamScheduleAPModel';
import { getExamPeriodAp } from '@/apis/services/ExamPeriodApService';
import { deleteExamScheduleAp, getExamScheduleAp, postExamScheduleAp, putExamScheduleAp } from '@/apis/services/ExamScheduleApService';
import { getExam, getExamWorkShift } from '@/apis/services/PageService';
import CreateForm from '@/components/ExamScheduleAp/CreateForm';
import UpdateForm from '@/components/ExamScheduleAp/UpdateForm';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Table, Tag, DatePicker } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

let exam: ExamModel[] = [];
let examWorkShift: ExamWorkShiftModel[] = [];
let examPeriod: ExamPeriodResponse[] = [];

interface SearchParam {
  name?: string,
  examDate?: string
}

function ExamScheduleTopik() {
  const [searchForm] = Form.useForm();
  const [examScheduleList, setExamScheduleList] = useState<ExamScheduleAPModel[]>([]);
  const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<SearchParam>({});
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const [updateModel, setUpdateModel] = useState<Partial<ExamScheduleAPModel>>({});
  const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
  const getData = async (page: number): Promise<void> => {
    setLoadingDataState(true);
    let examDate = searchParams.examDate != undefined ? moment(searchParams.examDate).format('YYYY-MM-DD') : undefined;
    const response: ResponseData = await getExamScheduleAp(searchParams.name, examDate);
    setExamScheduleList((response.data || []) as ExamScheduleAPModel[]);
    setPagination({ ...pagination, current: page, total: response.totalCount || 0 });
    setLoadingDataState(false);
    setSelectedRowDeleteKeys([]);
  };

  useEffect(() => { getData(1); }, [searchParams]);

  useEffect(() => {
    Promise.all([
      getExamPeriodAp().then(response => examPeriod = response.data as ExamPeriodResponse[]),
      getExamWorkShift().then(response => examWorkShift = response.data as ExamWorkShiftModel[]),
      getExam().then(response => exam = (response.data as ExamModel[]).filter(item => item.examForm == '4').sort((a, b) => {
        let orderA = a.order || Number.MAX_SAFE_INTEGER;
        let orderB = b.order || Number.MAX_SAFE_INTEGER;
        if (orderA > orderB)
          return 1;
        if (orderA < orderB)
          return -1;

        return 0;
      }))
    ]).then(_ => getData(1));
  }, []);

  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({ ...searchParams, ...value });
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.log(error);
    }
  };

  const submitCreateForm = async (model: Omit<ExamScheduleAPModel, 'id'>): Promise<void> => {
    let responseData = await postExamScheduleAp('', model);
    if (responseData.code != 200) {
      message.error(responseData.message);
      return;
    }
    message.success('Lưu thông tin thành công');
    closeCreateForm();
    setSearchParams({});
    searchForm.resetFields();
  };

  const submitUpdateForm = async (model: ExamScheduleAPModel): Promise<void> => {
    let responseData = await putExamScheduleAp('', model);
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

  const columns: ColumnsType<ExamScheduleAPModel> = [
    {
      title: 'STT',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Tên lịch thi',
      dataIndex: 'name',
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      render: (_, record) => moment(record.examDate).format('DD/MM/YYYY')
    },
    {
      title: 'Ca thi',
      dataIndex: 'examWorkShiftName',
      render: (_, record) => examWorkShift.find(item => item.id == record.examWorkShiftId)?.name
    },
    {
      title: 'Thời gian thi',
      dataIndex: 'examTime',
    },
    {
      title: 'Bài thi',
      dataIndex: 'examName',
      render: (_, record) => {
        let text = '';
        if (record.examId != undefined && record.examId != null) {
          for (let i = 0; i < record.examId.length; i++) {
            let examId = record.examId[i];
            text += `${exam.find(item => item.id == examId)?.name}, `;
          }
        }
        return <>{text.length > 2 ? text.substring(0, text.length - 2) : text}</>
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isOpen',
      render: (_, record) => record.isOpen ? <Tag color='blue'>Đang mở</Tag> : <Tag color='red'>Đã khóa</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.examScheduleAp} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' onClick={() => {
              setUpdateModel(record);
              setOpenUpdateForm(true);
            }}>
              Sửa
            </Button>
          </Permission>
          <Divider type='vertical' />
          <Permission navigation={layoutCode.examScheduleAp} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type="link" danger={true} onClick={event => {
              event.currentTarget.blur();
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                okText: 'Xác nhận',
                cancelText: 'Hủy bỏ',
                onOk: async () => {
                  setLoadingDataState(true);
                  try {
                    let responseData: ResponseData = await deleteExamScheduleAp('', [record.id || '']);
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
            }
            }>Xóa</Button>
          </Permission>
        </>
      ),
    },
  ];

  return (
    <div className='layout-main-conent'>
      <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label='Tên lịch thi' name='name'>
              <Input placeholder='Nhập tên lịch thi' />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label='Ngày thi' name='examDate'>
              <DatePicker allowClear format='DD/MM/YYYY' />
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
                      let responseData: ResponseData = await deleteExamScheduleAp('', selectedRowDeleteKeys);
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
              }
            }}>Xóa</Button>
          </Permission>
        </Space>
      </Divider>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={examScheduleList}
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
      <CreateForm openCreateForm={openCreateForm} onSubmitCreate={submitCreateForm} closeCreateForm={closeCreateForm} exam={exam} examPeriod={examPeriod} examWorkShift={examWorkShift} />
      <UpdateForm openUpdateForm={openUpdateForm} onSubmitUpdate={submitUpdateForm} updateModel={updateModel} closeUpdateForm={closeUpdateForm} exam={exam} examPeriod={examPeriod} examWorkShift={examWorkShift} />
    </div>
  );
}

export default ExamScheduleTopik;
