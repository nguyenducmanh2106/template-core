import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Table,
  Select,
  PaginationProps,
  Modal,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ManageRegisteredCandidatesModel } from '@/apis/models/ManageRegisteredCandidatesModel';
import UpdateForm from '@/components/ManageRegisteredCandidates/UpdateForm/UpdateForm';
import { ColumnsType } from 'antd/lib/table';
import { Code, ManageApplicationTimeModel } from '@/apis';
import moment from 'moment';
import {
  approveData,
  duplicate,
  exportExcelRegisteredCandidate,
  getManageRegisteredCandidates,
  getManageRegisteredCandidatesById,
  putManageRegisteredCandidates,
  reNewApprove,
} from '@/apis/services/ManageRegisteredCandidatesService';
import {
  ConvertAreaOption,
  ConvertDistrictOptionModel,
  ConvertExamOptionModel,
  ConvertExamShiftOptionModel,
  ConvertExamVersionOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertIntToCurrencyFormat,
  ConvertProvinceOptionModel,
  ConvertTimeApplicationOptionModel,
  ConvertWardOptionModel,
  getAreaByAcessHeaderQuater,
} from '@/utils/convert';
import { AreaModel, DistrictModel, ExamModel, ExamRoomModel, ExamVersionModel, ExamWorkShiftModel, ExportFileModel, HeadQuarterModel, ProfileCatalogModel, SelectOptionModel, ServiceAlongExamModel, WardModel } from '@/apis/models/data';
import { getArea, getDistrict, getExam, getExamRoom, getExamVersion, getExamWorkShift, getHeadQuarter, getProvince, getServiceAlongExam, getWard } from '@/apis/services/PageService';
import { getManageApplicationTime } from '@/apis/services/ManageApplicationTimeService';
import { examForm, statusPaid, statusProfile } from '@/utils/constants';
import './style.less'
import ViewDetailRegisted from './ViewDetailRegisted';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
var headQuarter: SelectOptionModel[] = [];
var area: SelectOptionModel[] = [];
var exam: SelectOptionModel[] = [];
var timeApplication: SelectOptionModel[] = [];
var manageRegisteredCandidates: ManageRegisteredCandidatesModel[] = [];
var service: ServiceAlongExamModel[] = [];
var provinceOption: SelectOptionModel[] = [];
var districtOption: SelectOptionModel[] = [];
var wardOption: SelectOptionModel[] = [];
var examShift: SelectOptionModel[] = [];
var examRooms: ExamRoomModel[] = [];
var examVersionOption: SelectOptionModel[] = []

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const [headQuarterTemp, setHeadQuarterTemp] = useState<SelectOptionModel[]>([]);
  const [headQuarterValue, setHeadQuarterValue] = useState<string>();
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<ManageRegisteredCandidatesModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [formChooseExam] = Form.useForm();

  const getTimeApplication = async (id: string): Promise<void> => {
    setLoading(true);

    const response: ResponseData = await getManageApplicationTime(id);
    timeApplication = ConvertTimeApplicationOptionModel(response.data as ManageApplicationTimeModel[]);

    setLoading(false);
  };
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const response: ResponseData = await getManageRegisteredCandidates();
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    const responseExam: ResponseData = await getExam();
    const responseArea: ResponseData = await getArea(undefined, true);
    const responseProvince: ResponseData = await getProvince();
    const responseWard: ResponseData = await getWard();
    const responseDistrict: ResponseData = await getDistrict();
    const responseExamShift: ResponseData = await getExamWorkShift();
    const responseRoom: ResponseData = await getExamRoom();
    const responseExamVersion: ResponseData = await getExamVersion();
    examVersionOption = (ConvertExamVersionOptionModel(responseExamVersion.data as ExamVersionModel[]));
    examRooms = responseRoom.data as ExamRoomModel[];
    examShift = ConvertExamShiftOptionModel(responseExamShift.data as ExamWorkShiftModel[]);
    districtOption = ConvertDistrictOptionModel(responseDistrict.data as DistrictModel[]);
    wardOption = ConvertWardOptionModel(responseWard.data as WardModel[]);
    provinceOption = ConvertProvinceOptionModel(responseProvince.data as ProfileCatalogModel[]);
    var headQuarters = responseHeadQuarter.data as HeadQuarterModel[];
    headQuarters = headQuarters.filter((item: HeadQuarterModel) => {
      return item.isTopik == false
    })
    headQuarter = ConvertHeaderQuarterOptionModel(headQuarters);
    area = getAreaByAcessHeaderQuater(ConvertAreaOption(responseArea.data as AreaModel[]), headQuarter)
    setHeadQuarterTemp(headQuarter);
    var exams = responseExam.data as ExamModel[];
    exams = exams.filter((item: ExamModel) => {
      return item.examForm != examForm.Topik
    })
    exam = ConvertExamOptionModel(exams);
    const responseService: ResponseData = await getServiceAlongExam();
    service = responseService.data as ServiceAlongExamModel[];
    manageRegisteredCandidates = (response.data || []) as ManageRegisteredCandidatesModel[];
    setList((response.data || []) as ManageRegisteredCandidatesModel[]);
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

  // Data
  const [duplicateSubmitLoading, setDuplicateSubmitLoading] = useState<boolean>(false);
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [visibleChooseExam, setVisibleChooseExam] = useState<boolean>(false);
  const [duplicateFormVisible, setDuplicateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<ManageRegisteredCandidatesModel>>({});
  const [duplicateLoading, setDuplicateLoading] = useState<string[]>([]);
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const [exportExcelLoading, setExportExcelLoading] = useState<boolean>(false);
  const [examVersionTemp, setExamVersionTemp] = useState<SelectOptionModel[]>([]);
  const [viewDetailLoading, setViewDetailLoading] = useState<string[]>([]);
  const [viewDetailVisible, setViewDetailVisible] = useState<boolean>(false);
  const [viewData, setViewData] = useState<ManageRegisteredCandidatesModel>({});
  const [viewChooseData, setViewChooseData] = useState<ManageRegisteredCandidatesModel>({});
  const detailUpdateData = async (id: string, isDuplicate: boolean) => {
    if (isDuplicate)
      setVisibleChooseExam(true);
    else
      setDetailUpdateLoading([id]);
    const response: ResponseData = await getManageRegisteredCandidatesById(id);
    const data = response.data as ManageRegisteredCandidatesModel;
    setViewChooseData(data)
    setUpdateData({
      ...data,
    });
    if (!isDuplicate)
      setUpdateFormVisible(true);
    setDuplicateLoading([]);
    setDetailUpdateLoading([]);
  };

  const continuteDuplicate = async () => {
    try {
      const fieldsValue = await formChooseExam.validateFields();
      setDuplicateLoading([viewChooseData.id as string]);
      const data = viewChooseData;
      data.examId = fieldsValue.examId
      data.examVersion = fieldsValue.examVersionId
      setUpdateData({
        ...data,
      });
      setDuplicateFormVisible(true)
      setDuplicateLoading([]);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }

  }

  const onChangeExam = async (id: string) => {
    setExamVersionTemp(examVersionOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id
    }))
  };

  const viewDetailData = async (id: string) => {
    setViewDetailLoading([id]);
    const response: ResponseData = await getManageRegisteredCandidatesById(id);
    const data = response.data as ManageRegisteredCandidatesModel;
    setViewData(data as ManageRegisteredCandidatesModel);
    setViewDetailVisible(true);
    setViewDetailLoading([]);
  };

  const viewFormCancel = async () => {
    setViewData({});
    setViewDetailVisible(false);
  };

  const updataFormCancel = async () => {
    setUpdateData({});
    setUpdateFormVisible(false);
    setDuplicateFormVisible(false)
  };

  const goToUpdateSubmit = async (values: ManageRegisteredCandidatesModel) => {
    setUpdateData(values)
    setViewDetailVisible(false);
    setUpdateFormVisible(true);
  };

  const approve = async (id: string, approve: boolean, note?: string) => {
    const res = await approveData(id, approve, note);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      setViewDetailVisible(false);
      searchFormSubmit(pagination.current);
    } else {
      message.error(res.message);
    }
  };

  const reNewStatus = async (id: string) => {
    const res = await reNewApprove(id);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      setViewDetailVisible(false);
      searchFormSubmit(pagination.current);
    } else {
      message.error(res.message);
    }
  };


  const updateSubmit = async (values: any, isDuplicate: boolean) => {
    var res: ResponseData
    if (isDuplicate) {
      setDuplicateSubmitLoading(true)
      res = await duplicate(undefined, values);
    } else {
      setUpdateSubmitLoading(true);
      res = await putManageRegisteredCandidates(undefined, values);
    }
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      searchFormSubmit(pagination.current);
    } else {
      message.error(res.message);
    }
    setVisibleChooseExam(false)
    setUpdateSubmitLoading(false);
    setDuplicateSubmitLoading(false);
  };

  // searchForm
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();
      const dateReciveFrom =
        fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[0]).format('DD/MM/YYYY') : '';
      const dateReciveTo = fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[1]).format('DD/MM/YYYY') : '';
      const dateAcceptFrom =
        fieldsValue.dateAccept != null ? moment(fieldsValue.dateAccept[0]).format('DD/MM/YYYY') : '';
      const dateAcceptTo = fieldsValue.dateAccept != null ? moment(fieldsValue.dateAccept[1]).format('DD/MM/YYYY') : '';
      const dateAccept = dateAcceptFrom + ',' + dateAcceptTo;
      const dateRecive = dateReciveFrom + ',' + dateReciveTo;
      if (dateAcceptFrom.length > 0) fieldsValue.dateAccept = dateAccept;
      if (dateReciveFrom.length > 0) fieldsValue.dateReceive = dateRecive;
      const response: ResponseData = await getManageRegisteredCandidates(
        fieldsValue.areaId,
        fieldsValue.headerQuater,
        fieldsValue.exam,
        fieldsValue.statusAccept,
        fieldsValue.statusPaid,
        fieldsValue.dateAccept,
        fieldsValue.dateReceive,
        fieldsValue.timeApplication,
        fieldsValue.codeProfile,
        fieldsValue.fullname,
        fieldsValue.cccd,
        pageSize,
        current,
        fieldsValue
      );
      manageRegisteredCandidates = (response.data || []) as ManageRegisteredCandidatesModel[];
      setList((response.data || []) as ManageRegisteredCandidatesModel[]);
      setPagination({
        ...pagination,
        current,
        total: response.totalCount || 0,
        pageSize: pageSize,
      });

      setLoading(false);
    } catch (error: any) {
      console.log(error);
    }
  };

  const onChangeHeaderQuarter = (id: string) => {
    getTimeApplication(id);
    setHeadQuarterValue(id)
  };

  const onChangeArea = async (id: string) => {
    const placeTemp = headQuarter.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setHeadQuarterTemp(placeTemp);
    searchForm.setFieldValue('headerQuater', null);
  };




  const columns: ColumnsType<ManageRegisteredCandidatesModel> = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'userProfileId',
      render: (_, record) => <span>{record.codeProfile}</span>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (_, record) => <span>{record.userInfo?.fullName}</span>,
    },
    {
      title: 'SĐT',
      dataIndex: 'sdt',
      render: (_, record) => <span>{record.userInfo?.sdt}</span>,
    },
    {
      title: 'Bài thi',
      dataIndex: 'examName',
      render: (_, record) => <span>{exam.find((p) => p.value == record.examId)?.label}</span>,
    },
    // {
    //   title: 'Ngày thi',
    //   dataIndex: 'testScheduleDate',
    //   render: (_, record) => (
    //     <span>{record.testScheduleDate != null ? dayjs(record.testScheduleDate).format('DD-MM-YYYY') : ''}</span>
    //   ),
    // },
    {
      title: 'Lệ phí',
      dataIndex: 'cccd',
      render: (_, record) => <span>{ConvertIntToCurrencyFormat(record.fee as number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => <span>{statusProfile.find(p => p.value == record.status)?.label}</span>,
    },
    // {
    //   title: 'Thanh toán',
    //   dataIndex: 'statusPaid',
    //   render: (_, record) => <CloseOutlined />,
    //   // render: (_, record) => <span>{record.statusPaid == 1 ? <CloseOutlined /> : (record.statusPaid == 2 ? <CheckOutlined /> : <RollbackOutlined />)}</span>,
    // },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      render: (_, record) => (
        <span>{record.createdOnDate}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 270,
      render: (_, record) => (
        <>
          <Button
            type='link'
            loading={viewDetailLoading.includes(record.id || '')}
            onClick={() => viewDetailData(record.id || '')}
          >
            Xem
          </Button>
          <Button
            type='link'
            loading={duplicateLoading.includes(record.id || '')}
            onClick={() => detailUpdateData(record.id as string, true)}
          >
            Nhân bản
          </Button>
          <Button
            type='link'
            loading={detailUpdateLoading.includes(record.id || '')}
            onClick={() => detailUpdateData(record.id as string, false)}
          >
            Sửa
          </Button>
        </>
      ),
    },
  ];

  const exportExcel = async (): Promise<void> => {
    try {
      setExportExcelLoading(true);
      const fieldsValue = await searchForm.validateFields();
      const dateReciveFrom =
        fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[0]).format('DD/MM/YYYY') : '';
      const dateReciveTo = fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[1]).format('DD/MM/YYYY') : '';
      const dateRecive = dateReciveFrom + ',' + dateReciveTo;
      if (dateReciveFrom.length > 0) fieldsValue.dateRecive = dateRecive;

      const dateApplyFrom =
        fieldsValue.dateAccept != null ? moment(fieldsValue.dateAccept[0]).format('DD/MM/YYYY') : '';
      const dateApplyTo = fieldsValue.dateAccept != null ? moment(fieldsValue.dateAccept[1]).format('DD/MM/YYYY') : '';
      const dateApply = dateApplyFrom + ',' + dateApplyTo;
      if (dateApplyFrom.length > 0) fieldsValue.dateAccept = dateApply;
      // console.log(fieldsValue)
      // return
      const response: ResponseData = await exportExcelRegisteredCandidate(
        fieldsValue.areaId,
        fieldsValue.headerQuater,
        fieldsValue.exam,
        fieldsValue.statusPaid,
        fieldsValue.dateAccept,
        fieldsValue.dateRecive,
        fieldsValue.timeApplication,
        fieldsValue.statusAccept,
        fieldsValue.codeProfile,
        fieldsValue.fullname,
        fieldsValue.cccd
      );
      if (response.code == Code._200) {
        const res = response.data as ExportFileModel;
        window.location.href = import.meta.env.VITE_HOST + res.fileName;
      } else {
        message.error(response.message || 'Thất bại');
      }
      setExportExcelLoading(false);
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className='layout-main-conent'>
      <Card
        bordered={false}
        title={
          <Collapse>
            <Panel header='Tìm kiếm' key='1'>
              <Form form={searchForm} name='search'>
                <Row gutter={24} justify='end'>
                  <Col span={4}>
                    <Form.Item label={'Khu vực'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='areaId'>
                      <Select
                        placeholder='Chọn khu vực'
                        options={area}
                        onChange={(e) => onChangeArea(e)}
                      />
                    </Form.Item>

                    <Form.Item
                      label={'Ngày tiếp nhận hồ sơ'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='dateRecive'
                    >
                      <RangePicker placeholder={['Từ', 'Đến']} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Trụ sở'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='headerQuater'>
                      <Select
                        placeholder='Chọn trụ sở'
                        options={headQuarterTemp}
                        value={headQuarterValue}
                        onChange={(e) => onChangeHeaderQuarter(e)}
                      />
                    </Form.Item>

                    <Form.Item
                      label={'Ngày duyệt hồ sơ'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='dateAccept'
                    >
                      <RangePicker placeholder={['Từ', 'Đến']} />
                    </Form.Item>

                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Môn thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='exam'>
                      <Select placeholder='Chọn môn thi' options={exam} />
                    </Form.Item>

                    <Form.Item
                      label={'Khung giờ tiếp nhận hồ sơ'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='timeApplication'
                    >
                      <Select placeholder='Chọn khung giờ' options={timeApplication} />
                    </Form.Item>

                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label={'Trạng thái thanh toán'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='statusPaid'
                    >
                      <Select placeholder='Chọn trạng thái' options={statusPaid} />
                    </Form.Item>
                    <Form.Item
                      label={'Trạng thái hồ sơ'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='statusAccept'
                    >
                      <Select placeholder='Chọn trạng thái' options={statusProfile} />
                    </Form.Item>

                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Họ và tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='fullname'>
                      <Input placeholder='Nhập họ tên' />
                    </Form.Item>
                    <Form.Item
                      label={'CCCD/CMND/HC/Khai sinh'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 17 }}
                      name='cccd'
                    >
                      <Input placeholder='Nhập CCCD/CMND/HC/Khai sinh' />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Mã hồ sơ'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='codeProfile'>
                      <Input placeholder='Nhập mã hồ sơ' />
                    </Form.Item>
                    <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                      Tìm kiếm
                    </Button>
                    <Button type='primary' style={{ marginLeft: 8 }} loading={exportExcelLoading} htmlType='submit' onClick={() => exportExcel()}>
                      Xuất excel
                    </Button>
                    <br />
                    <br />
                    <Button htmlType='button' onClick={() => searchForm.resetFields()}>
                      Làm lại
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Panel>
          </Collapse>
        }
        extra={<div></div>}
      >
        <Table
          rowKey='id'
          style={{ color: 'black' }}
          rowClassName={(record, index) => record.statusWarning === 1 ? 'table-row-red' : (record.statusWarning == 2 ? 'table-row-yellow' : (index % 2 == 0 ? 'table-row-dark' : 'table-row-light'))}
          columns={columns}
          dataSource={list}
          loading={loading}
          size='small'
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              searchFormSubmit(page, pageSize);
            },
            showTotal,
          }}
        />
      </Card>

      {duplicateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={duplicateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={duplicateSubmitLoading}
          service={service}
          statusProfile={statusProfile}
          statusPaid={statusPaid}
          districtOption={districtOption}
          provinceOption={provinceOption}
          wardOption={wardOption}
          examShift={examShift}
          examRooms={examRooms}
          exam={exam}
          isDuplicate={true}
        />
      ) : null}

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          service={service}
          statusProfile={statusProfile}
          statusPaid={statusPaid}
          districtOption={districtOption}
          provinceOption={provinceOption}
          wardOption={wardOption}
          examShift={examShift}
          examRooms={examRooms}
          exam={exam}
          isDuplicate={false}
        />
      ) : null}

      {viewDetailVisible && Object.keys(viewData).length > 0 ? (
        <ViewDetailRegisted
          values={viewData}
          onCancel={() => viewFormCancel()}
          visible={viewDetailVisible}
          onSubmit={goToUpdateSubmit}
          onApprove={approve}
          reNewStatus={reNewStatus}
          onSubmitLoading={updateSubmitLoading}
          service={service}
          statusProfile={statusProfile}
          statusPaid={statusPaid}
          districtOption={districtOption}
          provinceOption={provinceOption}
          wardOption={wardOption}
          examShift={examShift}
          examRooms={examRooms}
          exam={exam}
          examVersionOption={examVersionOption}
        />
      ) : null}

      <Modal
        width={'30%'}
        title='Chọn bài thi'
        open={visibleChooseExam}
        onCancel={() => setVisibleChooseExam(false)}
        footer={[
          <Button key='back' onClick={() => setVisibleChooseExam(false)}>
            Hủy
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' onClick={() => continuteDuplicate()}>
            Tiếp tục
          </Button>,
        ]}
      >
        <Form
          form={formChooseExam}
          name='formChooseExam'
          labelCol={{ span: 8 }}
          initialValues={{

          }}
        >
          <Form.Item
            label='Chọn bài thi'
            name='examId'
            labelAlign='left'
            labelCol={{span: 12}}
            wrapperCol={{ span: 12 }}
            rules={[
              {
                required: true,
                validator: async (rule, value) => {
                  if (value === '' || !value) {
                    throw new Error('Không được để trống');
                  }
                },
              },
            ]}
          >
            <Select options={exam} onChange={onChangeExam}></Select>
          </Form.Item>
          <Form.Item
            label='Chọn phiên bản thi'
            name='examVersionId'
            labelAlign='left'
            labelCol={{span: 12}}
            wrapperCol={{ span: 12 }}
            rules={[
              {
                required: examVersionTemp.length > 0,
                validator: async (rule, value) => {
                  if (examVersionTemp.length > 0) {
                    if(value == undefined || value.length == 0)
                    throw new Error('Không được để trống');
                  }
                },
              },
            ]}
          >
            <Select options={examVersionTemp}></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
