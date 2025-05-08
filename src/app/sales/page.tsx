'use client';

import { Box, Container, Typography, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SalesTable from '@/components/SalesTable';
import WeeklySummary from '@/components/WeeklySummary';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

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

// 表示切替用のToggleButtonスタイル
const viewToggleButtonStyle = {
  minWidth: '120px',
  borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
  '&.Mui-selected': {
    backgroundColor: '#f5f5f5',
    color: '#333333',
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    }
  },
  '&:first-of-type': {
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
  }
};

export default function Sales() {
  const router = useRouter();
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('1');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>('summary');
  const [summary, setSummary] = useState(initialSummary);
  const weeks = getWeeks(year, month);

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
          <WeeklySummary weeks={weeks} summary={summary} />
        </Box>

        {/* 左側のコンテンツ */}
        <Box>
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

          {/* 表示切替 */}
          <Box sx={{ mb: 3 }}>
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