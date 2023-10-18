import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select, message } from 'antd';
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

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    reload: (current: number, pageSize: number) => void;
}
const CreateDividingExamRoom: React.FC<Props> = ({ open, setOpen, reload }) => {
    const [searchForm] = Form.useForm();
    // const [open, setOpen] = useState(false);
    const typeOrdering: SelectOptionModel[] = [
        {
            key: 'NoSort',
            label: 'Ngẫu nhiên',
            value: '0',
        },
        {
            key: 'Name_Ascing',
            label: 'Tên tăng dần',
            value: '1',
        },
        {
            key: 'Name_Descing',
            label: 'Tên giảm dần',
            value: '2',
        },
        {
            key: 'Birthday_Ascing',
            label: 'Ngày sinh tăng dần',
            value: '3',
        },
        {
            key: 'Birthday_Descing',
            label: 'Ngày sinh giảm dần',
            value: '4',
        },
        {
            key: 'RegistrationDate_Ascing',
            label: 'Ngày đăng ký tăng dần',
            value: '5',
        },
        {
            key: 'RegistrationDate_Descing',
            label: 'Ngày đăng ký giảm dần',
            value: '6',
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

    const getList = async (): Promise<void> => {
        const responseArea: ResponseData = await getArea();
        const responseHeadQuarter: ResponseData = await getHeadQuarter('00000000-0000-0000-0000-000000000000');
        const responseExamScheduleTopik: ResponseData = await getExamScheduleTopik(undefined, undefined, 0);
        setExamScheduleTopik(responseExamScheduleTopik.data as ExamScheduleTopikModel[])
        const area = (responseArea.data as AreaModel[] ?? []).filter((item: AreaModel) => {
            return item.isTopik
        })
        const headQuarter = (responseHeadQuarter.data as HeadQuarterModel[] ?? []).filter((item: HeadQuarterModel) => {
            return item.isTopik
        })
        const stateDispatcher = {
            examSchedule: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(ConvertExamScheduleOptionModel(responseExamScheduleTopik.data as ExamScheduleTopikModel[])),
            headQuarter: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[])),
            area: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(ConvertAreaOption(area as AreaModel[])),
        }
        dispatch(stateDispatcher)


    };
    useEffect(() => {
        getList();
    }, []);

    const onChangeHeaderQuarter = async () => {

        const id: string = searchForm.getFieldValue("ExamAreaId")
        const responseHeadQuarter: ResponseData = await getHeadQuarter(id);
        const headQuarter = (responseHeadQuarter.data as HeadQuarterModel[] ?? []).filter((item: HeadQuarterModel) => {
            return item.isTopik
        })
        const stateDispatcher = {
            headQuarter: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(ConvertHeaderQuarterOptionModel(headQuarter as HeadQuarterModel[])),
        }
        dispatch(stateDispatcher)
    };

    const onChangeExamPlace = async () => {

        const id: string = searchForm.getFieldValue("ExamPlaceId")
        const responseExamScheduleTopikDivided: ResponseData<DividingExamPlaceModel[]> = await checkExamScheduleTopik(id);

        let examScheduleTopikSelect: SelectOptionModel[] = [];
        if (responseExamScheduleTopikDivided.code === 200) {
            examScheduleTopik?.forEach((item: ExamScheduleTopikModel, idx: number) => {
                let checkExist = responseExamScheduleTopikDivided.data?.some((examScheduleTopikDivided: DividingExamPlaceModel) => examScheduleTopikDivided.examScheduleTopikId == item.id)
                if (!checkExist) {
                    examScheduleTopikSelect.push({
                        key: item.id || '',
                        label: item.examinationName || '',
                        value: item.id || '',
                    });
                }
            })
        }

        const stateDispatcher = {
            examSchedule: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            }].concat(examScheduleTopikSelect),
        }
        dispatch(stateDispatcher)
    };


    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleOk = async () => {
        const fieldsValue = await searchForm.validateFields();
        setModalButtonOkText('Đang xử lý...');
        setConfirmLoading(true);
        searchForm.resetFields()

        const objBody = {
            ...fieldsValue,
            TypeOrdering: +fieldsValue.TypeOrdering
        }
        // console.log(objBody)

        const response = await generateCandidateNumber(objBody);
        if (response.code === 200 && response.data != null) {
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
        console.log('Clicked cancel button');
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
            <Modal title="Phân phòng thi và đánh số báo danh" open={open} okText={modalButtonOkText} cancelText="Bỏ qua" width={1000}
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
                        ["TypeOrdering"]: '0',
                        ["ExamAreaId"]: '',
                        ["ExamPlaceId"]: '',
                        ["ExamScheduleTopikId"]: '',
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={12}>
                            <Form.Item label={'Tiêu chí sắp xếp'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='TypeOrdering' rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Tiêu chí sắp xếp' options={typeOrdering} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'Khu vực'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='ExamAreaId' rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn khu vực' options={state.area} onChange={() => onChangeHeaderQuarter()} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={'Địa điểm thi'}
                                labelCol={{ span: 24 }}
                                wrapperCol={{ span: 17 }}
                                name='ExamPlaceId'
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn địa điểm' options={state.headQuarter} onChange={() => onChangeExamPlace()} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'Lịch thi'} labelCol={{ span: 24 }} wrapperCol={{ span: 17 }} name='ExamScheduleTopikId' rules={[{ required: true }]}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                    placeholder='Chọn lịch thi' options={state.examSchedule} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default CreateDividingExamRoom;