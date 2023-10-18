import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Checkbox, TreeSelect, DatePicker, Switch, Select } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ResonBlacklistModel } from '@/apis';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
    visible: boolean;
    values: Partial<ResonBlacklistModel>;
    onSubmitLoading: boolean;
    onSubmit: (values: ResonBlacklistModel, form: FormInstance) => void;
    onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
    const { visible, values, onSubmit, onSubmitLoading, onCancel } = props;
    const onChange = (newValue: boolean) => {
        setValue(newValue);
    };
    const [form] = Form.useForm();
    const formVals: ResonBlacklistModel = {
        id: values.id,
        status: values.status,
        name: values.name,
        note: values.note,
    };
    console.log(formVals)
    const [value, setValue] = useState<boolean>(formVals.status as boolean);

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            fieldsValue.status = value;
            form.resetFields();
            onSubmit({ ...formVals, ...fieldsValue }, form);
            
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };

    return (
        <Modal
            destroyOnClose
            width={'30%'}
            maskClosable={false}
            title='Sửa'
            open={visible}
            onCancel={() => onCancel()}
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
                name='editform'
                labelCol={{ span: 6 }}
                initialValues={{
                    name: formVals?.name,
                    status: formVals.status,
                    note: formVals.note,
                }}
            >
                <Form.Item
                    label='Tên lý do'
                    name='name'
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
                    <Input placeholder='Nhập tên' />
                </Form.Item>
                <Form.Item
                    label='Ghi chú'
                    name='note'
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
                    <Input placeholder='Nhập ghi chú' />
                </Form.Item>
                <Form.Item
                    label='Hiển thị'
                    name='status'
                    labelAlign='left'
                    wrapperCol={{ span: 12 }}

                >
                    <Switch checked={value} onChange={(e) => onChange(e)} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateForm;
