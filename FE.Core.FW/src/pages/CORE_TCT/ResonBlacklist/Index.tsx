import { Code, ResonBlacklistModel } from '@/apis';
import { ExamPeriodResponse } from '@/apis/models/data';
import { deleteResonBlacklist, getResonBlacklist, postResonBlacklist, putResonBlacklist } from '@/apis/services/ResonBlacklistService';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { PaginationConfig, ResponseData } from '@/utils/request';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, FormInstance, Input, message, Modal, Row, Select, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useState } from 'react';
import CreateForm from './CreateForm';
import UpdateForm from './UpdateForm';

function App() {
    const [searchForm] = Form.useForm();
    const [list, setList] = useState<ResonBlacklistModel[]>([]);
    const [loadingDataState, setLoadingDataState] = useState<boolean>(false);
    const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
    const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
    const [searchParams, setSearchParams] = useState<Partial<ExamPeriodResponse>>({});
    const [pagination, setPagination] = useState<PaginationConfig>({
        total: 0,
        current: 1,
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: false,
    });
    const [updateModel, setUpdateModel] = useState<Partial<ResonBlacklistModel>>({});
    const [updateId, setUpdateId] = useState<string>('');
    const getData = async (page: number): Promise<void> => {
        setLoadingDataState(true);
        const response: ResponseData = await getResonBlacklist();
        setList((response.data || []) as ResonBlacklistModel[]);
        setPagination({ ...pagination, current: page, total: response.totalCount || 0 });
        setLoadingDataState(false);
    };

    useEffect(() => { getData(1); }, [searchParams]);


    const closeForm = async (): Promise<void> => {
        setUpdateModel({})
        setOpenUpdateForm(false);
    };

    const viewUpdateForm = async (id: string): Promise<void> => {
        const data = list.find(p => p.id == id) as ResonBlacklistModel;
        setUpdateModel({ ...data })
        setOpenUpdateForm(true);
    };

    const submitCreateForm = async (model: Omit<ResonBlacklistModel, 'id'>): Promise<void> => {
        let responseData = await postResonBlacklist(undefined, model);
        if (responseData.code != 200) {
            message.error(responseData.message);
            return;
        }
        message.success('Lưu thông tin thành công');
        closeCreateForm();
        setSearchParams({});
        searchForm.resetFields();
    };

    const submitUpdateForm = async (model: ResonBlacklistModel): Promise<void> => {
        let responseData = await putResonBlacklist(undefined, model);
        if (responseData.code != 200) {
            message.error(responseData.message);
            return;
        }
        message.success('Cập nhật thông tin thành công');
        setOpenUpdateForm(false);
        getData(pagination.current);
    };

    const closeCreateForm = () => setOpenCreateForm(false);

    const columns: ColumnsType<ResonBlacklistModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            ellipsis: true,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>
        },
        {
            title: 'Tên lý do',
            dataIndex: ['name'],
        },
        {
            title: 'Ghi chú',
            dataIndex: ['note'],
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdOnDate',
            render: (_, record) => <>{record.createdOnDate}</>
        },
        {
            title: 'Trạng thái',
            dataIndex: ['status'],
            render: (_, record) => {
                if (record.status)
                    return <Tag color='blue'>Đang mở</Tag>;
                else
                    return <Tag color='red'>Đã kết thúc</Tag>;
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            render: (_, record) =>
                <Space>
                    <Permission navigation={layoutCode.examPeriod} bitPermission={PermissionAction.Edit} noNode={<></>}>
                        <Button type='link' onClick={() => viewUpdateForm(record.id as string)}>Sửa</Button>
                    </Permission>
                    <Permission navigation={layoutCode.examPeriod} bitPermission={PermissionAction.Delete} noNode={<></>}>
                        <Button type='link' onClick={async () => {
                            Modal.confirm({
                                title: 'Bạn có chắc chắn muốn xóa thông tin này?',
                                okText: 'Xác nhận',
                                cancelText: 'Hủy bỏ',
                                onOk: async () => {
                                    setLoadingDataState(true);
                                    try {
                                        let responseData: ResponseData = await deleteResonBlacklist(record.id as string);
                                        if (responseData.code != Code._200)
                                            message.error(responseData.message);
                                        else {
                                            getData(pagination.current);
                                            message.success('Xóa thông tin thành công');
                                        }
                                    }
                                    catch (error) {
                                        console.log(error);
                                    }
                                    setLoadingDataState(false);
                                    getData(pagination.current);
                                }
                            })
                        }}>Xóa</Button>
                    </Permission>
                </Space>
        }
    ];

    return (
        <>
            <div className='layout-main-conent'>
                <Row style={{ marginBottom: '10px' }}>
                    <Permission navigation={layoutCode.examPeriod} bitPermission={PermissionAction.Add} noNode={<></>}>
                        <Button type="primary" onClick={event => { setOpenCreateForm(true); }}>Thêm mới</Button>
                    </Permission>
                </Row>
                <Table
                    rowKey='id'
                    columns={columns}
                    dataSource={list}
                    loading={loadingDataState}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            setPagination({
                                ...pagination,
                                current: page,
                                pageSize: pageSize
                            });
                        },
                        showTotal: (total: number) => `Total ${total} items`
                    }}
                />
            </div>
            <CreateForm
                onSubmit={submitCreateForm}
                visible={openCreateForm}
                onCancel={() => setOpenCreateForm(false)}
                onSubmitLoading={loadingDataState}
            />

            <UpdateForm
                onSubmit={submitUpdateForm}
                visible={openUpdateForm}
                values={updateModel}
                onCancel={() => closeForm()}
                onSubmitLoading={loadingDataState}
            />
        </>

    );
}

export default App;
