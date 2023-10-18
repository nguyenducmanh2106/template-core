export type DividingExamPlaceModel = {
  id?: string;
  examScheduleTopikId?: string;
  examScheduleTopikName?: string;
  examAreaId?: string;
  examAreaName?: string;
  examPlaceId?: string;
  examPlaceName?: string;
  capacity?: number;
  actualQuantity?: number;
  createdOnDate: Date;
  isSendMail?: number;
  isDisable?: boolean;
  typeOrdering?: number;
};

