'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Home as HomeIcon, Settings as SettingsIcon, Person as PersonIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface StaffData {
  count: number;
  unitPrice: number;
  transportationFee: number;
}

interface NewTicketData {
  location: string;
  phone: string;
  assignee: string;
  status: string;
  agency: string;
  date: string;
  closer: StaffData;
  girl: StaffData;
  traineeCloser: number;
  freeStaff: number;
  hasLocation: boolean;
  isOutsideWork: boolean;
  canWork: boolean;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewTicketData>({
    location: '',
    phone: '',
    assignee: '',
    status: '申請中',
    agency: '未連絡',
    date: '',
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

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStaffChange = (staffType: 'closer' | 'girl', field: keyof StaffData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [staffType]: {
        ...prev[staffType],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // ここでデータを保存する処理を実装
    // 例: APIエンドポイントにPOSTリクエストを送信
    console.log('Submitted data:', formData);
    
    // 保存後に一覧画面に戻る
    router.push('/sales');
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HomeIcon />
              <Typography>ホーム</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img src="/icon1.png" alt="" style={{ width: 24, height: 24 }} />
              <Typography>営業管理</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img src="/icon2.png" alt="" style={{ width: 24, height: 24 }} />
              <Typography>経理処理</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img src="/icon3.png" alt="" style={{ width: 24, height: 24 }} />
              <Typography>シフト管理</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SettingsIcon />
              <Typography>設定</Typography>
            </Box>
            <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon />
              <Typography>田中 太郎</Typography>
              <Button variant="contained" color="primary" sx={{ bgcolor: '#1565c0' }}>
                管理者
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            新規起票
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            ホーム / 案件管理 / 新規起票
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* 基本情報 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>基本情報</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="開催場所"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="電話番号"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="開催日"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    label="担当者"
                    value={formData.assignee}
                    onChange={(e) => handleFormChange('assignee', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>ステータス</InputLabel>
                    <Select
                      value={formData.status}
                      label="ステータス"
                      onChange={(e) => handleFormChange('status', e.target.value)}
                    >
                      <MenuItem value="申請中">申請中</MenuItem>
                      <MenuItem value="承認済み">承認済み</MenuItem>
                      <MenuItem value="却下">却下</MenuItem>
                      <MenuItem value="完了">完了</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>代理店</InputLabel>
                    <Select
                      value={formData.agency}
                      label="代理店"
                      onChange={(e) => handleFormChange('agency', e.target.value)}
                    >
                      <MenuItem value="連絡済">連絡済</MenuItem>
                      <MenuItem value="未連絡">未連絡</MenuItem>
                      <MenuItem value="確認中">確認中</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.hasLocation}
                          onChange={(e) => handleFormChange('hasLocation', e.target.checked)}
                        />
                      }
                      label="場所取りあり"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isOutsideWork}
                          onChange={(e) => handleFormChange('isOutsideWork', e.target.checked)}
                        />
                      }
                      label="外現場"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.canWork}
                          onChange={(e) => handleFormChange('canWork', e.target.checked)}
                        />
                      }
                      label="出張"
                    />
                  </Box>
                </Grid>
              </Grid>
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
                  value={formData.closer.count}
                  onChange={(e) => handleStaffChange('closer', 'count', parseInt(e.target.value) || 0)}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="単価"
                  type="number"
                  value={formData.closer.unitPrice}
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
                  value={formData.closer.transportationFee}
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
                  value={formData.girl.count}
                  onChange={(e) => handleStaffChange('girl', 'count', parseInt(e.target.value) || 0)}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="単価"
                  type="number"
                  value={formData.girl.unitPrice}
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
                  value={formData.girl.transportationFee}
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
                  value={formData.traineeCloser}
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
                  value={formData.freeStaff}
                  onChange={(e) => handleFormChange('freeStaff', parseInt(e.target.value) || 0)}
                />
              </Box>
            </Grid>

            {/* 合計金額 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  合計: ¥{(
                    (formData.closer.count * formData.closer.unitPrice + formData.closer.count * formData.closer.transportationFee) +
                    (formData.girl.count * formData.girl.unitPrice + formData.girl.count * formData.girl.transportationFee)
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* ボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/sales')}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ minWidth: 120 }}
            >
              保存
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
} 