import { Code } from '@/apis';
import { PaginationConfig, ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    DatePicker,
    Dropdown,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Typography,
    message
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useReducer, useRef, useState } from 'react';

import { deleteDivision, deleteManyDivision } from '@/apis/services/toefl-challenge/DivisionService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { DeleteOutlined, DownOutlined, EditOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { OptionModel } from '@/@types/data';
import { TargetModel } from '@/apis/models/TargetModel';
import { getTarget } from '@/apis/services/TargetService';
import dayjs from 'dayjs';
import ImportTarget from './import';
function Target() {
    const navigate = useNavigate();
    // Load
    const { Panel } = Collapse;
    const initState = {
        provinces: [],
        districts: [],
        departmentEdit: {},
        departments: [],
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [showModelImport, setShowModelImport] = useState<boolean>(false);
    const [list, setList] = useState<TargetModel[]>([]);
    const [pagination, setPagination] = useState<PaginationConfig>({
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
    });
    const [selectedRowDeleteKeys, setSelectedRowDeleteKeys] = useState<string[]>([]);
    const { Title, Paragraph, Text, Link } = Typography;
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );

    const getList = async (current: number, pageSize: number = 20): Promise<void> => {
        setLoading(true);
        searchFormSubmit(current, pageSize);
        setLoading(false);
    };
    useEffect(() => {
        const fnGetInitState = async () => {
            // const responseProvinces: ResponseData = await getAministrativeDivisions();
            // const responseDepartment: ResponseData = await getDepartment();

            // const provinceOptions = ConvertOptionSelectModel(responseProvinces.data as ProvinceModel[]);
            // const departmentOptions = ConvertOptionSelectModel(responseDepartment.data as OptionModel[]);
            // const stateDispatcher = {
            //     provinces: [{
            //         key: 'Default',
            //         label: '-Chọn-',
            //         value: '',
            //     }].concat(provinceOptions),
            //     departments: [{
            //         key: 'Default',
            //         label: '-Chọn-',
            //         value: '',
            //     }].concat(departmentOptions)
            // };
            // dispatch(stateDispatcher);
        }
        fnGetInitState()
        getList(1);
    }, []);

    const deleteRecord = (id: string) => {
        // Modal.confirm({
        //     title: 'Cảnh báo',
        //     content: `Xác nhận xóa bản ghi này?`,
        //     okText: 'Đồng ý',
        //     cancelText: 'Hủy',
        //     onOk: async () => {
        //         const response = await deletePricingCategory(id);
        //         if (response.code === Code._200) {
        //             message.success(response.message)
        //             getList(1);
        //         }
        //         else {
        //             message.error(response.message)
        //         }
        //     },
        // });
    };


    const onHandleShowModelCreate = async () => {
        navigate(`/catalog/pricing-category/create`)
    };

    // searchForm
    const [searchForm] = Form.useForm();
    const searchFormSubmit = async (current: number = 1, pageSize: number = 20): Promise<void> => {
        try {
            const fieldsValue = await searchForm.validateFields();
            setLoading(true)
            const filter = {
                ...fieldsValue,
                page: current,
                size: pageSize,
                textSearch: fieldsValue.TextSearch,
                TargetYear: fieldsValue.TargetYear ? dayjs(fieldsValue.TargetYear).year() : null,
            }
            const response: ResponseData<TargetModel> = await getTarget(
                JSON.stringify(filter)
            ) as ResponseData<TargetModel>;
            setList([
                ...response.data as TargetModel[]
            ]);
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


    const columns: ProColumns<TargetModel>[] = [
        // {
        //     title: 'STT',
        //     dataIndex: 'index',
        //     width: 80,
        //     render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        // },
        {
            title: 'Loại',
            dataIndex: 'typeName',
            width: 120,
            render: (_, record) => <span>{record.type === 0 ? "Phòng ban" : record.type === 1 ? "Cá nhân" : ""}</span>,
        },
        {
            title: 'Cá nhân/phòng ban',
            dataIndex: 'departmentName',
            width: 260,
            render: (_, record) => <span>{record.departmentName}</span>,
        },
        {
            title: 'Cả năm',
            dataIndex: 'total',
            width: 180,
            render: (_, record) => <span>{record.total?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 1',
            dataIndex: 'jan',
            width: 180,
            render: (_, record) => <span>{record.jan?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 2',
            dataIndex: 'feb',
            width: 180,
            render: (_, record) => <span>{record.feb?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 3',
            dataIndex: 'mar',
            width: 180,
            render: (_, record) => <span>{record.mar?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 4',
            dataIndex: 'apr',
            width: 180,
            render: (_, record) => <span>{record.apr?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 5',
            dataIndex: 'may',
            width: 180,
            render: (_, record) => <span>{record.may?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 6',
            dataIndex: 'jun',
            width: 180,
            render: (_, record) => <span>{record.jun?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 7',
            dataIndex: 'july',
            width: 180,
            render: (_, record) => <span>{record.july?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 8',
            dataIndex: 'aug',
            width: 180,
            render: (_, record) => <span>{record.aug?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 9',
            dataIndex: 'sep',
            width: 180,
            render: (_, record) => <span>{record.sep?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 10',
            dataIndex: 'oct',
            width: 180,
            render: (_, record) => <span>{record.oct?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 11',
            dataIndex: 'nov',
            width: 180,
            render: (_, record) => <span>{record.nov?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 12',
            dataIndex: 'dec',
            width: 180,
            render: (_, record) => <span>{record.dec?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Permission noNode navigation={layoutCode.catalogPricingCategory as string} bitPermission={PermissionAction.Edit}>
                        <Button type="dashed" title='Cập nhật' loading={false} onClick={() => navigate(`/catalog/pricing-category/edit/${record.id}`)}>
                            <EditOutlined />
                        </Button>
                    </Permission>
                    <Permission noNode navigation={layoutCode.catalogPricingCategory as string} bitPermission={PermissionAction.Delete}>
                        <Button danger title='Xóa' loading={false} onClick={() => deleteRecord(record.id || '')}>
                            <DeleteOutlined />
                        </Button>
                    </Permission>
                </Space>
            ),
        },
    ];

    const onHandleChangeFilterTargetYear = async (value: any | null, dateString: string) => {
        await searchFormSubmit(1, 20)
    }
    console.log(list)
    const actionRef = useRef<ActionType>();
    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        Mục tiêu
                    </>
                }
                extra={<div></div>}
            >
                <ProTable<TargetModel>
                    dataSource={list}
                    // rowKey="id"
                    loading={loading}
                    // pagination={{
                    //     ...pagination,
                    //     onChange: (page: number, pageSize: number) => {
                    //         getList(page, pageSize);
                    //     },
                    // }}
                    pagination={false}
                    scroll={{ x: '100vw', y: '460px' }}
                    columns={columns}
                    search={false}
                    dateFormatter="string"
                    headerTitle={
                        <Space>
                            <Permission noNode navigation={layoutCode.icomTarget as string} bitPermission={PermissionAction.Import}>
                                <Button htmlType='button' type='default' onClick={() => setShowModelImport(true)}>
                                    <PlusOutlined />
                                    Import
                                </Button>
                            </Permission>
                            <Permission noNode navigation={layoutCode.icomTarget as string} bitPermission={PermissionAction.Add}>
                                <Button htmlType='button' type='default' onClick={() => onHandleShowModelCreate()}>
                                    <PlusOutlined />
                                    Thao tác
                                </Button>
                            </Permission>
                        </Space>
                    }
                    toolBarRender={() => [
                        <Form
                            form={searchForm}
                            name='search'
                            initialValues={{
                                ['TargetYear']: dayjs(new Date()),
                            }}
                        >
                            <Row gutter={16} justify='start'>
                                <Col span={24}>
                                    <Form.Item
                                        label={' '}
                                        labelCol={{ span: 24 }}
                                        wrapperCol={{ span: 24 }}
                                        name='TargetYear'
                                    >
                                        <DatePicker picker='year' placeholder='Chọn năm' format={['YYYY']} onChange={onHandleChangeFilterTargetYear} />
                                    </Form.Item>
                                </Col>
                                {/* <Col span={24}>
                                    <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                                        Tìm kiếm
                                    </Button>
                                    <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => searchForm.resetFields()}>
                                        Làm lại
                                    </Button>
                                </Col> */}
                            </Row>
                        </Form>
                    ]}
                />
            </Card>
            {showModelImport && (
                <ImportTarget
                    open={showModelImport}
                    setOpen={setShowModelImport}
                    reload={searchFormSubmit}
                />
            )}
        </div>
    );
}

export default Target;
