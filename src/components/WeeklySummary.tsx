'use client';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

interface WeeklySummaryProps {
  weeks: string[];  // ['0W', '1W', '2W', '3W', '4W', '5W']
  summary: {
    closerCapacity: number[];  // 各週のクローザー枠数
    girlCapacity: number[];    // 各週のガール枠数
    totalCapacity: number[];   // 各週の稼働可能人数
  };
}

// ヘッダーセルのスタイル
const headerCellStyle = {
  backgroundColor: '#f5f5f5',
  padding: '8px',
  borderBottom: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
  width: 'calc(900px / 6)'  // 6列で均等に分割
};

// データセルのスタイル
const dataCellStyle = {
  padding: '8px',
  borderBottom: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
  width: 'calc(900px / 6)'  // 6列で均等に分割
};

const WeeklySummary = ({ weeks, summary }: WeeklySummaryProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      {/* 左側の項目名 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1px',
        mt: '40px', // ヘッダーの高さ分調整
        minWidth: '120px', // 項目名が改行しないように最小幅を設定
      }}>
        <Typography sx={{ 
          color: '#0066CC',
          fontSize: '0.875rem',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap' // 改行を防ぐ
        }}>
          クローザー枠数
        </Typography>
        <Typography sx={{ 
          color: '#FF1493',
          fontSize: '0.875rem',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap' // 改行を防ぐ
        }}>
          ガール枠数
        </Typography>
        <Typography sx={{ 
          color: '#333333',
          fontSize: '0.875rem',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap' // 改行を防ぐ
        }}>
          稼働可能人数
        </Typography>
      </Box>

      {/* 右側の数値テーブル */}
      <TableContainer sx={{ 
        width: '900px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {weeks.map((week) => (
                <TableCell 
                  key={week} 
                  align="center"
                  sx={headerCellStyle}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'normal' }}>{week}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* クローザー枠 */}
            <TableRow>
              {summary.closerCapacity.map((capacity, index) => (
                <TableCell 
                  key={`closer-${index}`} 
                  align="center"
                  sx={dataCellStyle}
                >
                  <Typography sx={{ color: '#0066CC', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                    {`${capacity}枠`}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
            {/* ガール枠 */}
            <TableRow>
              {summary.girlCapacity.map((capacity, index) => (
                <TableCell 
                  key={`girl-${index}`} 
                  align="center"
                  sx={dataCellStyle}
                >
                  <Typography sx={{ color: '#FF1493', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                    {`${capacity}枠`}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
            {/* 稼働可能人数 */}
            <TableRow>
              {summary.totalCapacity.map((capacity, index) => (
                <TableCell 
                  key={`total-${index}`} 
                  align="center"
                  sx={{
                    ...dataCellStyle,
                    borderBottom: 'none'  // 最後の行は下線なし
                  }}
                >
                  <Typography sx={{ color: '#333333', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                    {`${capacity}人`}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WeeklySummary; 