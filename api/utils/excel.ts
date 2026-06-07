import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

export function readExcelBuffer(buffer: Buffer): any[][] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];
}

export function safeParseNumber(val: any, fallback: number): number {
  if (val === null || val === undefined || val === '') {
    return fallback;
  }
  if (typeof val === 'number') {
    return isNaN(val) ? fallback : val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

const DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'YYYY.MM.DD',
  'YYYY年MM月DD日',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
  'MM-DD-YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
];

export function safeParseDate(val: any): Date | null {
  if (val === null || val === undefined || val === '') {
    return null;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const parsed = XLSX.SSF ? XLSX.SSF.parse_date_code(val) : null;
    if (parsed) {
      const d = new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H || 0, parsed.M || 0, parsed.S || 0);
      return isNaN(d.getTime()) ? null : d;
    }
    const epoch = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(epoch.getTime()) ? null : epoch;
  }
  if (typeof val === 'string') {
    for (const fmt of DATE_FORMATS) {
      const parsed = dayjs(val, fmt);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    const direct = new Date(val);
    return isNaN(direct.getTime()) ? null : direct;
  }
  return null;
}
