'use client';

import { Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, Tabs, Tab, Button } from '@mui/material';
import { useState } from 'react';
import WeeklySummary from '@/components/WeeklySummary';
import SettingsIcon from '@mui/icons-material/Settings';
import { AssignmentTable } from '@/components/shifts/AssignmentTable';
import { SpreadsheetGrid } from '@/components/shifts/SpreadsheetGrid';
import type { Shift } from '@/components/shifts/SpreadsheetGrid';
import { DayInfo, Venue, Assignment, SlotInfo } from '@/components/shifts/types';

// 週別タブの定義
const getWeeks = (year: string, month: string) => {
  return ['0W', '1W', '2W', '3W', '4W', '5W'];
};

// 初期サマリーデータ
const initialSummary = {
  closerCapacity: [30, 30, 30, 30, 30, 30],
  girlCapacity: [20, 20, 20, 20, 20, 20],
  totalCapacity: [50, 50, 50, 50, 50, 50]
};

// ToggleButtonGroup共通スタイル
const toggleButtonGroupStyle = {
  border: '1px solid rgba(0, 0, 0, 0.12)',
  '& .MuiToggleButton-root': {
    '&:not(:first-of-type)': {
      borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    }
  }
};

// 週選択用のToggleButtonスタイル
const weekToggleButtonStyle = {
  px: 3,
  py: 1,
  borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    backgroundColor: '#e0e0e0',
    color: '#333333',
    borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
    borderTop: '1px solid rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
    fontWeight: 'bold',
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: '#d5d5d5',
    },
  },
  '&:first-of-type': {
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
  }
};

// サンプルデータ
const sampleDays: DayInfo[] = [
  { date: '1/1', weekday: '火' },
  { date: '1/2', weekday: '水' },
  { date: '1/3', weekday: '木' },
  { date: '1/4', weekday: '金' },
  { date: '1/5', weekday: '土' },
  { date: '1/6', weekday: '日' },
  { date: '1/7', weekday: '月' }
];

