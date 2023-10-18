import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select, message, Input, DatePicker, Spin, Typography } from 'antd';
import { Code, ResponseData, RoleModel, UserModel, UserReceiveEmailTestModel } from '@/apis';
import dayjs from 'dayjs';
import { getUserById, postUser, putUser } from '@/apis/services/UserService';
import moment from 'moment';
import { SelectOptionModel } from '@/apis/models/data';
import { putUserReceiveEmailTest } from '@/apis/services/UserReceiveEmailTestService';
const { Text } = Typography;
interface Props {
    open: boolean;
    userEdit: UserReceiveEmailTestModel;
    setOpen: (value: boolean) => void;
    reload: (current: number, pageSize: number) => void;
}
const EditUserReceiveMailComponent: React.FC<Props> = ({ open, setOpen, reload, userEdit }) => {
    console.log(userEdit)
    const [searchForm] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalButtonOkText, setModalButtonOkText] = useState('Lưu');
    const statusOption: SelectOptionModel[] = [
        {
            key: 'Active',
            label: 'Hoạt động',
            value: '1',
        },
        {
            key: 'InActive',
            label: 'Ngừng hoạt động',
            value: '2',
        },
    ];

    const languageSendMailOption: SelectOptionModel[] = [
        {
            key: 'VietNam',
            label: 'Tiếng Việt',
            value: 'vi',
        },
        {
            key: 'English',
            label: 'Tiếng Anh',
            value: 'en',
        },
        {
            key: 'Korea',
            label: 'Tiếng Hàn',
            value: 'ko',
        },
    ];
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = async () => {
        const fieldsValue = await searchForm.validateFields();
        setModalButtonOkText('Đang xử lý...');
        setConfirmLoading(true);
        searchForm.resetFields()

        const objBody = {
            ...fieldsValue,
        }
        // console.log(objBody)
        // return

        const response = await putUserReceiveEmailTest(userEdit?.id ?? "", "", objBody);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            setOpen(false);
            setConfirmLoading(false);
            reload(1, 10)
        }
        else {
            setOpen(false);
            setConfirmLoading(false);
            message.error(response.message || "Thất bại")
        }
    };

    const handleCancel = () => {
        searchForm.resetFields()
        setOpen(false);
    };
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

    return (
        <>

            <Modal title="Cập nhật thông tin liên hệ" open={open} okText={modalButtonOkText} cancelText="Hủy bỏ" width={600}
                           /* onOk={onSubmit}*/ style={{ top: 20 }} onCancel={handleCancel}
                confirmLoading={confirmLoading}
                okButtonProps={{ form: 'myFormCreate', htmlType: 'submit' }}
            >
                <Form
                    form={searchForm}
                    name='nest-messages' id="myFormCreate"
                    onFinish={handleOk}
                    validateMessages={validateMessages}
                    initialValues={{
                        ["FullName"]: userEdit?.fullName ?? '',
                        ["Email"]: userEdit?.email ?? '',
                        ["LanguageSendMail"]: userEdit?.languageSendMail ?? '',
                        ["Status"]: userEdit?.status?.toString() ?? '',
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={24}>
                            <Form.Item label={'Họ tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='FullName' rules={[{ required: true }]}>
                                <Input allowClear placeholder='Nhập họ tên' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Email'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Email'
                                rules={[
                                    { required: true },
                                    {
                                        type: 'email',
                                        message: 'Không đúng định dạng email',
                                    },
                                ]}
                            >
                                <Input allowClear placeholder='Nhập email' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={'Ngôn ngữ nội dung mail'}
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                name='LanguageSendMail'
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn địa điểm' options={languageSendMailOption} onChange={() => { }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Trạng thái'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Status' rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn lịch thi' options={statusOption} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default EditUserReceiveMailComponent;