'use client';

import { Box, Container, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SalesTable from '@/components/sales/SalesTable';
import WeeklySummary from '@/components/WeeklySummary';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import SalesSummaryView from '@/components/sales/SalesSummaryView';

// 週別タブの定義
const getWeeks = (year: string, month: string) => {
  return ['0W', '1W', '2W', '3W', '4W', '5W'];
};

// ダミーのサマリーデータ
const initialSummary = {
  closerCapacity: [10, 12, 8, 15, 9, 11],
  girlCapacity: [20, 22, 18, 25, 19, 21],
  freeCapacity: [5, 6, 4, 8, 5, 7],
  totalCapacity: [30, 34, 26, 40, 28, 32]
};

// ダミーの案件データ
const generateDummySalesRecords = () => [
  {
    id: 1,
    assignedUser: '田中',
    updatedUser: '佐藤',
    status: '連絡前' as const,
    agency: 'ピーアップ',
    detailStatus: '未登録' as const,
    schedule: [true, true, false, true, false, true, false], // 火水金土に稼働
    dayType: '平日' as const,
    isBandProject: false,
    eventLocation: '東京ビッグサイト',
    managerName: '山田太郎',
    managerPhone: '090-1234-5678',
    hostStore: ['新宿店'],
    partnerStores: ['渋谷店', '浦和店'],
    flags: {
      hasLocationReservation: true,
      isExternalVenue: false,
      hasBusinessTrip: true,
    },
    quotaTable: {
      closer: { count: 2, unitPrice: 15000, transportFee: 1000 },
      girl: { count: 3, unitPrice: 12000, transportFee: 800 },
    },
    freeEntry: { 'day1': 5, 'day2': 3, 'day3': 0 },
    locationReservations: [
      {
        id: '1-1',
        date: '2024-01-15',
        status: '確定' as const,
        arrangementCompany: 'イベント企画株式会社',
        wholesalePrice: 50000,
        purchasePrice: 45000,
      },
      {
        id: '1-2',
        date: '2024-01-16',
        status: '申請中' as const,
        arrangementCompany: 'スペース管理会社',
        wholesalePrice: 30000,
        purchasePrice: 28000,
      }
    ],
    memo: 'VIP対応必要。駐車場確保済み。',
    communications: [],
  },
  {
    id: 2,
    assignedUser: '鈴木',
    updatedUser: '田中',
    status: '連絡済' as const,
    agency: 'エージェントA',
    detailStatus: '公開済み' as const,
    schedule: [false, false, true, true, true, false, false], // 木金土に稼働
    dayType: '週末' as const,
    isBandProject: true,
    bandWorkDays: 20,
    eventLocation: '幕張メッセ',
    managerName: '佐々木花子',
    managerPhone: '080-9876-5432',
    hostStore: ['池袋店'],
    partnerStores: [],
    flags: {
      hasLocationReservation: false,
      isExternalVenue: true,
      hasBusinessTrip: false,
    },
    quotaTable: {
      closer: { count: 1, unitPrice: 18000, transportFee: 1200 },
      girl: { count: 4, unitPrice: 14000, transportFee: 1000 },
    },
    freeEntry: { 'day1': 0, 'day2': 1, 'day3': 0 },
    memo: '大型イベント。スタッフ多数必要。',
    communications: [],
  },
  {
    id: 3,
    assignedUser: '高橋',
    updatedUser: '高橋',
    status: '起票' as const,
    agency: 'マーケティング会社B',
    detailStatus: '未登録' as const,
    schedule: [true, false, true, false, true, false, true], // 火木土月に稼働
    dayType: '平日' as const,
    isBandProject: false,
    eventLocation: '横浜アリーナ',
    managerName: '伊藤次郎',
    managerPhone: '070-1111-2222',
    hostStore: ['横浜店'],
    partnerStores: ['川崎店'],
    flags: {
      hasLocationReservation: true,
      isExternalVenue: false,
      hasBusinessTrip: false,
    },
    quotaTable: {
      closer: { count: 3, unitPrice: 16000, transportFee: 800 },
      girl: { count: 2, unitPrice: 13000, transportFee: 600 },
    },
    freeEntry: { 'day1': 2, 'day2': 0, 'day3': 4 },
    locationReservations: [
      {
        id: '3-1',
        date: '2024-01-20',
        status: '申請中' as const,
        arrangementCompany: 'スペース管理会社',
        wholesalePrice: 30000,
        purchasePrice: 28000,
      }
    ],
    memo: '',
    communications: [],
  },
];

// ToggleButtonGroup共通スタイル
const toggleButtonGroupStyle = {
  bgcolor: 'white',
  boxShadow: 1,
  borderRadius: 1
};

// 表示切替用のToggleButtonスタイル
const viewToggleButtonStyle = {
  px: 3,
  py: 1,
  minWidth: '150px',
  width: '150px',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    backgroundColor: '#e0e0e0',
    color: '#333333',
    fontWeight: 'bold',
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: '#d5d5d5',
    },
  }
};

export default function Sales() {
  const router = useRouter();
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>('detail'); // デフォルトを詳細ビューに変更
  const [summary, setSummary] = useState(initialSummary);
  const [salesRecords, setSalesRecords] = useState(generateDummySalesRecords());
  const weeks = getWeeks(year, month);

  // 選択された週の日付を取得
  const getSelectedWeekDate = () => {
    const baseDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (typeof selectedWeek === 'number') {
      baseDate.setDate(baseDate.getDate() + (selectedWeek - 1) * 7);
    }
    return baseDate;
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'detail' | 'summary') => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // レコード更新ハンドラー
  const handleRecordUpdate = (recordId: number, updates: any) => {
    setSalesRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, ...updates } : record
      )
    );
  };

  // レコード追加ハンドラー
  const handleRecordAdd = (newRecord: any) => {
    setSalesRecords(prev => [...prev, newRecord]);
  };

  return (
    <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      {/* メインコンテンツエリア */}
      <Box sx={{ position: 'relative' }}>
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
          <WeeklySummary weeks={weeks} summary={summary} year={year} month={month} />
        </Box>

        {/* 左側のコンテンツ */}
        <Box>
          {/* 年月・週選択を横並びで配置 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-end', flexWrap: 'nowrap', height: '58px' }}>
            <YearMonthSelector
              year={year}
              month={month}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
            />
            <Box sx={{ mx: 1 }}>
              <WeekSelector 
                selectedWeek={selectedWeek}
                onChange={setSelectedWeek}
                year={year}
                month={month}
              />
            </Box>
          </Box>

          {/* 表示切替 */}
          <Box sx={{ mb: 4 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={toggleButtonGroupStyle}
            >
              <ToggleButton 
                value="summary"
                sx={viewToggleButtonStyle}
              >
                <ViewModuleIcon sx={{ mr: 1 }} />
                サマリー
              </ToggleButton>
              <ToggleButton 
                value="detail"
                sx={viewToggleButtonStyle}
              >
                <ViewListIcon sx={{ mr: 1 }} />
                詳細
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 案件一覧テーブル */}
          {viewMode === 'detail' ? (
            <SalesTable 
              records={salesRecords}
              selectedWeek={getSelectedWeekDate()}
              onRecordUpdate={handleRecordUpdate}
              onRecordAdd={handleRecordAdd}
            />
          ) : (
            <SalesSummaryView 
              records={salesRecords}
              selectedWeek={getSelectedWeekDate()}
              onRecordUpdate={handleRecordUpdate}
              onRecordAdd={handleRecordAdd}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
} 