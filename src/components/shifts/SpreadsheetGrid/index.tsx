'use client';

import React from 'react';
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Box, 
  Typography, 
  styled
} from '@mui/material';

// スタッフのインターフェース
interface StaffMember {
  id: string;
  name: string;
  nameKana: string;
  station: string;
  weekdayRate: number;
  holidayRate: number;
  tel: string;
}

// シフト情報のインターフェース
export interface Shift {
  date: string;
  staffId: string;
  status: '○' | '×' | '-';
  location?: string;
}

// コンポーネントのプロップス
interface SpreadsheetGridProps {
  year: number;
  month: number;
  staffMembers: StaffMember[];
  shifts: Shift[];
}

// スタイル付きのテーブルセル
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  borderRight: '1px solid rgba(224, 224, 224, 1)',
  fontSize: '0.875rem',
  color: '#000000',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  '&.header': {
    backgroundColor: '#f5f5f5',
    fontWeight: 700,
    minWidth: '100px',
    borderBottom: '2px solid rgba(224, 224, 224, 1)',
  },
  '&.staff-header': {
    backgroundColor: '#e3f2fd',
    fontWeight: 700,
    fontSize: '1rem',
    borderBottom: '2px solid #1976d2',
    padding: theme.spacing(1.5),
  },
  '&.staff-info': {
    backgroundColor: theme.palette.common.white,
  },
  '&.weekend-sat': {
    backgroundColor: '#fffde7',
    color: '#000000',
  },
  '&.weekend-sun': {
    backgroundColor: '#fffde7',
    color: '#000000',
  },
  '&.shift-available': {
    backgroundColor: '#ffd54f',
    fontWeight: 700,
    color: '#000000',
  },
  '&.shift-unavailable': {
    color: '#000000',
    fontWeight: 600,
  },
  '&.staff-section': {
    borderRight: '2px solid #e0e0e0',
  },
  '&.date-column': {
    minWidth: '90px',
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
  },
  '&.status-column': {
    minWidth: '45px',
  },
  '&.tel-column': {
    minWidth: '120px',
  },
}));

