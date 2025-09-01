// ProjectManagement専用のデータファイル

// 既存のagencyData.tsから型定義をインポート
export type {
  Contact,
  Store,
  LayerPerson,
  AgencyData,
  LocationDetail,
} from './agencyData';

// 既存のagencyData.tsからデータをインポート
export {
  sampleAgencies,
  agencyOptions,
  getLayerOptions,
  getStoreOptions,
  getLayerPersonName,
  getStoreName,
} from './agencyData';

// ProjectManagement固有の型定義
export interface EventLocationData {
  id: string;
  agencyId: string;
  address: string;
  locationName: string;
  locationDetails: string;
  nearestStation?: string;
  locationDetailList?: LocationDetail[];
  pricing?: {
    tuesday: { closer: number; girl: number; };
    wednesday: { closer: number; girl: number; };
    thursday: { closer: number; girl: number; };
    friday: { closer: number; girl: number; };
    saturday: { closer: number; girl: number; };
    sunday: { closer: number; girl: number; };
    monday: { closer: number; girl: number; };
  };
}

// 初期データ
export const initialAgencyData = {
  companyName: '',
  address: '',
  stores: [],
  layers: {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  },
};

export const initialLocationData = {
  agencyId: '',
  address: '',
  locationName: '',
  locationDetails: '',
  nearestStation: '',
  locationDetailList: [],
  pricing: {
    tuesday: { closer: 0, girl: 0 },
    wednesday: { closer: 0, girl: 0 },
    thursday: { closer: 0, girl: 0 },
    friday: { closer: 0, girl: 0 },
    saturday: { closer: 0, girl: 0 },
    sunday: { closer: 0, girl: 0 },
    monday: { closer: 0, girl: 0 },
  },
};

