'use client';

import React, { memo } from 'react';
import { TableRow } from '@mui/material';
import { DateInfo } from '../types';
import StatusCell from './StatusCell';
import RateCell from './RateCell';
import LocationCell from './LocationCell';
import { styled } from '@mui/material';
import { TableCell } from '@mui/material';
import { useShiftContext } from '../context/ShiftContext';

// 列の幅と位置を定義
const WIDTH = {
  date: 86,
  closerCase: 100,
  girlCase: 100,
  closerAvailable: 100,
  girlAvailable: 100,
  close: 100,
  girl: 100,
  // 折りたたみ時の幅を追加
  closerSection: 400 // クローザーセクション全体の幅（折りたたみ時）
};

// 列の左位置を計算
const LEFT = {
  date: 0,
  closerCase: WIDTH.date,
  girlCase: WIDTH.date + WIDTH.closerCase,
  closerAvailable: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase,
  girlAvailable: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable,
  close: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable + WIDTH.girlAvailable,
  girl: WIDTH.date + WIDTH.closerCase + WIDTH.girlCase + WIDTH.closerAvailable + WIDTH.girlAvailable + WIDTH.close,
  // 折りたたみ時の位置
  closerSection: WIDTH.date,
  closeCollapsed: WIDTH.date + WIDTH.closerSection,
  girlCollapsed: WIDTH.date + WIDTH.closerSection + WIDTH.close
};

const DateCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.date,
  zIndex: 400,
  background: '#f5f5f5',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.date,
}));

const CloserCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerCase,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.closerCase,
}));

const GirlCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlCase,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.girlCase,
}));

// 稼働可能数用の固定セル（クローザー）
const CloserAvailableCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.closerAvailable,
}));

// 稼働可能数用の固定セル（ガール）
const GirlAvailableCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.girlAvailable,
}));

const CloseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.close,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.close,
}));

const GirlCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girl,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.girl,
}));

// クローザーセクション（折りたたみ時）用のスタイル付きセル
const CloserSectionCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closerSection,
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.closerSection,
}));

// 未決C（折りたたみ時）用のスタイル付きセル
const CloseCellFixCollapsed = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.closeCollapsed,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.close,
}));

// 未決G（折りたたみ時）用のスタイル付きセル
const GirlCellFixCollapsed = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: LEFT.girlCollapsed,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
  width: WIDTH.girl,
}));

interface DateRowProps {
  dateInfo: DateInfo;
  staffMembers: Array<{id: string, role?: string}>;
  dateCloserCases: number;
  dateGirlCases: number;
  dateCloserAvailable: number;
  dateGirlAvailable: number;
  closerUnassignedCount: number;
  girlUnassignedCount: number;
  highlightedCellId: string | null;
  onUnassignedClick: (date: Date, role: string) => void;
  onCommentClick: (staffId: string, date: Date) => void;
  columnOrder: string[];
  isExpanded: boolean;
}

const DateRow: React.FC<DateRowProps> = ({ 
  dateInfo, 
  staffMembers,
  dateCloserCases,
  dateGirlCases,
  dateCloserAvailable,
  dateGirlAvailable,
  closerUnassignedCount,
  girlUnassignedCount,
  highlightedCellId,
  onUnassignedClick,
  onCommentClick,
  columnOrder,
  isExpanded
}) => {
  const { date, dayOfWeek, isWeekend } = dateInfo;
  const { 
    getStatus, 
    getShift 
  } = useShiftContext();
  
  return (
    <TableRow>
      <DateCellFix
        sx={{
          backgroundColor: isWeekend ? '#ffdbac' : undefined,
          color: dayOfWeek === '日' ? '#ff0000' : dayOfWeek === '土' ? '#0000ff' : undefined
        }}
      >
        {date.getDate()}({dayOfWeek})
      </DateCellFix>
      
      {isExpanded ? (
        // 通常表示モード
        <>
          {columnOrder.map(columnId => {
            if (columnId === 'closerCase') {
              return (
                <CloserCaseCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : undefined }}>
                  {dateCloserCases}
                </CloserCaseCellFix>
              );
            } else if (columnId === 'girlCase') {
              return (
                <GirlCaseCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : undefined }}>
                  {dateGirlCases}
                </GirlCaseCellFix>
              );
            } else if (columnId === 'closerAvailable') {
              return (
                <CloserAvailableCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : '#e8f5e9' }}>
                  {dateCloserAvailable}
                </CloserAvailableCellFix>
              );
            } else if (columnId === 'girlAvailable') {
              return (
                <GirlAvailableCellFix key={columnId} sx={{ backgroundColor: isWeekend ? '#ffdbac' : '#e8f5e9' }}>
                  {dateGirlAvailable}
                </GirlAvailableCellFix>
              );
            }
            return null;
          })}
          
          <CloseCellFix
            onClick={() => onUnassignedClick(date, 'クローザー')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : undefined,
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {closerUnassignedCount}
          </CloseCellFix>
          
          <GirlCellFix
            onClick={() => onUnassignedClick(date, 'ガール')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : undefined,
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {girlUnassignedCount}
          </GirlCellFix>
        </>
      ) : (
        // 折りたたみ表示モード（スタイル付きコンポーネントを使用）
        <>
          <CloserSectionCellFix
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>C:{dateCloserCases} G:{dateGirlCases}</span>
          </CloserSectionCellFix>
          
          <CloseCellFixCollapsed
            onClick={() => onUnassignedClick(date, 'クローザー')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#fffde7',
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {closerUnassignedCount}
          </CloseCellFixCollapsed>
          
          <GirlCellFixCollapsed
            onClick={() => onUnassignedClick(date, 'ガール')}
            sx={{
              backgroundColor: isWeekend ? '#ffdbac' : '#fffde7',
              cursor: 'pointer',
              '&:hover': { backgroundColor: isWeekend ? '#ffccaa' : '#f0f0f0' }
            }}
          >
            {girlUnassignedCount}
          </GirlCellFixCollapsed>
        </>
      )}
      
      {/* スタッフメンバーの表示部分 - 展開/折りたたみどちらの状態でも表示 */}
      {staffMembers.map(staff => {
        const shift = getShift(date, staff.id); 
        const status = getStatus(staff.id, date);
        const hasConfirmedLocation = status === '○' && shift?.location;
        const isUnassigned = status === '○' && !shift?.location;
        const cellId = isUnassigned ? `loc-${date.getDate()}-${staff.id}` : '';
        const isHighlighted = cellId && cellId === highlightedCellId;
        
        return (
          <React.Fragment key={`${date.toISOString()}-${staff.id}`}>
            <StatusCell 
              staffId={staff.id}
              date={date}
              isWeekend={isWeekend}
            />
            
            <RateCell 
              staffId={staff.id}
              date={date}
              isWeekend={isWeekend}
              hasConfirmedLocation={!!hasConfirmedLocation}
            />
            
            <LocationCell 
              staffId={staff.id}
              date={date}
              isWeekend={isWeekend}
              isHighlighted={!!isHighlighted}
              hasConfirmedLocation={!!hasConfirmedLocation}
              isUnassigned={!!isUnassigned}
              location={shift?.location}
              cellId={cellId}
              onCommentClick={onCommentClick}
            />
          </React.Fragment>
        );
      })}
    </TableRow>
  );
};

export default memo(DateRow); 