// スタイル付きのテーブルコンテナ
const TableContainer = styled(Box)({
  height: 'calc(100vh - 350px)', // 上部コンポーネントの下に配置するため高さ調整
  overflow: 'auto',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  borderRadius: '4px',
  position: 'relative',
  '& table': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    backgroundColor: '#ffffff',
    tableLayout: 'auto',
  },
  '& thead': {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: '#fff',
  },
  '& thead tr:last-child th': {
    borderBottom: '2px solid #e0e0e0',
  },
  '& tbody tr:first-child td': {
    borderTop: 'none',
  },
  '& tbody tr:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  '& .sticky-header': {
    position: 'sticky',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  '& .sticky-footer': {
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
    backgroundColor: '#fff',
  },
  '& .role-header': {
    top: 0,
  },
  '& .name-header': {
    top: '57px',
  },
  '& tr': {
    '&:nth-of-type(even)': {
      backgroundColor: '#fafafa',
    },
  },
});

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  year,
  month,
  staffMembers,
  shifts,
}) => {
  // 指定された年月の日付を生成
  const generateDates = (year: number, month: number) => {
    const dates = [];
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    // 月の最終日を取得
    const lastDate = new Date(year, month, 0);
    const lastDay = lastDate.getDate();

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = weekdays[date.getDay()];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      dates.push({ date, dayOfWeek, isWeekend });
    }
    return dates;
  };

  // シフト情報を取得
  const getShift = (date: Date, staffId: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.find(shift => shift.date === dateStr && shift.staffId === staffId);
  };

  // 稼働数と総支給額を計算
  const calculateTotals = (staffId: string) => {
    const staffShifts = shifts.filter(shift => shift.staffId === staffId && shift.status === '○');
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return { workCount: 0, totalAmount: 0 };

    let totalAmount = 0;
    staffShifts.forEach(shift => {
      const date = new Date(shift.date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      totalAmount += isWeekend ? staff.holidayRate : staff.weekdayRate;
    });

    return { workCount: staffShifts.length, totalAmount };
  };

  const dates = generateDates(year, month);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow className="sticky-header role-header">
            <StyledTableCell className="header date-column"></StyledTableCell>
            {staffMembers.map(staff => (
              <StyledTableCell key={staff.id} className="staff-header staff-section" colSpan={3}>
                クローザー
              </StyledTableCell>
            ))}
          </TableRow>
          <TableRow className="sticky-header name-header">
            <StyledTableCell className="header">氏名</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section name-column" colSpan={3}>{staff.name}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <StyledTableCell className="header">カナ</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section name-column" colSpan={3}>{staff.nameKana}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <StyledTableCell className="header">最寄駅</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section" colSpan={3}>{staff.station}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <StyledTableCell className="header">平日</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section rate-column" colSpan={3}>¥{staff.weekdayRate.toLocaleString()}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <StyledTableCell className="header">土日</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section rate-column" colSpan={3}>¥{staff.holidayRate.toLocaleString()}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <StyledTableCell className="header">TEL</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section tel-column" colSpan={3}>{staff.tel}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <StyledTableCell className="header">ID</StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="staff-section" colSpan={3}>{staff.id}</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          {/* 希望・単価・稼働場所のヘッダー */}
          <TableRow>
            <StyledTableCell className="header"></StyledTableCell>
            {staffMembers.map(staff => (
              <React.Fragment key={staff.id}>
                <StyledTableCell className="header status-column">希望</StyledTableCell>
                <StyledTableCell className="header rate-column">単価</StyledTableCell>
                <StyledTableCell className="header staff-section location-column">稼働場所</StyledTableCell>
              </React.Fragment>
            ))}
          </TableRow>
          {/* 日付ごとのシフト情報 */}
          {dates.map(({ date, dayOfWeek, isWeekend }) => {
            const cellClassName = isWeekend ? (dayOfWeek === '日' ? 'weekend-sun' : 'weekend-sat') : '';
            return (
              <TableRow key={date.toISOString()}>
                <StyledTableCell className={`header date-column ${cellClassName}`}>
                  {date.getDate()}日 ({dayOfWeek})
                </StyledTableCell>
                {staffMembers.map(staff => {
                  const shift = getShift(date, staff.id);
                  const rate = isWeekend ? staff.holidayRate : staff.weekdayRate;
                  return (
                    <React.Fragment key={`${date.toISOString()}-${staff.id}`}>
                      <StyledTableCell 
                        className={`status-column ${cellClassName} ${shift?.status === '○' ? 'shift-available' : ''}`} 
                        sx={{ color: '#000000', fontWeight: shift?.status === '○' ? 700 : 600 }}
                      >
                        {shift?.status || '-'}
                      </StyledTableCell>
                      <StyledTableCell className={`rate-column ${cellClassName}`} sx={{ color: '#000000' }}>
                        {shift?.status === '○' ? `¥${rate.toLocaleString()}` : ''}
                      </StyledTableCell>
                      <StyledTableCell className={`location-column ${cellClassName} staff-section`} sx={{ color: '#000000' }}>
                        {shift?.status === '○' ? shift?.location || '' : ''}
                      </StyledTableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>
            );
          })}
          {/* 総稼働数の行 */}
          <TableRow className="sticky-footer">
            <StyledTableCell
              className="header"
              sx={{
                backgroundColor: '#e8eaf6',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
              }}
            >
              稼働数
            </StyledTableCell>
            {staffMembers.map(staff => {
              const { workCount } = calculateTotals(staff.id);
              return (
                <React.Fragment key={`total-work-${staff.id}`}>
                  <StyledTableCell
                    colSpan={3}
                    className="staff-section"
                    sx={{
                      backgroundColor: '#e8eaf6',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {workCount}
                  </StyledTableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
          {/* 実績（総支給額）の行 */}
          <TableRow className="sticky-footer">
            <StyledTableCell
              className="header"
              sx={{
                backgroundColor: '#fce4ec',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
              }}
            >
              実績
            </StyledTableCell>
            {staffMembers.map(staff => {
              const { totalAmount } = calculateTotals(staff.id);
              return (
                <React.Fragment key={`total-amount-${staff.id}`}>
                  <StyledTableCell
                    colSpan={3}
                    className="staff-section"
                    sx={{
                      backgroundColor: '#fce4ec',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    ¥{totalAmount.toLocaleString()}
                  </StyledTableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 