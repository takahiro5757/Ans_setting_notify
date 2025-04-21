'use client';

import React, { useState, memo, useRef, useEffect } from 'react';
import { 
  Box, 
  TableCell, 
  styled, 
  Tooltip,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useShiftContext } from '../context/ShiftContext';

const Cell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: 30,
  lineHeight: 1,
  borderRight: '1px solid #000000',
}));

interface StatusCellProps {
  staffId: string;
  date: Date;
  isWeekend: boolean;
}

// 履歴表示用のカスタムツールチップ内容
interface HistoryTooltipContentProps {
  history: Array<{
    timestamp: number;
    oldStatus: '○' | '×' | '-';
    newStatus: '○' | '×' | '-';
    username: string;
  }>;
}

const HistoryTooltipContent: React.FC<HistoryTooltipContentProps> = ({ history }) => {
  // 履歴がない場合は空のコンポーネントを返す
  if (history.length === 0) {
    return null;
  }

  // 履歴を新しい順（降順）にソートし、最新の3件だけを取得
  const sortedHistory = [...history]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <Paper sx={{ 
      p: 1, 
      maxWidth: 300, 
      // 高さを十分確保する
      maxHeight: 300,
      minHeight: 100,
      overflow: 'auto' 
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        変更履歴
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List dense disablePadding sx={{ 
        // リストのスタイル調整
        '& .MuiListItem-root': {
          py: 0.5,
          display: 'block'
        }
      }}>
        {sortedHistory.map((entry, index) => (
          <ListItem key={index} sx={{ 
            py: 0.5,
            my: 0.5,
            border: '1px solid #f0f0f0',
            borderRadius: 1
          }}>
            <ListItemText
              disableTypography
              primary={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {entry.oldStatus} → {entry.newStatus}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(entry.timestamp).toLocaleDateString('ja-JP')} {new Date(entry.timestamp).toLocaleTimeString('ja-JP')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    変更者: {entry.username}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const StatusCell: React.FC<StatusCellProps> = ({ staffId, date, isWeekend }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { 
    getStatus, 
    isStatusChanged, 
    updateStatus,
    getStatusHistory
  } = useShiftContext();
  
  const status = getStatus(staffId, date);
  const statusChanged = isStatusChanged(staffId, date);
  const statusHistory = getStatusHistory(staffId, date);
  
  // 編集を開始
  const handleClick = () => {
    setIsEditing(true);
  };
  
  // 希望を選択
  const handleStatusSelect = (newStatus: '○' | '×' | '-') => {
    updateStatus(staffId, date, newStatus);
    setIsEditing(false);
  };
  
  // 背景色を決定
  const getBackgroundColor = () => {
    if (statusChanged) return '#ffcdd2';
    if (status === '○') return '#ffd54f';
    if (isWeekend) return '#ffdbac';
    return undefined;
  };
  
  // ホバー時の背景色を決定
  const getHoverBackgroundColor = () => {
    if (statusChanged) return '#ef9a9a';
    if (status === '○') return '#ffca28';
    if (isWeekend) return '#ffccaa';
    return '#f0f0f0';
  };
  
  return (
    <Tooltip
      title={<HistoryTooltipContent history={statusHistory} />}
      placement="right"
      arrow
      enterDelay={500}
      enterNextDelay={100}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'transparent',
            p: 0
          }
        }
      }}
      disableInteractive={false}
      disableHoverListener={statusHistory.length === 0} // 履歴がない場合はツールチップを表示しない
    >
      <Cell 
        onClick={handleClick}
        sx={{
          backgroundColor: getBackgroundColor(),
          cursor: 'pointer',
          '&:hover': { 
            backgroundColor: getHoverBackgroundColor(),
            textDecoration: 'underline'
          },
          position: 'relative'
        }}
      >
        {isEditing ? (
          <Box 
            className="status-edit-options"
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'center',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {['○', '×', '-'].map(opt => (
              <Box 
                key={opt}
                onClick={() => handleStatusSelect(opt as '○' | '×' | '-')}
                sx={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: '#bdbdbd'
                  }
                }}
              >
                {opt}
              </Box>
            ))}
          </Box>
        ) : (
          status
        )}
        
        {/* 変更履歴がある場合は小さなインジケーターを表示 */}
        {statusHistory.length > 0 && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              right: 0,
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#f44336',
            }}
          />
        )}
      </Cell>
    </Tooltip>
  );
};

export default memo(StatusCell); 