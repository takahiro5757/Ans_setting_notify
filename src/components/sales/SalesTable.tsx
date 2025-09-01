'use client';

import React, { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Grid,
  Checkbox,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
} from '@mui/icons-material';

// 分離したコンポーネントをインポート
import CommunicationPanel from './CommunicationPanel';
import LocationReservationModal from './LocationReservationModal';
import SalesDetailDrawer from './SalesDetailDrawer';
import AddRecordDialog from './AddRecordDialog';
import SelectionPopups from './SelectionPopups';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// 型定義
type EventType = 'mall' | 'external_sales' | 'in_store';

// イベント特性のラベル表示用
const getEventTypeLabel = (eventType: EventType): string => {
  switch (eventType) {
    case 'mall': return 'モール';
    case 'external_sales': return '外販';
    case 'in_store': return '店内';
    default: return eventType;
  }
};

interface SalesRecord {
  id: number;
  assignedUser: string;
  updatedUser: string;
  status: '起票' | '連絡前' | '連絡済' | '連絡不要' | 'お断り';
  agency: string;
  detailStatus: '未登録' | '公開済み';
  schedule: boolean[]; // 7日分のスケジュール（火曜日スタート）
  dayType: '平日' | '週末';
  isBandProject: boolean;
  bandWorkDays?: number;
  
  // 詳細情報
  eventLocation: string;
  locationDetail: string;
  managerName: string;
  managerPhone: string;
  hostStore: string[]; // 連名店舗を配列に変更
  partnerStores: string[]; // 連名店舗を配列に変更
  eventType: EventType; // 🆕 イベント特性
  flags: {
    hasLocationReservation: boolean;
    isExternalVenue: boolean;
    hasBusinessTrip: boolean;
    requiresDirector: boolean; // 🆕 ディレクター必須フラグ
  };
  
  // 枠集計表
  quotaTable: {
    closer: {
      count: number;
      unitPrice: number;
      transportFee: number;
    };
    girl: {
      count: number;
      unitPrice: number;
      transportFee: number;
    };
  };
  
  // 無料入店
  freeEntry: { [day: string]: number | undefined };
  
  // 場所取り詳細（場所取りありの場合）- 複数レコード対応
  locationReservations?: {
    id: string;
    date: string;
    status: '申請中' | '日程NG' | '通信NG' | '代理店確認中' | '確定';
    arrangementCompany: string;
    wholesalePrice: number;
    purchasePrice: number;
  }[];
  
  memo: string;
  
  // 追加の詳細情報項目
  fieldContactName?: string; // 現場連絡先名前
  fieldContactPhone?: string; // 現場連絡先電話番号
  otherCompany?: string; // 他社
  regularStaff?: string; // 常勤
  meetingTime?: string; // 集合時間
  meetingPlace?: string; // 集合場所
  workStartTime?: string; // 稼働開始時間
  workEndTime?: string; // 稼働終了時間
  uniform?: string; // 服装
  target?: string; // 目標
  specialNotes?: string; // 特記事項
  
  // イベント開催日
  selectedEventDates?: string[];
  
  // コミュニケーション機能
  communications?: Communication[];
}

// 再帰的なコミュニケーション型定義
interface Communication {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  likes: string[]; // いいねしたユーザーIDの配列
  replies?: Communication[]; // 再帰的な構造
  quotedMessage?: string; // 引用メッセージ
  parentId?: string; // 親メッセージのID（リプライの場合）
}

interface SalesTableProps {
  records: SalesRecord[];
  selectedWeek: Date;
  onRecordUpdate: (recordId: number, updates: Partial<SalesRecord>) => void;
  onRecordAdd: (newRecord: SalesRecord) => void;
}

// ステータスの色を取得
const getStatusColor = (status: SalesRecord['status']) => {
  switch (status) {
    case '起票': return 'default';
    case '連絡前': return 'warning';
    case '連絡済': return 'success';
    case '連絡不要': return 'info';
    case 'お断り': return 'error';
    default: return 'default';
  }
};

// 詳細ステータスの色を取得
const getDetailStatusColor = (status: SalesRecord['detailStatus']) => {
  return status === '公開済み' ? 'success' : 'default';
};

// 詳細ステータスの表示テキストを取得
const getDetailStatusDisplayText = (status: SalesRecord['detailStatus']) => {
  return status === '公開済み' ? '公開' : '非公開';
};

// 曜日名を取得（火曜日スタート）
const getDayNames = () => ['火', '水', '木', '金', '土', '日', '月'];

// 日付を取得（火曜日スタート）
const getWeekDates = (selectedWeek: Date) => {
  const dates = [];
  const startDate = new Date(selectedWeek);
  
  // 火曜日を起点とする
  const dayOfWeek = startDate.getDay();
  const daysToTuesday = dayOfWeek === 0 ? 2 : (2 - dayOfWeek + 7) % 7;
  startDate.setDate(startDate.getDate() - daysToTuesday);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.getDate());
  }
  
  return dates;
};

// 土日の判定と色設定
const getWeekendStyle = (dayIndex: number) => {
  if (dayIndex === 4) { // 土曜日（火曜日スタートなので4番目）
    return { backgroundColor: '#e3f2fd', color: '#1976d2' };
  } else if (dayIndex === 5) { // 日曜日（火曜日スタートなので5番目）
    return { backgroundColor: '#ffebee', color: '#d32f2f' };
  }
  return { backgroundColor: 'inherit', color: 'inherit' };
};

// 代理店の背景色を取得
const getAgencyStyle = (agency: string) => {
  switch (agency) {
    case 'ピーアップ':
      return { backgroundColor: '#e0f2f1', color: '#00796b' };
    case 'ラネット':
      return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
    case 'CS':
      return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
    case 'エージェントA':
      return { backgroundColor: '#fff3e0', color: '#ef6c00' };
    case 'マーケティング会社B':
      return { backgroundColor: '#e3f2fd', color: '#1976d2' };
    default:
      return { backgroundColor: '#f5f5f5', color: '#666666' };
  }
};

