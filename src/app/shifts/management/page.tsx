'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper, SelectChangeEvent } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import WeeklySummary from '@/components/WeeklySummary';
import { SpreadsheetGrid, Shift } from '@/components/shifts/SpreadsheetGrid';
import { getWeeks, generateDummySummary } from '@/utils/dateUtils';

// ダミーのスタッフデータ
const dummyStaffMembers = [
  {
    id: 'staff1',
    name: '山田 太郎',
    nameKana: 'ヤマダ タロウ',
    station: '渋谷駅',
    weekdayRate: 20000,
    holidayRate: 25000,
    tel: '090-1234-5678',
  },
  {
    id: 'staff2',
    name: '鈴木 次郎',
    nameKana: 'スズキ ジロウ',
    station: '新宿駅',
    weekdayRate: 18000,
    holidayRate: 22000,
    tel: '090-2345-6789',
  },
  {
    id: 'staff3',
    name: '佐藤 花子',
    nameKana: 'サトウ ハナコ',
    station: '池袋駅',
    weekdayRate: 19000,
    holidayRate: 23000,
    tel: '090-3456-7890',
  }
];

// ダミーのシフトデータを生成する関数
const generateDummyShifts = (year: number, month: number): Shift[] => {
  const shifts: Shift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // スタッフごとにシフトを生成
  dummyStaffMembers.forEach(staff => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // ランダムでシフト状態を決定
      const rand = Math.random();
      let status: '○' | '×' | '-' = '-';
      
      if (rand < 0.6) {
        status = '○';
      } else if (rand < 0.9) {
        status = '×';
      }
      
      // 土日は出勤率を下げる
      if ((dayOfWeek === 0 || dayOfWeek === 6) && status === '○' && Math.random() < 0.3) {
        status = '×';
      }
      
      // シフトの追加
      shifts.push({
        date: dateStr,
        staffId: staff.id,
        status,
        location: status === '○' ? ['渋谷店', '新宿店', '池袋店', '銀座店'][Math.floor(Math.random() * 4)] : undefined
      });
    }
  });
  
  return shifts;
};

export default function ManagementPage() {
  // 状態管理
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('4');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  
  // 週情報を取得
  const weeks = getWeeks(year, month);
  
  // ダミーのサマリーデータ
  const summary = generateDummySummary();
  
  // ダミーのシフトデータ
  const dummyShifts = generateDummyShifts(parseInt(year), parseInt(month));

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
      <Breadcrumb items={['ホーム', 'シフト調整', 'シフト管理']} />

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
            years={['2023', '2024', '2025']}
            months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
          />

          {/* 週選択 */}
          <WeekSelector 
            selectedWeek={selectedWeek}
            onChange={(week) => setSelectedWeek(week)}
          />

          {/* SpreadsheetGridコンポーネントを追加 */}
          <Box sx={{ mt: 8 }}>
            <SpreadsheetGrid
              year={parseInt(year)}
              month={parseInt(month)}
              staffMembers={dummyStaffMembers}
              shifts={dummyShifts}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 