'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// 週別タブの定義
const getWeeks = (year: string, month: string) => {
  if (!year || !month) return ['0W', '1W', '2W', '3W', '4W', '5W'];
  const numWeeks = Math.ceil(new Date(parseInt(year), parseInt(month), 0).getDate() / 7);
  return Array.from({ length: numWeeks }, (_, i) => `${i}W`);
};

// 日付の定義
const getDays = (year: string, month: string, weekIndex: number) => {
  if (!year || !month) return Array(7).fill('').map((_, i) => `${i + 1}日`);
  
  const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(weekIndex * 7 + 1);
  
  return Array(7).fill('').map((_, i) => {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + i);
    if (date.getMonth() !== parseInt(month) - 1) return '';
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
};

interface DetailData {
  id: string;
  location: string;
  phone: string;
  status: {
    main: string;
    sub: string[];
  };
  schedule: {
    date: string;
    time: string;
  };
  staff: {
    closer: {
      count: number;
      unitPrice: number;
      transportationFee: number;
    };
    girl: {
      count: number;
      unitPrice: number;
      transportationFee: number;
    };
  };
  newCustomer: number;
  repeater: number;
  totalAmount: number;
}

interface StaffData {
  count: number;
  unitPrice: number;
  transportationFee: number;
}

interface EditFormData {
  location: string;
  phone: string;
  closer: StaffData;
  girl: StaffData;
  traineeCloser: number;
  freeStaff: number;
  hasLocation: boolean;
  isOutsideWork: boolean;
  canWork: boolean;
}

export default function SalesDetailPage() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    location: '',
    phone: '',
    closer: {
      count: 0,
      unitPrice: 20000,
      transportationFee: 5000,
    },
    girl: {
      count: 0,
      unitPrice: 10000,
      transportationFee: 3000,
    },
    traineeCloser: 0,
    freeStaff: 0,
    hasLocation: true,
    isOutsideWork: false,
    canWork: true,
  });
  const router = useRouter();

  // 週と日付の計算
  const weeks = getWeeks(year, month);
  const days = getDays(year, month, selectedWeek);

  // 年月選択時の処理
  const handleDateSelection = () => {
    if (year && month) {
      setSelectedWeek(0);
    }
  };

  // サンプルデータ
  const detailData: DetailData = {
    id: 'sale-1',
    location: '島忠ホームズ 3F',
    phone: '080-1111-1111',
    status: {
      main: '大宮',
      sub: ['春日部', '浦和', '川口'],
    },
    schedule: {
      date: '毎日',
      time: '通常',
    },
    staff: {
      closer: {
        count: 3,
        unitPrice: 20000,
        transportationFee: 5000,
      },
      girl: {
        count: 3,
        unitPrice: 10000,
        transportationFee: 3000,
      },
    },
    newCustomer: 0,
    repeater: 0,
    totalAmount: 228000,
  };

  // 編集ダイアログを開く
  const handleEditClick = () => {
    setEditFormData({
      location: detailData.location,
      phone: detailData.phone,
      closer: {
        count: detailData.staff.closer.count,
        unitPrice: detailData.staff.closer.unitPrice,
        transportationFee: detailData.staff.closer.transportationFee,
      },
      girl: {
        count: detailData.staff.girl.count,
        unitPrice: detailData.staff.girl.unitPrice,
        transportationFee: detailData.staff.girl.transportationFee,
      },
      traineeCloser: 0,
      freeStaff: 0,
      hasLocation: true,
      isOutsideWork: false,
      canWork: true,
    });
    setEditDialogOpen(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
  };

  // フォームの値を変更
  const handleFormChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // スタッフ情報を変更
  const handleStaffChange = (staffType: 'closer' | 'girl', field: keyof StaffData, value: number) => {
    setEditFormData((prev) => ({
      ...prev,
      [staffType]: {
        ...prev[staffType],
        [field]: value,
      },
    }));
  };

  // 変更を保存
  const handleSaveChanges = () => {
    // TODO: データの永続化処理を実装
    handleCloseDialog();
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                '&:hover': { 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                },
                px: 2,
                py: 1,
                borderRadius: 1
              }}
              onClick={() => router.push('/')}
            >
              <HomeIcon sx={{ fontSize: 28 }} />
              <Typography>ホーム</Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                '&:hover': { 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                },
                px: 2,
                py: 1,
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => router.push('/sales')}
            >
              <AssessmentIcon sx={{ fontSize: 28 }} />
              <Typography>営業管理</Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                '&:hover': { 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                },
                px: 2,
                py: 1,
                borderRadius: 1
              }}
              onClick={() => router.push('/accounting')}
            >
              <AccountBalanceIcon sx={{ fontSize: 28 }} />
              <Typography>経理処理</Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                '&:hover': { 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                },
                px: 2,
                py: 1,
                borderRadius: 1
              }}
              onClick={() => router.push('/shifts')}
            >
              <PeopleAltIcon sx={{ fontSize: 28 }} />
              <Typography>シフト管理</Typography>
            </Box>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                '&:hover': { 
                  opacity: 0.8, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                },
                px: 2,
                py: 1,
                borderRadius: 1
              }}
              onClick={() => router.push('/settings')}
            >
              <SettingsIcon sx={{ fontSize: 28 }} />
              <Typography>設定</Typography>
            </Box>
            <Box sx={{ 
              marginLeft: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              px: 2,
              py: 1,
              borderRadius: 1,
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <PersonIcon sx={{ fontSize: 28 }} />
              <Typography>田中 太郎</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                sx={{ 
                  bgcolor: '#1565c0',
                  '&:hover': { bgcolor: '#0d47a1' },
                  px: 2
                }}
              >
                管理者
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon fontSize="small" /> ホーム / 案件管理
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="対象年"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ 
              width: 200, 
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          >
            <MenuItem value="">-未選択-</MenuItem>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <MenuItem key={y} value={y}>{y}年</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="対象月"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ 
              width: 200, 
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          >
            <MenuItem value="">-未選択-</MenuItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <MenuItem key={m} value={m}>{m}月</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={handleDateSelection}
            sx={{
              bgcolor: '#1976d2',
              color: 'white',
              '&:hover': { bgcolor: '#1565c0' },
              px: 4
            }}
          >
            選択
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 0, mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/sales')}
            sx={{
              bgcolor: '#e0e0e0',
              color: '#000',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'none',
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              '&:hover': { bgcolor: '#d5d5d5' }
            }}
          >
            <ViewListIcon />
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#f5f5f5',
              color: '#000',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'none',
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              '&:hover': { bgcolor: '#e0e0e0' }
            }}
          >
            <ViewModuleIcon />
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/sales/new')}
            sx={{
              bgcolor: '#1976d2',
              color: 'white',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'none',
              px: 3,
              py: 1.5,
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            新規起票
          </Button>
        </Box>

        <Paper sx={{ mb: 3, borderRadius: 0 }}>
          <Tabs
            value={selectedWeek}
            onChange={(_, newValue) => setSelectedWeek(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
                py: 1,
                bgcolor: '#e0e0e0',
                '&.Mui-selected': {
                  bgcolor: '#1976d2',
                  color: 'white'
                }
              }
            }}
          >
            {weeks.map((week, index) => (
              <Tab key={week} label={week} value={index} />
            ))}
          </Tabs>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '40%', borderBottom: 'none' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {detailData.location}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666' }}>
                        <PhoneIcon fontSize="small" />
                        <Typography>{detailData.phone}</Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={handleEditClick}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      label={detailData.status.main}
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', color: '#1976d2', borderRadius: 1 }}
                    />
                    {detailData.status.sub.map((status, index) => (
                      <Chip
                        key={index}
                        label={status}
                        size="small"
                        sx={{ bgcolor: '#f5f5f5', color: '#666', borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: '#666' }} />
                      <Typography>{detailData.schedule.date}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ color: '#666' }} />
                      <Typography>{detailData.schedule.time}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                        クローザー
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>人数</Typography>
                        <Typography>{detailData.staff.closer.count}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>単価</Typography>
                        <Typography>¥{detailData.staff.closer.unitPrice.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>交通費</Typography>
                        <Typography>¥{detailData.staff.closer.transportationFee.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#dc004e', fontWeight: 'bold', mb: 1 }}>
                        ガール
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>人数</Typography>
                        <Typography>{detailData.staff.girl.count}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>単価</Typography>
                        <Typography>¥{detailData.staff.girl.unitPrice.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>交通費</Typography>
                        <Typography>¥{detailData.staff.girl.transportationFee.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>研修クローザー</Typography>
                      <Typography align="right">0</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>無料人員</Typography>
                      <Typography align="right">0</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ¥{detailData.totalAmount.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* 編集ダイアログ */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>案件編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* 基本情報 */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="開催場所"
                    value={editFormData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="電話番号"
                    value={editFormData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.hasLocation}
                        onChange={(e) => handleFormChange('hasLocation', e.target.checked)}
                      />
                    }
                    label="場所取りあり"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.isOutsideWork}
                        onChange={(e) => handleFormChange('isOutsideWork', e.target.checked)}
                      />
                    }
                    label="外現場"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editFormData.canWork}
                        onChange={(e) => handleFormChange('canWork', e.target.checked)}
                      />
                    }
                    label="出張"
                  />
                </Box>
              </Grid>

              {/* クローザー情報 */}
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                  クローザー
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="人数"
                    type="number"
                    value={editFormData.closer.count}
                    onChange={(e) => handleStaffChange('closer', 'count', parseInt(e.target.value) || 0)}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="単価"
                    type="number"
                    value={editFormData.closer.unitPrice}
                    onChange={(e) => handleStaffChange('closer', 'unitPrice', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <Typography>¥</Typography>,
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="交通費"
                    type="number"
                    value={editFormData.closer.transportationFee}
                    onChange={(e) => handleStaffChange('closer', 'transportationFee', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <Typography>¥</Typography>,
                    }}
                  />
                </Box>
              </Grid>

              {/* ガール情報 */}
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ color: '#dc004e', fontWeight: 'bold', mb: 2 }}>
                  ガール
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="人数"
                    type="number"
                    value={editFormData.girl.count}
                    onChange={(e) => handleStaffChange('girl', 'count', parseInt(e.target.value) || 0)}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="単価"
                    type="number"
                    value={editFormData.girl.unitPrice}
                    onChange={(e) => handleStaffChange('girl', 'unitPrice', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <Typography>¥</Typography>,
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="交通費"
                    type="number"
                    value={editFormData.girl.transportationFee}
                    onChange={(e) => handleStaffChange('girl', 'transportationFee', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <Typography>¥</Typography>,
                    }}
                  />
                </Box>
              </Grid>

              {/* その他のスタッフ情報 */}
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="研修クローザー"
                    type="number"
                    value={editFormData.traineeCloser}
                    onChange={(e) => handleFormChange('traineeCloser', parseInt(e.target.value) || 0)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="無料人員"
                    type="number"
                    value={editFormData.freeStaff}
                    onChange={(e) => handleFormChange('freeStaff', parseInt(e.target.value) || 0)}
                  />
                </Box>
              </Grid>

              {/* 合計金額 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    合計: ¥{(
                      (editFormData.closer.count * editFormData.closer.unitPrice + editFormData.closer.count * editFormData.closer.transportationFee) +
                      (editFormData.girl.count * editFormData.girl.unitPrice + editFormData.girl.count * editFormData.girl.transportationFee)
                    ).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 