const SalesTable: React.FC<SalesTableProps> = ({ records, selectedWeek, onRecordUpdate, onRecordAdd }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ recordId: number; field: string } | null>(null);
  const [locationTooltip, setLocationTooltip] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [assignedUserPopup, setAssignedUserPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [statusPopup, setStatusPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [agencyPopup, setAgencyPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [detailStatusPopup, setDetailStatusPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [dayTypePopup, setDayTypePopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [eventLocationPopup, setEventLocationPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [managerPopup, setManagerPopup] = useState<{ recordId: number; anchorEl: HTMLElement } | null>(null);
  const [locationReservationModal, setLocationReservationModal] = useState<{ recordId: number; open: boolean } | null>(null);
  const [detailDrawer, setDetailDrawer] = useState<{ recordId: number; open: boolean } | null>(null);
  
  // 右クリックメニューと削除機能の状態
  const [contextMenu, setContextMenu] = useState<{ recordId: number; mouseX: number; mouseY: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ recordId: number; open: boolean } | null>(null);
  
  // 新規追加ダイアログの状態
  const [addRecordDialog, setAddRecordDialog] = useState<boolean>(false);
  const [newRecordForm, setNewRecordForm] = useState({
    // 基本情報
    assignedUser: '',
    agency: '',
    detailStatus: '未登録' as const,
    dayType: '平日' as const,
    isBandProject: false,
    bandWorkDays: 0,
    
    // イベント詳細
    eventLocation: '',
    locationDetail: '',
    managerName: '',
    managerPhone: '',
    hostStore: '',
    partnerStores: [],
    
    // フラグ設定
    hasLocationReservation: false,
    locationReservationDetails: [],
    isExternalVenue: false,
    hasBusinessTrip: false,
    requiresDirector: false,
    eventType: 'mall' as EventType,
    
    // 枠集計表
    closerCount: 0,
    closerUnitPrice: 15000,
    closerTransportFee: 1000,
    girlCount: 0,
    girlUnitPrice: 12000,
    girlTransportFee: 800,
    
    // 追加詳細情報
    fieldContactName: '',
    fieldContactPhone: '',
    otherCompany: '',
    regularStaff: '',
    meetingTime: '',
    meetingPlace: '',
    workStartTime: '',
    workEndTime: '',
    uniform: '',
    target: '',
    specialNotes: '',
    memo: '',
    
    // イベント開催日
    selectedEventDates: [],
  });
  
  const dayNames = getDayNames();
  const weekDates = getWeekDates(selectedWeek);
  
  // 担当者の選択肢
  const assignedUserOptions = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村'];
  
  // ステータスの選択肢
  const statusOptions: SalesRecord['status'][] = ['起票', '連絡前', '連絡済', '連絡不要', 'お断り'];
  
  // 代理店の選択肢
  const agencyOptions = ['ピーアップ', 'ラネット', 'CS', 'エージェントA', 'マーケティング会社B'];
  
  // 詳細ステータスの選択肢
  const detailStatusOptions: SalesRecord['detailStatus'][] = ['未登録', '公開済み'];
  
  // 曜日の選択肢
  const dayTypeOptions: SalesRecord['dayType'][] = ['平日', '週末'];
  
  // イベント実施場所の選択肢
  const eventLocationOptions = ['東京ビッグサイト', '幕張メッセ', 'パシフィコ横浜', 'インテックス大阪', '京都国際会館', 'ポートメッセなごや'];
  
  // 担当MG名の選択肢
  const managerOptions = [
    { name: '山田太郎', phone: '090-1234-5678' },
    { name: '佐藤花子', phone: '090-2345-6789' },
    { name: '田中次郎', phone: '090-3456-7890' },
    { name: '鈴木美咲', phone: '090-4567-8901' },
    { name: '高橋健一', phone: '090-5678-9012' }
  ];
  
  // 店舗の選択肢
  const availableStores = ['新宿店', '渋谷店', '池袋店', '銀座店', '浦和店', '大宮店', '横浜店', '川崎店', '千葉店', '船橋店'];
  
  // セルの編集開始
  const handleCellEdit = (recordId: number, field: string) => {
    setEditingCell({ recordId, field });
  };
  
  // セルの編集完了
  const handleCellEditComplete = (recordId: number, field: string, value: any) => {
    onRecordUpdate(recordId, { [field]: value });
    setEditingCell(null);
  };

  // 担当者ポップアップの表示
  const handleAssignedUserClick = (event: React.MouseEvent, recordId: number) => {
    setAssignedUserPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
  };
  
  // 担当者ポップアップの非表示
  const handleAssignedUserClose = () => {
    setAssignedUserPopup(null);
  };
  
  // 担当者の選択
  const handleAssignedUserSelect = (recordId: number, user: string) => {
    onRecordUpdate(recordId, { assignedUser: user });
    setAssignedUserPopup(null);
  };

  // 場所取り詳細の表示
  const handleLocationReservationClick = (event: React.MouseEvent, record: SalesRecord) => {
    if (editingRecord === record.id) {
      // 編集モード時はモーダルを開く
      setLocationReservationModal({ recordId: record.id, open: true });
    } else if (record.flags.hasLocationReservation && record.locationReservations && record.locationReservations.length > 0) {
      // 表示モード時はツールチップを表示
      setLocationTooltip({ recordId: record.id, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // 場所取り詳細の非表示
  const handleLocationTooltipClose = () => {
    setLocationTooltip(null);
  };

  // 場所取り詳細モーダルの閉じる
  const handleLocationReservationModalClose = () => {
    setLocationReservationModal(null);
  };

  // 場所取り詳細レコードの追加
  const handleLocationReservationAdd = (recordId: number) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      const newReservation = {
        id: `${recordId}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: '申請中' as const,
        arrangementCompany: '',
        wholesalePrice: 0,
        purchasePrice: 0,
      };
      const updatedReservations = [...(record.locationReservations || []), newReservation];
      onRecordUpdate(recordId, { locationReservations: updatedReservations });
    }
  };

  // 場所取り詳細レコードの削除
  const handleLocationReservationRemove = (recordId: number, reservationId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record && record.locationReservations) {
      const updatedReservations = record.locationReservations.filter(lr => lr.id !== reservationId);
      onRecordUpdate(recordId, { locationReservations: updatedReservations });
    }
  };

  // 場所取り詳細レコードの更新
  const handleLocationReservationUpdate = (recordId: number, reservationId: string, updates: any) => {
    const record = records.find(r => r.id === recordId);
    if (record && record.locationReservations) {
      const updatedReservations = record.locationReservations.map(lr => 
        lr.id === reservationId ? { ...lr, ...updates } : lr
      );
      onRecordUpdate(recordId, { locationReservations: updatedReservations });
    }
  };

  // 売上計算
  const calculateSales = (record: SalesRecord) => {
    // 帯案件の場合は帯案件日数、通常案件の場合はスケジュール日数を使用
    const workDays = record.isBandProject 
      ? (record.bandWorkDays || 0) 
      : record.schedule.filter(Boolean).length;
    
    const closerSales = (record.quotaTable.closer.unitPrice + record.quotaTable.closer.transportFee) * record.quotaTable.closer.count * workDays;
    const girlSales = (record.quotaTable.girl.unitPrice + record.quotaTable.girl.transportFee) * record.quotaTable.girl.count * workDays;
    return closerSales + girlSales;
  };

  // ステータスポップアップの表示
  const handleStatusClick = (event: React.MouseEvent, recordId: number) => {
    setStatusPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
  };
  
  // ステータスポップアップの非表示
  const handleStatusClose = () => {
    setStatusPopup(null);
  };
  
  // ステータスの選択
  const handleStatusSelect = (recordId: number, status: SalesRecord['status']) => {
    onRecordUpdate(recordId, { status });
    setStatusPopup(null);
  };

  // 編集モードの開始
  const handleEditStart = (recordId: number) => {
    setEditingRecord(recordId);
  };
  
  // 編集モードの終了
  const handleEditEnd = () => {
    setEditingRecord(null);
  };

  // 代理店ポップアップの表示
  const handleAgencyClick = (event: React.MouseEvent, recordId: number) => {
    if (editingRecord === recordId) {
      setAgencyPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // 代理店ポップアップの非表示
  const handleAgencyClose = () => {
    setAgencyPopup(null);
  };
  
  // 代理店の選択
  const handleAgencySelect = (recordId: number, agency: string) => {
    onRecordUpdate(recordId, { agency });
    setAgencyPopup(null);
  };

  // 詳細ステータスポップアップの表示
  const handleDetailStatusClick = (event: React.MouseEvent, recordId: number) => {
    if (editingRecord === recordId) {
      setDetailStatusPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // 詳細ステータスポップアップの非表示
  const handleDetailStatusClose = () => {
    setDetailStatusPopup(null);
  };
  
  // 詳細ステータスの選択
  const handleDetailStatusSelect = (recordId: number, detailStatus: SalesRecord['detailStatus']) => {
    onRecordUpdate(recordId, { detailStatus });
    setDetailStatusPopup(null);
  };

  // 曜日ポップアップの表示
  const handleDayTypeClick = (event: React.MouseEvent, recordId: number) => {
    if (editingRecord === recordId) {
      setDayTypePopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // 曜日ポップアップの非表示
  const handleDayTypeClose = () => {
    setDayTypePopup(null);
  };
  
  // 曜日の選択
  const handleDayTypeSelect = (recordId: number, dayType: SalesRecord['dayType']) => {
    onRecordUpdate(recordId, { dayType });
    setDayTypePopup(null);
  };

  // スケジュールのトグル
  const handleScheduleToggle = (recordId: number, dayIndex: number) => {
    if (editingRecord === recordId) {
      const record = records.find(r => r.id === recordId);
      if (record) {
        const newSchedule = [...record.schedule];
        newSchedule[dayIndex] = !newSchedule[dayIndex];
        onRecordUpdate(recordId, { schedule: newSchedule });
      }
    }
  };

  // イベント実施場所ポップアップの表示
  const handleEventLocationClick = (event: React.MouseEvent, recordId: number) => {
    if (editingRecord === recordId) {
      setEventLocationPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // イベント実施場所ポップアップの非表示
  const handleEventLocationClose = () => {
    setEventLocationPopup(null);
  };
  
  // イベント実施場所の選択
  const handleEventLocationSelect = (recordId: number, location: string) => {
    onRecordUpdate(recordId, { eventLocation: location });
    setEventLocationPopup(null);
  };

  // 担当MGポップアップの表示
  const handleManagerClick = (event: React.MouseEvent, recordId: number) => {
    if (editingRecord === recordId) {
      setManagerPopup({ recordId, anchorEl: event.currentTarget as HTMLElement });
    }
  };
  
  // 担当MGポップアップの非表示
  const handleManagerClose = () => {
    setManagerPopup(null);
  };
  
  // 担当MGの選択
  const handleManagerSelect = (recordId: number, manager: { name: string; phone: string }) => {
    onRecordUpdate(recordId, { managerName: manager.name, managerPhone: manager.phone });
    setManagerPopup(null);
  };

  // 開催店舗の追加
  const handleHostStoreAdd = (recordId: number, store: string) => {
    const record = records.find(r => r.id === recordId);
    if (record && !record.hostStore.includes(store)) {
      onRecordUpdate(recordId, { hostStore: [...record.hostStore, store] });
    }
  };

  // 連名店舗の追加
  const handlePartnerStoreAdd = (recordId: number, store: string) => {
    const record = records.find(r => r.id === recordId);
    if (record && !record.partnerStores.includes(store)) {
      onRecordUpdate(recordId, { partnerStores: [...record.partnerStores, store] });
    }
  };

  // 連名店舗の削除
  const handlePartnerStoreRemove = (recordId: number, storeIndex: number) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      const newPartnerStores = record.partnerStores.filter((_, index) => index !== storeIndex);
      onRecordUpdate(recordId, { partnerStores: newPartnerStores });
    }
  };

  // 詳細情報Drawerの開く
  const handleDetailDrawerOpen = (recordId: number) => {
    setDetailDrawer({ recordId, open: true });
  };

  // 詳細情報Drawerの閉じる
  const handleDetailDrawerClose = () => {
    setDetailDrawer(null);
  };

  // 詳細情報Drawer用の編集モード状態を追加
  const [detailEditMode, setDetailEditMode] = useState<boolean>(false);
  
  // アコーディオン開閉状態を追加
  const [detailInfoExpanded, setDetailInfoExpanded] = useState<boolean>(false);

  // コミュニケーション機能のステート
  const [newMessage, setNewMessage] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<{ messageId: string; userName: string; originalMessage: string; parentId?: string } | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [messageDeleteConfirm, setMessageDeleteConfirm] = useState<{ messageId: string; open: boolean } | null>(null);

  // 詳細情報Drawer用の編集モード切り替え
  const handleDetailEditToggle = () => {
    setDetailEditMode(!detailEditMode);
  };

  // コミュニケーション機能のハンドラー
  const handleSendMessage = () => {
    if (!newMessage.trim() || !detailDrawer?.recordId) return;
    
    const currentUser = '田中太郎'; // 実際の実装では現在のユーザー情報を取得
    const newCommunication: Communication = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: currentUser,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleString('ja-JP'),
      likes: [],
      replies: []
    };

    const record = records.find(r => r.id === detailDrawer.recordId);
    const updatedCommunications = [newCommunication, ...(record?.communications || [])]; // 最新順に並べ替え
    
    onRecordUpdate(detailDrawer.recordId, { communications: updatedCommunications });
    setNewMessage('');
  };

  const handleLikeMessage = (messageId: string) => {
    if (!detailDrawer?.recordId) return;
    
    const currentUserId = 'user1'; // 実際の実装では現在のユーザーIDを取得
    const record = records.find(r => r.id === detailDrawer.recordId);
    if (!record?.communications) return;

    const updateLikes = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === messageId) {
          const likes = comm.likes.includes(currentUserId) 
            ? comm.likes.filter(id => id !== currentUserId)
            : [...comm.likes, currentUserId];
          return { ...comm, likes };
        }
        if (comm.replies) {
          return { ...comm, replies: updateLikes(comm.replies) };
        }
        return comm;
      });
    };

    const updatedCommunications = updateLikes(record.communications);
    onRecordUpdate(detailDrawer.recordId, { communications: updatedCommunications });
  };

  const handleStartReply = (messageId: string, userName: string, originalMessage: string, parentId?: string) => {
    setReplyingTo({ messageId, userName, originalMessage, parentId });
    setReplyMessage('');
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !replyingTo || !detailDrawer?.recordId) return;
    
    const currentUser = '田中太郎'; // 実際の実装では現在のユーザー情報を取得
    const newReply: Communication = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: currentUser,
      message: replyMessage.trim(),
      timestamp: new Date().toLocaleString('ja-JP'),
      likes: [],
      replies: [],
      parentId: replyingTo.messageId
    };

    const record = records.find(r => r.id === detailDrawer.recordId);
    if (!record?.communications) return;

    const addReply = (communications: Communication[]): Communication[] => {
      return communications.map(comm => {
        if (comm.id === replyingTo.messageId) {
          return {
            ...comm,
            replies: [newReply, ...(comm.replies || [])] // 最新順に並べ替え
          };
        }
        if (comm.replies) {
          return { ...comm, replies: addReply(comm.replies) };
        }
        return comm;
      });
    };

    const updatedCommunications = addReply(record.communications);
    onRecordUpdate(detailDrawer.recordId, { communications: updatedCommunications });
    setReplyingTo(null);
    setReplyMessage('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyMessage('');
  };

  // 投稿削除機能
  const handleDeleteMessage = (messageId: string) => {
    if (!detailDrawer?.recordId) return;
    
    const record = records.find(r => r.id === detailDrawer.recordId);
    if (!record?.communications) return;

    const deleteMessage = (communications: Communication[]): Communication[] => {
      return communications.filter(comm => {
        if (comm.id === messageId) {
          return false; // このメッセージとその返信を全て削除
        }
        if (comm.replies) {
          // 再帰的に子の返信からも削除
          comm.replies = deleteMessage(comm.replies);
        }
        return true;
      });
    };

    const updatedCommunications = deleteMessage(record.communications);
    onRecordUpdate(detailDrawer.recordId, { communications: updatedCommunications });
    
    // 削除されたメッセージに返信中だった場合はキャンセル
    if (replyingTo?.messageId === messageId) {
      setReplyingTo(null);
      setReplyMessage('');
    }
    
    // 確認ダイアログを閉じる
    setDeleteConfirm(null);
  };

  // 削除確認ダイアログの表示
  const handleDeleteClick = (messageId: string) => {
    setMessageDeleteConfirm({ messageId, open: true });
  };

  // 削除確認ダイアログのキャンセル
  const handleDeleteCancel = () => {
    setMessageDeleteConfirm(null);
  };

  // 再帰的なコミュニケーション表示コンポーネント
  const renderCommunication = (communication: Communication, depth: number = 0, parentUserName?: string): React.ReactNode => {
    const isReply = depth > 0; // リプライかどうかの判定のみ
    
    return (
      <Box 
        key={communication.id} 
        sx={{ 
          mb: 2, 
          p: 3, 
          border: '1px solid #e1e8ed', 
          borderRadius: '0px', 
          backgroundColor: '#ffffff',
          '&:hover': { backgroundColor: '#f7f9fa' },
          transition: 'background-color 0.2s',
          ml: isReply ? 3 : 0 // すべてのリプライ（depth ≥ 1）を同じ階層に
        }}
      >
        {/* リプライ表示 */}
        {isReply && parentUserName && (
          <Box sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            pb: 1,
            borderBottom: '1px solid #eff3f4'
          }}>
            <ReplyIcon sx={{ 
              fontSize: '0.8rem', 
              color: '#536471',
              transform: 'scaleX(-1)' // アイコンを左向きに
            }} />
            <Typography variant="caption" sx={{ 
              color: '#536471',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {parentUserName} への返信
            </Typography>
          </Box>
        )}

        {/* メインツイート/リプライ */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* アバター */}
          <Box sx={{ 
            width: '40px', // サイズを統一
            height: '40px', // サイズを統一
            borderRadius: '50%', 
            backgroundColor: isReply ? '#17bf63' : '#1da1f2', // リプライは緑、メインは青
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem', // サイズを統一
            flexShrink: 0
          }}>
            {communication.userName.charAt(0)}
          </Box>
          
          {/* ツイート内容 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: '700', 
                color: '#0f1419',
                fontSize: '0.9rem' // サイズを統一
              }}>
                {communication.userName}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#536471',
                fontSize: '0.8rem' // サイズを統一
              }}>
                @{communication.userName.toLowerCase()}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#536471',
                fontSize: '0.8rem' // サイズを統一
              }}>
                ·
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#536471',
                fontSize: '0.8rem' // サイズを統一
              }}>
                {communication.timestamp}
              </Typography>
              
              {/* 削除ボタン（投稿者本人のみ表示） */}
              {communication.userId === 'user1' && (
                <Box sx={{ ml: 'auto' }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(communication.id)}
                    sx={{ 
                      color: '#536471',
                      opacity: 0.6,
                      '&:hover': { 
                        backgroundColor: 'rgba(244, 33, 46, 0.1)',
                        color: '#f4212e',
                        opacity: 1
                      },
                      p: 0.5
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {/* ツイート本文 */}
            <Typography variant="body2" sx={{ 
              mb: 2, 
              whiteSpace: 'pre-line',
              color: '#0f1419',
              fontSize: '0.9rem', // サイズを統一
              lineHeight: 1.3
            }}>
              {communication.message}
            </Typography>
            
            {/* アクションボタン */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleStartReply(communication.id, communication.userName, communication.message)}
                  sx={{ 
                    color: '#536471',
                    '&:hover': { 
                      backgroundColor: 'rgba(29, 161, 242, 0.1)',
                      color: '#1da1f2'
                    },
                    p: 1
                  }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ 
                  color: '#536471',
                  fontSize: '0.8rem',
                  minWidth: '16px'
                }}>
                  {communication.replies?.length || ''}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleLikeMessage(communication.id)}
                  sx={{ 
                    color: communication.likes.includes('user1') ? '#f91880' : '#536471',
                    '&:hover': { 
                      backgroundColor: 'rgba(249, 24, 128, 0.1)',
                      color: '#f91880'
                    },
                    p: 1
                  }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ 
                  color: communication.likes.includes('user1') ? '#f91880' : '#536471',
                  fontSize: '0.8rem',
                  minWidth: '16px'
                }}>
                  {communication.likes.length || ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 返信入力欄（個別メッセージに対して） */}
        {replyingTo?.messageId === communication.id && (
          <Box sx={{ 
            mt: 3, 
            pl: 6, // 固定インデント
            pt: 2,
            borderTop: '1px solid #eff3f4'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 返信者アバター */}
              <Box sx={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#1da1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                田
              </Box>
              
              {/* 返信入力 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: '#536471', 
                  mb: 1, 
                  display: 'block',
                  fontSize: '0.8rem'
                }}>
                  {replyingTo.userName} への返信
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="返信を入力する"
                    size="small"
                    multiline
                    maxRows={3}
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        '& fieldset': {
                          borderColor: '#e1e8ed',
                        },
                        '&:hover fieldset': {
                          borderColor: '#1da1f2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1da1f2',
                          borderWidth: '2px',
                        },
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    sx={{
                      backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1da1f2',
                      color: 'white',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      '&:hover': {
                        backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1991db',
                      },
                      '&:disabled': {
                        backgroundColor: '#e1e8ed',
                        color: '#aab8c2',
                      }
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={handleCancelReply}
                    sx={{ 
                      color: '#536471',
                      '&:hover': { 
                        backgroundColor: 'rgba(83, 100, 113, 0.1)' 
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* リプライ表示（親投稿の外枠内に表示） */}
        {communication.replies && communication.replies.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eff3f4' }}>
            {communication.replies.map((reply) => (
              <Box key={reply.id} sx={{ mb: 2, last: { mb: 0 } }}>
                {/* リプライヘッダー */}
                <Box sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}>
                  <ReplyIcon sx={{ 
                    fontSize: 'small', 
                    color: '#536471',
                    transform: 'scaleX(-1)' // アイコンを左向きに
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: '#536471',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {communication.userName} への返信
                  </Typography>
                </Box>

                {/* リプライ内容 */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* リプライアバター */}
                  <Box sx={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#17bf63',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {reply.userName.charAt(0)}
                  </Box>
                  
                  {/* リプライ本文 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* リプライヘッダー */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: '700', 
                        color: '#0f1419',
                        fontSize: '0.8rem'
                      }}>
                        {reply.userName}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#536471',
                        fontSize: '0.75rem'
                      }}>
                        @{reply.userName.toLowerCase()}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#536471',
                        fontSize: '0.75rem'
                      }}>
                        ·
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#536471',
                        fontSize: '0.75rem'
                      }}>
                        {reply.timestamp}
                      </Typography>
                      
                      {/* リプライ削除ボタン */}
                      {reply.userId === 'user1' && (
                        <Box sx={{ ml: 'auto' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(reply.id)}
                            sx={{ 
                              color: '#536471',
                              opacity: 0.6,
                              '&:hover': { 
                                backgroundColor: 'rgba(244, 33, 46, 0.1)',
                                color: '#f4212e',
                                opacity: 1
                              },
                              p: 0.5
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    {/* リプライ本文 */}
                    <Typography variant="body2" sx={{ 
                      mb: 1.5, 
                      whiteSpace: 'pre-line',
                      color: '#0f1419',
                      fontSize: '0.8rem',
                      lineHeight: 1.3
                    }}>
                      {reply.message}
                    </Typography>
                    
                    {/* リプライアクションボタン */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleStartReply(reply.id, reply.userName, reply.message)}
                          sx={{ 
                            color: '#536471',
                            '&:hover': { 
                              backgroundColor: 'rgba(29, 161, 242, 0.1)',
                              color: '#1da1f2'
                            },
                            p: 1
                          }}
                        >
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" sx={{ 
                          color: '#536471',
                          fontSize: '0.8rem',
                          minWidth: '16px'
                        }}>
                          {reply.replies?.length || ''}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleLikeMessage(reply.id)}
                          sx={{ 
                            color: reply.likes.includes('user1') ? '#f91880' : '#536471',
                            '&:hover': { 
                              backgroundColor: 'rgba(249, 24, 128, 0.1)',
                              color: '#f91880'
                            },
                            p: 1
                          }}
                        >
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" sx={{ 
                          color: reply.likes.includes('user1') ? '#f91880' : '#536471',
                          fontSize: '0.8rem',
                          minWidth: '16px'
                        }}>
                          {reply.likes.length || ''}
                        </Typography>
                      </Box>
                    </Box>

                    {/* リプライに対するリプライ（同じレベルで表示） */}
                    {reply.replies && reply.replies.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {reply.replies.map((nestedReply) => (
                          <Box key={nestedReply.id} sx={{ mb: 2, last: { mb: 0 } }}>
                            {/* ネストされたリプライヘッダー */}
                            <Box sx={{ 
                              mb: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1 
                            }}>
                              <ReplyIcon sx={{ 
                                fontSize: 'small', 
                                color: '#536471',
                                transform: 'scaleX(-1)'
                              }} />
                              <Typography variant="caption" sx={{ 
                                color: '#536471',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {reply.userName} への返信
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                              {/* ネストされたリプライアバター */}
                              <Box sx={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                backgroundColor: '#17bf63',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                flexShrink: 0
                              }}>
                                {nestedReply.userName.charAt(0)}
                              </Box>
                              
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* ネストされたリプライヘッダー */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ 
                                    fontWeight: '700', 
                                    color: '#0f1419',
                                    fontSize: '0.8rem'
                                  }}>
                                    {nestedReply.userName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: '#536471',
                                    fontSize: '0.75rem'
                                  }}>
                                    @{nestedReply.userName.toLowerCase()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: '#536471',
                                    fontSize: '0.75rem'
                                  }}>
                                    ·
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: '#536471',
                                    fontSize: '0.75rem'
                                  }}>
                                    {nestedReply.timestamp}
                                  </Typography>
                                  
                                  {/* ネストされたリプライ削除ボタン */}
                                  {nestedReply.userId === 'user1' && (
                                    <Box sx={{ ml: 'auto' }}>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteClick(nestedReply.id)}
                                        sx={{ 
                                          color: '#536471',
                                          opacity: 0.6,
                                          '&:hover': { 
                                            backgroundColor: 'rgba(244, 33, 46, 0.1)',
                                            color: '#f4212e',
                                            opacity: 1
                                          },
                                          p: 0.5
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>
                                
                                {/* ネストされたリプライ本文 */}
                                <Typography variant="body2" sx={{ 
                                  mb: 1.5, 
                                  whiteSpace: 'pre-line',
                                  color: '#0f1419',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.3
                                }}>
                                  {nestedReply.message}
                                </Typography>
                                
                                {/* ネストされたリプライアクションボタン */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleStartReply(nestedReply.id, nestedReply.userName, nestedReply.message)}
                                      sx={{ 
                                        color: '#536471',
                                        '&:hover': { 
                                          backgroundColor: 'rgba(29, 161, 242, 0.1)',
                                          color: '#1da1f2'
                                        },
                                        p: 1
                                      }}
                                    >
                                      <ReplyIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleLikeMessage(nestedReply.id)}
                                      sx={{ 
                                        color: nestedReply.likes.includes('user1') ? '#f91880' : '#536471',
                                        '&:hover': { 
                                          backgroundColor: 'rgba(249, 24, 128, 0.1)',
                                          color: '#f91880'
                                        },
                                        p: 1
                                      }}
                                    >
                                      <ThumbUpIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="caption" sx={{ 
                                      color: nestedReply.likes.includes('user1') ? '#f91880' : '#536471',
                                      fontSize: '0.8rem',
                                      minWidth: '16px'
                                    }}>
                                      {nestedReply.likes.length || ''}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* リプライの返信入力欄 */}
                {replyingTo?.messageId === reply.id && (
                  <Box sx={{ 
                    mt: 2, 
                    pl: 5,
                    pt: 1.5,
                    borderTop: '1px solid #f1f3f4'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {/* 返信者アバター */}
                      <Box sx={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        backgroundColor: '#1da1f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        flexShrink: 0
                      }}>
                        田
                      </Box>
                      
                      {/* 返信入力 */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ 
                          color: '#536471', 
                          mb: 0.5, 
                          display: 'block',
                          fontSize: '0.7rem'
                        }}>
                          {replyingTo.userName} への返信
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                          <TextField
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="返信を入力する"
                            size="small"
                            multiline
                            maxRows={3}
                            sx={{ 
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                fontSize: '0.8rem',
                                '& fieldset': {
                                  borderColor: '#e1e8ed',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#1da1f2',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1da1f2',
                                  borderWidth: '2px',
                                },
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                              }
                            }}
                          />
                          <IconButton 
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim()}
                            sx={{
                              backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1da1f2',
                              color: 'white',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              '&:hover': {
                                backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1991db',
                              },
                              '&:disabled': {
                                backgroundColor: '#e1e8ed',
                                color: '#aab8c2',
                              }
                            }}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={handleCancelReply}
                            sx={{ 
                              color: '#536471',
                              '&:hover': { 
                                backgroundColor: 'rgba(83, 100, 113, 0.1)' 
                              },
                              width: '28px',
                              height: '28px',
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // フラットなコミュニケーション表示関数
  const renderAllCommunications = (communications: Communication[]): React.ReactNode[] => {
    return communications.map(communication => renderCommunication(communication, 0));
  };

  // 右クリックメニューのハンドラー
  const handleRowContextMenu = (event: React.MouseEvent, recordId: number) => {
    event.preventDefault();
    setContextMenu({
      recordId,
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // 削除機能のハンドラー
  const handleDeleteFromContext = () => {
    if (contextMenu) {
      setDeleteConfirm({ recordId: contextMenu.recordId, open: true });
      setContextMenu(null);
    }
  };

  const handleRecordDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleRecordDeleteConfirm = () => {
    if (deleteConfirm) {
      // ここで実際の削除処理を行う（親コンポーネントに通知するなど）
      // 現在はコンソールログのみ
      console.log('レコード削除:', deleteConfirm.recordId);
      // TODO: onRecordDelete(deleteConfirm.recordId); などの削除処理を実装
      setDeleteConfirm(null);
    }
  };

  // 新規レコード追加のハンドラー
  const handleAddNewRecord = () => {
    setAddRecordDialog(true);
  };

  // 新規追加ダイアログを閉じる
  const handleAddRecordDialogClose = () => {
    setAddRecordDialog(false);
    // フォームをリセット
    setNewRecordForm({
      assignedUser: '',
      agency: '',
      detailStatus: '未登録',
      dayType: '平日',
      isBandProject: false,
      bandWorkDays: 0,
      eventLocation: '',
      locationDetail: '',
      managerName: '',
      managerPhone: '',
      hostStore: '',
      partnerStores: [],
      hasLocationReservation: false,
      locationReservationDetails: [],
      isExternalVenue: false,
      hasBusinessTrip: false,
      requiresDirector: false,
      eventType: 'mall' as EventType,
      closerCount: 0,
      closerUnitPrice: 15000,
      closerTransportFee: 1000,
      girlCount: 0,
      girlUnitPrice: 12000,
      girlTransportFee: 800,
      fieldContactName: '',
      fieldContactPhone: '',
      otherCompany: '',
      regularStaff: '',
      meetingTime: '',
      meetingPlace: '',
      workStartTime: '',
      workEndTime: '',
      uniform: '',
      target: '',
      specialNotes: '',
      memo: '',
      selectedEventDates: [],
    });
  };

  // フォーム入力の更新
  const handleFormChange = (field: string, value: any) => {
    setNewRecordForm(prev => ({ ...prev, [field]: value }));
  };

  // 新規レコードを実際に追加
  const handleConfirmAddRecord = () => {
    // バリデーション（イベント開催日のみ必須）
    if (!newRecordForm.selectedEventDates || newRecordForm.selectedEventDates.length === 0) {
      alert('イベント開催日を選択してください');
      return;
    }

    const newRecord: SalesRecord = {
      id: Date.now(),
      assignedUser: newRecordForm.assignedUser,
      updatedUser: '現在のユーザー',
      status: '起票',
      agency: newRecordForm.agency,
      detailStatus: newRecordForm.detailStatus,
      schedule: [false, false, false, false, false, false, false],
      dayType: newRecordForm.dayType,
      isBandProject: newRecordForm.isBandProject,
      bandWorkDays: newRecordForm.isBandProject ? newRecordForm.bandWorkDays : undefined,
      eventLocation: newRecordForm.eventLocation,
      locationDetail: newRecordForm.locationDetail,
      managerName: newRecordForm.managerName,
      managerPhone: newRecordForm.managerPhone,
      hostStore: newRecordForm.hostStore ? [newRecordForm.hostStore] : [],
      partnerStores: newRecordForm.partnerStores,
      eventType: newRecordForm.eventType,
      flags: {
        hasLocationReservation: newRecordForm.hasLocationReservation,
        isExternalVenue: newRecordForm.isExternalVenue,
        hasBusinessTrip: newRecordForm.hasBusinessTrip,
        requiresDirector: newRecordForm.requiresDirector,
      },
      quotaTable: {
        closer: { 
          count: newRecordForm.closerCount, 
          unitPrice: newRecordForm.closerUnitPrice, 
          transportFee: newRecordForm.closerTransportFee 
        },
        girl: { 
          count: newRecordForm.girlCount, 
          unitPrice: newRecordForm.girlUnitPrice, 
          transportFee: newRecordForm.girlTransportFee 
        },
      },
      freeEntry: {},
      memo: newRecordForm.memo,
      fieldContactName: newRecordForm.fieldContactName,
      fieldContactPhone: newRecordForm.fieldContactPhone,
      otherCompany: newRecordForm.otherCompany,
      regularStaff: newRecordForm.regularStaff,
      meetingTime: newRecordForm.meetingTime,
      meetingPlace: newRecordForm.meetingPlace,
      workStartTime: newRecordForm.workStartTime,
      workEndTime: newRecordForm.workEndTime,
      uniform: newRecordForm.uniform,
      target: newRecordForm.target,
      specialNotes: newRecordForm.specialNotes,
      selectedEventDates: newRecordForm.selectedEventDates,
      communications: [],
    };
    
    onRecordAdd(newRecord);
    handleAddRecordDialogClose();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 新規追加ボタン */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNewRecord}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
            }
          }}
        >
          + 新規追加
        </Button>
      </Box>

    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', maxHeight: '80vh' }}>
      <Table sx={{ minWidth: 2000 }} stickyHeader>
        <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#ffffff', 
              '& .MuiTableCell-root': { 
                backgroundColor: '#ffffff',
                borderBottom: '2px solid #e0e0e0',
                zIndex: 100,
                position: 'sticky',
                top: 0
              }
            }}>
            {/* 左側基本情報列 */}
            <TableCell sx={{ width: '30px' }}></TableCell>
            <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>担当者</TableCell>
            <TableCell sx={{ width: '90px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>更新者</TableCell>
            <TableCell sx={{ width: '90px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>ステータス</TableCell>
            <TableCell sx={{ width: '100px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>代理店</TableCell>
            <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>詳細情報</TableCell>
            
            {/* 中央日付列 */}
            {dayNames.map((day, index) => (
      <TableCell 
                key={day} 
          align="center"
          sx={{ 
                  width: '30px',
                  ...getWeekendStyle(index)
                }}
              >
                <Box>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>{day}</Typography>
                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>{weekDates[index]}</Typography>
                </Box>
      </TableCell>
      ))}
            
            {/* 右側曜日・帯案件列 */}
            <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>曜日</TableCell>
            <TableCell sx={{ width: '80px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>帯案件</TableCell>
            <TableCell sx={{ width: '1200px', fontSize: '0.7rem' }}>詳細</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              onMouseEnter={() => setHoveredRow(record.id)}
              onMouseLeave={() => setHoveredRow(null)}
                onContextMenu={(e) => handleRowContextMenu(e, record.id)}
            sx={{
                '&:hover': { backgroundColor: '#f5f5f5' },
                height: '150px',
                position: 'relative'
              }}
            >
              {/* 編集アイコン */}
              <TableCell sx={{ width: '30px', padding: '4px' }}>
                <Box sx={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingRecord === record.id ? (
                    <IconButton 
          size="small"
                sx={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
      '&:hover': { 
                          backgroundColor: 'rgba(76, 175, 80, 0.3)',
                        }
                      }}
                      onClick={handleEditEnd}
                    >
                      <CheckIcon fontSize="small" color="success" />
        </IconButton>
                  ) : (
          <IconButton 
            size="small" 
                      sx={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: hoveredRow === record.id ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                        opacity: hoveredRow === record.id ? 1 : 0.3,
                        '&:hover': { 
                          backgroundColor: 'rgba(25, 118, 210, 0.3)',
                          opacity: 1,
                        }
                      }}
                      onClick={() => handleEditStart(record.id)}
                    >
                      <EditIcon fontSize="small" color="primary" />
          </IconButton>
                  )}
        </Box>
      </TableCell>

      {/* 担当者 */}
              <TableCell sx={{ width: '80px' }}>
                <Typography 
                  variant="body2" 
        sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { backgroundColor: '#e3f2fd', borderRadius: '4px' },
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}
                  onClick={(e) => handleAssignedUserClick(e, record.id)}
                >
                  {record.assignedUser}
          </Typography>
      </TableCell>
              
      {/* 更新者 */}
              <TableCell sx={{ width: '90px' }}>
                <Typography variant="body2">{record.updatedUser}</Typography>
      </TableCell>
              
      {/* ステータス */}
              <TableCell sx={{ width: '90px' }}>
        <Chip 
          label={record.status} 
                  color={getStatusColor(record.status)}
          size="small"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={(e) => handleStatusClick(e, record.id)}
        />
      </TableCell>
              
      {/* 代理店 */}
              <TableCell sx={{ width: '100px' }}>
                <Box sx={{ 
                  ...getAgencyStyle(record.agency),
                  px: 1,
                  py: 0.3,
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: editingRecord === record.id ? 'pointer' : 'default',
                  '&:hover': editingRecord === record.id ? { opacity: 0.8 } : {}
                }}
                onClick={(e) => handleAgencyClick(e, record.id)}
                >
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{record.agency}</Typography>
                </Box>
              </TableCell>
              
              {/* 詳細情報 */}
              <TableCell sx={{ width: '80px', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                  <Chip 
                    label={getDetailStatusDisplayText(record.detailStatus)} 
                    color={getDetailStatusColor(record.detailStatus)}
                    size="small"
          sx={{ 
                      fontSize: '0.7rem', 
                      height: '20px',
                      cursor: editingRecord === record.id ? 'pointer' : 'default',
                      '&:hover': editingRecord === record.id ? { opacity: 0.8 } : {}
                    }}
                    onClick={(e) => handleDetailStatusClick(e, record.id)}
                  />
                  <Button 
                    size="small" 
                    variant="text"
                    sx={{ 
                      fontSize: '0.6rem', 
                      minHeight: '16px', 
                      padding: '1px 4px',
                      lineHeight: 1,
                      textTransform: 'none',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                    onClick={() => handleDetailDrawerOpen(record.id)}
                  >
                    詳細情報
                  </Button>
                </Box>
      </TableCell>

              {/* 日付列（✓マーク） */}
              {record.schedule.map((hasWork, index) => (
        <TableCell 
          key={index} 
          align="center"
          sx={{ 
                    width: '30px',
            borderLeft: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    ...getWeekendStyle(index),
                    cursor: editingRecord === record.id ? 'pointer' : 'default',
                    '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(25, 118, 210, 0.1)' } : {}
          }}
          onClick={() => handleScheduleToggle(record.id, index)}
        >
                    {(hasWork || record.isBandProject) && <CheckIcon color="primary" fontSize="small" />}
        </TableCell>
      ))}

              {/* 曜日 */}
              <TableCell sx={{ 
                width: '80px',
                backgroundColor: record.isBandProject 
                  ? '#e3f2fd' // 帯案件の場合は薄い青
                  : record.dayType === '平日' ? '#f5f5f5' : '#fff9c4', // 通常は平日/週末に応じた色
                cursor: editingRecord === record.id ? 'pointer' : 'default',
                '&:hover': editingRecord === record.id ? { opacity: 0.8 } : {}
              }}
              onClick={(e) => handleDayTypeClick(e, record.id)}
              >
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'nowrap',
                  color: record.isBandProject ? '#1976d2' : 'inherit', // 帯案件の場合は濃い青のテキスト
                  fontWeight: record.isBandProject ? 'bold' : 'normal' // 帯案件の場合は太字
                }}>
                  {record.isBandProject ? '帯' : record.dayType}
                </Typography>
              </TableCell>
              
              {/* 帯案件 */}
              <TableCell sx={{ 
                width: '80px',
                cursor: editingRecord === record.id ? 'pointer' : 'default',
                '&:hover': editingRecord === record.id ? { backgroundColor: 'rgba(25, 118, 210, 0.1)' } : {}
              }}
              onClick={() => {
                if (editingRecord === record.id) {
                  onRecordUpdate(record.id, { isBandProject: !record.isBandProject });
                }
              }}
              >
                {record.isBandProject ? (
                  <Box textAlign="center">
                    <CheckIcon color="primary" fontSize="small" />
                    {editingRecord === record.id ? (
                      <TextField
                        type="number"
                        value={record.bandWorkDays || 0}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          onRecordUpdate(record.id, { bandWorkDays: newValue });
                        }}
                        size="small"
                        variant="outlined"
                        sx={{
                          width: '50px',
                          mt: 0.5,
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.7rem',
                            height: '24px'
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '2px 4px',
                            textAlign: 'center'
                          }
                        }}
                        inputProps={{
                          min: 0,
                          max: 31
                        }}
                        onClick={(e) => e.stopPropagation()} // 親要素のクリックイベントを防ぐ
                      />
                    ) : (
                      <Typography variant="caption" display="block">
                        {record.bandWorkDays}日
                      </Typography>
                    )}
                  </Box>
                ) : (
                  editingRecord === record.id && (
                    <Box textAlign="center" sx={{ opacity: 0.5 }}>
                      <CheckIcon color="disabled" fontSize="small" />
                      <Typography variant="caption" display="block" color="text.disabled">
                        帯案件
                      </Typography>
                    </Box>
                  )
                )}
              </TableCell>

              {/* 詳細エリア */}
              <TableCell sx={{ width: '1200px', padding: '8px', height: '150px' }}>
                <Box sx={{ display: 'flex', gap: 1, fontSize: '0.8rem', height: '100%' }}>
                  {/* 左列: 基本情報 */}
                  <Box sx={{ flex: 0, minWidth: '200px', maxWidth: '200px' }}>
                    {/* イベント実施場所 */}
                    {editingRecord === record.id ? (
                      <Box 
                        sx={{ 
                          mb: 1,
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => handleEventLocationClick(e, record.id)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                          {record.eventLocation}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.3rem' }}>
                        {record.eventLocation}
                      </Typography>
                    )}
                    
                    {/* 担当マネージャー */}
                    {editingRecord === record.id ? (
                      <Box 
                        sx={{ 
                          mb: 1,
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => handleManagerClick(e, record.id)}
                      >
                        <Typography variant="body2">
                          {record.managerName} ({record.managerPhone})
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {record.managerName} ({record.managerPhone})
                      </Typography>
                    )}
                    
                    {/* 開催店舗・連名店舗 */}
                    <Box sx={{ mb: 1.5 }}>
                      {/* 開催店舗 */}
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', minWidth: '24px' }}>開催</Typography>
                        {editingRecord === record.id ? (
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                            {record.hostStore && (
                              <Chip
                                label={record.hostStore}
                                size="small"
                                sx={{
                                  backgroundColor: '#2196f3',
                                  color: 'white',
                                  fontWeight: 'normal',
                                  '& .MuiChip-deleteIcon': {
                                    color: 'white',
                                    '&:hover': {
                                      color: '#ffcdd2',
                                    },
                                  },
                                }}
                                onDelete={() => onRecordUpdate(record.id, { hostStore: [] })}
                              />
                            )}
                            <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleHostStoreAdd(record.id, e.target.value as string);
                                  }
                                }}
                                displayEmpty
                                renderValue={() => record.hostStore ? '変更' : '選択'}
            sx={{
                                  height: 24,
                                  minHeight: 24,
              '& .MuiSelect-select': {
                                    padding: '0 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.65rem',
                                    color: '#999',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px',
                                    minHeight: '24px !important',
                                    height: '24px !important',
                                    lineHeight: '24px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ccc',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#666',
                                    borderWidth: '1px',
                                  },
                                }}
                              >
                                {availableStores.map((store) => (
                                  <MenuItem key={store} value={store}>
                                    {store}
                                  </MenuItem>
                                ))}
          </Select>
        </FormControl>
                          </Box>
                        ) : (
                          record.hostStore && (
                            <Box sx={{ 
                              backgroundColor: '#e3f2fd', // 濃い青から薄い青に変更
                              color: '#1976d2', // テキスト色を濃い青に変更
                              px: 2.5, 
                              py: 0.7, 
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(227, 242, 253, 0.3)' // シャドウも薄く調整
                            }}>
                              {record.hostStore}
                            </Box>
                          )
                        )}
                      </Box>
                      
                      {/* 連名店舗 */}
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', minWidth: '24px' }}>連名</Typography>
                        {editingRecord === record.id ? (
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                            {record.partnerStores.map((store, index) => (
                              <Chip
                                key={index}
                                label={store}
            size="small"
                                sx={{
                                  backgroundColor: '#e0e0e0',
                                  color: '#666666',
                                  fontWeight: 'normal',
                                  '& .MuiChip-deleteIcon': {
                                    color: '#666',
                                    '&:hover': {
                                      color: '#d32f2f',
                                    },
                                  },
                                }}
                                onDelete={() => handlePartnerStoreRemove(record.id, index)}
                              />
                            ))}
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                              <Select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handlePartnerStoreAdd(record.id, e.target.value as string);
                                  }
                                }}
                                displayEmpty
                                renderValue={() => '追加'}
                sx={{
                                  height: 24,
                                  minHeight: 24,
                                  '& .MuiSelect-select': {
                                    padding: '0 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.65rem',
                                    color: '#999',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px',
                                    minHeight: '24px !important',
                                    height: '24px !important',
                                    lineHeight: '24px',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '12px',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ccc',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#666',
                                    borderWidth: '1px',
                                  },
                                }}
                              >
                                {availableStores
                                  .filter(store => !record.partnerStores.includes(store) && !record.hostStore.includes(store))
                                  .map((store) => (
                                    <MenuItem key={store} value={store}>
                                      {store}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
            </Box>
                        ) : (
                          record.partnerStores.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {record.partnerStores.map((store, index) => (
                                <Box key={index} sx={{ 
                                  backgroundColor: '#e0e0e0', 
                                  color: '#666666', 
                                  px: 1, 
                                  py: 0.3, 
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'normal'
                                }}>
                                  {store}
                                </Box>
                              ))}
                            </Box>
                          )
          )}
        </Box>
                    </Box>
                    
                    {/* フラグ */}
                    <Box>
                      {/* 2×2フラググリッド */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 0.5, alignItems: 'start', width: '180px' }}>
                        {/* 第1行左: 場所取りあり */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: editingRecord === record.id ? 'pointer' : (record.flags.hasLocationReservation ? 'pointer' : 'default'),
                            color: record.flags.hasLocationReservation ? '#4caf50' : '#ccc',
                            opacity: record.flags.hasLocationReservation ? 1 : (editingRecord === record.id ? 0.7 : 0.3),
                            '&:hover': editingRecord === record.id ? { 
                              opacity: 1,
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              margin: '-2px -4px'
                            } : (record.flags.hasLocationReservation ? {} : {})
                          }}
                          onClick={(e) => {
                            if (editingRecord === record.id) {
                              // 編集モード時はフラグのON/OFF切り替えのみ
                              onRecordUpdate(record.id, {
                                flags: {
                                  ...record.flags,
                                  hasLocationReservation: !record.flags.hasLocationReservation
                                }
                              });
                            } else if (record.flags.hasLocationReservation) {
                              handleLocationReservationClick(e, record);
                            }
                          }}
                        >
                          <LocationIcon fontSize="small" sx={{ color: 'inherit' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'inherit' }}>場所取り</Typography>
                          {/* 場所取りフラグがONかつ編集モードの場合に詳細ボタンを表示 */}
                          {record.flags.hasLocationReservation && editingRecord === record.id && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation(); // 親要素のクリックイベントを防ぐ
                                setLocationReservationModal({ recordId: record.id, open: true });
                              }}
                              sx={{
                                minWidth: '30px',
                                height: '16px',
                                fontSize: '0.5rem',
                                padding: '1px 3px',
                                borderColor: '#4caf50',
                                color: '#4caf50',
                                '&:hover': {
                                  borderColor: '#388e3c',
                                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                }
                              }}
                            >
                              詳細
                            </Button>
                          )}
                        </Box>
                        
                        {/* 第1行右: 外現場 */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: editingRecord === record.id ? 'pointer' : 'default',
                            color: record.flags.isExternalVenue ? '#ff9800' : '#ccc',
                            opacity: record.flags.isExternalVenue ? 1 : (editingRecord === record.id ? 0.7 : 0.3),
                            '&:hover': editingRecord === record.id ? { 
                              opacity: 1,
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              margin: '-2px -4px'
                            } : {}
                          }}
                          onClick={() => {
                            if (editingRecord === record.id) {
                              onRecordUpdate(record.id, {
                                flags: {
                                  ...record.flags,
                                  isExternalVenue: !record.flags.isExternalVenue
                                }
                              });
                            }
                          }}
                        >
                          <BusinessIcon fontSize="small" sx={{ color: 'inherit' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'inherit' }}>外現場</Typography>
                        </Box>

                        {/* 第2行左: 出張あり */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: editingRecord === record.id ? 'pointer' : 'default',
                            color: record.flags.hasBusinessTrip ? '#2196f3' : '#ccc',
                            opacity: record.flags.hasBusinessTrip ? 1 : (editingRecord === record.id ? 0.7 : 0.3),
                            '&:hover': editingRecord === record.id ? { 
                              opacity: 1,
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              margin: '-2px -4px'
                            } : {}
                          }}
                          onClick={() => {
                            if (editingRecord === record.id) {
                              onRecordUpdate(record.id, {
                                flags: {
                                  ...record.flags,
                                  hasBusinessTrip: !record.flags.hasBusinessTrip
                                }
                              });
                            }
                          }}
                        >
                          <FlagIcon fontSize="small" sx={{ color: 'inherit' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'inherit' }}>出張</Typography>
                        </Box>

                        {/* 第2行右: ディレクター必須 */}
                        <Box 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: editingRecord === record.id ? 'pointer' : 'default',
                            color: record.flags.requiresDirector ? '#9c27b0' : '#ccc',
                            opacity: record.flags.requiresDirector ? 1 : (editingRecord === record.id ? 0.7 : 0.3),
                            '&:hover': editingRecord === record.id ? { 
                              opacity: 1,
                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              margin: '-2px -4px'
                            } : {}
                          }}
                          onClick={() => {
                            if (editingRecord === record.id) {
                              onRecordUpdate(record.id, {
                                flags: {
                                  ...record.flags,
                                  requiresDirector: !record.flags.requiresDirector
                                }
                              });
                            }
                          }}
                        >
                          <SupervisorAccountIcon fontSize="small" sx={{ color: 'inherit' }} />
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'inherit' }}>Dir必須</Typography>
                        </Box>
                      </Box>

                      {/* イベント特性（2×2グリッドの下左揃え） */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.8, width: '180px' }}>
                        {editingRecord === record.id ? (
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <Select
                              value={record.eventType}
                              onChange={(e) => onRecordUpdate(record.id, {
                                eventType: e.target.value as EventType
                              })}
                              sx={{ 
                                height: '20px',
                                fontSize: '0.65rem',
                                '& .MuiOutlinedInput-input': {
                                  padding: '1px 4px'
                                }
                              }}
                            >
                              <MenuItem value="mall">モール</MenuItem>
                              <MenuItem value="external_sales">外販</MenuItem>
                              <MenuItem value="in_store">店内</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip 
                            label={getEventTypeLabel(record.eventType)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: '16px' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* 中央列: 枠集計表と無料入店 */}
                  <Box sx={{ flex: 1, minWidth: '350px', pl: 0 }}>
                    {/* 枠集計表 */}
                    <Table size="small" sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: '4px', ml: 0, tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '60px' }}>役割</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '40px', textAlign: 'center' }}>人数</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '60px', textAlign: 'right' }}>単価</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '60px', textAlign: 'right' }}>交通費</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5', width: '80px', textAlign: 'right' }}>売上</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', color: '#1976d2', fontWeight: 'bold', width: '60px' }}>
                            クローザー
        </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'center', width: '40px' }}>
                            {editingRecord === record.id ? (
          <TextField
                                value={record.quotaTable.closer.count}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    closer: { ...record.quotaTable.closer, count: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
            size="small"
                                type="number"
                                sx={{ 
                                  width: '36px',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'center'
                                  }
                                }}
          />
        ) : (
                              record.quotaTable.closer.count
        )}
      </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'right', width: '60px' }}>
                            {editingRecord === record.id ? (
          <TextField
                                value={record.quotaTable.closer.unitPrice}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    closer: { ...record.quotaTable.closer, unitPrice: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
            size="small"
                                type="number"
                                sx={{ 
                                  width: '56px',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'right'
                                  }
                                }}
          />
        ) : (
                              `¥${record.quotaTable.closer.unitPrice.toLocaleString()}`
        )}
      </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'right', width: '60px' }}>
                            {editingRecord === record.id ? (
                              <TextField
                                value={record.quotaTable.closer.transportFee}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    closer: { ...record.quotaTable.closer, transportFee: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
                                size="small"
                                type="number"
        sx={{ 
                                  width: '56px',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'right'
                                  }
                                }}
                              />
                            ) : (
                              `¥${record.quotaTable.closer.transportFee.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', fontWeight: 'bold', textAlign: 'right', width: '80px' }} rowSpan={2}>
                            ¥{calculateSales(record).toLocaleString()}
        </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', color: '#e91e63', fontWeight: 'bold', width: '60px' }}>
                            ガール
      </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'center', width: '40px' }}>
                            {editingRecord === record.id ? (
                              <TextField
                                value={record.quotaTable.girl.count}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    girl: { ...record.quotaTable.girl, count: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
          size="small"
                                type="number"
          sx={{ 
                                  width: '36px',
                                  '& .MuiOutlinedInput-root': {
            fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'center'
                                  }
                                }}
                              />
                            ) : (
                              record.quotaTable.girl.count
                            )}
      </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'right', width: '60px' }}>
                            {editingRecord === record.id ? (
                              <TextField
                                value={record.quotaTable.girl.unitPrice}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    girl: { ...record.quotaTable.girl, unitPrice: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
                                size="small"
                                type="number"
        sx={{ 
                                  width: '56px',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'right'
                                  }
                                }}
                              />
                            ) : (
                              `¥${record.quotaTable.girl.unitPrice.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', padding: '8px', textAlign: 'right', width: '60px' }}>
                            {editingRecord === record.id ? (
                              <TextField
                                value={record.quotaTable.girl.transportFee}
                                onChange={(e) => onRecordUpdate(record.id, { 
                                  quotaTable: { 
                                    ...record.quotaTable, 
                                    girl: { ...record.quotaTable.girl, transportFee: parseInt(e.target.value) || 0 }
                                  }
                                })}
                                variant="outlined"
                                size="small"
                                type="number"
          sx={{ 
                                  width: '56px',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: '0.75rem',
                                    height: '24px'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '2px 4px',
                                    textAlign: 'right'
                                  }
                                }}
                              />
                            ) : (
                              `¥${record.quotaTable.girl.transportFee.toLocaleString()}`
                            )}
      </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    {/* 無料入店人数 */}
                    {!record.isBandProject && (
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold', minWidth: '50px' }}>
                        無料入店
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {record.schedule.map((hasWork, index) => {
                          if (!hasWork) return null;
                          const date = weekDates[index];
                          const dayKey = `day${index + 1}`;
                          return (
                            <Box key={index} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', color: '#666' }}>
                                1/{date}
                              </Typography>
                              {editingRecord === record.id ? (
                                <TextField
                                  type="number"
                                  value={record.freeEntry[dayKey] || 0}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value) || 0;
                                    onRecordUpdate(record.id, {
                                      freeEntry: {
                                        ...record.freeEntry,
                                        [dayKey]: newValue
                                      }
                                    });
                                  }}
                                  size="small"
                                  variant="outlined"
          sx={{ 
                                    width: '50px',
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '0.75rem',
                                      height: '28px'
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      padding: '4px 6px',
                                      textAlign: 'center'
                                    }
                                  }}
                                  inputProps={{
                                    min: 0,
                                    max: 999
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                  {record.freeEntry[dayKey] || 0}人
                                </Typography>
            )}
          </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    )}
                  </Box>
                  
                  {/* 右列: 営業担当メモ */}
                  <Box sx={{ flex: 1, minWidth: '200px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box 
              sx={{
                        border: '1px solid #e0e0e0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        flex: 1,
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                        営業担当メモ
            </Typography>
                      {editingRecord === record.id ? (
                        <TextField
                          value={record.memo}
                          onChange={(e) => onRecordUpdate(record.id, { memo: e.target.value })}
                          variant="outlined"
                          size="small"
                          multiline
                          rows={3}
                          sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.6rem',
                              backgroundColor: 'white',
                              height: '80px'
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '4px 6px'
                            }
                          }}
                          placeholder="メモを入力..."
                        />
                      ) : (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', flex: 1 }}>
                          {record.memo || 'メモなし'}
                    </Typography>
            )}
          </Box>
            </Box>
        </Box>
      </TableCell>
    </TableRow>
            ))}
          </TableBody>
        </Table>
      
      {/* 担当者選択ポップアップ */}
      {assignedUserPopup && (
        <Dialog
          open={true}
          onClose={handleAssignedUserClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: assignedUserPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: assignedUserPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {assignedUserOptions.map((user) => (
                <Button
                key={user}
                fullWidth
              size="small" 
                variant="text"
              sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleAssignedUserSelect(assignedUserPopup.recordId, user)}
              >
                {user}
                </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* ステータス選択ポップアップ */}
      {statusPopup && (
        <Dialog
          open={true}
          onClose={handleStatusClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: statusPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: statusPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {statusOptions.map((status) => (
              <Button
                key={status}
                fullWidth
                size="small"
                variant="text"
          sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleStatusSelect(statusPopup.recordId, status)}
              >
                <Chip 
                  label={status} 
                  color={getStatusColor(status)}
              size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* 代理店選択ポップアップ */}
      {agencyPopup && (
        <Dialog
          open={true}
          onClose={handleAgencyClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: agencyPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: agencyPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '140px',
              maxWidth: '140px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {agencyOptions.map((agency) => (
              <Button
                key={agency}
              fullWidth
                size="small"
                variant="text"
          sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleAgencySelect(agencyPopup.recordId, agency)}
              >
                {agency}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 詳細ステータス選択ポップアップ */}
      {detailStatusPopup && (
        <Dialog
          open={true}
          onClose={handleDetailStatusClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: detailStatusPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: detailStatusPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '120px',
              maxWidth: '120px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {detailStatusOptions.map((status) => (
              <Button
                key={status}
                fullWidth
          size="small"
                variant="text"
          sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleDetailStatusSelect(detailStatusPopup.recordId, status)}
              >
                <Chip 
                  label={getDetailStatusDisplayText(status)} 
                  color={getDetailStatusColor(status)}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 曜日選択ポップアップ */}
      {dayTypePopup && (
        <Dialog
          open={true}
          onClose={handleDayTypeClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: dayTypePopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: dayTypePopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '100px',
              maxWidth: '100px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {dayTypeOptions.map((dayType) => (
              <Button
                key={dayType}
                fullWidth
                size="small"
                variant="text"
            sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleDayTypeSelect(dayTypePopup.recordId, dayType)}
              >
                {dayType}
              </Button>
            ))}
          </Box>
        </Dialog>
      )}
      
      {/* イベント実施場所選択ポップアップ */}
      {eventLocationPopup && (
        <Dialog
          open={true}
          onClose={handleEventLocationClose}
          PaperProps={{
            sx: {
                position: 'absolute',
              top: eventLocationPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: eventLocationPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '200px',
              maxWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {eventLocationOptions.map((location) => (
              <Button
                key={location}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleEventLocationSelect(eventLocationPopup.recordId, location)}
              >
                {location}
              </Button>
            ))}
            </Box>
        </Dialog>
      )}

      {/* 担当MG選択ポップアップ */}
      {managerPopup && (
        <Dialog
          open={true}
          onClose={handleManagerClose}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: managerPopup.anchorEl.getBoundingClientRect().bottom + window.scrollY,
              left: managerPopup.anchorEl.getBoundingClientRect().left + window.scrollX,
              margin: 0,
              minWidth: '220px',
              maxWidth: '220px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' }
          }}
        >
          <Box sx={{ p: 1 }}>
            {managerOptions.map((manager) => (
              <Button
                key={manager.name}
                fullWidth
                size="small"
                variant="text"
                sx={{ 
                  justifyContent: 'flex-start',
                  fontSize: '0.8rem',
                  py: 0.5,
                  minHeight: '28px',
                  '&:hover': { backgroundColor: '#e3f2fd' }
                }}
                onClick={() => handleManagerSelect(managerPopup.recordId, manager)}
              >
                {manager.name} ({manager.phone})
              </Button>
            ))}
          </Box>
        </Dialog>
      )}

      {/* 選択ポップアップ群 */}
      <SelectionPopups
        assignedUserPopup={assignedUserPopup}
        statusPopup={statusPopup}
        agencyPopup={agencyPopup}
        detailStatusPopup={detailStatusPopup}
        dayTypePopup={dayTypePopup}
        eventLocationPopup={eventLocationPopup}
        managerPopup={managerPopup}
        onAssignedUserClose={handleAssignedUserClose}
        onAssignedUserSelect={handleAssignedUserSelect}
        onStatusClose={handleStatusClose}
        onStatusSelect={handleStatusSelect}
        onAgencyClose={handleAgencyClose}
        onAgencySelect={handleAgencySelect}
        onDetailStatusClose={handleDetailStatusClose}
        onDetailStatusSelect={handleDetailStatusSelect}
        onDayTypeClose={handleDayTypeClose}
        onDayTypeSelect={handleDayTypeSelect}
        onEventLocationClose={handleEventLocationClose}
        onEventLocationSelect={handleEventLocationSelect}
        onManagerClose={handleManagerClose}
        onManagerSelect={handleManagerSelect}
      />
      
      {/* 場所取り詳細ツールチップ */}
      {locationTooltip && (
        <Tooltip
          open={true}
          title={
            <Box sx={{ p: 2, minWidth: '400px' }}>
              {(() => {
                const record = records.find(r => r.id === locationTooltip.recordId);
                const locationData = record?.locationReservations?.[0]; // 最初のレコードを表示
                if (!locationData) return null;

  return (
    <Box>
                    <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '8px' }}>日付</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '8px' }}>ステータス</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '8px' }}>手配会社</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '8px', textAlign: 'right' }}>卸単価</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', padding: '8px', textAlign: 'right' }}>仕入れ単価</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem', border: '1px solid #e0e0e0', padding: '8px' }}>{locationData.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', border: '1px solid #e0e0e0', padding: '8px' }}>{locationData.status}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', border: '1px solid #e0e0e0', padding: '8px' }}>{locationData.arrangementCompany}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', border: '1px solid #e0e0e0', padding: '8px', textAlign: 'right' }}>¥{locationData.wholesalePrice.toLocaleString()}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', border: '1px solid #e0e0e0', padding: '8px', textAlign: 'right' }}>¥{locationData.purchasePrice.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
                  </Box>
                );
              })()}
            </Box>
          }
          placement="top"
          onClose={handleLocationTooltipClose}
          PopperProps={{
            anchorEl: locationTooltip.anchorEl,
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'white',
                color: 'black',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                maxWidth: 'none'
              }
            }
          }}
        >
          <Box />
        </Tooltip>
      )}
      
      {/* 場所取り詳細モーダル */}
      {locationReservationModal && (
        <LocationReservationModal
          open={locationReservationModal.open}
          recordId={locationReservationModal.recordId}
          reservations={records.find(r => r.id === locationReservationModal.recordId)?.locationReservations || []}
          onClose={handleLocationReservationModalClose}
          onAdd={handleLocationReservationAdd}
          onRemove={handleLocationReservationRemove}
          onUpdate={handleLocationReservationUpdate}
        />
      )}
      
      {/* 詳細情報Drawer */}
      {detailDrawer && (
        <SalesDetailDrawer
          open={detailDrawer.open}
        onClose={handleDetailDrawerClose}
          record={records.find(r => r.id === detailDrawer.recordId) || null}
          dayNames={dayNames}
          weekDates={weekDates}
          onUpdate={(updates) => {
            if (detailDrawer.recordId) {
              onRecordUpdate(detailDrawer.recordId, updates);
            }
          }}
        />
      )}
      
      {/* 右クリックメニュー */}
      {contextMenu && (
        <Menu
          open={true}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
          }}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #e0e0e0',
              minWidth: '150px',
            }
          }}
        >
          <MenuItem
            onClick={handleDeleteFromContext}
                sx={{
              color: '#f4212e',
              fontSize: '0.9rem',
              py: 1.5,
              px: 2,
                  '&:hover': {
                backgroundColor: 'rgba(244, 33, 46, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#f4212e' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="削除" 
              primaryTypographyProps={{ 
                            fontSize: '0.9rem',
                fontWeight: '600' 
              }} 
            />
          </MenuItem>
        </Menu>
      )}

      {/* 削除確認ダイアログ群 */}
      <DeleteConfirmDialog
        recordDeleteOpen={deleteConfirm?.open || false}
        onRecordDeleteCancel={handleRecordDeleteCancel}
        onRecordDeleteConfirm={handleRecordDeleteConfirm}
        messageDeleteOpen={messageDeleteConfirm?.open || false}
        onMessageDeleteCancel={handleDeleteCancel}
        onMessageDeleteConfirm={() => {
          if (messageDeleteConfirm?.messageId) {
            handleDeleteMessage(messageDeleteConfirm.messageId);
          }
        }}
      />

      {/* 新規追加ダイアログ */}
      <AddRecordDialog
        open={addRecordDialog}
        form={newRecordForm}
        onClose={handleAddRecordDialogClose}
        onFormChange={handleFormChange}
        onConfirm={handleConfirmAddRecord}
      />
    </TableContainer>
                </Box>
  );
};

export default SalesTable; 