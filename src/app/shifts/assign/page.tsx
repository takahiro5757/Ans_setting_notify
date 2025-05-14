'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Container, Typography, Grid, SelectChangeEvent, ToggleButtonGroup, ToggleButton } from '@mui/material';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import WeeklySummary from '@/components/WeeklySummary';
import StaffList from '@/components/shifts/StaffList';
import AssignmentTable from '@/components/shifts/AssignmentTable';
import { getWeeks, generateDummySummary, getAvailableWeeks } from '@/utils/dateUtils';
import { generateDates, generateDummyAssignments, generateWeekDates, generate2025AprilMayAssignments } from '@/utils/assignmentUtils';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { AssignmentItem } from '@/types/shifts';

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

  // 帯案件モード用のダミーデータを追加
  useEffect(() => {
    if (assignments.length > 0) {
      const updatedAssignments = [...assignments];
      
      // 店舗名のリスト（SB+地名+店）
      const sbStoreNames = [
        'SB大宮店', 'SB春日部店', 'SB浦和店', 'SB川口店', 'SB所沢店', 
        'SB越谷店', 'SB川越店', 'SB草加店', 'SB新座店', 'SB熊谷店'
      ];
      
      // 最初の5件に帯案件残数情報を追加（ダミーデータ）
      for (let i = 0; i < 5 && i < updatedAssignments.length; i++) {
        updatedAssignments[i] = {
          ...updatedAssignments[i],
          // 帯案件モードでは現場名をSB○○店形式に変更
          seriesVenue: sbStoreNames[i], // 帯案件用の現場名を追加
          seriesFrames: {
            totalFrames: 20,
            confirmedFrames: Math.floor(Math.random() * 20) // 0-19のランダムな数
          }
        };
      }
      
      setAssignments(updatedAssignments);
    }
  }, []); // マウント時のみ実行

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
    // 要員のドロップ処理
    else if (draggableId.startsWith('staff-')) {
      // ドロップ先のIDを解析
      const destinationId = destination.droppableId;
      const match = destinationId.match(/assignment-(.*)-date-(.*)-order-(.*)/);
      
      if (match) {
        const [, assignmentId, date, orderId] = match;
        
        // draggableIdから要員IDを抽出
        // 形式: 'staff-{id}' または 'staff-{id}-{dateValue}'
        const staffIdMatch = draggableId.match(/staff-(\d+)(?:-(.*))?/);
        
        if (staffIdMatch) {
          const staffId = staffIdMatch[1];
          const staffDateValue = staffIdMatch[2]; // 日付ごとのリストからドラッグした場合に使用
          
          console.log(`要員 ID:${staffId} を ${assignmentId} の ${date} のオーダー ${orderId} にアサインしました`);
          console.log('日付情報:', staffDateValue ? `日付ごとのリストから (${staffDateValue})` : '連日稼働可能なリストから');
          
          // 要員情報を取得（実際のアプリケーションではAPIからデータを取得する）
          const staffInfo = getStaffById(parseInt(staffId, 10));
          
          if (staffInfo) {
            // アサインメントの状態を更新
            setAssignments(prevAssignments => {
              return prevAssignments.map(assignment => {
                if (assignment.id === assignmentId) {
                  // 要員情報がない場合は初期化
                  const staff = assignment.staff || {};
                  
                  // 特定のオーダーの要員情報がない場合は初期化
                  if (!staff[orderId]) {
                    staff[orderId] = {};
                  }
                  
                  // 要員情報を設定
                  staff[orderId][date] = {
                    id: staffId,
                    name: staffInfo.name,
                    isGirl: staffInfo.isGirl,
                    isFemale: staffInfo.isFemale
                  };
                  
                  return {
                    ...assignment,
                    staff
                  };
                }
                return assignment;
              });
            });
          }
        }
      }
    }
    // 配置済み要員のドラッグ＆ドロップ処理
    else if (draggableId.startsWith('assigned-staff-')) {
      console.log("配置済み要員のドラッグ&ドロップを検出:", draggableId);
      
      // ドラッグ元とドロップ先のIDを解析
      const sourceId = source.droppableId;
      const destinationId = destination.droppableId;
      
      console.log("ドラッグ元:", sourceId);
      console.log("ドロップ先:", destinationId);
      
      const sourceMatch = sourceId.match(/assignment-(.*)-date-(.*)-order-(.*)/);
      const destMatch = destinationId.match(/assignment-(.*)-date-(.*)-order-(.*)/);
      
      if (sourceMatch && destMatch) {
        const [, sourceAssignmentId, sourceDate, sourceOrderId] = sourceMatch;
        const [, destAssignmentId, destDate, destOrderId] = destMatch;
        
        console.log("ドラッグ元情報:", {sourceAssignmentId, sourceDate, sourceOrderId});
        console.log("ドロップ先情報:", {destAssignmentId, destDate, destOrderId});
        
        // draggableIdから配置済み要員の元情報を取得
        // 形式: 'assigned-staff-{assignmentId}-{date}-{orderId}'
        const assignedStaffMatch = draggableId.match(/assigned-staff-(.*)-(.*)-(.*)/);
        
        if (assignedStaffMatch) {
          console.log("assignedStaffMatch:", assignedStaffMatch);
          
          // ドラッグ元のアサインメントとスタッフ情報を取得
          const sourceAssignment = assignments.find(a => a.id === sourceAssignmentId);
          const sourceStaff = sourceAssignment?.staff?.[sourceOrderId]?.[sourceDate];
          
          console.log("ドラッグ元アサインメント:", sourceAssignment?.id);
          console.log("ドラッグ元スタッフ:", sourceStaff);
          
          if (sourceStaff) {
            console.log('移動元スタッフ情報:', sourceStaff);
            
            // 更新用にアサインメントの深いコピーを作成
            const updatedAssignments = JSON.parse(JSON.stringify(assignments));
            
            // ドラッグ元とドロップ先が異なる場合（同じセル内でのドラッグは無視）
            if (sourceAssignmentId !== destAssignmentId || sourceDate !== destDate || sourceOrderId !== destOrderId) {
              // ドラッグ元の情報を取得
              const sourceAssignmentIdx = updatedAssignments.findIndex((a: AssignmentItem) => a.id === sourceAssignmentId);
              
              // ドロップ先の情報を取得
              const destAssignmentIdx = updatedAssignments.findIndex((a: AssignmentItem) => a.id === destAssignmentId);
              
              console.log("ソースインデックス:", sourceAssignmentIdx);
              console.log("目的地インデックス:", destAssignmentIdx);
              
              if (sourceAssignmentIdx !== -1 && destAssignmentIdx !== -1) {
                // ドロップ先のスタッフの初期化（必要な場合）
                if (!updatedAssignments[destAssignmentIdx].staff) {
                  updatedAssignments[destAssignmentIdx].staff = {};
                }
                if (!updatedAssignments[destAssignmentIdx].staff[destOrderId]) {
                  updatedAssignments[destAssignmentIdx].staff[destOrderId] = {};
                }
                
                // ドロップ先にすでに配置されているスタッフを取得（入れ替え用）
                const destStaff = updatedAssignments[destAssignmentIdx].staff?.[destOrderId]?.[destDate];
                console.log("ドロップ先スタッフ:", destStaff);
                
                // ドラッグ元からスタッフを削除する前に、まずドロップ先のスタッフを保存（入れ替え用）
                const tempDestStaff = destStaff ? { ...destStaff } : null;
                
                // ドラッグ元のスタッフをドロップ先に設定（完全なコピーを確保）
                updatedAssignments[destAssignmentIdx].staff[destOrderId][destDate] = {
                  id: sourceStaff.id,
                  name: sourceStaff.name,
                  isGirl: sourceStaff.isGirl,
                  isFemale: sourceStaff.isFemale
                };
                
                // ドラッグ元のスタッフ情報を削除
                if (updatedAssignments[sourceAssignmentIdx].staff && 
                    updatedAssignments[sourceAssignmentIdx].staff[sourceOrderId]) {
                  delete updatedAssignments[sourceAssignmentIdx].staff[sourceOrderId][sourceDate];
                }
                
                // 入れ替え: 保存しておいたドロップ先のスタッフをドラッグ元に設定（存在する場合のみ）
                if (tempDestStaff) {
                  // ドラッグ元のスタッフの初期化（必要な場合）
                  if (!updatedAssignments[sourceAssignmentIdx].staff) {
                    updatedAssignments[sourceAssignmentIdx].staff = {};
                  }
                  if (!updatedAssignments[sourceAssignmentIdx].staff[sourceOrderId]) {
                    updatedAssignments[sourceAssignmentIdx].staff[sourceOrderId] = {};
                  }
                  
                  // 完全なコピーを確保
                  updatedAssignments[sourceAssignmentIdx].staff[sourceOrderId][sourceDate] = {
                    id: tempDestStaff.id,
                    name: tempDestStaff.name,
                    isGirl: tempDestStaff.isGirl,
                    isFemale: tempDestStaff.isFemale
                  };
                  
                  console.log(`要員 "${sourceStaff.name}" を移動しました: ${sourceAssignmentId}/${sourceDate}/${sourceOrderId} -> ${destAssignmentId}/${destDate}/${destOrderId}`);
                  console.log(`要員 "${tempDestStaff.name}" を入れ替えました: ${destAssignmentId}/${destDate}/${destOrderId} -> ${sourceAssignmentId}/${sourceDate}/${sourceOrderId}`);
                } else {
                  // 移動のみ（入れ替えなし）の場合
                  console.log(`要員 "${sourceStaff.name}" を移動しました: ${sourceAssignmentId}/${sourceDate}/${sourceOrderId} -> ${destAssignmentId}/${destDate}/${destOrderId}`);
                }
                
                // 状態を更新
                setAssignments(updatedAssignments);
              } else {
                console.error("ソースまたは目的地のインデックスが見つかりません");
              }
            } else {
              console.log("同じセル内でのドラッグなので無視します");
            }
          } else {
            console.error("ドラッグ元のスタッフ情報が見つかりません");
          }
        } else {
          console.error("assigned-staff- IDのパターンマッチに失敗しました");
        }
      } else {
        console.error("ソースまたは目的地IDのパターンマッチに失敗しました");
      }
    } else {
      console.log("未知のドラッグ&ドロップタイプ:", draggableId);
    }
  }, [assignments]);

  // ダミーの要員データを取得する関数（実際のアプリケーションではAPIからデータを取得する）
  const getStaffById = (id: number) => {
    // StaffListコンポーネントで使用されているスタッフデータと同じものを取得
    // このデータは通常はAPIから取得するが、今回はダミーデータを使用
    const staffData = [
      // クローザー
      { id: 1, name: '荒川拓実', isGirl: false, isFemale: false },
      { id: 2, name: '山中翔', isGirl: false, isFemale: false },
      { id: 3, name: '猪本留渚', isGirl: false, isFemale: true },
      { id: 4, name: '吉岡海', isGirl: false, isFemale: false },
      { id: 5, name: '岩田咲海', isGirl: false, isFemale: true },
      { id: 6, name: '林宏樹', isGirl: false, isFemale: false },
      { id: 7, name: '齋藤涼花', isGirl: false, isFemale: true },
      { id: 8, name: '水谷亮介', isGirl: false, isFemale: false },
      { id: 9, name: '大久保卓哉', isGirl: false, isFemale: false },
      { id: 10, name: '佐藤孝郁', isGirl: false, isFemale: false },
      { id: 11, name: '富岡勇太', isGirl: false, isFemale: false },
      { id: 12, name: '髙橋愛結奈', isGirl: false, isFemale: true },
      { id: 13, name: '和田美優', isGirl: false, isFemale: false },
      { id: 14, name: '中島悠喜', isGirl: false, isFemale: false },
      { id: 15, name: '石谷直斗', isGirl: false, isFemale: false },
      
      // ガール
      { id: 16, name: '柴李佐紅', isGirl: true, isFemale: true },
      { id: 17, name: '佐藤祐未', isGirl: true, isFemale: true },
      { id: 18, name: '石嶋瑠花', isGirl: true, isFemale: true },
      { id: 19, name: '岸川明日菜', isGirl: true, isFemale: true },
      { id: 20, name: '山岸莉子', isGirl: true, isFemale: true },
      
      // 追加データ
      { id: 21, name: '森田来美', isGirl: false, isFemale: false },
      { id: 22, name: '須郷瑠斗', isGirl: false, isFemale: false },
      { id: 23, name: '大滝晴香', isGirl: true, isFemale: true },
      { id: 24, name: '山下千尋', isGirl: true, isFemale: true },
      { id: 25, name: '小林希歩', isGirl: true, isFemale: true },
      { id: 26, name: '飯塚ひかり', isGirl: true, isFemale: true },
      { id: 27, name: '森保勇生', isGirl: false, isFemale: false },
      { id: 28, name: '須貝真奈美', isGirl: true, isFemale: true },
      { id: 29, name: '森保大地', isGirl: false, isFemale: false },
      { id: 30, name: '宮日向', isGirl: false, isFemale: true },
      { id: 31, name: '中川ひかる', isGirl: true, isFemale: true },
      { id: 32, name: '美濃部椋太', isGirl: false, isFemale: false },
      { id: 33, name: '白畑龍弥', isGirl: false, isFemale: false },
      { id: 34, name: '長崎敬太', isGirl: false, isFemale: false },
      { id: 35, name: '安面遥夏', isGirl: true, isFemale: true },
      { id: 36, name: '加瀬悠貴', isGirl: false, isFemale: false },
      { id: 37, name: '篠知隆', isGirl: false, isFemale: false },
      { id: 38, name: '小林天音', isGirl: true, isFemale: true },
      { id: 39, name: '安藤心優', isGirl: true, isFemale: true },
      { id: 40, name: '水谷新菜', isGirl: true, isFemale: true }
    ];
    
    return staffData.find(staff => staff.id === id);
  };

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
          py: 1
        }}
      >
        {/* メインコンテンツエリア */}
        <Box sx={{ position: 'relative' }}>
          {/* 週別サマリー（右上に固定） - 上に移動 */}
          <Box sx={{ 
            position: 'absolute', 
            top: 5, // ヘッダーにかぶらないように正の値に変更
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

          {/* 年月・週選択＋表示切替ボタンをまとめてラップ */}
          <Box sx={{ display: 'inline-block' }}>
            {/* 年月・週選択を横並びで配置 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'flex-end', flexWrap: 'nowrap', height: '58px' }}>
              <YearMonthSelector
                year={year}
                month={month}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
              />
              <Box sx={{ mx: 1 }}>
                <WeekSelector 
                  selectedWeek={selectedWeek}
                  onChange={(week) => setSelectedWeek(week)}
                  year={year}
                  month={month}
                />
              </Box>
            </Box>
            {/* 表示切替ボタンを下に左寄せで配置 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, mt: 5 }}>
              <Box sx={{
                borderRadius: 1,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                display: 'inline-block',
                height: '36px',
                alignSelf: 'center'
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
                      px: 2,
                      width: '80px',
                      height: '36px',
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
                    通常
                  </ToggleButton>
                  <ToggleButton 
                    value="series" 
                    aria-label="帯案件" 
                    sx={{ 
                      px: 2,
                      width: '80px',
                      height: '36px',
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
                    帯案件
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Box>

          {/* メインコンテンツ - グリッドレイアウト */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 左側のコンテンツ - AssignmentTable */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <AssignmentTable 
                  assignments={assignments}
                  dates={dates}
                  onEdit={handleEditAssignment}
                  displayMode={displayMode}
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