import { useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { ColumnsType } from 'antd/lib/table';
import { getExamCalendar } from '@/apis/services/ExamCalendarService';
import dayjs from 'dayjs';
import { ExamModel, ExamRoomModel, HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import {
  ConvertExamOptionModel,
  ConvertHeaderQuarterOptionModel,
} from '@/utils/convert';
import { getExam, getHeadQuarter } from '@/apis/services/PageService';

interface UpdateFormPorps {
  versionId: string;
  examShift: SelectOptionModel[];
  examRooms: ExamRoomModel[];
  onSubmit: (values: ExamCalendarModel, id: string) => void;
  onCancel: () => void;
}
var examCalendar: ExamCalendarModel[] = [];
var headQuarter: SelectOptionModel[] = [];
var examOption: SelectOptionModel[] = [];

const ExamTestSchedule: React.FC<UpdateFormPorps> = (props) => {
  const { versionId, examShift, examRooms, onSubmit, onCancel } = props;
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ExamCalendarModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const response: ResponseData = await getExamCalendar();
    examCalendar = (response.data || []) as ExamCalendarModel[];
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    const responseExam: ResponseData = await getExam();
    examOption = ConvertExamOptionModel(responseExam.data as ExamModel[]);
    headQuarter = ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]);
    setList((response.data || []) as ExamCalendarModel[]);
    setPagination({
      ...pagination,
      current,
      total: response.totalCount || 0,
      pageSize: pageSize,
    });

    setLoading(false);
  };
  useEffect(() => {
    getList(1);
  }, []);
  const onFinish = async (model: ExamCalendarModel) => {
    try {
      onSubmit(model, versionId);
    } catch (error) { }
  };

  const columns: ColumnsType<ExamCalendarModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 10,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      render: (_, record) => <span>{examRooms.find((p) => p.id == record.room)?.name}</span>,
    },
    {
      title: 'Ngày thi',
      dataIndex: 'dateTest',
      render: (_, record) => <span>{dayjs(record.dateTest).format('YYYY-MM-DD')}</span>,
    },
    {
      title: 'Ca thi',
      dataIndex: 'examShift',
      render: (_, record) => <span>{examShift.find((p) => p.value == record.examShift)?.label}</span>,
    },
    {
      title: 'Thời gian thi',
      dataIndex: 'timeTest',
      render: (_, record) => <span>{record.timeTest}</span>,
    },
    {
      title: 'Môn thi',
      dataIndex: 'timeTest',
      render: (_, record) => <span>{examOption.find((p) => p.value == record.examId)?.label}</span>,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'room',
      render: (_, record) => <span>{examRooms.find((p) => p.id == record.room)?.maxAcceptNumber}</span>,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'room',
      render: (_, record) => <span>{examRooms.find((p) => p.id == record.room)?.maxAcceptNumber}</span>,
    },
    {
      title: 'Người tạo',
      dataIndex: 'timeTest',
      render: (_, record) => <span>{record.timeTest}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <span>{record.status == 0 ? 'Đang mở' : record.status == 1 ? 'Lên trước kế hoạch' : ' Đã đóng'}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type='link' onClick={() => onFinish(record)}>
            Chọn
          </Button>
        </>
      ),
    },
  ];

  return (
    <Table
      rowKey='id'
      size={'small'}
      columns={columns}
      dataSource={list}
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page: number, pageSize: number) => {
          getList(page, pageSize);
        },
      }}
    />
  );
};

export default ExamTestSchedule;
