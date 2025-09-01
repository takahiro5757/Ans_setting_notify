'use client';

import React from 'react';
import { IconButton, Badge, styled } from '@mui/material';
import { 
  NotificationsOutlined as NotificationsIcon,
  NotificationsNoneOutlined as NotificationsNoneIcon,
  NotificationsActiveOutlined as NotificationsActiveIcon 
} from '@mui/icons-material';

// カスタムスタイル定義
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  width: 40,
  height: 40,
  marginLeft: theme.spacing(1),
  position: 'relative',
  transition: 'all 200ms ease-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    transform: 'scale(1.1)',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f44336',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    border: '2px solid white',
  },
  '& .MuiBadge-badge.urgent': {
    backgroundColor: '#d32f2f',
    animation: 'notification-pulse 2s ease-in-out infinite',
  }
}));

// アニメーション用スタイル
const NotificationPulse = styled('div')({
  '@keyframes notification-pulse': {
    '0%': { backgroundColor: '#f44336' },
    '50%': { backgroundColor: '#d32f2f' },
    '100%': { backgroundColor: '#f44336' },
  }
});

interface NotificationIconProps {
  /** 未読通知数 */
  unreadCount: number;
  /** 緊急通知があるかどうか */
  hasUrgent?: boolean;
  /** クリック時のハンドラー */
  onClick: () => void;
}

/**
 * 通知アイコンコンポーネント
 * 
 * ヘッダーに表示される通知ベルアイコン。
 * 未読件数をバッジで表示し、緊急通知がある場合はアニメーション効果を追加。
 */
const NotificationIcon: React.FC<NotificationIconProps> = ({
  unreadCount,
  hasUrgent = false,
  onClick
}) => {
  // アイコンの種類を決定
  const getIcon = () => {
    if (hasUrgent) {
      return <NotificationsActiveIcon />;
    } else if (unreadCount > 0) {
      return <NotificationsIcon />;
    } else {
      return <NotificationsNoneIcon />;
    }
  };

  // バッジの色とアニメーションを決定
  const getBadgeClass = () => {
    return hasUrgent ? 'urgent' : '';
  };

  return (
    <>
      <NotificationPulse />
      <StyledIconButton
        onClick={onClick}
        aria-label={`通知 ${unreadCount}件の未読`}
        aria-describedby="notification-tooltip"
      >
        <StyledBadge 
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          max={99}
          className={getBadgeClass()}
          invisible={unreadCount === 0}
        >
          {getIcon()}
        </StyledBadge>
      </StyledIconButton>
    </>
  );
};

export default NotificationIcon;