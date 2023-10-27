import { ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    FormInstance,
    Input,
    Row,
    Space,
    Spin,
    Tooltip,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Code } from '@/apis';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getPricingDecision1, putPricingDecision } from '@/apis/services/PricingDecisionService';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
import type { UploadFile } from 'antd';
import UploadFileComponent from '@/components/UploadFile/Index';
import locale from "antd/es/date-picker/locale/vi_VN";
import dayjs from 'dayjs';

function PricingDecisionEdit() {
    const navigate = useNavigate();
    const params = useParams()
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
            const responseDivision: ResponseData = await getPricingDecision1(params.id);

            const stateDispatcher = {
                recordEdit: responseDivision.data
            };
            const { filePath, fileName } = responseDivision.data as PricingDecisionModel;
            const filePathList = Boolean(filePath) ? filePath?.split(',') : []
            const fileNameList = Boolean(fileName) ? fileName?.split(',') as string[] : []
            const files: UploadFile[] = []
            filePathList?.forEach((filePath: string, idx: number) => {
                const fileObj: UploadFile = {
                    name: fileNameList[idx],
                    uid: uuidv4(),
                    url: filePath,
                    thumbUrl: import.meta.env.VITE_HOST + '/' + filePath,
                    status: 'done',
                    percent: 100,
                    type: 'image/*',
                    response: {
                        files: [
                            {
                                name: fileNameList[idx],
                                url: filePath,
                            }
                        ]
                    }
                }
                files.push(fileObj);
            })
            setFileList([...fileList, ...files])
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
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const handleOk = async () => {
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);

        let filePath = "";
        let fileName = "";
        fileList?.forEach((file: UploadFile) => {
            if (file.response?.files?.length > 0) {
                filePath = filePath ? `${filePath},${file.response?.files[0]?.url}` : file.response?.files[0]?.url
                fileName = fileName ? `${fileName},${file.response?.files[0]?.name}` : file.response?.files[0]?.name
            }
        })

        const objBody: PricingDecisionModel = {
            ...fieldsValue,
            filePath,
            fileName
        }

        // console.log(objBody)
        // return;

        const response = await putPricingDecision(params.id, "", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            navigate(`/catalog/pricing-decision`)
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
    const onHandleChangeFile = (value: UploadFile[]) => {
        console.log(value)
        setFileList([...value])
    }

    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate('/catalog/pricing-decision')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Cập nhật quyết định giá</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="dashed" onClick={() => navigate('/catalog/pricing-decision')}>
                            Hủy bỏ
                        </Button>
                        <Button disabled={buttonLoading} htmlType="submit" type='primary' onClick={handleOk}>
                            {buttonOkText}
                        </Button>
                    </Space>
                }
            >
                {loading ? <Spin /> :
                    <Form
                        // form={searchForm}
                        ref={formRef}
                        name='nest-messages' id="myFormCreate"
                        onFinish={handleOk}
                        validateMessages={validateMessages}
                        initialValues={{
                            ["Name"]: state.recordEdit?.name,
                            ["DecisionNo"]: state.recordEdit?.decisionNo,
                            ["Description"]: state.recordEdit?.description,
                            ["Status"]: state.recordEdit?.status,
                            ["EffectiveDate"]: state.recordEdit?.effectiveDate ? dayjs(state.recordEdit?.effectiveDate) : '',
                        }}
                    >
                        <Row gutter={16} justify='start'>
                            <Col span={12}>
                                <Form.Item label={'Số quyết định giá'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='DecisionNo' rules={[{ required: true, whitespace: true }]}>
                                    <Input placeholder='Nhập số quyết định giá' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Tên quyết định giá'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Name' rules={[{ required: true, whitespace: true }]}>
                                    <Input placeholder='Nhập tên quyết định giá' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Ngày hiệu lực'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='EffectiveDate' rules={[{ required: true }]}>
                                    <DatePicker locale={locale} style={{ width: '100%' }}
                                        format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Mô tả'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Description'>
                                    <Input placeholder='Nhập mô tả' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'File upload'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='File'>
                                    <UploadFileComponent fileListInit={fileList} onChangeFile={onHandleChangeFile} />
                                </Form.Item>

                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    wrapperCol={{ span: 24 }}
                                    name='Status'
                                    valuePropName='checked'
                                >
                                    <Checkbox>Còn hiệu lực</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                }


            </Card>


        </div>
    );
}

export default PricingDecisionEdit;
