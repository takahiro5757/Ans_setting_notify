'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Container, Typography, Grid, SelectChangeEvent, ToggleButtonGroup, ToggleButton } from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import WeeklySummary from '@/components/WeeklySummary';
import StaffList from '@/components/shifts/StaffList';
import AssignmentTable from '@/components/shifts/AssignmentTable';
import { getWeeks, generateDummySummary, getAvailableWeeks } from '@/utils/dateUtils';
import { generateDates, generateDummyAssignments, generateWeekDates, generate2025AprilMayAssignments } from '@/utils/assignmentUtils';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

// AssignmentItemインターフェース
interface AssignmentItem {
  id: string;
  agency: string;
  venue: string;
  venueDetail: string;
  hasTrip: boolean;
  isOutdoor: boolean;
  orders: {
    id: string;
    name: string;
    isGirl: boolean;
  }[];
  availability: {
    [key: string]: boolean;
  };
  // ステータス情報を追加
  statuses?: {
    [orderId: string]: {
      [date: string]: string; // 'absent', 'tm', 'selected'のいずれか
    };
  };
}

export default function AssignPage() {
  // 状態管理
  const [year, setYear] = useState<string>('2025');
  const [month, setMonth] = useState<string>('4');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(generate2025AprilMayAssignments());
  // 表示モードの状態追加
  const [displayMode, setDisplayMode] = useState<string>('normal');
  // 日付データを状態として管理
  const [dates, setDates] = useState<{
    date: string;
    dayOfWeek: string;
    display: string;
    isOtherMonth?: boolean;
  }[]>([]);
  
  // 週情報を取得
  const weeks = getWeeks(year, month);
  
  // ダミーのサマリーデータ
  const summary = generateDummySummary();

  // 年月週が変更されたら日付データを更新
  useEffect(() => {
    // 利用可能な週を取得
    const availableWeeks = getAvailableWeeks(year, month);
    
    // 選択された週が利用可能でない場合、最初の利用可能な週を選択
    if (!availableWeeks.includes(selectedWeek)) {
      setSelectedWeek(availableWeeks[0]);
      return;
    }
    
    // 選択された週に基づいて日付データを生成
    const weekDates = generateWeekDates(year, month, selectedWeek);
    setDates(weekDates);
  }, [year, month, selectedWeek]);

  // 年の変更ハンドラ
  const handleYearChange = (year: string) => {
    setYear(year);
  };

  // 月の変更ハンドラ
  const handleMonthChange = (month: string) => {
    setMonth(month);
  };

  // アサインメント編集ハンドラ
  const handleEditAssignment = (updatedAssignment: AssignmentItem) => {
    setAssignments(prevAssignments => 
      prevAssignments.map(assignment => 
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
      )
    );
  };

  // ドラッグ終了ハンドラ
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    console.log('Drag ended:', source, destination, draggableId);
    
    // ステータスタイルのドロップ処理
    if (draggableId === 'absent' || draggableId === 'tm' || draggableId === 'selected') {
      // ドロップ先のIDを解析
      const destinationId = destination.droppableId;
      const match = destinationId.match(/assignment-(.*)-date-(.*)-order-(.*)/);
      
      if (match) {
        const [, assignmentId, date, orderId] = match;
        console.log(`ステータス "${draggableId}" を ${assignmentId} の ${date} のオーダー ${orderId} に適用します`);
        
        // ステータス値を決定
        const statusValue = draggableId;
        
        // アサインメントの状態を更新
        setAssignments(prevAssignments => {
          return prevAssignments.map(assignment => {
            if (assignment.id === assignmentId) {
              // ステータス情報がない場合は初期化
              const statuses = assignment.statuses || {};
              
              // 特定のオーダーのステータス情報がない場合は初期化
              if (!statuses[orderId]) {
                statuses[orderId] = {};
              }
              
              // ステータスを設定
              statuses[orderId][date] = statusValue;
              
              return {
                ...assignment,
                statuses
              };
            }
            return assignment;
          });
        });
      }
    }
  }, []);

  // 表示モード変更ハンドラ
  const handleDisplayModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string,
  ) => {
    if (newMode !== null) {
      setDisplayMode(newMode);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container 
        maxWidth={false} 
        sx={{ 
          bgcolor: '#f5f5f5', 
          minHeight: '100vh', 
          py: 3
        }}
      >
        {/* パンくずリスト */}
        <Breadcrumb items={['ホーム', 'シフト管理', 'アサイン']} />

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
            <WeeklySummary 
              weeks={weeks} 
              summary={summary}
              year={year}
              month={month}
            />
          </Box>

          {/* 年月・週選択 */}
          <Box sx={{ mb: 2 }}>
            <YearMonthSelector
              year={year}
              month={month}
              onYearChange={handleYearChange}
              onMonthChange={handleMonthChange}
              months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
            />

            <WeekSelector 
              selectedWeek={selectedWeek}
              onChange={(week) => setSelectedWeek(week)}
              year={year}
              month={month}
            />
          </Box>
          
          {/* 表示切替ボタン */}
          <Box sx={{ 
            mb: 3, 
            justifyContent: 'flex-start',
            borderRadius: 1,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            display: 'inline-block'
          }}>
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={handleDisplayModeChange}
              aria-label="表示切替"
              size="small"
            >
              <ToggleButton 
                value="normal" 
                aria-label="通常" 
                sx={{ 
                  px: 3,
                  width: '100px',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      color: 'white',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  通常
                </Box>
              </ToggleButton>
              <ToggleButton 
                value="series" 
                aria-label="帯案件" 
                sx={{ 
                  px: 3,
                  width: '100px',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      color: 'white',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  帯案件
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* メインコンテンツ - グリッドレイアウト */}
          <Grid container spacing={2}>
            {/* 左側のコンテンツ - AssignmentTable */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <AssignmentTable 
                  assignments={assignments}
                  dates={dates}
                  onEdit={handleEditAssignment}
                />
              </Box>
            </Grid>
            
            {/* 右側のコンテンツ - StaffList */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StaffList 
                  year={parseInt(year)} 
                  month={parseInt(month)} 
                  selectedWeek={selectedWeek}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </DragDropContext>
  );
} 