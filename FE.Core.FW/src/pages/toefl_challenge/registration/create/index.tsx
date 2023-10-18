import { Code } from '@/apis';
import { OptionModel, SelectOptionModel } from '@/apis/models/data';
import { DivisionModel } from '@/apis/models/toefl-challenge/DivisionModel';
import { ProvinceModel } from '@/apis/models/toefl-challenge/ProvinceModel';
import { RegistrationExamType } from '@/apis/models/toefl-challenge/RegistrationExamType';
import { RegistrationRound } from '@/apis/models/toefl-challenge/RegistrationRound';
import { SchoolModel } from '@/apis/models/toefl-challenge/SchoolModel';
import { getAministrativeDivisions, getAministrativeDivisions1 } from '@/apis/services/toefl-challenge/AministrativeDivisionsService';
import { getExam, getExam1 } from '@/apis/services/toefl-challenge/ExamService';
import { postRegistration } from '@/apis/services/toefl-challenge/RegistrationService';
import { getSchool } from '@/apis/services/toefl-challenge/SchoolService';
import {
    ConvertOptionSelectModel
} from '@/utils/convert';
import { ResponseData } from '@/utils/request';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    FormInstance,
    Input,
    Radio,
    Row,
    Select,
    Space,
    Spin,
    Tooltip,
    Typography,
    message
} from 'antd';
import locale from "antd/es/date-picker/locale/vi_VN";
import TextArea from 'antd/lib/input/TextArea';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DebounceSelect from '../debounce-select';
import { ExamModel } from '@/apis/models/toefl-challenge/ExamModel';
import { RegistrationModel } from '@/apis/models/toefl-challenge/RegistrationModel';




