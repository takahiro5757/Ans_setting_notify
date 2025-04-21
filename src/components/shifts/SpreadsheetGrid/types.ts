export interface StaffMember {
  id: string; 
  name: string; 
  nameKana: string; 
  station: string;
  weekdayRate: number; 
  holidayRate: number; 
  tel: string; 
  role?: string;
  company?: string; // 所属会社フィールド
}

export interface Shift {
  date: string; 
  staffId: string; 
  status: '○' | '×' | '-'; 
  location?: string;
  rate?: number; // 単価
}

export interface SpreadsheetGridProps {
  year: number; 
  month: number; 
  staffMembers: StaffMember[]; 
  shifts: Shift[];
  onRateChange?: (staffId: string, date: string, rate: number) => void; 
  onStatusChange?: (staffId: string, date: string, status: '○' | '×' | '-') => void;
}

export interface DateInfo { 
  date: Date; 
  dayOfWeek: string; 
  isWeekend: boolean; 
}

export interface StaffRequest {
  id: string;
  totalRequest: number;
  weekendRequest: number;
  company: string;
}

export type CellPosition = {
  staffId: string;
  date: Date;
}; 