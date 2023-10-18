import React, { ReactElement, useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch, Select, Tabs, DatePicker, Space } from 'antd';
import { SelectOptionModel } from '@/apis/models/data';
import TextArea from 'antd/lib/input/TextArea';
import moment, { Moment } from 'moment';
import { RangeValue } from 'rc-picker/lib/interface';
import { ResonBlacklistModel } from '@/apis';

interface CreateFormProps {
    visible: boolean;
    onSubmitLoading: boolean;
    onSubmit: (values: Omit<ResonBlacklistModel, 'id'>, form: FormInstance) => void;
    onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
    const { visible,  onSubmit, onSubmitLoading, onCancel } = props;

    const formVals: Omit<ResonBlacklistModel, 'id'> = {};

    const [form] = Form.useForm();

    const changeV = (newValue: string) => { };

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };

    const [tabsActive, setTabsActive] = useState<number>(1);

    const onChange = (key: string) => {
        if (key == '1') {
            setTabsActive(1);
        } else {
            setTabsActive(2);
        }
    };

    return (
        <Modal
            destroyOnClose
            width={'30%'}
            maskClosable={false}
            title='Thêm mới'
            open={visible}
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
                name='createform'
                labelCol={{ span: 6 }}
                initialValues={{
                    // name: formVals?.name,

                    status: formVals.status,
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
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateForm;
