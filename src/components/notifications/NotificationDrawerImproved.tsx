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
  styled
} from '@mui/material';
import { 
  Close as CloseIcon,
  NotificationsOutlined as NotificationIcon 
} from '@mui/icons-material';
import { ShiftNotification, NotificationFilter } from '@/stores/shiftStore';
import NotificationItem from './NotificationItem';
import ChangeRequestDetailDialog from './ChangeRequestDetailDialog';
import ImprovedNotificationFilter from './ImprovedNotificationFilter';

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

interface NotificationDrawerImprovedProps {
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
  /** フィルタースタイル */
  filterVariant?: 'dropdown' | 'accordion' | 'tabs' | 'segments';
}

/**
 * 改善された通知ドロワーコンポーネント
 * 
 * 新しいフィルターデザインを統合した通知ドロワー
 */
const NotificationDrawerImproved: React.FC<NotificationDrawerImprovedProps> = ({
  open,
  notifications,
  filter,
  unreadCount,
  onClose,
  onFilterChange,
  onMarkAsRead,
  onNotificationClick,
  filterVariant = 'dropdown'
}) => {
  const [selectedNotification, setSelectedNotification] = useState<ShiftNotification | null>(null);

  // フィルター別の件数を計算
  const filterCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      submission: notifications.filter(n => n.type === 'shift_submission').length,
      change: notifications.filter(n => n.type === 'change_request').length,
      pending: notifications.filter(n => n.type === 'change_request' && !n.read).length,
      approved: notifications.filter(n => n.type === 'approval').length,
    };
    return counts;
  }, [notifications]);

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
            
            {/* 改善されたフィルター */}
            <ImprovedNotificationFilter
              variant={filterVariant}
              filter={filter}
              onFilterChange={onFilterChange}
              filterCounts={filterCounts}
            />
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

export default NotificationDrawerImproved;