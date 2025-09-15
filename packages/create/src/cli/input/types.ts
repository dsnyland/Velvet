import { Interface } from "readline";

export enum QuestionType {
  TEXT,
  RADIO,
}

export interface QuestionProps {
  cli: Interface;
  question: string;
  args: unknown[];
  resolve: (value: unknown) => void;
}
