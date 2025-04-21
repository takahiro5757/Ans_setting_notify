'use client';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useState, useMemo } from 'react';
import { getAvailableWeeks } from '@/utils/dateUtils';

// 週情報の型
interface WeeklySummaryProps {
  weeks: string[];
  summary: {
    closerCapacity: number[];
    girlCapacity: number[];
    totalCapacity: number[];
  };
  year?: string | number;
  month?: string | number;
}

// フィルタータイプの定義
type FilterType = 'all' | 'weekday' | 'weekend';

const WeeklySummary = ({ weeks, summary, year = new Date().getFullYear(), month = new Date().getMonth() + 1 }: WeeklySummaryProps) => {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  
  // 利用可能な週を取得
  const availableWeeks = useMemo(() => getAvailableWeeks(year, month), [year, month]);
  
  // 月間合計を計算
  const monthlyTotal = {
    closer: summary.closerCapacity.reduce((acc, curr) => acc + curr, 0),
    girl: summary.girlCapacity.reduce((acc, curr) => acc + curr, 0)
  };

  // フィルター変更ハンドラー
  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType,
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 1.5,
          overflow: 'hidden',
          border: 'none',
          '& .MuiTableCell-root': {
            borderColor: 'rgba(224, 224, 224, 0.4)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.75, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="シフト表示フィルター"
            sx={{ 
              '& .MuiToggleButtonGroup-root': {
                height: '24px'
              },
              '& .MuiToggleButton-root': {
                px: 1,
                py: 0.2,
                fontSize: '0.7rem',
                textTransform: 'none',
                borderColor: 'rgba(224, 224, 224, 0.4)',
                color: theme.palette.text.secondary,
                minWidth: '70px',
                height: '24px',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1976d2',
                  fontWeight: 500,
                }
              }
            }}
          >
            <ToggleButton value="all">すべて</ToggleButton>
            <ToggleButton value="weekday">平日のみ</ToggleButton>
            <ToggleButton value="weekend">週末のみ</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer sx={{ maxHeight: '110px' }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(245, 245, 250, 0.5)' }}>
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    width: '120px'
                  }}
                >
                </TableCell>
                {availableWeeks.map((weekIndex) => (
                  <TableCell 
                    key={weekIndex} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 0.75, 
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                      width: '70px'
                    }}
                  >
                    {weekIndex}W
                  </TableCell>
                ))}
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    width: '70px'
                  }}
                >
                  合計
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* クローザー枠数 */}
              <TableRow hover>
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    color: '#2196f3', 
                    fontWeight: 500,
                  }}
                >
                  <Box sx={{ whiteSpace: 'nowrap' }}>
                    クローザー枠数
                  </Box>
                </TableCell>
                {availableWeeks.map((weekIndex) => (
                  <TableCell 
                    key={weekIndex} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 0.75, 
                      color: '#2196f3',
                      fontWeight: 500,
                    }}
                  >
                    <Box sx={{ 
                      display: 'inline-block', 
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.2,
                      minWidth: '45px',
                      whiteSpace: 'nowrap'
                    }}>
                      {summary.closerCapacity[weekIndex] || 0}枠
                    </Box>
                  </TableCell>
                ))}
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    color: '#2196f3',
                    fontWeight: 600,
                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                  }}
                >
                  <Box sx={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(33, 150, 243, 0.12)',
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.2,
                    minWidth: '45px',
                    whiteSpace: 'nowrap'
                  }}>
                    {monthlyTotal.closer}枠
                  </Box>
                </TableCell>
              </TableRow>
              
              {/* ガール枠数 */}
              <TableRow hover>
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    color: '#e91e63', 
                    fontWeight: 500,
                  }}
                >
                  <Box sx={{ whiteSpace: 'nowrap' }}>
                    ガール枠数
                  </Box>
                </TableCell>
                {availableWeeks.map((weekIndex) => (
                  <TableCell 
                    key={weekIndex} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 0.75, 
                      color: '#e91e63',
                      fontWeight: 500,
                    }}
                  >
                    <Box sx={{ 
                      display: 'inline-block',
                      backgroundColor: 'rgba(233, 30, 99, 0.08)',
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.2,
                      minWidth: '45px',
                      whiteSpace: 'nowrap'
                    }}>
                      {summary.girlCapacity[weekIndex] || 0}枠
                    </Box>
                  </TableCell>
                ))}
                <TableCell 
                  sx={{ 
                    textAlign: 'center', 
                    p: 0.75, 
                    color: '#e91e63',
                    fontWeight: 600,
                    backgroundColor: 'rgba(233, 30, 99, 0.04)',
                  }}
                >
                  <Box sx={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(233, 30, 99, 0.12)',
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.2,
                    minWidth: '45px',
                    whiteSpace: 'nowrap'
                  }}>
                    {monthlyTotal.girl}枠
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WeeklySummary; 