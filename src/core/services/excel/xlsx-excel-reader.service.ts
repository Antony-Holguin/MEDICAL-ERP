import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { IExcelReader } from './excel-reader.interface';

@Injectable()
export class XlsxExcelReaderService implements IExcelReader {
  read<T = Record<string, unknown>>(buffer: Buffer, sheet: number | string = 0): T[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName =
      typeof sheet === 'number'
        ? workbook.SheetNames[sheet]
        : sheet;

    if (!sheetName || !workbook.Sheets[sheetName]) {
      throw new Error(`Hoja "${sheet}" no encontrada en el archivo Excel`);
    }

    return XLSX.utils.sheet_to_json<T>(workbook.Sheets[sheetName]);
  }
}
