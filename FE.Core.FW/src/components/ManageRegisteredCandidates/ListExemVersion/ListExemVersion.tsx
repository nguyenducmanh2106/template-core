import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ExamVersionModel } from '@/apis/models/data';
import { ColumnsType } from 'antd/lib/table';
import { PaginationConfig } from '@/utils/request';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  examVersionOption: ExamVersionModel[];
  onSubmit: (values: ExamVersionModel) => void;
  onCancel: () => void;
}

const ListExemVersion: React.FC<UpdateFormPorps> = (props) => {
  const { examVersionOption, onSubmit } = props;

  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [list, setList] = useState<ExamVersionModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);

    setList((examVersionOption || []) as ExamVersionModel[]);
    setPagination({
      ...pagination,
      current,
      total: examVersionOption.length || 0,
      pageSize: pageSize,
    });

    setLoading(false);
  };
  useEffect(() => {
    getList(1);
  }, []);

  const onFinish = async (model: ExamVersionModel) => {
    try {
      onSubmit(model);
    } catch (error) { }
  };

  const columns: ColumnsType<ExamVersionModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Tên phiên bản',
      dataIndex: 'name',
      render: (_, record) => <span>{record.name}</span>,
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
      showHeader={false}
      size='small'
      columns={columns}
      dataSource={list}
      loading={loading}
      pagination={false}
    />
  );
};

export default ListExemVersion;
