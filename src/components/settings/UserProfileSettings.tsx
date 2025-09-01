'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Train as TrainIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

interface UserProfileData {
  name: string;
  nameKana: string;
  nearestStation: string;
  phone: string;
  email: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserProfileSettings: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    nearestStation: '新宿駅',
    phone: '090-1234-5678',
    email: 'tanaka@ansteype.com',
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleProfileSave = () => {
    // TODO: API呼び出しで保存処理
    console.log('プロフィール保存:', profileData);
    setSaveMessage('プロフィール情報を保存しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('新しいパスワードが一致しません');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    // TODO: API呼び出しでパスワード変更処理
    console.log('パスワード変更');
    setSaveMessage('パスワードを変更しました');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        ユーザー情報設定
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* プロフィール設定 */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="個人プロフィール" 
          subheader="基本的な個人情報を設定してください"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名（カナ）"
                value={profileData.nameKana}
                onChange={(e) => setProfileData({...profileData, nameKana: e.target.value})}
                required
                fullWidth
                placeholder="タナカタロウ"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="最寄り駅"
                value={profileData.nearestStation}
                onChange={(e) => setProfileData({...profileData, nearestStation: e.target.value})}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrainIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="新宿駅"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="090-1234-5678"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="メールアドレス"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                required
                fullWidth
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleProfileSave}
              size="large"
            >
              プロフィールを保存
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* パスワード変更 */}
      <Card>
        <CardHeader 
          title="パスワード変更" 
          subheader="セキュリティのため定期的にパスワードを変更してください"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="現在のパスワード"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="新しいパスワード"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="新しいパスワード（確認）"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={handlePasswordChange}
              size="large"
            >
              パスワードを変更
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfileSettings;