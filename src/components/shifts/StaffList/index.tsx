'use client';

import { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  ToggleButton, 
  ToggleButtonGroup,
  Paper,
  styled
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Draggable, Droppable } from '@hello-pangea/dnd';

// スタイル付きコンポーネント
const StaffListContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[1],
}));

const DateToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: '2px 4px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px !important',
  minWidth: '60px',
  fontSize: '0.75rem',
  backgroundColor: '#f5f5f5',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  }
}));

interface StatusTileProps {
  color: string;
}

const StatusTile = styled(Paper)<StatusTileProps>(({ theme, color }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80px',
  height: '32px',
  margin: theme.spacing(0.75),
  backgroundColor: color,
  borderRadius: '4px',
  cursor: 'grab',
  userSelect: 'none',
  textAlign: 'center',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  fontSize: '0.8rem',
  padding: '4px 8px',
  fontWeight: 'bold',
}));

const OrganizationButton = styled(ToggleButton)(({ theme }) => ({
  padding: '4px 12px',
  border: '1px solid #e0e0e0',
  borderRadius: '20px !important',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  margin: theme.spacing(0.5),
  textTransform: 'none',
  backgroundColor: '#f5f5f5',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    }
  }
}));

const ScrollIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  padding: 4,
}));

// 日付データの生成
const generateDates = (year: number, month: number, startDay: number = 1, days: number = 7) => {
  const dates = [];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(year, month - 1, startDay + i);
    const dayName = dayNames[date.getDay()];
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    dates.push({ dayName, dateStr, value: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` });
  }
  
  return dates;
};

// 組織データ
const organizations = [
  { id: 'ansteype-employee', name: 'ANSTEYPE社員' },
  { id: 'ansteype-contractor', name: 'ANSTEYPE業務委託' },
  { id: 'festal', name: 'Festal' },
  { id: 'tech-pro', name: 'テックプロ' },
  { id: 'digital-hearts', name: 'デジタルハーツ' },
  { id: 'v-tech', name: 'V-Tech' },
  { id: 'incs', name: 'インクス' },
  { id: 'avanti', name: 'アバンティ' },
  { id: 'other', name: 'その他' }
];

// インターフェース定義
interface StaffListProps {
  year: number;
  month: number;
}

export default function StaffList({ year, month }: StaffListProps) {
  // 状態管理
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 日付データの生成
  const dates = generateDates(year, month);
  
  // 日付選択のハンドラ
  const handleDateChange = (event: React.MouseEvent<HTMLElement>, newDates: string[]) => {
    setSelectedDates(newDates);
  };
  
  // 組織選択のハンドラ
  const handleOrgChange = (event: React.MouseEvent<HTMLElement>, newOrgs: string[]) => {
    setSelectedOrgs(newOrgs);
  };
  
  // スクロールハンドラ
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // スクロール量
      const container = scrollContainerRef.current;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };
  
  return (
    <StaffListContainer>
      {/* 上部のボタンとアイコン */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1, borderRadius: '4px', textTransform: 'none' }}
        >
          自動配置実行
        </Button>
        <IconButton color="primary">
          <SettingsIcon />
        </IconButton>
      </Box>
      
      {/* 要員リストと日付選択 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 2, fontWeight: 'bold' }}>
          要員リスト
        </Typography>
        <ToggleButtonGroup
          value={selectedDates}
          onChange={handleDateChange}
          aria-label="日付選択"
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          {dates.map((date, index) => (
            <DateToggleButton key={index} value={date.value} aria-label={date.dateStr}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption">{date.dayName}</Typography>
                <Typography variant="caption">{date.dateStr}</Typography>
              </Box>
            </DateToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      
      {/* ステータスタイル */}
      <Box sx={{ display: 'flex', justifyContent: 'start', mb: 2 }}>
        <Droppable droppableId="status-tiles" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ display: 'flex' }}
            >
              <Draggable draggableId="absent" index={0}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <StatusTile color="#ff8a80">
                      <Typography variant="body2">欠勤</Typography>
                    </StatusTile>
                  </Box>
                )}
              </Draggable>
              <Draggable draggableId="tm" index={1}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <StatusTile color="#90caf9">
                      <Typography variant="body2">TM</Typography>
                    </StatusTile>
                  </Box>
                )}
              </Draggable>
              <Draggable draggableId="selected" index={2}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <StatusTile color="#dce775">
                      <Typography variant="body2">選択中</Typography>
                    </StatusTile>
                  </Box>
                )}
              </Draggable>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Box>
      
      {/* 組織選択ボタン */}
      <Box sx={{ mt: 3, position: 'relative' }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          組織
        </Typography>
        <Box sx={{ position: 'relative', width: '100%' }}>
          {/* 左スクロールボタン */}
          <ScrollIconButton
            onClick={() => handleScroll('left')}
            size="small"
            sx={{ left: -18, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeftIcon fontSize="small" />
          </ScrollIconButton>
          
          {/* スクロール可能なボタングループコンテナ */}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              position: 'relative',
              pt: 0.5,
              pb: 0.5,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <ToggleButtonGroup
              value={selectedOrgs}
              onChange={handleOrgChange}
              aria-label="組織選択"
              size="small"
              sx={{ flexWrap: 'nowrap' }}
            >
              {organizations.map((org) => (
                <OrganizationButton key={org.id} value={org.id} aria-label={org.name}>
                  {org.name}
                </OrganizationButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          
          {/* 右スクロールボタン */}
          <ScrollIconButton
            onClick={() => handleScroll('right')}
            size="small"
            sx={{ right: -18, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronRightIcon fontSize="small" />
          </ScrollIconButton>
        </Box>
      </Box>
    </StaffListContainer>
  );
} 