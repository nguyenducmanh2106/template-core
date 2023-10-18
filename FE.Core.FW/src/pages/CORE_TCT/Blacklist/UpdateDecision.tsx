import React, { useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Select, DatePicker, Col, Row, Upload, Radio, Divider } from 'antd';
import { DecisionBlacklistModel, ResonBlacklistModel } from '@/apis';
import TextArea from 'antd/lib/input/TextArea';
import { formProcess, typeOfDecision } from '@/utils/constants';
import { SelectOptionModel } from '@/apis/models/data';
import moment from 'moment';

interface UpdateFormProps {
    visible: boolean;
    values?: Partial<DecisionBlacklistModel>;
    resonBlacklist: SelectOptionModel[];
    blacklistId?: string;
    examOption: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: DecisionBlacklistModel, form: FormInstance) => void;
    onApprove: (id: string, approve: boolean, note?: string) => void;
    onCancel: () => void;
}

const UpdateDecision: React.FC<UpdateFormProps> = (props) => {
    const { visible, values, resonBlacklist, examOption, onSubmit, onApprove, onSubmitLoading, onCancel } = props;

    const formVals: DecisionBlacklistModel = {
        blacklistId: values?.blacklistId as string,
        id: values?.id,
        decisionDate: values?.decisionDate,
        decisionNumber: values?.decisionNumber,
        endDate: values?.endDate,
        examIdBan: values?.examIdBan,
        formProcess: values?.formProcess,
        note: values?.note,
        reason: values?.reason,
        startDate: values?.startDate,
        status: values?.status,
        isInclude: values?.isInclude,
        typeOfDecision: values?.typeOfDecision
    };

    const [form] = Form.useForm();
    const [typeOfDecisionValue, setTypeOfDecisionValue] = useState<number>(values?.typeOfDecision as number);
    useEffect(() => {
        form.setFieldValue('blacklistId', values?.blacklistId as string)
        form.setFieldValue('id', values?.id as string)
        form.setFieldValue('decisionDate', values?.decisionDate != null ? moment(values?.decisionDate) : undefined)
        form.setFieldValue('endDate', values?.endDate != null ? moment(values?.endDate) : undefined)
        form.setFieldValue('startDate', values?.startDate != null ? moment(values?.startDate) : undefined)
        form.setFieldValue('examIdBan', values?.examIdBan?.toString() as string)
        form.setFieldValue('decisionNumber', values?.decisionNumber as string)
        form.setFieldValue('note', values?.note as string)
        form.setFieldValue('reason', values?.reason as string)
        form.setFieldValue('status', values?.status?.toString())
        form.setFieldValue('formProcess', values?.formProcess?.toString())
        form.setFieldValue('isInclude', values?.isInclude)
        form.setFieldValue('typeOfDecision', values?.typeOfDecision?.toString())
        setTypeOfDecisionValue(values?.typeOfDecision as number)
        setCheckDecision(values?.formProcess == formProcess.permanentlyBanned)
        setFormProcessValue(values?.formProcess as number)
    }, [props.values]);
    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            if (fieldsValue.examIdBan != null)
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
    const [formProcessValue, setFormProcessValue] = useState<number>(values?.typeOfDecision as number);
    const [checkDecision, setCheckDecision] = useState<boolean>(values?.formProcess == formProcess.permanentlyBanned);

    const onChangeTypeOfDecision = (newValue: number) => {
        setTypeOfDecisionValue(newValue);
    };

    const onChangeFormProcess = (newValue: number) => {
        setFormProcessValue(newValue);
        if (newValue == formProcess.permanentlyBanned)
            setCheckDecision(true)
        else
            setCheckDecision(false)
    };
    var showAlert = true;
    var note = '';
    const onChange = (e: any) => {
        note = (e.target.value)
    }
    const { confirm } = Modal;
    const showConfirmDuyet = () => {
        confirm({
            title: 'Bạn có chắc chắn duyệt quyết định này ?',
            centered: true,
            onOk() {
                onApprove(values?.id as string, true);
            },
            okText: 'Duyệt',
            cancelText: 'Hủy',
            onCancel() {
                console.log('');
            },
        });
    };
    const showConfirmTuChoi = () => {
        confirm({
            title: 'Bạn có chắc chắn từ chối quyết định này ?',
            centered: true,
            onOk() {
                if (note.length == 0) {
                    showAlert = false;
                    showConfirmTuChoi()
                }
                else
                    onApprove(values?.id as string, false, note)
            },
            content: <>
                <TextArea onChange={onChange} required={true} rows={4} placeholder="Lý do từ chối" maxLength={1000} />
                <label hidden={showAlert} style={{ color: 'red' }}>* Hãy nhập lý do</label>
            </>,
            okText: 'Từ chối',
            cancelText: 'Hủy',
            onCancel() {
                console.log('');
            },
        });
    };
    return (
        <Modal
            destroyOnClose
            width={'40%'}
            maskClosable={false}
            title='Xem'
            centered={true}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key='back' onClick={() => onCancel()}>
                    Hủy
                </Button>,
                <Button key='save' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
                    Lưu
                </Button>,
                <Button key='deny' style={{ backgroundColor: '#C92117', color: 'white' }} type='default' htmlType='submit' loading={onSubmitLoading} onClick={() => showConfirmTuChoi()}>
                    Từ chối
                </Button>,
                <Button key='accept' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => showConfirmDuyet()}>
                    Duyệt
                </Button>,
            ]}
        >
            <Form
                form={form}
                name='updateDecision'
                labelCol={{ span: 8 }}
                initialValues={{
                    decisionNumber: formVals.decisionNumber,
                    decisionDate: formVals.decisionDate != null ? moment(formVals.decisionDate) : null,
                    startDate: formVals.startDate != null ? moment(formVals.startDate) : null,
                    endDate: formVals.endDate != null ? moment(formVals.endDate) : null,
                    reason: formVals.reason,
                    formProcess: formVals.formProcess?.toString(),
                    examIdBan: formVals.examIdBan?.split(','),
                    note: formVals.note,
                    typeOfDecision: formVals.typeOfDecision?.toString()
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
                            name='startDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}

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
                            <Select placeholder={'Chọn bài thi'} options={resonBlacklist}></Select>
                        </Form.Item>
                        <Form.Item
                            label='Loại cấm bài thi'
                            name='typeOfDecision'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            hidden={checkDecision}
                            wrapperCol={{ span: 18 }}
                        >
                            <Select value={formProcessValue} onChange={onChangeTypeOfDecision}>
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
                            hidden={typeOfDecisionValue == typeOfDecision.AllOfTest || checkDecision || formProcessValue == formProcess.resultCancel}
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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
                            label='Ngày hết hiệu lực'
                            name='endDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                        </Form.Item>
                        <Form.Item
                            label='Hình thức xử lý'
                            name='formProcess'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: checkDecision,
                                    validator: async (rule, value) => {
                                        if (checkDecision && (value != undefined && value.length == 0)) {
                                            throw new Error('Hãy chọn hình thức');
                                        }
                                    },
                                },
                            ]}
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
                <label><Button
                    type='link'
                // loading={detailUpdateLoading.includes(record.blacklistId || '')}
                // onClick={() => detailBlacklistData(record.blacklistId || '')}
                >
                    {values?.filePath}
                </Button></label>
            </Form>
        </Modal>
    );
};

export default UpdateDecision;
