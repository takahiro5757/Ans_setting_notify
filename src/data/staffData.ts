// スタッフデータの型定義
export interface StaffData {
  id: string;
  affiliation: string;
  name: string;
  nameKana: string;
  gender: 'male' | 'female';
  nearestStation: string;
  phone: string;
  email: string;
  lineId: string;
  position: string;
  businessTripAvailable: boolean;
  hasOwnCar: boolean;  // 車所有可否
  outdoorWorkNG: boolean;  // 外現場NGフラグ
  canBeDirector: boolean;  // ディレクター可否フラグ
  weekdayRate: number;
  weekendRate: number;
  priceEffectiveDate: string; // 現在の単価の適用開始日 (YYYY-MM-DD形式)
  initialPassword: string;
  // 獲得力評価（0〜5の6段階評価）
  mallAcquisitionPower: 0 | 1 | 2 | 3 | 4 | 5;        // モール稼働獲得力
  externalSalesAcquisitionPower: 0 | 1 | 2 | 3 | 4 | 5; // 外販獲得力
  inStoreAcquisitionPower: 0 | 1 | 2 | 3 | 4 | 5;      // 店内獲得力
  skillNotes?: string;
  profileImage?: string; // Base64エンコードされたプロフィール画像
}

// NG要員関係データ
export interface NGStaffRelation {
  id: string;
  staffId: string;
  ngStaffId: string;
  reason: string;
  registeredDate: string;
  isActive: boolean;
}

export interface NGAgencyRelation {
  id: string;
  staffId: string;
  agencyId: string;
  agencyName: string;
  ngType: 'agency' | 'layer' | 'store';
  ngTargetId?: string;
  ngTargetName?: string;
  reason: string;
  registeredDate: string;
  isActive: boolean;
}

// タブの型定義
export type StaffTabValue = 'basic' | 'ng-relations' | 'ng-agencies';

// シンプルなパスワード生成（8文字英数字）
export const generateSimplePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const initialStaffData: Omit<StaffData, 'id'> = {
  affiliation: '',
  name: '',
  nameKana: '',
  gender: 'male',
  nearestStation: '',
  phone: '',
  email: '',
  lineId: '',
  position: '',
  businessTripAvailable: false,
  hasOwnCar: false,
  outdoorWorkNG: false,
  canBeDirector: false,
  weekdayRate: 0,
  weekendRate: 0,
  priceEffectiveDate: new Date().toISOString().split('T')[0], // 今日の日付
  initialPassword: '',
  mallAcquisitionPower: 1,
  externalSalesAcquisitionPower: 1,
  inStoreAcquisitionPower: 1,
  skillNotes: '',
};

// サンプルスタッフデータ（元のデータを復元）
export const sampleStaff: StaffData[] = [
  {
    id: '1',
    affiliation: 'ansteype',
    name: '田中太郎',
    nameKana: 'タナカ タロウ',
    gender: 'male',
    nearestStation: '新宿駅',
    phone: '090-1234-5678',
    email: 'tanaka@ansteype.com',
    lineId: 'tanaka_line',
    position: 'closer',
    businessTripAvailable: true,
    hasOwnCar: true,
    outdoorWorkNG: false,
    canBeDirector: true,
    weekdayRate: 15000,
    weekendRate: 18000,
    priceEffectiveDate: '2024-01-01',
    initialPassword: 'Tanaka23',
    mallAcquisitionPower: 4,
    externalSalesAcquisitionPower: 3,
    inStoreAcquisitionPower: 5,
    skillNotes: '経験豊富で安定したクロージング能力',
  },
  {
    id: '2',
    affiliation: 'ansteype',
    name: '佐藤花子',
    nameKana: 'サトウ ハナコ',
    gender: 'female',
    nearestStation: '渋谷駅',
    phone: '090-2345-6789',
    email: 'sato@ansteype.com',
    lineId: 'sato_line',
    position: 'girl',
    businessTripAvailable: false,
    hasOwnCar: false,
    outdoorWorkNG: true,
    canBeDirector: false,
    weekdayRate: 12000,
    weekendRate: 15000,
    priceEffectiveDate: '2024-02-15',
    initialPassword: 'Sato456',
    mallAcquisitionPower: 5,
    externalSalesAcquisitionPower: 4,
    inStoreAcquisitionPower: 3,
    skillNotes: '顧客対応が非常に丁寧で評価が高い',
  },
  {
    id: '3',
    affiliation: 'subcontractor_1',
    name: '鈴木一郎',
    nameKana: 'スズキ イチロウ',
    gender: 'male',
    nearestStation: '池袋駅',
    phone: '090-3456-7890',
    email: 'suzuki@partner.com',
    lineId: 'suzuki_line',
    position: 'trainee',
    businessTripAvailable: true,
    hasOwnCar: false,
    outdoorWorkNG: false,
    canBeDirector: false,
    weekdayRate: 8000,
    weekendRate: 10000,
    priceEffectiveDate: '2024-03-01',
    initialPassword: 'Suzuki78',
    mallAcquisitionPower: 2,
    externalSalesAcquisitionPower: 3,
    inStoreAcquisitionPower: 1,
    skillNotes: '研修中だが成長意欲が高い',
  },
  {
    id: '4',
    affiliation: 'ansteype',
    name: '山田美咲',
    nameKana: 'ヤマダ ミサキ',
    gender: 'female',
    nearestStation: '品川駅',
    phone: '090-4567-8901',
    email: 'yamada@ansteype.com',
    lineId: 'yamada_line',
    position: 'girl',
    businessTripAvailable: true,
    hasOwnCar: true,
    outdoorWorkNG: false,
    canBeDirector: false,
    weekdayRate: 13000,
    weekendRate: 16000,
    priceEffectiveDate: '2024-01-15',
    initialPassword: 'Yamada90',
    mallAcquisitionPower: 3,
    externalSalesAcquisitionPower: 5,
    inStoreAcquisitionPower: 4,
    skillNotes: 'フレンドリーな対応で顧客との距離を縮める',
  },
  {
    id: '5',
    affiliation: 'subcontractor_1',
    name: '高橋健太',
    nameKana: 'タカハシ ケンタ',
    gender: 'male',
    nearestStation: '上野駅',
    phone: '090-5678-9012',
    email: 'takahashi@partner.com',
    lineId: 'takahashi_line',
    position: 'closer',
    businessTripAvailable: false,
    hasOwnCar: true,
    outdoorWorkNG: false,
    canBeDirector: true,
    weekdayRate: 14000,
    weekendRate: 17000,
    priceEffectiveDate: '2024-02-01',
    initialPassword: 'Taka123',
    mallAcquisitionPower: 2,
    externalSalesAcquisitionPower: 4,
    inStoreAcquisitionPower: 5,
    skillNotes: '論理的な説明が得意で成約率が高い',
  },
  {
    id: '6',
    affiliation: 'subcontractor_2',
    name: '伊藤愛子',
    nameKana: 'イトウ アイコ',
    gender: 'female',
    nearestStation: '横浜駅',
    phone: '090-6789-0123',
    email: 'ito@partner2.com',
    lineId: 'ito_line',
    position: 'girl',
    businessTripAvailable: true,
    hasOwnCar: false,
    outdoorWorkNG: false,
    canBeDirector: false,
    weekdayRate: 11000,
    weekendRate: 14000,
    priceEffectiveDate: '2024-03-15',
    initialPassword: 'Ito567',
    mallAcquisitionPower: 3,
    externalSalesAcquisitionPower: 2,
    inStoreAcquisitionPower: 4,
    skillNotes: '新人だが向上心があり期待できる',
  }
];

