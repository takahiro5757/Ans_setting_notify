// オーダータイプの定義
export type OrderType = 'クローザー' | 'ガール';

// オーダー情報の型定義
export interface Order {
  id: string;
  type: OrderType;
  count: number;
}

// 現場情報の型定義
export interface Venue {
  id: string;
  agency: string;          // 代理店
  location: string;        // イベント実施場所
  isOutsideVenue: boolean; // 外現場フラグ
  hasBusinessTrip: boolean;// 出張有無フラグ
  orders: OrderInfo[];      // オーダー情報
}

export interface OrderInfo {
  id: string;
  type: 'クローザー' | 'ガール' | '無料入店';
  count?: number;
}

// スタッフ情報の型定義
export interface Staff {
  id: string;
  name: string;
  type: OrderType;
}

// アサイン情報の型定義
export interface Assignment {
  venueId: string;        // 現場ID
  orderId: string;        // オーダーID
  date: string;           // 日付
  staffName?: string;     // スタッフ名（オプショナルに変更）
}

// 日付情報の型定義
export interface DayInfo {
  date: string;           // YYYY-MM-DD形式
  weekday: '月' | '火' | '水' | '木' | '金' | '土' | '日';
}

export interface SlotInfo {
  venueId: string;
  orderId: string;
  date: string;
  hasSlot: boolean;
} 