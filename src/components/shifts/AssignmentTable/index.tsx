'use client';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import FlightIcon from '@mui/icons-material/Flight';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import { useState, MouseEvent, useEffect } from 'react';
import { Venue, DayInfo, Assignment, SlotInfo } from '../types';
import { Droppable } from '@hello-pangea/dnd';

// セルの色定義
const CELL_COLORS = {
  none: '#ffffff',
  red: '#ffebee',   // 薄い赤
  blue: '#e3f2fd', // 薄い青
  green: '#e8f5e9', // 薄い緑
  yellow: '#fffde7', // 薄い黄
  pink: '#fce4ec'  // 薄いピンク
} as const;

type CellColor = keyof typeof CELL_COLORS;

interface CellColorInfo {
  venueId: string;
  orderId: string;
  date: string;
  color: CellColor;
}

interface CellMemoInfo {
  venueId: string;
  orderId: string;
  date: string;
  memo: string;
}

interface CellLockInfo {
  venueId: string;
  orderId: string;
  date: string;
}

interface AssignmentTableProps {
  venues: Venue[];
  days: DayInfo[];
  assignments: Assignment[];
  slots: SlotInfo[];
  onLockChange?: (locks: CellLockInfo[]) => void;
  onVenueEdit?: (venueId: string, orders: { id: string; type: string; slots: { date: string; count: number; }[]; }[]) => void;
}

