import { ResponseData } from '@/utils/request';
import {
    Button,
    Card,
    Checkbox,
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
    TreeSelect,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { Code, DepartmentModel } from '@/apis';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import EditableCell from './create';
import { OptionModel, SelectOptionModel } from '@/@types/data';
import { getBranch } from '@/apis/services/BranchService';
import { postPricingCategory } from '@/apis/services/PricingCategoryService';
import { getProduct } from '@/apis/services/ProductService';
import { getPricingDecision } from '@/apis/services/PricingDecisionService';




function PricingCategoryCreate() {
    const navigate = useNavigate();
    // Load
    const initState = {
        products: [],
        pricingDecisions: [],
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
            const responseProduct: ResponseData = await getProduct();
            const optionProducts = ConvertOptionSelectModel(responseProduct.data as OptionModel[]);

            const responsePricingDecision: ResponseData = await getPricingDecision();
            const optionPricingDecisions = ConvertOptionSelectModel(responsePricingDecision.data as OptionModel[]);
            const stateDispatcher = {
                products: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionProducts),
                pricingDecisions: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionPricingDecisions),
            };
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
        // const fieldsValue = await searchForm.validateFields();
        const fieldsValue = await formRef?.current?.validateFields();
        setButtonOkText('Đang xử lý...');
        setButtonLoading(true);
        // setConfirmLoading(true);
        // searchForm.resetFields()

        const objBody: DepartmentModel = {
            ...fieldsValue,
            ParentId: fieldsValue.ParentId ? fieldsValue.ParentId : undefined
        }
        console.log(objBody)

        const response = await postPricingCategory("", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Tạo thành công")
            //redirect đến trang chỉnh sửa
            navigate(`/catalog/pricing-category`)
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

    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate('/catalog/pricing-category')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Thêm mới quy định giá</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="dashed" onClick={() => navigate('/catalog/pricing-category')}>
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
                                <Form.Item label={'Tên quy định'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Name' rules={[{ required: true, whitespace: true }]}>
                                    <Input placeholder='Nhập tên quy định' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Sản phẩm'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='ProductId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.products} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Quyết định giá'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='PricingDecisionId'
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.pricingDecisions} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Mô tả'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Description'>
                                    <Input placeholder='Nhập mô tả' allowClear />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                }


            </Card>


        </div>
    );
}

export default PricingCategoryCreate;
