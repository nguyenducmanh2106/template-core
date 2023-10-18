import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, message } from 'antd';
import { ConvertAreaOption, ConvertExamScheduleOptionModel, ConvertHeaderQuarterOptionModel } from '@/utils/convert';
import { ExamScheduleTopikModel } from '@/apis/models/ExamScheduleTopikModel';
import { AreaModel, HeadQuarterModel, SelectOptionModel } from '@/apis/models/data';
import { getExamScheduleTopik } from '@/apis/services/ExamScheduleTopikService';
import { getArea, getHeadQuarter } from '@/apis/services/PageService';
import { ResponseData } from '@/apis/models/ResponseData';
import {
    checkExamScheduleTopik,
    generateCandidateNumber
} from '@/apis/services/DividingExamPlaceService';
import { DividingExamPlaceModel } from '@/apis/models/DividingExamPlaceModel';
import { postUserReceiveEmailTest } from '@/apis/services/UserReceiveEmailTestService';
import { Code } from '@/apis';

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    reload: (current: number, pageSize: number) => void;
}
const CreateUserReceiveMailComponent: React.FC<Props> = ({ open, setOpen, reload }) => {
    const [searchForm] = Form.useForm();
    // const [open, setOpen] = useState(false);
    const statusOption: SelectOptionModel[] = [
        {
            key: 'Active',
            label: 'Hoạt động',
            value: '1',
        },
        {
            key: 'InActive',
            label: 'Ngừng hoạt động',
            value: '2',
        },
    ];

    const languageSendMailOption: SelectOptionModel[] = [
        {
            key: 'VietNam',
            label: 'Tiếng Việt',
            value: 'vi',
        },
        {
            key: 'English',
            label: 'Tiếng Anh',
            value: 'en',
        },
        {
            key: 'Korea',
            label: 'Tiếng Hàn',
            value: 'ko',
        },
    ];
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [examScheduleTopik, setExamScheduleTopik] = useState<ExamScheduleTopikModel[]>([]);
    const [modalButtonOkText, setModalButtonOkText] = useState('Tạo phòng');
    const initState = {
        area: [], headQuarter: [], examSchedule: []
    }

    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>((prevState: any, updatedProperty: any) => ({
        ...prevState,
        ...updatedProperty,
    }), initState);

    // const getList = async (): Promise<void> => {
    //     const responseArea: ResponseData = await getArea();
    //     const responseHeadQuarter: ResponseData = await getHeadQuarter('00000000-0000-0000-0000-000000000000');
    //     const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik(undefined, undefined, 0);
    //     setExamScheduleTopik(responseExamScheduleTopik.data as ExamScheduleTopikModel[])
    //     const area = (responseArea.data as AreaModel[] ?? []).filter((item: AreaModel) => {
    //         return item.isTopik
    //     })
    //     const headQuarter = (responseHeadQuarter.data as HeadQuarterModel[] ?? []).filter((item: HeadQuarterModel) => {
    //         return item.isTopik
    //     })
    //     const stateDispatcher = {
    //         examSchedule: [{
    //             key: 'Default',
    //             label: '-Chọn-',
    //             value: '',
    //         }].concat(ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[])),
    //         headQuarter: [{
    //             key: 'Default',
    //             label: '-Chọn-',
    //             value: '',
    //         }].concat(ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[])),
    //         area: [{
    //             key: 'Default',
    //             label: '-Chọn-',
    //             value: '',
    //         }].concat(ConvertAreaOption(area as AreaModel[])),
    //     }
    //     dispatch(stateDispatcher)


    // };
    useEffect(() => {
        // getList();
    }, []);

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = async () => {
        const fieldsValue = await searchForm.validateFields();
        setModalButtonOkText('Đang xử lý...');
        searchForm.resetFields()

        const objBody = {
            ...fieldsValue,
        }
        // console.log(objBody)
        // return
        setConfirmLoading(true);

        const response = await postUserReceiveEmailTest("",objBody);
        if (response.code === Code._200) {
            message.success(response.message || "Tạo thành công")
            setOpen(false);
            setConfirmLoading(false);
            reload(1, 10)
        }
        else {
            setOpen(false);
            setConfirmLoading(false);
            message.error(response.message || "Thất bại")
        }
    };

    const handleCancel = () => {
        searchForm.resetFields()
        setOpen(false);
    };
    const validateMessages = {
        required: '${label} không được để trống',
        types: {
            email: '${label} không đúng định dạng email',
            number: '${label} không đúng định dạng số',
        },
        number: {
            range: '${label} must be between ${min} and ${max}',
        },
    };

    return (
        <>
            {/* <Modal
                title="Phân phòng thi và đánh số báo danh"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okText="Chia phòng"
                cancelText="Bỏ qua"
            > */}
            <Modal title="Thêm mới liên hệ" open={open} okText={modalButtonOkText} cancelText="Bỏ qua" width={600}
                           /* onOk={onSubmit}*/ style={{ top: 20 }} onCancel={handleCancel}
                confirmLoading={confirmLoading}
                okButtonProps={{ form: 'myFormCreate', htmlType: 'submit' }}
            >
                <Form
                    form={searchForm}
                    name='nest-messages' id="myFormCreate"
                    onFinish={handleOk}
                    validateMessages={validateMessages}
                    initialValues={{
                        ["FullName"]: '',
                        ["Email"]: '',
                        ["LanguageSendMail"]: '',
                        ["Status"]: '',
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={24}>
                            <Form.Item label={'Họ tên'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='FullName' rules={[{ required: true }]}>
                                <Input allowClear placeholder='Nhập họ tên' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Email'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Email'
                                rules={[
                                    { required: true },
                                    {
                                        type: 'email',
                                        message: 'Không đúng định dạng email',
                                    },
                                ]}
                            >
                                <Input allowClear placeholder='Nhập email' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={'Ngôn ngữ nội dung mail'}
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 24 }}
                                name='LanguageSendMail'
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn địa điểm' options={languageSendMailOption} onChange={() => { }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Trạng thái'} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name='Status' rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn lịch thi' options={statusOption} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default CreateUserReceiveMailComponent;