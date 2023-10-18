import { FormInstance } from 'antd/lib/form';
import { Form, Row, Col, Input, DatePicker, InputNumber, Modal, Select, message, Button, Switch, Divider, Radio, Table } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ExamAPModel, ExamModel, ExamPeriodResponse, SelectOptionModel, UpdateManageRegisteredCandidateAPAdminModel } from '@/apis/models/data';
import { useState } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { ExamScheduleAPModel } from '@/apis';
import { typeIdCard } from '@/utils/constants';

dayjs.extend(customParseFormat);
const dateFormat = 'DD/MM/YYYY';
interface UpdateFormProps {
    values: Partial<UpdateManageRegisteredCandidateAPAdminModel>;
    examWorkShifts: SelectOptionModel[];
    exams: ExamModel[];
    visible: boolean;
    onSubmitLoading: boolean;
    onCancel: () => void;
    onSubmit: (values: UpdateManageRegisteredCandidateAPAdminModel, form: FormInstance) => void;
    examPeriod: SelectOptionModel[];
    examScheduleAp: ExamScheduleAPModel[];
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
    const { values, examWorkShifts, examScheduleAp, exams, visible, onSubmitLoading, onCancel, onSubmit } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    const formVals: UpdateManageRegisteredCandidateAPAdminModel = {
        id: values?.id as string,
        createdOnDate: values.createdOnDate as string,
        examInfo: values.examInfo as ExamAPModel[],
        sex: values.sex as string,
        school: values.school as string,
        class: values.class as string,
        lastName: values.lastName as string,
        typeIDCard: values.typeIDCard as string,
        idCardNumber: values.idCardNumber as string,
        firstName: values.firstName as string,
        price: values.price as string,
        sbd: values.sbd as string,
        phone: values.phone as string,
        parentPhone: values.parentPhone as string,
        email: values.email as string,
        examPeriodName: values.examPeriodName as string,
        examName: values.examName as string,
        birthday: values.birthday as string,
        isChangeUserInfo: values.isChangeUserInfo as boolean
    };

    const changeV = (newValue: string) => { }

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            if (
                moment(values.birthday).format('YYYY-MM-DD') != moment(fieldsValue.birthday).format('YYYY-MM-DD') ||
                formVals.firstName != fieldsValue.firstName ||
                formVals.lastName != fieldsValue.firstName ||
                formVals.sex != fieldsValue.sex ||
                formVals.typeIDCard != fieldsValue.typeIDCard ||
                formVals.idCardNumber != fieldsValue.idCardNumber ||
                formVals.email != fieldsValue.email ||
                formVals.phone != fieldsValue.phone ||
                formVals.school != fieldsValue.school ||
                formVals.class != fieldsValue.class
            ) {
                fieldsValue.isChangeUserInfo = true;
            }
            fieldsValue.birthday = moment(fieldsValue.birthday).format("DD/MM/YYYY");
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            //message.warning('Hãy nhập đủ các trường');
        }
    };

    const columns: ColumnsType<ExamAPModel> = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 80,
            render: (_, record, index) => <>{record.stt}</>,
        },
        {
            title: 'Tên bài thi',
            dataIndex: 'name',
            render: (_, record) => <span>{record.name}</span>,
        },
        {
            title: 'Mã bài thi',
            dataIndex: 'code',
            render: (_, record) => <span>{record.code}</span>,
        },
        {
            title: 'Giá tiền (VND)',
            dataIndex: 'price',
            render: (_, record) => <span>{record.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>,
        },
        {
            title: 'Ngày thi',
            dataIndex: 'dateTest',
            render: (_, record) => <span>{record.dateTest}</span>,
        },
        {
            title: 'Ca thi',
            dataIndex: 'examWorkshift',
            render: (_, record) => (
                <span>{record.examWorkshift}</span>
            ),
        },
        {
            title: 'Giờ thi',
            dataIndex: 'timeTest',
            render: (_, record) => <span>{record.timeTest}</span>,
        },
    ];


    return (
        <Modal
            open={visible}
            destroyOnClose
            width={'70%'}
            maskClosable={false}
            title='Chỉnh sửa'
            cancelText={true}
            centered={true}
            onCancel={onCancel}
            footer={[
                <Button key='back' onClick={() => onCancel()}>
                    Hủy
                </Button>,
                <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
                    Lưu
                </Button>,
            ]}
        >
            <Form
                form={form}
                name='updateform'
                layout='vertical'
                initialValues={{
                    id: formVals?.id as string,
                    examInfo: formVals.examInfo as ExamAPModel[],
                    sex: formVals.sex as string,
                    school: formVals.school as string,
                    class: formVals.class as string,
                    lastName: formVals.lastName as string,
                    typeIDCard: formVals.typeIDCard as string,
                    idCardNumber: formVals.idCardNumber as string,
                    firstName: formVals.firstName as string,
                    sbd: formVals.sbd as string,
                    phone: formVals.phone as string,
                    parentPhone: formVals.parentPhone as string,
                    email: formVals.email as string,
                    birthday: moment(formVals.birthday, dateFormat),
                }}
            >
                <Divider orientation='left' style={{ marginTop: '-15px' }}>Thông tin cá nhân</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label='Họ'
                            name='firstName'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập tên lịch thi' />
                        </Form.Item>
                        <Form.Item
                            label='Ngày sinh'
                            name='birthday'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value) {
                                            throw new Error('Không được để trống');
                                        }
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} format={dateFormat} />
                        </Form.Item>
                        <Form.Item
                            label='Loại giấy tờ đăng ký dự thi'
                            name='typeIDCard'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Select placeholder={'Chọn'}>
                                <Select.Option key={typeIdCard.CMND}>CMND</Select.Option>
                                <Select.Option key={typeIdCard.CCCD}>CCCD</Select.Option>
                                <Select.Option key={typeIdCard.Passport}>Passport</Select.Option>
                                <Select.Option key={typeIdCard.DinhDanh}>DinhDanh</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Địa chỉ email'
                            name='email'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập tên lịch thi' />
                        </Form.Item>
                        <Form.Item
                            label='Trường'
                            name='school'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập tên lịch thi' />
                        </Form.Item>
                        <Form.Item
                            label='Số điện thoại phụ huynh'
                            name='parentPhone'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                        >
                            <Input placeholder='Nhập số điện thoại phụ huynh' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Tên đệm'
                            name='lastName'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập tên' />
                        </Form.Item>
                        <Form.Item
                            label='Giới tính'
                            name='sex'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value={'man'}>Nam</Radio>
                                <Radio value={'woman'}>Nữ</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item
                            label='Số giấy tờ'
                            name='idCardNumber'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập giấy tờ' />
                        </Form.Item>
                        <Form.Item
                            label='Số điện thoại'
                            name='phone'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập giấy tờ' />
                        </Form.Item>
                        <Form.Item
                            label='Lớp'
                            name='class'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value || value.trim() === '') {
                                            throw new Error('Không được để trống');
                                        } else if (value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập tên Lớp' />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation='left'>Thông tin dự thi</Divider>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            label='Số báo danh (AP ID)'
                            name='sbd'
                            labelAlign='left'
                        >
                            <Input placeholder='Nhập số báo danh' />
                        </Form.Item>
                    </Col>
                    <Table
                        style={{ width: '100%' }}
                        rowKey='id'
                        size='small'
                        columns={columns}
                        dataSource={formVals.examInfo}
                        loading={loading}
                        pagination={false}
                    />
                </Row>
            </Form>
        </Modal>
    )
}

export default UpdateForm;
