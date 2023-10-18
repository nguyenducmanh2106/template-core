import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, DatePicker, Col, Row, Select, Radio, Divider, Table } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { BlacklistModel, BlacklistShowModel } from '@/apis/models/BlacklistModel';
import { SelectOptionModel } from '@/apis/models/data';
import { Code, DecisionBlacklistModel, ResonBlacklistModel, ResponseData } from '@/apis';
import { ColumnsType } from 'antd/lib/table';
import CreateDecision from './CreateDecision';
import { approveBlacklist, getDecisionBlacklist, postDecisionBlacklist, putDecisionBlacklist } from '@/apis/services/DecisionBlacklistService';
import { convertStatusDecision } from '@/utils/convert';
import UpdateDecision from './UpdateDecision';
import { typeIdCard } from '@/utils/constants';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
    visible: boolean;
    values: Partial<BlacklistShowModel>;
    resonBlacklist: SelectOptionModel[];
    examOption: SelectOptionModel[];
    onSubmitLoading: boolean;
    onSubmit: (values: BlacklistModel, form: FormInstance) => void;
    onCancel: () => void;
}
var updateData: DecisionBlacklistModel = {};
const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
    const { visible, values, resonBlacklist, examOption, onSubmit, onSubmitLoading, onCancel } = props;
    const [value, setValue] = useState<string | undefined>(undefined);
    const [decisionDataT, setDecisionDataT] = useState<DecisionBlacklistModel[]>(values.decisionBlackLists as DecisionBlacklistModel[]);
    const [createDecisionVisible, setCreateDecisionVisible] = useState<boolean>(false);
    const [updateDecisionVisible, setUpdateDecisionVisible] = useState<boolean>(false);
    const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
    const [updateSubmitLoading, setUpdateSubmitLoading] = useState<boolean>(false);
    const [detailLoading, setUpdateLoading] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const onChange = (newValue: string) => {
        setValue(newValue);
    };
    const detailData = async (data: DecisionBlacklistModel) => {
        setUpdateLoading([data.id as string]);
        setUpdateDecisionVisible(true)
        updateData = data;
        setUpdateLoading([]);
    };

    const closeForm = async (): Promise<void> => {
        updateData = {}
        setUpdateDecisionVisible(false);
    };

    const updateSubmit = async (value: Omit<DecisionBlacklistModel, 'id'>, form: FormInstance) => {
        setUpdateSubmitLoading(true);
        value.blacklistId = values.id;
        const res = await putDecisionBlacklist(undefined, value);
        if (res.code == Code._200) {
            message.success('Thành công !');
            form.resetFields();
            setUpdateDecisionVisible(false);
            const getDecisionRes: ResponseData = await getDecisionBlacklist(values.id as string)
            setDecisionDataT(getDecisionRes.data as DecisionBlacklistModel[])
        } else {
            message.error(res.message);
        }
        setUpdateSubmitLoading(false);
    };

    const createSubmit = async (value: Omit<DecisionBlacklistModel, 'id'>, form: FormInstance) => {
        setCreateSubmitLoading(true);
        value.blacklistId = values.id;
        const res = await postDecisionBlacklist(undefined, value);
        if (res.code == Code._200) {
            message.success('Thành công !');
            form.resetFields();
            setCreateDecisionVisible(false);
            const getDecisionRes: ResponseData = await getDecisionBlacklist(values.id as string)
            setDecisionDataT(getDecisionRes.data as DecisionBlacklistModel[])
        } else {
            message.error(res.message);
        }
        setCreateSubmitLoading(false);
    };
    const approve = async (id: string, approve: boolean, note?: string) => {
        const res = await approveBlacklist(id, approve, note);
        if (res.code == Code._200) {
            message.success('Thành công !');
            setUpdateDecisionVisible(false);
        } else {
            message.error(res.message);
        }
    };
    const formVals: BlacklistShowModel = {
        id: values.id,
        fullName: values.fullName,
        sex: values.sex,
        dateOfBirth: values.dateOfBirth,
        typeIdCard: values.typeIdCard,
        idNumberCard: values.idNumberCard,
        examId: values.examId,
        target: values.target,
        decisionBlackLists: values.decisionBlackLists,
        isAutoFill: values.isAutoFill
    };
    const [form] = Form.useForm();
    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            fieldsValue.dateOfBirth = moment(fieldsValue.dateOfBirth).add(7, 'hours');
            onSubmit({ ...formVals, ...fieldsValue }, form);
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };

    const columns: ColumnsType<DecisionBlacklistModel> = [
        {
            title: 'Số quyết định',
            dataIndex: 'decisionNumber',
            key: 'decisionNumber',
            render: (_, record) => <span>{record.decisionNumber}</span>,
        },
        {
            title: 'Ngày quyết định',
            key: 'decisionDate',
            dataIndex: 'decisionDate',
            render: (_, record) => <span>{record.decisionDate != null ? dayjs(record.decisionDate).format('DD-MM-YYYY'): null}</span>,
        },
        {
            title: 'Ngày hiệu lực',
            key: 'startDate',
            dataIndex: 'startDate',
            render: (_, record) => <span>{record.startDate != null ? dayjs(record.startDate).format('DD-MM-YYYY') : null}</span>,
        },
        {
            title: 'Ngày hết hiệu lực',
            key: 'endDate',
            dataIndex: 'endDate',
            render: (_, record) => <span>{record.endDate != null ? dayjs(record.endDate).format('DD-MM-YYYY') : null}</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (_, record) => <span>{convertStatusDecision(record.status as number)}</span>,
        },
        {
            title: 'Người tạo',
            key: 'createdBy',
            dataIndex: 'createdBy',
            render: (_, record) => <span>{record.createdBy}</span>,
        },
        {
            title: 'Người duyệt',
            key: 'approveBy',
            dataIndex: 'approveBy',
            render: (_, record) => <span>{record.approveBy}</span>,
        },
        {
            title: 'Ngày tạo',
            key: 'createdOnDate',
            dataIndex: 'createdOnDate',
            render: (_, record) => <span>{record.createdOnDate}</span>,
        },
        {
            title: 'Ngày duyệt',
            key: 'dateApprove',
            dataIndex: 'dateApprove',
            render: (_, record) => <span>{record.dateApprove != null ? dayjs(record.dateApprove).format('DD-MM-YYYY') : null}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <>
                    <Button
                        type='link'
                        loading={detailLoading.includes(record.id || '')}
                        onClick={() => detailData(record)}
                    >
                        Xem
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            <Modal
                destroyOnClose
                width={'80%'}
                maskClosable={false}
                title='Sửa'
                open={visible}
                centered={true}
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
                    labelCol={{ span: 8 }}
                    initialValues={{
                        fullName: formVals.fullName,
                        sex: formVals.sex,
                        dateOfBirth: moment(formVals.dateOfBirth),
                        idNumberCard: formVals.idNumberCard,
                        typeIdCard: formVals.typeIdCard?.toString(),
                        examId: formVals.examId,
                        target: formVals.target?.toString(),
                        decisionBlackLists: formVals.decisionBlackLists,
                        isAutoFill: formVals.isAutoFill
                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label='Họ và tên'
                                name='fullName'
                                labelAlign='left'
                                labelCol={{ span: 4 }}
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
                                <Input placeholder='Nhập họ và tên' />
                            </Form.Item>
                            <Form.Item
                                label='Loại giấy tờ'
                                name='typeIdCard'
                                labelAlign='left'
                                labelCol={{ span: 4 }}
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
                                <Select value={formVals.typeIdCard}>
                                    <Select.Option key={typeIdCard.CMND}>CMND</Select.Option>
                                    <Select.Option key={typeIdCard.CCCD}>CCCD</Select.Option>
                                    <Select.Option key={typeIdCard.Passport}>Hộ chiếu</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Đối tượng'
                                name='target'
                                labelAlign='left'
                                labelCol={{ span: 4 }}
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
                                labelCol={{ span: 4 }}
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
                                <DatePicker style={{ width: '100%' }} placeholder='Chọn' />
                            </Form.Item>
                            <Form.Item
                                label='Số giấy tờ'
                                name='idNumberCard'
                                labelAlign='left'
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 12 }}
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
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 12 }}
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
                </Form>
                <Divider orientation='left'>Thông tin Blacklist</Divider>
                <Row style={{ float: 'right', marginBottom: '20px' }}>
                    <Button type='primary' onClick={() => setCreateDecisionVisible(true)}>
                        Thêm mới
                    </Button>
                </Row>

                <Table
                    rowKey='id'
                    size='small'
                    columns={columns}
                    dataSource={decisionDataT}
                    loading={loading}
                />
            </Modal>
            <CreateDecision
                onCancel={() => setCreateDecisionVisible(false)}
                visible={createDecisionVisible}
                onSubmit={createSubmit}
                onSubmitLoading={createSubmitLoading}
                examOption={examOption}
                resonBlacklist={resonBlacklist}
            />

            <UpdateDecision
                onApprove={approve}
                onCancel={() => closeForm()}
                visible={updateDecisionVisible}
                onSubmit={updateSubmit}
                onSubmitLoading={updateSubmitLoading}
                examOption={examOption}
                resonBlacklist={resonBlacklist}
                values={updateData}
            />
        </>

    );
};

export default UpdateForm;
