'use client';

import { Box, AppBar, Toolbar, Button, Typography, Avatar, Popper, Paper, MenuList, MenuItem, Grow, ClickAwayListener } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';
import React, { useState, useRef, useEffect } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useShiftStore } from '@/stores/shiftStore';
import NotificationIcon from './notifications/NotificationIcon';
import NotificationDrawer from './notifications/NotificationDrawer';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 通知ストアから必要な値を取得
  const {
    getUnreadCount,
    getFilteredNotifications,
    notificationFilter,
    setNotificationFilter,
    markNotificationAsRead,
    clearAllNotifications
  } = useShiftStore();
  
  // 通知関連の状態管理
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const unreadCount = getUnreadCount();
  const filteredNotifications = getFilteredNotifications();
  

  
  // シフト管理メニューの状態管理
  const [shiftsMenuOpen, setShiftsMenuOpen] = useState(false);
  const shiftsAnchorRef = useRef<HTMLButtonElement>(null);

  // 経理処理メニューの状態管理
  const [accountingMenuOpen, setAccountingMenuOpen] = useState(false);
  const accountingAnchorRef = useRef<HTMLButtonElement>(null);

  // シフト管理メニューの表示/非表示を切り替える
  const handleShiftsMenuToggle = () => {
    setShiftsMenuOpen((prevOpen) => !prevOpen);
  };

  // 経理処理メニューの表示/非表示を切り替える
  const handleAccountingMenuToggle = () => {
    setAccountingMenuOpen((prevOpen) => !prevOpen);
  };

  // メニュー外をクリックした時に閉じる
  const handleShiftsMenuClose = (event: Event | React.SyntheticEvent) => {
    if (
      shiftsAnchorRef.current &&
      shiftsAnchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setShiftsMenuOpen(false);
  };

  // 経理メニュー外をクリックした時に閉じる
  const handleAccountingMenuClose = (event: Event | React.SyntheticEvent) => {
    if (
      accountingAnchorRef.current &&
      accountingAnchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setAccountingMenuOpen(false);
  };

  // マウスが離れた時にメニューを閉じる
  const handleShiftsMenuLeave = () => {
    setShiftsMenuOpen(false);
  };

  // 経理メニューからマウスが離れた時にメニューを閉じる
  const handleAccountingMenuLeave = () => {
    setAccountingMenuOpen(false);
  };

  // サブメニューアイテムをクリックした時の処理
  const handleShiftsMenuItemClick = (path: string) => {
    router.push(path);
    setShiftsMenuOpen(false);
  };

  // 経理サブメニューアイテムをクリックした時の処理
  const handleAccountingMenuItemClick = (path: string) => {
    router.push(path);
    setAccountingMenuOpen(false);
  };

  // 通知関連のハンドラー
  const handleNotificationIconClick = () => {
    setNotificationDrawerOpen(true);
  };

  const handleNotificationDrawerClose = () => {
    setNotificationDrawerOpen(false);
  };



  const handleNotificationClick = (notification: any) => {
    // 変更依頼の場合はダイアログ表示のため遷移しない
    if (notification.type === 'change_request') {
      return; // ダイアログはNotificationDrawerで管理
    }
    
    // シフト提出通知の場合も遷移しない（既読マークのみ）
    if (notification.type === 'shift_submission') {
      return; // 画面遷移は不要
    }
    
    // その他の通知の場合は指定されたページに遷移
    if (notification.actions?.primaryAction?.path) {
      router.push(notification.actions.primaryAction.path);
    }
  };

  // 緊急通知があるかどうかを確認
  const hasUrgentNotifications = filteredNotifications.some(
    notification => !notification.read && notification.shiftDetails.priority === 'urgent'
  );

  // シフト関連ページかどうかをチェック
  const isShiftsActive = pathname === '/shifts' || 
                         pathname === '/shifts/assign' || 
                         pathname === '/shifts/management' || 
                         pathname === '/shifts/venue-assign';

  // 経理関連ページかどうかをチェック
  const isAccountingActive = pathname === '/accounting' || 
                         pathname === '/accounting/projects' || 
                         pathname === '/accounting/estimates' || 
                         pathname === '/accounting/invoices' || 
                         pathname === '/accounting/amounts';

  // 共通のボタンスタイル
  const buttonStyle = {
    color: 'white',
    fontSize: '0.9rem',
    px: 1.5,
    minWidth: '140px', // 横幅を統一
    justifyContent: 'flex-start', // テキストを左寄せ
    height: '40px', // 高さも統一
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: '#1B3C8C' }}>
        <Toolbar sx={{ minHeight: '56px', p: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            width: '100%',
            px: 2
          }}>
            <Button
              startIcon={<HomeIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onClick={() => router.push('/')}
            >
              ホーム
            </Button>
            <Button
              startIcon={<BusinessIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/sales' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onClick={() => router.push('/sales')}
            >
              案件管理
            </Button>
            
            {/* 経理処理ボタンとサブメニュー */}
            <Box 
              sx={{ position: 'relative' }}
              onMouseEnter={() => setAccountingMenuOpen(true)}
              onMouseLeave={handleAccountingMenuLeave}
            >
              <Button
                ref={accountingAnchorRef}
                startIcon={<AccountBalanceIcon />}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  ...buttonStyle,
                  bgcolor: isAccountingActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
                onClick={() => router.push('/accounting')}
              >
                経理処理
              </Button>
              <Popper
                open={accountingMenuOpen}
                anchorEl={accountingAnchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                style={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'top left' }}
                  >
                    <Paper elevation={3} sx={{ mt: 0.5, minWidth: '180px' }}>
                      <ClickAwayListener onClickAway={handleAccountingMenuClose}>
                        <MenuList autoFocusItem={accountingMenuOpen}>
                          <MenuItem 
                            onClick={() => handleAccountingMenuItemClick('/accounting/projects')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/accounting/projects' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            案件一覧
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAccountingMenuItemClick('/accounting/estimates')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/accounting/estimates' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            見積処理
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAccountingMenuItemClick('/accounting/invoices')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/accounting/invoices' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            請求処理
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAccountingMenuItemClick('/accounting/amounts')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/accounting/amounts' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            金額確認
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAccountingMenuItemClick('/accounting/delivery')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/accounting/delivery' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            送付一覧
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
            
            {/* シフト調整ボタンとサブメニュー */}
            <Box 
              sx={{ position: 'relative' }}
              onMouseEnter={() => setShiftsMenuOpen(true)}
              onMouseLeave={handleShiftsMenuLeave}
            >
              <Button
                ref={shiftsAnchorRef}
                startIcon={<EventIcon />}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  ...buttonStyle,
                  bgcolor: isShiftsActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
                onClick={() => router.push('/shifts/assign')}
              >
                シフト調整
              </Button>
              <Popper
                open={shiftsMenuOpen}
                anchorEl={shiftsAnchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                style={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'top left' }}
                  >
                    <Paper elevation={3} sx={{ mt: 0.5, minWidth: '180px' }}>
                      <ClickAwayListener onClickAway={handleShiftsMenuClose}>
                        <MenuList autoFocusItem={shiftsMenuOpen}>
                          <MenuItem 
                            onClick={() => handleShiftsMenuItemClick('/shifts')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/shifts/assign' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            アサイン
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleShiftsMenuItemClick('/shifts/management')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/shifts/management' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            シフト管理
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleShiftsMenuItemClick('/shifts/venue-assign')}
                            sx={{ 
                              fontSize: '0.9rem',
                              bgcolor: pathname === '/shifts/venue-assign' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                            }}
                          >
                            現場×アサイン確認
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>

            <Button
              startIcon={<SettingsIcon />}
              sx={{
                ...buttonStyle,
                bgcolor: pathname === '/settings' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onClick={() => router.push('/settings')}
            >
              設定
            </Button>
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* 通知アイコン */}
              <NotificationIcon
                unreadCount={unreadCount}
                hasUrgent={hasUrgentNotifications}
                onClick={handleNotificationIconClick}
              />
              <Avatar sx={{ width: 32, height: 32 }} />
              <Typography sx={{ fontSize: '0.9rem', color: 'white' }}>
                モック 管理者
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.8rem',
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                管理者
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* 通知ドロワー */}
      <NotificationDrawer
        open={notificationDrawerOpen}
        notifications={filteredNotifications}
        filter={notificationFilter}
        unreadCount={unreadCount}
        onClose={handleNotificationDrawerClose}
        onFilterChange={setNotificationFilter}
        onMarkAsRead={markNotificationAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </Box>
  );
} 