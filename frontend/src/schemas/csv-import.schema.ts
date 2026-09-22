import { TransactionType } from "./category.schema";

export interface CsvRowData {
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
}

export interface CsvRowResult {
  rowNumber: number;
  raw: Record<string, string>;
  valid: boolean;
  errors?: string[];
  data?: CsvRowData;
  categoryExists?: boolean;
}

export interface CsvPreviewResult {
  validRows: CsvRowResult[];
  errorRows: CsvRowResult[];
  totalRows: number;
}
