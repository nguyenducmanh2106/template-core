import { useEffect, useState } from 'react';
import { Button, Card, Col, Collapse, DatePicker, Divider, Form, FormInstance, Input, message, Modal, PaginationProps, Row, Select, Space, Table } from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { ColumnsType } from 'antd/lib/table';
import { Code } from '@/apis';
import {
  getExamCalendar,
  deleteExamCalendar,
  putExamCalendar,
  postExamCalendar,
} from '@/apis/services/ExamCalendarService';
import dayjs from 'dayjs';
import { AreaModel, ExamModel, ExamRoomModel, ExamWorkShiftModel, HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import {
  ConvertAreaOption,
  ConvertExamOptionModel,
  ConvertExamRoomOptionModel,
  ConvertExamShiftOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertNameExamList,
  getAreaByAcessHeaderQuater,
} from '@/utils/convert';
import { getArea, getExam, getExamRoom, getExamWorkShift, getHeadQuarter } from '@/apis/services/PageService';
import Calendar from '@/components/Calendar/Calendar';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import CreateForm from './CreateForm';
import UpdateForm from './UpdateForm';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
var examCalendar: ExamCalendarModel[] = [];
var exam: ExamModel[] = [];
var area: SelectOptionModel[] = [];
var checkedList: string[] = [];
var headQuarter: SelectOptionModel[] = [];
var examOption: ExamModel[] = [];
var examShift: SelectOptionModel[] = [];
var rooms: ExamRoomModel[] = [];
var examRooms: ExamRoomModel[] = [];

function App() {
  // Load
  const [areaValue, setAreaValue] = useState<string>();
  const [examRoomChange, setExamRoomChange] = useState<ExamRoomModel[]>([]);
  const [examCalendarTemp, setExamCalendarTemp] = useState<ExamCalendarModel[]>([]);
  const [headQuarterValue, setHeadQuarterValue] = useState<string>();
  const [headQuarterTemp, setHeadQuarterTemp] = useState<SelectOptionModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
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
    const responseHeadQuarter: ResponseData = await getHeadQuarter(undefined, undefined, true);
    const responseExam: ResponseData = await getExam(true, false);
    const responseExamShift: ResponseData = await getExamWorkShift();
    const responseRoom: ResponseData = await getExamRoom();
    const responseArea: ResponseData = await getArea(undefined, true);
    const dataHeadQuarter = (responseHeadQuarter.data as HeadQuarterModel[]).filter((item: HeadQuarterModel) => {
      return item.acceptTest == true
    })
    headQuarter = ConvertHeaderQuarterOptionModel(dataHeadQuarter);
    area = getAreaByAcessHeaderQuater(ConvertAreaOption(responseArea.data as AreaModel[]), headQuarter)
    if (area.length > 0) {
      getDataRoom(area[0].value)
      setAreaValue(area[0].value)
    }
    examRooms = responseRoom.data as ExamRoomModel[];
    rooms = (responseRoom.data as ExamRoomModel[]);
    examShift = ConvertExamShiftOptionModel(responseExamShift.data as ExamWorkShiftModel[]);
    examOption = (responseExam.data as ExamModel[]);
    setHeadQuarterTemp(headQuarter)
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

  const status: SelectOptionModel[] = [
    {
      key: '1',
      label: 'Đang mở',
      value: '0',
    },
    {
      key: '2',
      label: 'Lên trước kế hoạch',
      value: '1',
    },
    {
      key: '3',
      label: 'Đã đóng',
      value: '2',
    },
  ];

  const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading([id]);
        const res = await deleteExamCalendar(id);
        if (res.code == Code._200) {
          message.success('Thành công !');
          getList(pagination.current);
          setDeleteLoading([]);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<ExamCalendarModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = examCalendar.find((item: ExamCalendarModel) => item.id == id);
    setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };

  const updataFormCancel = async () => {
    setUpdateData({});
    setUpdateFormVisible(false);
  };

  const updateSubmit = async (values: ExamCalendarModel) => {
    setUpdateSubmitLoading(true);
    const res = await putExamCalendar(undefined, values);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      getList(pagination.current);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  // Save
  const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
  const [createFormVisible, setCreateFormVisible] = useState<boolean>(false);
  const createSubmit = async (values: Omit<ExamCalendarModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postExamCalendar(undefined, values);
    if (res.code == Code._200) {
      form.resetFields();
      setCreateFormVisible(false);
      message.success('Thành công !');
      getList(1);
    } else {
      message.error(res.message);
    }
    setCreateSubmitLoading(false);
  };

  // searchForm
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async () => {
    try {
      // const fieldsValue = await searchForm.validateFields();
      message.warning('Tìm kiếm!');
    } catch (error: any) {
      console.log(error);
    }
  };

  const onChangeArea = async (id: string) => {
    const placeTemp = headQuarter.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setHeadQuarterTemp(placeTemp);
    setHeadQuarterValue(undefined)
    setAreaValue(id)
    getDataRoom(id)
    setExamCalendarTemp(examCalendar.filter((item) => {
      const headerQuaterIds = headQuarter.filter((i) => {
        return i.parrentId == id
      })
      return headerQuaterIds.find(p => p.value == item.headerQuarterId) != null
    }))
  };

  const onChangeHeaderQuater = async (id: string) => {
    setHeadQuarterValue(id)
    setExamCalendarTemp(examCalendar.filter((item) => {
      return item.headerQuarterId == id
    }))
  };

  const onChangeShowType = async (value: boolean) => {
    setShowCalendar(value);
    if (value) {
      onChangeArea(areaValue as string);
      setHeadQuarterValue(undefined)
      setExamCalendarTemp(examCalendar.filter((item) => {
        const headerQuaterIds = headQuarter.filter((i) => {
          return i.parrentId == areaValue
        })
        return headerQuaterIds.find(p => p.value == item.headerQuarterId) != null
      }))
    }
  };

  const getDataRoom = async (areaId: string) => {
    const headerQuaterTemp = headQuarter.filter((item) => {
      return item.parrentId == areaId
    })
    const examRoomTemp = examRooms.filter((item) => {
      return headerQuaterTemp.find(p => p.value == item.headQuarterId) != null
    })
    setExamRoomChange(examRoomTemp)
  };

  const resetForm = async () => {
    searchForm.resetFields();
    setHeadQuarterTemp(headQuarter);
  };

  const columns: ColumnsType<ExamCalendarModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      render: (_, record) => <span>{rooms.find((p) => p.id == record.room)?.name}</span>,
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
      render: (_, record) => <span>{ConvertNameExamList(record.examId as string, ConvertExamOptionModel(examOption))}</span>,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'room',
      render: (_, record) => <span>{record.registed}</span>,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'room',
      render: (_, record) => <span>{record.quantityCandidate}</span>,
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
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.examCalendar} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Sửa
            </Button>
          </Permission>
          <Divider type='vertical' />
          <Permission navigation={layoutCode.examCalendar} bitPermission={PermissionAction.Delete} noNode={<></>}>
            <Button
              type='link'
              loading={deleteLoading.includes(record.id || '')}
              onClick={() => deleteTableData(record.id || '')}
            >
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
        bordered={false}
        title={
          <>
            <Row>
              <Space>
                <Permission navigation={layoutCode.examCalendar} bitPermission={PermissionAction.Add} noNode={<></>}>
                  <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                    Thêm mới
                  </Button>
                </Permission>
                <Button type='primary' onClick={() => setShowCalendar(!showCalendar)}>
                  {!showCalendar ? <>Xem dạng lịch</> : <>Xem danh sách</>}
                </Button>
                {showCalendar ? <><Select placeholder='Chọn khu vực' value={areaValue} options={area} onChange={onChangeArea} />
                  <Select placeholder='Chọn địa điểm' value={headQuarterValue} options={headQuarterTemp} onChange={onChangeHeaderQuater} /></> : null}

              </Space>
              <Divider></Divider>
              {!showCalendar ? <>
                <Collapse style={{ width: '100%' }}>
                  <Panel header='Tìm kiếm' key='1'>
                    <Form form={searchForm} name='search'>
                      <Row gutter={24}>
                        <Col span={5}>
                          <Form.Item
                            name='areaId'
                          >
                            <Select placeholder='Chọn khu vực' options={area} onChange={onChangeArea} />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name='placeTest'
                          >
                            <Select placeholder='Chọn địa điểm' options={headQuarterTemp} />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item name='exam'>
                            <Select placeholder='Chọn bài thi' options={examOption} />
                          </Form.Item>

                        </Col>
                        <Col span={5}>
                          <Form.Item
                            wrapperCol={{ span: 17 }}
                            name='dateRecive'
                          >
                            <RangePicker placeholder={['Bắt đầu', 'Kết thúc']} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                            Tìm kiếm
                          </Button>
                          <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => resetForm()}>
                            Làm lại
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Panel>
                </Collapse></> : <div style={{ display: 'flex', alignItems: 'center' }}>
                {examRoomChange.map((item) => (
                  <><div className='square' style={{ height: '20px', width: '20px', background: item.colorCode as string }}></div>&nbsp;{item.name}&nbsp;&nbsp;&nbsp;&nbsp;</>
                ))}
              </div>}

            </Row>

          </>

        }
        extra={
          <div>
          </div>
        }
      >
        {!showCalendar ? <Table
          rowKey='id'
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              getList(page, pageSize);
            },
            showTotal,
          }}
        /> : <Calendar examShift={examShift} examRooms={examRooms} exam={ConvertExamOptionModel(examOption)} examCalendar={examCalendarTemp} />}

      </Card>

      <CreateForm
        onCancel={() => setCreateFormVisible(false)}
        visible={createFormVisible}
        onSubmit={createSubmit}
        onSubmitLoading={createSubmitLoading}
        headerQuater={headQuarter}
        exam={examOption}
        examShift={examShift}
        rooms={rooms}
        status={status}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          headerQuater={headQuarter}
          exam={examOption}
          examShift={examShift}
          rooms={rooms}
          status={status}
        />
      ) : null}
    </div>
  );
}

export default App;
