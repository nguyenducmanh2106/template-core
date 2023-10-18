import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Card, Table, Row, Col } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { PaginationConfig } from '@/utils/request';
import { ColumnsType } from 'antd/lib/table';
import { getExamVersionByExamId } from '@/apis/services/PageService';
import { ResponseData } from '@/apis/models/ResponseData';
import { BlacklistModel } from '@/apis';

dayjs.extend(customParseFormat);
interface DataInput {
  list: BlacklistModel[];
}
const Blacklist: React.FC<DataInput> = (props) => {
  const { list } = props;

  const [data, setData] = useState<BlacklistModel>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (item: BlacklistModel) => {
    setData(item);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns: ColumnsType<BlacklistModel> = [
    {
      title: 'Họ đệm',
      dataIndex: 'firstName',
      render: (_, record) => <span>{record.fullName}</span>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      render: (_, record) => <span>{dayjs(record.dateOfBirth).format('YYYY-MM-DD')}</span>,
    },
    {
      title: 'Ngày vi phạm',
      dataIndex: 'arrestationDate',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'deadlineTo',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type='link' onClick={() => showModal(record)}>
            Chi tiết
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className='layout-main-conent'>
      <Modal
        width={'50%'}
        title='Thông tin blacklist'
        open={isModalOpen}
        onOk={handleOk}
        footer
        centered
        onCancel={handleCancel}
      >
        <Row gutter={24}>
          <Col span={4} className='textRight'>
            Họ đệm:
            <br />
            Ngày sinh:
            <br />
            Hộ chiếu:
            <br />
            Ngày vi phạm:
            <br />
            Deadline:
            <br />
          </Col>
          <Col span={4} style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <br />
            {dayjs(data?.dateOfBirth).format('DD-MM-YYYY')}
            <br />
            <br />
            <br />
            <br />
          </Col>
          <Col span={4} className='textRight'>
            Tên:
            <br />
            CCCD:
            <br />
            Giấy tờ khác:
            <br />
            Loại bài thi bị cấm:
            <br />
            Trạng thái:
          </Col>
          <Col span={4} style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <br />
            <br />
            <br />
            <br />
          </Col>
          <Col span={4} className='textRight'>
            Giới tính:
            <br />
            CMND:
            <br />
            Đối tượng:
            <br />
            Khoảng thời gian hạn chế:
          </Col>
          <Col span={4} style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <br />
            {data?.target}
            <br />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={4} className='textRight'>
            Lý do:
            <br />
            Lý do chi tiết:
            <br />
          </Col>
          <Col span={20} style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <br />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={4} style={{ alignSelf: 'center', textAlign: 'right' }}>
            File đính kèm:
          </Col>
          <Col span={20}>
          </Col>
        </Row>
      </Modal>
      <Card bordered={false}>
        <Table rowKey='id' size='small' columns={columns} dataSource={list} loading={loading} pagination={false} />
      </Card>
    </div>
  );
};

export default Blacklist;
