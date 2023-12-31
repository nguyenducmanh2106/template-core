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
    Input,
    MenuProps,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tooltip,
    TreeSelect,
    Typography,
    UploadFile
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { getDepartment, getDepartment2 } from '@/apis/services/DepartmentService';
import { getTarget } from '@/apis/services/TargetService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode, paginationDefault, tabContract, uuidv4 } from '@/utils/constants';
import { ArrowLeftOutlined, DeleteOutlined, DownOutlined, DownloadOutlined, EditOutlined, ImportOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { ActionType, ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useUserState } from '@/store/user';
import { hasPermissionRoles } from '@/utils/router';
import { useGetContractService } from '@/apis/services/ContractService';
import { UseRequestOption } from '@/apis/core/request';
import { ContractModel } from '@/apis/models/ContractModel';
import { debounce } from 'lodash';
import { getCustomer } from '@/apis/services/CustomerService';
import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { ContractFileModel } from '@/apis/models/ContractFileModel';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import FileComponent from '@/components/CustomFile/Index';
function Contract() {
    const navigate = useNavigate();
    // Load
    const { Panel } = Collapse;
    const initState = {
        provinces: [],
        districts: [],
        departmentEdit: {},
        departments: [],
        customers: [
            {
                key: 'Default',
                label: '-Chọn-',
                value: ''
            }
        ],
    };
    // const [typeState, setTypeState] = useState<string | undefined>('');
    // const [departmentIdState, setDepartmentIdState] = useState<string | undefined>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('Danh sách hợp đồng');
    const [showModelImport, setShowModelImport] = useState<boolean>(false);
    const [list, setList] = useState<ContractModel[]>([]);
    const [summaries, setSummaries] = useState<ContractModel>({});
    const [pagination, setPagination] = useState<PaginationConfig>({
        ...paginationDefault
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

    useEffect(() => {
        const fnGetInitState = async () => {
            // const responseProvinces: ResponseData = await getAministrativeDivisions();
            const responseDepartment: ResponseData = await getDepartment2(true);

            // const provinceOptions = ConvertOptionSelectModel(responseProvinces.data as ProvinceModel[]);
            // const departmentOptions = ConvertOptionSelectModel(responseDepartment.data as OptionModel[]);
            const stateDispatcher = {
                departments: responseDepartment.data,
            };
            dispatch(stateDispatcher);
        }
        fnGetInitState()
        searchFormSubmit(1, 20);
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
        navigate(`/icom/contract/create`)
    };


    const options: UseRequestOption = {
        onSuccess(response: ResponseData<ContractModel>) {
            // console.log(newData)

            setList([
                ...response.data as ContractModel[]
            ]);
            setPagination({
                ...pagination,
                current: response.pageNumber as number,
                total: response.totalCount || 0,
                pageSize: response.pageSize as number,
            });

            setLoading(false);
        },
        onError(newData) {
            console.log(newData)
        },
    }
    const response1 = useGetContractService(options)
    // searchForm
    const [searchForm] = Form.useForm();
    const searchFormSubmit = async (current: number = 1, pageSize: number = 20, tab: string = tabContract.All): Promise<void> => {
        try {
            const fieldsValue = await searchForm.validateFields();
            setLoading(true)
            const filter = {
                ...fieldsValue,
                page: current,
                size: pageSize,
                textSearch: fieldsValue.TextSearch,
                tab
            }
            // console.log(filter)

            response1.run(JSON.stringify(filter))


        } catch (error: any) {
            console.log(error);
        }
    };

    const columns: ProColumns<ContractModel>[] = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            align: 'center',
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Loại',
            dataIndex: 'departmentName',
            width: 120,
            render: (_, record) => <span>{record.parentId ? "Phụ lục" : "Hợp đồng"}</span>,
        },
        {
            title: 'Số hiệu hợp đồng',
            dataIndex: 'contractNumber',
            width: 180,
            render: (_, record) => <span>{record.contractNumber ?? "-"}</span>,
        },

        {
            title: 'Phòng ban',
            dataIndex: 'departmentName',
            width: 280,
            render: (_, record) => <span>{record.departmentName}</span>,
        },

        {
            title: 'Tỉnh/TP',
            dataIndex: 'provinceName',
            width: 180,
            render: (_, record) => <span>{record.provinceName}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'provinceName',
            width: 220,
            render: (_, record) => <Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: true,
                    // suffix: '--William Shakespeare',
                    onEllipsis: (ellipsis) => {
                        // console.log('Ellipsis changed:', ellipsis);
                    },
                }}
                title={record.customerName ?? "-"}
            >
                {record.customerName ?? "-"}
            </Paragraph>,
        },
        {
            title: 'File',
            dataIndex: 'fileFormPath',
            width: 300,
            render: (_, record) => {
                const items: MenuProps['items'] = [];
                const { contractFiles } = record;
                contractFiles?.forEach((item: ContractFileModel) => {
                    const fileProp: UploadFile = {
                        fileName: item.fileName as string,
                        name: item.fileName as string,
                        url: item.filePath as string,
                        uid: uuidv4()
                    }
                    const option: ItemType = {
                        label: <FileComponent fileListInit={fileProp} />,
                        key: item.filePath ?? uuidv4(),
                    }
                    items.push(option);
                })


                return (
                    <Space>
                        <Dropdown menu={{
                            items: items,
                            onClick: ({ key }) => {
                                // console.log(key)
                                switch (key) {
                                    case '0':
                                        break;
                                    case '1':
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }} trigger={['click']}>
                            <a title="Click để xem file" onClick={(e) => e.preventDefault()}>
                                <Space>
                                    Xem file đính kèm
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </Space>
                )
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'description',
            width: 300,
            render: (_, record) =>
                <Paragraph
                    ellipsis={{
                        rows: 1,
                        expandable: true,
                        // suffix: '--William Shakespeare',
                        onEllipsis: (ellipsis) => {
                            console.log('Ellipsis changed:', ellipsis);
                        },
                    }}
                    title={record.description ?? "-"}
                >
                    {record.description ?? "-"}
                </Paragraph>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            width: 180,
            render: (_, record) => <span>{record.state ?? "-"}</span>,
        },
        {
            title: 'Người sở hữu',
            dataIndex: 'uploadUser',
            width: 180,
            render: (_, record) => <span>{record.uploadUser}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 80,
            render: (_, record) => {
                return (
                    <Space>
                        <Dropdown menu={{
                            items: items,
                            onClick: ({ key }) => {
                                // console.log(key)
                                switch (key) {
                                    case '0':
                                        break;
                                    case '1':
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
                        </Dropdown>
                    </Space>
                )
            }
        },
    ];

    const items: MenuProps['items'] = [
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

    const itemActions: MenuProps['items'] = [
        {
            label: <Permission noNode navigation={layoutCode.icomContract as string} bitPermission={PermissionAction.Add}>
                <Text onClick={onHandleShowModelCreate}>
                    <PlusOutlined />
                    Thêm mới
                </Text>
            </Permission>,
            key: '0',
        },
        {
            label: <Text onClick={onHandleShowModelCreate}>
                <DownloadOutlined />
                Tải mẫu hợp đồng
            </Text>,
            key: '1',
        },
    ];

    const [columnInit, setColumnInit] = useState<ProColumns<ContractModel>[]>(columns)

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
    const tabList = [
        {
            key: tabContract.All,
            tab: 'Tất cả',
        },
        {
            key: tabContract.Waiting,
            tab: 'Chờ duyệt',
        },
        {
            key: tabContract.Approved,
            tab: 'Đã duyệt',
        },
        // {
        //     key: tabContract.No_Approved,
        //     tab: 'Không duyệt',
        // },

    ];


    const [activeTabKey, setActiveTabKey] = useState<string>(tabContract.All);

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
        searchForm.resetFields();
        searchFormSubmit(1, 20, key);
    };

    const onChangeSearch = () => {
        searchFormSubmit(1, 20, activeTabKey);
    }

    const onChangeDepartments = async () => {
        const fieldsValue = await searchForm.getFieldsValue();
        searchForm.setFieldValue('CustomerId', '')

        searchFormSubmit(1, 20, activeTabKey);

        if (!fieldsValue.DepartmentId) {
            const stateDispatcher = {
                customers: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel],
            };
            dispatch(stateDispatcher);
            return
        }
        const filter = {
            departmentId: fieldsValue.DepartmentId ? fieldsValue.DepartmentId : undefined
        }
        const responseCustomer: ResponseData = await getCustomer(JSON.stringify(filter));

        const customerOptions = ConvertOptionSelectModel(responseCustomer.data as OptionModel[]);
        const stateDispatcher = {
            customers: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(customerOptions),
        };
        dispatch(stateDispatcher);
    }

    return (
        <div className='layout-main-content'>
            <Card
                style={{ width: '100%', padding: '0' }}
                title={
                    <>
                        <Space className="title">
                            <Dropdown menu={{
                                items: itemActions,
                                onClick: ({ key }) => {
                                    // console.log(key)
                                    switch (key) {
                                        case '0':
                                            break;
                                        case '1':
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }} trigger={['hover']}>
                                <Button shape='circle' onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <PlusOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                            <Text strong>{title}</Text>
                        </Space>
                    </>
                }
                extra={<a href="#">More</a>}
                tabList={tabList}
                activeTabKey={activeTabKey}
                onTabChange={onTabChange}
                tabProps={{
                    size: 'middle',
                }}
            >
                {/* {contentList[activeTabKey]} */}
                <ProTable<ContractModel>
                    columns={columnInit}
                    dataSource={list}
                    showHeader
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            searchFormSubmit(page, pageSize, activeTabKey);
                        },
                    }}
                    scroll={{ x: '100vw', y: '460px' }}
                    bordered
                    // summary={() => (
                    //     <Table.Summary fixed>
                    //         <Table.Summary.Row>
                    //             <Table.Summary.Cell index={0} align='center'><Text strong>Tổng</Text></Table.Summary.Cell>
                    //             {/* <Table.Summary.Cell index={1} align='right'><Text strong>{summaries?.total?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={2} align='right'><Text strong>{summaries?.jan?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={3} align='right'><Text strong>{summaries?.feb?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={4} align='right'><Text strong>{summaries?.mar?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={5} align='right'><Text strong>{summaries?.apr?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={6} align='right'><Text strong>{summaries?.may?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={7} align='right'><Text strong>{summaries?.jun?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={8} align='right'><Text strong>{summaries?.july?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={9} align='right'><Text strong>{summaries?.aug?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={10} align='right'><Text strong>{summaries?.sep?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={11} align='right'><Text strong>{summaries?.oct?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={12} align='right'><Text strong>{summaries?.nov?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                    //             <Table.Summary.Cell index={13} align='right'><Text strong>{summaries?.dec?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell> */}
                    //         </Table.Summary.Row>
                    //     </Table.Summary>
                    // )}
                    search={false}
                    debounceTime={10}
                    dateFormatter="string"
                    headerTitle={
                        <Space>
                            <Form
                                // style={{ width: '800px' }}
                                form={searchForm}
                                name='search'
                                initialValues={{
                                }}
                            >
                                <Row gutter={16} justify='start' wrap>
                                    <Col span={8}>
                                        <Form.Item
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 24 }}
                                            name='TextSearch'
                                        // rules={[{ required: true }]}
                                        >
                                            <Input
                                                allowClear
                                                onChange={debounce(() => {
                                                    onChangeSearch()
                                                }, 800)}
                                                placeholder='Nhập số hiệu, ghi chú' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 24 }}
                                            name='DepartmentId'
                                        >
                                            <TreeSelect
                                                showSearch
                                                treeLine
                                                style={{ width: '100%' }}
                                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                placeholder="-Chọn phòng ban-"
                                                allowClear
                                                treeDefaultExpandAll
                                                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                treeData={state.departments}
                                                onChange={debounce(() => {
                                                    onChangeDepartments()
                                                }, 800)}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={8}>
                                        <Form.Item
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 24 }}
                                            name='CustomerId'
                                        >
                                            <Select
                                                style={{ width: '100%' }}
                                                showSearch
                                                allowClear
                                                optionFilterProp="children"
                                                filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                                // filterSort={(optionA, optionB) =>
                                                //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                                // }
                                                onChange={debounce(() => {
                                                    onChangeSearch()
                                                }, 800)}
                                                placeholder='-Chọn khách hàng-' options={state.customers} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Space>
                    }
                    toolBarRender={() => [
                        // <Space>
                        //     <Form
                        //         form={searchForm}
                        //         name='search'
                        //         initialValues={{
                        //         }}
                        //     >
                        //         <Row gutter={16} justify='start'>
                        //             <Col span={24}>
                        //                 <Form.Item
                        //                     style={{ marginBottom: 0 }}
                        //                     labelCol={{ span: 0 }}
                        //                     wrapperCol={{ span: 24 }}
                        //                     name='textSearch'
                        //                 // rules={[{ required: true }]}
                        //                 >
                        //                     <Input placeholder='Nhập số hiệu, ghi chú' />
                        //                 </Form.Item>
                        //             </Col>
                        //         </Row>
                        //     </Form>
                        // </Space>
                    ]}
                />
            </Card>
        </div>
    );
}

export default Contract;
