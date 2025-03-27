'use client';

import { Box, AppBar, Toolbar, Button, Typography, Avatar } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box>
      <Logo />
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
                color: 'white',
                fontSize: '0.9rem',
                px: 1.5,
                minWidth: 'auto',
                bgcolor: pathname === '/' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={() => router.push('/')}
            >
              ホーム
            </Button>
            <Button
              startIcon={<BusinessIcon />}
              sx={{
                color: 'white',
                fontSize: '0.9rem',
                px: 1.5,
                minWidth: 'auto',
                bgcolor: pathname === '/sales' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={() => router.push('/sales')}
            >
              営業案件管理
            </Button>
            <Button
              startIcon={<AccountBalanceIcon />}
              sx={{
                color: 'white',
                fontSize: '0.9rem',
                px: 1.5,
                minWidth: 'auto',
                bgcolor: pathname === '/accounting' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={() => router.push('/accounting')}
            >
              経理処理
            </Button>
            <Button
              startIcon={<EventIcon />}
              sx={{
                color: 'white',
                fontSize: '0.9rem',
                px: 1.5,
                minWidth: 'auto',
                bgcolor: pathname === '/shifts' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={() => router.push('/shifts')}
            >
              シフト管理
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              sx={{
                color: 'white',
                fontSize: '0.9rem',
                px: 1.5,
                minWidth: 'auto',
                bgcolor: pathname === '/settings' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
              }}
              onClick={() => router.push('/settings')}
            >
              設定
            </Button>
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }} />
              <Typography sx={{ fontSize: '0.9rem', color: 'white' }}>
                田中 太郎
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
    </Box>
  );
} 