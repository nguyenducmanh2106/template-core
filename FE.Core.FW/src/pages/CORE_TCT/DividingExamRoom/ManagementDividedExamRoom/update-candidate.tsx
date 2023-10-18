import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select, message, Input, DatePicker, Spin, Typography } from 'antd';
import { Code, ResponseData, RoleModel, UserModel } from '@/apis';
import dayjs from 'dayjs';
import moment from 'moment';
import { ExamRoomDividedModel } from '@/apis/models/ExamRoomDividedModel';
import { updateCandidateNumberAndMoveCandidateRoom } from '@/apis/services/DividingExamPlaceService';
import { SelectOptionModel } from '@/apis/models/data';
const { Text } = Typography;
interface Props {
    open: boolean;
    candidateEdit: ExamRoomDividedModel;
    rooms: SelectOptionModel[];
    setOpen: (value: boolean) => void;
    reload: (current?: number, pageSize?: number) => void;
}
const EditCandidate: React.FC<Props> = ({ open, setOpen, reload, candidateEdit, rooms }) => {
    // console.log(candidateEdit)
    const [searchForm] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalButtonOkText, setModalButtonOkText] = useState('Lưu');

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = async () => {
        const fieldsValue = await searchForm.validateFields();
        setModalButtonOkText('Đang xử lý...');
        setConfirmLoading(true);
        searchForm.resetFields()

        const objBody: ExamRoomDividedModel = {
            ...fieldsValue,
        }
        // console.log(objBody)
        // return
        const response = await updateCandidateNumberAndMoveCandidateRoom(candidateEdit.id ?? "", "", objBody);
        if (response.code === Code._200) {
            message.success(response.message || "Cập nhật thành công")
            setOpen(false);
            setConfirmLoading(false);
            reload()
        }
        else {
            setOpen(false);
            setConfirmLoading(false);
            message.error(response.message || "Lỗi hệ thống")
        }
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
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

            <Modal title="Cập nhật số báo danh và phòng thi" open={open} okText={modalButtonOkText} cancelText="Hủy bỏ" width={600}
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
                        ["CandidateNumber"]: candidateEdit.candidateNumber ?? '',
                        ["ExamRoomId"]: candidateEdit.examRoomId ?? '',
                        // ["DOB"]: userEdit.dob ? dayjs(userEdit.dob, "DD/MM/YYYY") : '',
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={12}>
                            <Form.Item labelAlign='left' label={'Họ tên'} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                                <Text strong>{candidateEdit.candidateName}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item labelAlign='left' label={'Ngày sinh'} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                                <Text strong>{candidateEdit.candidateBirthday ? moment(candidateEdit.candidateBirthday).format('DD/MM/YYYY') : ''}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item labelAlign='left' label={'Email'} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                                <Text strong>{candidateEdit.candidateEmail}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item labelAlign='left' label={'Số ĐT'} labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                                <Text strong>{candidateEdit.candidatePhone}</Text>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Số báo danh'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}
                                name='CandidateNumber'
                                rules={[{ required: true }]}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item labelAlign='left' label={'Phòng thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}
                                name='ExamRoomId'
                                rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    allowClear
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Tìm kiếm' options={rooms} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default EditCandidate;