import { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Divider, Form, FormInstance, Input, message, Modal, Radio, Row, Select, Space, Table } from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import {TestScoreModel } from '@/apis/models/TestScoreModel';
import CreateForm from '@/components/TestScore/CreateForm/CreateForm';
import UpdateForm from '@/components/TestScore/UpdateForm/UpdateForm';
import ImportForm from '@/components/TestScore/ImportForm/ImportForm';
import CheckTestCodeForm from '@/components/TestScore/CheckTestCodeForm/CheckTestCodeForm';
import { ColumnsType } from 'antd/lib/table';
import {
  getTestScore,
  deleteTestScore,
  deleteManyTestScore,
  putTestScore,
  postTestScore,
  importTestScore,
  importCheckTestScore,
} from '@/apis/services/TestScoreService';
import { Code } from '@/apis';
import './style.less'
import { SearchParam } from '@/apis/models/data';

const searchFormItemLayout = {
  labelCol: { span: 3, offset: 0 },
};

var testScore: TestScoreModel[] = [];
var checkedList: string[] = [];

function App() {
  // Load
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<TestScoreModel[]>([]);
  const [searchParams, setsearchParams] = useState<SearchParam>({
    FirstName: '',
    LastName: '',
    dob: '',
    IdOrPassport: ''
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const getList = async (current: number, pageSize: number = 10): Promise<void> => {
    setLoading(true);
    setPagination({
      ...pagination,
      current,
      pageSize
    });

    const params = {
      PageSize: pagination.pageSize,
      PageNumber: pagination.current,
      FirstName: searchParams.FirstName,
      LastName: searchParams.LastName,
      dob: searchParams.dob,
      IdOrPassport: searchParams.IdOrPassport
    }
    const filter = JSON.stringify(params);
    const response: ResponseData = await getTestScore(filter);
    testScore = (response.data || []) as TestScoreModel[];
    setList((response.data || []) as TestScoreModel[]);
    setPagination({
      ...pagination,
      total: response.totalCount || 0,
    });

    setLoading(false);
  };

  useEffect(() => {
    getList(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize, searchParams]);

  const [search, setSearch]: [string, (search: string) => void] = useState('');

  const handleChange = (e: { target: { value: string } }) => {

  };
  const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
  const deleteTableData = (id: string) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading([id]);
        const res = await deleteTestScore(id);
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

  const deleteSelectTableData = () => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeleteLoading(checkedList);
        await deleteManyTestScore(checkedList);
        message.success('Thành công !');
        getList(pagination.current);
        setDeleteLoading([]);
      },
    });
  };

  // Data
  const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<TestScoreModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (id: string) => {
    setDetailUpdateLoading([id]);
    const data = testScore.find((item: TestScoreModel) => item.id == id);
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

  const updateSubmit = async (values: TestScoreModel) => {
    setUpdateSubmitLoading(true);
    const res = await putTestScore(values);
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
  const createSubmit = async (values: Omit<TestScoreModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    const res = await postTestScore(values);
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

  // ImportFile
  const [importFormVisible, setImportFormVisible] = useState(false);
  const [importSubmitLoading, setimportSubmitLoading] = useState(false);

  const submitImport = async (value: FormData) => {
    setimportSubmitLoading(true);
    console.log('file: ', value.get('file'));
    const res = await importTestScore(value);
    if (res.code == Code._200) {
      setImportFormVisible(false);
      message.success('Thành công !');
      getList(1);
      setimportSubmitLoading(false);
    } else {
      message.error(res.message);
      setimportSubmitLoading(false);
    }
  }

  // Check Test Code
  const [checkTestCodeVisible, setCheckTestCodeVisible] = useState(false);
  const [checkTestCodeSubmitLoading, setCheckTestCodeSubmitLoading] = useState(false);

  const submitCheckTestCode = async (value: FormData) => {
    setCheckTestCodeSubmitLoading(true);
    console.log('file: ', value.get('file'));
    const res = await importCheckTestScore(value);
    if (res.code == Code._200) {
      setCreateFormVisible(false);
      message.success('Thành công !');
      setCheckTestCodeSubmitLoading(false);
    } else {
      message.error(res.message);
      setCheckTestCodeSubmitLoading(false);
    }
  }


  // searchForm
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchForm] = Form.useForm();

  const searchFormSubmit = async (value: any) => {
    try {
      // const fieldsValue = await searchForm.validateFields();
      // console.log('search', fieldsValue);
      console.log(value);
      setsearchParams({
        FirstName: value.firstName,
        LastName: value.lastName,
        dob: value.dob,
        IdOrPassport: value.idOrPassport,
      })

      setPagination({
        ...pagination,
        current: 1
      });

      // message.warning('Tìm kiếm!');
    } catch (error: any) {
      console.log(error);
    }
  };

  const resetForm = async (value: any) => {
    try {
      searchForm.resetFields();
      setsearchParams({
        FirstName: '',
        LastName: '',
        dob: '',
        IdOrPassport: '',
      });
      setPagination({
        ...pagination,
        current: 1
      })

    } catch (error: any) {
      console.log(error);
    }
  };


  // const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  const columns: ColumnsType<TestScoreModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
    },
    {
      title: 'Họ đệm',
      dataIndex: 'firstName',
    },
    {
      title: 'Tên',
      dataIndex: 'lastName',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      render: (text, record) => {
        const d = new Date(text);
        return <span>{d.toLocaleDateString()}</span>
      }
    },
    {
      title: 'Số giấy tờ',
      dataIndex: 'idOrPassport',
    },
    {
      title: 'Điểm nghe',
      dataIndex: 'listening',
    },
    {
      title: 'Điểm đọc',
      dataIndex: 'reading',
    },
    {
      title: 'Tổng điểm',
      dataIndex: 'total',
    },
    {
      title: 'Ngày thi',
      dataIndex: 'testDate',
      render: (text, record) => {
        const d = new Date(text);
        return <span>{d.toLocaleDateString()}</span>
      }
    },
    {
      title: 'Mã đề',
      dataIndex: 'formCode',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type='link'
            loading={detailUpdateLoading.includes(record.id || '')}
            onClick={() => detailUpdateData(record.id || '')}
          >
            Sửa
          </Button>
          <Divider type='vertical' />
          <Button
            type='link'
            loading={deleteLoading.includes(record.id || '')}
            onClick={() => deleteTableData(record.id || '')}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className='layout-main-conent'>
      <Card
        bordered={false}
        // title="Quản lý điểm thi"
        extra={
          <div className='header'>
            <Form form={searchForm} name='search' onFinish={searchFormSubmit}>
              <Row gutter={12} justify='end'>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item name='firstName'>
                    <Input placeholder='Họ đệm' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item name='lastName'>
                    <Input placeholder='Tên' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item name='dob'>
                    <DatePicker placeholder='Ngày sinh' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                  <Form.Item name='idOrPassport'>
                    <Input placeholder='Số giấy tờ' />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={4} lg={6} xl={6}>
                  <Button type='primary' htmlType='submit'>
                    Tìm kiếm
                  </Button>
                  <Button htmlType='button' style={{ marginLeft: 8 }} onClick={resetForm}>
                      Làm lại
                    </Button>
                </Col>
              </Row>
            </Form>
          </div>
        }
      >
        <div>
          <Space>
            <Button type='primary' onClick={() => setCreateFormVisible(true)}>
              Thêm mới
            </Button>
            <Button type='primary' onClick={() => setImportFormVisible(true)}>
              Import
            </Button>
            <Button type='primary' onClick={() => setCheckTestCodeVisible(true)}>
              Check đề
            </Button>
          </Space>
        </div>
        <br></br>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize
              })
              // getList(page, pageSize);
            },
          }}
        />
      </Card>

      <ImportForm
        visible={importFormVisible}
        onSubmitLoading={importSubmitLoading}
        onCancel={() => setImportFormVisible(false)}
        onSubmit={submitImport}
      />

      <CheckTestCodeForm
        visible={checkTestCodeVisible}
        onCancel={() => setCheckTestCodeVisible(false)}
        onSubmit={submitCheckTestCode}
      />

      <CreateForm
        onCancel={() => setCreateFormVisible(false)}
        visible={createFormVisible}
        onSubmit={createSubmit}
        onSubmitLoading={createSubmitLoading}
      />

      {updateFormVisible && Object.keys(updateData).length > 0 ? (
        <UpdateForm
          values={updateData}
          onCancel={() => updataFormCancel()}
          visible={updateFormVisible}
          onSubmit={updateSubmit}
          onSubmitLoading={updateSubmitLoading}
        />
      ) : null}
    </div>
  );
}

export default App;
