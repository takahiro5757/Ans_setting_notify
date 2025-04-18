'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  styled,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightIcon from '@mui/icons-material/Flight';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { Droppable } from '@hello-pangea/dnd';

// スタイル付きコンポーネント
const StyledTableContainer = styled('div')(({ theme }) => ({
  maxHeight: 'calc(100vh - 250px)',
  overflowY: 'auto',
  '& .MuiTableCell-root': {
    padding: '8px',
    fontSize: '0.875rem',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderRight: '1px solid rgba(224, 224, 224, 0.5)',
  borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
  '&:last-child': {
    borderRight: 'none',
  },
}));

const HeaderCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  fontWeight: 'bold',
  position: 'sticky',
  top: 0,
  zIndex: 2,
}));

// styled componentsでカスタムpropsを使用するための型定義
interface DroppableCellProps {
  isAvailable: boolean;
}

interface OrderCellProps {
  isGirl: boolean;
}

const DroppableCell = styled(StyledTableCell, {
  shouldForwardProp: (prop) => prop !== 'isAvailable' && prop !== 'isGirl'
})<{ isAvailable?: boolean; isGirl?: boolean }>(({ theme, isAvailable, isGirl }) => ({
  width: '100px',
  height: '50px',
  minHeight: '50px',
  maxHeight: '50px',
  backgroundColor: isAvailable ? '#fff' : '#f5f5f5',
  position: 'relative',
  textAlign: 'center',
  padding: '8px',
  boxSizing: 'border-box',
  transition: 'background-color 0.2s ease',
  '&.dragOver': {
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
  }
}));

const VenueCell = styled(StyledTableCell)(({ theme }) => ({
  maxWidth: '250px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const AgencyCell = styled(StyledTableCell)(({ theme }) => ({
  width: '100px',
}));

const OrderCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isGirl'
})<{ isGirl?: boolean }>(({ theme, isGirl }) => ({
  width: '100px',
  color: isGirl ? '#e91e63' : '#2196f3',
  borderRight: '1px solid rgba(224, 224, 224, 0.5)',
  borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
}));

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
  statuses?: {
    [orderId: string]: {
      [date: string]: string;
    };
  };
  // メモ情報を追加
  memos?: {
    [orderId: string]: {
      [date: string]: {
        id: string;
        text: string;
        timestamp: string;
        user: string;
      }[];
    };
  };
  // ロック情報を追加
  locks?: {
    [orderId: string]: {
      [date: string]: boolean;
    };
  };
}

interface AssignmentTableProps {
  assignments: AssignmentItem[];
  dates: {
    date: string;
    dayOfWeek: string;
    display: string;
  }[];
  onEdit?: (assignment: AssignmentItem) => void;
}

// 追加
function getBackgroundColor(isAvailable: boolean, assignmentId: string, date: string, orderId: string): string {
  if (!isAvailable) return '#f5f5f5';
  
  // 一貫性のあるランダム値を生成（同じ入力に対して同じ結果が返る）
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  
  const hash = hashCode(`${assignmentId}-${date}-${orderId}`);
  // 70%の確率で白、30%の確率で灰色
  return (hash % 10 < 7) ? '#fff' : '#f9f9f9';
}

// セルが利用可能かどうかを判断する関数を追加
function isCellAvailable(baseAvailability: boolean, assignmentId: string, date: string, orderId: string): boolean {
  // 基本的な利用可能性が false なら利用不可
  if (!baseAvailability) return false;
  
  // 灰色セルも利用不可に設定
  const bgColor = getBackgroundColor(true, assignmentId, date, orderId);
  return bgColor === '#fff'; // 白いセルのみ利用可能
}

// ステータス表示用のスタイル付きコンポーネント
const StatusChip = styled('div')<{ status: string }>(({ theme, status }) => {
  // ステータスに応じた色を設定
  let bgColor = '';
  let textColor = '#fff';
  
  switch (status) {
    case 'absent':
      bgColor = '#ff8a80'; // 欠勤用の赤
      break;
    case 'tm':
      bgColor = '#90caf9'; // TM用の青
      break;
    case 'selected':
      bgColor = '#dce775'; // 選択中用の黄緑
      textColor = '#000';
      break;
    default:
      bgColor = 'transparent';
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
    width: '90%',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    height: '24px',
    lineHeight: '16px',
  };
});