// 曜日データ
export const weekdays = [
  { key: 'tuesday', label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday', label: '木曜日' },
  { key: 'friday', label: '金曜日' },
  { key: 'saturday', label: '土曜日' },
  { key: 'sunday', label: '日曜日' },
  { key: 'monday', label: '月曜日' },
];

// イベント会場データ
export const sampleLocations: EventLocationData[] = [
  {
    id: '1',
    agencyId: '1',
    address: '東京都渋谷区道玄坂2-6-8',
    locationName: '渋谷109',
    locationDetails: '1階エントランス特設会場、若年層の集客力が高い',
    nearestStation: 'JR渋谷駅',
    locationDetailList: [
      { id: '1', name: '特設ブース' },
      { id: '2', name: '体験コーナー' }
    ],
    pricing: {
      tuesday: { closer: 15000, girl: 12000 },
      wednesday: { closer: 15000, girl: 12000 },
      thursday: { closer: 15000, girl: 12000 },
      friday: { closer: 16000, girl: 13000 },
      saturday: { closer: 18000, girl: 15000 },
      sunday: { closer: 18000, girl: 15000 },
      monday: { closer: 16000, girl: 13000 },
    }
  },
  {
    id: '2',
    agencyId: '1',
    address: '東京都新宿区新宿3-38-2',
    locationName: 'ルミネ新宿店',
    locationDetails: '2階イベントスペース、OL層をターゲットにした会場',
    nearestStation: 'JR新宿駅',
    locationDetailList: [
      { id: '3', name: 'メインステージ' },
      { id: '4', name: '商品展示エリア' },
      { id: '5', name: '休憩スペース' }
    ],
    pricing: {
      tuesday: { closer: 16000, girl: 13000 },
      wednesday: { closer: 16000, girl: 13000 },
      thursday: { closer: 16000, girl: 13000 },
      friday: { closer: 17000, girl: 14000 },
      saturday: { closer: 19000, girl: 16000 },
      sunday: { closer: 19000, girl: 16000 },
      monday: { closer: 17000, girl: 14000 },
    }
  },
  {
    id: '3',
    agencyId: '1',
    address: '東京都港区赤坂9-7-1',
    locationName: '東京ミッドタウン',
    locationDetails: 'ガレリア1階、高級志向の顧客層',
    nearestStation: '地下鉄六本木駅',
    locationDetailList: [
      { id: '6', name: 'プレミアムブース' },
      { id: '7', name: 'VIP応接エリア' }
    ],
    pricing: {
      tuesday: { closer: 18000, girl: 15000 },
      wednesday: { closer: 18000, girl: 15000 },
      thursday: { closer: 18000, girl: 15000 },
      friday: { closer: 20000, girl: 17000 },
      saturday: { closer: 22000, girl: 19000 },
      sunday: { closer: 22000, girl: 19000 },
      monday: { closer: 20000, girl: 17000 },
    }
  },
  {
    id: '4',
    agencyId: '2',
    address: '大阪府大阪市北区梅田3-1-1',
    locationName: '阪急うめだ本店',
    locationDetails: '9階催事場、関西の主要ターミナル駅直結',
    nearestStation: 'JR大阪駅',
    locationDetailList: [
      { id: '8', name: 'イベントホール' },
      { id: '9', name: 'デモンストレーションエリア' }
    ],
    pricing: {
      tuesday: { closer: 14000, girl: 11000 },
      wednesday: { closer: 14000, girl: 11000 },
      thursday: { closer: 14000, girl: 11000 },
      friday: { closer: 15000, girl: 12000 },
      saturday: { closer: 17000, girl: 14000 },
      sunday: { closer: 17000, girl: 14000 },
      monday: { closer: 15000, girl: 12000 },
    }
  },
  {
    id: '5',
    agencyId: '2',
    address: '大阪府大阪市中央区心斎橋筋1-7-1',
    locationName: '大丸心斎橋店',
    locationDetails: '本館1階化粧品売場特設会場、美容意識の高い顧客層',
    nearestStation: '地下鉄心斎橋駅',
    locationDetailList: [
      { id: '10', name: 'ビューティーカウンター' },
      { id: '11', name: 'メイクアップブース' },
      { id: '12', name: 'カウンセリングルーム' }
    ],
    pricing: {
      tuesday: { closer: 15000, girl: 12000 },
      wednesday: { closer: 15000, girl: 12000 },
      thursday: { closer: 15000, girl: 12000 },
      friday: { closer: 16000, girl: 13000 },
      saturday: { closer: 18000, girl: 15000 },
      sunday: { closer: 18000, girl: 15000 },
      monday: { closer: 16000, girl: 13000 },
    }
  },
  {
    id: '6',
    agencyId: '3',
    address: '福岡県福岡市博多区博多駅中央街1-1',
    locationName: 'JR博多シティ',
    locationDetails: '10階イベントホール、九州最大級のターミナル駅直結',
    nearestStation: 'JR博多駅',
    locationDetailList: [
      { id: '13', name: 'メインホール' },
      { id: '14', name: 'サブホール' },
      { id: '15', name: '展示ブース' }
    ],
    pricing: {
      tuesday: { closer: 13000, girl: 10000 },
      wednesday: { closer: 13000, girl: 10000 },
      thursday: { closer: 13000, girl: 10000 },
      friday: { closer: 14000, girl: 11000 },
      saturday: { closer: 16000, girl: 13000 },
      sunday: { closer: 16000, girl: 13000 },
      monday: { closer: 14000, girl: 11000 },
    }
  },
  {
    id: '7',
    agencyId: '3',
    address: '福岡県福岡市中央区天神2-5-35',
    locationName: '岩田屋本店',
    locationDetails: '本館7階催事場、福岡の老舗百貨店',
    nearestStation: '地下鉄天神駅',
    locationDetailList: [
      { id: '16', name: '催事場A' },
      { id: '17', name: '催事場B' }
    ],
    pricing: {
      tuesday: { closer: 12000, girl: 9000 },
      wednesday: { closer: 12000, girl: 9000 },
      thursday: { closer: 12000, girl: 9000 },
      friday: { closer: 13000, girl: 10000 },
      saturday: { closer: 15000, girl: 12000 },
      sunday: { closer: 15000, girl: 12000 },
      monday: { closer: 13000, girl: 10000 },
    }
  }
];

// ヘルパー関数
export const getLocationsByAgency = (agencyId: string): EventLocationData[] => {
  return sampleLocations.filter(location => location.agencyId === agencyId);
};

export const getLocationById = (locationId: string): EventLocationData | undefined => {
  return sampleLocations.find(location => location.id === locationId);
};



