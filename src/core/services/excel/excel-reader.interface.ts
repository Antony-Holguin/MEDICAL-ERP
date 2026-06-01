export interface IExcelReader {
  read<T = Record<string, unknown>>(buffer: Buffer, sheet?: number | string): T[];
}

export const EXCEL_READER = 'EXCEL_READER';
