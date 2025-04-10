'use client';

import { Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, Tabs, Tab, Button } from '@mui/material';
import { useState } from 'react';
import WeeklySummary from '@/components/WeeklySummary';
import SettingsIcon from '@mui/icons-material/Settings';
import { AssignmentTable } from '@/components/shifts/AssignmentTable';
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
  '& .MuiToggleButton-root': {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    '&:last-of-type': {
      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
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

export default function Shifts() {
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('1');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [summary, setSummary] = useState(initialSummary);
  const [subTabValue, setSubTabValue] = useState<number>(0);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const weeks = getWeeks(year, month);

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSubTabValue(newValue);
  };

  const handleDateChange = (event: React.MouseEvent<HTMLElement>, date: string) => {
    setSelectedDates(prev => 
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleLevelClick = (level: number) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh', 
        py: 3,
        px: '24px !important',
        minWidth: '1200px' // 最小幅を1200pxに調整
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
                <MenuItem value="2024">2024年</MenuItem>
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
                <MenuItem value="1">1月</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 週選択 */}
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={selectedWeek}
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
              <Box sx={{ 
                display: 'flex', 
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* 左側：アサイン表エリア */}
                <Box sx={{ 
                  width: '55%', // アサイン表の幅を55%に変更
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* アサインテーブル */}
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto'
                  }}>
                    <AssignmentTable
                      venues={sampleVenues}
                      days={sampleDays}
                      assignments={sampleSlots}
                      slots={sampleSlots}
                    />
                  </Box>
                </Box>

                {/* 右側：要員リストエリア */}
                <Box sx={{ 
                  width: '45%', // 要員リストの幅を45%に変更
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  pl: 3
                }}>
                  {/* 自動配置実行ボタン */}
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    flexShrink: 0
                  }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        backgroundColor: '#1976D2',
                        minWidth: '160px',
                        '&:hover': {
                          backgroundColor: '#1565C0',
                        }
                      }}
                    >
                      自動配置実行
                    </Button>
                    <SettingsIcon sx={{ color: '#1976D2', cursor: 'pointer' }} />
                  </Box>

                  {/* 要員リストのヘッダー */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    mb: 2,
                    flexShrink: 0
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      要員リスト
                    </Typography>
                    <ToggleButtonGroup
                      value={selectedDates}
                      onChange={(_, newDates) => setSelectedDates(newDates)}
                      size="small"
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flex: 1,
                      }}
                    >
                      {sampleDays.map((day) => (
                        <ToggleButton
                          key={day.date}
                          value={day.date}
                          sx={{
                            ...weekToggleButtonStyle,
                            px: 0.5,
                            py: 0.25,
                            fontSize: '0.75rem',
                            flex: 1,
                            minWidth: '45px',
                            maxWidth: '45px'
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                              {day.weekday}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                              {day.date}
                            </Typography>
                          </Box>
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  {/* レベル選択ボタン */}
                  <Box sx={{ 
                    display: 'flex',
                    gap: 1,
                    mb: 2,
                    flexShrink: 0
                  }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleLevelClick(3)}
                      sx={{
                        backgroundColor: selectedLevels.includes(3) ? '#90caf9' : '#e0e0e0',
                        py: 0.25,
                        px: 1,
                        fontSize: '0.75rem',
                        minHeight: '24px',
                        minWidth: '60px',
                        '&:hover': {
                          backgroundColor: selectedLevels.includes(3) ? '#64b5f6' : '#bdbdbd'
                        }
                      }}
                    >
                      レベル3
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleLevelClick(2)}
                      sx={{
                        backgroundColor: selectedLevels.includes(2) ? '#a5d6a7' : '#e0e0e0',
                        py: 0.25,
                        px: 1,
                        fontSize: '0.75rem',
                        minHeight: '24px',
                        minWidth: '60px',
                        '&:hover': {
                          backgroundColor: selectedLevels.includes(2) ? '#81c784' : '#bdbdbd'
                        }
                      }}
                    >
                      レベル2
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleLevelClick(1)}
                      sx={{
                        backgroundColor: selectedLevels.includes(1) ? '#ffcc80' : '#e0e0e0',
                        py: 0.25,
                        px: 1,
                        fontSize: '0.75rem',
                        minHeight: '24px',
                        minWidth: '60px',
                        '&:hover': {
                          backgroundColor: selectedLevels.includes(1) ? '#ffb74d' : '#bdbdbd'
                        }
                      }}
                    >
                      レベル1
                    </Button>
                  </Box>
                  
                  {/* 要員リストの内容部分 */}
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto'
                  }}>
                    {/* ここに要員リストの内容が入ります */}
                  </Box>
                </Box>
              </Box>
            )}
            {subTabValue === 1 && (
              <Box>
                {/* シフト調整の内容 */}
                <Typography>シフト調整の内容をここに表示</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 