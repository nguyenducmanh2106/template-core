import { ExamPeriodResponse } from "@/apis/models/data";
import { PaymentDetail, PaymentSearchModel } from "@/apis/models/PaymentModel";
import { getExamPeriod } from "@/apis/services/ExamPeriodService";
import { exportPaymentHistory, searchPayment } from "@/apis/services/PaymentService";
import Detail from "@/components/Payment/Detail";
import { ConvertIntToCurrencyFormat } from "@/utils/convert";
import { PaginationConfig, ResponseData } from "@/utils/request";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { useEffect, useState } from "react";

function App() {
  const [listExamPeriod, setListExamPeriod] = useState<ExamPeriodResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [paymentDetail, setPaymentDetail] = useState<Partial<PaymentDetail>>({});
  const [list, setList] = useState<PaymentDetail[]>([]);
  const [searchParams, setSearchParams] = useState<Partial<PaymentSearchModel>>({ pageNumber: 1, pageSize: 10 });
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    setPagination({ ...pagination, current, pageSize });
    const response: ResponseData = await searchPayment(searchParams);
    setList((response.data || []) as PaymentDetail[]);
    setPagination({ ...pagination, total: response.totalCount || 0 });
    setLoading(false);
  };

  useEffect(() => {
    getList(pagination.current, pagination.pageSize);
  }, [searchParams]);

  useEffect(() => { getExamPeriod().then(response => setListExamPeriod(response.data as ExamPeriodResponse[])) }, []);

  const [searchForm] = Form.useForm();
  const searchFormSubmit = async (value: any) => {
    try {
      setSearchParams({
        ...searchParams,
        candicateName: value.candicateName,
        fromDate: value.fromDate != undefined ? moment(value.fromDate).format("YYYY-MM-DD") : undefined,
        pageNumber: 1,
        pageSize: pagination.pageSize,
        phoneNumber: value.phoneNumber,
        toDate: value.toDate != undefined ? moment(value.toDate).format("YYYY-MM-DD") : undefined,
        transactionNo: value.transactionNo,
        status: value.status,
        examPeriodId: value.examPeriodId,
        userEmail: value.userEmail
      });

      setPagination({ ...pagination, current: 1 });
    } catch (error: any) {
      console.log(error);
    }
  };

  const resetForm = () => {
    try {
      searchForm.resetFields();
      setSearchParams({});
      setPagination({ ...pagination, current: 1 });
    } catch (error: any) {
      console.log(error);
    }
  };

  const columns: ColumnsType<PaymentDetail> = [
    {
      title: "STT",
      dataIndex: "index",
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
    },
    {
      title: "Họ tên",
      dataIndex: ["paymentRequest", "vietnameseName"],
    },
    {
      title: "SĐT",
      dataIndex: ["paymentRequest", "phoneNumber"],
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "PayDate",
      render: (_, record) => <>{moment(record.paymentRequest.createDate, "YYYYMMDDHHmmss").format("DD/MM/YYYY HH:mm:ss")}</>
    },
    {
      title: "Tổng tiền",
      dataIndex: ["paymentRequest", "Amount"],
      render: (_, record) => <>{ConvertIntToCurrencyFormat(Number(record.paymentRequest.amount) / 100)}</>
    },
    {
      title: "Email",
      dataIndex: "UserEmail",
      render: (_, record) => <>{record.paymentRequest.userEmail}</>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, record) => {
        var text = "Chưa thanh toán";
        switch (record.paymentStatus) {
          case 2:
            text = "Thành công";
            break;
          case 4:
            text = "Không thành công";
            break;
          case 9:
            text = "Pilot";
            break;
          default:
            break;
        }
        return <>{text}</>;
      }
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: (_, record) => <Button type="link" onClick={() => { setOpenDetail(true); setPaymentDetail(record); }}>Chi tiết</Button>
    }
  ];

  return (
    <div className="layout-main-conent">
      <Form form={searchForm} name="search" onFinish={searchFormSubmit}>
        <Row gutter={20}>
          <Col span={3}>
            <Form.Item label="Từ ngày" name="fromDate">
              <DatePicker placeholder="Từ ngày" />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Đến ngày" name="toDate">
              <DatePicker placeholder="Đến ngày" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Trạng thái" name="status">
              <Select allowClear={true} options={[
                {
                  label: "Thành công",
                  value: 2
                },
                {
                  label: "Không thành công",
                  value: 4
                },
                {
                  label: "Chưa thanh toán",
                  value: 1
                },
                {
                  label: "Pilot",
                  value: 9
                },
              ]} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Email đăng ký thi" name="userEmail">
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Họ và tên" name="candicateName">
              <Input placeholder="Họ và tên" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="SĐT" name="phoneNumber">
              <Input placeholder="SĐT" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Kỳ thi" name="examPeriodId">
              <Select allowClear options={listExamPeriod.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Space>
              <Button key="submit" type="primary" htmlType="submit">Tìm kiếm</Button>
              <Button key="reset" htmlType="button" onClick={resetForm}>Làm lại</Button>
              <Button key="export" type="primary" htmlType="button" loading={loadingExport} icon={<DownloadOutlined />}
                onClick={event => {
                  setLoadingExport(true);
                  var searchFormValue = searchForm.getFieldsValue();
                  var searchObj: Partial<PaymentSearchModel> = {
                    candicateName: searchFormValue.candicateName,
                    fromDate: searchFormValue.fromDate != undefined ? moment(searchFormValue.fromDate).format("YYYY-MM-DD") : undefined,
                    phoneNumber: searchFormValue.phoneNumber,
                    toDate: searchFormValue.toDate != undefined ? moment(searchFormValue.toDate).format("YYYY-MM-DD") : undefined,
                    transactionNo: searchFormValue.transactionNo,
                    status: searchFormValue.status,
                    examPeriodId: searchFormValue.examPeriodId
                  };
                  exportPaymentHistory(searchObj)
                    .then(response => {
                      var url = URL.createObjectURL(response);
                      var elm = document.createElement('a');
                      elm.href = url;
                      elm.setAttribute('download', `PaymentHistory_${moment().format('YYYYMMDDHHmmss')}.xlsx`);
                      elm.click();
                      elm.remove();
                      URL.revokeObjectURL(url);
                    }).catch().finally(() => setLoadingExport(false));
                  event.currentTarget.blur();
                }}>Xuất excel</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Divider />
      <Table
        rowKey={record => record.paymentRequest.id}
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page: number, pageSize: number) => {
            setSearchParams({ ...searchParams, pageSize: pageSize, pageNumber: page });
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize
            });
          },
          showTotal: (total: number) => `Total ${total} items`
        }}
      />
      <Detail open={openDetail} PaymentDetail={paymentDetail} onCancel={() => setOpenDetail(false)} />
    </div >
  );
}

export default App;
