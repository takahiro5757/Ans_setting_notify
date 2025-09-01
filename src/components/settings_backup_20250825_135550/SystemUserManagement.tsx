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
  email: string;
  password: string;
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
  email: '',
  password: '',
  role: '',
  isActive: true,
};

// サンプルデータ
const sampleUsers: SystemUser[] = [
  {
    id: '1',
    email: 'admin@ansteype.com',
    password: '****',
    role: 'executive_admin',
    isActive: true,
    lastLogin: '2024-01-20',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'sales@ansteype.com',
    password: '****',
    role: 'sales_admin',
    isActive: true,
    lastLogin: '2024-01-19',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    email: 'accounting@ansteype.com',
    password: '****',
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
    id: 'general_admin',
    name: '一般管理',
    description: '限定的な管理権限',
    permissions: [
      'ユーザー情報管理',
      'スタッフ管理（閲覧のみ）',
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
      email: user.email,
      password: user.password,
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
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        システムユーザー管理
      </Typography>

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
              subheader="システムにアクセス可能なユーザーの管理"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUser}
                >
                  ユーザー追加
                </Button>
              }
            />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
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
                            {user.email}
                          </Box>
                        </TableCell>
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
              subheader="各ロールのアクセス権限"
              avatar={<SecurityIcon color="primary" />}
            />
            <CardContent>
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
              <TextField
                label="パスワード"
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({...userData, password: e.target.value})}
                required
                fullWidth
                placeholder={editingUser ? "変更する場合のみ入力" : "パスワードを入力"}
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