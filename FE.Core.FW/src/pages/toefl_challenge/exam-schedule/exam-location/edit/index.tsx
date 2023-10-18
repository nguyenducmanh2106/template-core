import { Code, ResponseData } from '@/apis';
import { ExamModel } from '@/apis/models/toefl-challenge/ExamModel';
import { RegistrationExamType } from '@/apis/models/toefl-challenge/RegistrationExamType';
import { RegistrationRound } from '@/apis/models/toefl-challenge/RegistrationRound';
import { putExam } from '@/apis/services/toefl-challenge/ExamService';
import { Col, ConfigProvider, DatePicker, Form, FormInstance, Input, Modal, Row, Select, Tabs, TabsProps, message } from 'antd';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import locale from "antd/es/date-picker/locale/vi_VN"
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import { examLocationScheduleState, examRegistrationScheduleState } from '@/store/exam-atom';
import moment from 'moment';
import { OptionModel, SelectOptionModel } from '@/apis/models/data';
import { getAministrativeDivisions1 } from '@/apis/services/toefl-challenge/AministrativeDivisionsService';
import { ProvinceModel } from '@/apis/models/toefl-challenge/ProvinceModel';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { ExamScheduleModel } from '@/apis/models/toefl-challenge/ExamScheduleModel';
import EditExamLocationInfor from './edit-exam-location';
import ExamLocationSchedule from './exam-location-schedule-edit';
import { ExamLocationScheduleModel } from '@/apis/models/toefl-challenge/ExamLocationScheduleModel';
import { postExamLocation, postExamLocationSchedule, postExamSchedule, putExamLocation1, upSertExamLocationSchedule } from '@/apis/services/toefl-challenge/ExamLocationService';
import { ExamLocationModel } from '@/apis/models/toefl-challenge/ExamLocationModel';
interface Props {
    open: boolean;
    examSchedule: ExamScheduleModel;
    examLocationId: string;
    setOpen: (value: boolean) => void;
    provinces: SelectOptionModel[];
    districtInits: SelectOptionModel[];
    reload: (current: number, pageSize: number) => void;
    recordEdit: ExamLocationModel
}
const ExamLocationEditTFC: React.FC<Props> = ({ open, setOpen, reload, examSchedule, provinces, districtInits, recordEdit, examLocationId }) => {
    // const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalButtonOkText, setModalButtonOkText] = useState('Lưu');
    const [examLocationSchedules, setExamLocationSchedules] = useRecoilState<ExamLocationScheduleModel[]>(examLocationScheduleState);

    const handleOk = async (value: any) => {
        // const fieldsValue = await searchForm.validateFields();
        // const fieldsValue = await formRef?.current?.validateFields();
        setModalButtonOkText('Đang xử lý...');
        setConfirmLoading(true);

        const examLocation = {
            ...value,
            ExamId: examSchedule.examId,
            ExamScheduleId: examSchedule.id,
        }

        // console.log(examLocation, examLocationScheduleObjs)
        // return
        const response = await putExamLocation1(recordEdit.id, examLocation);
        setModalButtonOkText('Lưu');
        setConfirmLoading(false);
        setOpen(false);
        if (response.code === Code._200) {
            const examLocationScheduleObjs: ExamLocationScheduleModel[] = examLocationSchedules.map((item: ExamLocationScheduleModel, idx: number) => {
                return {
                    ...item,
                    examLocationId: recordEdit.id,
                    examId: examSchedule.examId,
                    examScheduleId: examSchedule.id,
                    order: idx
                }
            }) as ExamLocationScheduleModel[];
            const responseExamLocationSchedule = await upSertExamLocationSchedule(recordEdit.id as string, examLocationScheduleObjs);
            if (responseExamLocationSchedule.code === Code._200) {
                message.success(response.message || "Thành công")
                setModalButtonOkText('Lưu');
                setConfirmLoading(false);
                setOpen(false);
                reload(1, 20)
            }
            else {
                message.error(response.message || "Thất bại")
                setModalButtonOkText('Lưu');
                setConfirmLoading(false);
                setOpen(false);
            }
        }
        else {
            message.error(response.message || "Thất bại")
        }


    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        // formRef.current?.resetFields()
        setOpen(false);
    };

    const itemTabs: TabsProps['items'] = [
        {
            key: '1',
            label: `Địa điểm thi`,
            children: <EditExamLocationInfor recordEdit={recordEdit}
                handleOk={handleOk}
                provinces={provinces}
                districtInits={districtInits}
            />,
        },
        {
            key: '2',
            label: `Ca thi`,
            children: <ExamLocationSchedule examSchedule={examSchedule}
                examLocationId={examLocationId}
            />,
        },
    ];

    return (
        <>
            <Modal title="Cập nhật địa điểm thi" open={open} okText={modalButtonOkText} cancelText="Bỏ qua" width={860}
                           /* onOk={onSubmit}*/ style={{ top: 20 }} onCancel={handleCancel}
                confirmLoading={confirmLoading}
                okButtonProps={{ form: 'myFormEdit1', htmlType: 'submit' }}
            >
                <Tabs
                    defaultActiveKey="1"
                    tabPosition={"top"}
                    type="line"
                    style={{ minHeight: 220 }}
                    items={itemTabs}
                />
            </Modal>
        </>
    );
}

export default ExamLocationEditTFC;