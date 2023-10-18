import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Select, TreeSelect, Checkbox, DatePicker, Switch, InputNumber, Col, Row } from 'antd';
import TableForm from '@/components/TableForm/TableForm';
import { TestScoreModel } from '@/apis';

interface CreateFormProps {
    visible: boolean;
    values?: Partial<TestScoreModel>;
    onSubmitLoading: boolean;
    onSubmit: (values: Omit<TestScoreModel, 'id'>, form: FormInstance) => void;
    onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
    const { visible, values, onSubmit, onSubmitLoading, onCancel } = props;

    const formVals: Omit<TestScoreModel, 'id'> = {
        firstName: values?.firstName as string,
        lastName: values?.lastName as string,
        dob: values?.dob as string,
        idOrPassport: values?.idOrPassport as string,
        listening: values?.listening as number,
        reading: values?.reading as number,
        total: values?.total as number,
        testDate: values?.testDate as string,
        formCode: values?.lastName as string,
    };
    const [valuesShow, setChecksShow] = useState<boolean>(true);

    const [form] = Form.useForm();

    const checksShow = (e: boolean) => {
        setChecksShow(e);
    };
    const onFinish = async () => {
        try {
            console.log('formVals', formVals);
            const fieldsValue = await form.validateFields();
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
            width={'50%'}
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
                layout='vertical'
                initialValues={{
                    firstName: formVals.firstName,
                    lastName: formVals.lastName,
                    dob: formVals.dob,
                    idOrPassport: formVals.idOrPassport,
                    listening: formVals.listening,
                    reading: formVals.reading,
                    total: formVals.total,
                    testDate: formVals.testDate,
                    formCode: formVals.lastName,
                }}
            >
                <Row gutter={18}>
                    <Col span={12}>
                        <Form.Item
                            label='Họ và tên đệm'
                            name='firstName'
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
                            <Input placeholder='Nhập họ và tên đệm' />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label='Tên thí sinh'
                            name='lastName'
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
                            <Input placeholder='Nhập tên thí sinh' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Số giấy tờ'
                            name='idOrPassport'
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
                            <Input placeholder='Nhập mã giấy tờ' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Ngày sinh'
                            name='dob'
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
                            <DatePicker />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Mã đề'
                            name='formCode'
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
                            <Input placeholder='Nhập tên hiển thị' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Ngày thi'
                            name='testDate'
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
                            <DatePicker />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label='Điểm nghe'
                            name='listening'
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
                            <InputNumber placeholder='Điểm nghe' />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label='Điểm đọc'
                            name='reading'
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
                            <InputNumber placeholder='Điểm đọc' />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label='Tổng điểm'
                            name='total'
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
                            <InputNumber placeholder='Tổng điểm' />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default CreateForm;
