'use client';

import { Box, Container, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SalesTable from '@/components/SalesTable';
import WeeklySummary from '@/components/WeeklySummary';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';

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
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>('summary');
  const [summary, setSummary] = useState(initialSummary);
  const weeks = getWeeks(year, month);

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
          <SalesTable initialViewMode={viewMode} />
        </Box>
      </Box>
    </Container>
  );
} 