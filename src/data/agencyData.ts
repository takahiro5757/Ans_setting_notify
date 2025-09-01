// 代理店管理の共通データファイル
// ProjectManagementとStaffManagementで共有

export interface Contact {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  type: 'to' | 'cc';
}

export interface Store {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  openingHours: string;
  estimateContacts?: Contact[];
  invoiceContacts?: Contact[];
}

export interface LayerPerson {
  id: string;
  name: string;
  position: string;
  phone: string;
  email?: string;
  assignedStores: string[];
  parentLayerPersonId?: string;
}

export interface AgencyData {
  id: string;
  companyName: string;
  address: string;
  stores: Store[];
  layers: {
    layer1: LayerPerson[];
    layer2: LayerPerson[];
    layer3: LayerPerson[];
    layer4: LayerPerson[];
  };
}

export interface LocationDetail {
  id: string;
  name: string;
}

export interface EventLocationData {
  id: string;
  agencyId: string;
  eventName: string;
  venueName: string;
  address: string;
  nearestStation: string;
  locationDetailList: LocationDetail[];
  pricing: {
    tuesday: { closer: number; girl: number };
    wednesday: { closer: number; girl: number };
    thursday: { closer: number; girl: number };
    friday: { closer: number; girl: number };
    saturday: { closer: number; girl: number };
    sunday: { closer: number; girl: number };
    monday: { closer: number; girl: number };
  };
}

