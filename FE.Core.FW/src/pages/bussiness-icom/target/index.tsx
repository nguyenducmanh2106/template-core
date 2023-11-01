import { Code } from '@/apis';
import { PaginationConfig, ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Dropdown,
    Form,
    MenuProps,
    Row,
    Space,
    Table,
    Tooltip,
    Typography
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { TargetModel } from '@/apis/models/TargetModel';
import { getDepartment2 } from '@/apis/services/DepartmentService';
import { getTarget } from '@/apis/services/TargetService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ImportOutlined, SettingOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ImportTarget from './import';
import { useRecoilValue } from 'recoil';
import { useUserState } from '@/store/user';
import { hasPermissionRoles } from '@/utils/router';
function Target() {
    const navigate = useNavigate();
    const params = useParams()
    const { pathname } = useLocation();
    const { type, departmentId, isEdit } = params
    console.log(params)
    // Load
    const { Panel } = Collapse;
    const initState = {
        provinces: [],
        districts: [],
        departmentEdit: {},
        departments: [],
    };
    // const [typeState, setTypeState] = useState<string | undefined>('');
    // const [departmentIdState, setDepartmentIdState] = useState<string | undefined>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('Mục tiêu');
    const [showModelImport, setShowModelImport] = useState<boolean>(false);
    const [list, setList] = useState<TargetModel[]>([]);
    const [summaries, setSummaries] = useState<TargetModel>({});
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

    const user = useRecoilValue(useUserState);
    const permissions = user.permissions
    const getList = async (current: number, pageSize: number = 20): Promise<void> => {
        setLoading(true);
        searchFormSubmit(current, pageSize);
        setLoading(false);
    };
    useEffect(() => {
        // setTypeState(type)
        if (isEdit && isEdit == 'true') {
            setColumnInit(columnEdits)
            setTitle('Cập nhật mục tiêu')
        }
        else {
            setColumnInit(columns)
            setTitle('Mục tiêu')
        }
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
    }, [type, departmentId, isEdit]);

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
                type: type,
                departmentId: departmentId === '00000000-0000-0000-0000-000000000000' ? null : departmentId
            }
            const response: ResponseData<TargetModel> = await getTarget(
                JSON.stringify(filter)
            ) as ResponseData<TargetModel>;
            setList([
                ...response.data as TargetModel[]
            ]);
            setSummaries({ ...response.summary as TargetModel })
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
    const navigateLink = (type: number | string | undefined, departmentId: string | undefined, isEdit?: boolean | undefined) => {
        // navigate(`${pathname}/${type}/${departmentId}`)
        // if (type && departmentId) {
        //     navigate(`/icom/target/${type ?? 0}/${departmentId}/${isEdit ?? false}`)
        // }
        navigate(`/icom/target/${type ?? 0}/${departmentId ?? "00000000-0000-0000-0000-000000000000"}/${isEdit ?? false}`)
    }


    const columns: ProColumns<TargetModel>[] = [
        {
            title: 'Cá nhân/phòng ban',
            dataIndex: 'departmentName',
            fixed: 'left',
            width: 280,
            render: (_, record) => <span>
                {record.type == 0 ?
                    <Link onClick={() => navigateLink(1, record.departmentId as string)}>
                        {record.departmentName}
                    </Link>
                    : record.type == 1 ?
                        <Text>
                            {record.fullname}
                        </Text>
                        :
                        <Text strong>
                            {record.fullname}
                        </Text>
                }

            </span>,
        },
        {
            title: 'Cả năm',
            dataIndex: 'total',
            width: 180,
            align: 'right',
            render: (_, record) => <span>{record.total?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 1',
            dataIndex: 'jan',
            width: 180,
            align: 'right',
            render: (_, record) => <span>{record.jan?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 2',
            dataIndex: 'feb',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.feb?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 3',
            dataIndex: 'mar',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.mar?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 4',
            dataIndex: 'apr',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.apr?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 5',
            dataIndex: 'may',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.may?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 6',
            dataIndex: 'jun',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.jun?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 7',
            dataIndex: 'july',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.july?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 8',
            dataIndex: 'aug',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.aug?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 9',
            dataIndex: 'sep',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.sep?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 10',
            dataIndex: 'oct',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.oct?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 11',
            dataIndex: 'nov',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.nov?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 12',
            dataIndex: 'dec',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.dec?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        // {
        //     title: 'Thao tác',
        //     key: 'action',
        //     align: 'center',
        //     fixed: 'right',
        //     width: 120,
        //     render: (_, record) => (
        //         <Space>
        //             <Permission noNode navigation={layoutCode.catalogPricingCategory as string} bitPermission={PermissionAction.Edit}>
        //                 <Button type="dashed" title='Cập nhật' loading={false} onClick={() => navigate(`/catalog/pricing-category/edit/${record.id}`)}>
        //                     <EditOutlined />
        //                 </Button>
        //             </Permission>
        //             <Permission noNode navigation={layoutCode.catalogPricingCategory as string} bitPermission={PermissionAction.Delete}>
        //                 <Button danger title='Xóa' loading={false} onClick={() => deleteRecord(record.id || '')}>
        //                     <DeleteOutlined />
        //                 </Button>
        //             </Permission>
        //         </Space>
        //     ),
        // },
    ];

    const columnEdits: ProColumns<TargetModel>[] = [
        {
            title: 'Cá nhân/phòng ban',
            dataIndex: 'departmentName',
            fixed: 'left',
            width: 280,
            render: (_, record) => <span>
                {record.type == 0 ?
                    <Link onClick={() => navigateLink(1, record.departmentId as string)}>
                        {record.departmentName}
                    </Link>
                    : record.type == 1 ?
                        <Text>
                            {record.fullname}
                        </Text>
                        :
                        <Text strong>
                            {record.fullname}
                        </Text>
                }

            </span>,
        },
        {
            title: 'Cả năm',
            dataIndex: 'total',
            width: 180,
            align: 'right',
            render: (_, record) => <span>{record.total?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 1',
            dataIndex: 'jan',
            width: 180,
            align: 'right',
            render: (_, record) => <span>{record.jan?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 2',
            dataIndex: 'feb',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.feb?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 3',
            dataIndex: 'mar',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.mar?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 4',
            dataIndex: 'apr',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.apr?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 5',
            dataIndex: 'may',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.may?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 6',
            dataIndex: 'jun',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.jun?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 7',
            dataIndex: 'july',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.july?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 8',
            dataIndex: 'aug',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.aug?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 9',
            dataIndex: 'sep',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.sep?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 10',
            dataIndex: 'oct',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.oct?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 11',
            dataIndex: 'nov',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.nov?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Tháng 12',
            dataIndex: 'dec',
            align: 'right',
            width: 180,
            render: (_, record) => <span>{record.dec?.toLocaleString('vi-VN') ?? "-"}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 80,
            render: (_, record) => {
                const permissionEdit = hasPermissionRoles(permissions, layoutCode.icomTarget as string, PermissionAction.Edit)
                const permissionImportDepartment = hasPermissionRoles(permissions, layoutCode.icomTarget as string, PermissionAction.ImportDepartment)
                const permissionFull = permissionImportDepartment && type == '0' ? true : !permissionImportDepartment && type == '1' ? true : false
                return (
                    <Space>
                        {record.type != -1 ?
                            <Dropdown menu={{
                                items: !permissionEdit ? itemActionMins : permissionFull ? itemActionFulls : itemActionMins,
                                onClick: ({ key }) => {
                                    // console.log(key)
                                    switch (key) {
                                        case '0':
                                            if (type == '0')
                                                navigate(`/icom/target/detail/${record.id}?type=${type}&departmentId=${record.departmentId}&year=${record.year}`);
                                            else if (type == '1')
                                                navigate(`/icom/target/detail/${record.id}?type=${type}&departmentId=${record.departmentId}&year=${record.year}&userName=${record.username}`);
                                            break;
                                        case '1':
                                            if (type == '0')
                                                navigate(`/icom/target/edit/${record.id}?type=${type}&departmentId=${record.departmentId}&year=${record.year}`);
                                            else if (type == '1')
                                                navigate(`/icom/target/edit/${record.id}?type=${type}&departmentId=${record.departmentId}&year=${record.year}&userName=${record.username}`);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }} trigger={['click']}>
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <SettingOutlined />
                                    </Space>
                                </a>
                            </Dropdown> : <></>
                        }
                    </Space>
                )
            }
        },
    ];

    const itemActionFulls: MenuProps['items'] = [
        {
            label: <Link>
                Chi tiết
            </Link>,
            key: '0',
        },
        {
            label: <Link>
                Cập nhật
            </Link>,
            key: '1',
        },
    ];
    const itemActionMins: MenuProps['items'] = [
        {
            label: <Link>
                Chi tiết
            </Link>,
            key: '0',
        },
    ];
    const [columnInit, setColumnInit] = useState<ProColumns<TargetModel>[]>(columns)


    const onHandleChangeFilterTargetYear = async (value: any | null, dateString: string) => {
        await searchFormSubmit(1, 20)
    }
    const request = async () => {
        // await wait(3000);
        console.log('load')
        if (loading) {

        }
        // actionRef?.current?.reload()
        return {
            data: 0,
            total: 0,
            success: true,
        };
    };

    const onHandeShowModelImport = async () => {
        setShowModelImport(false)
        const responseIIGDepartment: ResponseData = await getDepartment2(true);
        if (responseIIGDepartment.code === Code._200) {
            const stateDispatcher = {
                iigdepartments: responseIIGDepartment.data ?? []
            };
            dispatch(stateDispatcher);
            setShowModelImport(true);
        }
    }
    const actionRef = useRef<ActionType>();
    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate(-1)}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>{title}</Text>
                        </Space>
                    </>
                }
                extra={<div></div>}
            >
                <ProTable<TargetModel>
                    columns={columnInit}
                    dataSource={list}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: '100vw', y: '400px' }}
                    bordered
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} align='center'><Text strong>Tổng</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align='right'><Text strong>{summaries?.total?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align='right'><Text strong>{summaries?.jan?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align='right'><Text strong>{summaries?.feb?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align='right'><Text strong>{summaries?.mar?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align='right'><Text strong>{summaries?.apr?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={6} align='right'><Text strong>{summaries?.may?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={7} align='right'><Text strong>{summaries?.jun?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={8} align='right'><Text strong>{summaries?.july?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={9} align='right'><Text strong>{summaries?.aug?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={10} align='right'><Text strong>{summaries?.sep?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={11} align='right'><Text strong>{summaries?.oct?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={12} align='right'><Text strong>{summaries?.nov?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                <Table.Summary.Cell index={13} align='right'><Text strong>{summaries?.dec?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                    search={false}
                    dateFormatter="string"
                    headerTitle={
                        <Text>{type == '1' ? list[0]?.departmentName : "Mục tiêu"}</Text>
                    }
                    toolBarRender={() => [
                        <Space>
                            <Permission noNode navigation={layoutCode.icomTarget as string} bitPermission={PermissionAction.Import}>
                                <Button htmlType='button' type='default' onClick={onHandeShowModelImport}>
                                    <ImportOutlined />
                                    Import
                                </Button>
                            </Permission>
                            <Permission noNode navigation={layoutCode.icomTarget as string} bitPermission={PermissionAction.Add}>
                                <Button htmlType='button' type='default' onClick={() => navigateLink(type, departmentId, true)}>
                                    <SettingOutlined />
                                    Thao tác
                                </Button>
                            </Permission>
                        </Space>,
                        <Space>
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
                                            style={{ marginBottom: 0 }}
                                            label={' '}
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 24 }}
                                            name='TargetYear'
                                            rules={[{ required: true }]}
                                        >
                                            <DatePicker allowClear={false} picker='year' placeholder='Chọn năm' format={['YYYY']} onChange={onHandleChangeFilterTargetYear} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Space>
                    ]}
                />
            </Card>
            {showModelImport && (
                <ImportTarget
                    open={showModelImport}
                    setOpen={setShowModelImport}
                    reload={searchFormSubmit}
                    iigdepartments={state.iigdepartments}
                />
            )}
        </div>
    );
}

export default Target;