// サンプルNG関係データ
export const sampleNGRelations: NGStaffRelation[] = [
  {
    id: '1',
    staffId: '1',
    ngStaffId: '2',
    reason: '過去のトラブル事例',
    registeredDate: '2024-10-15',
    isActive: true,
  },
  {
    id: '2',
    staffId: '2',
    ngStaffId: '1',
    reason: '過去のトラブル事例',
    registeredDate: '2024-10-15',
    isActive: true,
  },
  {
    id: '3',
    staffId: '3',
    ngStaffId: '5',
    reason: '業務スタイルの不一致',
    registeredDate: '2024-11-01',
    isActive: true,
  },
  {
    id: '4',
    staffId: '5',
    ngStaffId: '3',
    reason: '業務スタイルの不一致',
    registeredDate: '2024-11-01',
    isActive: true,
  },
];

// サンプルNG代理店データ（実際のレイヤー管理データと連携）
export const sampleNGAgencies: NGAgencyRelation[] = [
  {
    id: '1',
    staffId: '1',
    agencyId: '1',
    agencyName: 'ABC代理店',
    ngType: 'agency',
    reason: '過去のクレーム対応でトラブル',
    registeredDate: '2024-01-15',
    isActive: true,
  },
  {
    id: '2',
    staffId: '2',
    agencyId: '1',
    agencyName: 'ABC代理店',
    ngType: 'layer',
    ngTargetId: 'L2-1',
    ngTargetName: 'レイヤー2: 佐藤次郎 (営業課長)',
    reason: '相性が合わない',
    registeredDate: '2024-02-10',
    isActive: true,
  },
  {
    id: '3',
    staffId: '3',
    agencyId: '2',
    agencyName: 'DEF代理店',
    ngType: 'store',
    ngTargetId: 'def_store1',
    ngTargetName: '梅田店',
    reason: '店舗方針と合わない',
    registeredDate: '2024-03-05',
    isActive: true,
  },
  {
    id: '4',
    staffId: '4',
    agencyId: '3',
    agencyName: 'GHI代理店',
    ngType: 'layer',
    ngTargetId: 'GHI_L1_1',
    ngTargetName: 'レイヤー1: 松本代表 (代表取締役)',
    reason: 'スキルレベルが合わない',
    registeredDate: '2024-03-20',
    isActive: true,
  },
  {
    id: '5',
    staffId: '5',
    agencyId: '2',
    agencyName: 'DEF代理店',
    ngType: 'store',
    ngTargetId: 'def_store2',
    ngTargetName: '心斎橋店',
    reason: '過去の接客トラブル',
    registeredDate: '2024-04-10',
    isActive: true,
  },
  {
    id: '6',
    staffId: '6',
    agencyId: '1',
    agencyName: 'ABC代理店',
    ngType: 'layer',
    ngTargetId: 'L1-2',
    ngTargetName: 'レイヤー1: 伊藤花子 (取締役)',
    reason: '業務方針の違い',
    registeredDate: '2024-04-15',
    isActive: true,
  },
];

// オプションデータ
export const affiliationOptions = [
  { value: 'ansteype', label: 'Ansteype（自社）' },
  { value: 'subcontractor_1', label: '2次店会社A' },
  { value: 'subcontractor_2', label: '2次店会社B' },
];

export const positionOptions = [
  { value: 'closer', label: 'クローザー' },
  { value: 'girl', label: 'ガール' },
  { value: 'trainee', label: '研修生' },
];

// 代理店データは共通ファイルからインポート
export type {
  LayerPerson,
  Store,
  AgencyData,
} from './agencyData';

export {
  sampleAgencies,
  agencyOptions,
  getLayerOptions,
  getStoreOptions,
  getLayerPersonName,
  getStoreName,
} from './agencyData';
