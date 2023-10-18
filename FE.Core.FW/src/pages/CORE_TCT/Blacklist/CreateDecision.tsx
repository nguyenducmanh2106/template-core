import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Select, DatePicker, Col, Row, Upload, Radio, Divider } from 'antd';
import { DecisionBlacklistModel, ResonBlacklistModel } from '@/apis';
import TextArea from 'antd/lib/input/TextArea';
import { formProcess, typeOfDecision } from '@/utils/constants';
import { SelectOptionModel } from '@/apis/models/data';
import moment from 'moment';

interface CreateFormProps {
    visible: boolean;
    values?: Partial<DecisionBlacklistModel>;
    resonBlacklist: SelectOptionModel[];
    blacklistId?: string;
    examOption: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: Omit<DecisionBlacklistModel, 'id'>, form: FormInstance) => void;
    onCancel: () => void;
}

const CreateDecision: React.FC<CreateFormProps> = (props) => {
    const { visible, values, resonBlacklist, examOption, onSubmit, onSubmitLoading, onCancel } = props;

    const formVals: Omit<DecisionBlacklistModel, 'id'> = {
        blacklistId: values?.blacklistId as string,
        decisionDate: values?.decisionDate,
        decisionNumber: values?.decisionNumber,
        endDate: values?.endDate,
        examIdBan: values?.examIdBan,
        formProcess: values?.formProcess,
        note: values?.note,
        reason: values?.reason,
        startDate: values?.startDate,
        status: values?.status,
    };

    const [form] = Form.useForm();

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            if (fieldsValue.examIdBan != undefined)
                fieldsValue.examIdBan = fieldsValue.examIdBan.toString()
            if (checkDecision) {
                fieldsValue.examIdBan = null
                fieldsValue.typeOfDecision = 0
                fieldsValue.isInclude = false
            }
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };
    const [formProcessValue, setFormProcessValue] = useState<number>(formProcess.waitExamine);
    const [typeOfDecisionValue, setTypeOfDecisionValue] = useState<number>(typeOfDecision.Other);
    const [checkDecision, setCheckDecision] = useState<boolean>(false);

    const onChangeFormProcess = (newValue: number) => {
        setFormProcessValue(newValue);
        if (newValue == formProcess.permanentlyBanned)
            setCheckDecision(true)
        else
            setCheckDecision(false)
    };
    return (
        <Modal
            destroyOnClose
            width={'40%'}
            maskClosable={false}
            title='Tạo mới'
            centered={true}
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
                name='createformdecision'
                labelCol={{ span: 8 }}
                initialValues={{
                    decisionNumber: formVals.decisionNumber,
                    decisionDate: moment(formVals.decisionDate),
                    startDate: moment(formVals.startDate),
                    endDate: moment(formVals.endDate),
                    reason: formVals.reason,
                    formProcess: formVals.formProcess,
                    examIdBan: formVals.examIdBan,
                    note: formVals.note,
                    isInclude: formVals.isInclude,
                    typeOfDecision: formVals.typeOfDecision
                }}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label='Số quyết định'
                            name='decisionNumber'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                        >
                            <Input placeholder='Nhập số quyết định' />
                        </Form.Item>
                        <Form.Item
                            label='Ngày hiệu lực'
                            name='decisionDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: checkDecision,
                                    validator: async (rule, value) => {
                                        if (checkDecision && (value != undefined && value.length == 0)) {
                                            throw new Error('Không được để trống');
                                        }
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                        </Form.Item>
                        <Form.Item
                            label='Lý do dừng đăng ký'
                            name='reason'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: checkDecision,
                                    validator: async (rule, value) => {
                                        if (checkDecision && (value != undefined && value.length == 0)) {
                                            throw new Error('Không được để trống');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Select placeholder={'Chọn'} options={resonBlacklist}></Select>
                        </Form.Item>
                        <Form.Item
                            label='Loại cấm bài thi'
                            name='typeOfDecision'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            hidden={checkDecision}
                            wrapperCol={{ span: 18 }}
                        >
                            <Select value={typeOfDecisionValue}>
                                <Select.Option key={typeOfDecision.Other}>Khác</Select.Option>
                                <Select.Option key={typeOfDecision.AllOfTest}>Tất cả</Select.Option>
                                <Select.Option key={typeOfDecision.AllOfEngTest}>Tất cả bài thi tiếng anh</Select.Option>
                                <Select.Option key={typeOfDecision.AllOfITTest}>Tất cả bài thi tin học</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Bao gồm hoặc loại trừ các bài thi trong danh sách'
                            name='isInclude'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            hidden={typeOfDecisionValue == typeOfDecision.AllOfTest || checkDecision || formProcessValue == formProcess.resultCancel}
                        >
                            <Radio.Group>
                                <Radio defaultChecked value={true}>Bao gồm</Radio>
                                <Radio value={false}>Loại trừ</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Ngày quyết định'
                            name='startDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: checkDecision,
                                    validator: async (rule, value) => {
                                        if (checkDecision && (value != undefined && value.length == 0)) {
                                            throw new Error('Không được để trống');
                                        }
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                        </Form.Item>
                        <Form.Item
                            label='Ngày hết hiệu lực'
                            name='endDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: checkDecision,
                                    validator: async (rule, value) => {
                                        if (checkDecision && (value != undefined && value.length == 0)) {
                                            throw new Error('Không được để trống');
                                        }
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                        </Form.Item>
                        <Form.Item
                            label='Hình thức xử lý'
                            name='formProcess'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                        >
                            <Select value={formProcessValue} onChange={onChangeFormProcess}>
                                <Select.Option key={formProcess.other}>Khác</Select.Option>
                                <Select.Option key={formProcess.resultCancel}>Hủy kết quả</Select.Option>
                                <Select.Option key={formProcess.banTest}>Tạm dừng ĐK</Select.Option>
                                <Select.Option key={formProcess.permanentlyBanned}>Cấm thi vĩnh viễn</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Bài thi'
                            name='examIdBan'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            hidden={typeOfDecisionValue == typeOfDecision.AllOfTest || checkDecision}
                        >
                            <Select mode='multiple' placeholder={'Chọn bài thi'} options={examOption}></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    label='Ghi chú'
                    name='note'
                    labelAlign='left'
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 18 }}
                    rules={[
                        {
                            required: false,
                            validator: async (rule, value) => {
                                if (value != undefined && value.length > 1000) {
                                    throw new Error('Nhập không quá 1000 ký tự');
                                }
                            },
                        },
                    ]}
                >
                    <TextArea rows={4} placeholder='Lý do chi tiết' />
                </Form.Item>
                <Form.Item
                    label='File đính kèm'
                    name='filePath'
                    labelAlign='left'
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 18 }}
                >
                    {/* <UploadFile isOnlyExcel={false} /> */}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateDecision;
