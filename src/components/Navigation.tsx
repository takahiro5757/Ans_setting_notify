'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  AccountBalance as AccountIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'ホーム', icon: <HomeIcon />, path: '/' },
  { text: '営業管理', icon: <BusinessIcon />, path: '/sales' },
  { text: '経理処理', icon: <AccountIcon />, path: '/accounting' },
  { text: 'シフト管理', icon: <CalendarIcon />, path: '/shifts' },
  { text: '設定', icon: <SettingsIcon />, path: '/settings' },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <Link key={item.text} href={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button selected={pathname === item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Drawer>
  );
}; 