const sampleVenues: Venue[] = [
  // ピーアップ
  {
    id: 'pup-1',
    agency: 'ピーアップ',
    location: 'イオンモール上尾センターコート',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'pup-1-closer1', type: 'クローザー' },
      { id: 'pup-1-closer2', type: 'クローザー' },
      { id: 'pup-1-girl1', type: 'ガール' },
      { id: 'pup-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'pup-2',
    agency: 'ピーアップ',
    location: 'イトーヨーカドー立場',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'pup-2-closer1', type: 'クローザー' },
      { id: 'pup-2-closer2', type: 'クローザー' },
      { id: 'pup-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'pup-3',
    agency: 'ピーアップ',
    location: 'マルエツ松江',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'pup-3-closer1', type: 'クローザー' },
      { id: 'pup-3-girl1', type: 'ガール' },
      { id: 'pup-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'pup-4',
    agency: 'ピーアップ',
    location: 'コーナン西新井',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'pup-4-closer1', type: 'クローザー' },
      { id: 'pup-4-closer2', type: 'クローザー' },
      { id: 'pup-4-girl1', type: 'ガール' }
    ]
  },
  // ラネット
  {
    id: 'ranet-1',
    agency: 'ラネット',
    location: '錦糸町マルイ たい焼き屋前',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'ranet-1-closer1', type: 'クローザー' },
      { id: 'ranet-1-girl1', type: 'ガール' },
      { id: 'ranet-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'ranet-2',
    agency: 'ラネット',
    location: 'ららぽーと富士見 1階スリコ前',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'ranet-2-closer1', type: 'クローザー' },
      { id: 'ranet-2-closer2', type: 'クローザー' },
      { id: 'ranet-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'ranet-3',
    agency: 'ラネット',
    location: 'イオンモール春日部 風の広場',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'ranet-3-closer1', type: 'クローザー' },
      { id: 'ranet-3-girl1', type: 'ガール' },
      { id: 'ranet-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'ranet-4',
    agency: 'ラネット',
    location: 'イトーヨーカドー東久留米',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'ranet-4-closer1', type: 'クローザー' },
      { id: 'ranet-4-closer2', type: 'クローザー' },
      { id: 'ranet-4-girl1', type: 'ガール' }
    ]
  },
  // CS
  {
    id: 'cs-1',
    agency: 'CS',
    location: 'イオンタウン吉川美南',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'cs-1-closer1', type: 'クローザー' },
      { id: 'cs-1-girl1', type: 'ガール' },
      { id: 'cs-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'cs-2',
    agency: 'CS',
    location: 'イオン南越谷',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'cs-2-closer1', type: 'クローザー' },
      { id: 'cs-2-closer2', type: 'クローザー' },
      { id: 'cs-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'cs-3',
    agency: 'CS',
    location: 'イトーヨーカドー埼玉大井',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'cs-3-closer1', type: 'クローザー' },
      { id: 'cs-3-girl1', type: 'ガール' },
      { id: 'cs-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'cs-4',
    agency: 'CS',
    location: 'スーパーバリュー草加',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'cs-4-closer1', type: 'クローザー' },
      { id: 'cs-4-closer2', type: 'クローザー' },
      { id: 'cs-4-girl1', type: 'ガール' }
    ]
  },
  // コスモネット
  {
    id: 'cosmo-1',
    agency: 'コスモネット',
    location: 'エルミ鴻巣2F',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'cosmo-1-closer1', type: 'クローザー' },
      { id: 'cosmo-1-girl1', type: 'ガール' },
      { id: 'cosmo-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'cosmo-2',
    agency: 'コスモネット',
    location: 'モラージュ菖蒲',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'cosmo-2-closer1', type: 'クローザー' },
      { id: 'cosmo-2-closer2', type: 'クローザー' },
      { id: 'cosmo-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'cosmo-3',
    agency: 'コスモネット',
    location: 'カインズ羽生',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'cosmo-3-closer1', type: 'クローザー' },
      { id: 'cosmo-3-girl1', type: 'ガール' },
      { id: 'cosmo-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'cosmo-4',
    agency: 'コスモネット',
    location: 'ベイシア行田',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'cosmo-4-closer1', type: 'クローザー' },
      { id: 'cosmo-4-closer2', type: 'クローザー' },
      { id: 'cosmo-4-girl1', type: 'ガール' }
    ]
  },
  // ベルパーク
  {
    id: 'bellpark-1',
    agency: 'ベルパーク',
    location: 'レイクタウンkaze3階ブリッジ',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'bellpark-1-closer1', type: 'クローザー' },
      { id: 'bellpark-1-girl1', type: 'ガール' },
      { id: 'bellpark-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'bellpark-2',
    agency: 'ベルパーク',
    location: 'さいたまスーパーアリーナけやき広場(ラーメンフェス)',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'bellpark-2-closer1', type: 'クローザー' },
      { id: 'bellpark-2-closer2', type: 'クローザー' },
      { id: 'bellpark-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'bellpark-3',
    agency: 'ベルパーク',
    location: 'ソフトバンクエミテラス所沢店頭',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'bellpark-3-closer1', type: 'クローザー' },
      { id: 'bellpark-3-girl1', type: 'ガール' },
      { id: 'bellpark-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'bellpark-4',
    agency: 'ベルパーク',
    location: 'アリオ上尾',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'bellpark-4-closer1', type: 'クローザー' },
      { id: 'bellpark-4-closer2', type: 'クローザー' },
      { id: 'bellpark-4-girl1', type: 'ガール' }
    ]
  },
  // ニューコム
  {
    id: 'newcomm-1',
    agency: 'ニューコム',
    location: 'イオン板橋',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'newcomm-1-closer1', type: 'クローザー' },
      { id: 'newcomm-1-girl1', type: 'ガール' },
      { id: 'newcomm-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'newcomm-2',
    agency: 'ニューコム',
    location: 'イオンモール石巻',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'newcomm-2-closer1', type: 'クローザー' },
      { id: 'newcomm-2-closer2', type: 'クローザー' },
      { id: 'newcomm-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'newcomm-3',
    agency: 'ニューコム',
    location: 'イオンマリンピア(稲毛海岸)',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'newcomm-3-closer1', type: 'クローザー' },
      { id: 'newcomm-3-girl1', type: 'ガール' },
      { id: 'newcomm-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'newcomm-4',
    agency: 'ニューコム',
    location: 'イオン市川妙典',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'newcomm-4-closer1', type: 'クローザー' },
      { id: 'newcomm-4-closer2', type: 'クローザー' },
      { id: 'newcomm-4-girl1', type: 'ガール' }
    ]
  },
  // エムデジ
  {
    id: 'mdeji-1',
    agency: 'エムデジ',
    location: '島忠ホームズ東村山',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'mdeji-1-closer1', type: 'クローザー' },
      { id: 'mdeji-1-girl1', type: 'ガール' },
      { id: 'mdeji-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'mdeji-2',
    agency: 'エムデジ',
    location: 'コピス吉祥寺デッキイベント',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'mdeji-2-closer1', type: 'クローザー' },
      { id: 'mdeji-2-closer2', type: 'クローザー' },
      { id: 'mdeji-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'mdeji-3',
    agency: 'エムデジ',
    location: 'ロピア小平',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'mdeji-3-closer1', type: 'クローザー' },
      { id: 'mdeji-3-girl1', type: 'ガール' },
      { id: 'mdeji-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'mdeji-4',
    agency: 'エムデジ',
    location: 'イトーヨーカドー大井町',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'mdeji-4-closer1', type: 'クローザー' },
      { id: 'mdeji-4-closer2', type: 'クローザー' },
      { id: 'mdeji-4-girl1', type: 'ガール' }
    ]
  },
  // ケインズ
  {
    id: 'cains-1',
    agency: 'ケインズ',
    location: 'ドン・キホーテ浦和原山',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'cains-1-closer1', type: 'クローザー' },
      { id: 'cains-1-girl1', type: 'ガール' },
      { id: 'cains-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'cains-2',
    agency: 'ケインズ',
    location: 'イオン大井',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'cains-2-closer1', type: 'クローザー' },
      { id: 'cains-2-closer2', type: 'クローザー' },
      { id: 'cains-2-girl1', type: 'ガール' }
    ]
  },
  // RD
  {
    id: 'rd-1',
    agency: 'RD',
    location: 'ドン・キホーテ武蔵浦和',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'rd-1-closer1', type: 'クローザー' },
      { id: 'rd-1-girl1', type: 'ガール' },
      { id: 'rd-1-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'rd-2',
    agency: 'RD',
    location: '草加セーモンプラザ',
    isOutsideVenue: false,
    hasBusinessTrip: true,
    orders: [
      { id: 'rd-2-closer1', type: 'クローザー' },
      { id: 'rd-2-closer2', type: 'クローザー' },
      { id: 'rd-2-girl1', type: 'ガール' }
    ]
  },
  {
    id: 'rd-3',
    agency: 'RD',
    location: 'イオンモール北戸田',
    isOutsideVenue: true,
    hasBusinessTrip: false,
    orders: [
      { id: 'rd-3-closer1', type: 'クローザー' },
      { id: 'rd-3-girl1', type: 'ガール' },
      { id: 'rd-3-girl2', type: 'ガール' }
    ]
  },
  {
    id: 'rd-4',
    agency: 'RD',
    location: '島忠ホームズさいたま中央',
    isOutsideVenue: false,
    hasBusinessTrip: false,
    orders: [
      { id: 'rd-4-closer1', type: 'クローザー' },
      { id: 'rd-4-closer2', type: 'クローザー' },
      { id: 'rd-4-girl1', type: 'ガール' }
    ]
  }
];

