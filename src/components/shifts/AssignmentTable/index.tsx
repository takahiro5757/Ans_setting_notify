'use client';

import { useState } from 'react';
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
  styled
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlightIcon from '@mui/icons-material/Flight';
import CancelIcon from '@mui/icons-material/Cancel';
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
  backgroundColor: isAvailable ? '#fff' : '#f5f5f5',
  position: 'relative',
  textAlign: 'center',
  padding: '8px',
  '&.dragOver': {
    backgroundColor: theme.palette.primary.light,
    opacity: 0.8,
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 5px ${theme.palette.primary.main}`,
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

export default function AssignmentTable({ assignments, dates, onEdit }: AssignmentTableProps) {
  // 状態管理
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentItem | null>(null);
  const [editedVenue, setEditedVenue] = useState<string>('');
  const [editedVenueDetail, setEditedVenueDetail] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

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
                      const bgColor = getBackgroundColor(baseAvailable, assignment.id, date.date, order.id);
                      
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
                      
                      return (
                        <Droppable
                          key={`drop-${assignment.id}-${date.date}-${order.id}`}
                          droppableId={getDroppableId(assignment.id, date.date, order.id)}
                          isDropDisabled={!isAvailable}
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
                                cursor: isAvailable ? 'default' : 'not-allowed'
                              }}
                              onMouseEnter={() => setHoveredCell(cellId)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {status && (
                                <Box sx={{ position: 'relative' }}>
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
                                </Box>
                              )}
                              {provided.placeholder}
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
    </>
  );
} 