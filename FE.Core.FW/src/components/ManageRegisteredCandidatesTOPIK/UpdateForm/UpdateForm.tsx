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
import { layoutCode, PermissionAction, typeIdCard, typeIdCardString } from '@/utils/constants';
import { base64toBlob } from '@/utils/convert';

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
  onSubmit: (values: any, form: FormInstance) => void;
  onCancel: () => void;
}
interface DataType {
  key: string;
  date: string;
  time: string;
  shift: string;
  room: string;
  versionId: string;
}
interface ExamVersion {
  key: string;
  id: string;
  name: string;
  isShowTable: boolean;
  column: ColumnsType<DataType>[];
  data: DataType[];
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
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
    onCancel,
  } = props;
  const [wardOptionC, setWardOptionC] = useState<SelectOptionModel[]>(
    wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfo?.contactAddressDistrictId;
    }),
  );

  const [districtOptionC, setDistrictOptionC] = useState<SelectOptionModel[]>(
    districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfo?.contactAddressCityId;
    }),
  );

  const onChangeProvince = async (id: string) => {
    const responseDistrict = districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    form.setFieldValue('contactAddressWardsId', null);
    form.setFieldValue('contactAddressDistrictId', null);
    setDistrictOptionC(responseDistrict);
    setWardOptionC([]);
  };
  const [typeIdActive, setTypeIdActive] = useState<number>(values.userInfo?.typeIdCard as string == '4' ? 1 : 2);

  const onChange = (key: string) => {
    if (key == '4') {
      setTypeIdActive(1);
    } else {
      setTypeIdActive(2);
    }
  };
  const showPdf = (base64EncodedPDF: string) => {
    var pdf_newTab = window.open("");

    pdf_newTab?.document.write(
      "<html><head><title>Giấy xác nhận cho" + values.userInfo?.fullName + "</title></head><body><iframe title='MY title'  width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(base64EncodedPDF) + "'></iframe></body></html>"
    );
  };


  const onChangeDistrict = async (id: string) => {
    const responseWard = wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setWardOptionC(responseWard);
  };

  const formVals: ManageRegisteredCandidateTopikModel = {
    id: values.id,
    areaTest: values.areaTest,
    placeTest: values.placeTest,
    testScheduleId: values.testScheduleId,
    userProfileId: values.userProfileId,
    userId: values.userId,
    examPurpose: values?.examPurpose,
    examId: values?.examId,
    examInfo: values?.examInfo,
    userInfo: values?.userInfo,
    isPaid: values.isPaid,
    knowWhere: values.knowWhere,
    isTestTOPIK: values.isTestTOPIK,
  };
  const [form] = Form.useForm();

  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      if (
        moment(formVals.userInfo?.dob).format('YYYY-MM-DD') != dayjs(fieldsValue.dob).format('YYYY-MM-DD') ||
        formVals.userInfo?.fullName != fieldsValue.fullName ||
        formVals.userInfo?.fullNameKorea != fieldsValue.fullNameKorea ||
        formVals.userInfo?.sex != fieldsValue.sex ||
        formVals.userInfo?.cccd != fieldsValue.cccd ||
        formVals.userInfo?.cmnd != fieldsValue.cmnd ||
        moment(formVals.userInfo?.dateOfCCCD).format('YYYY-MM-DD') !=
        dayjs(fieldsValue.dateOfCCCD).format('YYYY-MM-DD') ||
        formVals.userInfo?.placeOfCCCD != fieldsValue.placeOfCCCD ||
        formVals.userInfo?.passport != fieldsValue.passport ||
        formVals.userInfo?.otherPapers != fieldsValue.otherPapers ||
        formVals.userInfo?.sdt != fieldsValue.sdt ||
        formVals.userInfo?.email != fieldsValue.email ||
        formVals.userInfo?.contactAddressCityId != fieldsValue.contactAddressCityId ||
        formVals.userInfo?.contactAddressDistrictId != fieldsValue.contactAddressDistrictId ||
        formVals.userInfo?.contactAddressWardsId != fieldsValue.contactAddressWardsId ||
        formVals.userInfo?.contactAddress != fieldsValue.contactAddress ||
        formVals.userInfo?.typeIdCard != fieldsValue.typeIdCard ||
        (formVals.userInfo?.isKorean == 'true') != fieldsValue.isKorean ||
        formVals.userInfo?.languageCode != fieldsValue.languageCode ||
        formVals.userInfo?.countryCode != fieldsValue.countryCode ||
        (formVals.userInfo?.birthCertificate != birthCertificate.replace('data:image/jpeg;base64,', '') && birthCertificate != '../src/assets/images/image.png') ||
        (formVals.userInfo?.frontImgCCCD != frontImgCCCD.replace('data:image/jpeg;base64,', '') && frontImgCCCD != '../src/assets/images/image.png') ||
        (formVals.userInfo?.backImgCCCD != backImgCCCD.replace('data:image/jpeg;base64,', '') && backImgCCCD != '../src/assets/images/image.png') ||
        (formVals.userInfo?.imG3X4 != imG3X4.replace('data:image/jpeg;base64,', '') && imG3X4 != '../src/assets/images/image.png') ||
        formVals.userInfo?.job != fieldsValue.job ||
        formVals.userInfo?.optionJob != fieldsValue.optionJob ||
        formVals.userInfo?.isDisabilities != fieldsValue.isDisabilities
      ) {
        fieldsValue.isChangeUserInfo = true;
        fieldsValue.birthCertificate = birthCertificate != '../src/assets/images/image.png' ? birthCertificate : null;
        fieldsValue.frontImgCCCD = frontImgCCCD != '../src/assets/images/image.png' ? frontImgCCCD : null
        fieldsValue.backImgCCCD = backImgCCCD != '../src/assets/images/image.png' ? backImgCCCD : null
        fieldsValue.imG3X4 = imG3X4 != '../src/assets/images/image.png' ? imG3X4 : null
        formVals.userInfo = fieldsValue;
      }

      var formData = {
        Id: formVals.id,
        UserId: formVals.userId,
        ExamPurpose: fieldsValue.examPurpose,
        KnowWhere: fieldsValue.knowWhere,
        IsTestTOPIK: fieldsValue.isTestTOPIK,
        "UserInfo.FullName": fieldsValue.fullName,
        "UserInfo.FullNameKorea": fieldsValue.fullNameKorea,
        "UserInfo.CCCD": fieldsValue.typeIdCard == "2" ? fieldsValue.cccd : "",
        "UserInfo.IsKorean": fieldsValue.isKorean ? 'true' : 'false',
        "UserInfo.IsDisabilities": fieldsValue.isDisabilities,
        "UserInfo.Country": fieldsValue.country,
        "UserInfo.DOBString": moment(fieldsValue.dob).format('YYYY/MM/DD'),
        "UserInfo.Sex": fieldsValue.sex,
        "UserInfo.CMND": fieldsValue.typeIdCard == "1" ? fieldsValue.cmnd : "",
        "UserInfo.Passport": fieldsValue.typeIdCard == "3" ? fieldsValue.passport : "",
        "UserInfo.DateOfCCCDString": typeIdActive == 2 ? moment(fieldsValue.dateOfCCCD).format('YYYY/MM/DD') : "",
        "UserInfo.PlaceOfCCCD": fieldsValue.placeOfCCCD,
        "UserInfo.OtherPapers": fieldsValue.otherPapers,
        "UserInfo.SDT": fieldsValue.sdt,
        "UserInfo.IDNumber": fieldsValue.idNumber,
        "UserInfo.TypeIdCard": fieldsValue.typeIdCard,
        "UserInfo.Email": fieldsValue.email,
        "UserInfo.Job": fieldsValue.job,
        "UserInfo.OptionJob": fieldsValue.optionJob,
        "UserInfo.ContactAddressCityId": fieldsValue.contactAddressCityId,
        "UserInfo.ContactAddressDistrictId": fieldsValue.contactAddressDistrictId,
        "UserInfo.ContactAddressWardsId": fieldsValue.contactAddressWardsId,
        "UserInfo.ContactAddress": fieldsValue.contactAddress,
        "UserInfo.FrontImgCCCDFile": frontImgCCCDFile as Blob,
        "UserInfo.BackImgCCCDFile": backImgCCCDFile as Blob,
        "UserInfo.IMG3X4File": imG3X4File as Blob,
        "UserInfo.BirthCertificateFile": birthCertificateFile as Blob,
        "UserInfo.CountryCode": fieldsValue.countryCode,
        "UserInfo.LanguageCode": fieldsValue.languageCode,
        IsChangeUserInfo: fieldsValue.isChangeUserInfo,
      }
      onSubmit(formData, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };

  const [frontImgCCCDFile, setFrontImgCCCDFile] = useState<Blob>(base64toBlob(formVals.userInfo?.frontImgCCCD as string) as Blob);
  const [backImgCCCDFile, setBackImgCCCDFile] = useState<Blob>(base64toBlob(formVals.userInfo?.backImgCCCD as string) as Blob);
  const [imG3X4File, setImG3X4File] = useState<Blob>(base64toBlob(formVals.userInfo?.imG3X4 as string) as Blob);
  const [birthCertificateFile, setBirthCertificateFile] = useState<Blob>(base64toBlob(formVals.userInfo?.birthCertificate as string, 'application/pdf') as Blob);

  const [frontImgCCCD, setFrontImgCCCD] = useState<string>(formVals.userInfo?.frontImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.frontImgCCCD}` as string : '../src/assets/images/image.png');
  const [backImgCCCD, setBackImgCCCD] = useState<string>(formVals.userInfo?.backImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.backImgCCCD}` as string : '../src/assets/images/image.png');
  const [imG3X4, setImG3X4] = useState<string>(formVals.userInfo?.imG3X4 != null ? `data:image/jpeg;base64,${values.userInfo?.imG3X4}` as string : '../src/assets/images/image.png');
  const [birthCertificate, setBirthCertificate] = useState<string>(formVals.userInfo?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfo?.birthCertificate}` as string : '../src/assets/images/image.png');

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const frontImgCCCDUpload: UploadProps = {
    name: 'file',
    async onChange(info) {
      setFrontImgCCCDFile(info.file.originFileObj as RcFile)
      const bae = await getBase64(info.file.originFileObj as RcFile);
      setFrontImgCCCD(bae)
    },
  };
  const backImgCCCDUpload: UploadProps = {
    name: 'file',
    async onChange(info) {
      setBackImgCCCDFile(info.file.originFileObj as RcFile)
      const bae = await getBase64(info.file.originFileObj as RcFile);
      setBackImgCCCD(bae)
    },
  };
  const imG3X4Upload: UploadProps = {
    name: 'file',
    async onChange(info) {
      setImG3X4File(info.file.originFileObj as RcFile)
      const bae = await getBase64(info.file.originFileObj as RcFile);
      setImG3X4(bae)
    },
  };
  const birthCertificateUpload: UploadProps = {
    name: 'file',
    async onChange(info) {
      setBirthCertificateFile(info.file.originFileObj as RcFile)
      const bae = await getBase64(info.file.originFileObj as RcFile);
      setBirthCertificate(bae)
    },
  };
  return (
    <>
      <Modal
        destroyOnClose
        width={'65%'}
        bodyStyle={{ height: '75vh', overflowY: 'scroll', fontSize: 36, marginLeft: 20 }}
        maskClosable={false}
        title='Sửa'
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
        <Form
          form={form}
          name='editform'
          labelCol={{ span: 19 }}
          wrapperCol={{ span: 10 }}
          initialValues={{
            id: formVals.id,
            userProfileId: formVals.userProfileId,
            areaTest: formVals.areaTest,
            placeTest: formVals.placeTest,
            isTestTOPIK: formVals.isTestTOPIK,
            isPaid: formVals.isPaid,
            testScheduleId: formVals.testScheduleId,
            examPurpose: formVals?.examPurpose,
            knowWhere: formVals?.knowWhere,
            examId: formVals?.examId,
            countryCode: formVals.userInfo?.countryCode,
            languageCode: formVals.userInfo?.languageCode,
            isKorean: formVals?.userInfo?.isKorean == 'true' ? true : false,
            userInfo: formVals?.userInfo,
            fullName: formVals?.userInfo?.fullName,
            typeIdCard: formVals?.userInfo?.typeIdCard,
            isDisabilities: formVals?.userInfo?.isDisabilities,
            fullNameKorea: formVals?.userInfo?.fullNameKorea,
            dob: moment(formVals?.userInfo?.dob),
            sex: formVals?.userInfo?.sex,
            cccd: formVals?.userInfo?.typeIdCard == typeIdCardString.CCCD ? formVals?.userInfo?.cccd : null,
            passport: formVals?.userInfo?.typeIdCard == typeIdCardString.Passport ? formVals?.userInfo?.passport : null,
            otherPapers: formVals?.userInfo?.otherPapers,
            dateOfCCCD: formVals?.userInfo?.dateOfCCCD != null ? moment(formVals?.userInfo?.dateOfCCCD) : undefined,
            placeOfCCCD: formVals?.userInfo?.placeOfCCCD,
            cmnd: formVals?.userInfo?.typeIdCard == typeIdCardString.CMND ? formVals?.userInfo?.cmnd : null,
            sdt: formVals?.userInfo?.sdt,
            email: formVals?.userInfo?.email,
            contactAddressWardsId: formVals?.userInfo?.contactAddressWardsId,
            contactAddressCityId: formVals?.userInfo?.contactAddressCityId,
            contactAddressDistrictId: formVals?.userInfo?.contactAddressDistrictId,
            contactAddress: formVals?.userInfo?.contactAddress,
            job: formVals?.userInfo?.job,
            optionJob: formVals?.userInfo?.optionJob,
            workAddress: formVals?.userInfo?.workAddress,
            workAddressCityId: formVals?.userInfo?.workAddressCityId,
            workAddressDistrictId: formVals?.userInfo?.workAddressDistrictId,
            workAddressWardsId: formVals?.userInfo?.workAddressWardsId,
          }}
        >
          <Tabs
            defaultActiveKey='1'
            items={[
              {
                label: 'Thông tin cá nhân',
                key: '1',
                children: (
                  <>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Họ và tên tiếng Anh'
                          name='fullName'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
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
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Họ và tên tiếng Hàn'
                          name='fullNameKorea'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
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
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Ngày sinh'
                          name='dob'
                          labelAlign='right'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <DatePicker format={'DD-MM-YYYY'} placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Loại giấy tờ'
                          name='typeIdCard'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} onChange={(e) => onChange(e)}>
                            <Select.Option key={typeIdCard.CMND}>CMND</Select.Option>
                            <Select.Option key={typeIdCard.CCCD}>CCCD</Select.Option>
                            <Select.Option key={typeIdCard.Passport}>Passport</Select.Option>
                            <Select.Option key={typeIdCard.DinhDanh}>Khác</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Căn cước công dân'
                          name='cccd'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder='Nhập CCCD' />
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label='Ngày cấp'
                          name='dateOfCCCD'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                          rules={[
                            {
                              required: typeIdActive == 2,
                              validator: async (rule, value) => {
                                if (typeIdActive == 2 && value === '') {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <DatePicker format={'DD-MM-YYYY'} placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='CMND'
                          name='cmnd'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder='Nhập CMND khác' />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Hộ chiếu'
                          name='passport'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder='Nhập hộ chiếu' />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Nơi cấp'
                          name='placeOfCCCD'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                          rules={[
                            {
                              required: typeIdActive == 2,
                              validator: async (rule, value) => {
                                if (typeIdActive == 2 && value === '') {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder='Nhập nơi cấp' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>


                      <Col span={8}>
                        <Form.Item
                          label='Chọn quốc tịch'
                          name='countryCode'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} options={countryOption}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Chọn ngôn ngữ'
                          name='languageCode'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} options={languageOption}></Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Giới tính'
                          name='sex'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
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
                            <Radio value={'man'}>Nam</Radio>
                            <Radio value={'woman'}>Nữ</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Có phải Hàn kiều'
                          name='isKorean'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Radio.Group>
                            <Radio value={true}>Có</Radio>
                            <Radio value={false}>Không</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Có phải thí sinh khuyết tật'
                          name='isDisabilities'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Radio.Group>
                            <Radio value={true}>Có</Radio>
                            <Radio value={false}>Không</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider orientation='left' plain>
                      Thông tin liên hệ
                    </Divider>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Số điện thoại'
                          name='sdt'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
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
                          <Input placeholder='Nhập số điện thoại' />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Email'
                          name='email'
                          labelAlign='right'
                          labelCol={{ span: 24 }}
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
                          <Input placeholder='Nhập email' />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Số nhà/đường phố'
                          name='contactAddress'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 22 }}
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
                          <Input placeholder='Nhập số nhà' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Tỉnh/thành phố'
                          name='contactAddressCityId'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} options={provinceOption} onChange={onChangeProvince}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Quận huyện'
                          name='contactAddressDistrictId'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} options={districtOptionC} onChange={onChangeDistrict}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Xã/phường'
                          name='contactAddressWardsId'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select placeholder={'Chọn'} options={wardOptionC}></Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Item
                          label='Nghề nghiệp'
                          name='optionJob'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                              <Col span={8}>
                                <Checkbox value='1'>Học sinh, sinh viên</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='2'>Công chức, viên chức</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='3'>Nhân viên văn phòng</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='4'>Kinh doanh tự do</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='5'>Nội trợ</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='6'>Giáo viên</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='8'>Khác</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value='7'>Thất nghiệp</Checkbox>
                              </Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                        <Form.Item
                          label='Nghề nghiệp khác'
                          name='job'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 255) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder='Nhập nghề nghiệp' />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                label: 'Thông tin thi',
                key: '2',
                children: (
                  <>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Khu vực thi'
                          name='areaTest'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 18 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select disabled placeholder='Chọn khu vực' options={areaOption} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Địa điểm thi'
                          name='placeTest'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 18 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select disabled placeholder='Chọn địa điểm' options={placeOption} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Đã từng thi Topik'
                          name='isTestTOPIK'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Radio.Group>
                            <Radio value={false}>Chưa thi</Radio>
                            <Radio value={true}>Đã thi</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Lịch thi'
                          name='testScheduleId'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 18 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select disabled placeholder='Chọn lịch thi' options={examSchedule} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Bài thi'
                          name='examId'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 18 }}
                          rules={[
                            {
                              required: true,
                              validator: async (rule, value) => {
                                if (value === '' || !value) {
                                  throw new Error('Không được để trống');
                                }
                              },
                            },
                          ]}
                        >
                          <Select disabled placeholder='Chọn địa điểm' options={examOption} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label='Mục đích dự thi'
                      name='examPurpose'
                      labelAlign='left'
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          validator: async (rule, value) => {
                            if (value === '' || !value) {
                              throw new Error('Không được để trống');
                            }
                          },
                        },
                      ]}
                    >
                      <Checkbox.Group style={{ width: '100%' }}>
                        <Row>
                          <Col span={8}>
                            <Checkbox value='1'>Du học</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='2'>Xin việc</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='3'>Du lịch</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='4'>Nghiên cứu</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='5'>Kiểm tra năng lực tiếng Hàn</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='6'>Tìm hiểu văn hóa HQ</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='10'>Tham gia hoạt động xã hội</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='8'>Xin VISA hoặc Thẻ cư trú</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='9'>Đạt thành tích học tập</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='11'>Quản lý tư cách lưu trú</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='7'>Khác</Checkbox>
                          </Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                    <Form.Item
                      label='Biết đến kỳ thi qua đâu'
                      name='knowWhere'
                      labelAlign='left'
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          validator: async (rule, value) => {
                            if (value === '' || !value) {
                              throw new Error('Không được để trống');
                            }
                          },
                        },
                      ]}
                    >
                      <Checkbox.Group style={{ width: '100%' }}>
                        <Row>
                          <Col span={8}>
                            <Checkbox value='1'>Truyền hình</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='2'>Báo chí</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='3'>Tạp chí</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='4'>Cơ sở GD</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='5'>Poster</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='6'>Người quen</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='8'>Internet</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='9'>Khác</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='7'>Bạn bè</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='10'>Người thân (gia đình, bạn bè,...)</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value='11'>Trang chủ TOPIK</Checkbox>
                          </Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                    <Divider orientation='left'>Thông tin thi</Divider>
                    <Row gutter={24}>
                      <Col span={4} className='textRight'>
                        <label>Ngày thi: </label>
                        <br />
                        <br />
                        <label>SBD: </label>
                        <br />
                      </Col>
                      <Col span={4} className='fontBold'>
                        <span>{dayjs(formVals.examInfo?.dateTest).format('YYYY-MM-DD')}</span>
                        <br />
                        <br />
                        <span>{formVals.examInfo?.sbd}</span>
                        <br />
                      </Col>
                      <Col span={4} className='textRight'>
                        <label>Giờ thi: </label>
                        <br />
                      </Col>
                      <Col span={4} className='fontBold'>
                        <span>{formVals.examInfo?.timeTest}</span>
                        <br />
                      </Col>
                      <Col span={4} className='textRight'>
                        <label>Ca thi: </label>
                        <br />
                      </Col>
                      <Col span={4} className='fontBold'>
                        <span>{formVals.examInfo?.examShift}</span>
                        <br />
                      </Col>
                    </Row>
                    <br />
                    <Row gutter={24}>
                      <Col>Trạng thái thanh toán:</Col>
                      <Col>
                        <span className='fontBold'>
                          {formVals.isPaid == 1
                            ? 'Chưa thanh toán'
                            : formVals.isPaid == 2
                              ? 'Đã thanh toán'
                              : formVals.isPaid == 3
                                ? 'Quá hạn thanh toán'
                                : 'Không thanh toán'}
                        </span>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                label: 'Thông tin hồ sơ',
                key: '3',
                children: (
                  <>
                    <label style={{ fontWeight: 'bold', fontSize: 14 }}>Hồ sơ đính kèm</label>
                    <Divider></Divider>
                    <Row gutter={24}>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Mặt trước CCCD/CMND/Khai sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={frontImgCCCD}
                        />
                        <br />
                        <br />
                        <Upload {...frontImgCCCDUpload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Mặt sau CCCD/CMND/Khai sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={backImgCCCD}
                        />
                        <br />
                        <br />
                        <Upload {...backImgCCCDUpload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Hình 3x4 cm</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={imG3X4}
                        />
                        <br />
                        <br />
                        <Upload {...imG3X4Upload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>
                    </Row>
                    <Divider></Divider>
                    <Row gutter={24}>

                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Ảnh giấy khai sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={birthCertificate}
                        />
                        <br />
                        <br />
                        <Upload {...birthCertificateUpload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>

                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Giấy xác nhận của trường</label>
                        <br />
                        <Button onClick={() => showPdf(values.userInfo?.schoolCertificate as string)}>Xem file</Button>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </>
  );
};

export default UpdateForm;
function getBase64(arg0: RcFile): string | PromiseLike<string | undefined> | undefined {
  throw new Error('Function not implemented.');
}