// スロット情報のサンプルデータ
const sampleSlots: SlotInfo[] = [
  // 各会場のスロット情報を生成
  ...sampleVenues.flatMap(venue => 
    venue.orders.flatMap(order => 
      sampleDays.map(day => ({
        venueId: venue.id,
        orderId: order.id,
        date: day.date,
        hasSlot: (() => {
          const isWeekend = ['土', '日'].includes(sampleDays.find(d => d.date === day.date)?.weekday || '');
          // 会場ごとに週末のみか平日のみかをランダムに決定（会場IDをもとに一貫性を保つ）
          const isWeekendOnly = parseInt(venue.id.split('-')[1]) % 2 === 0;
          return isWeekendOnly ? isWeekend : !isWeekend;
        })()
      }))
    )
  )
];

// サンプルのスプレッドシートデータ
const sampleSpreadsheetData = [
  { date: '5/1', weekday: '木', status: '○', venue: 'イオンモール上尾', location: 'センターコート' },
  { date: '5/2', weekday: '金', status: '○', venue: 'イトーヨーカドー立場', location: '1F入口前' },
  { date: '5/3', weekday: '土', status: '○', venue: 'マルエツ松江', location: '店舗前' },
  { date: '5/4', weekday: '日', status: '○', venue: 'コーナン西新井', location: '1F通路' },
  { date: '5/5', weekday: '月', status: '○', venue: '錦糸町マルイ', location: 'たい焼き屋前' },
];

// サンプルの社員データ
const sampleEmployee = {
  name: '阿部 将大',
  nameKana: 'アベ ショウダイ',
  role: 'クローザー',
  type: '大卒',
  dailyRate: 25000,
  holidayRate: 30000,
  tel: '090-6485-9258',
  id: '1205000017'
};

