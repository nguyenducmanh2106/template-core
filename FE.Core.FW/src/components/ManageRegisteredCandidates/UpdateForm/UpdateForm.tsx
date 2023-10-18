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
  RadioChangeEvent,
  Divider,
  Table,
  Image,
  Space,
  SelectProps,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ManageRegisteredCandidatesModel } from '@/apis/models/ManageRegisteredCandidatesModel';
import { ExamRoomModel, ExamVersionModel, OptionModel, SelectOptionModel, SelectStatusOption, ServiceAlongExamModel } from '@/apis/models/data';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import TextArea from 'antd/lib/input/TextArea';
import { ResponseData } from '@/apis/models/ResponseData';
import { getExamVersion, getPriorityObject } from '@/apis/services/PageService';
import { ConvertExamVersionOptionModel, ConvertIntToCurrencyFormat, ConvertOptionModel, ConvertOptionSelectModel, ConvertTimeApplicationOptionModel, base64toBlob } from '@/utils/convert';
import { ColumnsType } from 'antd/lib/table';
import ListExemVersion from '@/components/ManageRegisteredCandidates/ListExemVersion/ListExemVersion';
import ExamTestSchedule from '@/components/ManageRegisteredCandidates/ExamTestSchedule/ExamTestSchedule';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { BlacklistModel } from '@/apis/models/BlacklistModel';
import { getBlacklist } from '@/apis/services/BlacklistService';
import { getHistoryByName } from '@/apis/services/ManageRegisteredCandidatesService';
import { HistoryRegisteredModel } from '@/apis/models/HistoryRegisteredModel';
import { getExamVersionByExamId } from '@/apis/services/PageService';
import { getExamCalendarById } from '@/apis/services/ExamCalendarService';
import { Code, ManageApplicationTimeModel } from '@/apis';
import Upload, { RcFile, UploadProps } from 'antd/lib/upload';
import { UploadOutlined } from '@ant-design/icons';
import { getManageApplicationTime } from '@/apis/services/ManageApplicationTimeService';
import { examForm, examFormNum } from '@/utils/constants';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  isDuplicate: boolean;
  values: Partial<ManageRegisteredCandidatesModel>;
  onSubmitLoading: boolean;
  service: ServiceAlongExamModel[];
  statusProfile: SelectStatusOption[];
  statusPaid: SelectStatusOption[];
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
var timeApplications: SelectOptionModel[] = []
const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
  const { visible, values, isDuplicate, onSubmit, onSubmitLoading, service, statusProfile, statusPaid, provinceOption, districtOption, wardOption, examShift, examRooms, exam, onCancel } = props;
  const [examVersionOption, setExamVersionOption] = useState<ExamVersionModel[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistModel[]>([]);
  const [options, setOptions] = useState<SelectOptionModel[]>([]);
  const [valueService, setValueService] = useState<string[]>([]);
  const [showDataBlacklist, setShowDataBlacklist] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyTest, setHistoryTest] = useState<HistoryRegisteredModel[]>([]);
  const [priorityObject, setPriorityObject] = useState<SelectOptionModel[]>([]);
  const [value, setValue] = useState<string | undefined>(undefined);
  const [isTestedTopik, setIsTestedTopik] = useState<boolean>(values.isTested as boolean);
  const [valueSex, setValueSex] = useState(1);
  const [receivedResult, setreceivedResult] = useState<number>(values.receipt != null ? values.receipt : 1);
  const [sumPrice, setSumPrice] = useState<number>(0);
  const [textBlacklist, setTextBlacklist] = useState<string>();
  const [versionChoose, setVersionChoose] = useState<string>('');
  const [dataFormVisible, setDataFormVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
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
    const response: ResponseData = await getExamVersion();
    const responsePriorityObject: ResponseData = await getPriorityObject();
    setPriorityObject(ConvertOptionSelectModel<OptionModel>(responsePriorityObject.data as OptionModel[]))
    var serviceTemp: SelectOptionModel[] = []
    serviceTemp = ConvertOptionSelectModel<OptionModel>(service as OptionModel[])
    setOptions(serviceTemp)
    const getAllApplicationTime: ResponseData = await getManageApplicationTime(values.placeOfRegistration, undefined, undefined, false);
    var getAllRow = getAllApplicationTime.data as ManageApplicationTimeModel[];
    const current = getAllRow.find(p => p.id == values.submissionTime) as ManageApplicationTimeModel
    const responseManageApplicationTime: ResponseData = await getManageApplicationTime(values.placeOfRegistration, undefined, undefined, true);
    const responseExamVersion: ResponseData = await getExamVersionByExamId(values.examId as string);
    setExamVersionOption(responseExamVersion.data as ExamVersionModel[]);
    const listExamVersion = responseExamVersion.data as ExamVersionModel[]
    formVals.examVersion?.split(',').forEach((item: string) => {
      const get = listExamVersion.find(p => p.id == item)
      if (get != null) {
        arr.push({
          name: get.name,
          key: get.id as string,
          id: get.id as string,
          isShowTable: false,
        } as ExamVersion)
        setArr(arr);
      }
    });
    timeApplications = ConvertTimeApplicationOptionModel(responseManageApplicationTime.data as ManageApplicationTimeModel[]);
    if (current != undefined && timeApplications.find(p => p.value == current.id) == null) {
      timeApplications.push({
        value: current.id as string,
        label: dayjs(current.receivedDate).format('DD-MM-YYYY') + ' ' + current.timeStart + ' - ' + current.timeEnd,
        key: current.id as string,
      });
    }

    // const examCalendarGet: ResponseData = await getExamCalendarById(values.examScheduleId as string)
    // if (examCalendarGet != null && examCalendarGet.code == Code._200 && examCalendarGet.data != null) {
    //   const data = examCalendarGet.data as ExamCalendarModel
    //   const input: DataType[] = [
    //     {
    //       key: data.id as string,
    //       date: dayjs(data.dateTest).format('YYYY-MM-DD'),
    //       shift: data.examShift as string,
    //       room: data.room as string,
    //       time: data.timeTest as string,
    //       versionId: data.id as string,
    //     },
    //   ];
    //   setExamScheduleId(data.id as string)
    //   setExamCalendar(input);
    //   setShowExamCalendar(true)
    // }



  };
  useEffect(() => {
    getData();
  }, []);
  const formVals: ManageRegisteredCandidatesModel = {
    id: values.id,
    userProfileId: values.userProfileId,
    examPurpose: values?.examPurpose,
    scoreGoal: values?.scoreGoal,
    isTested: values?.isTested,
    canTest: values.canTest,
    testDate: values?.testDate,
    dateApply: values.dateApply,
    timeApply: values.timeApply,
    placeOfRegistration: values?.placeOfRegistration,
    submissionTime: values?.submissionTime,
    examId: values?.examId,
    examVersion: values?.examVersion,
    testScheduleDate: values?.testScheduleDate,
    returnResultDate: values?.returnResultDate,
    priorityObject: values?.priorityObject,
    accompaniedService: values?.accompaniedService,
    userName: values?.userName,
    password: values?.password,
    note: values?.note,
    examInfo: values?.examInfo,
    examFee: values?.examFee,
    userInfo: values?.userInfo,
    fee: values.fee,
    status: values.status,
    acceptBy: values.acceptBy,
    profileIncludes: values.profileIncludes,
    profileNote: values.profileNote,
    dateReceive: values.dateReceive,
    statusPaid: values.statusPaid,
    codeProfile: values.codeProfile,
    examScheduleId: values.examScheduleId,
    addReceipt: values.addReceipt,
    fullNameReceipt: values.fullNameReceipt,
    phoneReceipt: values.phoneReceipt,
    receipt: values.receipt
  };
  const [form] = Form.useForm();
  const [serviceChoose, setServiceChoose] = useState<string[]>(formVals.accompaniedService?.split(',') as []);
  const [examVersionH, setExamVersionH] = useState<string>();

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
  const serviceChange = (value: string[]) => {
    value = value.filter((item: string) => {
      return item != '';
    });
    setServiceChoose(value);
  };
  const sumPriceExam = async () => {
    let sum = 0;
    serviceChoose.forEach((item: string) => {
      sum = sum + (service.find((p) => p.id == item)?.price || 0);
    });
    sum = sum + (formVals.fee || 0)
    setSumPrice(sum);
  };
  useEffect(() => {
    sumPriceExam();
  });
  const showBlacklist = async () => {
    setShowDataBlacklist(true);
    // kiểm tra blacklist
    const response: ResponseData = await getBlacklist(
      formVals.userInfo?.fullName || undefined,
      moment(formVals.userInfo?.dob).format('DD/MM/YYYY') || undefined,
    );
    const data = response.data as BlacklistModel[];
    if (data.length > 0) {
      setTextBlacklist('Danh sách blacklist');
      setBlacklist(data);
    } else {
      setTextBlacklist('Không nằm trong danh sách blacklist');
    }
    setShowDataBlacklist(false);
  };
  const closeModal = async () => {
    setModelExamVersion(false);
  };

  const closeModalExamSchedule = async () => {
    setTestSchedule(false);
  };
  const showTableData = (id: string) => {
    setVersionChoose(id);
    setTestSchedule(true);
  };


  const addInput = (id: string) => {
    setModelExamVersion(true);
    setExamVersionH(id);
  };

  const deleteExamversion = (id: string) => {
    setArr((arr) => {
      return arr.filter((item) => item.id !== id);
    });
    if (arr.length == 1) {
      setExamScheduleId(undefined)
      setExamCalendar(undefined)
      setShowExamCalendar(false)
    }
  };
  const deleteDataTable = () => {
    setExamScheduleId(undefined)
    setExamCalendar(undefined);
    setShowExamCalendar(false)
  };

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

  const [wardOptionW, setWardOptionW] = useState<SelectOptionModel[]>(
    wardOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfo?.workAddressDistrictId;
    }),
  );

  const [districtOptionW, setDistrictOptionW] = useState<SelectOptionModel[]>(
    districtOption.filter((item: SelectOptionModel) => {
      return item.parrentId == values.userInfo?.workAddressCityId;
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
  const columns: ColumnsType<DataType> = [
    {
      title: 'Ngày thi',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <>{text}</>,
    },
    {
      title: 'Giờ thi',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <>{text}</>,
    },
    {
      title: 'Ca thi',
      dataIndex: 'shift',
      key: 'shift',
      render: (text) => <>{examShift.find(p => p.value == text)?.label}</>,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      key: 'room',
      render: (text) => <>{examRooms.find(p => p.id == text)?.name}</>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => <a onClick={() => deleteDataTable()}>Xóa</a>,
    },
  ];

  const columnsHistory: ColumnsType<HistoryRegisteredModel> = [
    {
      title: 'Họ đệm',
      dataIndex: 'date',
      key: 'date',
      render: (_, record) => <>{record.firstName}</>,
    },
    {
      title: 'Tên',
      dataIndex: 'time',
      key: 'time',
      render: (_, record) => <>{record.lastName}</>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'shift',
      key: 'shift',
      render: (_, record) => <>{record.birthDay}</>,
    },
    {
      title: 'Số giấy tờ',
      dataIndex: 'room',
      key: 'room',
      render: (_, record) => <>{record.iDcard}</>,
    },
    {
      title: 'Ngày thi',
      dataIndex: 'room',
      key: 'room',
      render: (_, record) => <>{record.dateTest}</>,
    },
  ];

  const onChangeRadioReceiveResult = (e: RadioChangeEvent) => {
    setreceivedResult(e.target.value);
  };

  const onChangeRadio = (e: RadioChangeEvent) => {
    setIsTestedTopik(e.target.value);
  };
  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      if (
        moment(formVals.userInfo?.dob).format('YYYY-MM-DD') != fieldsValue.dob.format('YYYY-MM-DD') ||
        formVals.userInfo?.fullName != fieldsValue.fullName ||
        formVals.userInfo?.sex != fieldsValue.sex ||
        formVals.userInfo?.cccd != fieldsValue.cccd ||
        formVals.userInfo?.cmnd != fieldsValue.cmnd ||
        moment(formVals.userInfo?.dateOfCCCD).format('YYYY-MM-DD') != fieldsValue.dateOfCCCD.format('YYYY-MM-DD') ||
        formVals.userInfo?.placeOfCCCD != fieldsValue.placeOfCCCD ||
        formVals.userInfo?.passport != fieldsValue.passport ||
        formVals.userInfo?.otherPapers != fieldsValue.otherPapers ||
        formVals.userInfo?.sdt != fieldsValue.sdt ||
        formVals.userInfo?.email != fieldsValue.email ||
        formVals.userInfo?.contactAddressCityId != fieldsValue.contactAddressCityId ||
        formVals.userInfo?.contactAddressDistrictId != fieldsValue.contactAddressDistrictId ||
        formVals.userInfo?.contactAddressWardsId != fieldsValue.contactAddressWardsId ||
        formVals.userInfo?.contactAddress != fieldsValue.contactAddress ||
        formVals.userInfo?.job != fieldsValue.job ||
        formVals.userInfo?.optionJob != fieldsValue.optionJob ||
        (formVals.userInfo?.birthCertificate != birthCertificate.replace('data:image/jpeg;base64,', '') && birthCertificate != '../src/assets/images/image.png') ||
        (formVals.userInfo?.frontImgCCCD != frontImgCCCD.replace('data:image/jpeg;base64,', '') && frontImgCCCD != '../src/assets/images/image.png') ||
        (formVals.userInfo?.backImgCCCD != backImgCCCD.replace('data:image/jpeg;base64,', '') && backImgCCCD != '../src/assets/images/image.png') ||
        (formVals.userInfo?.imG3X4 != imG3X4.replace('data:image/jpeg;base64,', '') && imG3X4 != '../src/assets/images/image.png')
      ) {
        fieldsValue.isChangeUserInfo = true;
      } else {
        fieldsValue.isChangeUserInfo = false;
      }
      var examVersionString = ''
      if (serviceChoose != undefined)
        fieldsValue.accompaniedService = serviceChoose.toString()
      arr.forEach((item: ExamVersion) => {
        if (examVersionString.length == 0)
          examVersionString = examVersionString + item.id
        else
          examVersionString = examVersionString + ',' + item.id
      })
      // fieldsValue.examVersion = formVals.examVersion
      fieldsValue.examVersion = examVersionString
      fieldsValue.examScheduleId = examScheduleId
      const dob = fieldsValue.dob.format('YYYY/MM/DD')
      const dateOfCCCD = fieldsValue.dateOfCCCD.format('YYYY/MM/DD')
      var formData = {
        Id: values.id,
        ExamPurpose: fieldsValue.examPurpose,
        "UserInfo.UserName": fieldsValue.userName,
        "UserInfo.FullName": fieldsValue.fullName,
        "UserInfo.CCCD": fieldsValue.cccd,
        "UserInfo.Country": fieldsValue.cmnd,
        "UserInfo.DOBString": dob,
        "UserInfo.Sex": fieldsValue.sex,
        "UserInfo.CMND": fieldsValue.cmnd,
        "UserInfo.Passport": fieldsValue.passport,
        "UserInfo.DateOfCCCDString": dateOfCCCD,
        "UserInfo.PlaceOfCCCD": fieldsValue.placeOfCCCD,
        "UserInfo.OtherPapers": fieldsValue.otherPapers,
        "UserInfo.SDT": fieldsValue.sdt,
        "UserInfo.Email": fieldsValue.email,
        "UserInfo.Job": fieldsValue.job,
        "UserInfo.OptionJob": fieldsValue.optionJob,
        "UserInfo.isStudent": fieldsValue.isStudent,
        "UserInfo.WorkAddressCityId": fieldsValue.workAddressCityId,
        "UserInfo.WorkAddressDistrictId": fieldsValue.workAddressDistrictId,
        "UserInfo.WorkAddressWardsId": fieldsValue.workAddressWardsId,
        "UserInfo.WorkAddress": fieldsValue.workAddress,
        "UserInfo.ContactAddressCityId": fieldsValue.contactAddressCityId,
        "UserInfo.ContactAddressDistrictId": fieldsValue.contactAddressDistrictId,
        "UserInfo.ContactAddressWardsId": fieldsValue.contactAddressWardsId,
        "UserInfo.ContactAddress": fieldsValue.contactAddress,
        "UserInfo.FrontImgCCCDFile": frontImgCCCDFile as Blob,
        "UserInfo.BackImgCCCDFile": backImgCCCDFile as Blob,
        "UserInfo.IMG3X4File": imG3X4File as Blob,
        "UserInfo.BirthCertificateFile": birthCertificateFile as Blob,
        "UserInfo.StudentCardImageFile": studentCardImageFile as Blob,
        ScoreGoal: fieldsValue.scoreGoal,
        IsTested: fieldsValue.isTested,
        TestDate: fieldsValue.testDate,
        PlaceOfRegistration: values?.placeOfRegistration,
        SubmissionTime: fieldsValue.submissionTime,
        ExamId: values.examId,
        ExamVersion: fieldsValue.examVersion,
        TestScheduleDate: fieldsValue.testScheduleDate,
        ReturnResultDate: fieldsValue.returnResultDate,
        PriorityObject: fieldsValue.priorityObject,
        AccompaniedService: serviceChoose != null ? serviceChoose.toString() : null,
        UserName: fieldsValue.userName,
        Password: fieldsValue.password,
        Note: fieldsValue.note,
        ProfileNote: fieldsValue.profileNote,
        ProfileIncludes: fieldsValue.profileIncludes,
        Status: fieldsValue.status,
        StatusPaid: fieldsValue.statusPaid,
        DateReceive: fieldsValue.dateReceive,
        DateApply: fieldsValue.dateApply,
        TimeApply: fieldsValue.timeApply,
        CanTest: fieldsValue.canTest,
        ExamScheduleId: fieldsValue.examScheduleId,
        Receipt: fieldsValue.receipt,
        FullNameReceipt: fieldsValue.fullNameReceipt,
        PhoneReceipt: fieldsValue.phoneReceipt,
        AddReceipt: fieldsValue.addReceipt,
        IsChangeUserInfo: isDuplicate ? true : fieldsValue.isChangeUserInfo,

      }
      onSubmit(formData, isDuplicate, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };

  const [frontImgCCCDFile, setFrontImgCCCDFile] = useState<Blob>(base64toBlob(formVals.userInfo?.frontImgCCCD as string) as Blob);
  const [backImgCCCDFile, setBackImgCCCDFile] = useState<Blob>(base64toBlob(formVals.userInfo?.backImgCCCD as string) as Blob);
  const [imG3X4File, setImG3X4File] = useState<Blob>(base64toBlob(formVals.userInfo?.imG3X4 as string) as Blob);
  const [studentCardImageFile, setStudentCardImageFile] = useState<Blob>(base64toBlob(formVals.userInfo?.studentCardImage as string) as Blob);
  const [birthCertificateFile, setBirthCertificateFile] = useState<Blob>(base64toBlob(formVals.userInfo?.birthCertificate as string, 'application/pdf') as Blob);
  const [frontImgCCCD, setFrontImgCCCD] = useState<string>(formVals.userInfo?.frontImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.frontImgCCCD}` as string : '../src/assets/images/image.png');
  const [backImgCCCD, setBackImgCCCD] = useState<string>(formVals.userInfo?.backImgCCCD != null ? `data:image/jpeg;base64,${values.userInfo?.backImgCCCD}` as string : '../src/assets/images/image.png');
  const [imG3X4, setImG3X4] = useState<string>(formVals.userInfo?.imG3X4 != null ? `data:image/jpeg;base64,${values.userInfo?.imG3X4}` as string : '../src/assets/images/image.png');
  const [birthCertificate, setBirthCertificate] = useState<string>(formVals.userInfo?.birthCertificate != null ? `data:image/jpeg;base64,${values.userInfo?.birthCertificate}` as string : '../src/assets/images/image.png');
  const [studentCardImage, setStudentCardImage] = useState<string>(formVals.userInfo?.studentCardImage != null ? `data:image/jpeg;base64,${values.userInfo?.studentCardImage}` as string : '../src/assets/images/image.png');

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

  const checkHistoryTest = async () => {
    setLoadingHistory(true)
    const historyTest: ResponseData = await getHistoryByName(formVals.userInfo?.fullName as string, moment(formVals.userInfo?.dob).format('YYYY/MM/DD'));
    if (historyTest != null && historyTest.data != null) {
      const data = historyTest.data as HistoryRegisteredModel[]
      if (data.length > 0) {
        setHistoryTest(data)
      }
    }
    setLoadingHistory(false)
  }

  function showPdf(arg0: string): void {
    throw new Error('Function not implemented.');
  }

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
            {isDuplicate ? <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
              Nhân bản
            </Button> : <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
              Cập nhật
            </Button>}
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
            userProfileId: formVals.userProfileId,
            examPurpose: formVals?.examPurpose,
            scoreGoal: formVals?.scoreGoal,
            isTested: formVals?.isTested,
            testDate: formVals?.testDate,
            placeOfRegistration: formVals?.placeOfRegistration,
            submissionTime: formVals?.submissionTime,
            timeApply: formVals?.examInfo?.timeApply,
            examId: formVals?.examId,
            examVersion: formVals?.examVersion,
            canTest: formVals.canTest,
            testScheduleDate: formVals?.testScheduleDate,
            returnResultDate: formVals?.returnResultDate != null ? moment(formVals?.returnResultDate) : null,
            priorityObject: formVals?.priorityObject,
            accompaniedService: formVals.accompaniedService?.split(',') as [],
            userName: formVals?.userName,
            password: formVals?.password,
            note: formVals?.note,
            examInfo: formVals?.examInfo,
            examFee: formVals?.examFee,
            userInfo: formVals?.userInfo,
            fullName: formVals?.userInfo?.fullName,
            dob: moment(formVals?.userInfo?.dob),
            sex: formVals?.userInfo?.sex,
            cccd: formVals?.userInfo?.cccd,
            passport: formVals?.userInfo?.passport,
            otherPapers: formVals?.userInfo?.otherPapers,
            dateOfCCCD: moment(formVals?.userInfo?.dateOfCCCD),
            placeOfCCCD: formVals?.userInfo?.placeOfCCCD,
            isStudent: formVals?.userInfo?.isStudent,
            cmnd: formVals?.userInfo?.cmnd,
            sdt: formVals?.userInfo?.sdt,
            email: formVals?.userInfo?.email,
            profileNote: formVals.profileNote,
            status: formVals?.status,
            statusPaid: formVals?.statusPaid,
            contactAddressWardsId: formVals?.userInfo?.contactAddressWardsId,
            contactAddressCityId: formVals?.userInfo?.contactAddressCityId,
            contactAddressDistrictId: formVals?.userInfo?.contactAddressDistrictId,
            contactAddress: formVals?.userInfo?.contactAddress,
            job: formVals?.userInfo?.job,
            optionJob: formVals?.userInfo?.optionJob,
            profileIncludes: formVals?.profileIncludes,
            workAddress: formVals?.userInfo?.workAddress,
            workAddressCityId: formVals?.userInfo?.workAddressCityId,
            workAddressDistrictId: formVals?.userInfo?.workAddressDistrictId,
            workAddressWardsId: formVals?.userInfo?.workAddressWardsId,
            examScheduleId: formVals.examScheduleId,
            addReceipt: formVals.addReceipt,
            phoneReceipt: formVals.phoneReceipt,
            fullNameReceipt: formVals.fullNameReceipt,
            receipt: formVals.receipt,
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
                          name='dob'
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
                          label='CMND'
                          name='cmnd'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                    </Row>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Căn cước công dân'
                          name='cccd'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                        >
                          <Input placeholder='Nhập CCCD' />
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
                      <Col span={6}>
                        <Form.Item
                          label='Hộ chiếu'
                          name='passport'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
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
                    </Row>
                    <Row>
                      <Col span={14}>
                        <Form.Item
                          label='Giấy tờ khác'
                          name='otherPapers'
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
                          <Input placeholder='Nhập giấy tờ khác' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider orientation='left' plain>
                      Thông tin liên hệ
                    </Divider>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label='Số điện thoại'
                          name='sdt'
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
                      <Col span={6}>
                        <Form.Item
                          label='Là học sinh/sinh viên?'
                          name='isStudent'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 20 }}
                        >
                          <Radio.Group onChange={onChangeRadio} value={valueSex}>
                            <Radio value={true}>Có</Radio>
                            <Radio value={false}>Không</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label='Nghề nghiệp'
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
                    <Divider orientation='left' plain>
                      Thông tin khác
                    </Divider>
                    <Row gutter={24}>
                      <Col span={14}>
                        <Form.Item
                          label='Hồ sơ thí sinh bao gồm'
                          name='profileIncludes'
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
                          <Input placeholder='Nhập thông tin hồ sơ' />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item
                          label='Đặc điểm hồ sơ cần lưu ý'
                          name='profileNote'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 22 }}
                          rules={[
                            {
                              required: false,
                              validator: async (rule, value) => {
                                if (value != undefined && value.length > 1000) {
                                  throw new Error('Nhập không quá 255 ký tự');
                                }
                              },
                            },
                          ]}
                        >
                          <TextArea placeholder='Nhập lưu ý' rows={4} />
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
                            <Radio value={'2'}>Du học</Radio>
                            <Radio value={'3'}>Xin việc hoặc nâng ngạch</Radio>
                            <Radio value={'4'}>Xét tốt nghiệp</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label={'Đã từng thi ' + exam.find(p => p.value == values.examId)?.label}
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
                        <Form.Item
                          label='Thời gian đăng ký làm thủ tục dự thi'
                          name='submissionTime'
                          labelAlign='left'
                          labelCol={{ span: 15 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Select placeholder='Chọn khung giờ' options={timeApplications} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={10}>
                        <label>Môn thi: {exam.find(p => p.key == formVals.examId)?.label}</label>
                      </Col>
                      {/* <Col span={10}>
                        <label>Phiên bản thi: {examVersionOption.find(p => p.key == formVals.examVersion)?.label}</label>
                      </Col> */}
                    </Row>
                    {examVersionOption.length > 0 ? <>
                      <Divider></Divider>
                      <Row gutter={24}>
                        <Col style={{ alignItems: 'center' }}>
                          {/* Bài thi: */}
                          <label
                            style={{
                              fontWeight: 'bold',
                            }}
                          >
                            {formVals.examInfo?.examName}{' '}
                          </label>
                          <Button type='primary' style={{ color: 'white', backgroundColor: '#1890ff' }} onClick={() => addInput(formVals.examId as string)}>
                            Thêm phiên bản
                          </Button>
                        </Col>
                        {/* 
                      <Col span={6}>
                        <Form.Item
                          label='Ngày trả kết quả'
                          name='returnResultDate'
                          labelAlign='left'
                          labelCol={{ span: 10 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <DatePicker format={'YYYY-MM-DD'} placeholder='Chọn' />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label='Username'
                          name='userName'
                          labelAlign='left'
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Input placeholder='Nhập username' />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label='Password'
                          name='password'
                          labelAlign='left'
                          labelCol={{ span: 7 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Input placeholder='Nhập password' />
                        </Form.Item>
                      </Col> */}
                      </Row>
                    </> : null}

                    {arr.length > 0 ? <>
                      {arr.map((item, i) => {
                        return (
                          <>
                            <Row gutter={24} style={{ alignItems: 'center' }}>
                              <Col span={2}>Phiên bản: </Col>
                              <Col span={9} className='fontBold'>
                                {item.name}
                                <Button
                                  type='link'
                                  onClick={() => deleteExamversion(item.id)}
                                >
                                  Xóa
                                </Button>
                              </Col>
                            </Row>
                          </>
                        );
                      })}

                      {/* <Row>
                        <Button type='primary' style={{ color: 'white' }} onClick={() => setTestSchedule(true)}>
                          Chọn lịch thi
                        </Button>
                      </Row> */}
                      <br />
                      {showExamCalendar ? <Table size='small' columns={columns} dataSource={examCalendar} pagination={false} /> : null}

                    </> : null}

                    {/* <Divider></Divider>
                    <Row gutter={24} style={{ alignItems: 'center' }}>
                      <Col span={3} className='fontBold'>
                        Kiểm tra blacklist
                      </Col>
                      <Col span={4}>
                        <Button
                          type='primary'
                          style={{ color: 'white', backgroundColor: '#ED7836' }}
                          loading={showDataBlacklist}
                          onClick={showBlacklist}
                        >
                          Kiểm tra
                        </Button>
                      </Col>
                    </Row>
                    <br />
                    <label className='fontBold'>{textBlacklist}</label>
                    <br />
                    <Row gutter={24}>
                      <Col span={20}>
                        {blacklist.length > 0 ? <Blacklist list={blacklist} /> : ''}
                      </Col>
                    </Row>
                    <br />
                    <Row gutter={24} style={{ alignItems: 'center' }}>
                      <Col span={4} className='fontBold'>
                        Kiểm tra khoảng cách thi:
                      </Col>
                      <Col span={4}>
                        <Button
                          type='primary'
                          style={{ color: 'white', backgroundColor: '#36ED5E' }}
                          onClick={checkHistoryTest}
                          loading={loadingHistory}
                        >
                          Kiểm tra
                        </Button>
                      </Col>
                    </Row>
                    <br />
                    <label className='fontBold'>Lịch sử thi</label>
                    <Row gutter={24}>
                      <Col span={24}>
                        {historyTest.length > 0 ? <Table size='small' columns={columnsHistory} dataSource={historyTest} pagination={false} /> : null}
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label=''
                          name='canTest'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Radio.Group>
                            <Radio value={true}>Đủ điều khiện thi</Radio>
                            <Radio value={false}>Không đủ điều kiện thi</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row> */}
                    <Divider></Divider>
                    <Row gutter={24}>
                      {/* <Col span={8}>
                        <Form.Item
                          label='Dịch vụ đi kèm'
                          name='accompaniedService'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <Select
                            mode='multiple'
                            allowClear
                            style={{ width: '100%' }}
                            placeholder='Chọn dịch vụ'
                            onChange={serviceChange}
                            options={options}
                            value={valueService}
                          />
                        </Form.Item>
                      </Col> */}
                      {/* <Col span={8}>
                        <Form.Item
                          label='Đối tượng ưu tiên'
                          name='priorityObject'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 10 }}
                        >
                          <Select placeholder={'Chọn'} options={priorityObject}></Select>
                        </Form.Item>
                      </Col> */}
                    </Row>
                    {/* <Row gutter={24}>
                      <Form.Item
                        label='Hình thức nhận kết quả'
                        name='receipt'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Radio.Group onChange={onChangeRadioReceiveResult} value={receivedResult}>
                          <Radio value={1}>Nhận tại quầy</Radio>
                          <Radio value={2}>Nhận tại nhà</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Row> */}
                    {/* {receivedResult == 2 ? <>
                      <Row>
                        <Col span={5}>
                          <Form.Item
                            label='Họ tên người nhận'
                            name='fullNameReceipt'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 18 }}
                          >
                            <Input placeholder='Nhập tên' />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label='Số điện thoại người nhận'
                            name='phoneReceipt'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 12 }}
                          >
                            <Input placeholder='Nhập sdt' />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label='Địa chỉ nhận'
                            name='addReceipt'
                            labelAlign='left'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                          >
                            <Input placeholder='Nhập địa chỉ' />
                          </Form.Item>
                        </Col>
                      </Row></> : null} */}

                    {/* <Divider orientation='left'> Lệ phí thi</Divider>
                    <Row
                      gutter={16}
                      style={{ fontWeight: 'bold', border: '1px', borderStyle: 'solid', marginLeft: '1%' }}
                    >
                      <Col span={8}>
                        <label>Dịch vụ</label>
                      </Col>
                      <Col span={8}>
                        <label>Chi tiết</label>
                      </Col>
                      <Col span={8} className='textRight'>
                        <label>Thành tiền (VND)</label>
                      </Col>
                    </Row>
                    <br />
                    <Row gutter={16} style={{ marginLeft: '1%' }}>
                      <Col span={8}>
                        <label>{exam.find((p) => p.value == formVals.examId)?.label}</label>
                      </Col>
                      <Col span={8}>
                      </Col>
                      <Col span={8} className='textRight'>
                        {ConvertIntToCurrencyFormat(formVals.fee || 0)}
                      </Col>
                    </Row>
                    <Divider></Divider>
                    <Row gutter={16} style={{ marginLeft: '1%' }}>
                      <Col span={8}>
                        <label>Dịch vụ đi kèm</label>
                      </Col>
                      <Col span={8}>
                        <>
                          {serviceChoose.map((item, i) => {
                            return (
                              <>
                                {service.find((p) => p.id == item)?.name}
                                <br />
                              </>
                            );
                          })}
                        </>
                      </Col>
                      <Col span={8} className='textRight'>
                        <>
                          {serviceChoose.map((item, i) => {
                            return (
                              <>
                                {ConvertIntToCurrencyFormat(service.find((p) => p.id == item)?.price || 0)}
                                <br />
                              </>
                            );
                          })}
                        </>
                      </Col>
                    </Row>
                    <Divider></Divider>
                    <Row gutter={16} style={{ marginLeft: '1%', fontWeight: 'bold' }}>
                      <Col span={8}>
                        <label>Tổng tiền</label>
                      </Col>
                      <Col span={16} className='textRight'>
                        <label>{ConvertIntToCurrencyFormat(sumPrice)}</label>
                        <br />
                      </Col>
                    </Row> */}
                    <br />
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item
                          label='Ghi chú thông tin thi'
                          name='note'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 24 }}
                        >
                          <TextArea rows={4} placeholder='Nhập ghi chú thông tin thi của thí sinh' />
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          label='Trạng thái thanh toán'
                          name='statusPaid'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                        >
                          <Select placeholder={'Chọn'} options={statusPaid}></Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label='Trạng thái'
                          name='status'
                          labelAlign='left'
                          labelCol={{ span: 24 }}
                          wrapperCol={{ span: 15 }}
                        >
                          <Select placeholder={'Chọn'} options={statusProfile}></Select>
                        </Form.Item>
                      </Col>
                    </Row> */}
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
                        <label>Ảnh thẻ học sinh</label>
                        <br />
                        <Image
                          width={'50%'}
                          src={studentCardImage}
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
