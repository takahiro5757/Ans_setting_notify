'use client';

import { Box, Container, Typography, Paper, TextField, MenuItem, Button, Tabs, Tab, IconButton, FormControl, InputLabel, Select } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SalesTable from '@/components/SalesTable';
import WeeklyCapacityTable from '@/components/WeeklyCapacityTable';

// 週別タブの定義
const getWeeks = (year: string, month: string) => {
  if (!year || !month) return ['0W', '1W', '2W', '3W', '4W', '5W'];
  const numWeeks = Math.ceil(new Date(parseInt(year), parseInt(month), 0).getDate() / 7);
  return Array.from({ length: numWeeks }, (_, i) => `${i}W`);
};

export default function Sales() {
  const router = useRouter();
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('1');
  const [selectedWeek, setSelectedWeek] = useState(0);

  // 週の配列を取得
  const weeks = getWeeks(year, month);

  const weeklyCapacity = [
    { week: '0W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '1W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '2W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '3W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '4W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '5W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 }
  ];

  return (
    <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      {/* パンくずリスト */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          ホーム / 営業案件管理
        </Typography>
      </Box>

      {/* 年月選択とWeeklyCapacityTable */}
      <Box sx={{ display: 'flex', gap: 4, mb: 3, alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
        <Box sx={{ flex: 1 }}>
          <WeeklyCapacityTable weeks={weeklyCapacity} />
        </Box>
      </Box>

      {/* 週別タブ */}
      <Tabs
        value={selectedWeek}
        onChange={(_, newValue) => setSelectedWeek(newValue)}
        sx={{ mb: 2, bgcolor: 'white', borderRadius: '4px 4px 0 0' }}
      >
        {weeks.map((week, index) => (
          <Tab
            key={week}
            label={`${index + 1}週目`}
            sx={{
              '&.Mui-selected': {
                bgcolor: '#1976d2',
                color: 'white'
              }
            }}
          />
        ))}
      </Tabs>

      {/* 案件一覧テーブル */}
      <SalesTable />
    </Container>
  );
} 