import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Select, DatePicker, Col, Row, Upload, Radio, Divider, UploadProps } from 'antd';
import { BlacklistModel, DecisionBlacklistModel } from '@/apis';
import TextArea from 'antd/lib/input/TextArea';
import { formProcess, typeOfDecision } from '@/utils/constants';
import { SelectOptionModel } from '@/apis/models/data';
import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
import { base64toBlob } from '@/utils/convert';
import { RcFile } from 'antd/lib/upload';

interface CreateFormProps {
    visible: boolean;
    values?: Partial<BlacklistModel>;
    resonBlacklist: SelectOptionModel[];
    examOption: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: any, form: FormInstance) => void;
    onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
    const { visible, values, resonBlacklist, examOption, onSubmit, onSubmitLoading, onCancel } = props;
    const [fileFile, setFileFile] = useState<Blob>();
    const formVals: Omit<BlacklistModel, 'id'> = {
        // name: values?.name as string,
        // isShow: values?.isShow as boolean,
    };

    const [form] = Form.useForm();

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            fieldsValue.fileFile = fileFile;
            if (fieldsValue.examIdBan != undefined)
                fieldsValue.examIdBan = fieldsValue.examIdBan.toString()
            if (checkDecision) {
                fieldsValue.examIdBan = null
                fieldsValue.typeOfDecision = 0
                fieldsValue.isInclude = false
            }
            const decision: DecisionBlacklistModel = {
                decisionNumber: fieldsValue.decisionNumber,
                decisionDate: fieldsValue.decisionDate,
                endDate: fieldsValue.endDate,
                examIdBan: fieldsValue.examIdBan,
                formProcess: fieldsValue.formProcess,
                note: fieldsValue.note,
                startDate: fieldsValue.startDate,
                fileFile: fieldsValue.fileFile,
                status: 0
            }
            var formData = {
                FullName: fieldsValue.fullName,
                Sex: fieldsValue.sex,
                DateOfBirth: moment(fieldsValue.dateOfBirth).format("YYYY/MM/DD HH:mm:ss"),
                IDNumberCard: fieldsValue.idNumberCard,
                TypeIdCard: fieldsValue.typeIdCard,
                Target: fieldsValue.target,
                IsInclude: fieldsValue.isInclude,
                ExamId: fieldsValue.examId,
                IsAutoFill: false,
                DecisionNumber: decision.decisionNumber,
                DecisionDate: fieldsValue.decisionDate != null ? moment(fieldsValue.decisionDate).format("YYYY/MM/DD HH:mm:ss") : null,
                StartDate: fieldsValue.startDate != null ? moment(fieldsValue.startDate).format("YYYY/MM/DD HH:mm:ss") : null,
                EndDate: fieldsValue.endDate != null ? moment(fieldsValue.endDate).format("YYYY/MM/DD HH:mm:ss") : null,
                FormProcess: decision.formProcess,
                ExamIdBan: decision.examIdBan,
                Note: decision.note,
                FileFile: decision.fileFile,
                Reason: decision.reason,
            }
            onSubmit(formData, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };
    const [formProcessValue, setFormProcessValue] = useState<number>(formProcess.waitExamine);
    const [typeOfDecisionValue, setTypeOfDecisionValue] = useState<number>(typeOfDecision.Other);
    const [checkDecision, setCheckDecision] = useState<boolean>(false);
    const fileUpload: UploadProps = {
        name: 'file',
        async onChange(info) {
            setFileFile(info.file.originFileObj as RcFile)
        },
    };
    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const onChangeFormProcess = (newValue: number) => {
        setFormProcessValue(newValue);
        if (newValue == formProcess.permanentlyBanned)
            setCheckDecision(true)
        else
            setCheckDecision(false)
    };
    const onChangeTypeOfDecision = (newValue: number) => {
        setTypeOfDecisionValue(newValue);
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
                labelCol={{ span: 8 }}
                initialValues={{
                    fullName: formVals.fullName,
                    sex: formVals.sex,
                    dateOfBirth: moment(formVals.dateOfBirth),
                    idNumberCard: formVals.idNumberCard,
                    typeIdCard: formVals.typeIdCard,
                    examId: formVals.examId,
                    target: formVals.target,
                }}
            >
                <Divider orientation='left'>Thông tin cá nhân</Divider>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label='Họ và tên'
                            name='fullName'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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
                            <Input placeholder='Nhập họ và tên' />
                        </Form.Item>
                        <Form.Item
                            label='Loại giấy tờ'
                            name='typeIdCard'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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
                            <Select>
                                <Select.Option key={1}>CMND</Select.Option>
                                <Select.Option key={2}>CCCD</Select.Option>
                                <Select.Option key={3}>Hộ chiếu</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Đối tượng'
                            name='target'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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
                            <Select>
                                <Select.Option key={1}>Thí sinh</Select.Option>
                                <Select.Option key={2}>Giám thị</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Ngày sinh'
                            name='dateOfBirth'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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
                            <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                        </Form.Item>
                        <Form.Item
                            label='Số giấy tờ'
                            name='idNumberCard'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value != undefined && value.length > 255) {
                                            throw new Error('Nhập không quá 255 ký tự');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Input placeholder='Nhập số giấy tờ' />
                        </Form.Item>
                        <Form.Item
                            label='Giới tính'
                            name='sex'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                            rules={[
                                {
                                    required: true,
                                    validator: async (rule, value) => {
                                        if (value === '' || !value) {
                                            throw new Error('Hãy chọn giới tính');
                                        }
                                    },
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value={'Male'}>Nam</Radio>
                                <Radio value={'Female'}>Nữ</Radio>
                            </Radio.Group>
                        </Form.Item>

                    </Col>
                </Row>
                <Divider orientation='left'>Thông tin quyết định blacklist</Divider>
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
                                        if (checkDecision && value == undefined) {
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
                            <Select value={typeOfDecisionValue} onChange={onChangeTypeOfDecision}>
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
                            name='decisionDate'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
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

                    <Upload {...fileUpload} showUploadList={true}>
                        <Button icon={<UploadOutlined />} >Chọn file</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateForm;
