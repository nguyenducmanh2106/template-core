import React, { useState } from 'react';
import { BadgeProps, Col, Descriptions, Divider, Modal, Row } from 'antd';
import { Badge, Calendar } from 'antd';
import type { Dayjs } from 'dayjs';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import moment from 'moment';
import { ExamRoomModel, SelectOptionModel } from '@/apis/models/data';
interface DataFormProps {
    examCalendar: ExamCalendarModel[];
    exam: SelectOptionModel[];
    examRooms: ExamRoomModel[];
    examShift: SelectOptionModel[];
}

export interface Detail {
    examDate: string,
    examName: string,
    examRoom: string,
    examShift: string,
    examTime: string,
    registed: number,
    limit: number,
    status: string
}

const App: React.FC<DataFormProps> = (props) => {
    const { examCalendar, exam, examRooms, examShift } = props;
    const [showDate, setShowDate] = useState<string>();
    const [showDetail, setShowDetail] = useState<Detail[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getListData = (value: moment.Moment) => {
        const dataInmonth = examCalendar.filter((item) => {
            return moment(item.dateTest).date() == value.date() && moment(item.dateTest).month() == value.month()
        })
        var result: any = []
        if (dataInmonth.length > 0)
            dataInmonth.forEach((item) => {
                result.push({
                    color: examRooms.find(p => p.id == item.room)?.colorCode,
                    examName: exam.find(p => p.value == item.examId)?.label,
                    time: item.timeTest,
                    date: moment(item.dateTest).format('DD-MM-yyyy')
                })
            })
        return result || [];
    };

    const getMonthData = (value: moment.Moment) => {
        if (value.month() === 8) {
            return 1394;
        }
    };

    const ShowDetail = (value: moment.Moment) => {
        var adds: Detail[] = []
        setShowDate(value.format('DD-MM-YYYY'))
        const list = examCalendar.filter((item) => {
            return moment(item.dateTest).date() == value.date() && moment(item.dateTest).month() == value.month()
        })
        list.forEach((item) => {
            adds.push({
                examDate: value.format('DD-MM-YYYY'),
                examName: exam.find(p => p.value == item.examId)?.label as string,
                examRoom: examRooms.find(p => p.id == item.room)?.name as string,
                examShift: examShift.find(p => p.value == item.examShift)?.label as string,
                examTime: item.timeTest as string,
                registed: 20 as number,
                limit: 30 as number,
                status: item.status?.toString() as string
            })
        })
        setShowDetail(adds)
        setIsModalOpen(true)
    };
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dateCellRender = (value: moment.Moment) => {
        const listData = getListData(value);
        return (
            <div onClick={() => ShowDetail(value)}>
                {listData.map((item: any) => (
                    <div style={{ background: item.color, paddingLeft: '2%' }}>
                        <Row gutter={24}>
                            <Col span={12}>
                                {item.examName}
                            </Col>
                            <Col span={12}>
                                {item.time}
                            </Col>
                        </Row>
                    </div>

                ))}
            </div>
        );
    };

    return <>

        <Modal width={showDetail.length == 1 ? '20%' : (showDetail.length == 2 ? '30%' : '50%')} centered title={'Lịch thi ngày ' + showDate} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <Row gutter={24}>
                {showDetail.map((item: Detail) => (
                    <Col span={24 / showDetail.length}>

                        <Descriptions.Item label="Config Info">
                            <span>Môn thi: </span><span className='fontBold'>{item.examName}</span><br></br><br />
                            <span>Phòng thi: </span><span className='fontBold'>{item.examRoom}</span><br></br><br />
                            <span>Ca thi: </span><span className='fontBold'>{item.examShift}</span><br></br><br />
                            <span>Thời gian thi: </span><span className='fontBold'>{item.examTime}</span><br></br><br />
                            <span>Số lượng đã đăng ký: </span><span className='fontBold'>{item.registed}</span><br></br><br />
                            <span>Sức chứa phòng: </span><span className='fontBold'>{item.limit}</span><br></br><br />
                            <span>Trạng thái: </span><span className='fontBold'>{item.status}</span><br></br><br />
                            <span>Danh sách thi: </span><span>Xem ngay</span><br></br><br />
                        </Descriptions.Item>
                    </Col>
                ))}
            </Row>
        </Modal>
        <Calendar mode='month' dateCellRender={dateCellRender} />
    </>;
};

export default App;