// サンプルのシフトデータ
const sampleShifts = [
  // 阿部 將大のシフト
  { staffId: '1', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '1', date: '11/10', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '1', date: '11/16', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '1', date: '11/17', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '1', date: '11/23', status: '○', venue: 'G店-CTOKYOS', price: 30000 },
  { staffId: '1', date: '11/24', status: '○', venue: 'G店-CTOKYOS', price: 30000 },
  { staffId: '1', date: '11/30', status: '○', venue: 'G店-上恵土', price: 30000 },

  // 安部 隼登のシフト
  { staffId: '2', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '2', date: '11/10', status: '×', venue: '', price: 0 },
  { staffId: '2', date: '11/16', status: '○', venue: 'たいム たいM店', price: 30000 },
  { staffId: '2', date: '11/17', status: '○', venue: 'たいム たいM店', price: 30000 },
  { staffId: '2', date: '11/23', status: '○', venue: '篠原店/G-JIT', price: 30000 },
  { staffId: '2', date: '11/24', status: '○', venue: '篠原店/G-JIT', price: 30000 },
  { staffId: '2', date: '11/30', status: '○', venue: 'イオンモール上尾', price: 30000 },

  // 木間 大地のシフト
  { staffId: '3', date: '11/4', status: '○', venue: 'イオンモール上尾', price: 25000 },
  { staffId: '3', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '3', date: '11/10', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '3', date: '11/16', status: '○', venue: 'スタジアムX大宮', price: 30000 },
  { staffId: '3', date: '11/17', status: '○', venue: 'スタジアムX大宮', price: 30000 },
  { staffId: '3', date: '11/23', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '3', date: '11/24', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '3', date: '11/30', status: '○', venue: 'カートン大宮西口', price: 30000 },

  // 堀田 慎之介のシフト
  { staffId: '4', date: '11/1', status: '○', venue: 'ホーム大宮西口', price: 25000 },
  { staffId: '4', date: '11/8', status: '○', venue: 'ホーム大宮西口', price: 25000 },
  { staffId: '4', date: '11/9', status: '○', venue: 'ホーム大宮西口', price: 30000 },
  { staffId: '4', date: '11/10', status: '○', venue: 'ホーム大宮西口', price: 30000 },
  { staffId: '4', date: '11/15', status: '○', venue: 'イオンモール上尾', price: 25000 },
  { staffId: '4', date: '11/16', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '4', date: '11/17', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '4', date: '11/22', status: '○', venue: 'イオンモール上尾', price: 25000 },
  { staffId: '4', date: '11/23', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '4', date: '11/24', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '4', date: '11/29', status: '○', venue: 'コーナン千手店', price: 25000 },
  { staffId: '4', date: '11/30', status: '○', venue: 'G店-上恵土', price: 30000 },

  // 上嶋内 啓太のシフト
  { staffId: '5', date: '11/1', status: '○', venue: 'ヨーカドー新山下', price: 25000 },
  { staffId: '5', date: '11/4', status: '○', venue: 'アピタ長津田', price: 25000 },
  { staffId: '5', date: '11/5', status: '○', venue: 'エルミ鴻巣', price: 25000 },
  { staffId: '5', date: '11/6', status: '○', venue: 'ホーム大宮西口', price: 25000 },
  { staffId: '5', date: '11/7', status: '○', venue: 'ホーム大宮西口', price: 25000 },
  { staffId: '5', date: '11/8', status: '○', venue: 'ホーム大宮西口', price: 25000 },
  { staffId: '5', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '5', date: '11/10', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '5', date: '11/13', status: '○', venue: '丸井特設コミケ跡', price: 25000 },
  { staffId: '5', date: '11/14', status: '○', venue: '丸井特設コミケ跡', price: 25000 },
  { staffId: '5', date: '11/15', status: '○', venue: 'ヨーカドー武蔵', price: 25000 },
  { staffId: '5', date: '11/16', status: '○', venue: 'ヨーカドー武蔵', price: 30000 },
  { staffId: '5', date: '11/17', status: '○', venue: 'ヨーカドー武蔵', price: 30000 },
  { staffId: '5', date: '11/18', status: '○', venue: 'ヨーカドー武蔵', price: 25000 },
  { staffId: '5', date: '11/21', status: '○', venue: 'タッチーワラジ', price: 25000 },
  { staffId: '5', date: '11/22', status: '○', venue: 'ペニバナ横川', price: 25000 },
  { staffId: '5', date: '11/23', status: '○', venue: 'マルサン横川', price: 30000 },
  { staffId: '5', date: '11/24', status: '○', venue: 'マルサン横川', price: 30000 },
  { staffId: '5', date: '11/28', status: '○', venue: 'オーケー南町', price: 25000 },
  { staffId: '5', date: '11/29', status: '○', venue: 'オーケー南町', price: 25000 },

  // 竹本 日伊瑠のシフト
  { staffId: '7', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '7', date: '11/10', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '7', date: '11/16', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '7', date: '11/17', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '7', date: '11/23', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '7', date: '11/24', status: '○', venue: 'イオンモール上尾', price: 30000 },

  // 丸山 剛史のシフト
  { staffId: '8', date: '11/9', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '8', date: '11/10', status: '×', venue: '', price: 0 },
  { staffId: '8', date: '11/16', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '8', date: '11/17', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '8', date: '11/23', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '8', date: '11/24', status: '×', venue: '', price: 0 },

  // 松山 家紋のシフト
  { staffId: '9', date: '11/9', status: '○', venue: 'アリオ相模', price: 30000 },
  { staffId: '9', date: '11/10', status: '○', venue: 'アリオ相模', price: 30000 },
  { staffId: '9', date: '11/16', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '9', date: '11/17', status: '○', venue: 'イオンモール上尾', price: 30000 },
  { staffId: '9', date: '11/23', status: '○', venue: 'ニットワーク小倉', price: 30000 },
  { staffId: '9', date: '11/24', status: '○', venue: 'ニットワーク小倉', price: 30000 },

  // 松尾 圭蔵のシフト
  { staffId: '10', date: '11/9', status: '○', venue: 'ペニバナ横川', price: 30000 },
  { staffId: '10', date: '11/10', status: '○', venue: 'ペニバナ横川', price: 30000 },
  { staffId: '10', date: '11/23', status: '○', venue: 'エルミ鴻巣', price: 30000 },
  { staffId: '10', date: '11/24', status: '○', venue: 'エルミ鴻巣', price: 30000 }
];

