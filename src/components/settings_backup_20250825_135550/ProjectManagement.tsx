'use client';

import React, { useState, Fragment, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

interface Contact {
  id: string;
  lastName: string;    // 姓
  firstName: string;   // 名
  email: string;       // メールアドレス
  type: 'to' | 'cc';   // To/Cc区分
}

interface Store {
  id: string;
  name: string;           // 店舗名
  address: string;        // 店舗住所
  manager: string;        // 店舗責任者
  phone: string;          // 店舗電話番号
  openingHours: string;   // 営業時間
  // 見積送付先情報（配列）
  estimateContacts?: Contact[];
  // 請求送付先情報（配列）
  invoiceContacts?: Contact[];
}

interface LayerPerson {
  id: string;
  name: string;
  position: string;       // 役職
  phone: string;
  email?: string;
  assignedStores: string[]; // 担当店舗ID配列
  parentLayerPersonId?: string; // 上位レイヤーの人員ID
}

interface AgencyData {
  id: string;
  companyName: string;
  address: string;
  stores: Store[];        // 代理店傘下の店舗一覧
  layers: {
    layer1: LayerPerson[];
    layer2: LayerPerson[];
    layer3: LayerPerson[];
    layer4: LayerPerson[];
  };
}

interface LocationDetail {
  id: string;
  name: string;
}

interface EventLocationData {
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

const initialAgencyData: Omit<AgencyData, 'id'> = {
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

const initialLocationData: Omit<EventLocationData, 'id'> = {
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

const weekdays = [
  { key: 'tuesday', label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday', label: '木曜日' },
  { key: 'friday', label: '金曜日' },
  { key: 'saturday', label: '土曜日' },
  { key: 'sunday', label: '日曜日' },
  { key: 'monday', label: '月曜日' },
];

// サンプルデータ
const sampleAgencies: AgencyData[] = [
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
        openingHours: '9:30-20:30',
        estimateContacts: [
          { id: 'est_5_1', lastName: '橋本', firstName: '和也', email: 'hashimoto@abc-agency.co.jp', type: 'to' },
          { id: 'est_5_2', lastName: '前田', firstName: '裕子', email: 'maeda@abc-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'inv_5_1', lastName: '岡田', firstName: '浩二', email: 'okada@abc-agency.co.jp', type: 'to' },
          { id: 'inv_5_2', lastName: '藤田', firstName: '真由美', email: 'fujita@abc-agency.co.jp', type: 'cc' }
        ]
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
          assignedStores: ['store1', 'store2'],
          parentLayerPersonId: 'L2-1'
        },
        { 
          id: 'L3-2', 
          name: '吉田美穂', 
          position: '営業主任', 
          phone: '03-1234-5681', 
          assignedStores: ['store3', 'store4', 'store5'],
          parentLayerPersonId: 'L2-2'
        },
        { 
          id: 'L3-3', 
          name: '渡辺拓也', 
          position: '営業主任', 
          phone: '03-1234-5682', 
          assignedStores: ['store6', 'store7'],
          parentLayerPersonId: 'L2-3'
        },
        { 
          id: 'L3-4', 
          name: '新井明', 
          position: '営業主任', 
          phone: '03-1234-5683', 
          assignedStores: ['store8', 'store9', 'store10'],
          parentLayerPersonId: 'L2-4'
        }
      ],
      layer4: [
        { 
          id: 'L4-1', 
          name: '山田真一', 
          position: '渋谷店店長', 
          phone: '03-1111-2222', 
          assignedStores: ['store1'],
          parentLayerPersonId: 'L3-1'
        },
        { 
          id: 'L4-2', 
          name: '鈴木清美', 
          position: '新宿店店長', 
          phone: '03-3333-4444', 
          assignedStores: ['store2'],
          parentLayerPersonId: 'L3-1'
        },
        { 
          id: 'L4-3', 
          name: '佐々木康夫', 
          position: '池袋店店長', 
          phone: '03-5555-6666', 
          assignedStores: ['store3'],
          parentLayerPersonId: 'L3-2'
        },
        { 
          id: 'L4-4', 
          name: '田中麻由美', 
          position: '品川店店長', 
          phone: '03-7777-8888', 
          assignedStores: ['store4'],
          parentLayerPersonId: 'L3-2'
        },
        { 
          id: 'L4-5', 
          name: '中村雅之', 
          position: '上野店店長', 
          phone: '03-9999-0000', 
          assignedStores: ['store5'],
          parentLayerPersonId: 'L3-2'
        },
        { 
          id: 'L4-6', 
          name: '伊藤龍男', 
          position: '横浜店店長', 
          phone: '045-1111-2222', 
          assignedStores: ['store6'],
          parentLayerPersonId: 'L3-3'
        },
        { 
          id: 'L4-7', 
          name: '松本友香', 
          position: '川崎店店長', 
          phone: '044-3333-4444', 
          assignedStores: ['store7'],
          parentLayerPersonId: 'L3-3'
        },
        { 
          id: 'L4-8', 
          name: '加藤浩二', 
          position: '大宮店店長', 
          phone: '048-5555-6666', 
          assignedStores: ['store8'],
          parentLayerPersonId: 'L3-4'
        },
        { 
          id: 'L4-9', 
          name: '斉藤恵子', 
          position: '千葉店店長', 
          phone: '043-7777-8888', 
          assignedStores: ['store9'],
          parentLayerPersonId: 'L3-4'
        },
        { 
          id: 'L4-10', 
          name: '小林光男', 
          position: '立川店店長', 
          phone: '042-9999-0000', 
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
        address: '大阪府大阪市北区梅田1-2-3', 
        manager: '平田太一', 
        phone: '06-1111-2222', 
        openingHours: '10:00-21:00',
        estimateContacts: [
          { id: 'def_est_1_1', lastName: '平田', firstName: '太一', email: 'hirata@def-agency.co.jp', type: 'to' },
          { id: 'def_est_1_2', lastName: '大阪', firstName: '花子', email: 'osaka@def-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'def_inv_1_1', lastName: '関西', firstName: '太郎', email: 'kansai@def-agency.co.jp', type: 'to' },
          { id: 'def_inv_1_2', lastName: '梅田', firstName: '美咲', email: 'umeda@def-agency.co.jp', type: 'cc' }
        ]
      },
      { 
        id: 'def_store2', 
        name: '難波店', 
        address: '大阪府大阪市中央区難波1-2-3', 
        manager: '西川店長', 
        phone: '06-3333-4444', 
        openingHours: '10:00-21:00',
        estimateContacts: [
          { id: 'def_est_2_1', lastName: '西川', firstName: '明美', email: 'nishikawa@def-agency.co.jp', type: 'to' },
          { id: 'def_est_2_2', lastName: '難波', firstName: '健太', email: 'namba@def-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'def_inv_2_1', lastName: '南大阪', firstName: '次郎', email: 'minamiosaka@def-agency.co.jp', type: 'to' },
          { id: 'def_inv_2_2', lastName: '中央', firstName: '恵子', email: 'chuo@def-agency.co.jp', type: 'cc' }
        ]
      },
      { 
        id: 'def_store3', 
        name: '天王寺店', 
        address: '大阪府大阪市天王寺区1-2-3', 
        manager: '石井店長', 
        phone: '06-5555-6666', 
        openingHours: '10:00-20:00',
        estimateContacts: [
          { id: 'def_est_3_1', lastName: '石井', firstName: '隆志', email: 'ishii@def-agency.co.jp', type: 'to' },
          { id: 'def_est_3_2', lastName: '天王寺', firstName: '由美', email: 'tennoji@def-agency.co.jp', type: 'cc' }
        ],
        invoiceContacts: [
          { id: 'def_inv_3_1', lastName: '南部', firstName: '雄一', email: 'nanbu@def-agency.co.jp', type: 'to' },
          { id: 'def_inv_3_2', lastName: '阿倍野', firstName: '真理', email: 'abeno@def-agency.co.jp', type: 'cc' }
        ]
      },
      { id: 'def_store4', name: '京都店', address: '京都府京都市中京区1-2-3', manager: '永井店長', phone: '075-7777-8888', openingHours: '10:00-20:00' },
      { id: 'def_store5', name: '神戸店', address: '兵庫県神戸市中央区1-2-3', manager: '長谷川店長', phone: '078-9999-0000', openingHours: '10:00-20:00' },
      { id: 'def_store6', name: '奈良店', address: '奈良県奈良市1-2-3', manager: '河野店長', phone: '0742-1111-2222', openingHours: '10:00-19:00' },
      { id: 'def_store7', name: '和歌山店', address: '和歌山県和歌山市1-2-3', manager: '加々美店長', phone: '073-3333-4444', openingHours: '10:00-19:00' },
      { id: 'def_store8', name: '堺店', address: '大阪府堺市堺区1-2-3', manager: '宮本店長', phone: '072-5555-6666', openingHours: '10:00-20:00' },
      { id: 'def_store9', name: '岸和田店', address: '大阪府岸和田市1-2-3', manager: '古川店長', phone: '072-7777-8888', openingHours: '10:00-20:00' },
      { id: 'def_store10', name: '枚方店', address: '大阪府枚方市1-2-3', manager: '村上店長', phone: '072-9999-0000', openingHours: '10:00-20:00' },
      { id: 'def_store11', name: '名古屋店', address: '愛知県名古屋市中区栄1-2-3', manager: '今井店長', phone: '052-1111-2222', openingHours: '10:00-21:00' },
      { id: 'def_store12', name: '金山店', address: '愛知県名古屋市中区金山1-2-3', manager: '青木店長', phone: '052-3333-4444', openingHours: '10:00-20:00' },
      { id: 'def_store13', name: '豊橋店', address: '愛知県豊橋市1-2-3', manager: '内田店長', phone: '0532-5555-6666', openingHours: '10:00-20:00' },
      { id: 'def_store14', name: '岡崎店', address: '愛知県岡崎市1-2-3', manager: '矢野店長', phone: '0564-7777-8888', openingHours: '10:00-20:00' },
      { id: 'def_store15', name: '静岡店', address: '静岡県静岡市葵区1-2-3', manager: '近藤店長', phone: '054-9999-0000', openingHours: '10:00-20:00' },
      { id: 'def_store16', name: '浜松店', address: '静岡県浜松市中区1-2-3', manager: '斎藤店長', phone: '053-1111-2222', openingHours: '10:00-20:00' },
      { id: 'def_store17', name: '岐阜店', address: '岐阜県岐阜市1-2-3', manager: '武田店長', phone: '058-3333-4444', openingHours: '10:00-20:00' },
      { id: 'def_store18', name: '津店', address: '三重県津市1-2-3', manager: '坂本店長', phone: '059-5555-6666', openingHours: '10:00-20:00' },
      { id: 'def_store19', name: '四日市店', address: '三重県四日市市1-2-3', manager: '三浦店長', phone: '059-7777-8888', openingHours: '10:00-20:00' },
      { id: 'def_store20', name: '富山店', address: '富山県富山市1-2-3', manager: '江口店長', phone: '076-9999-0000', openingHours: '10:00-20:00' }
    ],
    layers: {
      layer1: [
        { 
          id: 'DEF_L1-1', 
          name: '森田誠', 
          position: '西日本統括部長', 
          phone: '06-1000-0001', 
          email: 'morita@def-agency.com',
          assignedStores: ['def_store1', 'def_store2', 'def_store3', 'def_store4', 'def_store5', 'def_store6', 'def_store7', 'def_store8', 'def_store9', 'def_store10']
        },
        { 
          id: 'DEF_L1-2', 
          name: '中島麻衣', 
          position: '中部統括部長', 
          phone: '052-1000-0002', 
          email: 'nakajima@def-agency.com',
          assignedStores: ['def_store11', 'def_store12', 'def_store13', 'def_store14', 'def_store15', 'def_store16', 'def_store17', 'def_store18', 'def_store19', 'def_store20']
        }
      ],
      layer2: [
        { 
          id: 'DEF_L2-1', 
          name: '井上康夫', 
          position: '関西営業部長', 
          phone: '06-2000-0001', 
          email: 'inoue@def-agency.com',
          assignedStores: ['def_store1', 'def_store2', 'def_store3', 'def_store4', 'def_store5'],
          parentLayerPersonId: 'DEF_L1-1'
        },
        { 
          id: 'DEF_L2-2', 
          name: '小川真理子', 
          position: '関西南部営業部長', 
          phone: '06-2000-0002', 
          email: 'ogawa@def-agency.com',
          assignedStores: ['def_store6', 'def_store7', 'def_store8', 'def_store9', 'def_store10'],
          parentLayerPersonId: 'DEF_L1-1'
        },
        { 
          id: 'DEF_L2-3', 
          name: '藤田雄一', 
          position: '中部営業部長', 
          phone: '052-2000-0003', 
          email: 'fujita@def-agency.com',
          assignedStores: ['def_store11', 'def_store12', 'def_store13', 'def_store14', 'def_store15'],
          parentLayerPersonId: 'DEF_L1-2'
        },
        { 
          id: 'DEF_L2-4', 
          name: '松井由香', 
          position: '中部北陸営業部長', 
          phone: '052-2000-0004', 
          email: 'matsui@def-agency.com',
          assignedStores: ['def_store16', 'def_store17', 'def_store18', 'def_store19', 'def_store20'],
          parentLayerPersonId: 'DEF_L1-2'
        }
      ],
      layer3: [
        { 
          id: 'DEF_L3-1', 
          name: '岡本修二', 
          position: '大阪営業課長', 
          phone: '06-3000-0001',
          assignedStores: ['def_store1', 'def_store2', 'def_store3'],
          parentLayerPersonId: 'DEF_L2-1'
        },
        { 
          id: 'DEF_L3-2', 
          name: '山口恵子', 
          position: '京都営業課長', 
          phone: '075-3000-0002',
          assignedStores: ['def_store4', 'def_store5'],
          parentLayerPersonId: 'DEF_L2-1'
        },
        { 
          id: 'DEF_L3-3', 
          name: '橋本大介', 
          position: '南大阪営業課長', 
          phone: '072-3000-0003',
          assignedStores: ['def_store6', 'def_store7', 'def_store8'],
          parentLayerPersonId: 'DEF_L2-2'
        },
        { 
          id: 'DEF_L3-4', 
          name: '野村千春', 
          position: '和歌山営業課長', 
          phone: '073-3000-0004',
          assignedStores: ['def_store9', 'def_store10'],
          parentLayerPersonId: 'DEF_L2-2'
        },
        { 
          id: 'DEF_L3-5', 
          name: '田村健介', 
          position: '愛知営業課長', 
          phone: '052-3000-0005',
          assignedStores: ['def_store11', 'def_store12', 'def_store13'],
          parentLayerPersonId: 'DEF_L2-3'
        },
        { 
          id: 'DEF_L3-6', 
          name: '木村亜由美', 
          position: '東海営業課長', 
          phone: '0532-3000-0006',
          assignedStores: ['def_store14', 'def_store15'],
          parentLayerPersonId: 'DEF_L2-3'
        },
        { 
          id: 'DEF_L3-7', 
          name: '上田浩司', 
          position: '静岡営業課長', 
          phone: '054-3000-0007',
          assignedStores: ['def_store16', 'def_store17'],
          parentLayerPersonId: 'DEF_L2-4'
        },
        { 
          id: 'DEF_L3-8', 
          name: '清水雅美', 
          position: '北陸営業課長', 
          phone: '076-3000-0008',
          assignedStores: ['def_store18', 'def_store19', 'def_store20'],
          parentLayerPersonId: 'DEF_L2-4'
        }
      ],
      layer4: [
        { id: 'DEF_L4-1', name: '平田太一', position: '梅田店店長', phone: '06-4000-0001', assignedStores: ['def_store1'], parentLayerPersonId: 'DEF_L3-1' },
        { id: 'DEF_L4-2', name: '西川明美', position: '難波店店長', phone: '06-4000-0002', assignedStores: ['def_store2'], parentLayerPersonId: 'DEF_L3-1' },
        { id: 'DEF_L4-3', name: '石井隆志', position: '天王寺店店長', phone: '06-4000-0003', assignedStores: ['def_store3'], parentLayerPersonId: 'DEF_L3-1' },
        { id: 'DEF_L4-4', name: '永井りえ', position: '京都店店長', phone: '075-4000-0004', assignedStores: ['def_store4'], parentLayerPersonId: 'DEF_L3-2' },
        { id: 'DEF_L4-5', name: '長谷川光男', position: '神戸店店長', phone: '078-4000-0005', assignedStores: ['def_store5'], parentLayerPersonId: 'DEF_L3-2' },
        { id: 'DEF_L4-6', name: '河野美智子', position: '奈良店店長', phone: '0742-4000-0006', assignedStores: ['def_store6'], parentLayerPersonId: 'DEF_L3-3' },
        { id: 'DEF_L4-7', name: '加々美達也', position: '和歌山店店長', phone: '073-4000-0007', assignedStores: ['def_store7'], parentLayerPersonId: 'DEF_L3-3' },
        { id: 'DEF_L4-8', name: '宮本和子', position: '堺店店長', phone: '072-4000-0008', assignedStores: ['def_store8'], parentLayerPersonId: 'DEF_L3-3' },
        { id: 'DEF_L4-9', name: '古川博文', position: '岸和田店店長', phone: '072-4000-0009', assignedStores: ['def_store9'], parentLayerPersonId: 'DEF_L3-4' },
        { id: 'DEF_L4-10', name: '村上綾乃', position: '枚方店店長', phone: '072-4000-0010', assignedStores: ['def_store10'], parentLayerPersonId: 'DEF_L3-4' },
        { id: 'DEF_L4-11', name: '今井正人', position: '名古屋店店長', phone: '052-4000-0011', assignedStores: ['def_store11'], parentLayerPersonId: 'DEF_L3-5' },
        { id: 'DEF_L4-12', name: '青木香織', position: '金山店店長', phone: '052-4000-0012', assignedStores: ['def_store12'], parentLayerPersonId: 'DEF_L3-5' },
        { id: 'DEF_L4-13', name: '内田勝', position: '豊橋店店長', phone: '0532-4000-0013', assignedStores: ['def_store13'], parentLayerPersonId: 'DEF_L3-5' },
        { id: 'DEF_L4-14', name: '矢野晴美', position: '岡崎店店長', phone: '0564-4000-0014', assignedStores: ['def_store14'], parentLayerPersonId: 'DEF_L3-6' },
        { id: 'DEF_L4-15', name: '近藤英雄', position: '静岡店店長', phone: '054-4000-0015', assignedStores: ['def_store15'], parentLayerPersonId: 'DEF_L3-6' },
        { id: 'DEF_L4-16', name: '斎藤真紀', position: '浜松店店長', phone: '053-4000-0016', assignedStores: ['def_store16'], parentLayerPersonId: 'DEF_L3-7' },
        { id: 'DEF_L4-17', name: '武田信二', position: '岐阜店店長', phone: '058-4000-0017', assignedStores: ['def_store17'], parentLayerPersonId: 'DEF_L3-7' },
        { id: 'DEF_L4-18', name: '坂本里美', position: '津店店長', phone: '059-4000-0018', assignedStores: ['def_store18'], parentLayerPersonId: 'DEF_L3-8' },
        { id: 'DEF_L4-19', name: '三浦克己', position: '四日市店店長', phone: '059-4000-0019', assignedStores: ['def_store19'], parentLayerPersonId: 'DEF_L3-8' },
        { id: 'DEF_L4-20', name: '江口みゆき', position: '富山店店長', phone: '076-4000-0020', assignedStores: ['def_store20'], parentLayerPersonId: 'DEF_L3-8' }
      ]
    }
  }
];

const sampleLocations = [
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
    address: '東京都江東区豊洲2-4-9',
    locationName: 'ららぽーと豊洲',
    locationDetails: '1階センターコート、ファミリー層の集客に最適',
    nearestStation: 'ゆりかもめ豊洲駅',
    locationDetailList: [
      { id: '1', name: 'メインステージ' },
      { id: '2', name: '相談カウンター' },
      { id: '3', name: 'キッズスペース' }
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
    id: '3',
    agencyId: '1',
    address: '千葉県船橋市浜町2-2-7',
    locationName: 'イトーヨーカドー船橋店',
    locationDetails: '食品館入口横特設会場、地域密着型の立地',
    nearestStation: 'JR船橋駅',
    locationDetailList: [
      { id: '1', name: 'エントランスブース' },
      { id: '2', name: '商品展示エリア' }
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
    id: '4',
    agencyId: '2',
    address: '大阪府大阪市北区角田町7-10',
    locationName: 'イオンモール大阪ドームシティ',
    locationDetails: '1階グランドコート、大阪ドーム隣接で集客力抜群',
    nearestStation: 'JR大阪駅',
    locationDetailList: [
      { id: '1', name: 'グランドコート' },
      { id: '2', name: 'サブステージ' },
      { id: '3', name: 'キャンペーンブース' }
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
    id: '5',
    agencyId: '2',
    address: '愛知県名古屋市中村区名駅1-1-4',
    locationName: 'JRセントラルタワーズ',
    locationDetails: '12階スカイストリート、名古屋駅直結でアクセス抜群',
    nearestStation: 'JR名古屋駅',
    locationDetailList: [
      { id: '1', name: 'スカイステージ' },
      { id: '2', name: 'イベントスペース' }
    ],
    pricing: {
      tuesday: { closer: 15500, girl: 12500 },
      wednesday: { closer: 15500, girl: 12500 },
      thursday: { closer: 15500, girl: 12500 },
      friday: { closer: 16500, girl: 13500 },
      saturday: { closer: 18500, girl: 15500 },
      sunday: { closer: 18500, girl: 15500 },
      monday: { closer: 16500, girl: 13500 },
    }
  },
  {
    id: '6',
    agencyId: '2',
    address: '京都府京都市下京区烏丸通七条下ル',
    locationName: 'イオンモールKYOTO',
    locationDetails: '京都駅前、観光客と地元客の両方を狙える立地',
    nearestStation: 'JR京都駅',
    locationDetailList: [
      { id: '1', name: 'センターコート' },
      { id: '2', name: '体験ブース' },
      { id: '3', name: 'フォトスポット' }
    ],
    pricing: {
      tuesday: { closer: 14500, girl: 11500 },
      wednesday: { closer: 14500, girl: 11500 },
      thursday: { closer: 14500, girl: 11500 },
      friday: { closer: 15500, girl: 12500 },
      saturday: { closer: 17500, girl: 14500 },
      sunday: { closer: 17500, girl: 14500 },
      monday: { closer: 15500, girl: 12500 },
    }
  }
];

type SubTabValue = 'agency-info' | 'stores' | 'events' | 'layers' | 'organization';

export const ProjectManagement: React.FC = () => {
  // 上位タブ（代理店選択）の状態
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  // 下位タブの状態
  const [subTabValue, setSubTabValue] = useState<SubTabValue>('agency-info');
  const [agencies, setAgencies] = useState<AgencyData[]>(sampleAgencies);
  const [locations, setLocations] = useState<EventLocationData[]>(sampleLocations);
  
  // ダイアログ状態
  const [agencyDialogOpen, setAgencyDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [layerDialogOpen, setLayerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [editingAgency, setEditingAgency] = useState<AgencyData | null>(null);
  const [editingLocation, setEditingLocation] = useState<EventLocationData | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingLayer, setEditingLayer] = useState<'layer1' | 'layer2' | 'layer3' | 'layer4' | null>(null);
  const [editingLayerPerson, setEditingLayerPerson] = useState<LayerPerson | null>(null);
  
  // フォームデータ
  const [agencyData, setAgencyData] = useState<Omit<AgencyData, 'id'>>(initialAgencyData);
  const [locationData, setLocationData] = useState<Omit<EventLocationData, 'id'>>(initialLocationData);
  const [storeData, setStoreData] = useState<Omit<Store, 'id'>>({
    name: '',
    address: '',
    manager: '',
    phone: '',
    openingHours: '',
    estimateContacts: [],
    invoiceContacts: []
  });
  const [layerPersonData, setLayerPersonData] = useState<Omit<LayerPerson, 'id'>>({
    name: '',
    position: '',
    phone: '',
    email: '',
    assignedStores: [],
    parentLayerPersonId: undefined
  });

  // コンタクト管理用のヘルパー関数
  const addContact = (type: 'estimate' | 'invoice') => {
    const newContact: Contact = {
      id: `${type}_${Date.now()}`,
      lastName: '',
      firstName: '',
      email: '',
      type: 'to'
    };
    
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: [...(prev.estimateContacts || []), newContact]
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: [...(prev.invoiceContacts || []), newContact]
      }));
    }
  };

  const removeContact = (type: 'estimate' | 'invoice', contactId: string) => {
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: prev.estimateContacts?.filter(c => c.id !== contactId) || []
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: prev.invoiceContacts?.filter(c => c.id !== contactId) || []
      }));
    }
  };

  const updateContact = (type: 'estimate' | 'invoice', contactId: string, field: keyof Contact, value: string) => {
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: prev.estimateContacts?.map(c => 
          c.id === contactId ? { ...c, [field]: value } : c
        ) || []
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: prev.invoiceContacts?.map(c => 
          c.id === contactId ? { ...c, [field]: value } : c
        ) || []
      }));
    }
  };
  
  // 場所詳細管理（複数入力フィールド対応）
  const [locationDetailInputs, setLocationDetailInputs] = useState<Array<Omit<LocationDetail, 'id'> & { tempId: string }>>([]);
  
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [selectedAgencyForManagement, setSelectedAgencyForManagement] = useState<string>('');

  // 組織図用の状態管理
  const [connections, setConnections] = useState<Array<{
    from: string;
    to: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>>([]);
  const personRefsRef = useRef<Record<string, HTMLElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 組織図用のref関数
  const setPersonRef = useCallback((personId: string) => (el: HTMLElement | null) => {
    if (el) {
      personRefsRef.current[personId] = el;
      // 接続線の再計算をトリガー
      const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
      if (selectedAgency && subTabValue === 'organization') {
        setTimeout(() => {
          calculateConnections();
        }, 100);
      }
    }
  }, [selectedAgencyId, subTabValue]);

  // 接続線計算関数
  const calculateConnections = useCallback(() => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency || subTabValue !== 'organization' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: typeof connections = [];

    const layer1People = selectedAgency.layers.layer1;
    const layer2People = selectedAgency.layers.layer2;
    const layer3People = selectedAgency.layers.layer3;
    const layer4People = selectedAgency.layers.layer4;

    // 各人の親子関係を処理
    [...layer2People, ...layer3People, ...layer4People].forEach(person => {
      if (person.parentLayerPersonId && 
          personRefsRef.current[person.parentLayerPersonId] && 
          personRefsRef.current[person.id]) {
        const parentElement = personRefsRef.current[person.parentLayerPersonId];
        const childElement = personRefsRef.current[person.id];
        
        const parentRect = parentElement.getBoundingClientRect();
        const childRect = childElement.getBoundingClientRect();
        
        // SVGのオフセット(-20px)を考慮した座標計算
        const fromX = parentRect.left + parentRect.width / 2 - containerRect.left + 20;
        const fromY = parentRect.top + parentRect.height / 2 - containerRect.top + 20;
        const toX = childRect.left + childRect.width / 2 - containerRect.left + 20;
        const toY = childRect.top + childRect.height / 2 - containerRect.top + 20;
        
        newConnections.push({
          from: person.parentLayerPersonId,
          to: person.id,
          fromX,
          fromY,
          toX,
          toY
        });
      }
    });

    setConnections(newConnections);
  }, [selectedAgencyId, subTabValue, agencies]);

  // タブ切り替え時にrefsをリセット
  useEffect(() => {
    personRefsRef.current = {};
    setConnections([]);
  }, [selectedAgencyId, subTabValue]);

  // ヘルパー関数
  const getAgencyName = (agencyId: string): string => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.companyName : '不明な代理店';
  };

  const processLocationDetails = () => {
    // 既存の場所詳細を保持
    const existingDetails = locationData.locationDetailList || [];
    
    // 新規追加の場所詳細を処理
    const newDetails = locationDetailInputs.map((input, index) => ({
      id: `detail_${Date.now()}_${index}`,
      name: input.name.trim(),
    }));
    
    // 既存 + 新規を結合して返す
    return [...existingDetails, ...newDetails];
  };

  // 保存ハンドラー
  const handleSaveAgency = () => {
    if (editingAgency) {
      setAgencies(prev => prev.map(agency => 
        agency.id === editingAgency.id ? { ...agency, ...agencyData } : agency
      ));
      setSaveMessage('代理店情報を更新しました');
    } else {
      const newAgency: AgencyData = {
        id: Date.now().toString(),
        ...agencyData,
      };
      setAgencies(prev => [...prev, newAgency]);
      // 新規追加した代理店を自動選択
      setSelectedAgencyId(newAgency.id);
      setSubTabValue('agency-info');
      setSaveMessage('新しい代理店を追加しました');
    }
    
    setAgencyDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteAgency = () => {
    if (!editingAgency) return;
    
    // 関連データの計算
    const storeCount = editingAgency.stores.length;
    const personnelCount = Object.values(editingAgency.layers).flat().length;
    const relatedLocations = locations.filter(loc => loc.agencyId === editingAgency.id);
    
    // 代理店を削除
    setAgencies(prev => prev.filter(agency => agency.id !== editingAgency.id));
    
    // 関連するイベント場所も削除
    setLocations(prev => prev.filter(loc => loc.agencyId !== editingAgency.id));
    
    // 削除した代理店が選択されていた場合、選択を解除
    if (selectedAgencyId === editingAgency.id) {
      setSelectedAgencyId(null);
      setSubTabValue('agency-info');
    }
    
    setDeleteDialogOpen(false);
    setEditingAgency(null);
    setSaveMessage(`代理店「${editingAgency.companyName}」を削除しました（店舗${storeCount}件、人員${personnelCount}名、イベント場所${relatedLocations.length}件を含む）`);
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const handleSaveStore = () => {
    if (!selectedAgencyId) return;
    if (!storeData.name.trim() || !storeData.address.trim() || !storeData.phone.trim()) {
      alert('店舗名、住所、電話番号は必須項目です');
      return;
    }

    if (editingStore) {
      setAgencies(prev => prev.map(agency => 
        agency.id === selectedAgencyId
          ? {
              ...agency,
              stores: agency.stores.map(store => 
                store.id === editingStore.id ? { ...store, ...storeData } : store
              )
            }
          : agency
      ));
      setSaveMessage('店舗情報を更新しました');
    } else {
      const newStore: Store = {
        id: `store_${Date.now()}`,
        ...storeData,
      };
      setAgencies(prev => prev.map(agency => 
        agency.id === selectedAgencyId
          ? { ...agency, stores: [...agency.stores, newStore] }
          : agency
      ));
      setSaveMessage('新しい店舗を追加しました');
    }
    
    setStoreDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveLocation = () => {
    // 場所詳細を処理
    const finalLocationDetailList = processLocationDetails();
    const finalLocationData = {
      ...locationData,
      locationDetailList: finalLocationDetailList,
    };

    if (editingLocation) {
      setLocations(prev => prev.map(location => 
        location.id === editingLocation.id ? { ...location, ...finalLocationData } : location
      ));
      setSaveMessage('イベント場所情報を更新しました');
    } else {
      const newLocation: EventLocationData = {
        id: Date.now().toString(),
        ...finalLocationData,
      };
      setLocations(prev => [...prev, newLocation]);
      setSaveMessage('新しいイベント場所を追加しました');
    }
    
    // フォームをリセット
    setLocationDetailInputs([]);
    setLocationDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleEditLocation = (location: EventLocationData) => {
    setEditingLocation(location);
    setLocationData({
      agencyId: location.agencyId,
      address: location.address,
      locationName: location.locationName,
      locationDetails: location.locationDetails,
      nearestStation: location.nearestStation || '',
      locationDetailList: location.locationDetailList || [],
      pricing: location.pricing,
    });
    
    // 編集時は既存データはlocationDetailListで管理し、locationDetailInputsは空にする
    setLocationDetailInputs([]);
    
    setLocationDialogOpen(true);
  };

  // イベント場所詳細管理用ヘルパー関数
  const handleAddLocationDetailInput = () => {
    const newInput = {
      tempId: `temp_${Date.now()}`,
      name: '',
    };
    setLocationDetailInputs(prev => [...prev, newInput]);
  };

  const handleRemoveLocationDetailInput = (tempId: string) => {
    setLocationDetailInputs(prev => prev.filter(input => input.tempId !== tempId));
  };

  const handleLocationDetailInputChange = (tempId: string, field: keyof Omit<LocationDetail, 'id'>, value: string) => {
    setLocationDetailInputs(prev => 
      prev.map(input => 
        input.tempId === tempId ? { ...input, [field]: value } : input
      )
    );
  };

  const handleRemoveExistingLocationDetail = (detailId: string) => {
    setLocationData(prev => ({
      ...prev,
      locationDetailList: prev.locationDetailList?.filter(detail => detail.id !== detailId) || []
    }));
  };

  // 特定の人がどのレイヤーに所属しているかを見つける関数
  const findPersonLayer = (agency: AgencyData, personId: string): string | null => {
    const layers = ['layer1', 'layer2', 'layer3', 'layer4'] as const;
    for (const layerKey of layers) {
      const found = agency.layers[layerKey].find(person => person.id === personId);
      if (found) {
        return layerKey;
      }
    }
    return null;
  };

  // レイヤー人員保存ハンドラー
  const handleSaveLayerPerson = () => {
    if (!selectedAgencyId || !editingLayer) return;
    if (!layerPersonData.name.trim() || !layerPersonData.position.trim() || !layerPersonData.phone.trim()) {
      alert('名前、役職、電話番号は必須項目です');
      return;
    }

    const newPerson: LayerPerson = {
      id: editingLayerPerson?.id || `L${editingLayer.slice(-1)}-${Date.now()}`,
      name: layerPersonData.name.trim(),
      position: layerPersonData.position.trim(),
      phone: layerPersonData.phone.trim(),
      email: layerPersonData.email?.trim() || undefined,
      assignedStores: layerPersonData.assignedStores,
      parentLayerPersonId: layerPersonData.parentLayerPersonId
    };

    setAgencies(prev => prev.map(agency => 
      agency.id === selectedAgencyId
        ? {
            ...agency,
            layers: {
              ...agency.layers,
              [editingLayer]: editingLayerPerson
                ? agency.layers[editingLayer].map(person => 
                    person.id === editingLayerPerson.id ? newPerson : person
                  )
                : [...agency.layers[editingLayer], newPerson]
            }
          }
        : agency
    ));

    setSaveMessage(editingLayerPerson ? 'レイヤー人員を更新しました' : 'レイヤー人員を追加しました');
    setLayerDialogOpen(false);
    setEditingLayerPerson(null);
    setEditingLayer(null);
    setLayerPersonData({
      name: '',
      position: '',
      phone: '',
      email: '',
      assignedStores: [],
      parentLayerPersonId: undefined
    });
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const renderAgencyInfo = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="代理店基本情報"
          subheader="代理店の基本情報の確認・編集"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setAgencyData({
                    companyName: selectedAgency.companyName,
                    address: selectedAgency.address || '',
                    stores: selectedAgency.stores,
                    layers: selectedAgency.layers
                  });
                  setEditingAgency(selectedAgency);
                  setAgencyDialogOpen(true);
                }}
              >
                編集
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setEditingAgency(selectedAgency);
                  setDeleteDialogOpen(true);
                }}
              >
                削除
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                代理店名
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedAgency.companyName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                代理店住所
              </Typography>
              <Typography variant="body1">
                {selectedAgency.address || '住所が登録されていません'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderStoreManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="店舗マスタ"
          subheader="代理店店舗の登録・管理"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingStore(null);
                  setStoreData({
                    name: '',
                    address: '',
                    manager: '',
                    phone: '',
                    openingHours: ''
                  });
                  setStoreDialogOpen(true);
                }}
              >
                店舗追加
              </Button>
            </Box>
          }
        />
        <CardContent>
          {selectedAgency.stores.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              この代理店にはまだ店舗が登録されていません
            </Typography>
          ) : (
            selectedAgency.stores.map((store) => (
              <Accordion key={store.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <StoreIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {store.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStore(store);
                          setStoreData({
                            name: store.name,
                            address: store.address,
                            manager: store.manager,
                            phone: store.phone,
                            openingHours: store.openingHours,
                            estimateContacts: store.estimateContacts || [],
                            invoiceContacts: store.invoiceContacts || []
                          });
                          setStoreDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('この店舗を削除しますか？')) {
                            setAgencies(prev => prev.map(agency => 
                              agency.id === selectedAgencyId
                                ? {
                                    ...agency,
                                    stores: agency.stores.filter(s => s.id !== store.id)
                                  }
                                : agency
                            ));
                            setSaveMessage('店舗を削除しました');
                            setTimeout(() => setSaveMessage(''), 3000);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>基本情報</Typography>
                      <Typography variant="body2"><strong>住所:</strong> {store.address}</Typography>
                      <Typography variant="body2"><strong>電話番号:</strong> {store.phone}</Typography>
                      <Typography variant="body2"><strong>営業時間:</strong> {store.openingHours}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>店舗責任者</Typography>
                      {(() => {
                        const manager = selectedAgency.layers.layer4?.find(person => 
                          person.assignedStores.includes(store.id)
                        );
                        return manager ? (
                          <>
                            <Typography variant="body2"><strong>責任者:</strong> {manager.name}</Typography>
                            <Typography variant="body2"><strong>役職:</strong> {manager.position}</Typography>
                            <Typography variant="body2"><strong>電話:</strong> {manager.phone}</Typography>
                            {manager.email && (
                              <Typography variant="body2"><strong>メール:</strong> {manager.email}</Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">責任者が設定されていません</Typography>
                        );
                      })()}
                    </Grid>
                    
                    {/* 見積送付先情報 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>見積送付先</Typography>
                      {store.estimateContacts && store.estimateContacts.length > 0 ? (
                        store.estimateContacts.map((contact, index) => (
                          <Box key={contact.id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{contact.type.toUpperCase()}:</strong> {contact.lastName} {contact.firstName}
                            </Typography>
                            {contact.email && (
                              <Typography variant="body2" sx={{ ml: 2 }}>📧 {contact.email}</Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">見積送付先が設定されていません</Typography>
                      )}
                    </Grid>

                    {/* 請求送付先情報 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>請求送付先</Typography>
                      {store.invoiceContacts && store.invoiceContacts.length > 0 ? (
                        store.invoiceContacts.map((contact, index) => (
                          <Box key={contact.id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{contact.type.toUpperCase()}:</strong> {contact.lastName} {contact.firstName}
                            </Typography>
                            {contact.email && (
                              <Typography variant="body2" sx={{ ml: 2 }}>📧 {contact.email}</Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">請求送付先が設定されていません</Typography>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEventManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    const agencyEvents = locations.filter(loc => loc.agencyId === selectedAgencyId);
    const dayLabels: Record<string, string> = {
      tuesday: '火曜日',
      wednesday: '水曜日', 
      thursday: '木曜日',
      friday: '金曜日',
      saturday: '土曜日',
      sunday: '日曜日',
      monday: '月曜日',
    };

    return (
      <Card>
        <CardHeader 
          title="イベントマスタ"
          subheader="イベント場所・料金設定管理"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingLocation(null);
                  setLocationData({
                    ...initialLocationData,
                    agencyId: selectedAgencyId || '',
                  });
                  setLocationDetailInputs([]);
                  setLocationDialogOpen(true);
                }}
              >
                場所追加
              </Button>
            </Box>
          }
        />
        <CardContent>
          {agencyEvents.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              この代理店にはまだイベント場所が登録されていません
            </Typography>
          ) : (
            agencyEvents.map((location) => (
              <Accordion key={location.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {location.locationName}
                      </Typography>
                      {location.nearestStation && (
                        <Typography variant="body2" color="text.secondary">
                          最寄駅: {location.nearestStation}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLocation(location);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('このイベント場所を削除しますか？')) {
                          setLocations(prev => prev.filter(l => l.id !== location.id));
                          setSaveMessage('イベント場所を削除しました');
                          setTimeout(() => setSaveMessage(''), 3000);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>基本情報</Typography>
                      <Typography variant="body2"><strong>住所:</strong> {location.address}</Typography>
                      <Typography variant="body2"><strong>場所名:</strong> {location.locationName}</Typography>
                      {location.nearestStation && (
                        <Typography variant="body2"><strong>最寄駅:</strong> {location.nearestStation}</Typography>
                      )}
                      <Typography variant="body2"><strong>詳細:</strong> {location.locationDetails}</Typography>
                
                      
                      {/* 場所詳細リスト */}
                      {location.locationDetailList && location.locationDetailList.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>場所詳細一覧</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {location.locationDetailList.map((detail) => (
                              <Chip key={detail.id} label={detail.name} size="small" color="primary" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>料金設定</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>曜日</TableCell>
                              <TableCell align="right">クローザー</TableCell>
                              <TableCell align="right">ガール</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(location.pricing || {}).map(([day, pricing]) => (
                              <TableRow key={day}>
                                <TableCell>{dayLabels[day]}</TableCell>
                                <TableCell align="right">¥{pricing.closer.toLocaleString()}</TableCell>
                                <TableCell align="right">¥{pricing.girl.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLayerManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="レイヤー管理"
          subheader={`${selectedAgency.companyName} の階層管理`}
        />
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            組織階層情報
          </Typography>
          {Object.entries(selectedAgency.layers).map(([layerKey, persons]) => (
            <Box key={layerKey} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {layerKey.replace('layer', 'レイヤー')}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingLayerPerson(null);
                    setEditingLayer(layerKey as 'layer1' | 'layer2' | 'layer3' | 'layer4');
                    // レイヤーに応じて上長の初期値を設定
                    const initialParentId = layerKey === 'layer1' ? undefined : '';
                    setLayerPersonData({
                      name: '',
                      position: '',
                      phone: '',
                      email: '',
                      assignedStores: [],
                      parentLayerPersonId: initialParentId
                    });
                    setLayerDialogOpen(true);
                  }}
                >
                  追加
                </Button>
              </Box>
              {persons.map((person) => (
                <Accordion key={person.id} sx={{ mb: 1, ml: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {person.name} ({person.position})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLayerPerson(person);
                            setEditingLayer(layerKey as 'layer1' | 'layer2' | 'layer3' | 'layer4');
                            setLayerPersonData({
                              name: person.name,
                              position: person.position,
                              phone: person.phone,
                              email: person.email || '',
                              assignedStores: person.assignedStores,
                              parentLayerPersonId: person.parentLayerPersonId
                            });
                            setLayerDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('この人員を削除しますか？')) {
                              setAgencies(prev => prev.map(agency => 
                                agency.id === selectedAgencyId
                                  ? {
                                      ...agency,
                                      layers: {
                                        ...agency.layers,
                                        [layerKey]: agency.layers[layerKey as keyof typeof agency.layers].filter(p => p.id !== person.id)
                                      }
                                    }
                                  : agency
                              ));
                              setSaveMessage('人員を削除しました');
                              setTimeout(() => setSaveMessage(''), 3000);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>電話:</strong> {person.phone}</Typography>
                        {person.email && (
                          <Typography variant="body2"><strong>メール:</strong> {person.email}</Typography>
                        )}
                        {/* 上長情報表示 */}
                        {person.parentLayerPersonId && (
                          <Typography variant="body2"><strong>上長:</strong> {(() => {
                            // 上長を検索
                            const parentPerson = Object.values(selectedAgency.layers).flat().find(p => p.id === person.parentLayerPersonId);
                            if (parentPerson) {
                              // 上長のレイヤーを取得
                              const parentLayer = findPersonLayer(selectedAgency, parentPerson.id);
                              const layerDisplay = parentLayer ? parentLayer.replace('layer', 'レイヤー') : '';
                              return `${parentPerson.name} (${parentPerson.position}) [${layerDisplay}]`;
                            }
                            return '不明';
                          })()}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>担当店舗数:</strong> {person.assignedStores.length}店舗</Typography>
                        {person.assignedStores.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              担当店舗: {person.assignedStores.map(storeId => {
                                const store = selectedAgency.stores.find(s => s.id === storeId);
                                return store ? store.name : storeId;
                              }).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              {persons.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  未登録
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderOrganizationChart = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    // 人員カードを描画
    const renderPersonCard = (person: LayerPerson, level: number) => (
      <Paper
        ref={setPersonRef(person.id)}
        sx={{
          p: 1,
          width: 100,
          minHeight: 60,
          border: '2px solid',
          borderColor:
            level === 0 ? 'primary.main' :
            level === 1 ? 'secondary.main' :
            level === 2 ? 'warning.main' : 'success.main',
          borderRadius: 2,
          bgcolor: level === 0 ? 'primary.light' : 'background.paper',
          color: level === 0 ? 'white' : 'inherit',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {person.name}
        </Typography>
        <Typography variant="caption" color={level === 0 ? 'inherit' : 'text.secondary'} sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
          {person.position}
        </Typography>
      </Paper>
    );

    // 店舗カードを描画
    const renderStoreCard = (store: Store) => (
      <Paper sx={{ 
        p: 1, 
        width: 80,
        textAlign: 'center', 
        bgcolor: 'grey.100', 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 1,
        position: 'relative',
        zIndex: 2
      }}>
        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
          {store.name}
        </Typography>
      </Paper>
    );

    // 各レイヤーのデータを取得
    const layer1People = selectedAgency.layers.layer1;
    const layer2People = selectedAgency.layers.layer2;
    const layer3People = selectedAgency.layers.layer3;
    const layer4People = selectedAgency.layers.layer4;



    return (
      <Card>
        <CardHeader 
          title="組織図"
          subheader={`${selectedAgency.companyName} の組織構造`}
        />
        <CardContent>
          <Box sx={{ overflowX: 'auto', py: 3, px: 3 }}>
            <Box 
              ref={containerRef}
              sx={{ 
                position: 'relative', 
                textAlign: 'center', 
                minHeight: '700px',
                minWidth: '2000px',
                overflow: 'visible',
                px: 6
              }}
            >
              {/* SVG接続線 */}
              <svg 
                style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  left: '-20px', 
                  width: 'calc(100% + 40px)', 
                  height: 'calc(100% + 40px)', 
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                {connections.map((conn, index) => {
                  const midY = conn.fromY + (conn.toY - conn.fromY) / 2;
                  return (
                    <g key={index}>
                      <path
                        d={`M ${conn.fromX} ${conn.fromY} L ${conn.fromX} ${midY} L ${conn.toX} ${midY} L ${conn.toX} ${conn.toY}`}
                        stroke="#1976d2"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.9"
                      />
                      <circle 
                        cx={conn.fromX} 
                        cy={conn.fromY} 
                        r="3" 
                        fill="#1976d2" 
                        opacity="0.9"
                        stroke="white"
                        strokeWidth="1"
                      />
                      <circle 
                        cx={conn.toX} 
                        cy={conn.toY} 
                        r="3" 
                        fill="#1976d2" 
                        opacity="0.9"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* レイヤー1 */}
              {layer1People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {layer1People.map(person => {
                      const subordinates = layer2People.filter(l2 => l2.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 150;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 0)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー2 */}
              {layer2People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {layer2People.map(person => {
                      const subordinates = layer3People.filter(l3 => l3.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 120;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 1)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー3 */}
              {layer3People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {layer3People.map(person => {
                      const subordinates = layer4People.filter(l4 => l4.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 120;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 2)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー4と店舗を一体で配置 */}
              {layer4People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {layer4People.map(person => {
                      const personStores = selectedAgency.stores.filter(store => 
                        person.assignedStores.includes(store.id)
                      );
                      
                      return (
                        <Box key={person.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          {renderPersonCard(person, 3)}
                          {personStores.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {personStores.map(store => (
                                <Box key={store.id}>
                                  {renderStoreCard(store)}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}


            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <CampaignIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        代理店・イベント管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* 2段階タブナビゲーション */}
      {/* 上位タブ: 代理店選択 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            代理店選択
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setAgencyData({
                companyName: '',
                address: '',
                stores: [],
                layers: {
                  layer1: [],
                  layer2: [],
                  layer3: [],
                  layer4: []
                }
              });
              setEditingAgency(null);
              setAgencyDialogOpen(true);
            }}
            size="small"
          >
            代理店追加
          </Button>
        </Box>
        <Tabs 
          value={selectedAgencyId || false} 
          onChange={(e, newValue) => {
            setSelectedAgencyId(newValue);
            setSubTabValue('agency-info');
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {agencies.map((agency) => (
            <Tab 
              key={agency.id}
              value={agency.id}
              label={agency.companyName}
              icon={<BusinessIcon />} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* 下位タブ: 機能選択 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: -1 }}>
        <Tabs 
          value={subTabValue} 
          onChange={(e, newValue) => setSubTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              opacity: selectedAgencyId ? 1 : 0.5,
              pointerEvents: selectedAgencyId ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }
          }}
        >
          <Tab 
            value="agency-info"
            label="代理店基本情報" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="stores"
            label="店舗マスタ" 
            icon={<StoreIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="events"
            label="イベントマスタ" 
            icon={<CampaignIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="layers"
            label="レイヤー管理" 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="organization"
            label="組織図" 
            icon={<AccountTreeIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 代理店未選択時のメッセージ */}
      {!selectedAgencyId && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              代理店を選択してください
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上部のタブから管理したい代理店を選択すると、該当代理店の情報が表示されます。
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 選択された代理店の情報表示 */}
      {selectedAgencyId && (
        <>
          {/* 下位タブコンテンツ */}
          {subTabValue === 'agency-info' && renderAgencyInfo()}
          {subTabValue === 'stores' && renderStoreManagement()}
          {subTabValue === 'events' && renderEventManagement()}
          {subTabValue === 'layers' && renderLayerManagement()}
          {subTabValue === 'organization' && renderOrganizationChart()}
        </>
      )}

      {/* 店舗編集ダイアログ */}
      <Dialog open={storeDialogOpen} onClose={() => setStoreDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingStore ? '店舗情報編集' : '新しい店舗追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 基本情報 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="店舗名"
                value={storeData.name}
                onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={storeData.phone}
                onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="住所"
                value={storeData.address}
                onChange={(e) => setStoreData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="責任者"
                value={storeData.manager}
                onChange={(e) => setStoreData(prev => ({ ...prev, manager: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="営業時間"
                value={storeData.openingHours}
                onChange={(e) => setStoreData(prev => ({ ...prev, openingHours: e.target.value }))}
                placeholder="例: 10:00-20:00"
              />
            </Grid>

            {/* 見積送付先情報 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 1 }}>
                  見積送付先情報
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => addContact('estimate')}
                  size="small"
                >
                  追加
                </Button>
              </Box>
            </Grid>
            
            {(storeData.estimateContacts || []).map((contact, index) => (
              <Grid item xs={12} key={contact.id}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={contact.type}
                          onChange={(e) => updateContact('estimate', contact.id, 'type', e.target.value as 'to' | 'cc')}
                        >
                          <MenuItem value="to">To</MenuItem>
                          <MenuItem value="cc">Cc</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="姓"
                        value={contact.lastName}
                        onChange={(e) => updateContact('estimate', contact.id, 'lastName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="名"
                        value={contact.firstName}
                        onChange={(e) => updateContact('estimate', contact.id, 'firstName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="メールアドレス"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact('estimate', contact.id, 'email', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeContact('estimate', contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* 請求送付先情報 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 1 }}>
                  請求送付先情報
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => addContact('invoice')}
                  size="small"
                >
                  追加
                </Button>
              </Box>
            </Grid>
            
            {(storeData.invoiceContacts || []).map((contact, index) => (
              <Grid item xs={12} key={contact.id}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={contact.type}
                          onChange={(e) => updateContact('invoice', contact.id, 'type', e.target.value as 'to' | 'cc')}
                        >
                          <MenuItem value="to">To</MenuItem>
                          <MenuItem value="cc">Cc</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="姓"
                        value={contact.lastName}
                        onChange={(e) => updateContact('invoice', contact.id, 'lastName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="名"
                        value={contact.firstName}
                        onChange={(e) => updateContact('invoice', contact.id, 'firstName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="メールアドレス"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact('invoice', contact.id, 'email', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeContact('invoice', contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoreDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveStore} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      {/* イベント場所編集ダイアログ */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingLocation ? 'イベント場所編集' : 'イベント場所追加'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>代理店</InputLabel>
                <Select
                  value={locationData.agencyId}
                  onChange={(e) => setLocationData({...locationData, agencyId: e.target.value})}
                >
                  {agencies.map(agency => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="イベント実施場所"
                value={locationData.locationName}
                onChange={(e) => setLocationData({...locationData, locationName: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="住所"
                value={locationData.address}
                onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="最寄駅"
                value={locationData.nearestStation || ''}
                onChange={(e) => setLocationData({...locationData, nearestStation: e.target.value})}
                fullWidth
              />
            </Grid>

            {/* 場所詳細管理セクション */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    場所詳細管理
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    このイベント場所に紐づく詳細な場所情報を登録できます
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddLocationDetailInput}
                  size="small"
                >
                  詳細追加
                </Button>
              </Box>
            </Grid>
            
            {/* 場所詳細一覧 */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>場所詳細一覧</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>場所詳細名</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 既存の場所詳細（読み取り専用） */}
                    {locationData.locationDetailList && locationData.locationDetailList.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <Typography variant="body2">{detail.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingLocationDetail(detail.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* 新規追加フィールド（編集可能） */}
                    {locationDetailInputs.map((input, index) => (
                      <TableRow key={input.tempId} sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          <TextField
                            value={input.name}
                            onChange={(e) => handleLocationDetailInputChange(input.tempId, 'name', e.target.value)}
                            placeholder="場所詳細名を入力"
                            size="small"
                            fullWidth
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveLocationDetailInput(input.tempId)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* 場所詳細がない場合 */}
                    {(!locationData.locationDetailList || locationData.locationDetailList.length === 0) && 
                     locationDetailInputs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            場所詳細が登録されていません。「詳細追加」ボタンで追加してください。
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                曜日別請求単価設定
              </Typography>
            </Grid>
            
            {weekdays.map((day) => (
              <Fragment key={day.key}>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    {day.label}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="クローザー請求単価"
                    type="number"
                    value={locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.closer || 0}
                    onChange={(e) => {
                      const newPricing = {
                        tuesday: { closer: 0, girl: 0 },
                        wednesday: { closer: 0, girl: 0 },
                        thursday: { closer: 0, girl: 0 },
                        friday: { closer: 0, girl: 0 },
                        saturday: { closer: 0, girl: 0 },
                        sunday: { closer: 0, girl: 0 },
                        monday: { closer: 0, girl: 0 },
                        ...locationData.pricing,
                        [day.key]: {
                          closer: Number(e.target.value),
                          girl: locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.girl || 0
                        }
                      };
                      setLocationData({
                        ...locationData,
                        pricing: newPricing
                      });
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/ 日</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="ガール請求単価"
                    type="number"
                    value={locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.girl || 0}
                    onChange={(e) => {
                      const newPricing = {
                        tuesday: { closer: 0, girl: 0 },
                        wednesday: { closer: 0, girl: 0 },
                        thursday: { closer: 0, girl: 0 },
                        friday: { closer: 0, girl: 0 },
                        saturday: { closer: 0, girl: 0 },
                        sunday: { closer: 0, girl: 0 },
                        monday: { closer: 0, girl: 0 },
                        ...locationData.pricing,
                        [day.key]: {
                          closer: locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.closer || 0,
                          girl: Number(e.target.value)
                        }
                      };
                      setLocationData({
                        ...locationData,
                        pricing: newPricing
                      });
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/ 日</InputAdornment>,
                    }}
                  />
                </Grid>
              </Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveLocation} variant="contained">
            {editingLocation ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* レイヤー人員管理ダイアログ */}
      <Dialog open={layerDialogOpen} onClose={() => setLayerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLayerPerson ? 'レイヤー人員編集' : 'レイヤー人員追加'}
          {editingLayer && ` - ${editingLayer.replace('layer', 'レイヤー')}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="名前"
                value={layerPersonData.name}
                onChange={(e) => setLayerPersonData({...layerPersonData, name: e.target.value})}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="役職"
                value={layerPersonData.position}
                onChange={(e) => setLayerPersonData({...layerPersonData, position: e.target.value})}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={layerPersonData.phone}
                onChange={(e) => setLayerPersonData({...layerPersonData, phone: e.target.value})}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="メールアドレス"
                value={layerPersonData.email}
                onChange={(e) => setLayerPersonData({...layerPersonData, email: e.target.value})}
                fullWidth
                type="email"
              />
            </Grid>

            {/* 上長選択（レイヤー1以外は必須） */}
            {editingLayer && editingLayer !== 'layer1' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>上長選択</InputLabel>
                  <Select
                    value={layerPersonData.parentLayerPersonId || ''}
                    label="上長選択"
                    onChange={(e) => {
                      const parentId = e.target.value || undefined;
                      setLayerPersonData({
                        ...layerPersonData, 
                        parentLayerPersonId: parentId
                      });
                    }}
                  >
                    <MenuItem value="">選択してください</MenuItem>
                    {(() => {
                      const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
                      if (!selectedAgency) return null;
                      
                      const groupedOptions: React.ReactNode[] = [];
                      
                      // 現在のレイヤーより上位のレイヤーの人員のみ表示
                      const currentLayerNum = parseInt(editingLayer.slice(-1));
                      
                      for (let i = 1; i < currentLayerNum; i++) {
                        const layerKey = `layer${i}` as keyof typeof selectedAgency.layers;
                        const layerPeople = selectedAgency.layers[layerKey];
                        
                        if (layerPeople.length > 0) {
                          groupedOptions.push(
                            <Typography key={`${layerKey}-header`} variant="subtitle2" sx={{ px: 2, py: 1, bgcolor: 'action.hover', fontWeight: 'bold' }}>
                              {layerKey.replace('layer', 'レイヤー')}
                            </Typography>
                          );
                          layerPeople.forEach(person => {
                            groupedOptions.push(
                              <MenuItem key={person.id} value={person.id} sx={{ pl: 3 }}>
                                {person.name} ({person.position})
                              </MenuItem>
                            );
                          });
                        }
                      }
                      
                      return groupedOptions;
                    })()}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {editingLayer.replace('layer', 'レイヤー')}への配属には上長の選択が必要です
                </Typography>
              </Grid>
            )}

            {/* 担当店舗選択（レイヤー4のみ） */}
            {editingLayer === 'layer4' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>担当店舗選択</Typography>
                <Box sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  p: 2, 
                  maxHeight: 300, 
                  overflowY: 'auto'
                }}>
                  {(() => {
                    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
                    if (!selectedAgency) return null;
                    
                    if (selectedAgency.stores.length === 0) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          この代理店にはまだ店舗が登録されていません
                        </Typography>
                      );
                    }
                    
                    return selectedAgency.stores.map(store => (
                      <FormControlLabel
                        key={store.id}
                        control={
                          <Checkbox
                            checked={layerPersonData.assignedStores.includes(store.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newAssignedStores = isChecked
                                ? [...layerPersonData.assignedStores, store.id]
                                : layerPersonData.assignedStores.filter(id => id !== store.id);
                              
                              setLayerPersonData({
                                ...layerPersonData,
                                assignedStores: newAssignedStores
                              });
                            }}
                          />
                        }
                        label={store.name}
                        sx={{ 
                          display: 'block', 
                          mb: 1,
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    ));
                  })()}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  担当する店舗を選択してください（複数選択可能）
                </Typography>
              </Grid>
            )}


          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLayerDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveLayerPerson} variant="contained">
            {editingLayerPerson ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代理店編集ダイアログ */}
      <Dialog open={agencyDialogOpen} onClose={() => setAgencyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAgency ? '代理店基本情報編集' : '新規代理店追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="代理店名"
                value={agencyData.companyName}
                onChange={(e) => setAgencyData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="代理店住所"
                value={agencyData.address || ''}
                onChange={(e) => setAgencyData(prev => ({ ...prev, address: e.target.value }))}
                multiline
                rows={3}
                placeholder="代理店の住所を入力してください"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgencyDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSaveAgency} variant="contained">
            {editingAgency ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代理店削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error.main">
          代理店削除の確認
        </DialogTitle>
        <DialogContent>
          {editingAgency && (
            <Box>
              <Typography variant="body1" gutterBottom>
                以下の代理店を削除しようとしています：
              </Typography>
              <Typography variant="h6" color="primary.main" gutterBottom>
                {editingAgency.companyName}
              </Typography>
              
              <Alert severity="warning" sx={{ my: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>この操作は取り消せません。</strong>
                </Typography>
                <Typography variant="body2">
                  以下の関連データも同時に削除されます：
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>店舗データ: {editingAgency.stores.length}件</li>
                  <li>人員データ: {Object.values(editingAgency.layers).flat().length}名</li>
                  <li>イベント場所: {locations.filter(loc => loc.agencyId === editingAgency.id).length}件</li>
                </Box>
              </Alert>
              
              <Typography variant="body2" color="text.secondary">
                本当にこの代理店を削除しますか？
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleDeleteAgency} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            削除実行
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
