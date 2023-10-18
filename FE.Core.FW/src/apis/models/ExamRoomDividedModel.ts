export type ExamRoomDividedModel = {
  id?: string;
  dividingExamPlaceId?: string;
  examRoomId?: string;
  examRoomName?: string;
  capacity?: number;
  actualQuantity?: number;
  examPlaceName?: string;
  examAreaName?: string;
  examScheduleTopikName?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateBirthday?: Date;
  candidateNumber?: string;
  userProfileId?: string;
  isSendMail?: number;
  languageSendMail?: string
  isDisable?: boolean;
};
