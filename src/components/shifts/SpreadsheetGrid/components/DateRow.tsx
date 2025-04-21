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

const DateCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: 0,
  zIndex: 400,
  background: '#f5f5f5',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
}));

const CloserCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: 86, // DateCellの幅
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
}));

const GirlCaseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: 206, // DateCell + CloserCaseCellの幅
  zIndex: 400,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
}));

const CloseCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: 326, // DateCell + CloserCaseCell + GirlCaseCellの幅
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
}));

const GirlCellFix = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '2px solid #000000',
  position: 'sticky',
  left: 466, // DateCell + CloserCaseCell + GirlCaseCell + CloseCellの幅
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  marginRight: -2,
}));

interface DateRowProps {
  dateInfo: DateInfo;
  staffMembers: Array<{id: string, role?: string}>;
  dateCloserCases: number;
  dateGirlCases: number;
  closerUnassignedCount: number;
  girlUnassignedCount: number;
  highlightedCellId: string | null;
  onUnassignedClick: (date: Date, role: string) => void;
  onCommentClick: (staffId: string, date: Date) => void;
  columnOrder: string[];
}

const DateRow: React.FC<DateRowProps> = ({ 
  dateInfo, 
  staffMembers,
  dateCloserCases,
  dateGirlCases,
  closerUnassignedCount,
  girlUnassignedCount,
  highlightedCellId,
  onUnassignedClick,
  onCommentClick,
  columnOrder
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