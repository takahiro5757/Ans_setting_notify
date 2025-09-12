'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  styled,
  Fade,
  Collapse,
  Zoom
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useShiftStore } from '@/stores/shiftStore';
import AddNotificationButton from '@/components/notifications/AddNotificationButton';
import ChangeRequestDetailDialog from '@/components/notifications/ChangeRequestDetailDialog';

// スタイル定義
const NotificationCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'notificationType',
})<{ notificationType: string }>(({ theme, notificationType }) => {
  // 通知タイプ別のアクセントカラーを決定
  const getAccentColor = () => {
    switch (notificationType) {
      case 'shift_submission':
        return '#1976d2'; // 青色
      case 'change_request':
        return '#ed6c02'; // オレンジ色
      case 'approval':
        return '#2e7d32'; // 緑色
      case 'rejection':
        return '#d32f2f'; // 赤色
      default:
        return '#757575'; // グレー
    }
  };

  return {
    marginBottom: theme.spacing(3),
    backgroundColor: 'white',
    borderLeft: `4px solid ${getAccentColor()}`,
    cursor: 'default',
    transition: 'all 200ms ease-out',
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[1],
    '&:hover': {
      boxShadow: theme.shadows[3],
      transform: 'translateY(-2px)',
    },
  };
});



const TimeStamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
}));

const NotificationTypeChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'notificationType',
})<{ notificationType: string }>(({ theme, notificationType }) => {
  const getTypeColor = () => {
    switch (notificationType) {
      case 'shift_submission':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'change_request':
        return { bg: '#fff3e0', color: '#ed6c02' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const colors = getTypeColor();
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    backgroundColor: colors.bg,
    color: colors.color,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    fontWeight: 600,
  };
});

// 相対時間を計算する関数
const getRelativeTime = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'たった今';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}時間前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}日前`;
  }
};

export default function Home() {
  const router = useRouter();
  const { notifications, markNotificationAsRead } = useShiftStore();
  
  // クライアントサイドでのみ相対時間を表示するためのフラグ
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 詳細ダイアログの状態管理
  const [selectedNotification, setSelectedNotification] = React.useState<any>(null);
  
  // アニメーション用の状態管理
  const [removingNotifications, setRemovingNotifications] = React.useState<Set<string>>(new Set());
  const [shrinkingNotifications, setShrinkingNotifications] = React.useState<Set<string>>(new Set());
  const [animatingNotifications, setAnimatingNotifications] = React.useState<Set<string>>(new Set());

  // 新規通知（未読）のみを取得
  const unreadNotifications = notifications
    .filter(n => !n.read)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // 表示用通知（最新5件 + アニメーション中の通知は継続表示）
  const newNotifications = notifications
    .filter(n => !n.read || animatingNotifications.has(n.id))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
  
  console.log('📊 新規通知一覧:', newNotifications.map(n => ({ type: n.type, id: n.id, message: n.message })));

  // 通知タイプ別の表示情報を取得
  const getNotificationDisplay = (notification: any) => {
    switch (notification.type) {
      case 'shift_submission':
        return {
          icon: <AssignmentIcon />,
          title: 'シフト提出',
          message: 'シフトが提出されました'
        };
      case 'change_request':
        return {
          icon: <ScheduleIcon />,
          title: 'シフト変更依頼',
          message: `${notification.shiftDetails.staffCount}名のスタッフから変更依頼が届いています`
        };
      default:
        return {
          icon: <AssignmentIcon />,
          title: '通知',
          message: notification.message
        };
    }
  };

  // 通知アクション処理
  const handleNotificationAction = (notificationId: string, action: string) => {
    markNotificationAsRead(notificationId);
    // 実際の処理はここで行う（承認・却下など）
    console.log(`${action} action for notification ${notificationId}`);
  };

  // 変更依頼詳細ダイアログ表示
  const handleChangeRequestDetail = (notification: any) => {
    console.log('🎬 変更依頼縮小アニメーション開始:', notification.id);

    // 第0段階: アニメーション中として登録（既読後も表示継続）
    setAnimatingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.id);
      console.log('🎭 アニメーション中登録:', Array.from(newSet));
      return newSet;
    });
    
    // 第1段階: チェックマーク表示
    setRemovingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.id);
      console.log('📝 チェックマーク表示:', Array.from(newSet));
      return newSet;
    });
    
    // 第2段階: 縮小開始
    setTimeout(() => {
      console.log('🔍 滑らか縮小開始:', notification.id);
      setShrinkingNotifications(prev => {
        const newSet = new Set(prev);
      newSet.add(notification.id);
        return newSet;
      });
    }, 500); // チェックマーク表示時間を短縮
    
    // 第3段階: 既読処理 + ダイアログ表示（アニメーション継続）
    setTimeout(() => {
      console.log('✅ 既読処理実行:', notification.id);
      markNotificationAsRead(notification.id);
      setSelectedNotification(notification);
    }, 500); // ダイアログを早めに表示
    
    // 第4段階: アニメーション完了後のクリーンアップ
    setTimeout(() => {
      console.log('🎬 アニメーション完了、クリーンアップ開始:', notification.id);
      setRemovingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
      setShrinkingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
      setAnimatingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        console.log('🔄 アニメーション完了、残り:', Array.from(newSet));
        return newSet;
      });
    }, 1450); // カード縮小アニメーション(0.8秒) + Collapseアニメーション(0.6秒) + 余裕(0.05秒) = 1.45秒
  };

  // シフト提出通知のクリック処理
  const handleShiftSubmissionClick = (notification: any) => {
    console.log('🎬 縮小アニメーション開始:', notification.id);

    // 第0段階: アニメーション中として登録（既読後も表示継続）
    setAnimatingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.id);
      console.log('🎭 アニメーション中登録:', Array.from(newSet));
      return newSet;
    });
    
    // 第1段階: チェックマーク表示
    setRemovingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notification.id);
      console.log('📝 チェックマーク表示:', Array.from(newSet));
      return newSet;
    });
    
    // 第2段階: 縮小開始
    setTimeout(() => {
      console.log('🔍 滑らか縮小開始:', notification.id);
      setShrinkingNotifications(prev => {
        const newSet = new Set(prev);
      newSet.add(notification.id);
        return newSet;
      });
    }, 500); // チェックマーク表示時間を短縮
    
    // 第3段階: 既読処理（アニメーション継続）
    setTimeout(() => {
      console.log('✅ 既読処理実行:', notification.id);
      markNotificationAsRead(notification.id);
    }, 500); // 早めに既読処理
    
    // 第4段階: アニメーション完了後のクリーンアップ
    setTimeout(() => {
      console.log('🎬 アニメーション完了、クリーンアップ開始:', notification.id);
      setRemovingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
      setShrinkingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
      setAnimatingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        console.log('🔄 アニメーション完了、残り:', Array.from(newSet));
        return newSet;
      });
    }, 1450); // カード縮小アニメーション(0.8秒) + Collapseアニメーション(0.6秒) + 余裕(0.05秒) = 1.45秒
  };

  // 詳細ダイアログを閉じる
  const handleDetailDialogClose = () => {
    setSelectedNotification(null);
  };


  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth="lg">
        {/* ヘッダー部分 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1B3C8C', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon sx={{ fontSize: '2rem' }} />
            新着通知
          </Typography>
          <Typography variant="body1" color="text.secondary">
            未読の通知が {unreadNotifications.length} 件あります
          </Typography>
        </Box>

        {/* 新規通知一覧 */}
        {newNotifications.length > 0 ? (
          <Box sx={{ mb: 6 }}>
            {newNotifications.map((notification, index) => {
              const display = getNotificationDisplay(notification);
              return (
                <Collapse 
                  in={!shrinkingNotifications.has(notification.id)} 
                  timeout={{ enter: 300, exit: 800 }}
                  unmountOnExit
                  key={notification.id}
                >
                  <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
                    <div
                      onClick={() => {
                        console.log('🖱️ 通知クリック:', notification.type, notification.id);
                        if (notification.type === 'change_request') {
                          console.log('🔄 変更依頼詳細を開く');
                          handleChangeRequestDetail(notification);
                        } else if (notification.type === 'shift_submission') {
                          console.log('📝 シフト提出をクリック');
                          handleShiftSubmissionClick(notification);
                        } else {
                          console.log('❓ 未知の通知タイプ:', notification.type);
                        }
                      }}
                      style={{ 
                        cursor: 'pointer',
                        transition: shrinkingNotifications.has(notification.id) 
                          ? 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                          : 'transform 0.3s ease-out, opacity 0.3s ease-out, box-shadow 0.3s ease-out',
                        transformOrigin: 'center center',
                        transform: shrinkingNotifications.has(notification.id) 
                          ? 'scale(0.01) translateZ(0)' 
                          : 'scale(1) translateZ(0)',
                        opacity: shrinkingNotifications.has(notification.id) ? 0 : 1,
                        borderRadius: '8px',
                        marginBottom: '16px',
                        boxShadow: shrinkingNotifications.has(notification.id) 
                          ? '0 0 0 rgba(0,0,0,0)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: removingNotifications.has(notification.id) ? 10 : 1,
                        willChange: shrinkingNotifications.has(notification.id) ? 'transform, opacity, box-shadow' : 'auto',
                        backfaceVisibility: 'hidden',
                        perspective: 1000
                      }}
                    >
                      <NotificationCard 
                        notificationType={notification.type}
                        sx={{ 
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {/* アイコン */}
                        <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                          {display.icon}
                        </Box>

                        {/* メイン情報 */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <NotificationTypeChip notificationType={notification.type}>
                              {display.title}
                            </NotificationTypeChip>
                            <TimeStamp>
                              {isClient ? getRelativeTime(notification.timestamp) : '読み込み中...'}
                            </TimeStamp>
                          </Box>

                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                            {notification.shiftDetails.storeName} {notification.shiftDetails.targetMonth}月分の{display.title}
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            {display.message}
                          </Typography>

                          {/* 詳細情報 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                2次店: {notification.shiftDetails.storeName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EventIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                対象: {notification.shiftDetails.targetYear}年{notification.shiftDetails.targetMonth}月
                              </Typography>
                            </Box>
                            {notification.type === 'change_request' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PeopleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  対象スタッフ: {notification.shiftDetails.staffCount}名
                                </Typography>
                              </Box>
                            )}
                          </Box>

                        </Box>
                      </Box>
                        </CardContent>
                        
                                {/* シンプルで分かりやすいオーバーレイ */}
                                {removingNotifications.has(notification.id) && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'rgba(255, 255, 255, 0.95)',
                                      backdropFilter: 'blur(2px)',
                                      zIndex: 20,
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {/* シンプルな成功インジケーター */}
                                    <Box
                                      sx={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: '#4caf50',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                                        animation: 'simpleAppear 0.3s ease-out',
                                        '@keyframes simpleAppear': {
                                          '0%': {
                                            transform: 'scale(0)',
                                            opacity: 0
                                          },
                                          '100%': {
                                            transform: 'scale(1)',
                                            opacity: 1
                                          }
                                        }
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          color: 'white',
                                          fontSize: '28px',
                                          fontWeight: 'bold',
                                          lineHeight: 1
                                        }}
                                      >
                                        ✓
                                      </Box>
                                    </Box>
                                  </Box>
                                )}
                      </NotificationCard>
                    </div>
                  </Fade>
                </Collapse>
              );
            })}
            
            {/* 5件を超える場合の表示 */}
            {unreadNotifications.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  他に {unreadNotifications.length - 5} 件の未読通知があります
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // 新規通知がない場合
          <Box sx={{ textAlign: 'center', py: 8, mb: 6 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              すべて確認済みです
            </Typography>
            <Typography variant="body2" color="text.secondary">
              新しい通知があると、ここに表示されます
            </Typography>
          </Box>
        )}

                        {/* 通知テスト用ボタン */}
        <AddNotificationButton />
      </Container>
      
      {/* 変更依頼詳細ダイアログ */}
      {selectedNotification && selectedNotification.type === 'change_request' && (
        <ChangeRequestDetailDialog
          open={true}
          notification={selectedNotification}
          onClose={handleDetailDialogClose}
        />
      )}
    </Box>
  );
} 