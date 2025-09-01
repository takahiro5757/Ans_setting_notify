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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

interface SystemInfoDialog {
  open: boolean;
  companyName: string;
  adminName: string;
  adminEmail: string;
  systemUrl: string;
  loginId: string;
  isNewIssue?: boolean;
}

interface SubcontractorData {
  id: string;
  companyName: string;
  adminName: string;
  adminCategory: string;
  adminEmail: string;
  adminLineId: string;
  systemStatus: 'active' | 'inactive';
  systemUrl?: string;
  createdAt: string;
}

const initialSubcontractorData: Omit<SubcontractorData, 'id' | 'createdAt'> = {
  companyName: '',
  adminName: '',
  adminCategory: '',
  adminEmail: '',
  adminLineId: '',
  systemStatus: 'inactive',
};

// サンプルデータ
const sampleSubcontractors: SubcontractorData[] = [
  {
    id: '1',
    companyName: '株式会社ABC営業',
    adminName: '山田一郎',
    adminCategory: '取締役',
    adminEmail: 'yamada@abc-eigyo.com',
    adminLineId: 'yamada_abc',
    systemStatus: 'active',
    systemUrl: 'https://abc-eigyo.ansteype-system.com',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    companyName: 'DEF販売株式会社',
    adminName: '鈴木花子',
    adminCategory: '営業部長',
    adminEmail: 'suzuki@def-sales.com',
    adminLineId: 'suzuki_def',
    systemStatus: 'inactive',
    createdAt: '2024-02-20',
  },
];

const adminCategoryOptions = [
  { value: '代表取締役', label: '代表取締役' },
  { value: '取締役', label: '取締役' },
  { value: '営業部長', label: '営業部長' },
  { value: '営業課長', label: '営業課長' },
  { value: '営業主任', label: '営業主任' },
  { value: 'マネージャー', label: 'マネージャー' },
];