// サンプル代理店データ（ProjectManagementと同期）
export const sampleAgencies: AgencyData[] = [
  {
    id: '1',
    companyName: 'ABC代理店',
    address: '東京都新宿区西新宿1-1-1',
    stores: [
      {
        id: 'store1',
        name: '渋谷店',
        address: '東京都渋谷区道玄坂1-1-1',
        manager: '山田店長',
        phone: '03-1111-2222',
        openingHours: '10:00-20:00',
        estimateContacts: [
          { id: 'est_1_1', lastName: '田中', firstName: '太郎', email: 'tanaka@abc-agency.co.jp', type: 'to' },
          { id: 'est_1_2', lastName: '山田', firstName: '花子', email: 'yamada@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_1_1', lastName: '佐藤', firstName: '次郎', email: 'sato@abc-agency.co.jp', type: 'to' },
          { id: 'inv_1_2', lastName: '鈴木', firstName: '三郎', email: 'suzuki@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store2',
        name: '新宿店',
        address: '東京都新宿区歌舞伎町1-1-1',
        manager: '鈴木店長',
        phone: '03-3333-4444',
        openingHours: '9:00-21:00',
        estimateContacts: [
          { id: 'est_2_1', lastName: '伊藤', firstName: '美咲', email: 'ito@abc-agency.co.jp', type: 'to' },
          { id: 'est_2_2', lastName: '高橋', firstName: '健太', email: 'takahashi@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_2_1', lastName: '渡辺', firstName: '由美', email: 'watanabe@abc-agency.co.jp', type: 'to' },
          { id: 'inv_2_2', lastName: '小林', firstName: '大輔', email: 'kobayashi@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store3',
        name: '池袋店',
        address: '東京都豊島区南池袋1-1-1',
        manager: '佐々木店長',
        phone: '03-5555-6666',
        openingHours: '10:00-20:00',
        estimateContacts: [
          { id: 'est_3_1', lastName: '中村', firstName: '雄一', email: 'nakamura@abc-agency.co.jp', type: 'to' },
          { id: 'est_3_2', lastName: '加藤', firstName: '恵子', email: 'kato@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_3_1', lastName: '松本', firstName: '隆', email: 'matsumoto@abc-agency.co.jp', type: 'to' },
          { id: 'inv_3_2', lastName: '木村', firstName: '理恵', email: 'kimura@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store4',
        name: '品川店',
        address: '東京都港区高輪1-1-1',
        manager: '田中店長',
        phone: '03-7777-8888',
        openingHours: '10:00-20:00',
        estimateContacts: [
          { id: 'est_4_1', lastName: '森田', firstName: '秀樹', email: 'morita@abc-agency.co.jp', type: 'to' },
          { id: 'est_4_2', lastName: '井上', firstName: '明美', email: 'inoue@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_4_1', lastName: '清水', firstName: '正雄', email: 'shimizu@abc-agency.co.jp', type: 'to' },
          { id: 'inv_4_2', lastName: '石田', firstName: '智子', email: 'ishida@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store5',
        name: '上野店',
        address: '東京都台東区上野1-1-1',
        manager: '中村店長',
        phone: '03-9999-0000',
        openingHours: '10:00-20:00'
      },
      {
        id: 'store6',
        name: '横浜店',
        address: '神奈川県横浜市西区1-1-1',
        manager: '伊藤店長',
        phone: '045-1111-2222',
        openingHours: '10:00-21:00',
        estimateContacts: [
          { id: 'est_6_1', lastName: '池田', firstName: '誠', email: 'ikeda@abc-agency.co.jp', type: 'to' },
          { id: 'est_6_2', lastName: '野村', firstName: '美幸', email: 'nomura@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_6_1', lastName: '坂本', firstName: '健', email: 'sakamoto@abc-agency.co.jp', type: 'to' },
          { id: 'inv_6_2', lastName: '内田', firstName: '志保', email: 'uchida@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store7',
        name: '川崎店',
        address: '神奈川県川崎市川崎区1-1-1',
        manager: '松本店長',
        phone: '044-3333-4444',
        openingHours: '10:00-20:00',
        estimateContacts: [
          { id: 'est_7_1', lastName: '長谷川', firstName: '雅史', email: 'hasegawa@abc-agency.co.jp', type: 'to' },
          { id: 'est_7_2', lastName: '大野', firstName: '千春', email: 'ono@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_7_1', lastName: '宮崎', firstName: '直樹', email: 'miyazaki@abc-agency.co.jp', type: 'to' },
          { id: 'inv_7_2', lastName: '川上', firstName: '美穂', email: 'kawakami@abc-agency.co.jp', type: 'cc' }
        ]
      },
      {
        id: 'store8',
        name: '大宮店',
        address: '埼玉県さいたま市大宮区1-1-1',
        manager: '加藤店長',
        phone: '048-5555-6666',
        openingHours: '10:00-20:00'
      },
      {
        id: 'store9',
        name: '千葉店',
        address: '千葉県千葉市中央区1-1-1',
        manager: '斉藤店長',
        phone: '043-7777-8888',
        openingHours: '10:00-20:00'
      },
      {
        id: 'store10',
        name: '立川店',
        address: '東京都立川市1-1-1',
        manager: '小林店長',
        phone: '042-9999-0000',
        openingHours: '10:00-20:00'
      }
    ],
    layers: {
      layer1: [
        { 
          id: 'L1-1', 
          name: '田中太郎', 
          position: '営業部長', 
          phone: '03-1234-5678', 
          email: 'tanaka@abc-agency.com',
          assignedStores: ['store1', 'store2', 'store3', 'store4', 'store5']
        },
        { 
          id: 'L1-2', 
          name: '伊藤花子', 
          position: '取締役', 
          phone: '03-1234-5670', 
          email: 'ito@abc-agency.com',
          assignedStores: ['store6', 'store7', 'store8', 'store9', 'store10']
        }
      ],
      layer2: [
        { 
          id: 'L2-1', 
          name: '佐藤次郎', 
          position: '営業課長', 
          phone: '03-1234-5679', 
          email: 'sato@abc-agency.com',
          assignedStores: ['store1', 'store2'],
          parentLayerPersonId: 'L1-1'
        },
        { 
          id: 'L2-2', 
          name: '高橋三郎', 
          position: '営業課長', 
          phone: '03-1234-5672', 
          email: 'takahashi@abc-agency.com',
          assignedStores: ['store3', 'store4', 'store5'],
          parentLayerPersonId: 'L1-1'
        },
        { 
          id: 'L2-3', 
          name: '山下美咲', 
          position: '営業課長', 
          phone: '03-1234-5673', 
          email: 'yamashita@abc-agency.com',
          assignedStores: ['store6', 'store7'],
          parentLayerPersonId: 'L1-2'
        },
        { 
          id: 'L2-4', 
          name: '林健太', 
          position: '営業課長', 
          phone: '03-1234-5674', 
          email: 'hayashi@abc-agency.com',
          assignedStores: ['store8', 'store9', 'store10'],
          parentLayerPersonId: 'L1-2'
        }
      ],
      layer3: [
        { 
          id: 'L3-1', 
          name: '鈴木一郎', 
          position: '営業主任', 
          phone: '03-1234-5680', 
          assignedStores: ['store1'],
          parentLayerPersonId: 'L2-1'
        },
        { 
          id: 'L3-2', 
          name: '吉田美穂', 
          position: '営業主任', 
          phone: '03-1234-5681', 
          assignedStores: ['store2'],
          parentLayerPersonId: 'L2-1'
        },
        { 
          id: 'L3-3', 
          name: '渡辺拓也', 
          position: '営業主任', 
          phone: '03-1234-5682', 
          assignedStores: ['store3'],
          parentLayerPersonId: 'L2-2'
        },
        { 
          id: 'L3-4', 
          name: '新井明', 
          position: '営業主任', 
          phone: '03-1234-5683', 
          assignedStores: ['store4'],
          parentLayerPersonId: 'L2-2'
        },
        { 
          id: 'L3-5', 
          name: '中島裕子', 
          position: '営業主任', 
          phone: '03-1234-5684', 
          assignedStores: ['store5'],
          parentLayerPersonId: 'L2-3'
        },
        { 
          id: 'L3-6', 
          name: '松田健一', 
          position: '営業主任', 
          phone: '03-1234-5685', 
          assignedStores: ['store6'],
          parentLayerPersonId: 'L2-4'
        }
      ],
      layer4: [
        { 
          id: 'L4-1', 
          name: '田村智子', 
          position: '営業担当', 
          phone: '03-1234-5686', 
          assignedStores: ['store1'],
          parentLayerPersonId: 'L3-1'
        },
        { 
          id: 'L4-2', 
          name: '小川雄大', 
          position: '営業担当', 
          phone: '03-1234-5687', 
          assignedStores: ['store2'],
          parentLayerPersonId: 'L3-2'
        },
        { 
          id: 'L4-3', 
          name: '森田恵美', 
          position: '営業担当', 
          phone: '03-1234-5688', 
          assignedStores: ['store3'],
          parentLayerPersonId: 'L3-3'
        },
        { 
          id: 'L4-4', 
          name: '井上直樹', 
          position: '営業担当', 
          phone: '03-1234-5689', 
          assignedStores: ['store4'],
          parentLayerPersonId: 'L3-4'
        },
        { 
          id: 'L4-5', 
          name: '清水美香', 
          position: '営業担当', 
          phone: '03-1234-5690', 
          assignedStores: ['store5'],
          parentLayerPersonId: 'L3-5'
        },
        { 
          id: 'L4-6', 
          name: '石田雅彦', 
          position: '営業担当', 
          phone: '03-1234-5691', 
          assignedStores: ['store6'],
          parentLayerPersonId: 'L3-6'
        },
        { 
          id: 'L4-7', 
          name: '長谷川由紀', 
          position: '営業担当', 
          phone: '03-1234-5692', 
          assignedStores: ['store7'],
          parentLayerPersonId: 'L3-5'
        },
        { 
          id: 'L4-8', 
          name: '大野浩司', 
          position: '営業担当', 
          phone: '03-1234-5693', 
          assignedStores: ['store8'],
          parentLayerPersonId: 'L3-6'
        },
        { 
          id: 'L4-9', 
          name: '宮崎千春', 
          position: '営業担当', 
          phone: '03-1234-5694', 
          assignedStores: ['store9'],
          parentLayerPersonId: 'L3-3'
        },
        { 
          id: 'L4-10', 
          name: '川上大輔', 
          position: '営業担当', 
          phone: '03-1234-5695', 
          assignedStores: ['store10'],
          parentLayerPersonId: 'L3-4'
        }
      ]
    }
  },
  {
    id: '2',
    companyName: 'DEF代理店',
    address: '大阪府大阪市北区梅田1-1-1',
    stores: [
      {
        id: 'def_store1',
        name: '梅田店',
        address: '大阪府大阪市北区梅田2-1-1',
        manager: '梅田店長',
        phone: '06-1111-1111',
        openingHours: '10:00-21:00'
      },
      {
        id: 'def_store2',
        name: '心斎橋店',
        address: '大阪府大阪市中央区心斎橋1-1-1',
        manager: '心斎橋店長',
        phone: '06-2222-2222',
        openingHours: '11:00-22:00'
      },
      {
        id: 'def_store3',
        name: '天王寺店',
        address: '大阪府大阪市天王寺区1-1-1',
        manager: '天王寺店長',
        phone: '06-3333-3333',
        openingHours: '10:00-21:00'
      }
    ],
    layers: {
      layer1: [
        {
          id: 'DEF_L1_1',
          name: '中村統括',
          position: '統括責任者',
          phone: '090-4444-0001',
          email: 'nakamura@def-agency.com',
          assignedStores: ['def_store1', 'def_store2', 'def_store3']
        }
      ],
      layer2: [
        {
          id: 'DEF_L2_1',
          name: '小林マネージャー',
          position: 'エリアマネージャー',
          phone: '090-5555-0001',
          email: 'kobayashi@def-agency.com',
          assignedStores: ['def_store1'],
          parentLayerPersonId: 'DEF_L1_1'
        },
        {
          id: 'DEF_L2_2',
          name: '加藤マネージャー',
          position: 'エリアマネージャー',
          phone: '090-5555-0002',
          email: 'kato@def-agency.com',
          assignedStores: ['def_store2', 'def_store3'],
          parentLayerPersonId: 'DEF_L1_1'
        }
      ],
      layer3: [
        {
          id: 'DEF_L3_1',
          name: '山本主任',
          position: '営業主任',
          phone: '090-6666-0001',
          email: 'yamamoto@def-agency.com',
          assignedStores: ['def_store2'],
          parentLayerPersonId: 'DEF_L2_2'
        }
      ],
      layer4: []
    }
  },
  {
    id: '3',
    companyName: 'GHI代理店',
    address: '福岡県福岡市博多区博多駅前1-1-1',
    stores: [
      {
        id: 'ghi_store1',
        name: '博多店',
        address: '福岡県福岡市博多区博多駅前2-1-1',
        manager: '博多店長',
        phone: '092-1111-1111',
        openingHours: '10:00-21:00'
      },
      {
        id: 'ghi_store2',
        name: '天神店',
        address: '福岡県福岡市中央区天神1-1-1',
        manager: '天神店長',
        phone: '092-2222-2222',
        openingHours: '11:00-22:00'
      }
    ],
    layers: {
      layer1: [
        {
          id: 'GHI_L1_1',
          name: '松本代表',
          position: '代表取締役',
          phone: '090-6666-0001',
          email: 'matsumoto@ghi-agency.com',
          assignedStores: ['ghi_store1', 'ghi_store2']
        }
      ],
      layer2: [
        {
          id: 'GHI_L2_1',
          name: '橋本課長',
          position: '営業課長',
          phone: '090-7777-0001',
          email: 'hashimoto@ghi-agency.com',
          assignedStores: ['ghi_store1', 'ghi_store2'],
          parentLayerPersonId: 'GHI_L1_1'
        }
      ],
      layer3: [],
      layer4: []
    }
  }
];

// 代理店オプション（選択肢用）
export const agencyOptions = sampleAgencies.map(agency => ({
  id: agency.id,
  name: agency.companyName,
}));

// レイヤーデータ（選択された代理店に基づく）- グループ化された形式
export const getLayerOptions = (agencyId: string) => {
  const agency = sampleAgencies.find(a => a.id === agencyId);
  if (!agency) return [];

  const layerGroups: { 
    layerName: string; 
    persons: { id: string; name: string; person: LayerPerson }[] 
  }[] = [];
  
  // 各レイヤーから人員を取得してグループ化
  Object.entries(agency.layers).forEach(([layerKey, persons]) => {
    if (persons.length > 0) {
      const layerNumber = layerKey.replace('layer', '');
      layerGroups.push({
        layerName: `レイヤー${layerNumber}`,
        persons: persons.map(person => ({
          id: person.id,
          name: `${person.name}（${person.position}）`,
          person: person,
        }))
      });
    }
  });

  return layerGroups;
};

// 店舗データ（選択された代理店に基づく）
export const getStoreOptions = (agencyId: string) => {
  const agency = sampleAgencies.find(a => a.id === agencyId);
  if (!agency) return [];

  return agency.stores.map(store => ({
    id: store.id,
    name: store.name,
    store: store,
  }));
};

// レイヤー名を取得する関数（新しい形式）
export const getLayerPersonName = (personId: string): string => {
  for (const agency of sampleAgencies) {
    for (const [layerKey, persons] of Object.entries(agency.layers)) {
      const person = persons.find(p => p.id === personId);
      if (person) {
        const layerNumber = layerKey.replace('layer', '');
        return `レイヤー${layerNumber}: ${person.name}（${person.position}）`;
      }
    }
  }
  return '';
};

// 店舗名を取得する関数
export const getStoreName = (storeId: string): string => {
  for (const agency of sampleAgencies) {
    const store = agency.stores.find(s => s.id === storeId);
    if (store) {
      return store.name;
    }
  }
  return '';
};
