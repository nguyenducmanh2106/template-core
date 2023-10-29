import { Code } from '@/apis';
import { PricingDecisionModel } from '@/apis/models/PricingDecisionModel';
import { postPricingDecision } from '@/apis/services/PricingDecisionService';
import UploadFileComponent from '@/components/UploadFile/Index';
import useFileConvert from '@/hooks/useFileConvert';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
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
import locale from "antd/es/date-picker/locale/vi_VN";
import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
function PricingDecisionCreate() {
    const navigate = useNavigate();
    // Load
    const initState = {
        provinces: [],
        districts: [],
        departmentEdit: {},
        departments: [],
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
            // const responseProvinces: ResponseData = await getAministrativeDivisions();
            // const responseDepartment: ResponseData = await getDepartment();

            // const provinceOptions = ConvertOptionSelectModel(responseProvinces.data as OptionModel[]);
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
            //     }].concat(departmentOptions),
            //     districts: [{
            //         key: 'Default',
            //         label: '-Chọn-',
            //         value: '',
            //     }]
            // };
            // dispatch(stateDispatcher);
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
        // const fieldsValue = await searchForm.validateFields();
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);
        // setConfirmLoading(true);
        // searchForm.resetFields()
        const { filePath, fileName } = arrayFileConvertToFilePathString(fileList);

        const objBody: PricingDecisionModel = {
            ...fieldsValue,
            filePath,
            fileName
        }

        // console.log(objBody)
        // return
        const response = await postPricingDecision("", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Tạo thành công")
            //redirect đến trang chỉnh sửa
            navigate(`/catalog/pricing-decision`)
        }
        else {
            message.error(response.message || "Thất bại")
        }
    };


    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { filePathStringConvertToArrayFile, arrayFileConvertToFilePathString } = useFileConvert();

    const onHandleChangeFile = (value: UploadFile[]) => {
        // console.log(value)
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
                            <Text strong>Thêm mới quyết định giá</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="default" onClick={() => navigate('/catalog/pricing-decision')}>
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
                            ["Name"]: '',
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

export default PricingDecisionCreate;