// シンプルなパスワード生成（8文字英数字）
const generateSimplePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const SubcontractorManagement: React.FC = () => {
  const [subcontractorList, setSubcontractorList] = useState<SubcontractorData[]>(sampleSubcontractors);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<SubcontractorData | null>(null);
  const [subcontractorData, setSubcontractorData] = useState<Omit<SubcontractorData, 'id' | 'createdAt'>>(initialSubcontractorData);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [systemInfoDialog, setSystemInfoDialog] = useState<SystemInfoDialog>({
    open: false,
    companyName: '',
    adminName: '',
    adminEmail: '',
    systemUrl: '',
    loginId: '',
    isNewIssue: false
  });

  const handleAddSubcontractor = () => {
    setEditingSubcontractor(null);
    setSubcontractorData(initialSubcontractorData);
    setDialogOpen(true);
  };

  const handleEditSubcontractor = (subcontractor: SubcontractorData) => {
    setEditingSubcontractor(subcontractor);
    setSubcontractorData({
      companyName: subcontractor.companyName,
      adminName: subcontractor.adminName,
      adminCategory: subcontractor.adminCategory,
      adminEmail: subcontractor.adminEmail,
      adminLineId: subcontractor.adminLineId,
      systemStatus: subcontractor.systemStatus,
      systemUrl: subcontractor.systemUrl,
    });
    setDialogOpen(true);
  };

  const handleSaveSubcontractor = () => {
    if (editingSubcontractor) {
      // 編集の場合
      setSubcontractorList(prev => prev.map(subcontractor => 
        subcontractor.id === editingSubcontractor.id 
          ? { ...subcontractor, ...subcontractorData }
          : subcontractor
      ));
      setSaveMessage('2次店会社情報を更新しました');
    } else {
      // 新規追加の場合
      const newSubcontractor: SubcontractorData = {
        id: Date.now().toString(),
        ...subcontractorData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSubcontractorList(prev => [...prev, newSubcontractor]);
      setSaveMessage('新しい2次店会社を追加しました');
    }
    
    setDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteSubcontractor = (subcontractorId: string) => {
    setSubcontractorList(prev => prev.filter(subcontractor => subcontractor.id !== subcontractorId));
    setSaveMessage('2次店会社を削除しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSystemIssue = async (subcontractorId: string) => {
    const subcontractor = subcontractorList.find(s => s.id === subcontractorId);
    if (!subcontractor) return;

    // システムURL生成（実際にはAPI呼び出し）
    const systemUrl = `https://${subcontractor.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.ansteype-system.com`;
    
    // システム状態更新
    setSubcontractorList(prev => prev.map(s => 
      s.id === subcontractorId 
        ? { ...s, systemStatus: 'active', systemUrl }
        : s
    ));
    
    // ログイン情報表示ダイアログを開く
    setSystemInfoDialog({
      open: true,
      companyName: subcontractor.companyName,
      adminName: subcontractor.adminName,
      adminEmail: subcontractor.adminEmail,
      systemUrl,
      loginId: subcontractor.adminEmail, // メールアドレスをログインIDに
      isNewIssue: true
    });
    
    setSaveMessage(`${subcontractor.companyName}のシステムを発行しました`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // システム情報表示（再表示）
  const handleShowSystemInfo = (subcontractorId: string) => {
    const subcontractor = subcontractorList.find(s => s.id === subcontractorId);
    if (!subcontractor || !subcontractor.systemUrl) return;

    setSystemInfoDialog({
      open: true,
      companyName: subcontractor.companyName,
      adminName: subcontractor.adminName,
      adminEmail: subcontractor.adminEmail,
      systemUrl: subcontractor.systemUrl,
      loginId: subcontractor.adminEmail,
      isNewIssue: false
    });
  };

  // コピー機能
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSaveMessage(`${label}をコピーしました`);
      setTimeout(() => setSaveMessage(''), 2000);
    }).catch(() => {
      setSaveMessage('コピーに失敗しました');
      setTimeout(() => setSaveMessage(''), 2000);
    });
  };

  const handleSystemToggle = (subcontractorId: string, newStatus: 'active' | 'inactive') => {
    const subcontractor = subcontractorList.find(s => s.id === subcontractorId);
    if (!subcontractor) return;

    setSubcontractorList(prev => prev.map(s => 
      s.id === subcontractorId 
        ? { ...s, systemStatus: newStatus }
        : s
    ));
    
    const statusText = newStatus === 'active' ? '稼働開始' : '停止';
    setSaveMessage(`${subcontractor.companyName}のシステムを${statusText}しました`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        2次店管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* 2次請会社一覧 */}
      <Card>
        <CardHeader 
          title="2次店会社一覧"
          subheader="2次店会社の管理者登録・システム発行管理"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSubcontractor}
            >
              2次店会社追加
            </Button>
          }
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>会社名</TableCell>
                  <TableCell>管理者</TableCell>
                  <TableCell>役職</TableCell>
                  <TableCell>メール</TableCell>
                  <TableCell>システム状態</TableCell>
                  <TableCell>登録日</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subcontractorList.map((subcontractor) => (
                  <TableRow key={subcontractor.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {subcontractor.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {subcontractor.adminName}
                        </Typography>
                        {subcontractor.adminLineId && (
                          <Typography variant="caption" color="text.secondary">
                            LINE: {subcontractor.adminLineId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{subcontractor.adminCategory}</TableCell>
                    <TableCell>{subcontractor.adminEmail}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          label={subcontractor.systemStatus === 'active' ? 'システム稼働中' : 'システム停止中'}
                          color={subcontractor.systemStatus === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                        {subcontractor.systemUrl && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<LaunchIcon />}
                              href={subcontractor.systemUrl}
                              target="_blank"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              アクセス
                            </Button>
                            {subcontractor.systemStatus === 'active' ? (
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleSystemToggle(subcontractor.id, 'inactive')}
                                title="システム停止"
                              >
                                <StopIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleSystemToggle(subcontractor.id, 'active')}
                                title="システム開始"
                              >
                                <PlayIcon />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{subcontractor.createdAt}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditSubcontractor(subcontractor)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubcontractor(subcontractor.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        {!subcontractor.systemUrl ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSystemIssue(subcontractor.id)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            システム発行
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleShowSystemInfo(subcontractor.id)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            ログイン情報表示
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 2次請会社追加/編集ダイアログ */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSubcontractor ? '2次店会社編集' : '2次店会社追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="2次店会社名"
                value={subcontractorData.companyName}
                onChange={(e) => setSubcontractorData({...subcontractorData, companyName: e.target.value})}
                required
                fullWidth
                placeholder="株式会社○○営業"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="管理者氏名"
                value={subcontractorData.adminName}
                onChange={(e) => setSubcontractorData({...subcontractorData, adminName: e.target.value})}
                required
                fullWidth
                placeholder="山田太郎"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>管理者カテゴリ</InputLabel>
                <Select 
                  value={subcontractorData.adminCategory}
                  onChange={(e) => setSubcontractorData({...subcontractorData, adminCategory: e.target.value})}
                >
                  {adminCategoryOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="管理者メールアドレス"
                type="email"
                value={subcontractorData.adminEmail}
                onChange={(e) => setSubcontractorData({...subcontractorData, adminEmail: e.target.value})}
                required
                fullWidth
                placeholder="admin@company.com"
              />
            </Grid>
            

            
            <Grid item xs={12} md={6}>
              <TextField
                label="管理者LINE ID"
                value={subcontractorData.adminLineId}
                onChange={(e) => setSubcontractorData({...subcontractorData, adminLineId: e.target.value})}
                fullWidth
                placeholder="line_id_example"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary">
            ※ 2次店会社を登録後、「システム発行」ボタンから専用システムURLを生成できます。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveSubcontractor}
            variant="contained"
          >
            {editingSubcontractor ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* システム情報表示ダイアログ */}
      <Dialog 
        open={systemInfoDialog.open} 
        onClose={() => setSystemInfoDialog({ ...systemInfoDialog, open: false })}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {systemInfoDialog.isNewIssue ? 'システム発行完了' : 'システムログイン情報'}
        </DialogTitle>
        <DialogContent>
          {systemInfoDialog.isNewIssue && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {systemInfoDialog.companyName}様のシステムが正常に発行されました
            </Alert>
          )}
          
          <Typography variant="h6" gutterBottom>
            2次店様にお伝えする情報
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="システムURL"
                  value={systemInfoDialog.systemUrl}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(systemInfoDialog.systemUrl, 'システムURL')}
                        size="small"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="ログインID（メールアドレス）"
                  value={systemInfoDialog.loginId}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(systemInfoDialog.loginId, 'ログインID')}
                        size="small"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    )
                  }}
                />
              </Grid>

            </Grid>
          </Paper>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>お客様へのご案内：</strong><br/>
            • 初回ログイン後、パスワードの変更をお勧めください<br/>
            • ログイン情報は安全な方法でお伝えください<br/>
            • 不明な点があれば直接サポートいたします
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSystemInfoDialog({ ...systemInfoDialog, open: false })}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubcontractorManagement;