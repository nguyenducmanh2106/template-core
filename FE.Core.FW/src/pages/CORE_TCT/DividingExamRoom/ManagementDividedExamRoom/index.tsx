import { useEffect, useReducer, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Row,
  Table,
  Image,
  Tabs,
  Select,
  Tooltip,
} from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { Code, ExamScheduleTopikModel, ManageApplicationTimeModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';

import {
  ConvertAreaOption,
  ConvertExamOptionModel,
  ConvertExamScheduleOptionModel,
  ConvertHeaderQuarterOptionModel,
  ConvertIntToCurrencyFormat,
  ConvertTimeApplicationOptionModel,
} from '@/utils/convert';
import { ExamModel, HeadQuarterModel, SelectOptionModel, ServiceAlongExamModel, AreaModel } from '@/apis/models/data';
import { getArea, getExam, getHeadQuarter, getServiceAlongExam } from '@/apis/services/PageService';
import styles from '@/assets/css/index.module.less';
import {
  getQueryList,
  deleteDividingRoom,
  getQueryExamRooms,
  exportExcelManagementDividedCandidate,
  exportExcelManagementDividedCandidateByExamPlace
} from '@/apis/services/DividingExamPlaceService';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { DividingExamPlaceModel } from '@/apis/models/DividingExamPlaceModel';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ExamRoomDividedModel } from '@/apis/models/ExamRoomDividedModel';
import { DownloadOutlined } from '@ant-design/icons';

function DividingExamRoomDetail() {
  // Load
  const navigate = useNavigate();
  const params = useParams()
  const { Panel } = Collapse;
  const initState = {
    area: [], exam: [], headQuarter: [], examSchedule: []
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ExamRoomDividedModel[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>((prevState: any, updatedProperty: any) => ({
    ...prevState,
    ...updatedProperty,
  }), initState);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const onHandleExportExcelCandidateDividingRoom = async () => {
    // console.log(id)
    setConfirmLoading(true);
    const fieldsValue = await searchForm.validateFields();
    const response = await exportExcelManagementDividedCandidateByExamPlace(
      params.dividingExamPlaceId,
      params.examPlaceId)
    if (response.code == Code._200) {
      console.log(response)
      window.location.href = import.meta.env.VITE_HOST + "/" + response.data;
      setConfirmLoading(false);
    }
    else {
      message.error(response.message || "Xuất file thất bại");
      setConfirmLoading(false);
    }
  }

  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    const responseArea: ResponseData = await getArea();
    const responseExam: ResponseData = await getExam();
    const responseHeadQuarter: ResponseData = await getHeadQuarter('00000000-0000-0000-0000-000000000000');
    const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik();

    const stateDispatcher = {
      examSchedule: ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[]),
      headQuarter: ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]),
      area: ConvertAreaOption(responseArea.data as AreaModel[]),
      exam: ConvertExamOptionModel(responseExam.data as ExamModel[]),
    }
    dispatch(stateDispatcher)

    searchFormSubmit(current, pageSize)

    setLoading(false);
  };
  useEffect(() => {
    async () => {
      const responseHeadQuarter: ResponseData = await getHeadQuarter();

      const stateDispatcher = {
        headQuarter: ConvertHeaderQuarterOptionModel(responseHeadQuarter.data as HeadQuarterModel[]),
      }
      dispatch(stateDispatcher)
    }
    getList(1);
  }, []);

  const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        // setDeleteLoading([id]);
        // const res = await deleteManageRegisteredCandidateTopik(id);
        // if (res.code == Code._200) {
        //   message.success('Thành công !');
        //   getList(pagination.current);
        //   setDeleteLoading([]);
        // } else {
        //   message.error(res.message);
        // }
        // setDeleteLoading([]);
      },
    });
  };

  // Data
  const [showModelDividingExamRoomVisible, setShowModelDividingExamRoomVisible] = useState<boolean>(false);

  const onHandleShowModelCreate = async () => {
    setShowModelDividingExamRoomVisible(true);
  };


  // searchForm
  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (current: number = 1, pageSize: number = 10): Promise<void> => {
    try {
      const fieldsValue = await searchForm.validateFields();

      console.log(fieldsValue)
      const response: ResponseData = await getQueryExamRooms(
        params.dividingExamPlaceId,
        params.examPlaceId,
        current,
        pageSize
      );
      setList((response.data || []) as ExamRoomDividedModel[]);
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

  const columns: ColumnsType<ExamRoomDividedModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'examRoomName',
      render: (_, record) => <span>{record.examRoomName}</span>,
    },
    {
      title: 'Địa điểm thi',
      dataIndex: 'examPlaceName',
      render: (_, record) => <span>{record.examPlaceName}</span>,
    },

    {
      title: 'Khu vực',
      dataIndex: 'examAreaName',
      render: (_, record) => <span>{record.examAreaName}</span>,
    },
    {
      title: 'Lịch thi',
      dataIndex: 'examScheduleTopikName',
      render: (_, record) => <span>{record.examScheduleTopikName}</span>,
    },
    {
      title: 'Số lượng thí sinh',
      dataIndex: 'actualQuantity',
      render: (_, record) => (
        <span>{record.actualQuantity}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 260,
      render: (_, record) => (
        <>
          {record.actualQuantity ?? 0 > 0 ? <Button
            type='primary'
            loading={false}
            onClick={() => { navigate(`/core-tct/management-divided-candidate/${record.dividingExamPlaceId}/${record.examRoomId}`) }
            }
            style={{ marginRight: '4px' }}
          >
            DS thí sinh
          </Button > :
            <Button
              type='primary'
              disabled
              style={{ marginRight: '4px' }}
            >
              DS thí sinh
            </Button >
          }

        </>
      ),
    },
  ];

  return (
    <div className='layout-main-content'>
      <Card
        bordered={false}
        title={
          <>
            <Row gutter={16} justify='start'>
              <Col span={24} className="gutter-row">
                {/* <Collapse>
                  <Panel header='Tìm kiếm' key='1'>
                    <Form form={searchForm} name='search'>
                      <Row gutter={16} justify='start'>
                        <Col span={6}>
                          <Form.Item label={'Khu vực'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='ExamAreaId'>
                            <Select placeholder='Chọn khu vực' options={state.area} onChange={() => onChangeHeaderQuarter()} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label={'Địa điểm thi'}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 17 }}
                            name='ExamPlaceId'
                          >
                            <Select placeholder='Chọn địa điểm' options={state.headQuarter} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label={'Kỳ thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='ExamScheduleTopikId'>
                            <Select placeholder='Chọn kỳ thi' options={state.examSchedule} />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                            Tìm kiếm
                          </Button>
                          <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => searchForm.resetFields()}>
                            Làm lại
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Panel>
                </Collapse> */}

                <div className="d-flex" style={{ background: "#fff" }}>
                  <div className="left">
                    <Tooltip title="Quay lại">
                      <a className="btn-link back icon--back_24" href='javascript://' onClick={() => navigate(-1)}></a>
                    </Tooltip>
                  </div>
                  <div className="right">
                    <div className="avatar">
                      <div className="img-default d-flex" style={{ fontSize: "16px", fontWeight: "600" }}>
                        <span>Danh sách phòng thi theo địa điểm:</span>&nbsp;
                        <div style={{ fontWeight: "400", marginRight: '4px' }}>{list?.length > 0 ? list[0].examPlaceName : ""}</div>
                        <Button type="primary" shape="round" icon={<DownloadOutlined />} size={"middle"}
                          onClick={() => onHandleExportExcelCandidateDividingRoom()} loading={confirmLoading}>
                          Xuất Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>


          </>

        }
        extra={<div></div>}
      >
        <Table
          rowKey='id'
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
      </Card>

    </div>
  );
}

export default DividingExamRoomDetail;
