import { PaymentITDetail, PaymentResponse } from "@/apis/models/PaymentITModel";
import { getPaymentITDetail } from "@/apis/services/PaymentItService";
import { ConvertIntToCurrencyFormat } from "@/utils/convert";
import { Button, Col, Divider, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from "moment";
import React, { useEffect, useState } from 'react';

const Detail: React.FC<{
  PaymentDetail: Partial<PaymentITDetail>,
  open: boolean,
  onCancel: () => void
}> = props => {
  const [listPaymentResponse, setListPaymentResponse] = useState<PaymentResponse[]>([]);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  useEffect(() => {
    if (props.open && props.PaymentDetail.paymentStatus != undefined) {
      setLoadingResponse(true);
      getPaymentITDetail(props.PaymentDetail.paymentRequest?.id ?? '')
        .then(response => setListPaymentResponse(response.data as PaymentResponse[]))
        .catch().finally(() => setLoadingResponse(false));
    }
  }, [props.open]);
  const columns: ColumnsType<PaymentResponse> = [
    {
      title: "STT",
      dataIndex: "index",
      width: 80,
      render: (_, record, index) => <>{index + 1}</>,
    },
    {
      title: "Trạng thái",
      dataIndex: "result",
      render: (_, record) => <>{record.result ? "Giao dịch thành công" : "Giao dịch không thành công"}</>
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankCode",
    },
    {
      title: "Mã giao dich ngân hàng",
      dataIndex: "bankTranNo"
    },
    {
      title: "Mã giao dịch VNPAY",
      dataIndex: "transactionNo",
    },
    {
      title: "Loại thẻ",
      dataIndex: "cardType",
    },
    {
      title: "Thời gian thực hiện",
      dataIndex: "payDate",
      render: (_, record) => (<>{moment(record.payDate).format("DD/MM/YYYY HH:mm:ss")}</>)
    },
    {
      title: "Thời gian tạo bản ghi",
      dataIndex: "payDate",
      render: (_, record) => (<>{moment(record.dateCreateRecord).format("DD/MM/YYYY HH:mm:ss")}</>)
    },
  ];

  return (
    <Modal
      destroyOnClose
      width={'80%'}
      maskClosable={false}
      title='Chi tiết'
      open={props.open}
      onCancel={props.onCancel}
      footer={[
        <Button key='back' onClick={() => props.onCancel()}>Đóng</Button>
      ]}
    >
      <Row>
        <Col span={4}>Id thanh toán</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.id}</Col>
      </Row>
      <Row>
        <Col span={4}>Id đăng ký thi</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.candidateId}</Col>
      </Row>
      <Row>
        <Col span={4}>Số tiền</Col>
        <Col span={20}>{ConvertIntToCurrencyFormat(Number(props.PaymentDetail.paymentRequest?.amount))}</Col>
      </Row>
      <Row>
        <Col span={4}>Đơn vị tiền tệ</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.currencyCode}</Col>
      </Row>
      <Row>
        <Col span={4}>Ngày sinh</Col>
        <Col span={20}>{moment(props.PaymentDetail.paymentRequest?.dob).format("DD/MM/YYYY")}</Col>
      </Row>
      <Row>
        <Col span={4}>Số điện thoại</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.phoneNumber}</Col>
      </Row>
      <Row>
        <Col span={4}>Tên thí sinh</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.vietnameseName}</Col>
      </Row>
      <Row>
        <Col span={4}>Email</Col>
        <Col span={20}>{props.PaymentDetail.paymentRequest?.userEmail}</Col>
      </Row>
      <Divider />
      <Table
        columns={columns}
        dataSource={listPaymentResponse}
        pagination={false}
        loading={loadingResponse}
      />
    </Modal>
  );
}

export default Detail;
