import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select, message, Input, DatePicker, Spin, Typography } from 'antd';
import { Code, ResponseData, RoleModel, UserModel, UserReceiveEmailTestModel } from '@/apis';
import dayjs from 'dayjs';
import { getUserById, postUser, putUser } from '@/apis/services/UserService';
import moment from 'moment';
import { SelectOptionModel } from '@/apis/models/data';
import { putUserReceiveEmailTest } from '@/apis/services/UserReceiveEmailTestService';
import { sendMailTestCandidates } from '@/apis/services/DividingRoomService';
import { ExamRoomDividedModel } from '@/apis/models/ExamRoomDividedModel';
const { Text } = Typography;
interface Props {
    open: boolean;
    candidateInfo: ExamRoomDividedModel;
    userReceiveMails: SelectOptionModel[];
    setOpen: (value: boolean) => void;
}
const SendMailTestComponent: React.FC<Props> = ({ open, setOpen, userReceiveMails, candidateInfo }) => {
    // console.log(userReceiveMails)
    const [searchForm] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalButtonOkText, setModalButtonOkText] = useState('Xác nhận gửi');

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = async () => {
        const fieldsValue = await searchForm.validateFields();
        setModalButtonOkText('Đang gửi...');
        setConfirmLoading(true);
        searchForm.resetFields()

        const objBody = {
            ...fieldsValue,
        }
        // console.log(objBody.ContactReceiveMails)
        // return

        const response = await sendMailTestCandidates("", candidateInfo.id, objBody.ContactReceiveMails);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            setOpen(false);
            setConfirmLoading(false);
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

            <Modal title="Gửi email test" open={open} okText={modalButtonOkText} cancelText="Hủy bỏ" width={600}
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
                        // ["ContactReceiveMails"]: null,
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Tên thí sinh'} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name='CandidateName'>
                                <Text strong>{candidateInfo?.candidateName ?? ""}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Số báo danh'} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name='CandidateNumber'>
                                <Text strong>{candidateInfo?.candidateNumber ?? ""}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Ngày sinh'} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name='CandidateBirthday'>
                                <Text strong>{candidateInfo?.candidateBirthday != null ? dayjs(candidateInfo?.candidateBirthday).format("DD/MM/YYYY") : ""}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Điện thoại'} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name='CandidatePhone'>
                                <Text strong>{candidateInfo?.candidatePhone ?? ""}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={'Liên hệ nhận mail'}
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                name='ContactReceiveMails'
                                rules={[{ required: true }]}
                            >
                                <Select
                                    mode="multiple"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn liên hệ' options={userReceiveMails} onChange={() => { }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default SendMailTestComponent;