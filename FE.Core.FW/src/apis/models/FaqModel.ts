/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FaqModel = {
  examTypeId?: string;
  question?: string | null;
  questionEnglish?: string | null;
  questionKorean?: string | null;
  shortAnswer?: string | null;
  shortAnswerEnglish?: string | null;
  shortAnswerKorean?: string | null;
  fullAnswer?: string | null;
  fullAnswerEnglish?: string | null;
  fullAnswerKorean?: string | null;
  isShow?: boolean;
  hasDetail?: boolean;
  order?: number;
};

