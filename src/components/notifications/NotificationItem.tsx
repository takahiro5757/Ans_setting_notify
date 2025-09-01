'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Fade,
  Chip,
  styled
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as DefaultIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { ShiftNotification, useShiftStore } from '@/stores/shiftStore';

// スタイル定義
const StyledCard = styled(Card)<{ isRead: boolean; accentColor: string }>(({ theme, isRead, accentColor }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: isRead ? 'white' : `rgba(25, 118, 210, 0.04)`,
  borderLeft: `4px solid ${accentColor}`,
  cursor: 'pointer',
  transition: 'all 200ms ease-out',
  '&:hover': {
    backgroundColor: isRead ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2],
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginRight: theme.spacing(1),
}));

const ContentContainer = styled(Box)({
  flex: 1,
  minWidth: 0, // テキストオーバーフロー対応
});



const MessageText = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.4,
});

interface NotificationItemProps {
  /** 通知データ */
  notification: ShiftNotification;
  /** クリック時のハンドラー */
  onClick: () => void;
  /** アニメーション遅延時間（ms） */
  delay?: number;
}

/**
 * 通知アイテムコンポーネント
 * 
 * 個別の通知を表示するカード形式のコンポーネント。
 * 通知タイプに応じたアイコンと色分けを行う。
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  delay = 0
}) => {
  const { getChangeRequestStatus, getChangeRequestSummary, getChangeRequestStaffNames } = useShiftStore();
  // 変更依頼のステータス情報を取得
  const getChangeRequestInfo = () => {
    if (notification.type !== 'change_request' || !notification.shiftDetails.relatedShiftId) {
      return null;
    }
    
    const status = getChangeRequestStatus(notification.shiftDetails.relatedShiftId);
    const summary = getChangeRequestSummary(notification.shiftDetails.relatedShiftId);
    const staffNames = getChangeRequestStaffNames(notification.shiftDetails.relatedShiftId);
    
    return { status, summary, staffNames };
  };

  const changeRequestInfo = getChangeRequestInfo();

  // ステータス表示コンポーネント
  const StatusChip = ({ status, summary, staffNames }: { status: string, summary: any, staffNames: any }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return { 
            label: `承認待ち (${summary.pending}/${summary.total})`, 
            color: 'warning' as const, 
            icon: <PendingIcon sx={{ fontSize: 14 }} /> 
          };
        case 'completed':
          return { 
            label: '回答済み', 
            color: 'success' as const, 
            icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> 
          };
        default:
          return { 
            label: '不明', 
            color: 'default' as const, 
            icon: <DefaultIcon sx={{ fontSize: 14 }} /> 
          };
      }
    };

    const config = getStatusConfig(status);
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ 
          height: 24,
          fontSize: '0.75rem',
          '& .MuiChip-icon': { 
            marginLeft: '4px',
            marginRight: '-2px'
          }
        }}
      />
    );
  };

  // 通知タイプに応じたアイコンを取得
  const getIcon = (type: ShiftNotification['type']) => {
    const iconProps = { fontSize: 'small' as const };
    
    switch (type) {
      case 'shift_submission':
        return <AssignmentIcon color="primary" {...iconProps} />;
      case 'change_request':
        return <ScheduleIcon color="warning" {...iconProps} />;
      default:
        return <DefaultIcon {...iconProps} />;
    }
  };

  // 通知タイプに応じたアクセントカラーを取得
  const getAccentColor = (type: ShiftNotification['type']) => {
    switch (type) {
      case 'shift_submission':
        return '#1976d2'; // 青色
      case 'change_request':
        return '#ed6c02'; // オレンジ色
      default:
        return '#757575'; // グレー
    }
  };

  // 通知タイプのラベルを取得
  const getTypeLabel = (type: ShiftNotification['type']) => {
    switch (type) {
      case 'shift_submission':
        return 'シフトの提出';
      case 'change_request':
        return 'シフト変更依頼';
      default:
        return '';
    }
  };



  const accentColor = getAccentColor(notification.type);

  return (
    <Fade in={true} timeout={300} style={{ transitionDelay: `${delay}ms` }}>
      <StyledCard
        isRead={notification.read}
        accentColor={accentColor}
        onClick={onClick}
        elevation={notification.read ? 0 : 1}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <IconContainer>
              {getIcon(notification.type)}
            </IconContainer>
            
            <ContentContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.primary"
                    sx={{ 
                      fontWeight: notification.read ? 'normal' : 'bold',
                      lineHeight: 1.2 
                    }}
                  >
                    {getTypeLabel(notification.type)}
                  </Typography>
                  {/* ステータス表示（変更依頼の場合、タイトル右に配置） */}
                  {changeRequestInfo && (
                    <StatusChip 
                      status={changeRequestInfo.status} 
                      summary={changeRequestInfo.summary} 
                      staffNames={changeRequestInfo.staffNames}
                    />
                  )}
                </Box>
                {!notification.read && (
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '4px',
                      px: 0.5,
                      py: 0.25,
                      fontSize: '0.625rem',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      minWidth: '28px',
                      textAlign: 'center'
                    }}
                  >
                    NEW
                  </Box>
                )}
              </Box>
              
              <MessageText 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  fontWeight: notification.read ? 'normal' : 'bold'
                }}
              >
                {notification.message}
              </MessageText>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {notification.timestamp.toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              

              

            </ContentContainer>
          </Box>
        </CardContent>
      </StyledCard>
    </Fade>
  );
};

export default NotificationItem;