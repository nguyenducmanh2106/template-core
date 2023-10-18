import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Row,
  Table,
  Image,
  Tabs,
  Select,
  PaginationProps,
  Modal,
  Checkbox,
  Dropdown,
  MenuProps,
  Typography,
  Space,
  Tooltip,
  Menu,
  Spin,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ManageRegisteredCandidateTopikModel } from '@/apis/models/ManageRegisteredCandidateTopikModel';
import UpdateForm from '@/components/ManageRegisteredCandidatesTOPIK/UpdateForm/UpdateForm';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';

import {
  ConvertAreaOption,
  ConvertCountryOptionModel,
  ConvertDistrictOptionModel,
  ConvertExamOptionModel,
  ConvertExamRoomOptionModel,
  ConvertExamScheduleOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertIntToCurrencyFormat,
  ConvertLanguageOptionModel,
  ConvertOptionSelectModel,
  ConvertProvinceOptionModel,
  ConvertWardOptionModel,
  getAcessHeaderQuater,
  getAreaByAcessHeaderQuater,
} from '@/utils/convert';
import {
  ExamModel,
  HeadQuarterModel,
  SelectOptionModel,
  AreaModel,
  ProfileCatalogModel,
  DistrictModel,
  WardModel,
  ExamRoomModel,
  ExportFileModel,
  CountryModel,
  LanguageModel,
  ExamPeriodResponse
} from '@/apis/models/data';
import {
  getArea,
  getExam,
  getHeadQuarter,
  getProvince,
  getDistrict,
  getWard,
  getExamRoom,
  getCountries,
  getLanguage,
} from '@/apis/services/PageService';
import {
  exportExcelRegisteredCandidateTopik,
  exportPdfTicket,
  getDataTicket,
  getManageRegisteredCandidateTopik,
  getManageRegisteredCandidateTopikById,
  putManageRegisteredCandidateTopik,
} from '@/apis/services/ManageRegisteredCandidateTopikService';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { ListCandidateTopikModel } from '@/apis/models/ListCandidateTopikModel';
import ViewDetail from '@/components/ManageRegisteredCandidatesTOPIK/ViewDetail/ViewDetail';
import { getExamPeriod } from '@/apis/services/ExamPeriodService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';
import React from 'react';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
var area: SelectOptionModel[] = [];
var exam: SelectOptionModel[] = [];
var examRoom: SelectOptionModel[] = [];
var headQuarter: SelectOptionModel[] = [];
var examSchedule: SelectOptionModel[] = [];
var manageRegisteredCandidates: ManageRegisteredCandidateTopikModel[] = [];
var provinceOption: SelectOptionModel[] = [];
var districtOption: SelectOptionModel[] = [];
var wardOption: SelectOptionModel[] = [];
var countryOption: SelectOptionModel[] = [];
var languageOption: SelectOptionModel[] = [];
var examPeriodOption: SelectOptionModel[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const [placeTestC, setPlaceTestC] = useState<SelectOptionModel[]>();
  const [examScheduleTemp, setExamScheduleTemp] = useState<SelectOptionModel[]>();
  const [examScheduleO, setExamScheduleO] = useState<ExamScheduleTopikModel[]>([]);
  const [examPeriodValue, setExamPeriodValue] = useState<string>();
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<ListCandidateTopikModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const responseArea: ResponseData = await getArea();
    const responseExam: ResponseData = await getExam();
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik();
    const responseProvince: ResponseData = await getProvince();
    const responseWard: ResponseData = await getWard();
    const responseDistrict: ResponseData = await getDistrict();
    const responseExamRoom: ResponseData = await getExamRoom();
    const responseCountries: ResponseData = await getCountries();
    const responseLanguage: ResponseData = await getLanguage();
    const responseExamPeriod: ResponseData = await getExamPeriod();
    examPeriodOption = ConvertOptionSelectModel(responseExamPeriod.data as ExamPeriodResponse[]);
    const eSData = responseExamScheduleTopik.data as ExamScheduleTopikModel[]
    setExamScheduleO(eSData)
    var examPeriods = responseExamPeriod.data as ExamPeriodResponse[]
    const getD = examPeriods.find(p => p.isCurrent as boolean) as ExamPeriodResponse
    setExamScheduleTemp(ConvertExamScheduleOptionModel(eSData.filter((item: ExamScheduleTopikModel) => {
      return item.examPeriodId == getD.id
    })))
    setExamPeriodValue(getD != null ? getD.id : '')
    languageOption = ConvertLanguageOptionModel(responseLanguage.data as LanguageModel[]);
    countryOption = ConvertCountryOptionModel(responseCountries.data as CountryModel[]);
    examRoom = ConvertExamRoomOptionModel(responseExamRoom.data as ExamRoomModel[]);
    districtOption = ConvertDistrictOptionModel(responseDistrict.data as DistrictModel[]);
    wardOption = ConvertWardOptionModel(responseWard.data as WardModel[]);
    provinceOption = ConvertProvinceOptionModel(responseProvince.data as ProfileCatalogModel[]);
    examSchedule = ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]);
    headQuarter = ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]);
    area = getAreaByAcessHeaderQuater(ConvertAreaOption(responseArea.data as AreaModel[]), headQuarter)
    setPlaceTestC(headQuarter);
    exam = ConvertExamOptionModel(responseExam.data as ExamModel[]);
    const response: ResponseData = await getManageRegisteredCandidateTopik(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    manageRegisteredCandidates = (response.data || []) as ListCandidateTopikModel[];
    setList((response.data || []) as ListCandidateTopikModel[]);
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

  const [ticketLoading, setTicketLoading] = useState<string[]>([]);
  const [visibleTicket, setVisibleTicket] = useState<boolean>(false);
  const [printData, setPrintData] = useState<string>();
  const printTicket = async (value: ManageRegisteredCandidateTopikModel) => {
    setTicketLoading([value.id as string]);
    const header = {
      'apikey': import.meta.env.VITE_APIKEY,
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
    await fetch(import.meta.env.VITE_SERVER_BE + '/ManageRegisteredCandidateTopik/ExportPdfTicket?id=' + value.id as string, { method: "GET", headers: header })
      .then(response => {
        response.blob().then(blob => {
          let url = window.URL.createObjectURL(blob);
          const pdfWindow: Window = window.open() as Window;
          pdfWindow.location.href = url;
          // let a = document.createElement('a');
          // a.href = url;
          // a.download = value.userInfo?.fullName + `.pdf`;
          // a.click();
          setPrintData(url as string)
          // setVisibleTicket(true)
        });
      });
    setTicketLoading([]);
  };

  const printTicketsss = async (id: string, lang: string) => {
    setTicketLoading([id as string]);
    setShowSpin(true)
    const header = {
      'apikey': import.meta.env.VITE_APIKEY,
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
    await fetch(import.meta.env.VITE_SERVER_BE + '/ManageRegisteredCandidateTopik/GetPdfTicket?id=' + id + '&language=' + lang, { method: "GET", headers: header })
      .then(response => {
        response.blob().then(blob => {
          let url = window.URL.createObjectURL(blob);
          const pdfWindow: Window = window.open() as Window;
          pdfWindow.location.href = url;
          setPrintData(url as string)
        });
      });
    setTicketLoading([]);
    setShowSpin(false)
  };
  const antIcon = <LoadingOutlined style={{ fontSize: 70 }} spin />;
  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  const items: MenuItem[] = [
    getItem('In phiếu', 'sub', null, [
      getItem('vi', 'vi'),
      getItem('en', 'en'),
      getItem('ko', 'ko'),
    ]),
  ];

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [viewDetailVisible, setViewDetailVisible] = useState<boolean>(false);
  const [showSpin, setShowSpin] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<ManageRegisteredCandidateTopikModel>>({});
  const [viewData, setViewData] = useState<Partial<ManageRegisteredCandidateTopikModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const [viewDetailLoading, setViewDetailLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const response: ResponseData = await getManageRegisteredCandidateTopikById(id);
    const data = response.data as ManageRegisteredCandidateTopikModel;
    setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };
  const viewDetailData = async (id: string) => {
    setViewDetailLoading([id]);
    const response: ResponseData = await getManageRegisteredCandidateTopikById(id);
    const data = response.data as ManageRegisteredCandidateTopikModel;
    setViewData({
      ...data,
    });
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
  };

  const viewUpdateData = async (data: ManageRegisteredCandidateTopikModel) => {
    viewFormCancel()
    setDetailUpdateLoading([data.id as string]);
    setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };

  const updateSubmit = async (values: any) => {
    setUpdateSubmitLoading(true);
    const res = await putManageRegisteredCandidateTopik(undefined, values);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      searchFormSubmit(pagination.current);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  // searchForm
  const [exportExcelLoading, setExportExcelLoading] = useState<boolean>(false);
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      setLoading(true);
      const fieldsValue = await searchForm.validateFields();
      const dateReciveFrom =
        fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[0]).format('DD/MM/YYYY') : '';
      const dateReciveTo = fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[1]).format('DD/MM/YYYY') : '';
      const dateRecive = dateReciveFrom + ',' + dateReciveTo;
      if (dateReciveFrom.length > 0) fieldsValue.dateRecive = dateRecive;
      const response: ResponseData = await getManageRegisteredCandidateTopik(
        fieldsValue.areaId,
        fieldsValue.placeTest,
        fieldsValue.examVersion,
        fieldsValue.exam,
        fieldsValue.fullname != undefined ? fieldsValue.fullname.trim() : undefined,
        fieldsValue.cccd != undefined ? fieldsValue.cccd.trim() : undefined,
        fieldsValue.dateRecive,
        current,
        pageSize,
        fieldsValue.userName != undefined ? fieldsValue.userName.trim() : undefined,
        fieldsValue.sbd != undefined ? fieldsValue.sbd.trim() : undefined,
        fieldsValue.examPeriod,
        fieldsValue.blacklist
      );
      manageRegisteredCandidates = (response.data || []) as ManageRegisteredCandidateTopikModel[];
      setList((response.data || []) as ListCandidateTopikModel[]);
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

  const onChangeExamPeriod = async (id: string) => {
    const data = examScheduleO.filter((item: ExamScheduleTopikModel) => {
      return item.examPeriodId == id;
    });
    setExamScheduleTemp(ConvertExamScheduleOptionModel(data));
  };

  const onChangeArea = async (id: string) => {
    const placeTemp = headQuarter.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setPlaceTestC(placeTemp);
  };

  const resetForm = async () => {
    searchForm.resetFields();
    setPlaceTestC(headQuarter);
  };

  const exportExcel = async (): Promise<void> => {
    try {
      setExportExcelLoading(true);
      const fieldsValue = await searchForm.validateFields();
      const dateReciveFrom =
        fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[0]).format('DD/MM/YYYY') : '';
      const dateReciveTo = fieldsValue.dateRecive != null ? moment(fieldsValue.dateRecive[1]).format('DD/MM/YYYY') : '';
      const dateRecive = dateReciveFrom + ',' + dateReciveTo;
      if (dateReciveFrom.length > 0) fieldsValue.dateRecive = dateRecive;
      const response: ResponseData = await exportExcelRegisteredCandidateTopik(
        fieldsValue.areaId,
        fieldsValue.placeTest,
        fieldsValue.examVersion,
        fieldsValue.exam,
        fieldsValue.fullname,
        fieldsValue.cccd,
        fieldsValue.dateRecive,
        fieldsValue.userName,
        fieldsValue.sbd,
        fieldsValue.examPeriod,
        fieldsValue.blacklist
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

  const columns: ColumnsType<ListCandidateTopikModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      render: (_, record) => <span>{record.fullName}</span>,
    },
    {
      title: 'SĐT',
      dataIndex: 'sdt',
      render: (_, record) => <span>{record.phone}</span>,
    },
    {
      title: 'Bài thi',
      dataIndex: 'examName',
      render: (_, record) => <span>{exam.find((p) => p.value == record.examId)?.label}</span>,
    },
    {
      title: 'Địa điểm thi',
      dataIndex: 'areaTest',
      render: (_, record) => <span>{headQuarter.find((p) => p.value == record.placeTest)?.label}</span>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'dateRegister',
      render: (_, record) => (
        <span>{record.dateCreated}</span>
      ),
    },
    {
      title: 'Lệ phí',
      dataIndex: 'cccd',
      render: (_, record) => <span>{ConvertIntToCurrencyFormat(record.price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'isPaid',
      render: (_, record) => (
        <span>
          {record.isPaid == 1
            ? 'Chưa thanh toán'
            : record.isPaid == 2
              ? 'Đã thanh toán'
              : record.isPaid == 3
                ? 'Quá hạn thanh toán'
                : 'Không thanh toán'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 300,
      render: (_, record) => (
        <>
          <Permission noNode navigation={layoutCode.manageRegisteredCandidateTopik as string} bitPermission={PermissionAction.View}>
            <Button
              type='link'
              loading={viewDetailLoading.includes(record.id || '')}
              onClick={() => viewDetailData(record.id || '')}
            >
              Xem
            </Button>
          </Permission>
          <Permission noNode navigation={layoutCode.manageRegisteredCandidateTopik as string} bitPermission={PermissionAction.Edit}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Sửa
            </Button>
          </Permission>
          <Permission noNode navigation={layoutCode.manageRegisteredCandidateTopik as string} bitPermission={PermissionAction.View}>
            <Button type='text'>
              <Menu hidden={visibleTicket} onClick={(e) => {
                switch (e.key) {
                  case 'vi':
                    printTicketsss(record.id, 'vi');
                    break;
                  case 'en':
                    printTicketsss(record.id, 'en');
                    break;
                  case 'ko':
                    printTicketsss(record.id, 'ko');
                    break;
                }
              }} mode="vertical" items={items} />

            </Button>
          </Permission>

        </>
      ),
    },
  ];

  return (
    <div className='layout-main-conent'>
      <Modal closable={false} style={{ backgroundColor: 'transparent', textAlign: 'center' }} footer={null} open={showSpin}>
        <Spin style={{ display: 'inline', left: '50%' }} size='large' indicator={antIcon} />
      </Modal>
      <Card
        bordered={false}
        title={
          <Collapse>
            <Panel header='Tìm kiếm' key='1'>
              <Form form={searchForm} name='search'>
                <Row gutter={24} justify='end'>
                  <Col span={4}>
                    <Form.Item label={'Khu vực'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='areaId'>
                      <Select placeholder='Chọn khu vực' options={area} onChange={onChangeArea} />
                    </Form.Item>
                    <Form.Item
                      label={'Ngày đăng ký'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 20 }}
                      name='dateRecive'
                    >
                      <RangePicker />
                    </Form.Item>

                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label={'Địa điểm thi'}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 20 }}
                      name='placeTest'
                    >
                      <Select placeholder='Chọn địa điểm' options={placeTestC} />
                    </Form.Item>
                    <Form.Item label={'Họ và tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='fullname'>
                      <Input placeholder='Nhập họ tên' />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Bài thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='exam'>
                      <Select placeholder='Chọn bài thi' options={exam} />
                    </Form.Item>

                    <Form.Item label={'CCCD/CMND/HC'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='cccd'>
                      <Input placeholder='Nhập CCCD/CMND/HC' />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Kỳ thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='examPeriod'>
                      <Select placeholder='Chọn kỳ thi' options={examPeriodOption} defaultValue={examPeriodValue} onChange={onChangeExamPeriod} />
                    </Form.Item>

                    <Form.Item label={'Email đăng ký tài khoản'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='userName'>
                      <Input placeholder='Nhập email' />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='examVersion'>
                      <Select placeholder='Chọn lịch thi' options={examScheduleTemp} />
                    </Form.Item>
                    <Form.Item label={'Số báo danh'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='sbd'>
                      <Input placeholder='Nhập số báo danh' />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item label={'Blacklist'} labelCol={{ span: 24 }} wrapperCol={{ span: 20 }} name='blacklist' valuePropName="checked">
                      <Checkbox>Tìm theo danh sách blacklist</Checkbox>
                    </Form.Item>
                    <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                      Tìm kiếm
                    </Button>
                    <Button type='primary' style={{ marginLeft: 8 }} loading={exportExcelLoading} htmlType='submit' onClick={() => exportExcel()}>
                      Xuất excel
                    </Button>
                    <Row>
                      <Button htmlType='button' style={{ marginTop: 8 }} onClick={() => resetForm()}>
                        Làm lại
                      </Button>
                    </Row>


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
          size='small'
          columns={columns}
          dataSource={list}
          loading={loading}

          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              searchFormSubmit(page, pageSize);
            },
            showTotal,
          }}
        />
      </Card>
      {/* 
      {visibleTicket ? (
        <Modal
          footer={[
            <Button key="submit" type="primary">
              In
            </Button>,
          ]}
          width={'60%'} title="Thông tin phiếu dự thi" open={visibleTicket} onCancel={() => setVisibleTicket(false)}>
          <Viewer fileUrl={printData as string} />
        </Modal>
      ) : null} */}
      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          examOption={exam}
          areaOption={area}
          placeOption={headQuarter}
          examSchedule={examSchedule}
          provinceOption={provinceOption}
          districtOption={districtOption}
          wardOption={wardOption}
          countryOption={countryOption}
          languageOption={languageOption}
        />
      ) : null}
      {viewDetailVisible && Object.keys(viewData).length > 0 ? (
        <ViewDetail
          values={viewData}
          onCancel={() => viewFormCancel()}
          visible={viewDetailVisible}
          onSubmit={viewUpdateData}
          onSubmitLoading={updateSubmitLoading}
          examOption={exam}
          areaOption={area}
          placeOption={headQuarter}
          examSchedule={examSchedule}
          provinceOption={provinceOption}
          districtOption={districtOption}
          wardOption={wardOption}
          countryOption={countryOption}
          languageOption={languageOption}
          examRoom={examRoom}
        />
      ) : null}

    </div>
  );
}

export default App;
