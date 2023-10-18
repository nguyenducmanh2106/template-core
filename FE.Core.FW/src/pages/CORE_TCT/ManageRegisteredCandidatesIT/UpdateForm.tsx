import React, { useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  DatePicker,
  Select,
  Tabs,
  Row,
  Col,
  Radio,
  RadioChangeEvent,
  Divider,
  Table,
  Image,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ExamRoomModel, ExamVersionModel, OptionModel, SelectOptionModel, ManageRegisteredUpdateCandidateITModel, ExamTestInfo } from '@/apis/models/data';
import { ResponseData } from '@/apis/models/ResponseData';
import { getExamVersion, getPriorityObject } from '@/apis/services/PageService';
import { ConvertExamInfoToForm, ConvertExamVersionOptionModel, ConvertOptionSelectModel, base64toBlob } from '@/utils/convert';
import { ColumnsType } from 'antd/lib/table';
import ListExemVersion from '@/components/ManageRegisteredCandidates/ListExemVersion/ListExemVersion';
import ExamTestSchedule from '@/components/ManageRegisteredCandidates/ExamTestSchedule/ExamTestSchedule';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { getHistoryByName } from '@/apis/services/ManageRegisteredCandidatesService';
import { HistoryRegisteredModel } from '@/apis/models/HistoryRegisteredModel';
import Upload, { RcFile, UploadProps } from 'antd/lib/upload';
import { UploadOutlined } from '@ant-design/icons';
import { typeIdCard } from '@/utils/constants';
import EditFormExam from './EditFormExam';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  values: Partial<ManageRegisteredUpdateCandidateITModel>;
  onSubmitLoading: boolean;
  provinceOption: SelectOptionModel[];
  districtOption: SelectOptionModel[];
  wardOption: SelectOptionModel[];
  examShift: SelectOptionModel[];
  exam: SelectOptionModel[];
  examRooms: ExamRoomModel[];
  onSubmit: (values: any, isDuplicate: boolean, form: FormInstance) => void;
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
}
const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
  const { visible, values, onSubmit, onSubmitLoading, provinceOption, districtOption, wardOption, examShift, examRooms, onCancel } = props;
  const [examVersionOption, setExamVersionOption] = useState<ExamVersionModel[]>([]);
  const [options, setOptions] = useState<SelectOptionModel[]>([]);
  const [priorityObject, setPriorityObject] = useState<SelectOptionModel[]>([]);
  const [value, setValue] = useState<string | undefined>(undefined);
  const [isTestedTopik, setIsTestedTopik] = useState<boolean>(values.isTested as boolean);
  const [valueSex, setValueSex] = useState(1);
  const [versionChoose, setVersionChoose] = useState<string>('');
  const [dataFormVisible, setDataFormVisible] = useState<boolean>(false);
  const [modelExamVersion, setModelExamVersion] = useState<boolean>(false);
  const [testSchedule, setTestSchedule] = useState<boolean>(false);
  const [arr, setArr] = useState<ExamVersion[]>([]);
  const [examCalendar, setExamCalendar] = useState<DataType[]>();
  const [showExamCalendar, setShowExamCalendar] = useState<boolean>(false);
  const [examScheduleId, setExamScheduleId] = useState<string>();

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  const getData = async (): Promise<void> => {
    const responsePriorityObject: ResponseData = await getPriorityObject();
    setPriorityObject(ConvertOptionSelectModel<OptionModel>(responsePriorityObject.data as OptionModel[]))
    var serviceTemp: SelectOptionModel[] = []
    setOptions(serviceTemp)

  };
  useEffect(() => {
    getData();
  }, []);
  const formVals: ManageRegisteredUpdateCandidateITModel = {
    id: values.id,
    examPurpose: values?.examPurpose,
    examName: values?.examName,
    scoreGoal: values?.scoreGoal,
    isTested: values?.isTested as boolean,
    testDate: values?.testDate,
    userInfoITModel: values?.userInfoITModel,
    examTestInfo: values.examTestInfo,
    examVersions: values.examVersions,
  };
  const [form] = Form.useForm();

  const createSubmit = async (data: ExamVersionModel) => {
    const checkExits = arr.find((p) => p.id == data.id);
    if (checkExits == undefined || checkExits == null) {
      arr.push({
        name: data.name,
        key: data.id as string,
        id: data.id as string,
        isShowTable: false,
      } as ExamVersion)
      setArr(arr);
    }

    setModelExamVersion(false);
  };

  const chooseExamSchedule = async (data: ExamCalendarModel, id: string) => {
    const input: DataType[] = [
      {
        key: data.id as string,
        date: dayjs(data.dateTest).format('YYYY-MM-DD'),
        shift: data.examShift as string,
        room: data.room as string,
        time: data.timeTest as string,
        versionId: id as string,
      },
    ];
    setExamScheduleId(data.id as string)
    setExamCalendar(input);
    setShowExamCalendar(true)
    setTestSchedule(false);
  };

  useEffect(() => {
  });

  const closeModal = async () => {
    setModelExamVersion(false);
  };

  const closeModalExamSchedule = async () => {
    setTestSchedule(false);
  };

  const [wardOptionC, setWardOptionC] = useState<SelectOptionModel[]>(
    wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfoITModel?.contactAddressDistrictId;
    }),
  );

  const [districtOptionC, setDistrictOptionC] = useState<SelectOptionModel[]>(
    districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfoITModel?.contactAddressCityId;
    }),
  );

  const [wardOptionW, setWardOptionW] = useState<SelectOptionModel[]>(
    wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfoITModel?.workAddressDistrictId;
    }),
  );

  const [districtOptionW, setDistrictOptionW] = useState<SelectOptionModel[]>(
    districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfoITModel?.workAddressCityId;
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

  const onChangeDistrict = async (id: string) => {
    const responseWard = wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setWardOptionC(responseWard);
    form.setFieldValue('contactAddressWardsId', null);
  };
  const onChangeProvinceW = async (id: string) => {
    const responseDistrict = districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    form.setFieldValue('workAddressWardsId', null);
    form.setFieldValue('workAddressDistrictId', null);
    setDistrictOptionW(responseDistrict);
    setWardOptionW([]);
  };

  const onChangeDistrictW = async (id: string) => {
    const responseWard = wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == id;
    });
    setWardOptionW(responseWard);
    form.setFieldValue('workAddressWardsId', null);
  };
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

  const onChangeRadio = (e: RadioChangeEvent) => {
    setIsTestedTopik(e.target.value);
  };
  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      if (
        moment(formVals.userInfoITModel?.birthday).format('YYYY-MM-DD') != fieldsValue.birthday.format('YYYY-MM-DD') ||
        formVals.userInfoITModel?.fullName != fieldsValue.fullName ||
        formVals.userInfoITModel?.sex != fieldsValue.sex ||
        formVals.userInfoITModel?.typeIdCard != fieldsValue.typeIdCard ||
        formVals.userInfoITModel?.idNumber != fieldsValue.idNumber ||
        moment(formVals.userInfoITModel?.dateOfCCCD).format('YYYY-MM-DD') != fieldsValue.dateOfCCCD.format('YYYY-MM-DD') ||
        formVals.userInfoITModel?.placeOfCCCD != fieldsValue.placeOfCCCD ||
        formVals.userInfoITModel?.phone != fieldsValue.phone ||
        formVals.userInfoITModel?.email != fieldsValue.email ||
        formVals.userInfoITModel?.contactAddressCityId != fieldsValue.contactAddressCityId ||
        formVals.userInfoITModel?.contactAddressDistrictId != fieldsValue.contactAddressDistrictId ||
        formVals.userInfoITModel?.contactAddressWardId != fieldsValue.contactAddressWardsId ||
        formVals.userInfoITModel?.contactAddress != fieldsValue.contactAddress ||
        formVals.userInfoITModel?.job != fieldsValue.job ||
        (formVals.userInfoITModel?.birthCertificate != (birthCertificate as string).replace('data:image/jpeg;base64,', '') && birthCertificate != null) ||
        (formVals.userInfoITModel?.idCardFront != (idCardFront as string).replace('data:image/jpeg;base64,', '') && idCardFront != null) ||
        (formVals.userInfoITModel?.idCardBack != (idCardBack as string).replace('data:image/jpeg;base64,', '') && idCardBack != null) ||
        (formVals.userInfoITModel?.image3x4 != (image3x4 as string).replace('data:image/jpeg;base64,', '') && image3x4 != null)
      ) {
        fieldsValue.isChangeUserInfo = true;
      } else {
        fieldsValue.isChangeUserInfo = false;
      }
      var formData = {
        Id: values.id,
        ExamPurpose: fieldsValue.examPurpose,
        ScoreGoal: fieldsValue.scoreGoal,
        IsTested: fieldsValue.isTested,
        IsChangeUserInfo: fieldsValue.isChangeUserInfo,
        TestDate: fieldsValue.testDate != null ? fieldsValue.testDate.format('YYYY/MM/DD') : null,
        ExamTestInfo: fieldsValue.examTestInfo,
        "UserInfoITModel.CandidateRegisterId": values.id,
        "UserInfoITModel.FullName": fieldsValue.fullName,
        "UserInfoITModel.UserName": fieldsValue.userName,
        "UserInfoITModel.Phone": fieldsValue.phone,
        "UserInfoITModel.Birthday": fieldsValue.birthday.format('YYYY/MM/DD'),
        "UserInfoITModel.Sex": fieldsValue.sex,
        "UserInfoITModel.TypeIdCard": fieldsValue.typeIdCard,
        "UserInfoITModel.IDNumber": fieldsValue.idNumber,
        "UserInfoITModel.Job": fieldsValue.job,
        "UserInfoITModel.DateOfCCCD": fieldsValue.dateOfCCCD != null ? fieldsValue.dateOfCCCD.format('YYYY/MM/DD') : null,
        "UserInfoITModel.PlaceOfCCCD": fieldsValue.placeOfCCCD,
        "UserInfoITModel.Email": fieldsValue.email,
        "UserInfoITModel.ContactAddressCityId": fieldsValue.contactAddressCityId,
        "UserInfoITModel.ContactAddressDistrictId": fieldsValue.contactAddressDistrictId,
        "UserInfoITModel.ContactAddressWardId": fieldsValue.contactAddressWardId,
        "UserInfoITModel.ContactAddress": fieldsValue.contactAddress,
        "UserInfoITModel.Language": fieldsValue.language,
        "UserInfoITModel.IDCardFrontFile": frontImgCCCDFile,
        "UserInfoITModel.IDCardBackFile": backImgCCCDFile,
        "UserInfoITModel.BirthCertificateFile": birthCertificateFile,
        "UserInfoITModel.SchoolCertificateFile": studentCardImageFile,
        "UserInfoITModel.Image3x4File": imG3X4File,
        "UserInfoITModel.WorkAddressDistrictId": fieldsValue.workAddressDistrictId,
        "UserInfoITModel.WorkAddressWardsId": fieldsValue.workAddressWardsId,
        "UserInfoITModel.WorkAddressCityId": fieldsValue.workAddressCityId,
        "UserInfoITModel.WorkAddress": fieldsValue.workAddress,
        "UserInfoITModel.OldCardIDNumber": fieldsValue.oldCardIDNumber,
        "UserInfoITModel.OldCardID": fieldsValue.oldCardID,
        "UserInfoITModel.IsStudent": fieldsValue.isStudent,
        "UserInfoITModel.AllowUsePersonalData": fieldsValue.allowUsePersonalData,
        "UserInfoITModel.StudentCode": fieldsValue.studentCode,
      }
      onSubmit(formData, true, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };

  const [frontImgCCCDFile, setFrontImgCCCDFile] = useState<Blob | null>(formVals.userInfoITModel?.idCardFront != undefined ? base64toBlob(formVals.userInfoITModel?.idCardFront as string) as Blob : null);
  const [backImgCCCDFile, setBackImgCCCDFile] = useState<Blob | null>(formVals.userInfoITModel?.idCardBack != undefined ? base64toBlob(formVals.userInfoITModel?.idCardBack as string) as Blob : null);
  const [imG3X4File, setImG3X4File] = useState<Blob | null>(formVals.userInfoITModel?.image3x4 != undefined ? base64toBlob(formVals.userInfoITModel?.image3x4 as string) as Blob : null);
  const [studentCardImageFile, setStudentCardImageFile] = useState<Blob | null>(formVals.userInfoITModel?.schoolCertificate != undefined ? base64toBlob(formVals.userInfoITModel?.schoolCertificate as string) as Blob : null);
  const [birthCertificateFile, setBirthCertificateFile] = useState<Blob | null>(formVals.userInfoITModel?.birthCertificate != undefined ? base64toBlob(formVals.userInfoITModel?.birthCertificate as string, 'application/pdf') as Blob : null);
  const [idCardFront, setFrontImgCCCD] = useState<string | null>(formVals.userInfoITModel?.idCardFront != null ? `data:image/jpeg;base64,${values.userInfoITModel?.idCardFront}` as string : null);
  const [idCardBack, setBackImgCCCD] = useState<string | null>(formVals.userInfoITModel?.idCardBack != null ? `data:image/jpeg;base64,${values.userInfoITModel?.idCardBack}` as string : null);
  const [image3x4, setImG3X4] = useState<string | null>(formVals.userInfoITModel?.image3x4 != null ? `data:image/jpeg;base64,${values.userInfoITModel?.image3x4}` as string : null);
  const [birthCertificate, setBirthCertificate] = useState<string | null>(formVals.userInfoITModel?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfoITModel?.birthCertificate}` as string : null);
  const [studentCardImage, setStudentCardImage] = useState<string | null>(formVals.userInfoITModel?.schoolCertificate != null ? `data:image/jpeg;base64,${values.userInfoITModel?.schoolCertificate}` as string : null);

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
  const studentCardImageUpload: UploadProps = {
    name: 'file',
    async onChange(info) {
      setStudentCardImageFile(info.file.originFileObj as RcFile)
      const bae = await getBase64(info.file.originFileObj as RcFile);
      setStudentCardImage(bae)
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
        maskClosable={false}
        title='Chọn phiên bản'
        open={modelExamVersion}
        centered
        onCancel={closeModal}
        footer={[
          <Button key='back' onClick={() => closeModal()}>
            Hủy
          </Button>,
        ]}
      >
        <ListExemVersion
          examVersionOption={examVersionOption}
          visible={dataFormVisible}
          onSubmit={createSubmit}
          onCancel={closeModal}
        />
      </Modal>
      <Modal
        destroyOnClose
        width={'55%'}
        maskClosable={false}
        title='Chọn lịch thi'
        open={testSchedule}
        centered
        onCancel={closeModalExamSchedule}
        footer={[
          <Button key='back' onClick={() => closeModalExamSchedule()}>
            Hủy
          </Button>,
        ]}
      >
        <ExamTestSchedule examRooms={examRooms} examShift={examShift} onSubmit={chooseExamSchedule} onCancel={closeModalExamSchedule} versionId={versionChoose} />
      </Modal>
      <Modal
        destroyOnClose
        width={'75%'}
        bodyStyle={{ height: '75vh', overflowY: 'scroll', fontSize: 36 }}
        maskClosable={false}
        title='Sửa'
        open={visible}
        onCancel={onCancel}
        footer={[
          <>
            <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
              Cập nhật
            </Button>
          </>
          ,
        ]}
      >
        <Form
          form={form}
          name='editform'
          labelCol={{ span: 8 }}
          initialValues={{
            id: formVals.id,
            examPurpose: formVals?.examPurpose,
            scoreGoal: formVals?.scoreGoal,
            isTested: formVals?.isTested,
            testDate: moment(formVals?.testDate),
            userInfoITModel: formVals?.userInfoITModel,
            fullName: formVals?.userInfoITModel?.fullName,
            birthday: moment(formVals?.userInfoITModel?.birthday),
            sex: formVals?.userInfoITModel?.sex,
            idNumber: formVals?.userInfoITModel?.idNumber,
            typeIdCard: formVals.userInfoITModel?.typeIdCard,
            dateOfCCCD: moment(formVals?.userInfoITModel?.dateOfCCCD),
            placeOfCCCD: formVals?.userInfoITModel?.placeOfCCCD,
            isStudent: formVals?.userInfoITModel?.isStudent,
            phone: formVals?.userInfoITModel?.phone,
            email: formVals?.userInfoITModel?.email,
            contactAddressWardId: formVals?.userInfoITModel?.contactAddressWardId,
            contactAddressCityId: formVals?.userInfoITModel?.contactAddressCityId,
            contactAddressDistrictId: formVals?.userInfoITModel?.contactAddressDistrictId,
            contactAddress: formVals?.userInfoITModel?.contactAddress,
            job: formVals?.userInfoITModel?.job,
            optionJob: formVals?.userInfoITModel?.optionJob,
            workAddress: formVals?.userInfoITModel?.workAddress,
            workAddressCityId: formVals?.userInfoITModel?.workAddressCityId,
            workAddressDistrictId: formVals?.userInfoITModel?.workAddressDistrictId,
            workAddressWardsId: formVals?.userInfoITModel?.workAddressWardsId,
            examTestInfo: ConvertExamInfoToForm(formVals.examTestInfo as Array<ExamTestInfo>)
          }}
        >
          <Tabs
            defaultActiveKey='1'
            onChange={onChange}
            items={[
              {
                label: 'Thông tin cá nhân',
                key: '1',
                children: (
                  <>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Họ và tên'
                          name='fullName'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                      <Col span={6}>
                        <Form.Item
                          label='Ngày sinh'
                          name='birthday'
                          labelAlign='right'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <DatePicker format={'YYYY-MM-DD'} placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Giới tính'
                          name='sex'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <Radio.Group onChange={onChangeRadio} value={valueSex}>
                            <Radio value={'man'}>Nam</Radio>
                            <Radio value={'woman'}>Nữ</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Nghề nghiệp'
                          name='job'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <Input placeholder='Nhập nghề nghiệp' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Loại giấy tờ'
                          name='typeIdCard'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                        >
                          <Select placeholder={'Chọn'} onChange={(e) => onChange(e)}>
                            <Select.Option key={typeIdCard.CMND}>CMND</Select.Option>
                            <Select.Option key={typeIdCard.CCCD}>CCCD</Select.Option>
                            <Select.Option key={typeIdCard.Passport}>Passport</Select.Option>
                            <Select.Option key={typeIdCard.DinhDanh}>Khác</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item
                          label='Số giấy tờ'
                          name='idNumber'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <Input placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Ngày cấp'
                          name='dateOfCCCD'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <DatePicker format={'YYYY-MM-DD'} placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Nơi cấp'
                          name='placeOfCCCD'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                          <Input placeholder='Nhập nơi cấp' />
                        </Form.Item>
                      </Col>

                    </Row>
                    <Row>

                    </Row>
                    <Divider orientation='left' plain>
                      Thông tin liên hệ
                    </Divider>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Số điện thoại'
                          name='phone'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                      <Col span={6}>
                        <Form.Item
                          label='Email'
                          name='email'
                          labelAlign='right'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                    </Row>
                    <Row gutter={24}>
                      <Col span={6}>
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
                      <Col span={6}>
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
                      <Col span={6}>
                        <Form.Item
                          label='Xã/phường'
                          name='contactAddressWardId'
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
                      <Col span={6}>
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

                    <Divider orientation='left' plain>
                      Thông tin công tác
                    </Divider>
                    <Row gutter={24}>

                    </Row>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Tỉnh/thành phố'
                          name='workAddressCityId'
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
                          <Select placeholder={'Chọn'} options={provinceOption} onChange={onChangeProvinceW}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Quận huyện'
                          name='workAddressDistrictId'
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
                          <Select placeholder={'Chọn'} options={districtOptionW} onChange={onChangeDistrictW}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Xã/phường'
                          name='workAddressWardsId'
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
                          <Select placeholder={'Chọn'} options={wardOptionW}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Nơi công tác'
                          name='workAddress'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 22 }}
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
                          <Input placeholder='Nhập nơi công tác' />
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
                    <Row gutter={24} style={{ marginLeft: '1%' }}>
                      <Col span={6}>
                        <Form.Item
                          label='Mục đích đăng ký tham dự'
                          name='examPurpose'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                        >
                          <Radio.Group value={formVals.examPurpose}>
                            <Radio value={'1'}>Đánh giá trình độ</Radio>
                            <Radio value={'3'}>Xin việc hoặc nâng ngạch</Radio>
                            <Radio value={'4'}>Xét tốt nghiệp</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label={'Đã từng thi ' + formVals.examName}
                          name='isTested'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Radio.Group onChange={onChangeRadio} >
                            <Radio value={false}>Chưa thi</Radio>
                            <br />
                            <Radio value={true}>Đã thi</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Mục tiêu điểm số'
                          name='scoreGoal'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 12 }}
                        >
                          <Input placeholder='Nhập mục tiêu' />
                        </Form.Item>
                      </Col>
                      {isTestedTopik == true ? <Col span={6}>
                        <Form.Item
                          label='Ngày thi gần nhất'
                          name='testDate'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 12 }}
                        >
                          <DatePicker format={'YYYY-MM-DD'} placeholder='Chọn' />
                        </Form.Item>
                      </Col> : null}

                    </Row>
                    <Row gutter={24}>
                      <Col span={10}>
                        <label>Bài thi: {formVals.examName}</label>
                      </Col>
                    </Row>
                    <Divider></Divider>
                    <Form.Item
                      label=''
                      name='examTestInfo'
                      labelAlign='left'
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <EditFormExam examVersions={ConvertExamVersionOptionModel(values.examVersions as ExamVersionModel[])}></EditFormExam>
                    </Form.Item>
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
                        <label>Mặt trước CCCD/CMND</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={idCardFront as string}
                        />
                        <br />
                        <br />
                        <Upload {...frontImgCCCDUpload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Mặt sau CCCD/CMND</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={idCardBack as string}
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
                          src={image3x4 as string}
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
                        <label>Ảnh thẻ học sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={studentCardImage as string}
                        />
                        <br />
                        <br />
                        <Upload {...studentCardImageUpload} showUploadList={false}>
                          <Button icon={<UploadOutlined />} >Chọn ảnh khác</Button>
                        </Upload>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <label>Ảnh giấy khai sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={birthCertificate as string}
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
                        {/* <Button onClick={() => showPdf(values.userInfoITModel?.schoolCertificate as string)}>Xem file</Button> */}
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
