import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  PaginationProps,
  Row,
  Space,
  Table,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { BlacklistModel, BlacklistShowModel } from '@/apis/models/BlacklistModel';
import { ColumnsType } from 'antd/lib/table';
import { Code, DecisionBlacklistModel, ResonBlacklistModel, TimeFrameModel } from '@/apis';

import { getExam, getHeadQuarter } from '@/apis/services/PageService';
import { DecisionBlacklistShowListModel, ExamModel, HeadQuarterModel, OptionModel, SelectOptionModel } from '@/apis/models/data';
import { ConvertExamOptionModel, ConvertHeaderQuarterOptionModel, ConvertOptionSelectModel, ConvertTimeFrameOptionModel, convertStatusDecision } from '@/utils/convert';
import { getTimeFrame } from '@/apis/services/TimeFrameService';
import dayjs from 'dayjs';
import moment from 'moment';
import {
  deleteBlacklist,
  getBlacklist,
  getBlacklistById,
  postBlacklist,
  putBlacklist,
  readDataFromFile,
} from '@/apis/services/BlacklistService';
import ImportFile from '@/components/Blacklist/ImportFile/ImportFile';
import ShowResultImport from '@/components/Blacklist/ShowResultImport/ShowResultImport';
import Permission from '@/components/Permission';
import { examForm, layoutCode, PermissionAction } from '@/utils/constants';
import CreateForm from './CreateForm';
import { approveBlacklist, deleteDecisionBlacklist, getDecisionBlacklist, getDecisionBlacklistById, postDecisionBlacklist, putDecisionBlacklist } from '@/apis/services/DecisionBlacklistService';
import UpdateForm from './UpdateForm';
import { getResonBlacklist } from '@/apis/services/ResonBlacklistService';
import UpdateDecision from './UpdateDecision';