// 削除ボタン用のスタイル
const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  padding: '2px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
  zIndex: 10,
  display: 'none',
}));

// セル内に表示するステータスを取得する関数
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'absent':
      return '欠勤';
    case 'tm':
      return 'TM';
    case 'selected':
      return '選択中';
    default:
      return '';
  }
};

// セル内のコンテンツ用のスタイル
const CellContent = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

// メモ内のテキストをフォーマットする関数
const formatMemoText = (memos: any[]): string => {
  if (!memos || memos.length === 0) return '';
  
  // 最新のメモを上に表示
  const sortedMemos = [...memos].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // 3件までを表示
  const displayMemos = sortedMemos.slice(0, 3);
  
  return displayMemos.map(memo => 
    `${new Date(memo.timestamp).toLocaleDateString()} ${memo.user}:\n${memo.text}`
  ).join('\n\n');
};

// セル内にロックアイコンを表示するためのスタイル
const LockIconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
}));

export default function AssignmentTable({ assignments, dates, onEdit }: AssignmentTableProps) {
  // 状態管理
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentItem | null>(null);
  const [editedVenue, setEditedVenue] = useState<string>('');
  const [editedVenueDetail, setEditedVenueDetail] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  // メモポップアップ用の状態
  const [memoAnchorEl, setMemoAnchorEl] = useState<HTMLElement | null>(null);
  const [memoPopupPosition, setMemoPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [memoText, setMemoText] = useState<string>('');
  const [currentMemoCell, setCurrentMemoCell] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // クリックタイマー（シングルクリックとダブルクリックを区別するため）
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  
  // メモポップアップの開閉状態
  const isMemoOpen = Boolean(memoPopupPosition);
  
  // 右クリックメニュー用の状態
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // カラーピッカーダイアログの状態
  const [colorDialog, setColorDialog] = useState(false);
  const [selectedCellForColor, setSelectedCellForColor] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // 編集履歴ダイアログの状態
  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedCellForHistory, setSelectedCellForHistory] = useState<{
    assignmentId: string;
    date: string;
    orderId: string;
  } | null>(null);
  
  // カスタムセル色の状態
  const [customCellColors, setCustomCellColors] = useState<{
    [key: string]: string;
  }>({});
  
  // メモポップアップを開く - クリックイベントハンドラ
  const handleCellClick = (
    event: React.MouseEvent<HTMLElement>,
    assignmentId: string,
    date: string,
    orderId: string
  ) => {
    console.log('=== Cell Click ===');
    console.log('Target:', event.currentTarget);
    console.log('Assignment ID:', assignmentId);
    console.log('Date:', date);
    console.log('Order ID:', orderId);
    
    event.preventDefault();
    
    // セルがロックされている場合はクリックを無視
    const isLocked = assignments.find(a => a.id === assignmentId)?.locks?.[orderId]?.[date] || false;
    if (isLocked) {
      console.log('Cell is locked, ignoring click');
      return;
    }
    
    // クリックカウントを増加
    clickCountRef.current += 1;
    console.log('Click count:', clickCountRef.current);
    
    // マウスイベントの位置を保存
    const clickPosition = {
      top: event.clientY,
      left: event.clientX
    };
    
    // シングルクリックかダブルクリックかを判定するタイマーをセット
    if (clickTimerRef.current === null) {
      console.log('Setting click timer');
      clickTimerRef.current = setTimeout(() => {
        console.log('Timer fired, click count:', clickCountRef.current);
        // シングルクリックの場合
        if (clickCountRef.current === 1) {
          // メモポップアップを開く
          console.log('Single click detected - opening memo popup');
          console.log('Setting popup position:', clickPosition);
          setMemoPopupPosition(clickPosition);
          setCurrentMemoCell({ assignmentId, date, orderId });
          setMemoText('');
          console.log('Memo popup state (isMemoOpen):', Boolean(clickPosition));
        }
        // カウンタとタイマーをリセット
        clickCountRef.current = 0;
        clickTimerRef.current = null;
      }, 250);
    }
  };
  
  // セルのダブルクリックハンドラ - ロック切り替え
  const handleCellDoubleClick = (
    event: React.MouseEvent<HTMLElement>,
    assignmentId: string, 
    date: string, 
    orderId: string
  ) => {
    console.log('=== Double Click ===');
    event.preventDefault();
    event.stopPropagation();
    
    // ダブルクリックの場合は、タイマーをクリアしてシングルクリックのアクションを防止
    if (clickTimerRef.current) {
      console.log('Clearing click timer for double click');
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    // カウンタをリセット
    clickCountRef.current = 0;
    
    // セルのロック状態を切り替え
    console.log('Double click detected - toggling lock state');
    toggleCellLock(assignmentId, date, orderId);
  };
  
  // セルのロック状態を切り替える
  const toggleCellLock = (assignmentId: string, date: string, orderId: string) => {
    if (!onEdit) return;
    
    const targetAssignment = assignments.find(a => a.id === assignmentId);
    
    if (targetAssignment) {
      // 深いコピーを作成
      const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
      
      // ロック情報がない場合は初期化
      if (!updatedAssignment.locks) {
        updatedAssignment.locks = {};
      }
      
      // 特定のオーダーのロック情報がない場合は初期化
      if (!updatedAssignment.locks[orderId]) {
        updatedAssignment.locks[orderId] = {};
      }
      
      // ロック状態を切り替え
      updatedAssignment.locks[orderId][date] = !updatedAssignment.locks[orderId][date];
      
      // 更新を適用
      onEdit(updatedAssignment);
    }
  };
  
  // メモポップアップを閉じる
  const handleCloseMemoPopup = () => {
    console.log('Closing memo popup');
    setMemoPopupPosition(null);
    setCurrentMemoCell(null);
  };
  
  // メモを送信
  const handleSendMemo = () => {
    if (!currentMemoCell || !memoText.trim() || !onEdit) return;
    
    const { assignmentId, date, orderId } = currentMemoCell;
    const targetAssignment = assignments.find(a => a.id === assignmentId);
    
    if (targetAssignment) {
      // 深いコピーを作成
      const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
      
      // メモ情報がない場合は初期化
      if (!updatedAssignment.memos) {
        updatedAssignment.memos = {};
      }
      
      // 特定のオーダーのメモ情報がない場合は初期化
      if (!updatedAssignment.memos[orderId]) {
        updatedAssignment.memos[orderId] = {};
      }
      
      // 特定の日付のメモリストがない場合は初期化
      if (!updatedAssignment.memos[orderId][date]) {
        updatedAssignment.memos[orderId][date] = [];
      }
      
      // 新しいメモを追加
      const memos = updatedAssignment.memos[orderId][date];
      memos.push({
        id: `memo-${Date.now()}`,
        text: memoText,
        timestamp: new Date().toISOString(),
        user: '現在のユーザー' // 実際のユーザー情報に置き換える
      });
      
      // 更新を適用
      onEdit(updatedAssignment);
      
      // 入力フィールドをクリア
      setMemoText('');
    }
  };
  
  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

  // メモポップアップの開閉状態を監視
  useEffect(() => {
    console.log('Memo popup state changed:', isMemoOpen);
    console.log('Popup position:', memoPopupPosition);
    console.log('Current memo cell:', currentMemoCell);
  }, [isMemoOpen, memoPopupPosition, currentMemoCell]);

  // 編集ダイアログを開く
  const handleOpenEditDialog = (assignment: AssignmentItem) => {
    setCurrentAssignment(assignment);
    setEditedVenue(assignment.venue);
    setEditedVenueDetail(assignment.venueDetail);
    setEditDialogOpen(true);
  };

  // 編集ダイアログを閉じる
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAssignment(null);
  };

  // 編集を保存
  const handleSaveEdit = () => {
    if (currentAssignment && onEdit) {
      const updatedAssignment = {
        ...currentAssignment,
        venue: editedVenue,
        venueDetail: editedVenueDetail,
      };
      onEdit(updatedAssignment);
    }
    handleCloseEditDialog();
  };

  // 利用可能日のドロップ領域IDを生成
  const getDroppableId = (assignmentId: string, date: string, orderId: string) => {
    return `assignment-${assignmentId}-date-${date}-order-${orderId}`;
  };

  // セルからステータスを削除する関数
  const handleRemoveStatus = (assignmentId: string, date: string, orderId: string) => {
    // ステータスの削除処理を実装
    if (onEdit) {
      const targetAssignment = assignments.find(a => a.id === assignmentId);
      if (targetAssignment && targetAssignment.statuses?.[orderId]?.[date]) {
        // 深いコピーを作成
        const updatedAssignment = JSON.parse(JSON.stringify(targetAssignment));
        
        // 該当するステータスを削除
        delete updatedAssignment.statuses[orderId][date];
        
        // 更新を適用
        onEdit(updatedAssignment);
      }
    }
  };

  // 右クリックハンドラー
  const handleContextMenu = (
    event: React.MouseEvent,
    assignmentId: string,
    date: string,
    orderId: string
  ) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      assignmentId,
      date,
      orderId
    });
  };
  
  // 右クリックメニューを閉じる
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // 編集履歴を表示
  const handleOpenHistory = () => {
    if (contextMenu) {
      setSelectedCellForHistory({
        assignmentId: contextMenu.assignmentId,
        date: contextMenu.date,
        orderId: contextMenu.orderId
      });
      setHistoryDialog(true);
      handleCloseContextMenu();
    }
  };
  
  // 編集履歴ダイアログを閉じる
  const handleCloseHistoryDialog = () => {
    setHistoryDialog(false);
    setSelectedCellForHistory(null);
  };
  
  // セル色変更ダイアログを開く
  const handleOpenColorDialog = () => {
    if (contextMenu) {
      setSelectedCellForColor({
        assignmentId: contextMenu.assignmentId,
        date: contextMenu.date,
        orderId: contextMenu.orderId
      });
      setColorDialog(true);
      handleCloseContextMenu();
    }
  };
  
  // セル色変更ダイアログを閉じる
  const handleCloseColorDialog = () => {
    setColorDialog(false);
    setSelectedCellForColor(null);
  };
  
  // セルの色を変更する
  const handleChangeColor = (color: string) => {
    if (selectedCellForColor) {
      const cellId = `${selectedCellForColor.assignmentId}-${selectedCellForColor.date}-${selectedCellForColor.orderId}`;
      setCustomCellColors({
        ...customCellColors,
        [cellId]: color
      });
      handleCloseColorDialog();
    }
  };
  
  // セルの背景色を取得（カスタム色があればそれを優先）
  const getCellBackgroundColor = (assignmentId: string, date: string, orderId: string, isAvailable: boolean) => {
    const cellId = `${assignmentId}-${date}-${orderId}`;
    if (customCellColors[cellId]) {
      return customCellColors[cellId];
    }
    return getBackgroundColor(isAvailable, assignmentId, date, orderId);
  };

  return (
    <>
      <Paper>
        <StyledTableContainer>
          <Table stickyHeader aria-label="アサイン表">
            <TableHead>
              <TableRow>
                <HeaderCell>編集</HeaderCell>
                <HeaderCell>代理店</HeaderCell>
                <HeaderCell>イベント実施場所</HeaderCell>
                <HeaderCell>オーダー</HeaderCell>
                {dates.map((date) => (
                  <HeaderCell key={date.date} align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {date.dayOfWeek}
                    </Typography>
                    <Typography variant="body2">
                      {date.display}
                    </Typography>
                  </HeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                assignment.orders.map((order, orderIndex) => (
                  <TableRow key={`${assignment.id}-${order.id}`}>
                    {orderIndex === 0 && (
                      <>
                        <StyledTableCell 
                          rowSpan={assignment.orders.length} 
                          align="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(assignment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </StyledTableCell>
                        <AgencyCell rowSpan={assignment.orders.length}>
                          {assignment.agency}
                        </AgencyCell>
                        <VenueCell rowSpan={assignment.orders.length}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" noWrap title={assignment.venueDetail}>
                              {assignment.venue}
                            </Typography>
                            {assignment.hasTrip && (
                              <FlightIcon 
                                color="primary" 
                                fontSize="small" 
                                sx={{ ml: 0.5 }}
                                titleAccess="出張あり"
                              />
                            )}
                            {assignment.isOutdoor && (
                              <LocationOnIcon 
                                color="error" 
                                fontSize="small" 
                                sx={{ ml: 0.5 }}
                                titleAccess="外現場"
                              />
                            )}
                          </Box>
                        </VenueCell>
                      </>
                    )}
                    <OrderCell 
                      isGirl={order.isGirl}
                    >
                      {order.name}
                    </OrderCell>
                    {dates.map((date) => {
                      // 基本的な利用可能性を確認
                      const baseAvailable = assignment.availability[date.date] === true;
                      
                      // 背景色を決定
                      const bgColor = getCellBackgroundColor(assignment.id, date.date, order.id, baseAvailable);
                      
                      // セルが実際に利用可能かどうかを判断
                      const isAvailable = isCellAvailable(baseAvailable, assignment.id, date.date, order.id);
                      
                      // デバッグ用ログを追加（開発時のみ表示）
                      if (process.env.NODE_ENV !== 'production' && orderIndex === 0) {
                        console.log(`Assignment: ${assignment.id}, Date: ${date.date}, Available: ${isAvailable}, Color: ${bgColor}`);
                      }
                      
                      // セルのステータスを取得
                      const status = assignment.statuses?.[order.id]?.[date.date] || '';
                      
                      // セルのユニークID
                      const cellId = `cell-${assignment.id}-${date.date}-${order.id}`;
                      
                      // セルのロック状態を取得
                      const isLocked = assignment.locks?.[order.id]?.[date.date] || false;
                      
                      // セルのメモリストを取得
                      const memos = assignment.memos?.[order.id]?.[date.date] || [];
                      
                      return (
                        <Droppable
                          key={`drop-${assignment.id}-${date.date}-${order.id}`}
                          droppableId={getDroppableId(assignment.id, date.date, order.id)}
                          isDropDisabled={!isAvailable || isLocked}
                        >
                          {(provided, snapshot) => (
                            <DroppableCell
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              isAvailable={baseAvailable}
                              isGirl={order.isGirl}
                              className={snapshot.isDraggingOver ? 'dragOver' : ''}
                              sx={{ 
                                backgroundColor: bgColor,
                                cursor: isAvailable && !isLocked ? 'default' : 'not-allowed'
                              }}
                              onMouseEnter={() => setHoveredCell(cellId)}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={(e) => handleCellClick(e, assignment.id, date.date, order.id)}
                              onDoubleClick={(e) => handleCellDoubleClick(e, assignment.id, date.date, order.id)}
                              onContextMenu={(e) => handleContextMenu(e, assignment.id, date.date, order.id)}
                            >
                              {isLocked && (
                                <LockIconWrapper>
                                  <Tooltip title="このセルはロックされています">
                                    <LockIcon 
                                      color="primary" 
                                      fontSize="medium" 
                                      sx={{ opacity: 0.85 }} 
                                    />
                                  </Tooltip>
                                </LockIconWrapper>
                              )}
                              <CellContent>
                                {status && (
                                  <Box sx={{ position: 'relative', width: '100%' }}>
                                    <Tooltip
                                      title={`ステータス: ${getStatusDisplay(status)}`}
                                      arrow
                                      placement="top"
                                    >
                                      <StatusChip status={status}>
                                        {getStatusDisplay(status)}
                                        <DeleteButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveStatus(assignment.id, date.date, order.id);
                                          }}
                                          sx={{
                                            display: hoveredCell === cellId ? 'flex' : 'none'
                                          }}
                                        >
                                          <CancelIcon color="error" />
                                        </DeleteButton>
                                      </StatusChip>
                                    </Tooltip>
                                  </Box>
                                )}
                                {memos.length > 0 && (
                                  <Tooltip 
                                    title={
                                      <div style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }}>
                                        <Typography variant="body2" fontWeight="bold">
                                          {memos.length > 1 ? `${memos.length}件のメモ` : 'メモ'}
                                        </Typography>
                                        <Typography variant="body2">
                                          {formatMemoText(memos)}
                                        </Typography>
                                        {memos.length > 3 && (
                                          <Typography variant="caption" color="text.secondary">
                                            他 {memos.length - 3} 件のメモがあります
                                          </Typography>
                                        )}
                                      </div>
                                    }
                                    arrow
                                    placement="top"
                                    PopperProps={{
                                      modifiers: [
                                        {
                                          name: 'preventOverflow',
                                          options: {
                                            boundary: 'window',
                                          },
                                        },
                                      ],
                                    }}
                                  >
                                    <Box 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: '2px', 
                                        right: '2px',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: 'primary.main',
                                        opacity: 0.7,
                                        cursor: 'pointer'
                                      }} 
                                    />
                                  </Tooltip>
                                )}
                              </CellContent>
                              <div style={{ display: 'none' }}>{provided.placeholder}</div>
                            </DroppableCell>
                          )}
                        </Droppable>
                      );
                    })}
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>

      {/* メモポップアップ */}
      {memoPopupPosition && (
        <div
          style={{
            position: 'fixed',
            top: `${memoPopupPosition.top + 10}px`,
            left: `${memoPopupPosition.left}px`,
            zIndex: 1300,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            backgroundColor: 'white',
            width: '320px',
            padding: '16px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              メモ
            </Typography>
            <IconButton size="small" onClick={handleCloseMemoPopup}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* メモリスト */}
          {currentMemoCell && (() => {
            const targetAssignment = assignments.find(a => a.id === currentMemoCell.assignmentId);
            const memoList = targetAssignment?.memos?.[currentMemoCell.orderId]?.[currentMemoCell.date] || [];
            return memoList.length > 0 ? (
              <List sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {memoList.map((memo) => (
                  <ListItem alignItems="flex-start" key={memo.id} sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {memo.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(memo.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                          {memo.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                このセルにはまだメモがありません。
              </Typography>
            );
          })()}
          
          <Divider sx={{ my: 1 }} />
          
          {/* メモ入力フォーム */}
          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="メモを入力..."
              multiline
              maxRows={3}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={handleSendMemo}
                      disabled={!memoText.trim()}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </div>
      )}

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>イベント情報編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="イベント実施場所"
            type="text"
            fullWidth
            variant="outlined"
            value={editedVenue}
            onChange={(e) => setEditedVenue(e.target.value)}
          />
          <TextField
            margin="dense"
            label="詳細情報"
            type="text"
            fullWidth
            variant="outlined"
            value={editedVenueDetail}
            onChange={(e) => setEditedVenueDetail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>キャンセル</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 右クリックメニュー */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleOpenHistory}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>編集履歴</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenColorDialog}>
          <ListItemIcon>
            <ColorLensIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>セル色変更</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* 編集履歴ダイアログ */}
      <Dialog
        open={historyDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編集履歴</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCellForHistory && 
              `${dates.find(d => d.date === selectedCellForHistory.date)?.display || selectedCellForHistory.date} / 
              ${assignments.find(a => a.id === selectedCellForHistory.assignmentId)?.orders.find(o => o.id === selectedCellForHistory.orderId)?.name || '不明'}`
            }
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="田中 太郎" 
                secondary="2023/11/01 14:30 - ステータスを「不在」に変更" 
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="山田 花子" 
                secondary="2023/11/01 10:15 - メモを追加: 「当日までに調整」" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
      
      {/* セル色変更ダイアログ */}
      <Dialog
        open={colorDialog}
        onClose={handleCloseColorDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>セル色変更</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedCellForColor && 
              `${dates.find(d => d.date === selectedCellForColor.date)?.display || selectedCellForColor.date} / 
              ${assignments.find(a => a.id === selectedCellForColor.assignmentId)?.orders.find(o => o.id === selectedCellForColor.orderId)?.name || '不明'}`
            }
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {['#ffffff', '#f5f5f5', '#e3f2fd', '#e8f5e9', '#fff3e0', '#ffebee', '#f3e5f5'].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: color,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                  },
                }}
                onClick={() => handleChangeColor(color)}
              />
            ))}
          </Box>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ mt: 2 }}
            onClick={() => {
              if (selectedCellForColor) {
                const cellId = `${selectedCellForColor.assignmentId}-${selectedCellForColor.date}-${selectedCellForColor.orderId}`;
                const newColors = {...customCellColors};
                delete newColors[cellId];
                setCustomCellColors(newColors);
                handleCloseColorDialog();
              }
            }}
          >
            デフォルトに戻す
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseColorDialog}>キャンセル</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 