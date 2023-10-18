import { ExamScheduleAPModel, ExamScheduleTopikModel, ManageApplicationTimeModel, TimeFrameModel, UserReceiveEmailTestModel } from '@/apis';
import {
  ExamModel,
  HeadQuarterModel,
  SelectOptionModel,
  ExamVersionModel,
  ExamWorkShiftModel,
  ExamRoomModel,
  AreaModel,
  ProfileCatalogModel,
  DistrictModel,
  WardModel,
  CountryModel,
  LanguageModel,
  OptionModel,
  TableFormDataType,
  ExamTestInfo
} from '@/apis/models/data';
import { CurrentUser } from '@/store/user';
import dayjs from 'dayjs';

export const ConvertTimeFrameOptionModel = (list: TimeFrameModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: TimeFrameModel) => {
    if (item.isShow) {
      items.push({
        value: item.id as string,
        label: item.name as string,
        key: item.id as string,
      });
    }
  });
  return items;
};

export const ConvertHeaderQuarterOptionModel = (list: HeadQuarterModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: HeadQuarterModel) => {
    const access = getAcessHeaderQuater() as string[]
    if (access?.includes(item.id as string))
      items.push({
        value: item.id as string,
        label: item.name as string,
        key: item.id as string,
        parrentId: item.area.id as string
      });
  });

  return items;
};

