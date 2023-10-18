import { Code } from '@/apis';
import { ExamModel, ExamPeriodResponse, ExamWorkShiftModel, SelectOptionModel } from '@/apis/models/data';
import { ExamScheduleTopikModel } from '@/apis/models/ExamScheduleTopikModel';
import { getExamPeriod } from '@/apis/services/ExamPeriodService';
import { deleteExamScheduleTopik, getExamScheduleTopik, postExamScheduleTopik, putExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { getExam, getExamWorkShift } from '@/apis/services/PageService';
import CreateForm from '@/components/ExamScheduleTopik/CreateForm/CreateForm';
import UpdateForm from '@/components/ExamScheduleTopik/UpdateForm/UpdateForm';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { ConvertExamOptionModel, ConvertExamShiftOptionModel } from '@/utils/convert';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { Button, Card, DatePicker, Divider, FormInstance, message, Modal, PaginationProps, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

var examOption: SelectOptionModel[] = [];
var examShift: SelectOptionModel[] = [];
let examPeriod: ExamPeriodResponse[] = [];

const { RangePicker } = DatePicker;

const ExamScheduleTopik: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;

  const [data, setData] = useState<ExamScheduleTopikModel[] | []>([]);
  const [dataSearch, setDataSearch] = useState<ExamScheduleTopikModel[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const getData = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const response: ResponseData = await getExamScheduleTopik();
    const responseExam: ResponseData = await getExam(undefined, true);
    const responseExamShift: ResponseData = await getExamWorkShift();

    setData((response.data || []) as ExamScheduleTopikModel[]);
    setDataSearch(response.data as ExamScheduleTopikModel[]);

    examShift = ConvertExamShiftOptionModel(responseExamShift.data as ExamWorkShiftModel[]);
    examOption = ConvertExamOptionModel(responseExam.data as ExamModel[]);
    setPagination({
      ...pagination,
      current,
      total: response.totalCount || 0,
      pageSize: pageSize,
    });
    examPeriod = await (await getExamPeriod()).data as ExamPeriodResponse[];
    setLoading(false);
  };


  const status: SelectOptionModel[] = [
    {
      key: '1',
      label: 'Đang mở',
      value: '0',
    },
    {
      key: '3',
      label: 'Đã đóng',
      value: '1',
    },
  ];

  useEffect(() => {
    getData(1);    
  }, []);

  // Create
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);

  const createSubmit = async (values: Omit<ExamScheduleTopikModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    console.log(values);
    const res = await postExamScheduleTopik(undefined, values);
    if (res.code == Code._200) {
      form.resetFields();
      setOpenFormCreate(false);
      message.success('Thành công !');
      getData(1);
    } else {
      message.error(res.message);
    }
    setCreateSubmitLoading(false);
  };

  //Update
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [openFormUpdate, setOpenFormUpdate] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<ExamScheduleTopikModel>>({});

  const updataFormCancel = async () => {
    setUpdateData({});
    setOpenFormUpdate(false);
    setUpdateSubmitLoading(false);
  };

  const handleUpdate = async (item: ExamScheduleTopikModel) => {
    setUpdateData(item);
    setOpenFormUpdate(true);
  };

  const updateSubmit = async (values: ExamScheduleTopikModel) => {
    setUpdateSubmitLoading(true);
    console.log(values);
    const res = await putExamScheduleTopik(undefined, values);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      getData(1);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  //Delete
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(true);
        const res = await deleteExamScheduleTopik(id);
        if (res.code == Code._200) {
          message.success('Thành công !');
          getData(1);
          setDeleteLoading(false);
        } else {
          message.error(res.message);
        }
        setDeleteLoading(false);
      },
    });
  };

  //Search
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const onChangDateSearch = (dateString: [string, string]) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
  };

  const onSearch = () => {
    if (fromDate != '' && toDate != '') {
      const result = data.filter(item => {
        let examDate = moment(item.examDate, 'DD/MM/YYYY');
        return examDate.isSameOrAfter(moment(fromDate)) && examDate.isSameOrBefore(moment(toDate));
      });
      setDataSearch(result);
    }
    else
      setDataSearch(data);
  };

  const columns: ColumnsType<ExamScheduleTopikModel> = [
    {
      title: 'STT',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Tên lịch thi',
      dataIndex: 'examinationName',
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      render: (text, record) => {
        return moment(record.examDate, "DD/MM/YYYY").format('DD/MM/YYYY');
      },
    },
    {
      title: 'Ca thi',
      dataIndex: 'examWorkShiftName',
      render: (text, record) => {
        return examShift.find((item) => item.value == record.examWorkShiftId)?.label;
      },
    },
    {
      title: 'Thời gian thi',
      dataIndex: 'examTime',
    },
    {
      title: 'Bài thi',
      dataIndex: 'examName',
      render: (text, record) => {
        return examOption.find((item) => item.value == record.examId)?.label;
      },
    },
    {
      title: 'Ngày bắt đầu đăng ký',
      dataIndex: 'startRegister',
      render: (text, record) => {
        return moment(record.startRegister).format('DD/MM/YYYY');
      },
    },
    {
      title: 'Ngày kết thúc đăng ký',
      dataIndex: 'endRegister',
      render: (text, record) => {
        return moment(record.endRegister).format('DD/MM/YYYY');
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => {
        if (record.status == 0) {
          return <Tag color='blue'>Đang mở</Tag>;
        }
        return <Tag color='red'>Đã khóa</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.examCalendarTopik} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button type='link' loading={updateSubmitLoading} onClick={() => handleUpdate(record || '')}>
              Sửa
            </Button>
          </Permission>

          <Divider type='vertical' />

          <Permission navigation={layoutCode.examCalendarTopik} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button type='link' loading={deleteLoading} onClick={() => deleteTableData(record.id || '')}>
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
        title={'Quản lý lịch thi'}
        bordered={false}
        extra={[
          <Space key={1}>
            <RangePicker onChange={(_, dateString) => onChangDateSearch(dateString)} />
            <Button type='primary' key={3} onClick={onSearch}>
              Tìm kiếm
            </Button>
          </Space>,
        ]}
      >
        <div>
          <Space>
            <Permission navigation={layoutCode.examCalendarTopik} bitPermission={PermissionAction.Add} noNode={<></>}>
              <Button type='primary' onClick={() => setOpenFormCreate(true)}>
                Thêm mới
              </Button>
            </Permission>

          </Space>
        </div>
        <br></br>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={dataSearch}
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              getData(page, pageSize);
            },
            showTotal,
          }} />
      </Card>

      <CreateForm
        visible={openFormCreate}
        onSubmitLoading={createSubmitLoading}
        examWorkShifts={examShift}
        exams={examOption}
        status={status}
        onCancel={() => setOpenFormCreate(false)}
        onSubmit={createSubmit}
        examPeriod={examPeriod}
      />

      {openFormUpdate && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={openFormUpdate}
          examWorkShifts={examShift}
          exams={examOption}
          statusOption={status}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          examPeriod={examPeriod}
        />
      ) : null}
    </div>
  );
};

export default ExamScheduleTopik;
