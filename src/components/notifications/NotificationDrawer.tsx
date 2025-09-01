'use client';

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  Fade,
  styled,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  Close as CloseIcon,
  NotificationsOutlined as NotificationIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Visibility as UnreadIcon
} from '@mui/icons-material';
import { ShiftNotification, NotificationFilter, useShiftStore } from '@/stores/shiftStore';
import NotificationItem from './NotificationItem';
import ChangeRequestDetailDialog from './ChangeRequestDetailDialog';

// スタイル定義
const DrawerContent = styled(Box)(({ theme }) => ({
  width: 400,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: 350,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const DropdownSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));



const NotificationList = styled(List)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: 4,
  },
}));

interface NotificationDrawerProps {
  /** ドロワーの開閉状態 */
  open: boolean;
  /** 通知リスト */
  notifications: ShiftNotification[];
  /** 現在のフィルター */
  filter: NotificationFilter;
  /** 未読件数 */
  unreadCount: number;
  /** ドロワーを閉じる */
  onClose: () => void;
  /** フィルターを変更 */
  onFilterChange: (filter: NotificationFilter) => void;
  /** 通知を既読にマーク */
  onMarkAsRead: (id: string) => void;
  /** 通知アイテムクリック時 */
  onNotificationClick?: (notification: ShiftNotification) => void;
}

/**
 * 通知ドロワーコンポーネント
 * 
 * 右側からスライドインする通知一覧表示。
 * フィルター機能、一括操作、詳細表示機能を提供。
 */
const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  notifications,
  filter,
  unreadCount,
  onClose,
  onFilterChange,
  onMarkAsRead,
  onNotificationClick
}) => {
  const [selectedNotification, setSelectedNotification] = useState<ShiftNotification | null>(null);
  
  // ストアから全ての通知と必要な関数を取得
  const { notifications: allNotifications, getChangeRequestStatus } = useShiftStore();

  // フィルター別の件数を正しく計算
  const filterCounts = useMemo(() => {
    const counts = {
      all: allNotifications.length,
      unread: allNotifications.filter(n => !n.read).length,
      submission: allNotifications.filter(n => n.type === 'shift_submission').length,
      change: allNotifications.filter(n => n.type === 'change_request').length,
      pending: allNotifications.filter(n => {
        if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
          const status = getChangeRequestStatus(n.shiftDetails.relatedShiftId);
          return status === 'pending';
        }
        return false;
      }).length,
      approved: allNotifications.filter(n => {
        if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
          const status = getChangeRequestStatus(n.shiftDetails.relatedShiftId);
          return status === 'completed';
        }
        return false;
      }).length,
    };
    return counts;
  }, [allNotifications, getChangeRequestStatus]);

  // フィルターオプション
  interface FilterOption {
    key: NotificationFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
  }

  const filterOptions: FilterOption[] = [
    { 
      key: 'all', 
      label: '全ての通知', 
      icon: <NotificationIcon fontSize="small" />, 
      count: filterCounts.all
    },
    { 
      key: 'unread', 
      label: '未読のみ', 
      icon: <UnreadIcon fontSize="small" />, 
      count: filterCounts.unread
    },
    { 
      key: 'submission', 
      label: 'シフト提出', 
      icon: <AssignmentIcon fontSize="small" />, 
      count: filterCounts.submission
    },
    { 
      key: 'change', 
      label: '変更依頼', 
      icon: <ScheduleIcon fontSize="small" />, 
      count: filterCounts.change
    },
    { 
      key: 'pending', 
      label: '承認待ち', 
      icon: <PendingIcon fontSize="small" />, 
      count: filterCounts.pending
    },
    { 
      key: 'approved', 
      label: '回答済み', 
      icon: <CheckCircleIcon fontSize="small" />, 
      count: filterCounts.approved
    },
  ];

  // 通知アイテムクリック処理
  const handleNotificationClick = (notification: ShiftNotification) => {
    // 未読の場合は既読にマーク
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // 変更依頼の場合は詳細ダイアログを開く
    if (notification.type === 'change_request') {
      setSelectedNotification(notification);
    }

    // 外部ハンドラーを実行
    onNotificationClick?.(notification);
  };

  // 詳細ダイアログを閉じる
  const handleDetailDialogClose = () => {
    setSelectedNotification(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // パフォーマンス向上
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'background.default',
          }
        }}
      >
        <DrawerContent>
          {/* ヘッダー部分 */}
          <HeaderSection>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationIcon />
                通知 ({unreadCount})
              </Typography>
              <IconButton 
                onClick={onClose}
                aria-label="通知ドロワーを閉じる"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            {/* ドロップダウンフィルター */}
            <FilterSection>
              <FormControl fullWidth size="small">
                <DropdownSelect
                  value={filter}
                  onChange={(e: SelectChangeEvent) => onFilterChange(e.target.value as NotificationFilter)}
                  displayEmpty
                  startAdornment={<FilterIcon sx={{ color: 'text.secondary', mr: 1 }} />}
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {option.icon}
                        <Typography sx={{ flex: 1 }}>{option.label}</Typography>
                        <Box
                          sx={{
                            backgroundColor: option.count > 0 ? 'primary.main' : 'grey.300',
                            color: option.count > 0 ? 'primary.contrastText' : 'grey.600',
                            borderRadius: '12px',
                            px: 1,
                            py: 0.25,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            minWidth: 24,
                            textAlign: 'center',
                          }}
                        >
                          {option.count}
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </DropdownSelect>
              </FormControl>
            </FilterSection>
            

          </HeaderSection>
          
          <Divider />
          
          {/* 通知リスト */}
          <NotificationList>
            {notifications.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '50%',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <NotificationIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {filter === 'all' ? '通知はありません' : 'フィルター条件に一致する通知はありません'}
                </Typography>
                <Typography variant="caption">
                  {filter === 'all' 
                    ? '新しい通知があると、ここに表示されます'
                    : '別のフィルター条件を試してみてください'
                  }
                </Typography>
              </Box>
            ) : (
              <Fade in={true} timeout={300}>
                <Box>
                  {notifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      delay={index * 50} // アニメーション遅延
                    />
                  ))}
                </Box>
              </Fade>
            )}
          </NotificationList>
        </DrawerContent>
      </Drawer>

      {/* 変更依頼詳細ダイアログ */}
      {selectedNotification && selectedNotification.type === 'change_request' && (
        <ChangeRequestDetailDialog
          open={true}
          notification={selectedNotification}
          onClose={handleDetailDialogClose}
        />
      )}
    </>
  );
};

export default NotificationDrawer;