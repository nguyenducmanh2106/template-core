import React, { ReactElement, useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment, { Moment } from 'moment';
import { RangeValue } from 'rc-picker/lib/interface';
import { HoldPositionModel } from '@/apis';

interface CreateFormProps {
    visible: boolean;
    values: Partial<HoldPositionModel>;
    onSubmit: (values: HoldPositionModel, form: FormInstance) => void;
    onCancel: () => void;
}

const UpdateFormHold: React.FC<CreateFormProps> = (props) => {
    const { visible, onSubmit, onCancel, values } = props;

    const formVals: HoldPositionModel = {
        id: values.id,
        examCalendarId: values.examCalendarId,
        name: values.name,
        note: values.note,
        quantity: values.quantity,
        status: values.status as boolean
    };
    const [valuesShow, setChecksShow] = useState<boolean>(formVals.status as boolean);

    const [form] = Form.useForm();
    useEffect(() => {
        form.setFieldsValue(props.values)
        setChecksShow(props.values.status as boolean)
    }, [props.values]);
    const checksShow = (e: boolean) => {
        setChecksShow(e);
    };
    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            fieldsValue.status = valuesShow
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };

    return (
        <Modal
            destroyOnClose
            centered
            width={'30%'}
            maskClosable={false}
            title='Chỉnh sửa'
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key='back' onClick={() => onCancel()}>
                    Hủy
                </Button>,
                <Button key='submit' type='primary' htmlType='submit' onClick={() => onFinish()}>
                    Lưu
                </Button>,
            ]}
        >
            <Form
                form={form}
                name='updateform'
                labelCol={{ span: 6 }}
                initialValues={{
                    name: formVals?.name,
                    quantity: formVals?.quantity as number,
                    status: formVals.status as boolean,
                    note: formVals.note
                }}
            >
                <Form.Item
                    label='Đơn vị giữ chỗ'
                    name='name'
                    labelAlign='left'
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
                    <Input placeholder='Nhập đơn vị' />
                </Form.Item>

                <Form.Item
                    label='Số lượng'
                    name='quantity'
                    labelAlign='left'
                    rules={[
                        {
                            required: true,
                            validator: async (rule, value) => {
                                if (value === '' || !value) {
                                    throw new Error('Không được để trống');
                                } else if (value.length > 255) {
                                    throw new Error('Nhập không quá 255 ký tự');
                                }
                            },
                        },
                    ]}
                >
                    <Input placeholder='Nhập số lượng' type='number' />
                </Form.Item>
                <Form.Item
                    label='Ghi chú'
                    name='note'
                    labelAlign='left'
                    rules={[
                        {
                            required: false,
                            validator: async (rule, value) => {
                                if (value !== '' && value != undefined && value.length > 1000) {
                                    throw new Error('Nhập không quá 1000 ký tự');
                                }
                            },
                        },
                    ]}
                >
                    <TextArea rows={2} placeholder='Ghi chú' />
                </Form.Item>
                <Form.Item
                    label='Trạng thái'
                    name='status'
                    labelAlign='left'
                    wrapperCol={{ span: 12 }}
                >
                    <Switch checked={valuesShow} onClick={(e) => checksShow(e)} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateFormHold;
