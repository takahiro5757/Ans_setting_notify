'use client';

import { Box, Container, Typography, Paper, TextField, MenuItem, Button, FormControl, InputLabel, Select } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SalesTable from '@/components/SalesTable';

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

  // 週の配列を取得
  const weeks = getWeeks(year, month);

  return (
    <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      {/* パンくずリスト */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          ホーム / 営業案件管理
        </Typography>
      </Box>

      {/* 年月選択 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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

      {/* 案件一覧テーブル */}
      <SalesTable />
    </Container>
  );
} 