export const AssignmentTable = ({
  venues,
  days,
  assignments,
  slots,
  onLockChange,
  onVenueEdit
}: AssignmentTableProps) => {
  // 右クリックメニューの状態
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    venueId: string;
    orderId: string;
    date: string;
  } | null>(null);

  // セルの色情報を管理する状態
  const [cellColors, setCellColors] = useState<CellColorInfo[]>([]);

  // メモダイアログの状態
  const [memoDialog, setMemoDialog] = useState<{
    venueId: string;
    orderId: string;
    date: string;
    open: boolean;
  }>({
    venueId: '',
    orderId: '',
    date: '',
    open: false
  });
  
  // メモの内容を管理する状態
  const [cellMemos, setCellMemos] = useState<CellMemoInfo[]>([]);
  const [currentMemo, setCurrentMemo] = useState('');

  // ロック情報を管理する状態
  const [cellLocks, setCellLocks] = useState<CellLockInfo[]>([]);

  // クリックタイマーの状態
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // 編集ダイアログの状態
  const [editDialog, setEditDialog] = useState<{
    venueId: string;
    open: boolean;
  }>({
    venueId: '',
    open: false
  });

  // 編集フォームの状態
  const [editingOrders, setEditingOrders] = useState<{
    id: string;
    type: string;
    slots: {
      date: string;
      weekday: string;
      dayType: string;
      count: number;
    }[];
  }[]>([]);

  // スロット情報を取得する関数
  const getSlotInfo = (venueId: string, orderId: string, date: string) => {
    return slots.find(slot => 
      slot.venueId === venueId && 
      slot.orderId === orderId && 
      slot.date === date
    )?.hasSlot ?? false;
  };

  // セルの色情報を取得する関数
  const getCellColor = (venueId: string, orderId: string, date: string): CellColor => {
    const colorInfo = cellColors.find(c => 
      c.venueId === venueId && 
      c.orderId === orderId && 
      c.date === date
    );
    return colorInfo?.color || 'none';
  };

  // セルのメモを取得する関数
  const getCellMemo = (venueId: string, orderId: string, date: string): string => {
    const memoInfo = cellMemos.find(m => 
      m.venueId === venueId && 
      m.orderId === orderId && 
      m.date === date
    );
    return memoInfo?.memo || '';
  };

  // セルのロック状態を取得する関数
  const getCellLock = (venueId: string, orderId: string, date: string): boolean => {
    return cellLocks.some(l => 
      l.venueId === venueId && 
      l.orderId === orderId && 
      l.date === date
    );
  };

  // 右クリックメニューを開く
  const handleContextMenu = (event: MouseEvent, venueId: string, orderId: string, date: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      venueId,
      orderId,
      date
    });
  };

  // 右クリックメニューを閉じる
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // セルの色を変更する
  const handleColorChange = (color: CellColor) => {
    if (!contextMenu) return;

    const { venueId, orderId, date } = contextMenu;
    setCellColors(prev => {
      // 既存の色情報を削除
      const filtered = prev.filter(c => 
        !(c.venueId === venueId && c.orderId === orderId && c.date === date)
      );
      
      // 'none'の場合は追加しない（デフォルト色を使用）
      if (color === 'none') {
        return filtered;
      }
      
      // 新しい色情報を追加
      return [...filtered, { venueId, orderId, date, color }];
    });
    handleContextMenuClose();
  };

  // シングルクリックハンドラー
  const handleCellClick = (venueId: string, orderId: string, date: string) => {
    if (clickTimer) {
      // ダブルクリックの場合はタイマーをクリアしてシングルクリックを防ぐ
      clearTimeout(clickTimer);
      setClickTimer(null);
      return;
    }

    // シングルクリックの場合は300ミリ秒待ってからメモダイアログを開く
    const timer = setTimeout(() => {
      const memo = getCellMemo(venueId, orderId, date);
      setCurrentMemo(memo);
      setMemoDialog({
        venueId,
        orderId,
        date,
        open: true
      });
      setClickTimer(null);
    }, 300);

    setClickTimer(timer);
  };

  // メモダイアログを閉じる
  const handleMemoDialogClose = () => {
    setMemoDialog(prev => ({ ...prev, open: false }));
    setCurrentMemo('');
  };

  // メモを保存する
  const handleMemoSave = () => {
    const { venueId, orderId, date } = memoDialog;
    setCellMemos(prev => {
      // 既存のメモを削除
      const filtered = prev.filter(m => 
        !(m.venueId === venueId && m.orderId === orderId && m.date === date)
      );
      
      // メモが空の場合は追加しない
      if (!currentMemo.trim()) {
        return filtered;
      }
      
      // 新しいメモを追加
      return [...filtered, { venueId, orderId, date, memo: currentMemo.trim() }];
    });
    handleMemoDialogClose();
  };

  // ダブルクリックハンドラー
  const handleCellDoubleClick = (venueId: string, orderId: string, date: string) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }
    
    setCellLocks(prev => {
      const isLocked = getCellLock(venueId, orderId, date);
      const newLocks = isLocked
        ? prev.filter(l => !(l.venueId === venueId && l.orderId === orderId && l.date === date))
        : [...prev, { venueId, orderId, date }];
      
      onLockChange?.(newLocks);
      return newLocks;
    });
  };

  // 平日と週末に分類する関数
  const getDayType = (weekday: string) => {
    return ['土', '日'].includes(weekday) ? '週末' : '平日';
  };

  // 編集ダイアログを開く
  const handleEditClick = (venueId: string) => {
    // 現在の会場のオーダー情報を取得
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;

    // オーダーごとの枠数情報を初期化
    const initialOrders = venue.orders.map(order => ({
      id: order.id,
      type: order.type,
      slots: days.map(day => ({
        date: day.date,
        weekday: day.weekday,
        dayType: getDayType(day.weekday),
        count: slots.filter(s => 
          s.venueId === venueId && 
          s.orderId === order.id && 
          s.date === day.date && 
          s.hasSlot
        ).length
      }))
    }));

    setEditingOrders(initialOrders);
    setEditDialog({
      venueId,
      open: true
    });
  };

  // 枠数を更新
  const handleSlotCountChange = (orderId: string, date: string, count: number) => {
    setEditingOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        slots: order.slots.map(slot => {
          if (slot.date !== date) return slot;
          return { ...slot, count: Math.max(0, count) };
        })
      };
    }));
  };

  // 編集内容を保存
  const handleEditSave = () => {
    if (onVenueEdit) {
      onVenueEdit(editDialog.venueId, editingOrders);
    }
    handleEditDialogClose();
  };

  // 編集ダイアログを閉じる
  const handleEditDialogClose = () => {
    setEditDialog(prev => ({ ...prev, open: false }));
    setEditingOrders([]); // 編集内容をクリア
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  // セルのレンダリング
  const renderCell = (venueId: string, orderId: string, date: string, rowIndex: number, colIndex: number) => {
    const hasSlot = getSlotInfo(venueId, orderId, date);
    const cellColor = getCellColor(venueId, orderId, date);
    const cellMemo = getCellMemo(venueId, orderId, date);
    const isLocked = getCellLock(venueId, orderId, date);

    return (
      <Droppable droppableId={`cell-${venueId}-${orderId}-${date}`} isDropDisabled={!hasSlot}>
        {(provided, snapshot) => (
          <TableCell
            ref={provided.innerRef}
            {...provided.droppableProps}
            onContextMenu={(e) => handleContextMenu(e, venueId, orderId, date)}
            onClick={() => handleCellClick(venueId, orderId, date)}
            sx={{
              position: 'relative',
              minWidth: 100,
              height: 60,
              padding: 0,
              backgroundColor: hasSlot ? CELL_COLORS[cellColor] : '#f5f5f5',
              border: '1px solid #e0e0e0',
              cursor: hasSlot ? 'pointer' : 'not-allowed',
              '&:hover': {
                backgroundColor: hasSlot ? `${CELL_COLORS[cellColor]}99` : '#f5f5f5',
              },
              ...(snapshot.isDraggingOver && {
                backgroundColor: hasSlot ? `${CELL_COLORS[cellColor]}99` : '#f5f5f5',
                border: '2px dashed #1976d2',
              }),
            }}
          >
            {cellMemo && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  color: '#666',
                  fontSize: '0.6rem',
                  maxWidth: '90%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {cellMemo}
              </Typography>
            )}
            {isLocked && (
              <LockIcon
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  fontSize: '1rem',
                  color: '#666',
                }}
              />
            )}
            {provided.placeholder}
          </TableCell>
        )}
      </Droppable>
    );
  };

  return (
    <TableContainer>
      <Table size="small" sx={{
        borderCollapse: 'collapse',
        width: '100%',
        '& th, & td': {
          border: '1px solid #ddd',
          padding: '4px 8px',
        }
      }}>
        {/* ヘッダー部分 */}
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ 
              ...headerStyle, 
              width: '40px', 
              minWidth: '40px',
              border: 'none',
              borderBottom: 'none'
            }}></TableCell>
            <TableCell rowSpan={2} sx={headerStyle}>代理店</TableCell>
            <TableCell rowSpan={2} sx={headerStyle}>イベント実施場所</TableCell>
            <TableCell rowSpan={2} sx={headerStyle}>オーダー</TableCell>
            {days.map(day => (
              <TableCell key={day.date} align="center" sx={headerStyle}>
                {day.weekday}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {days.map(day => (
              <TableCell key={`date-${day.date}`} align="center" sx={headerStyle}>
                {day.date}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        
        {/* ボディ部分 */}
        <TableBody>
          {venues.map(venue => (
            venue.orders.map((order, orderIndex) => (
              <TableRow key={`${venue.id}-${order.id}`}>
                {/* 編集ボタン（最初の行のみ表示） */}
                {orderIndex === 0 && (
                  <TableCell 
                    rowSpan={venue.orders.length}
                    sx={{ 
                      padding: '4px',
                      width: '40px',
                      minWidth: '40px',
                      border: 'none',
                      borderBottom: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(venue.id)}
                      sx={{ padding: '2px' }}
                    >
                      <EditIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </TableCell>
                )}

                {/* 代理店名（最初の行のみ表示） */}
                {orderIndex === 0 && (
                  <TableCell 
                    rowSpan={venue.orders.length}
                    sx={mergedCellStyle}
                  >
                    <Typography variant="body2">{venue.agency}</Typography>
                  </TableCell>
                )}
                
                {/* イベント実施場所（最初の行のみ表示） */}
                {orderIndex === 0 && (
                  <TableCell 
                    rowSpan={venue.orders.length}
                    sx={mergedCellStyle}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 0.5,
                      flexWrap: 'wrap'
                    }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{venue.location}</Typography>
                      {venue.isOutsideVenue && (
                        <PlaceIcon 
                          fontSize="small" 
                          sx={{ color: 'primary.main', fontSize: '1rem' }} 
                        />
                      )}
                      {venue.hasBusinessTrip && (
                        <FlightIcon 
                          fontSize="small" 
                          sx={{ color: 'primary.main', fontSize: '1rem' }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                )}
                
                {/* オーダー種別 */}
                <TableCell sx={{
                  ...cellStyle,
                  backgroundColor: '#ffffff',
                  minWidth: '140px',
                  whiteSpace: 'nowrap'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: order.type === 'クローザー' ? 'primary.main' : '#e91e63',
                      fontWeight: 'medium'
                    }}
                  >
                    {order.type}
                  </Typography>
                </TableCell>
                
                {/* 各日付のアサイン */}
                {days.map((day, colIndex) => {
                  const hasSlot = getSlotInfo(venue.id, order.id, day.date);
                  const dayAssignments = assignments.filter(a => 
                    a.venueId === venue.id && 
                    a.orderId === order.id && 
                    a.date === day.date
                  );
                  const cellColor = getCellColor(venue.id, order.id, day.date);
                  
                  return (
                    <TableCell 
                      key={`${venue.id}-${order.id}-${day.date}`}
                      align="center"
                      onClick={() => hasSlot && handleCellClick(venue.id, order.id, day.date)}
                      onDoubleClick={() => hasSlot && handleCellDoubleClick(venue.id, order.id, day.date)}
                      onContextMenu={(e) => handleContextMenu(e, venue.id, order.id, day.date)}
                      sx={{
                        ...cellStyle,
                        backgroundColor: !hasSlot ? '#f5f5f5' : CELL_COLORS[cellColor],
                        cursor: hasSlot ? 'pointer' : 'default',
                        position: 'relative'
                      }}
                    >
                      {hasSlot && (
                        <>
                          {getCellLock(venue.id, order.id, day.date) ? (
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(255, 255, 255, 0.7)'
                            }}>
                              <LockIcon 
                                sx={{ 
                                  fontSize: '1.5rem',
                                  color: 'primary.main',
                                  opacity: 0.8
                                }} 
                              />
                            </Box>
                          ) : null}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: 0.5,
                            position: 'relative'
                          }}>
                            {dayAssignments.map(assignment => (
                              <Box
                                key={`${assignment.staffName}-${assignment.date}`}
                                sx={{
                                  backgroundColor: order.type === 'クローザー' 
                                    ? 'rgba(25, 118, 210, 0.1)'
                                    : 'rgba(233, 30, 99, 0.1)',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                }}
                              >
                                <Typography 
                                  variant="body2"
                                  sx={{
                                    color: order.type === 'クローザー'
                                      ? 'primary.main'
                                      : '#e91e63',
                                    textAlign: 'center',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {assignment.staffName}
                                </Typography>
                              </Box>
                            ))}
                            {/* メモインジケーター */}
                            {getCellMemo(venue.id, order.id, day.date) && (
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  width: 6,
                                  height: 6,
                                  backgroundColor: 'primary.main',
                                  borderRadius: '50%'
                                }} 
                              />
                            )}
                          </Box>
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>

      {/* 右クリックメニュー */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleColorChange('none')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.none, border: '1px solid #ddd', mr: 1 }} />
          なし
        </MenuItem>
        <MenuItem onClick={() => handleColorChange('red')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.red, border: '1px solid #ddd', mr: 1 }} />
          赤
        </MenuItem>
        <MenuItem onClick={() => handleColorChange('blue')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.blue, border: '1px solid #ddd', mr: 1 }} />
          青
        </MenuItem>
        <MenuItem onClick={() => handleColorChange('green')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.green, border: '1px solid #ddd', mr: 1 }} />
          緑
        </MenuItem>
        <MenuItem onClick={() => handleColorChange('yellow')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.yellow, border: '1px solid #ddd', mr: 1 }} />
          黄
        </MenuItem>
        <MenuItem onClick={() => handleColorChange('pink')}>
          <Box sx={{ width: 16, height: 16, backgroundColor: CELL_COLORS.pink, border: '1px solid #ddd', mr: 1 }} />
          ピンク
        </MenuItem>
      </Menu>

      {/* メモダイアログ */}
      <Dialog 
        open={memoDialog.open} 
        onClose={handleMemoDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>メモ</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={3}
            value={currentMemo}
            onChange={(e) => setCurrentMemo(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="メモを入力してください"
            inputProps={{ maxLength: 100 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMemoDialogClose}>キャンセル</Button>
          <Button onClick={handleMemoSave} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog 
        open={editDialog.open} 
        onClose={handleEditDialogClose}
        PaperProps={{
          sx: {
            width: '1000px',
            maxWidth: '90vw'
          }
        }}
      >
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* 平日テーブル */}
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>
              平日
            </Typography>
            <Table size="small" sx={{ mb: 4, border: '1px solid #ddd', tableLayout: 'fixed', width: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    backgroundColor: '#f5f5f5',
                    width: '120px',
                    minWidth: '120px',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #ddd'
                  }}></TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#f5f5f5',
                    width: '80px',
                    minWidth: '80px',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #ddd',
                    textAlign: 'center'
                  }}>
                    単価
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '平日')
                    .map(slot => (
                      <TableCell 
                        key={slot.date}
                        align="center"
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          borderBottom: '2px solid #ddd',
                          padding: '4px 8px',
                          width: '80px',
                          minWidth: '80px'
                        }}
                      >
                        {slot.weekday}<br />
                        {slot.date}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  >
                    クローザー
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '平日')
                    .map(slot => (
                      <TableCell 
                        key={`closer-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === 'クローザー')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === 'クローザー');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      color: '#e91e63',
                      fontWeight: 'medium'
                    }}
                  >
                    ガール
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '平日')
                    .map(slot => (
                      <TableCell 
                        key={`girl-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === 'ガール')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === 'ガール');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'medium'
                    }}
                  >
                    無料入店
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '平日')
                    .map(slot => (
                      <TableCell 
                        key={`free-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === '無料入店')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === '無料入店');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
              </TableBody>
            </Table>

            {/* 週末テーブル */}
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>
              週末
            </Typography>
            <Table size="small" sx={{ border: '1px solid #ddd', tableLayout: 'fixed', width: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    backgroundColor: '#f5f5f5',
                    width: '120px',
                    minWidth: '120px',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #ddd'
                  }}></TableCell>
                  <TableCell sx={{ 
                    backgroundColor: '#f5f5f5',
                    width: '80px',
                    minWidth: '80px',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #ddd',
                    textAlign: 'center'
                  }}>
                    単価
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '週末')
                    .map(slot => (
                      <TableCell 
                        key={slot.date}
                        align="center"
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          borderBottom: '2px solid #ddd',
                          padding: '4px 8px',
                          width: '80px',
                          minWidth: '80px'
                        }}
                      >
                        {slot.weekday}<br />
                        {slot.date}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  >
                    クローザー
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '週末')
                    .map(slot => (
                      <TableCell 
                        key={`closer-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === 'クローザー')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === 'クローザー');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      color: '#e91e63',
                      fontWeight: 'medium'
                    }}
                  >
                    ガール
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '週末')
                    .map(slot => (
                      <TableCell 
                        key={`girl-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === 'ガール')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === 'ガール');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'medium'
                    }}
                  >
                    無料入店
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ 
                        min: 0,
                        style: { 
                          textAlign: 'center',
                          padding: '4px',
                          width: '60px'
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  {editingOrders[0]?.slots
                    .filter(slot => getDayType(slot.weekday) === '週末')
                    .map(slot => (
                      <TableCell 
                        key={`free-${slot.date}`}
                        align="center"
                        sx={{ padding: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={editingOrders.find(o => o.type === '無料入店')?.slots.find(s => s.date === slot.date)?.count ?? 0}
                          onChange={(e) => {
                            const order = editingOrders.find(o => o.type === '無料入店');
                            if (order) {
                              handleSlotCountChange(order.id, slot.date, parseInt(e.target.value) || 0);
                            }
                          }}
                          inputProps={{ 
                            min: 0,
                            style: { 
                              textAlign: 'center',
                              padding: '4px',
                              width: '40px'
                            }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ddd'
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>キャンセル</Button>
          <Button variant="contained" onClick={handleEditSave}>保存</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

// スタイル定義
const headerStyle = {
  backgroundColor: '#f5f5f5',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '60px',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem'
} as const;

const mergedCellStyle = {
  backgroundColor: '#ffffff',
  borderRight: '1px solid #ddd',
  padding: '4px 8px',
  verticalAlign: 'top',
  minWidth: '100px'
} as const;

const cellStyle = {
  padding: '4px 8px',
  verticalAlign: 'middle',
  minWidth: '60px'
} as const; 