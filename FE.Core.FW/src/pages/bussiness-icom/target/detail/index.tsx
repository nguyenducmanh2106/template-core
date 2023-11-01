import { ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    FormInstance,
    Input,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tooltip,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { OptionModel, SelectOptionModel } from '@/@types/data';
import { Code } from '@/apis';
import { TargetMappingModel } from '@/apis/models/TargetMappingModel';
import { TargetModel } from '@/apis/models/TargetModel';
import { putBranch } from '@/apis/services/BranchService';
import { getProductType } from '@/apis/services/ProductTypeService';
import { getTarget1, postTarget2 } from '@/apis/services/TargetService';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { EditableProTable, ProColumns, ProTable } from '@ant-design/pro-components';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

function TargetDetail() {
    const navigate = useNavigate();
    const params = useParams()
    let [searchParams, setSearchParams] = useSearchParams();

    const type = searchParams.get('type')
    const departmentId: string | undefined = searchParams.get('departmentId') ? searchParams.get('departmentId')?.toString() : undefined
    const year = searchParams.get('year')
    const userName = searchParams.get('userName')?.toString();
    // console.log(searchParams.get('type'));
    // Load
    const initState = {
        recordEdit: {},
        productTypes: []
    };
    const [loading, setLoading] = useState<boolean>(false);
    const [summaries, setSummaries] = useState<TargetMappingModel>({});

    const { Title, Paragraph, Text, Link } = Typography;
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );


    useEffect(() => {
        const fnGetInitState = async () => {
            setLoading(true);

            const response: ResponseData<TargetModel> = await getTarget1(params.id, +(type ?? 0), departmentId, +(year ?? 0), userName) as ResponseData<TargetModel>;
            const stateDispatcher = {
                recordEdit: response.data,
            };
            // setDataSource(response.data?.targets as TargetMappingModel[])
            dataSource.current = response.data?.targets as TargetMappingModel[]
            setSummaries(response?.summary)
            dispatch(stateDispatcher);
            setLoading(false);
        }
        fnGetInitState()
    }, []);

    // Data
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [buttonOkText, setButtonOkText] = useState<string>('Lưu');

    // searchForm
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>(null);


    const validateMessages = {
        required: '${label} không được để trống',
        whitespace: '${label} không được để trống',
        types: {
            email: '${label} không đúng định dạng email',
            number: '${label} không đúng định dạng số',
        },
        number: {
            range: '${label} must be between ${min} and ${max}',
        },
    };

    const handleOk = async (values: any) => {
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);

        const objBody: TargetModel = {
            ...fieldsValue,
            departmentId,
            type,
            username: userName,
            year
            // targets: dataSource.current
        }
        // console.log(objBody);

        // return
        const response = await postTarget2(params.id, "", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            navigate(`/icom/target`)
        }
        else {
            message.error(response.message || "Thất bại")
        }
    };

    const dataSource = useRef<readonly TargetMappingModel[]>([]);

    const columns: ProColumns<TargetMappingModel>[] = [
        {
            title: 'Loại sản phẩm',
            dataIndex: 'productTypeName',
            key: 'productTypeName',
            width: '220px',
            fixed: 'left'
        },
        {
            title: 'Tổng năm',
            dataIndex: 'jan',
            key: 'jan',
            fixed: 'left',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'total',
                    key: 'total',
                    width: '180px',
                    align: 'right',
                    fixed: 'left',
                    render: (_, record) => <span>{record.total?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'totalQuantity',
                    key: 'totalQuantity',
                    width: '180px',
                    align: 'right',
                    fixed: 'left',
                    render: (_, record) => {
                        const totalQuantity = (record.quantityJan ?? 0) + (record.quantityFeb ?? 0) + (record.quantityMar ?? 0) +
                            + (record.quantityApr ?? 0) + (record.quantityMay ?? 0) + (record.quantityJun ?? 0) + (record.quantityJuly ?? 0)
                            + (record.quantityAug ?? 0) + (record.quantitySep ?? 0) + (record.quantityOct ?? 0) + (record.quantityNov ?? 0) + (record.quantityDec ?? 0)
                        return <span>{totalQuantity.toLocaleString('vi-VN') ?? "-"}</span>
                    },
                }
            ]
        },
        {
            title: 'Tháng 1',
            dataIndex: 'jan',
            key: 'jan',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'jan',
                    key: 'jan',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.jan?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJan',
                    key: 'quantityJan',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityJan?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 2',
            dataIndex: 'feb',
            key: 'feb',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'feb',
                    key: 'feb',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.feb?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityFeb',
                    key: 'quantityFeb',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityFeb?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 3',
            dataIndex: 'mar',
            key: 'mar',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'mar',
                    key: 'mar',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.mar?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityMar',
                    key: 'quantityMar',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityMar?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 4',
            dataIndex: 'apr',
            key: 'apr',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'apr',
                    key: 'apr',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.apr?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityApr',
                    key: 'quantityApr',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityApr?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 5',
            dataIndex: 'may',
            key: 'may',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'may',
                    key: 'may',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.may?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityMay',
                    key: 'quantityMay',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityMay?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 6',
            dataIndex: 'jun',
            key: 'jun',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'jun',
                    key: 'jun',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.jun?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJun',
                    key: 'quantityJun',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityJun?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 7',
            dataIndex: 'july',
            key: 'july',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'july',
                    key: 'july',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.july?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityJuly',
                    key: 'quantityJuly',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityJuly?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 8',
            dataIndex: 'aug',
            key: 'aug',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'aug',
                    key: 'aug',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.aug?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityAug',
                    key: 'quantityAug',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityAug?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 9',
            dataIndex: 'sep',
            key: 'sep',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'sep',
                    key: 'sep',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.sep?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantitySep',
                    key: 'quantitySep',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantitySep?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 10',
            dataIndex: 'oct',
            key: 'oct',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'oct',
                    key: 'oct',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.oct?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityOct',
                    key: 'quantityOct',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityOct?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 11',
            dataIndex: 'nov',
            key: 'nov',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'nov',
                    key: 'nov',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.nov?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityNov',
                    key: 'quantityNov',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityNov?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
        {
            title: 'Tháng 12',
            dataIndex: 'nov',
            key: 'nov',
            width: '360px',
            children: [
                {
                    title: 'Doanh thu',
                    dataIndex: 'dec',
                    key: 'dec',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.dec?.toLocaleString('vi-VN') ?? "-"}</span>,
                },
                {
                    title: 'Số lượng',
                    dataIndex: 'quantityDec',
                    key: 'quantityDec',
                    width: '180px',
                    align: 'right',
                    render: (_, record) => <span>{record.quantityDec?.toLocaleString('vi-VN') ?? "-"}</span>,
                }
            ]
        },
    ];

    const onHandleChangeSource = (value: readonly TargetMappingModel[]) => {
        // setDataSource(value)
        dataSource.current = value;
    }
    const onHandleFinishFailed = ({ values, errorFields, outOfDate }: any) => {
        console.log('error')
    }
    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate('/icom/target')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Chi tiết mục tiêu</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        {/* <Button type="dashed" onClick={() => navigate('/icom/target')}>
                            Hủy bỏ
                        </Button>
                        <Button disabled={buttonLoading} htmlType="submit" type='primary' onClick={handleOk}>
                            {buttonOkText}
                        </Button> */}
                    </Space>
                }
            >
                {loading ? <Spin /> :
                    <>
                        <Form
                            // form={searchForm}
                            ref={formRef}
                            name='nest-messages' id="myFormCreate"
                            onFinish={handleOk}
                            autoComplete="off"
                            onFinishFailed={onHandleFinishFailed}
                            validateMessages={validateMessages}
                            initialValues={{
                                ["TypeName"]: state.recordEdit?.typeName,
                                ["Year"]: state.recordEdit?.year,
                                ["DepartmentName"]: state.recordEdit?.departmentName,
                                ["FullName"]: state.recordEdit?.fullname,
                                ["Targets"]: dataSource.current,
                            }}
                        >
                            <Row gutter={16} justify='start'>
                                <Col span={12}>
                                    <Form.Item label={'Loại mục tiêu'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TypeName'>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={'Năm thực hiện'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Year'>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                {state.recordEdit?.type === 0 ?
                                    <Col span={12}>
                                        <Form.Item label={'Phòng ban'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='DepartmentName'>
                                            <Input disabled />
                                        </Form.Item>
                                    </Col> :
                                    <Col span={12}>
                                        <Form.Item label={'Nhân viên'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='FullName'>
                                            <Input disabled />
                                        </Form.Item>
                                    </Col>
                                }

                            </Row>
                            <Divider orientation="left" plain>
                                Danh sách sản phẩm
                            </Divider>
                            <ProTable<TargetModel>
                                columns={columns}
                                dataSource={dataSource.current}
                                loading={loading}
                                pagination={false}
                                scroll={{ x: '100vw', y: '400px' }}
                                bordered
                                summary={() => {
                                    const totalQuantity = (summaries?.quantityJan ?? 0) + (summaries?.quantityFeb ?? 0) + (summaries?.quantityMar ?? 0) + (summaries?.quantityApr ?? 0)
                                        + (summaries?.quantityMay ?? 0) + (summaries?.quantityJun ?? 0) + (summaries?.quantityJuly ?? 0) + (summaries?.quantityAug ?? 0)
                                        + (summaries?.quantitySep ?? 0) + (summaries?.quantityOct ?? 0) + (summaries?.quantityNov ?? 0) + (summaries?.quantityDec ?? 0);
                                    return (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} align='center'><Text strong>Tổng</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align='right'><Text strong>{summaries?.total?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={2} align='right'><Text strong>{totalQuantity?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={3} align='right'><Text strong>{summaries?.jan?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={4} align='right'><Text strong>{summaries?.quantityJan?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={5} align='right'><Text strong>{summaries?.feb?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={6} align='right'><Text strong>{summaries?.quantityFeb?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={7} align='right'><Text strong>{summaries?.mar?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={8} align='right'><Text strong>{summaries?.quantityMar?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={9} align='right'><Text strong>{summaries?.apr?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={10} align='right'><Text strong>{summaries?.quantityApr?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={11} align='right'><Text strong>{summaries?.may?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={12} align='right'><Text strong>{summaries?.quantityMay?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={13} align='right'><Text strong>{summaries?.jun?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={14} align='right'><Text strong>{summaries?.quantityJun?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={15} align='right'><Text strong>{summaries?.july?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={16} align='right'><Text strong>{summaries?.quantityJuly?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={17} align='right'><Text strong>{summaries?.aug?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={18} align='right'><Text strong>{summaries?.quantityAug?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={19} align='right'><Text strong>{summaries?.sep?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={20} align='right'><Text strong>{summaries?.quantitySep?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={21} align='right'><Text strong>{summaries?.oct?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={22} align='right'><Text strong>{summaries?.quantityOct?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={23} align='right'><Text strong>{summaries?.nov?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={24} align='right'><Text strong>{summaries?.quantityNov?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={25} align='right'><Text strong>{summaries?.dec?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                                <Table.Summary.Cell index={26} align='right'><Text strong>{summaries?.quantityDec?.toLocaleString('vi-VN') ?? "-"}</Text></Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )
                                }}
                                search={false}
                                dateFormatter="string"
                            // headerTitle={
                            //     <Text>{type == '1' ? list[0]?.departmentName : "Mục tiêu"}</Text>
                            // }

                            />
                        </Form>

                    </>
                }


            </Card>


        </div>
    );
}

export default TargetDetail;
