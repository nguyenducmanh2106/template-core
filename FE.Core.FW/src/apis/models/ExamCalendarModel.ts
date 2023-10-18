/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ExamCalendarModel = {
  id?: string;
  headerQuarterId?: string;
  room?: string;
  dateTest?: string;
  endDateRegister?: string;
  examShift?: string;
  timeTest?: string | null;
  note?: string | null;
  examId?: string | null;
  status?: number;
  quantityCandidate?: number;
  registed?: number;
  limit?: number;
};

