'use client';

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
  AccountBalance as AccountingIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

export type SettingsCategory = 
  | 'profile' 
  | 'staff' 
  | 'subcontractors' 
  | 'projects' 
  | 'accounting' 
  | 'system_users';

interface SettingsCategoryItem {
  id: SettingsCategory;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  description: string;
}

interface SettingsNavigationProps {
  activeCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
  userRole?: string;
}

const categories: SettingsCategoryItem[] = [
  {
    id: 'profile',
    label: 'ユーザー情報',
    icon: <PersonIcon />,
    roles: ['all'],
    description: '個人プロフィール設定'
  },
  {
    id: 'staff',
    label: 'スタッフ管理',
    icon: <PeopleIcon />,
    roles: ['executive_admin', 'sales_admin', 'subcontractor_admin'],
    description: '自社・2次請スタッフの統合管理'
  },
  {
    id: 'subcontractors',
    label: '2次店管理',
    icon: <BusinessIcon />,
    roles: ['executive_admin', 'sales_admin'],
    description: '2次店会社管理者・システム発行'
  },
  {
    id: 'projects',
    label: '代理店・イベント管理',
    icon: <CampaignIcon />,
    roles: ['executive_admin', 'sales_admin'],
    description: '代理店・イベント場所マスタ管理'
  },
  {
    id: 'accounting',
    label: '経理管理',
    icon: <AccountingIcon />,
    roles: ['executive_admin', 'accounting'],
    description: '請求・支払い・テンプレート設定'
  },
  {
    id: 'system_users',
    label: 'システムユーザー',
    icon: <AdminIcon />,
    roles: ['executive_admin'],
    description: 'システム利用者・権限管理'
  },
];

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeCategory,
  onCategoryChange,
  userRole = 'executive_admin', // デフォルトで全権限
}) => {
  const getVisibleCategories = () => {
    return categories.filter(category => 
      category.roles.includes('all') || category.roles.includes(userRole)
    );
  };

  const visibleCategories = getVisibleCategories();

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        width: 300, 
        height: 'calc(100vh - 120px)', 
        overflow: 'auto',
        backgroundColor: '#fafafa',
        borderRadius: 2
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          設定メニュー
        </Typography>
        <Typography variant="body2" color="text.secondary">
          システム設定を管理
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ p: 1 }}>
        {visibleCategories.map((category) => (
          <ListItem key={category.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: activeCategory === category.id ? 'inherit' : 'action.active',
                }}
              >
                {category.icon}
              </ListItemIcon>
              <ListItemText
                primary={category.label}
                secondary={
                  activeCategory === category.id ? null : category.description
                }
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SettingsNavigation;