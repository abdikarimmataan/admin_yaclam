export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "email"
  | "icon"
  | "select"
  | "stringList"
  | "statsList"
  | "linkList"
  | "paymentList"
  | "stepsList"
  | "footerColumnsList";

export type SelectOption = {
  value: string;
  label: string;
};

export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  rowGroup?: string;
  rowColumns?: 2 | 3 | 4;
  options?: SelectOption[];
  placeholder?: string;
};