// サンプルの会社データ
const sampleCompanies = [
  { id: 'festal', name: 'Festal' },
  { id: 'ansteype', name: 'ANSTEYPE' },
  { id: 'festal-ansteype', name: 'Festal × ANSTEYPE' }
];

// サンプルのスタッフデータ
const staffMembers = [
  {
    id: '1205000017',
    name: '阿部 將大',
    nameKana: 'アベ ショウダイ',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 30000,
    tel: '090-6485-9258',
    totalAmount: 210000,
    workType: '土日のみ'
  },
  {
    id: '1205000018',
    name: '本間 大地',
    nameKana: 'ホンマ ダイチ',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 30000,
    tel: '070-4128-4990',
    totalAmount: 365000,
    workType: ''
  },
  {
    id: '1205000085',
    name: '須郷 瑠斗',
    nameKana: 'スゴウ ルイト',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '070-2797-6982',
    totalAmount: 495000,
    workType: ''
  },
  {
    id: '1205000239',
    name: '竹本 巳伊瑠',
    nameKana: 'タケモト ミイル',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '070-8934-4359',
    totalAmount: 196000,
    workType: ''
  },
  {
    id: '5',
    name: '上嶋内 啓太',
    nameKana: 'カミシマウチ ケイタ',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '080-3721-4990',
    totalAmount: 525000,
    workType: ''
  },
  {
    id: '6',
    name: '須﨑 謙斗',
    nameKana: 'スザキ ケント',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '070-5834-4028',
    totalAmount: 0,
    workType: ''
  },
  {
    id: '7',
    name: '竹本 日伊瑠',
    nameKana: 'タケモト ヒイル',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '070-8934-4359',
    totalAmount: 180000,
    workType: ''
  },
  {
    id: '8',
    name: '丸山 剛史',
    nameKana: 'マルヤマ ツヨシ',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '080-4515-1198',
    totalAmount: 120000,
    workType: ''
  },
  {
    id: '9',
    name: '松山 家紋',
    nameKana: 'マツヤマ イエモン',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '090-4326-8309',
    totalAmount: 180000,
    workType: ''
  },
  {
    id: '10',
    name: '松尾 圭蔵',
    nameKana: 'マツオ ケイゾウ',
    role: 'クローザー',
    station: '大宮',
    weekdayRate: 25000,
    holidayRate: 28000,
    tel: '090-2710-9893',
    totalAmount: 120000,
    workType: ''
  }
];

