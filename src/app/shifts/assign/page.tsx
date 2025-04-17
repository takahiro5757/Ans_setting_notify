'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper, SelectChangeEvent } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import WeeklySummary from '@/components/WeeklySummary';
import { getWeeks, generateDummySummary } from '@/utils/dateUtils';

export default function AssignPage() {
  // 状態管理
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('4');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  
  // 週情報を取得
  const weeks = getWeeks(year, month);
  
  // ダミーのサマリーデータ
  const summary = generateDummySummary();

  // 年の変更ハンドラ
  const handleYearChange = (year: string) => {
    setYear(year);
  };

  // 月の変更ハンドラ
  const handleMonthChange = (month: string) => {
    setMonth(month);
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh', 
        py: 3
      }}
    >
      {/* パンくずリスト */}
      <Breadcrumb items={['ホーム', 'シフト管理', 'アサイン']} />

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
          <YearMonthSelector
            year={year}
            month={month}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            years={['2024']}
            months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
          />

          {/* 週選択 */}
          <WeekSelector 
            selectedWeek={selectedWeek}
            onChange={(week) => setSelectedWeek(week)}
          />

          {/* コンテンツエリア */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              アサイン管理
            </Typography>
            <Typography variant="body1">
              このページはアサイン管理画面です。現在開発中です。
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
} 