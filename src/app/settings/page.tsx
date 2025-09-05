'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import SettingsNavigation, { SettingsCategory } from '@/components/settings/SettingsNavigation';
import UserProfileSettings from '@/components/settings/UserProfileSettings';
import StaffManagement from '@/components/settings/StaffManagement';
import SubcontractorManagement from '@/components/settings/SubcontractorManagement';
import ProjectManagement from '@/components/settings/ProjectManagement';
import AccountingManagement from '@/components/settings/AccountingManagement';
import SystemUserManagement from '@/components/settings/SystemUserManagement';

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');

  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'profile':
        return <UserProfileSettings />;
      case 'staff':
        return <StaffManagement />;
      case 'subcontractors':
        return <SubcontractorManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'accounting':
        return <AccountingManagement />;
      case 'system_users':
        return <SystemUserManagement />;
      default:
        return <UserProfileSettings />;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false} sx={{ px: 3 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
          設定画面
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* サイドナビゲーション */}
          <SettingsNavigation
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            userRole="executive_admin" // TODO: 実際のユーザーロールを取得
          />
          
          {/* メインコンテンツエリア */}
          <Paper 
            elevation={1} 
            sx={{ 
              flex: 1, 
              p: 4, 
              borderRadius: 2,
              backgroundColor: 'white',
              maxWidth: 'calc(100vw - 350px)', // サイドナビ幅を考慮
              overflow: 'hidden'
            }}
          >
            {renderSettingsContent()}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
} 