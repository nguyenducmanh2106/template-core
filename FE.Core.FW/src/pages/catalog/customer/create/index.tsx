import {
    Button,
    Card,
    Col,
    Form,
    FormInstance,
    Input,
    Row,
    Select,
    Space,
    Spin,
    Tooltip,
    TreeSelect,
    Typography,
    message
} from 'antd';
import { useEffect, useReducer, useRef, useState } from 'react';

import { Code, ResponseData } from '@/apis';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { OptionModel, SelectOptionModel } from '@/@types/data';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { getProductCategory } from '@/apis/services/ProductCategoryService';
import { ProductTypeModel } from '@/apis/models/ProductTypeModel';
import { getProductType, postProductType } from '@/apis/services/ProductTypeService';
import { postProduct } from '@/apis/services/ProductService';
import { postCustomer } from '@/apis/services/CustomerService';
import { CustomerModel } from '@/apis/models/CustomerModel';
import { getCustomerCategory } from '@/apis/services/CustomerCategoryService';
import { getCustomerType } from '@/apis/services/CustomerTypeService';
import { getAdministrativeDivision, getAdministrativeDivision2 } from '@/apis/services/AdministrativeDivisionService';
import { getDepartment2 } from '@/apis/services/DepartmentService';
import dayjs from 'dayjs';




function CustomerCreate() {
    const navigate = useNavigate();
    // Load
    const initState = {
        customerCategories: [],
        customerTypes: [],
        districts: [],
        provinces: [],
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
            const responseCustomerCategory: ResponseData = await getCustomerCategory();
            const responseCustomerType: ResponseData = await getCustomerType();
            const responseProvinces: ResponseData = await getAdministrativeDivision();

            const responseDepartment: ResponseData = await getDepartment2();

            const optionCustomerCategores = ConvertOptionSelectModel(responseCustomerCategory.data as OptionModel[]);
            const optionCustomerTypes = ConvertOptionSelectModel(responseCustomerType.data as OptionModel[]);
            const optionProvinces = ConvertOptionSelectModel(responseProvinces.data as OptionModel[]);

            const stateDispatcher = {
                customerCategories: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionCustomerCategores),
                customerTypes: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionCustomerTypes),
                provinces: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel].concat(optionProvinces),
                departments: responseDepartment.data,
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                } as SelectOptionModel],
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

        const objBody: CustomerModel = {
            ...fieldsValue,
        }

        const response = await postCustomer("", objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Tạo thành công")
            //redirect đến trang chỉnh sửa
            navigate(`/catalog/customer`)
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

    const onChangeProvince = async () => {
        const fieldsValue = await formRef.current?.getFieldsValue();
        formRef?.current?.setFieldsValue({
            "DistrictId": '',
        })
        const filter = {
            ProvinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
        }
        if (!fieldsValue.ProvinceId) {
            const stateDispatcher = {
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }],
            }
            dispatch(stateDispatcher)
            return
        }
        const response: ResponseData = await getAdministrativeDivision2(filter.ProvinceId);

        const options = ConvertOptionSelectModel(response.data as OptionModel[]);
        const stateDispatcher = {
            districts: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(options),
        };
        dispatch(stateDispatcher);
    }

    return (
        <div className='layout-main-content'>
            <Card
                bordered={false}
                title={
                    <>
                        <Space className="title">
                            <Tooltip title="Quay lại">
                                <Button type="text" shape='circle' onClick={() => navigate('/catalog/customer')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Thêm mới khách hàng</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="default" onClick={() => navigate('/catalog/customer')}>
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
                            ["Code"]: `KH-${dayjs().format("YYYYMMDDHHmmss")}`,
                        }}
                    >
                        <Row gutter={16} justify='start'>
                            <Col span={12}>
                                <Form.Item label={'Mã khách hàng'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Code' rules={[{ required: true, whitespace: true }]}>
                                    <Input placeholder='Nhập mã khách hàng' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Tên khách hàng'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Name' rules={[{ required: true, whitespace: true }]}>
                                    <Input placeholder='Nhập tên khách hàng' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Nhóm khách hàng'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='CustomerCategoryId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.customerCategories} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Loại hình khách hàng'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='CustomerTypeId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.customerTypes} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Tỉnh/TP'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='ProvinceId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.provinces} onChange={onChangeProvince} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Quận/Huyện'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='DistrictId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='-Chọn-' options={state.districts} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={'Phòng ban phụ trách'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='DepartmentId'
                                    rules={[{ required: true, whitespace: true }]}
                                >
                                    <TreeSelect
                                        showSearch
                                        treeLine
                                        style={{ width: '100%' }}
                                        // value={value}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                        placeholder="-Chọn phòng ban-"
                                        allowClear
                                        treeDefaultExpandAll
                                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                        treeData={state.departments}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Địa chỉ'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Address'>
                                    <Input placeholder='Nhập địa chỉ' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Mã số thuế'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='TaxCode'>
                                    <Input placeholder='Nhập mã số thuế' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Mô tả'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Description'>
                                    <Input placeholder='Nhập mô tả' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Người đại diện'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Representative'>
                                    <Input placeholder='Nhập người đại diện' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Chức vụ'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Position'>
                                    <Input placeholder='Nhập chức vụ' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Điện thoại'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Telephone'>
                                    <Input placeholder='Nhập điện thoại' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Fax'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Fax'>
                                    <Input placeholder='Nhập fax' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Số tài khoản ngân hàng'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='BankAccount'>
                                    <Input placeholder='Nhập số tài khoản ngân hàng' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'Chi nhánh ngân hàng'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='BankBrand'>
                                    <Input placeholder='Nhập chi nhánh ngân hàng' allowClear />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                }
            </Card>
        </div>
    );
}

export default CustomerCreate;
