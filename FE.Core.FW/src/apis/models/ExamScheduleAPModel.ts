/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ExamScheduleAPModel = {
  id?: string;
  name?: string | null;
  examDate?: string;
  examWorkShiftId?: string;
  examPeriodId?: string;
  examTime?: string | null;
  isOpen?: boolean;
  examId?: Array<string> | null;
};