function RegistrationTFC() {
    const navigate = useNavigate();
    // Load
    const initState = {
        provinces: [],
        districts: [],
        registrationRounds: [
            {
                key: RegistrationRound._1,
                label: 'Vòng 1',
                value: RegistrationRound._1,
            },
            {
                key: RegistrationRound._2,
                label: 'Vòng 2',
                value: RegistrationRound._2,
            },
            {
                key: RegistrationRound._3,
                label: 'Vòng 3',
                value: RegistrationRound._3,
            },
        ],
        registrationExamTypes: [
            {
                key: 'Default',
                label: '-Chọn-',
                value: '',
            },
            {
                key: RegistrationExamType._1,
                label: 'TOEFL Primary',
                value: RegistrationExamType._1,
            },
            {
                key: RegistrationExamType._2,
                label: 'TOEFL Junior',
                value: RegistrationExamType._2,
            },
            {
                key: RegistrationExamType._3,
                label: 'TOEFL ITP',
                value: RegistrationExamType._3,
            },
            {
                key: RegistrationExamType._4,
                label: 'TOEFL iBT',
                value: RegistrationExamType._4,
            },
        ],
        exams: [],
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
            const responseExam: ResponseData = await getExam(JSON.stringify({
                status: 1
            }));
            // const provinceOptions = ConvertOptionSelectModel(responseProvinces.data as OptionModel[]);
            const examOptions = ConvertOptionSelectModel(responseExam.data as OptionModel[]);
            let blocks: SelectOptionModel[] = []
            for (let idx = 1; idx <= 12; idx++) {
                blocks.push({
                    key: `${idx}`,
                    label: `${idx}`,
                    value: `${idx}`,
                })
            }
            const stateDispatcher = {
                provinces: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }],
                exams: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }].concat(examOptions),
                districts: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }],
                blocks: [{
                    key: 'Default',
                    label: '-Chọn-',
                    value: '',
                }].concat(blocks)
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

        const objBody: RegistrationModel = {
            ...fieldsValue,
            DayOfBirth: new Date(fieldsValue?.Birthday).getDate(),
            MonthOfBirth: new Date(fieldsValue?.Birthday).getMonth() + 1,
            YearOfBirth: new Date(fieldsValue?.Birthday).getFullYear(),
            SchoolId: fieldsValue.SchoolId ? fieldsValue.SchoolId.value : undefined,
        }
        // console.log(objBody);
        const response = await postRegistration(objBody);
        setButtonOkText('Lưu');
        setButtonLoading(false);
        if (response.code === Code._200) {
            message.success(response.message || "Tạo thành công")
            //redirect đến trang chỉnh sửa
            navigate(`/toefl-challenge/registration/edit/${response.data}`)
        }
        else {
            message.error(JSON.stringify(response.errorDetail) || "Thất bại")
        }
    };
    const onChangeProvince = async () => {
        const fieldsValue = await formRef.current?.getFieldsValue();
        formRef.current?.setFieldsValue({
            "DistrictId": '',
            "SchoolId": '',
        })
        const responseDistricts: ResponseData = await getAministrativeDivisions1(fieldsValue.ProvinceId);
        const dataDistricts = responseDistricts?.data as ProvinceModel
        const districtOptions = ConvertOptionSelectModel(dataDistricts.districts as OptionModel[]);

        const stateDispatcher = {
            districts: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(districtOptions),
        }
        dispatch(stateDispatcher)
    };

    const onHandleChangeExam = async () => {
        const fieldsValue = await formRef.current?.getFieldsValue();

        const stateDispatcherBefore = {
            provinces: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }],
            districts: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }],
        }
        dispatch(stateDispatcherBefore)
        formRef.current?.setFieldValue('ProvinceId', '')
        formRef.current?.setFieldValue('DistrictId', '')
        formRef.current?.setFieldValue('SchoolId', '')

        const responseExam: ResponseData<ExamModel> = await getExam1(fieldsValue.ExamId) as ResponseData<ExamModel>;
        const provinceOptions = ConvertOptionSelectModel(responseExam.data?.provinces as OptionModel[]);
        const stateDispatcher = {
            provinces: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(provinceOptions),
        }
        dispatch(stateDispatcher)
    }
    const onGetSchoolDebounce = async (search: string, page: number = 1): Promise<ResponseData<SelectOptionModel[]>> => {
        const fieldsValue = await formRef?.current?.getFieldsValue();
        const filter = {
            provinceId: fieldsValue.ProvinceId ? fieldsValue.ProvinceId : undefined,
            districtId: fieldsValue.DistrictId ? fieldsValue.DistrictId : undefined,
            page: page,
            size: 20,
            textSearch: search,
        }

        return getSchool(
            JSON.stringify(filter)
        ).then((body: ResponseData | ResponseData<SchoolModel[]>) => {
            const recordOptions = ConvertOptionSelectModel(body.data as OptionModel[]);
            return {
                ...body,
                data: recordOptions
            }
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
                                <Button type="text" shape='circle' onClick={() => navigate('/toefl-challenge/registration')}>
                                    <ArrowLeftOutlined />
                                </Button>
                            </Tooltip>
                            <Text strong>Thêm mới thông tin thí sinh</Text>
                        </Space>
                    </>
                }
                extra={
                    <Space>
                        <Button type="ghost" onClick={() => navigate('/toefl-challenge/registration')}>
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
                            ['ExamRegistrationProvinceId']: '',
                            ['DayReception']: '',
                            ['ExamId']: undefined,
                            ['Round']: undefined,
                            ['IsSelfRegistration']: false,
                            ['ProvinceId']: '',
                            ['DistrictId']: '',
                            ['Gender']: 0,
                            ['Block']: '',
                            ['Class']: '',
                            ['FullName']: '',
                            ['Tel']: '',
                            ['Email']: '',
                        }}
                    >
                        <Row gutter={16} justify='start'>
                            <Col span={8}>
                                <Form.Item label={'Họ và tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='FullName' rules={[{ required: true }]}>
                                    <Input placeholder='Nhập họ và tên' allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={'Ngày sinh'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Birthday' rules={[{ required: true }]}>
                                    <DatePicker locale={locale} style={{ width: '100%' }}
                                        format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={'Giới tính'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Gender' rules={[{ required: true }]}>
                                    <Radio.Group>
                                        <Radio value={0}>Nam</Radio>
                                        <Radio value={1}>Nữ</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Cuộc thi theo Tỉnh/TP'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='ExamId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        }
                                        placeholder='Chọn' options={state.exams}
                                        onChange={() => onHandleChangeExam()}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Đăng ký tham gia bài thi'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='ExamType'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                        // filterSort={(optionA, optionB) =>
                                        //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        // }
                                        placeholder='Chọn' options={state.registrationExamTypes} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Vòng thi'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Round'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}

                                        placeholder='Chọn' options={state.registrationRounds} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Tỉnh/TP nơi theo học'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='ProvinceId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder='Chọn Tỉnh/TP'
                                        showSearch
                                        allowClear
                                        optionFilterProp='children'
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '')
                                                .toString()
                                                .toLowerCase()
                                                .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        }
                                        options={state.provinces}
                                        onChange={() => onChangeProvince()}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Quận/Huyện nơi theo học'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='DistrictId'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder='Chọn'
                                        showSearch
                                        allowClear
                                        optionFilterProp='children'
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        filterSort={(optionA, optionB) =>
                                            (optionA?.label ?? '')
                                                .toString()
                                                .toLowerCase()
                                                .localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                        }
                                        options={state.districts}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Trường học'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='SchoolId'
                                    rules={[{ required: true }]}
                                >
                                    <DebounceSelect
                                        // mode="multiple"
                                        showSearch
                                        allowClear
                                        placeholder="Chọn trường"
                                        fetchOptions={onGetSchoolDebounce}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Khối'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Block'
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder='Chọn'
                                        showSearch
                                        allowClear
                                        optionFilterProp='children'
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={state.blocks}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Lớp'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Class'
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        placeholder='Nhập lớp'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Họ và tên bố'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='FatherName'
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        placeholder='Nhập họ và tên bố'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Email nhận thông tin'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Email'
                                    rules={[
                                        { required: true },
                                        {
                                            type: 'email',
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder='Nhập email'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Số điện thoại liên hệ'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Tel'
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        placeholder='Nhập số điện thoại liên hệ'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={'Họ và tên mẹ'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='MotherName'
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        placeholder='Nhập họ và tên mẹ'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={'Địa chỉ gia đình'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Address'
                                >
                                    <Input
                                        placeholder='Nhập địa chỉ gia đình'
                                        allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    wrapperCol={{ span: 24 }}
                                    name='IsSelfRegistration'
                                    valuePropName='checked'
                                >
                                    <Checkbox>Thí sinh tự do</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item
                                    wrapperCol={{ span: 24 }}
                                    name='IsUsedForCommunication'
                                    valuePropName='checked'
                                >
                                    <Checkbox>Đồng ý sử dụng hình ảnh cho mục đích truyền thông</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={'Ghi chú'}
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    name='Note'
                                >
                                    <TextArea
                                        placeholder="Nhập ghi chú"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                }


            </Card>


        </div>
    );
}

export default RegistrationTFC;
