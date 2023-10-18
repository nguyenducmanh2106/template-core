import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch, Select, TimePicker } from 'antd';
import { SelectOptionModel } from '@/apis/models/data';
import { TimeReciveApplicationModel } from '@/apis';

interface CreateFormProps {
    visible: boolean;
    values?: Partial<TimeReciveApplicationModel>;
    headQuarter: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: Omit<TimeReciveApplicationModel, 'id'>, form: FormInstance) => void;
    onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
    const { visible, values, headQuarter, onSubmit, onSubmitLoading, onCancel } = props;

    const formVals: Omit<TimeReciveApplicationModel, 'id'> = {
        headerQuarterId: values?.headerQuarterId as string,
        weekdays: values?.weekdays as string,
        weekend: values?.weekend as string,
    };
    const [valuesShow, setChecksShow] = useState<boolean>(true);

    const [form] = Form.useForm();

    const checksShow = (e: boolean) => {
        setChecksShow(e);
    };
    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            fieldsValue.weekdays = fieldsValue.weekdays.format("HH:mm")
            fieldsValue.weekend = fieldsValue.weekend.format("HH:mm")
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };
    const [value, setValue] = useState<string | undefined>(undefined);

    const onChange = (newValue: string) => {
        setValue(newValue);
    };
    return (
        <Modal
            destroyOnClose
            width={'40%'}
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
                labelCol={{ span: 8 }}
                initialValues={{
                    history: formVals.headerQuarterId,
                    isShow: formVals.weekdays,
                    maxRegistry: formVals?.weekend,
                }}
            >
                <Form.Item
                    label='Chọn trụ sở'
                    name='headerQuarterId'
                    labelAlign='left'
                    wrapperCol={{ span: 12 }}
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
                    <Select options={headQuarter}></Select>
                </Form.Item>
                <Form.Item
                    label='Chọn giờ ngày trong tuần'
                    name='weekdays'
                    labelAlign='left'
                    wrapperCol={{ span: 12 }}
                    rules={[
                        {
                            required: true,
                            validator: async (rule, value) => {
                                if (value === '' || !value) {
                                    throw new Error('Không được để trống');
                                }
                                if (value != undefined && value.length > 255) {
                                    throw new Error('Nhập không quá 255 ký tự');
                                }
                            },
                        },
                    ]}
                >
                    <TimePicker format={'HH:mm'} />
                </Form.Item>
                <Form.Item
                    label='Chọn giờ ngày thứ 7'
                    name='weekend'
                    labelAlign='left'
                    wrapperCol={{ span: 12 }}
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
                    <TimePicker format={'HH:mm'} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateForm;