// 稼働場所のサンプルデータ
const SAMPLE_LOCATIONS = [
  'イオンモール上尾',
  'イオンモール高崎',
  'ホームズ足立小台',
  'ステラタウン大宮',
  'エルミ湯巻',
  'ベニバナ稲川',
  'シ・キホーテ板橋点',
  'イオンモール新井',
  'ホームズ足立小台',
  '島忠ホーム大宮枝川'
];

// ランダムなシフトを生成する関数
const generateRandomShifts = (year: number, month: number, staffMembers: any[]): Shift[] => {
  const shifts: Shift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];

    for (const staff of staffMembers) {
      // 70%の確率で希望を入れる（30%は'-'のまま）
      if (Math.random() < 0.7) {
        // ○を60%、×を40%の確率で設定
        const status: '○' | '×' = Math.random() < 0.6 ? '○' : '×';
        shifts.push({
          date: dateStr,
          staffId: staff.id,
          status: status,
          // ○の場合はランダムな稼働場所を設定
          location: status === '○' ? SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)] : undefined
        });
      } else {
        // 残りの30%は'-'を設定
        shifts.push({
          date: dateStr,
          staffId: staff.id,
          status: '-',
          location: undefined
        });
      }
    }
  }

  return shifts;
};

export default function ShiftsPage() {
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('1');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [summary, setSummary] = useState(initialSummary);
  const [subTabValue, setSubTabValue] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('1/5');
  const weeks = getWeeks(year, month);

  // 年の選択肢を生成（現在年から5年分）
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: `${year}年` };
  });

  // 月の選択肢を生成
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString(), label: `${month}月` };
  });

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSubTabValue(newValue);
  };

  const handleCompanyChange = (companyId: string) => {
    console.log('Selected company:', companyId);
    // ここで会社選択時の処理を実装
  };

  // ランダムなシフトデータを生成
  const shifts = generateRandomShifts(parseInt(year), parseInt(month), staffMembers);

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh', 
        py: 3,
        px: '24px !important',
        minWidth: '1200px'
      }}
    >
      {/* パンくずリスト */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          ホーム / シフト管理
        </Typography>
      </Box>

      {/* メインコンテンツエリア */}
      <Box sx={{ 
        position: 'relative',
        height: 'calc(100vh - 100px)'
      }}>
        {/* 週別サマリー（右上に固定） */}
        <Box sx={{ 
          position: 'absolute', 
          top: -20,
          right: 0, 
          width: 'auto', 
          minWidth: '650px', 
          zIndex: 1,
          backgroundColor: '#f5f5f5'
        }}>
          <WeeklySummary weeks={weeks} summary={summary} />
        </Box>

        {/* 左側のコンテンツ */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* 年月選択 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small">
              <InputLabel>対象年</InputLabel>
              <Select
                value={year}
                label="対象年"
                onChange={(e) => setYear(e.target.value)}
                sx={{ width: 120 }}
              >
                {years.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>対象月</InputLabel>
              <Select
                value={month}
                label="対象月"
                onChange={(e) => setMonth(e.target.value)}
                sx={{ width: 120 }}
              >
                {months.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 週選択 */}
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={selectedWeek}
              exclusive
              onChange={(e, value) => value !== null && setSelectedWeek(value)}
              size="small"
              sx={toggleButtonGroupStyle}
            >
              {[0, 1, 2, 3, 4, 5].map((week) => (
                <ToggleButton
                  key={week}
                  value={week}
                  sx={weekToggleButtonStyle}
                >
                  <Typography variant="body2">{week}W</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* サブタブ */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={subTabValue} 
              onChange={handleSubTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                  height: 2,
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 120,
                  fontSize: '0.875rem',
                },
              }}
            >
              <Tab label="アサイン" />
              <Tab label="シフト調整" />
              <Tab label="スプレッドシート" />
            </Tabs>
          </Box>

          {/* メインコンテンツエリア（サブタブの内容） */}
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {subTabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                    <AssignmentTable
                      days={sampleDays}
                  venues={sampleVenues}
                  assignments={[]}
                      slots={sampleSlots}
                  onLockChange={(locks) => {
                    console.log('Locks changed:', locks);
                  }}
                  onVenueEdit={(venueId, orders) => {
                    console.log('Venue edited:', venueId, orders);
                  }}
                />
              </Box>
            )}
            {subTabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <SpreadsheetGrid
                  year={parseInt(year)}
                  month={parseInt(month)}
                  staffMembers={staffMembers}
                  shifts={shifts}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 