var blacklist: BlacklistModel[] = [];
var headQuarter: SelectOptionModel[] = [];
var timeFrames: SelectOptionModel[] = [];
var examOption: SelectOptionModel[] = [];
var decisionBlacklistShow: DecisionBlacklistShowListModel[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const showTotal: PaginationProps['showTotal'] = (total) => `Total ${total} items`;
  const [list, setList] = useState<DecisionBlacklistShowListModel[]>([]);
  const [resonBlacklist, setResonBlacklist] = useState<SelectOptionModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const responseResonBlacklist: ResponseData = await getResonBlacklist();
    setResonBlacklist(responseResonBlacklist.data as SelectOptionModel[])
    const response: ResponseData = await getBlacklist();
    const responseExam: ResponseData = await getExam(true, false);
    const responseHeadQuarter: ResponseData = await getHeadQuarter();
    const responseTimeFrame: ResponseData = await getTimeFrame();
    const getResonBlacklists: ResponseData = await getResonBlacklist()
    setResonBlacklist(ConvertOptionSelectModel<OptionModel>(getResonBlacklists.data as OptionModel[]))
    const examOptionTemp = (responseExam.data as ExamModel[]).filter(p => p.examForm == examForm.TinHoc || p.examForm == examForm.TiengAnh);
    examOption = ConvertExamOptionModel(examOptionTemp);
    timeFrames = ConvertTimeFrameOptionModel(responseTimeFrame.data as TimeFrameModel[]);
    headQuarter = ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]);
    setList(response.data as DecisionBlacklistShowListModel[]);
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
  const [search, setSearch]: [string, (search: string) => void] = useState('');

  const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading([id]);
        const res = await deleteDecisionBlacklist(id);
        if (res.code == Code._200) {
          message.success('Thành công !');
          getList(pagination.current);
          setDeleteLoading([]);
        } else {
          message.error(res.message);
        }
        setDeleteLoading([]);
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateFormDecisionVisible, setUpdateFormDecisionVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<BlacklistModel>>({});
  const [updateDataDecision, setUpdateDataDecision] = useState<Partial<BlacklistModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const [decisionData, setDecisionData] = useState<DecisionBlacklistModel[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const res: ResponseData = await getDecisionBlacklistById(id)
    const data = res.data as DecisionBlacklistModel
    setUpdateDataDecision({
      ...data,
    });
    // const getDecisionRes: ResponseData = await getDecisionBlacklist(id)
    // setDecisionData(getDecisionRes.data as DecisionBlacklistModel[])
    setUpdateFormDecisionVisible(true);
    setDetailUpdateLoading([]);
  };

  const detailBlacklistData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const res: ResponseData = await getBlacklistById(id)
    const data = res.data as BlacklistShowModel
    setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };

  const updataFormDecisionCancel = async () => {
    setUpdateDataDecision({});
    setUpdateFormDecisionVisible(false);
  };


  const updataFormCancel = async () => {
    setUpdateData({});
    setUpdateFormVisible(false);
  };

  const updateSubmit = async (values: BlacklistModel) => {
    setUpdateSubmitLoading(true);
    const res = await putBlacklist(undefined, values);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      getList(pagination.current);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  const updateSubmitDecision = async (value: DecisionBlacklistModel, form: FormInstance) => {
    setUpdateSubmitLoading(true);
    const res = await putDecisionBlacklist(undefined, value);
    if (res.code == Code._200) {
      message.success('Thành công !');
      form.resetFields();
      setUpdateFormDecisionVisible(false);
      getList(1);
    } else {
      message.error(res.message);
    }
    setUpdateSubmitLoading(false);
  };

  // Save
  const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
  const [searchSubmitLoading, setSearchhSubmitLoading] = useState<boolean>(false);
  const [createFormVisible, setCreateFormVisible] = useState<boolean>(false);
  const [valueSearchName, setValueSearchName] = useState<string>();
  const [valueSearchDOB, setValueSearchDOB] = useState<string>();
  const [valueCreateProcess, setVslueCreateProcess] = useState<BlacklistModel>();
  const createSubmit = async (values: any, form: FormInstance) => {
    setVslueCreateProcess(values);
    setCreateSubmitLoading(true);
    const res = await postBlacklist(undefined, values);
    if (res.code == Code._200) {
      message.success('Thành công !');
      form.resetFields();
      getList(1);
      setCreateFormVisible(false)
    } else {
      message.error(res.message);
    }
    setCreateSubmitLoading(false);
  };
  const handleOk = async () => {
    // const res = await postBlacklist(undefined, valueCreateProcess);
    // if (res.code == Code._200) {
    //   message.success('Thành công !');
    //   getList(1);
    // } else {
    //   message.error(res.message);
    // }
    // setIsModalOpen(false);
  };

  const handleCancel = () => {
    searchForm.setFieldValue('name', valueSearchName);
    searchForm.setFieldValue('dob', moment(valueSearchDOB));
    setIsModalOpen(false);
  };
  const [importSubmitLoading, setImportSubmitLoading] = useState<boolean>(false);
  const [importResultShow, setImportResultShow] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<string>();
  const [importFormVisible, setImportFormVisible] = useState<boolean>(false);
  const [importSearchVisible, setImportSearchVisible] = useState<boolean>(false);
  const importSubmit = async (file: Blob): Promise<void> => {
    setImportSubmitLoading(true);
    const res = await readDataFromFile('', { formFile: file });
    if (res.code == Code._200) {
      setImportFormVisible(false);
      setImportResult(res.message as string);
      setImportResultShow(true);
      message.success('Thành công !');
      getList(1);
    } else {
      message.error(res.message);
    }
    setImportSubmitLoading(false);
  };
  const approve = async (id: string, approve: boolean, note?: string) => {
    const res = await approveBlacklist(id, approve, note);
    if (res.code == Code._200) {
      updataFormCancel();
      message.success('Thành công !');
      setUpdateFormDecisionVisible(false);
      searchFormSubmit(pagination.current);
    } else {
      message.error(res.message);
    }
  };

  // searchForm
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();
      const dob = fieldsValue.to != null ? moment(fieldsValue.from).format('DD/MM/YYYY') : '';
      const response: ResponseData = await getBlacklist(fieldsValue.name, dob, fieldsValue.cccd, false, current, pageSize);
      blacklist = (response.data || []) as BlacklistModel[];
      setList((response.data || []) as BlacklistModel[]);
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

  const columns: ColumnsType<DecisionBlacklistShowListModel> = [
    {
      title: 'STT',
      key: 'index',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Họ và tên',
      key: 'fullname',
      dataIndex: 'fullname',
      render: (_, record) => <span><Button
        type='link'
        loading={detailUpdateLoading.includes(record.blacklistId || '')}
        onClick={() => detailBlacklistData(record.blacklistId || '')}
      >
        {record.fullName}
      </Button></span>,
    },
    {
      title: 'Ngày sinh',
      key: 'dateOfBirth',
      dataIndex: 'dateOfBirth',
      render: (_, record) => <span>{dayjs(record.dateOfBirth).format('DD-MM-YYYY')}</span>,
    },
    {
      title: 'Số giấy tờ',
      key: 'cccd',
      dataIndex: 'cccd',
      render: (_, record) => <span>{record.idNumberCard}</span>,
    },
    {
      title: 'Số quyết định',
      key: 'decisionNumber',
      dataIndex: 'decisionNumber',
      render: (_, record) => <span>{record.decisionNumber}</span>,
    },
    {
      title: 'Ngày hiệu lực',
      key: 'startDate',
      dataIndex: 'startDate',
      render: (_, record) => (
        <span>{record.startDate != null ? dayjs(record.startDate).format('DD-MM-YYYY') : ''}</span>
      ),
    },
    {
      title: 'Ngày hết hạn',
      key: 'endDate',
      dataIndex: 'endDate',
      render: (_, record) => (
        <span>{record.endDate != null ? dayjs(record.endDate).format('DD-MM-YYYY') : ''}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <>
          <Permission navigation={layoutCode.listBlacklist} bitPermission={PermissionAction.Edit} noNode={<></>}>
            <Button
              type='link'
              loading={detailUpdateLoading.includes(record.id || '')}
              onClick={() => detailUpdateData(record.id || '')}
            >
              Xem
            </Button>
          </Permission>

          <Divider type='vertical' />
          <Permission navigation={layoutCode.listBlacklist} bitPermission={PermissionAction.Delete} noNode={<></>}>
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
          <Space>
            <Permission navigation={layoutCode.listBlacklist} bitPermission={PermissionAction.Add} noNode={<></>}>
              <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                Thêm mới
              </Button>
              <Button style={{ background: '#1AC917', color: 'white' }} onClick={() => setImportFormVisible(true)}>
                Import
              </Button>
            </Permission>
          </Space>
        }
        extra={
          <div>
            <Form form={searchForm} name='search'>
              <Row gutter={12} justify='end'>
                <Col xs={24} sm={24} md={24} lg={6} xl={5}>
                  <Form.Item name='name'>
                    <Input placeholder='Họ tên' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={5}>
                  <Form.Item name='dob'>
                    <DatePicker placeholder='Chọn' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={5}>
                  <Form.Item name='cccd'>
                    <Input placeholder='Số giấy tờ' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={9}>
                  <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                    Tìm kiếm
                  </Button>
                  <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => searchForm.resetFields()}>
                    Làm lại
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        }
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
      <ShowResultImport onCancel={() => setImportResultShow(false)} visible={importResultShow} values={importResult} />
      <CreateForm
        onCancel={() => setCreateFormVisible(false)}
        visible={createFormVisible}
        onSubmit={createSubmit}
        onSubmitLoading={createSubmitLoading}
        examOption={examOption}
        resonBlacklist={resonBlacklist}
      />

      <ImportFile
        onCancel={() => setImportFormVisible(false)}
        visible={importFormVisible}
        onSubmit={importSubmit}
        onSubmitLoading={createSubmitLoading}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
          examOption={examOption}
          resonBlacklist={resonBlacklist}
        />
      ) : null}


      <UpdateDecision
        onApprove={approve}
        onCancel={() => updataFormDecisionCancel()}
        visible={updateFormDecisionVisible}
        onSubmit={updateSubmitDecision}
        onSubmitLoading={updateSubmitLoading}
        examOption={examOption}
        resonBlacklist={resonBlacklist}
        values={updateDataDecision}
      />

      <Modal
        title='Xác nhận thông tin'
        open={isModalOpen}
        footer={[
          <Button key='back' onClick={() => handleCancel()}>
            Kiểm tra lại
          </Button>,
          <Button key='submit' type='primary' htmlType='submit' onClick={() => handleOk()}>
            Lưu lại
          </Button>,
        ]}
      >
        <p>
          Đã tồn tại trong hệ thống thí sinh <span className='fontBold'>{valueSearchName}</span> có ngày sinh{' '}
          <span className='fontBold'>{dayjs(valueSearchDOB).format('DD/MM/YYYY')}</span>
          .<br /> Vui lòng kiểm tra lại thông tin !
        </p>
      </Modal>
    </div>
  );
}

export default App;
