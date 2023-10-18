import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Checkbox, TreeSelect, DatePicker, Switch, Select, TimePicker } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { TimeFrameInDayModel } from '@/apis/models/TimeFrameInDayModel';
import { SelectOptionModel } from '@/apis/models/data';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import { TimeReciveApplicationModel } from '@/apis';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
    visible: boolean;
    values: Partial<TimeReciveApplicationModel>;
    headQuarter: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: TimeReciveApplicationModel, form: FormInstance) => void;
    onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
    const { visible, values, headQuarter, onSubmit, onSubmitLoading, onCancel } = props;
    var treeData: ITreeRouter[] = [];
    const [value, setValue] = useState<string | undefined>(undefined);
    const onChange = (newValue: string) => {
        setValue(newValue);
    };
    const format = 'HH:mm';
    const formVals: TimeReciveApplicationModel = {
        id: values.id,
        headerQuarterId: values.headerQuarterId,
        weekdays: values?.weekdays as string,
        weekend: values?.weekend as string,
    };
    const [form] = Form.useForm();

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

    return (
        <Modal
            destroyOnClose
            width={'45%'}
            maskClosable={false}
            title='Sửa'
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
                name='editform'
                labelCol={{ span: 6 }}
                initialValues={{
                    id: formVals.id,
                    headerQuarterId: formVals?.headerQuarterId,
                    weekdays: dayjs(formVals.weekdays, format),
                    weekend: dayjs(formVals.weekend, format),
                }}
            >
                <Form.Item
                    label='Trụ sở'
                    name='headerQuarterId'
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
                    <Select options={headQuarter} ></Select>
                </Form.Item>
                <Form.Item
                    label='Chọn giờ ngày trong tuần'
                    name='weekdays'
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
                    <TimePicker format={'HH:mm'} />
                </Form.Item>
                <Form.Item
                    label='Chọn giờ ngày thú 7'
                    name='weekend'
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
                    <TimePicker format={'HH:mm'} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateForm;
