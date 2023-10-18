import React, { useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Checkbox,
  DatePicker,
  Select,
  Tabs,
  Row,
  Col,
  Radio,
  Divider,
  Image,
  Upload,
  UploadProps,
  UploadFile,
} from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ManageRegisteredCandidateTopikModel } from '@/apis/models/ManageRegisteredCandidateTopikModel';
import {
  SelectOptionModel,
} from '@/apis/models/data';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import Permission from '@/components/Permission';
import { layoutCode, PermissionAction } from '@/utils/constants';
import { base64toBlob, convertJob, convertKnowWhere, convertPurpose } from '@/utils/convert';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  values: Partial<ManageRegisteredCandidateTopikModel>;
  onSubmitLoading: boolean;
  areaOption: SelectOptionModel[];
  placeOption: SelectOptionModel[];
  examSchedule: SelectOptionModel[];
  examOption: SelectOptionModel[];
  provinceOption: SelectOptionModel[];
  districtOption: SelectOptionModel[];
  wardOption: SelectOptionModel[];
  countryOption: SelectOptionModel[];
  languageOption: SelectOptionModel[];
  examRoom: SelectOptionModel[];
  onSubmit: (values: ManageRegisteredCandidateTopikModel) => void;
  onCancel: () => void;
}
const ViewDetail: React.FC<UpdateFormPorps> = (props) => {
  const {
    visible,
    values,
    onSubmit,
    onSubmitLoading,
    areaOption,
    placeOption,
    examSchedule,
    examOption,
    provinceOption,
    districtOption,
    wardOption,
    countryOption,
    languageOption,
    examRoom,
    onCancel,
  } = props;
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

  const [frontImgCCCD, setFrontImgCCCD] = useState<string>(values.userInfo?.frontImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.frontImgCCCD}` as string : '../src/assets/images/image.png');
  const [backImgCCCD, setBackImgCCCD] = useState<string>(values.userInfo?.backImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.backImgCCCD}` as string : '../src/assets/images/image.png');
  const [imG3X4, setImG3X4] = useState<string>(values.userInfo?.imG3X4 != null ? `data:image/jpeg;base64,${values.userInfo?.imG3X4}` as string : '../src/assets/images/image.png');
  const [birthCertificate, setBirthCertificate] = useState<string>(values.userInfo?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfo?.birthCertificate}` as string : '../src/assets/images/image.png');

  return (
    <>
      <Modal
        destroyOnClose
        width={'80%'}
        bodyStyle={{ height: '76vh', fontSize: 16, marginLeft: 20, overflow: 'auto' }}
        maskClosable={false}
        title='Chi tiết'
        open={visible}
        onCancel={onCancel}
        footer={[
          <Permission noNode navigation={layoutCode.manageRegisteredCandidateTopik as string} bitPermission={PermissionAction.Edit}>
            <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
              Cập nhật
            </Button>
          </Permission>
          ,
        ]}
      >
        <div style={{ height: '30%', width: '100%', display: 'flex' }}>
          {values.userInfo?.frontImgCCCD != null ? <Image
            height={'100%'}
            style={{ paddingRight: '20px' }}
            src={frontImgCCCD}
          /> : null}
          {values.userInfo?.backImgCCCD != null ? <Image
            height={'100%'}
            style={{ paddingRight: '20px' }}
            src={backImgCCCD}
          /> : null}
          {values.userInfo?.imG3X4 != null ? <Image
            height={'100%'}
            style={{ paddingRight: '20px' }}
            src={imG3X4}
          /> : null}
          {values.userInfo?.birthCertificate != null ? <Image
            height={'100%'}
            style={{ paddingRight: '20px' }}
            src={birthCertificate}
          /> : null}
          {
            values.userInfo?.schoolCertificate != null ? <Col style={{ textAlign: 'center', top: '30%' }}>
              <label>Giấy xác nhận của trường</label>
              <br />
              <Button onClick={() => showPdf(values.userInfo?.schoolCertificate as string)}>Xem file</Button>
            </Col> : null
          }
        </div>
        <Divider orientation='left'>Thông tin thí sinh</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <label>Họ tên tiếng Anh: </label>
            <label className='fontBoldLineHeight'>
              {values.userInfo?.fullName}</label>
          </Col>
          <Col span={8}>
            <label>Họ tên tiếng Hàn:  </label>
            <label className='fontBoldLineHeight'>
              {values.userInfo?.fullNameKorea}</label>
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
          <Col span={8}>
            <label>Quốc tịch: </label>
            <label className='fontBoldLineHeight'>
              {countryOption.find(p => p.value == values.userInfo?.countryCode)?.label}
            </label>
          </Col>
          <Col span={8}>
            <label>Ngôn ngữ: </label>
            <label className='fontBoldLineHeight'>
              {languageOption.find(p => p.value == values.userInfo?.languageCode)?.label}
            </label>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <label>Email tài khoản: </label>
            <label className='fontBoldLineHeight'>
              {values.userInfo?.userName}
            </label>
          </Col>
          <Col span={8}>
            <label>Có phải Hàn kiều: </label>
            <label className='fontBoldLineHeight'>
              {values.userInfo?.isKorean == "true" ? "Có" : "Không"}
            </label>
          </Col>
          <Col span={8}>
            <label>Ngôn ngữ đăng ký: </label>
            <label className='fontBoldLineHeight'>
              {values.userInfo?.languageName}
            </label>
          </Col>
        </Row>
        <Divider orientation='left'>Thông tin dự thi</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <label>Khu vực thi: </label>
            <label className='fontBoldLineHeight'>
              {areaOption.find(p => p.value == values.areaTest)?.label}
            </label>
          </Col>
          <Col span={8}>
            <label>Địa điểm thi: </label>
            <label className='fontBoldLineHeight'>
              {placeOption.find(p => p.value == values.placeTest)?.label}
            </label>
          </Col>
          <Col span={8}>
            <label>Phòng thi: </label>
            <label className='fontBoldLineHeight'>
              {examRoom.find((p) => p.key == values.examInfo?.examRoomId)?.label}
            </label>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <label>Bài thi: </label>
            <label className='fontBoldLineHeight'>
              {examOption.find(p => p.value == values.examId)?.label}
            </label>
          </Col>
          <Col span={8}>
            <label>Lịch thi: </label>
            <label className='fontBoldLineHeight'>
              {examSchedule.find(p => p.value == values.testScheduleId)?.label}
            </label>
          </Col>
          <Col span={8}>
            <label>Ngày thi: </label>
            <label className='fontBoldLineHeight'>
              {moment(values.examInfo?.dateTest).format("DD-MM-YYYY")}
            </label>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <label>Giờ thi: </label>
            <label className='fontBoldLineHeight'>
              {values.examInfo?.timeTest}
            </label>
          </Col>
          <Col span={8}>
            <label>Ca thi: </label>
            <label className='fontBoldLineHeight'>
              {values.examInfo?.examShift}
            </label>
          </Col>
          <Col span={8}>
            <label>SBD: </label>
            <label className='fontBoldLineHeight'>
              {values.examInfo?.sbd}
            </label>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <label>Biết đến kỳ thi qua đâu: </label>
            <label className='fontBoldLineHeight'>
              {convertKnowWhere(values.knowWhere as string)}
            </label>
          </Col>
          <Col span={8}>
            <label>Mục đích tham dự: </label>
            <label className='fontBoldLineHeight'>
              {convertPurpose(values.examPurpose as string)}
            </label>
          </Col>
          <Col span={8}>
            <label>Đã từng thi TOPIK: </label>
            <label className='fontBoldLineHeight'>
              {values.isTestTOPIK ? "Đã thi" : "Chưa thi"}
            </label>
          </Col>
        </Row>
      </Modal >
    </>
  );
};
export default ViewDetail;