export const ConvertAreaOption = (list: AreaModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: AreaModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertExamOptionModel = (list: ExamModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ExamModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertExamShiftOptionModel = (list: ExamWorkShiftModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ExamWorkShiftModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertExamRoomOptionModel = (list: ExamRoomModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ExamRoomModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertCountryOptionModel = (list: CountryModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: CountryModel) => {
    items.push({
      value: item.code as string,
      label: item.englishName as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertLanguageOptionModel = (list: LanguageModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: LanguageModel) => {
    items.push({
      value: item.code as string,
      label: item.englishName as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertTimeApplicationOptionModel = (list: ManageApplicationTimeModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ManageApplicationTimeModel) => {
    items.push({
      value: item.id as string,
      label: dayjs(item.receivedDate).format('DD-MM-YYYY') + ' ' + item.timeStart + ' - ' + item.timeEnd,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertIntToCurrencyFormat = (input: number) => {
  if (input == undefined) input = 0;
  const inputT = input.toString();
  const floatValue = parseFloat(inputT);
  let n = new Intl.NumberFormat('en-EN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(floatValue);

  if (inputT.includes('.') && !n.includes('.')) {
    return n + '.';
  }

  return n;
};

export const ConvertExamVersionOptionModel = (list: ExamVersionModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ExamVersionModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
      parrentId: item.examId
    });
  });
  return items;
};

export const ConvertExamScheduleOptionModel = (list: ExamScheduleTopikModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ExamScheduleTopikModel) => {
    items.push({
      value: item.id as string,
      label: item.examinationName as string,
      key: item.id as string,
    });
  });
  return items;
};


export const ConvertProvinceOptionModel = (list: ProfileCatalogModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: ProfileCatalogModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const ConvertDistrictOptionModel = (list: DistrictModel[]) => {
  const items: SelectOptionModel[] = [];

  list.forEach((item: DistrictModel) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
      parrentId: item.provinceId as string
    });
  });
  return items;
};

export const ConvertWardOptionModel = (list: WardModel[]) => {
  const items: SelectOptionModel[] = [];
  if (list != undefined) {
    list.forEach((item: WardModel) => {
      items.push({
        value: item.id as string,
        label: item.name as string,
        key: item.id as string,
        parrentId: item.districtId as string
      });
    });
  }

  return items;
};

export function ConvertOptionSelectModel<T extends OptionModel>(list: T[]): SelectOptionModel[] {
  if (!list) return [];
  const items: SelectOptionModel[] = [];

  list.forEach((item: T) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};


export function ConvertOptionModel<T extends { id: string, name: string }>(list: T[]): SelectOptionModel[] {

  if (!list) return [];
  const items: SelectOptionModel[] = [];

  list.forEach((item: T) => {
    items.push({
      value: item.id as string,
      label: item.name as string,
      title: item.name as string,
      key: item.id as string,
    });
  });
  return items;
};

export const base64toBlob = (b64Data: string, contentType = 'application/octet-stream', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export const convertJob = (id: string, other: string) => {
  var result = '';
  switch (id) {
    case '1':
      result = 'HS/SV';
      break;
    case '2':
      result = 'Viên chức';
      break;
    case '3':
      result = 'Nhân viên VP';
      break;
    case '4':
      result = 'KD tự do';
      break;
    case '5':
      result = 'Nội trợ';
      break;
    case '6':
      result = 'Giáo viên';
      break;
    case '7':
      result = 'Thất nghiệp';
      break;
    case '8':
      result = 'Khác ' + other;
      break;
  }
  return result;
};


export const convertPurposeTOEIC = (id: string) => {
  var result = "";
  switch (id) {
    case "1":
      result = "Đánh giá trình độ";
      break;
    case "2":
      result = "Du học";
      break;
    case "3":
      result = "Xin việc hoặc nâng ngạch";
      break;
    case "4":
      result = "Xét tốt nghiệp";
      break;
  }
  return result;
};


export const convertPurpose = (id: string) => {
  var result = '';
  switch (id) {
    case '1':
      result = 'Du học';
      break;
    case '2':
      result = 'Xin việc';
      break;
    case '3':
      result = 'Du lịch';
      break;
    case '4':
      result = 'Nghiên cứu học thuật';
      break;
    case '5':
      result = 'Kiểm tra năng lực tiếng Hàn';
      break;
    case '6':
      result = 'Tìm hiểu văn hoá Hàn Quốc';
      break;
    case '7':
      result = 'Khác';
      break;
    case '8':
      result = 'Xin VISA hoặc Thẻ cư trú';
      break;
    case '9':
      result = 'Đạt thành tích học tập';
      break;
    case '10':
      result = 'Tham gia hoạt động xã hội';
      break;
    case '15':
      result = 'Quản lý tư cách lưu trú';
      break;
  }
  return result;
};

export const getAcessHeaderQuater = () => {
  const userFromLocalStorage: CurrentUser = localStorage.getItem("permissionSetting") ? JSON.parse(localStorage.getItem("permissionSetting") as string) : ''

  if (userFromLocalStorage.accessDataHeaderQuater.length > 0)
    return userFromLocalStorage.accessDataHeaderQuater
  else
    return []
}

export const getAreaByAcessHeaderQuater = (area: SelectOptionModel[], headerQuater: SelectOptionModel[]) => {
  const userFromLocalStorage: CurrentUser = localStorage.getItem("permissionSetting") ? JSON.parse(localStorage.getItem("permissionSetting") as string) : ''

  if (userFromLocalStorage.accessDataHeaderQuater.length > 0) {
    const areaIds: string[] = []
    headerQuater.forEach((item: SelectOptionModel) => {
      if (userFromLocalStorage.accessDataHeaderQuater.includes(item.value))
        areaIds.push(item.parrentId as string)
    })
    return area.filter((item: SelectOptionModel) => {
      return areaIds.includes(item.value)
    })
  }
  else
    return []
}

export const convertKnowWhere = (id: string) => {
  var stringResult = '';
  if (id != undefined) {
    switch (id) {
      case '1':
        stringResult = stringResult + 'Truyền hình';
        break;
      case '2':
        stringResult = stringResult + 'Báo chí';
        break;
      case '3':
        stringResult = stringResult + 'Tạp chí';
        break;
      case '4':
        stringResult = stringResult + 'Cơ quan giáo dục(Trường ĐH, trung tâm ngoại ngữ)';
        break;
      case '5':
        stringResult = stringResult + 'Poster';
        break;
      case '6':
        stringResult = stringResult + 'Người quen';
        break;
      case '7':
        stringResult = stringResult + 'Bạn bè';
        break;
      case '8':
        stringResult = stringResult + 'Internet';
        break;
      case '9':
        stringResult = stringResult + 'Khác';
        break;
      case '10':
        stringResult = stringResult + 'Người thân (gia đình, bạn bè,...)';
        break;
      case '11':
        stringResult = stringResult + 'Trang chủ TOPIK';
        break;
    }
  }
  return stringResult;
};


export const convertTypeIDCard = (id: string) => {
  var stringResult = '';
  if (id != undefined) {
    switch (id) {
      case '1':
        stringResult = 'CMND';
        break;
      case '2':
        stringResult = 'CCCD';
        break;
      case '3':
        stringResult = 'Passport';
        break;
      case '4':
        stringResult = 'Khác';
        break;
    }
  }
  return stringResult;
};


export const convertStatusDecision = (id: number) => {
  var stringResult = '';
  if (id != undefined) {
    switch (id) {
      case 1:
        stringResult = 'Chờ duyệt';
        break;
      case 2:
        stringResult = 'Đã duyệt';
        break;
      case 3:
        stringResult = 'Từ chối';
        break;
    }
  }
  return stringResult;
};

export const ConvertUserReceiveMailOptionModel = (list: UserReceiveEmailTestModel[]) => {
  if (!list || (list && list.length <= 0)) return []
  const items: SelectOptionModel[] = [];

  list.forEach((item: UserReceiveEmailTestModel) => {
    items.push({
      value: item.id as string,
      label: `${item.fullName}(${item.email})` as string,
      key: item.id as string,
    });
  });
  return items;
};

export const SumPriceString = (priceString: string) => {
  var sum = 0
  if (priceString != undefined) {
    priceString.split(",").forEach((item: string) => {
      sum += Number(item)
    })
  }
  return sum;
};

export const ConvertNameExamList = (ids: string, exams: SelectOptionModel[]) => {
  var text = ''
  if (ids != undefined) {
    const listIds = ids.split(',');
    listIds.forEach((id: string) => {
      const exam = exams.find(p => p.key == id)
      if (exam != null) {
        if (text.length > 0)
          text += ", " + exam.label;
        else
          text += exam.label;
      }
    })
  }
  return text;
};

export const ConvertExamInfoToForm = (exams: Array<ExamTestInfo>) => {
  var res: TableFormDataType[] = [];
  var i = 0;
  if (exams != undefined) {
    exams.forEach((item: ExamTestInfo) => {
      res.push({
        key: i.toString(),
        examName: item.examName as string,
        address: item.address as string,
        examVersion: item.examVersion as string,
        examVersionId: item.examVersionId as string,
        edit: false,
        language: item.language as string,
        timeTest: item.examTime as string,
        isNew: false
      })
      i++;
    })
  }
  return res;
};