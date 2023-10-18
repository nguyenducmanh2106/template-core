import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Divider,
    Image,
} from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import {
    ExamRoomModel,
    SelectOptionModel, SelectStatusOption, ServiceAlongExamModel,
} from '@/apis/models/data';
import { ExclamationCircleFilled } from '@ant-design/icons';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { convertJob, convertPurposeTOEIC } from '@/utils/convert';
import { ManageRegisteredCandidatesModel } from '@/apis';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
    visible: boolean;
    values: ManageRegisteredCandidatesModel;
    onSubmitLoading: boolean;
    service: ServiceAlongExamModel[];
    statusProfile: SelectStatusOption[];
    statusPaid: SelectStatusOption[];
    provinceOption: SelectOptionModel[];
    districtOption: SelectOptionModel[];
    wardOption: SelectOptionModel[];
    examShift: SelectOptionModel[];
    exam: SelectOptionModel[];
    examVersionOption: SelectOptionModel[];
    examRooms: ExamRoomModel[];
    onSubmit: (values: ManageRegisteredCandidatesModel) => void;
    onApprove: (id: string, approve: boolean, note?: string) => void;
    reNewStatus: (id: string) => void;
    onCancel: () => void;
}
const ViewDetail: React.FC<UpdateFormPorps> = (props) => {
    const { visible, values, onSubmit, onApprove, reNewStatus, onSubmitLoading, examVersionOption, service, statusProfile, statusPaid, provinceOption, districtOption, wardOption, examShift, examRooms, exam, onCancel } = props;
    const showPdf = (base64EncodedPDF: string) => {
        var pdf_newTab = window.open("");

        pdf_newTab?.document.write(
            "<html><head><title>Giấy xác nhận cho" + values.userInfo?.fullName + "</title></head><body><iframe title='MY title'  width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(base64EncodedPDF) + "'></iframe></body></html>"
        );
    };

    const [form] = Form.useForm();

    const onFinish = async () => {
        try {
            const fieldsValue = await form.validateFields();
            onSubmit(values)
        } catch (error) {
            message.warning('Hãy nhập đủ các trường');
        }
    };

    const GetExamVersionName = (idstring: string) => {
        var text = '';
        if (idstring != null) {
            const ids = idstring.split(',')
            ids.forEach((item: string) => {
                const check = examVersionOption.find(p => p.key == item)
                if (check != null) {
                    if (text.length > 0)
                        text += ', ' + check.label
                    else
                        text += check.label
                }
            })
        }
        return text

    }

    const { confirm } = Modal;
    const { TextArea } = Input;
    const showConfirmHoan = () => {
        confirm({
            title: 'Bạn có chắc chắn hoàn lại trạng thái hồ sơ này ?',
            icon: <ExclamationCircleFilled />,
            centered: true,
            onOk() {
                reNewStatus(values.id as string);
            },
            okText: 'Hoàn lại',
            cancelText: 'Hủy',
            onCancel() {
                console.log('');
            },
        });
    };
    const showConfirmDuyet = () => {
        confirm({
            title: 'Bạn có chắc chắn duyệt hồ sơ này ?',
            icon: <ExclamationCircleFilled />,
            centered: true,
            onOk() {
                onApprove(values.id as string, true);
            },
            okText: 'Duyệt',
            cancelText: 'Hủy',
            onCancel() {
                console.log('');
            },
        });
    };
    var showAlert = true;
    var note = '';
    const onChange = (e: any) => {
        note = (e.target.value)
    }
    const showConfirmTuChoi = () => {
        confirm({
            title: 'Bạn có chắc chắn từ chối hồ sơ này ?',
            icon: <ExclamationCircleFilled />,
            centered: true,
            onOk() {
                if (note.length == 0) {
                    showAlert = false;
                    showConfirmTuChoi()
                }
                else
                    onApprove(values.id as string, false, note)
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
    const [frontImgCCCD, setFrontImgCCCD] = useState<string>(values.userInfo?.frontImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.frontImgCCCD}` as string : '../src/assets/images/image.png');
    const [backImgCCCD, setBackImgCCCD] = useState<string>(values.userInfo?.backImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.backImgCCCD}` as string : '../src/assets/images/image.png');
    const [imG3X4, setImG3X4] = useState<string>(values.userInfo?.imG3X4 != null ? `data:image/jpeg;base64,${values.userInfo?.imG3X4}` as string : '../src/assets/images/image.png');
    const [birthCertificate, setBirthCertificate] = useState<string>(values.userInfo?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfo?.birthCertificate}` as string : '../src/assets/images/image.png');

    return (
        <>
            <Modal
                style={{ marginTop: '-70px' }}
                destroyOnClose
                width={'80vw'}
                bodyStyle={{ fontSize: 16, overflowY: 'auto', marginLeft: 20 }}
                maskClosable={false}
                title='Chi tiết'
                open={visible}
                onCancel={onCancel}
                footer={[
                    <>
                        {values.status == 1 ? <>
                            <Permission noNode navigation={layoutCode.manageRegisteredCandidates as string} bitPermission={PermissionAction.Edit}>
                                <Button key='submit' type='primary' style={{ backgroundColor: 'green' }} htmlType='submit' loading={onSubmitLoading} onClick={() => showConfirmDuyet()}>
                                    Duyệt
                                </Button>
                            </Permission>
                            <Permission noNode navigation={layoutCode.manageRegisteredCandidates as string} bitPermission={PermissionAction.Edit}>
                                <Button key='submit' style={{ backgroundColor: 'red', color: 'white' }} htmlType='submit' loading={onSubmitLoading} onClick={() => showConfirmTuChoi()}>
                                    Từ chối
                                </Button>
                            </Permission>
                        </> : <Permission noNode navigation={layoutCode.manageRegisteredCandidates as string} bitPermission={PermissionAction.Edit}>
                            <Button key='submit' style={{ backgroundColor: 'red', color: 'white' }} htmlType='submit' loading={onSubmitLoading} onClick={() => showConfirmHoan()}>
                                {values.status == 2 ? 'Hoàn duyệt' : 'Hoàn từ chối'}
                            </Button>
                        </Permission>}
                        <Permission noNode navigation={layoutCode.manageRegisteredCandidates as string} bitPermission={PermissionAction.Edit}>
                            <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
                                Cập nhật
                            </Button>
                        </Permission>
                        <Button key='submit' type='primary' htmlType='submit'>
                            In phiếu
                        </Button>
                    </>
                ]}
            >
                <div style={{ height: '30%', width: '100%', display: 'flex' }}>
                    {values.userInfo?.frontImgCCCD != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={frontImgCCCD}
                    /> : null}
                    {values.userInfo?.backImgCCCD != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={backImgCCCD}
                    /> : null}
                    {values.userInfo?.imG3X4 != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={imG3X4}
                    /> : null}
                    {values.userInfo?.birthCertificate != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px' }}
                        src={birthCertificate}
                    /> : null}
                    {
                        values.userInfo?.schoolCertificate?.length != undefined ? <Col style={{ textAlign: 'center', top: '30%' }}>
                            <label>Giấy xác nhận của trường</label>
                            <br />
                            <Button onClick={() => showPdf(values.userInfo?.schoolCertificate as string)}>Xem file</Button>
                        </Col> : null
                    }

                </div>
                <Divider orientation='left'>Thông tin thí sinh</Divider>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Họ và tên: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.fullName}</label>
                    </Col>
                    <Col span={8}>
                        <label>Email tài khoản: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.userName}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Ngày sinh: </label>
                        <label className='fontBoldLineHeight'>
                            {moment(values.userInfo?.dob).format('DD-MM-YYYY')}
                        </label>
                    </Col>

                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Căn cước công dân: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.cccd}
                        </label>
                    </Col>

                    <Col span={8}>
                        <label>Chứng minh nhân dân: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.cmnd}
                        </label>
                    </Col>

                    <Col span={8}>
                        <label>Hộ chiếu: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.passport}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Ngày cấp: </label>
                        <label className='fontBoldLineHeight'>
                            {moment(values.userInfo?.dateOfCCCD).format('DD-MM-YYYY')}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Nơi cấp: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.placeOfCCCD}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Giới tính: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.sex == 'man' ? 'Nam' : 'Nữ'}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Số điện thoại: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.sdt}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Email: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.email}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Nghề nghiệp: </label>
                        <label className='fontBoldLineHeight'>
                            {convertJob(values.userInfo?.optionJob as string, values.userInfo?.job as string)}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Tỉnh/TP công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {provinceOption.find(p => p.key == values.userInfo?.workAddressCityId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Quận/huyện công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {districtOption.find(p => p.key == values.userInfo?.workAddressDistrictId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Xã/phường công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {wardOption.find(p => p.key == values.userInfo?.workAddressWardsId)?.label}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Địa chỉ công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.workAddress}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Tỉnh/TP: </label>
                        <label className='fontBoldLineHeight'>
                            {provinceOption.find(p => p.key == values.userInfo?.contactAddressCityId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Quận/huyện: </label>
                        <label className='fontBoldLineHeight'>
                            {districtOption.find(p => p.key == values.userInfo?.contactAddressDistrictId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Xã/phường: </label>
                        <label className='fontBoldLineHeight'>
                            {wardOption.find(p => p.key == values.userInfo?.contactAddressWardsId)?.label}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Địa chỉ: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfo?.contactAddress}
                        </label>
                    </Col>
                </Row>
                <Divider orientation='left'>Thông tin dự thi</Divider>
                <Row gutter={24}>
                    <Col span={6}>
                        <label>Bài thi: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{exam.find((p) => p.value == values.examId)?.label}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Phiên bản: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{GetExamVersionName(values.examVersion as string)}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Mục tiêu điểm số: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.scoreGoal}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Mục đích: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{convertPurposeTOEIC(values.examPurpose as string)}</span>
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={6}>
                        <label>Ngày thu hồ sơ: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{dayjs(values.dateApply).format('DD/MM/YYYY')}</span>

                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Giờ thu hồ sơ: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.timeApply}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Ngày thi: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.testScheduleDate}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Giờ thi: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.testScheduleDate}</span>
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={6}>
                        <label>Trạng thái hồ sơ: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{statusProfile.find(p => p.value == values.status)?.label}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Ngày duyệt: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.dateAccept != null ? moment(values.dateAccept).format('DD-MM-YYYY') : null}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Người duyệt: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{values.acceptBy}</span>
                        </label>
                    </Col>
                    <Col span={6}>
                        <label>Thanh toán: </label>
                        <label className='fontBoldLineHeight'>
                            <span>{statusPaid.find(p => p.value == values.statusPaid)?.label}</span>
                        </label>
                    </Col>
                </Row>
            </Modal >
        </>
    );
};
export default ViewDetail;