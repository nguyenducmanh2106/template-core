import { PaginationConfig, ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Collapse,
    Dropdown,
    FloatButton,
    Form,
    Input,
    List,
    MenuProps,
    Modal,
    Row,
    Space,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { Code } from '@/apis';
import { deleteManyDivision } from '@/apis/services/toefl-challenge/DivisionService';
import Permission from '@/components/Permission';
import { PermissionAction, layoutCode } from '@/utils/constants';
import { CommentOutlined, CustomerServiceOutlined, DeleteOutlined, DownOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
import { deletePricingDecision, getPricingDecision } from '@/apis/services/PricingDecisionService';
function PricingDecision() {
    const navigate = useNavigate();
    // Load
    const { Panel } = Collapse;
    const initState = {
        departments: [],
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [list, setList] = useState<PricingDecisionModel[]>([]);
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
        Modal.confirm({
            title: 'Cảnh báo',
            content: `Xác nhận xóa bản ghi này?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                const response = await deletePricingDecision(id);
                if (response.code === Code._200) {
                    message.success(response.message)
                    getList(1);
                }
                else {
                    message.error(response.message)
                }
            },
        });
    };

    const multiDeleteRecord = () => {
        setLoadingDelete(true)
        Modal.confirm({
            title: 'Cảnh báo',
            content: `Xác nhận xóa những bản ghi đã chọn?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                const response = await deleteManyDivision(selectedRowDeleteKeys);
                setLoadingDelete(false)
                if (response.code === Code._200) {
                    message.success(response.message)
                    setSelectedRowDeleteKeys([])
                    getList(1);
                }
                else {
                    message.error(response.message)
                }
            },
        });
    };

    const onHandleShowModelCreate = async () => {
        navigate(`/catalog/pricing-decision/create`)
    };

    // searchForm
    const [searchForm] = Form.useForm();
    const searchFormSubmit = async (current: number = 1, pageSize: number = 20): Promise<void> => {
        try {
            const fieldsValue = await searchForm.validateFields();
            setLoading(true)
            const filter = {
                page: current,
                size: pageSize,
                textSearch: fieldsValue.TextSearch,
            }
            const response: ResponseData = await getPricingDecision(
                JSON.stringify(filter)
            );
            setList((response.data || []) as PricingDecisionModel[]);
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

    const data = [
        {
            title: 'Ant Design Title 1',
        },
        {
            title: 'Ant Design Title 2',
        },
        {
            title: 'Ant Design Title 3',
        },
        {
            title: 'Ant Design Title 4',
        },
    ];

    const items: MenuProps['items'] = [
        {
            label: (
                <List
                    size="small"
                    // itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item>
                                <Typography.Text mark>{item.title}</Typography.Text>
                            </List.Item>
                        </List.Item>
                    )}
                />
            ),
            key: '1',
        },
        // {
        //   label: 'Clicking me will not close the menu also.',
        //   key: '2',
        // },
    ];
    const columns: ProColumns<PricingDecisionModel>[] = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            render: (_, record, index) => <>{(pagination.current - 1) * pagination.pageSize + index + 1}</>,
        },
        {
            title: 'Số quyết định',
            dataIndex: 'code',
            width: 180,
            render: (_, record) => <span>{record.decisionNo}</span>,
        },
        {
            title: 'Tên quyết định',
            dataIndex: 'name',
            width: 220,
            render: (_, record) => <span>{record.name}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (_, record) => <span>{record.status ? <Text type="success">Hiệu lực</Text> : <Text type="danger">Hết hiệu lực</Text>}</span>,
        },
        {
            title: 'File',
            dataIndex: 'file',
            width: '280px',
            render: (_, record) => (
                <>
                    <Dropdown
                        menu={{
                            items,
                            // onClick: handleMenuClick,
                        }}
                    // onOpenChange={handleOpenChange}
                    // open={open}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                Xem file
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                    {/* <List
                        size="small"
                        // itemLayout="horizontal"
                        dataSource={data}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item>
                                    <Typography.Text mark>{item.title}</Typography.Text>
                                </List.Item>
                            </List.Item>
                        )}
                    /> */}
                </>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (_, record) => <span>{record.description}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Permission noNode navigation={layoutCode.catalogPricingDecision as string} bitPermission={PermissionAction.Edit}>
                        <Button type="dashed" title='Cập nhật' loading={false} onClick={() => navigate(`/catalog/pricing-decision/edit/${record.id}`)}>
                            <EditOutlined />
                        </Button>
                    </Permission>
                    <Permission noNode navigation={layoutCode.catalogPricingDecision as string} bitPermission={PermissionAction.Delete}>
                        <Button danger title='Xóa' loading={false} onClick={() => deleteRecord(record.id || '')}>
                            <DeleteOutlined />
                        </Button>
                    </Permission>
                </Space>
            ),
        },
    ];

    const actionRef = useRef<ActionType>();
    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Row gutter={16} justify='start'>
                            <Col span={24} className='gutter-row' style={{ marginBottom: '8px' }}>
                                <Space>
                                    {/* <Permission noNode navigation={layoutCode.catalogBranch as string} bitPermission={PermissionAction.Add}>
                                        <Button htmlType='button' type='default' onClick={() => onHandleShowModelCreate()}>
                                            <PlusOutlined />
                                            Tạo mới
                                        </Button>
                                    </Permission> */}
                                    <Permission noNode navigation={layoutCode.catalogPricingDecision as string} bitPermission={PermissionAction.Delete}>
                                        {selectedRowDeleteKeys.length > 0 &&
                                            <Button htmlType='button' danger loading={loadingDelete} type='dashed' onClick={() => multiDeleteRecord()}>
                                                <DeleteOutlined />
                                                Xóa
                                            </Button>
                                        }
                                    </Permission>
                                </Space>
                            </Col>
                            <Col span={24} className='gutter-row'>
                                <Collapse>
                                    <Panel header='Tìm kiếm' key='1'>
                                        <Form
                                            form={searchForm}
                                            name='search'
                                            initialValues={{
                                                ['TextSearch']: '',
                                            }}
                                        >
                                            <Row gutter={16} justify='start'>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label={'Tên quyết định'}
                                                        labelCol={{ span: 24 }}
                                                        wrapperCol={{ span: 17 }}
                                                        name='TextSearch'
                                                    >
                                                        <Input
                                                            placeholder='Tên quyết định'
                                                            allowClear />
                                                    </Form.Item>
                                                </Col>


                                                <Col span={24}>
                                                    <Button type='primary' htmlType='submit' onClick={() => searchFormSubmit()}>
                                                        Tìm kiếm
                                                    </Button>
                                                    <Button htmlType='button' style={{ marginLeft: 8 }} onClick={() => searchForm.resetFields()}>
                                                        Làm lại
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                    </>
                }
                extra={<div></div>}
            >
                {/* <Table
                    rowKey='id'
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            getList(page, pageSize);
                        },
                    }}
                    rowSelection={{
                        selectedRowKeys: selectedRowDeleteKeys,
                        onChange: (selectedRowKeys: React.Key[]) => setSelectedRowDeleteKeys(selectedRowKeys.map(value => value.toString()))
                    }}
                /> */}

                <ProTable<PricingDecisionModel>
                    dataSource={list}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page: number, pageSize: number) => {
                            getList(page, pageSize);
                        },
                    }}
                    columns={columns}
                    scroll={{ x: '200px', y: '460px' }}
                    search={false}
                    dateFormatter="string"
                    headerTitle="Tiêu đề"
                    toolBarRender={() => [
                        <Permission noNode navigation={layoutCode.catalogPricingDecision as string} bitPermission={PermissionAction.Add}>
                            <Button htmlType='button' type='default' onClick={() => onHandleShowModelCreate()}>
                                <PlusOutlined />
                                Tạo mới
                            </Button>
                        </Permission>
                    ]}
                />
            </Card>

        </div>
    );
}

export default PricingDecision;
