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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface RolePermission {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const initialUserData: Omit<SystemUser, 'id' | 'lastLogin' | 'createdAt'> = {
  name: '',
  email: '',
  role: '',
  isActive: true,
};

// サンプルデータ
const sampleUsers: SystemUser[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'admin@ansteype.com',
    role: 'executive_admin',
    isActive: true,
    lastLogin: '2024-01-20',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sales@ansteype.com',
    role: 'sales_admin',
    isActive: true,
    lastLogin: '2024-01-19',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: '山田 次郎',
    email: 'accounting@ansteype.com',
    role: 'accounting',
    isActive: true,
    lastLogin: '2024-01-18',
    createdAt: '2024-01-10',
  },
];

const rolePermissions: RolePermission[] = [
  {
    id: 'executive_admin',
    name: '経営管理者',
    description: '全システム管理権限',
    permissions: [
      'ユーザー情報管理',
      'スタッフ管理',
      '2次請管理',
      '案件管理',
      '経理管理',
      'システムユーザー管理',
    ],
  },
  {
    id: 'sales_admin',
    name: '営業管理',
    description: '営業・案件管理権限',
    permissions: [
      'ユーザー情報管理',
      'スタッフ管理',
      '2次請管理',
      '案件管理',
    ],
  },
  {
    id: 'accounting',
    name: '経理',
    description: '経理関連設定・請求管理',
    permissions: [
      'ユーザー情報管理',
      '経理管理',
    ],
  },
];

export const SystemUserManagement: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(sampleUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userData, setUserData] = useState<Omit<SystemUser, 'id' | 'lastLogin' | 'createdAt'>>(initialUserData);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleAddUser = () => {
    setEditingUser(null);
    setUserData(initialUserData);
    setDialogOpen(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userData }
          : user
      ));
      setSaveMessage('ユーザー情報を更新しました');
    } else {
      const newUser: SystemUser = {
        id: Date.now().toString(),
        ...userData,
        lastLogin: '-',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      setSaveMessage('新しいユーザーを追加しました');
    }
    
    setDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setSaveMessage('ユーザーを削除しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    setSaveMessage('ユーザーステータスを変更しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getRoleName = (roleId: string) => {
    return rolePermissions.find(role => role.id === roleId)?.name || roleId;
  };

  const getRolePermissions = (roleId: string) => {
    return rolePermissions.find(role => role.id === roleId)?.permissions || [];
  };

  return (
    <Box>
      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ユーザー一覧 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="システム利用者一覧"
              subheader={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    システムにアクセス可能なユーザーの管理
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    表示中: {users.length}件
                  </Typography>
                </Box>
              }
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddUser}
                  >
                    ユーザー追加
                  </Button>
                </Box>
              }
            />
            <CardContent sx={{ padding: '8px !important' }}>
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ '& .MuiTableCell-root': { padding: '4px 8px', fontSize: '0.875rem' } }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>氏名</TableCell>
                      <TableCell>メールアドレス</TableCell>
                      <TableCell>ロール</TableCell>
                      <TableCell>ステータス</TableCell>
                      <TableCell>最終ログイン</TableCell>
                      <TableCell>登録日</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            {user.name}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getRoleName(user.role)}
                            color={user.role === 'executive_admin' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Switch
                              checked={user.isActive}
                              onChange={() => handleToggleUserStatus(user.id)}
                              size="small"
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {user.isActive ? '有効' : '無効'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 権限ロール説明 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="権限ロール一覧"
              subheader={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    各ロールのアクセス権限
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    権限ロール: {rolePermissions.length}種類
                  </Typography>
                </Box>
              }
            />
            <CardContent sx={{ padding: '8px !important' }}>
              {rolePermissions.map((role) => (
                <Box key={role.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {role.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {role.description}
                  </Typography>
                  <List dense>
                    {role.permissions.map((permission) => (
                      <ListItem key={permission} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={permission}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {role.id !== rolePermissions[rolePermissions.length - 1].id && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ユーザー追加/編集ダイアログ */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'ユーザー編集' : 'ユーザー追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="氏名"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="メールアドレス"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                required
                fullWidth
                placeholder="user@ansteype.com"
              />
            </Grid>
            

            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>ロール</InputLabel>
                <Select 
                  value={userData.role}
                  onChange={(e) => setUserData({...userData, role: e.target.value})}
                >
                  {rolePermissions.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box>
                        <Typography variant="body1">{role.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.isActive}
                    onChange={(e) => setUserData({...userData, isActive: e.target.checked})}
                  />
                }
                label="アカウント有効化"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveUser}
            variant="contained"
          >
            {editingUser ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemUserManagement;