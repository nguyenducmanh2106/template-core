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
    Table,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import {
    ExamRoomModel,
    ExamTestInfo,
    ManageRegisteredCandidateITModel,
    ManageRegisteredUpdateCandidateITModel,
    SelectOptionModel, SelectStatusOption, ServiceAlongExamModel,
} from '@/apis/models/data';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { convertJob, convertPurposeTOEIC, convertTypeIDCard } from '@/utils/convert';
import { ManageRegisteredCandidatesModel } from '@/apis';
import { ColumnsType } from 'antd/lib/table';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
    visible: boolean;
    values: ManageRegisteredUpdateCandidateITModel;
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
    onSubmit: (values: ManageRegisteredUpdateCandidateITModel) => void;
    onCancel: () => void;
}
const ViewDetail: React.FC<UpdateFormPorps> = (props) => {
    const { visible, values, onSubmit, onSubmitLoading, examVersionOption, service, statusProfile, statusPaid, provinceOption, districtOption, wardOption, examShift, examRooms, exam, onCancel } = props;
    const showPdf = (base64EncodedPDF: string) => {
        var pdf_newTab = window.open("");

        pdf_newTab?.document.write(
            "<html><head><title>Giấy xác nhận cho" + values.userInfoITModel?.fullName + "</title></head><body><iframe title='MY title'  width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(base64EncodedPDF) + "'></iframe></body></html>"
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

    var showAlert = true;
    var note = '';
    const onChange = (e: any) => {
        note = (e.target.value)
    }
    const columns: ColumnsType<ExamTestInfo> = [
        {
          title: 'Bài thi',
          dataIndex: 'time',
          key: 'time',
          render: (_, record) => <>{record.examName}</>,
        },
        {
          title: 'Phiên bản',
          dataIndex: 'shift',
          key: 'shift',
          render: (_, record) => <>{record.examVersion}</>,
        },
        {
          title: 'Ngôn ngữ',
          dataIndex: 'room',
          key: 'room',
          render: (_, record) => <>{record.language}</>,
        },
        {
          title: 'Thời gian thi',
          dataIndex: 'room',
          key: 'room',
          render: (_, record) => <>{record.examTime}</>,
        },
        {
          title: 'Địa điểm thi',
          dataIndex: 'room',
          key: 'room',
          render: (_, record) => <>{record.address}</>,
        },
      ];
    

    const [frontImgCCCD, setFrontImgCCCD] = useState<string>(values.userInfoITModel?.idCardFront != null ? `data:image/jpeg;base64,${values.userInfoITModel?.idCardFront}` as string : '../src/assets/images/image.png');
    const [backImgCCCD, setBackImgCCCD] = useState<string>(values.userInfoITModel?.idCardBack != null ? `data:image/jpeg;base64,${values.userInfoITModel?.idCardBack}` as string : '../src/assets/images/image.png');
    const [imG3X4, setImG3X4] = useState<string>(values.userInfoITModel?.image3x4 != null ? `data:image/jpeg;base64,${values.userInfoITModel?.image3x4}` as string : '../src/assets/images/image.png');
    const [birthCertificate, setBirthCertificate] = useState<string>(values.userInfoITModel?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfoITModel?.birthCertificate}` as string : '../src/assets/images/image.png');

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
                    {values.userInfoITModel?.idCardFront != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={frontImgCCCD}
                    /> : null}
                    {values.userInfoITModel?.idCardBack != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={backImgCCCD}
                    /> : null}
                    {values.userInfoITModel?.image3x4 != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px', maxHeight: '200px' }}
                        src={imG3X4}
                    /> : null}
                    {values.userInfoITModel?.birthCertificate != null ? <Image
                        height={'100%'}
                        style={{ paddingRight: '20px' }}
                        src={birthCertificate}
                    /> : null}
                    {
                        values.userInfoITModel?.schoolCertificate?.length != undefined ? <Col style={{ textAlign: 'center', top: '30%' }}>
                            <label>Giấy xác nhận của trường</label>
                            <br />
                            <Button onClick={() => showPdf(values.userInfoITModel?.schoolCertificate as string)}>Xem file</Button>
                        </Col> : null
                    }

                </div>
                <Divider orientation='left'>Thông tin thí sinh</Divider>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Họ và tên: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.fullName}</label>
                    </Col>
                    <Col span={8}>
                        <label>Email tài khoản: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.userName}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Ngày sinh: </label>
                        <label className='fontBoldLineHeight'>
                            {moment(values.userInfoITModel?.birthday).format('DD-MM-YYYY')}
                        </label>
                    </Col>

                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Loại giấy tờ: </label>
                        <label className='fontBoldLineHeight'>
                            {convertTypeIDCard(values.userInfoITModel?.typeIdCard as string)}
                        </label>
                    </Col>

                    <Col span={8}>
                        <label>Số giấy tờ: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.idNumber}
                        </label>
                    </Col>

                    <Col span={8}>
                        <label>Ngày cấp: </label>
                        <label className='fontBoldLineHeight'>
                            {moment(values.userInfoITModel?.dateOfCCCD).format('DD-MM-YYYY')}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Nơi cấp: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.placeOfCCCD}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Giới tính: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.sex == 'man' ? 'Nam' : 'Nữ'}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Nghề nghiệp: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.job}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Số điện thoại: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.phone}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Email: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.email}
                        </label>
                    </Col>

                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Tỉnh/TP công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {provinceOption.find(p => p.key == values.userInfoITModel?.workAddressCityId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Quận/huyện công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {districtOption.find(p => p.key == values.userInfoITModel?.workAddressDistrictId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Xã/phường công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {wardOption.find(p => p.key == values.userInfoITModel?.workAddressWardsId)?.label}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Địa chỉ công tác: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.workAddress}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Tỉnh/TP: </label>
                        <label className='fontBoldLineHeight'>
                            {provinceOption.find(p => p.key == values.userInfoITModel?.contactAddressCityId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Quận/huyện: </label>
                        <label className='fontBoldLineHeight'>
                            {districtOption.find(p => p.key == values.userInfoITModel?.contactAddressDistrictId)?.label}
                        </label>
                    </Col>
                    <Col span={8}>
                        <label>Xã/phường: </label>
                        <label className='fontBoldLineHeight'>
                            {wardOption.find(p => p.key == values.userInfoITModel?.contactAddressWardId)?.label}
                        </label>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <label>Địa chỉ: </label>
                        <label className='fontBoldLineHeight'>
                            {values.userInfoITModel?.contactAddress}
                        </label>
                    </Col>
                </Row>
                <Divider orientation='left'>Thông tin dự thi</Divider>
                <Row gutter={24}>
                    <Table
                        style={{ width: '100%' }}
                        rowKey='id'
                        size='small'
                        columns={columns}
                        dataSource={values.examTestInfo}
                        pagination={false}
                    />
                </Row>

            </Modal >
        </>
    );
};
export default ViewDetail;