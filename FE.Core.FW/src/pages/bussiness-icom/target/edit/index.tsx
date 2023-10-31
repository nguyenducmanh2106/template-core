import { ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    FormInstance,
    Input,
    Popconfirm,
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

import { Code } from '@/apis';
import { DivisionModel } from '@/apis/models/toefl-challenge/DivisionModel';
import { PICModel } from '@/apis/models/toefl-challenge/PICModel';
import { ProvinceModel } from '@/apis/models/toefl-challenge/ProvinceModel';
import { getAministrativeDivisions, getAministrativeDivisions1 } from '@/apis/services/toefl-challenge/AministrativeDivisionsService';
import { getDepartment } from '@/apis/services/toefl-challenge/DepartmentService';
import { getDivisionId, putDivision } from '@/apis/services/toefl-challenge/DivisionService';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import EditableCell from './edit';
import { OptionModel } from '@/@types/data';
import { getBranch1, putBranch } from '@/apis/services/BranchService';
import { getTarget1 } from '@/apis/services/TargetService';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { TargetModel } from '@/apis/models/TargetModel';
import { TargetMappingModel } from '@/apis/models/TargetMappingModel';




function TargetEdit() {
    const navigate = useNavigate();
    const params = useParams()
    console.log(params);
    // Load
    const initState = {
        recordEdit: {}
    };
    const [loading, setLoading] = useState<boolean>(false);

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
            const response: ResponseData<TargetModel> = await getTarget1(params.id) as ResponseData<TargetModel>;

            const stateDispatcher = {
                recordEdit: response.data
            };
            setDataSource(response.data?.targets as TargetMappingModel[])
            const key = response.data?.targets?.map((item) => item.id)
            setEditableRowKeys(key as React.Key[])
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

    const handleOk = async () => {
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);

        const objBody: DivisionModel = {
            ...fieldsValue,
        }

        const response = await putBranch(params.id, "", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            navigate(`/catalog/branch`)
        }
        else {
            message.error(response.message || "Thất bại")
        }
    };

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }


    const defaultData: TargetMappingModel[] = new Array(8).fill(1).map((_, index) => {
        return {
            id: (Date.now() + index).toString(),
            title: `Tên ${index}`,
            decs: `mô tả ${index}`,
            state: 'open',
            created_at: 1590486176000,
        };
    });
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<readonly TargetMappingModel[]>([]);

    const columns: ProColumns<TargetMappingModel>[] = [
        {
            title: 'Tên',
            dataIndex: 'title',
            width: '30%',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        whitespace: true,
                        message: 'Không được để trống',
                    },
                    // {
                    //     message: '必须包含数字',
                    //     pattern: /[0-9]/,
                    // },
                    // {
                    //     max: 16,
                    //     whitespace: true,
                    //     message: '最长为 16 位',
                    // },
                    // {
                    //     min: 6,
                    //     whitespace: true,
                    //     message: '最小为 6 位',
                    // },
                ],
            },
        },
        {
            title: 'Trạng thái',
            key: 'state',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: {
                all: { text: 'Tất cả', status: 'Default' },
                open: {
                    text: 'Lỗi',
                    status: 'Error',
                },
                closed: {
                    text: 'Thành công',
                    status: 'Success',
                },
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'decs',
        },
        {
            title: 'Hành động',
            valueType: 'option',
            width: 250,
            render: () => {
                return null;
            },
        },
    ];

    const onHandleChangeSource = (value: readonly TargetMappingModel[]) => {
        setDataSource(value)
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
                            <Text strong>Cập nhật mục tiêu</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="dashed" onClick={() => navigate('/icom/target')}>
                            Hủy bỏ
                        </Button>
                        <Button disabled={buttonLoading} htmlType="submit" type='primary' onClick={handleOk}>
                            {buttonOkText}
                        </Button>
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
                            validateMessages={validateMessages}
                            initialValues={{
                                ["TypeName"]: state.recordEdit?.typeName,
                                ["Year"]: state.recordEdit?.year,
                                ["DepartmentName"]: state.recordEdit?.departmentName,
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
                                <Col span={12}>
                                    <Form.Item label={'Phòng ban'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='DepartmentName'>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                        <Divider orientation="left" plain>
                            Danh sách sản phẩm
                        </Divider>
                        <EditableProTable<TargetMappingModel>
                            // headerTitle="可编辑表格"
                            columns={columns}
                            rowKey="id"
                            scroll={{ x: '100vw', y: '400px' }}
                            value={dataSource}
                            onChange={onHandleChangeSource}
                            recordCreatorProps={{
                                newRecordType: 'dataSource',
                                record: () => ({
                                    id: uuidv4(),
                                }),
                            }}

                            toolBarRender={() => {
                                return [
                                    <Button
                                        type="primary"
                                        key="save"
                                        onClick={() => {
                                            // dataSource 就是当前数据，可以调用 api 将其保存
                                            console.log(dataSource);
                                        }}
                                    >
                                        Lưu
                                    </Button>,
                                ];
                            }}
                            editable={{
                                type: 'multiple',
                                deleteText: <Tooltip title="Xóa">
                                    <Button type="text" shape='circle'>
                                        <DeleteOutlined />
                                    </Button>
                                </Tooltip>,
                                deletePopconfirmMessage: <>Đồng ý xóa?</>,
                                editableKeys,
                                actionRender: (row, config, defaultDoms) => {
                                    return [defaultDoms.delete];
                                },
                                onValuesChange: (record, recordList) => {
                                    setDataSource(recordList);
                                },
                                onChange: setEditableRowKeys,
                            }}
                        />
                    </>
                }


            </Card>


        </div>
    );
}

export default TargetEdit;
