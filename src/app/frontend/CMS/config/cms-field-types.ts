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
  /** Short helper shown under the field or via ? tooltip. */
  hint?: string;
  /** Max decimal places for type "number" (e.g. 2 for price fields). */
  decimals?: number;
};
