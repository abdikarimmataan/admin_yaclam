export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "email"
  | "stringList"
  | "statsList"
  | "linkList"
  | "paymentList"
  | "stepsList"
  | "footerColumnsList";

export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  rowGroup?: string;
  rowColumns?: 2 | 3 | 4;
};
