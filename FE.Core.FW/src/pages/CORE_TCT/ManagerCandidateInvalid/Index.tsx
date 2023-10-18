import { useEffect, useState } from 'react';
import { Button, Card, Divider, Form, FormInstance, message, Modal, Space, Table, Upload, UploadFile } from 'antd';
import { ResponseData, PaginationConfig } from '@/utils/request';
import { ManagerCandidateInvalidTopikModel } from '@/apis/models/ManagerCandidateInvalidTopikModel';
import { ColumnsType } from 'antd/lib/table';
import { Code } from '@/apis';
import { SearchParam } from '@/apis/models/data';
import { deleteManagerCandidateInvalidTopik, getManagerCandidateInvalidTopik, Import, postManagerCandidateInvalidTopik } from '@/apis/services/ManagerCandidateInvalidTopikService';
import CreateForm from '@/components/User/CreateForm/CreateForm';
import { UploadOutlined } from '@ant-design/icons';
import FormItem from 'antd/es/form/FormItem';
import form from 'antd/lib/form';
import { RcFile } from 'antd/lib/upload';

var testScore: ManagerCandidateInvalidTopikModel[] = [];

function App() {
    // Load
    const [loading, setLoading] = useState<boolean>(false);
    const [list, setList] = useState<ManagerCandidateInvalidTopikModel[]>([]);
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
        const response: ResponseData = await getManagerCandidateInvalidTopik();
        testScore = (response.data || []) as ManagerCandidateInvalidTopikModel[];
        setList((response.data || []) as ManagerCandidateInvalidTopikModel[]);
        setPagination({
            ...pagination,
            total: response.totalCount || 0,
        });

        setLoading(false);
    };

    useEffect(() => {
        getList(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize, searchParams]);

    const [deleteLoading, setDeleteLoading] = useState<string[]>([]);
    const deleteTableData = (id: string) => {
        Modal.confirm({
            title: 'Cảnh báo',
            content: 'Bạn có chắc chắn muốn xóa ?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            onOk: async () => {
                setDeleteLoading([id]);
                const res = await deleteManagerCandidateInvalidTopik(id);
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
    const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
    const [updateData, setUpdateData] = useState<Partial<ManagerCandidateInvalidTopikModel>>({});
    const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
    const detailUpdateData = async (id: string) => {
        setDetailUpdateLoading([id]);
        const data = testScore.find((item: ManagerCandidateInvalidTopikModel) => item.id == id);
        setUpdateData({
            ...data,
        });
        setUpdateFormVisible(true);
        setDetailUpdateLoading([]);
    };

    // Save
    const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
    const [createFormVisible, setCreateFormVisible] = useState<boolean>(false);
    const createSubmit = async (values: Omit<ManagerCandidateInvalidTopikModel, 'id'>, form: FormInstance) => {
        setCreateSubmitLoading(true);
        const res = await postManagerCandidateInvalidTopik(undefined, values);
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

    // searchForm
    const [onSubmitLoading, setOnSubmitLoading] = useState<boolean>(false);
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

    const [form] = Form.useForm();
    const [file, setFile] = useState<UploadFile>();

    const onFinish = async () => {

        if (!file) {
            message.warning("Chọn file đính kèm trước khi upload");
            return;
        }
        const data = {
            file: file as unknown as Blob
        }

        const res = await Import(undefined, data);
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

    const columns: ColumnsType<ManagerCandidateInvalidTopikModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Số báo danh',
            dataIndex: 'sbd',
            render: (text, record) => {
                const d = new Date(text);
                return <span>{record.sbd}</span>
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <>
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
            >
                <div>
                    <Space>
                        {/* <Button type='primary' onClick={() => setCreateFormVisible(true)}>
                            Thêm mới
                        </Button> */}
                        <Button type='primary' onClick={() => setImportFormVisible(true)}>
                            Import
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
            <Modal
                destroyOnClose
                width={'40%'}
                maskClosable={false}
                title='Import danh sách thí sinh không hợp lệ'
                onCancel={() => setImportFormVisible(false)}
                open={importFormVisible}
                footer={[
                    <Button key='back' onClick={() => setImportFormVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
                        Import
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                >
                    <FormItem
                        label='File đính kèm'
                        name='file'
                        rules={[{ required: true, message: "Chọn file đính kèm trước khi upload" }]}
                    >
                        <Upload
                            accept='.xls, .xlsx'
                            showUploadList={{ showRemoveIcon: true }}
                            onRemove={() => setFile(undefined)}
                            beforeUpload={(file) => {
                                setFile(file);
                                return false;
                            }}
                            defaultFileList={[]}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>

            {/* <CreateForm
                onCancel={() => setCreateFormVisible(false)}
                visible={createFormVisible}
                onSubmit={createSubmit}
                onSubmitLoading={createSubmitLoading}
            /> */}

        </div>
    );
}

export default App;
