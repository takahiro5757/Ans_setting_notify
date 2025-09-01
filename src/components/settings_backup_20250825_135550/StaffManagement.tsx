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
  Switch,
  FormControlLabel,
  InputAdornment,
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
  Rating,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  Checkbox,
  ListItemButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// データファイルからインポート
import {
  StaffData,
  NGStaffRelation,
  NGAgencyRelation,
  StaffTabValue,
  LayerPerson,
  Store,
  AgencyData,
  generateSimplePassword,
  initialStaffData,
  sampleStaff,
  sampleNGRelations,
  sampleNGAgencies,
  affiliationOptions,
  positionOptions,
  agencyOptions,
  getLayerOptions,
  getStoreOptions,
  getLayerPersonName,
  getStoreName,
} from '../../data/staffData';

export const StaffManagement: React.FC = () => {
  // タブ関連
  const [tabValue, setTabValue] = useState<StaffTabValue>('basic');
  
  // スタッフ管理関連
  const [staffList, setStaffList] = useState<StaffData[]>(sampleStaff);
  const [basicDialogOpen, setBasicDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);
  const [staffData, setStaffData] = useState<Omit<StaffData, 'id'>>(initialStaffData);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  // NG関係管理関連
  const [ngRelations, setNgRelations] = useState<NGStaffRelation[]>(sampleNGRelations);
  const [ngDialogOpen, setNgDialogOpen] = useState(false);
  
  // NG代理店管理関連
  const [ngAgencies, setNgAgencies] = useState<NGAgencyRelation[]>(sampleNGAgencies);
  const [ngAgencyDialogOpen, setNgAgencyDialogOpen] = useState(false);
  const [selectedStaffForNGAgency, setSelectedStaffForNGAgency] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedNGType, setSelectedNGType] = useState<'agency' | 'layer' | 'store'>('agency');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [ngAgencyReason, setNgAgencyReason] = useState<string>('');
  const [selectedNGStaff, setSelectedNGStaff] = useState<string>('');
  const [ngReason, setNgReason] = useState<string>('');

  // 役職ラベル取得関数
  const getPositionLabel = (position: string) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option ? option.label : position;
  };

  // 基本情報管理用のハンドラー
  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffData(initialStaffData);
    setShowPassword(false);
    setBasicDialogOpen(true);
  };

  const handleEditBasicInfo = (staff: StaffData) => {
    setEditingStaff(staff);
    setStaffData({
      affiliation: staff.affiliation,
      name: staff.name,
      nameKana: staff.nameKana,
      gender: staff.gender,
      nearestStation: staff.nearestStation,
      phone: staff.phone,
      email: staff.email,
      lineId: staff.lineId,
      position: staff.position,
      businessTripAvailable: staff.businessTripAvailable,
      weekdayRate: staff.weekdayRate,
      weekendRate: staff.weekendRate,
      initialPassword: staff.initialPassword,
      closerSkillRating: staff.closerSkillRating,
      girlSkillRating: staff.girlSkillRating,
      skillNotes: staff.skillNotes || '',
    });
    setShowPassword(false);
    setBasicDialogOpen(true);
  };

  const handleSaveBasicInfo = () => {
    if (!staffData.name.trim() || !staffData.email.trim()) {
      alert('必須項目を入力してください');
      return;
    }

    if (editingStaff) {
      setStaffList(prev => prev.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, ...staffData }
          : staff
      ));
      setSaveMessage('スタッフ情報を更新しました');
    } else {
      const newStaff: StaffData = {
        id: Date.now().toString(),
        ...staffData,
      };
      setStaffList(prev => [...prev, newStaff]);
      setSaveMessage('新しいスタッフを追加しました');
    }

    setBasicDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // NG関係管理の関数
  const handleAddNGRelation = () => {
    if (!selectedStaffForNGAgency || !selectedNGStaff || !ngReason.trim()) {
      alert('すべての項目を入力してください');
      return;
    }
    
    if (selectedStaffForNGAgency === selectedNGStaff) {
      alert('同じスタッフを選択することはできません');
      return;
    }
    
    const existingRelation = ngRelations.find(relation => 
      (relation.staffId === selectedStaffForNGAgency && relation.ngStaffId === selectedNGStaff) ||
      (relation.staffId === selectedNGStaff && relation.ngStaffId === selectedStaffForNGAgency)
    );
    
    if (existingRelation) {
      alert('この組み合わせのNG関係は既に登録されています');
      return;
    }
    
    const newRelation: NGStaffRelation = {
      id: Date.now().toString(),
      staffId: selectedStaffForNGAgency,
      ngStaffId: selectedNGStaff,
      reason: ngReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    
    const reverseRelation: NGStaffRelation = {
      id: (Date.now() + 1).toString(),
      staffId: selectedNGStaff,
      ngStaffId: selectedStaffForNGAgency,
      reason: ngReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    
    setNgRelations(prev => [...prev, newRelation, reverseRelation]);
    setSaveMessage('NG関係を登録しました');
    setNgDialogOpen(false);
    setSelectedStaffForNGAgency('');
    setSelectedNGStaff('');
    setNgReason('');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // NG代理店管理の関数
  const handleAddNGAgency = () => {
    if (!selectedStaffForNGAgency || !selectedAgency || !ngAgencyReason.trim()) {
      alert('すべての必須項目を入力してください');
      return;
    }

    if (selectedNGType !== 'agency' && !selectedTarget) {
      alert('対象を選択してください');
      return;
    }

    const selectedAgencyData = agencyOptions.find(agency => agency.id === selectedAgency);
    if (!selectedAgencyData) {
      alert('代理店が見つかりません');
      return;
    }

    let targetName = '';
    if (selectedNGType === 'layer') {
      const layerGroups = getLayerOptions(selectedAgency);
      let selectedLayerData = null;
      for (const group of layerGroups) {
        selectedLayerData = group.persons.find(person => person.id === selectedTarget);
        if (selectedLayerData) break;
      }
      targetName = selectedLayerData?.name || '';
    } else if (selectedNGType === 'store') {
      const storeOptions = getStoreOptions(selectedAgency);
      const selectedStoreData = storeOptions.find(store => store.id === selectedTarget);
      targetName = selectedStoreData?.name || '';
    }

    const existingNG = ngAgencies.find(ng => 
      ng.staffId === selectedStaffForNGAgency &&
      ng.agencyId === selectedAgency &&
      ng.ngType === selectedNGType &&
      (selectedNGType === 'agency' || ng.ngTargetId === selectedTarget)
    );

    if (existingNG) {
      alert('この設定は既に登録されています');
      return;
    }

    const newNGAgency: NGAgencyRelation = {
      id: Date.now().toString(),
      staffId: selectedStaffForNGAgency,
      agencyId: selectedAgency,
      agencyName: selectedAgencyData.name,
      ngType: selectedNGType,
      ngTargetId: selectedNGType === 'agency' ? undefined : selectedTarget,
      ngTargetName: selectedNGType === 'agency' ? undefined : targetName,
      reason: ngAgencyReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setNgAgencies(prev => [...prev, newNGAgency]);
    
    setSelectedStaffForNGAgency('');
    setSelectedAgency('');
    setSelectedNGType('agency');
    setSelectedTarget('');
    setNgAgencyReason('');
    setNgAgencyDialogOpen(false);
    
    setSaveMessage('NG代理店設定を追加しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // レンダリング関数
  const renderBasicManagement = () => (
    <Card>
      <CardHeader 
        title="スタッフ一覧"
        subheader="自社・2次請スタッフの統合管理（基本情報・スキル評価含む）"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStaff}
          >
            スタッフ追加
          </Button>
        }
      />
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>所属</TableCell>
                <TableCell>氏名</TableCell>
                <TableCell>役職</TableCell>
                <TableCell>獲得力</TableCell>
                <TableCell>最寄駅</TableCell>
                <TableCell>出張可否</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <Chip 
                      label={affiliationOptions.find(opt => opt.value === staff.affiliation)?.label || staff.affiliation}
                      color={staff.affiliation === 'ansteype' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {staff.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {staff.nameKana} ({staff.gender === 'male' ? '男' : '女'})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getPositionLabel(staff.position)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {staff.position === 'closer' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="primary">C:</Typography>
                          <Rating value={staff.closerSkillRating} max={5} size="small" readOnly />
                        </Box>
                      )}
                      {staff.position === 'girl' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="secondary">G:</Typography>
                          <Rating value={staff.girlSkillRating} max={5} size="small" readOnly />
                        </Box>
                      )}
                      {staff.position === 'trainee' && (
                        <Typography variant="caption" color="text.secondary">研修中</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{staff.nearestStation}</TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.businessTripAvailable ? '可' : '不可'}
                      color={staff.businessTripAvailable ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditBasicInfo(staff)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderNGManagement = () => (
    <Card>
      <CardHeader
        title="NG要員管理"
        subheader="スタッフ間のNG関係を管理"
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setNgDialogOpen(true)}
          >
            NGペア追加
          </Button>
        }
      />
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>基準スタッフ</TableCell>
                <TableCell>NGスタッフ</TableCell>
                <TableCell>理由</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ngRelations.map((relation) => {
                const baseStaff = staffList.find(s => s.id === relation.staffId);
                const ngStaff = staffList.find(s => s.id === relation.ngStaffId);
                return (
                  <TableRow key={relation.id}>
                    <TableCell>{baseStaff?.name || '不明'}</TableCell>
                    <TableCell>{ngStaff?.name || '不明'}</TableCell>
                    <TableCell>{relation.reason}</TableCell>
                    <TableCell>{relation.registeredDate}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (confirm('このNG関係を削除しますか？')) {
                            setNgRelations(prev => prev.filter(r => r.id !== relation.id));
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {ngRelations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      NG関係が登録されていません
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderNGAgencyManagement = () => (
    <Card>
      <CardHeader 
        title="NG代理店管理"
        subheader="スタッフごとに代理店・レイヤー・店舗別のNG設定を管理"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNgAgencyDialogOpen(true)}
          >
            NG代理店追加
          </Button>
        }
      />
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>スタッフ名</TableCell>
                <TableCell>代理店名</TableCell>
                <TableCell>NG種別</TableCell>
                <TableCell>対象</TableCell>
                <TableCell>理由</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ngAgencies.map((ngAgency) => {
                const staff = staffList.find(s => s.id === ngAgency.staffId);
                return (
                  <TableRow key={ngAgency.id}>
                    <TableCell>{staff?.name || '不明'}</TableCell>
                    <TableCell>{ngAgency.agencyName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          ngAgency.ngType === 'agency' ? '代理店全体' :
                          ngAgency.ngType === 'layer' ? 'レイヤー' : '店舗'
                        }
                        color={
                          ngAgency.ngType === 'agency' ? 'error' :
                          ngAgency.ngType === 'layer' ? 'warning' : 'info'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {ngAgency.ngType === 'agency' ? '-' : 
                       ngAgency.ngType === 'layer' && ngAgency.ngTargetId ? 
                         getLayerPersonName(ngAgency.ngTargetId) || ngAgency.ngTargetName :
                       ngAgency.ngType === 'store' && ngAgency.ngTargetId ?
                         getStoreName(ngAgency.ngTargetId) || ngAgency.ngTargetName :
                         ngAgency.ngTargetName
                      }
                    </TableCell>
                    <TableCell>{ngAgency.reason}</TableCell>
                    <TableCell>{ngAgency.registeredDate}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (confirm('このNG設定を削除しますか？')) {
                            setNgAgencies(prev => prev.filter(ng => ng.id !== ngAgency.id));
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {ngAgencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      NG代理店設定がありません
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        スタッフ管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ '& .MuiTab-root': { minHeight: 48 } }}
        >
          <Tab 
            value="basic" 
            label="スタッフ管理" 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="ng-relations" 
            label="NG要員管理" 
            icon={<BlockIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="ng-agencies" 
            label="NG代理店管理" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* タブコンテンツ */}
      {tabValue === 'basic' && renderBasicManagement()}
      {tabValue === 'ng-relations' && renderNGManagement()}
      {tabValue === 'ng-agencies' && renderNGAgencyManagement()}

      {/* 基本情報編集ダイアログ */}
      <Dialog 
        open={basicDialogOpen} 
        onClose={() => setBasicDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStaff ? 'スタッフ情報編集' : 'スタッフ追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>所属</InputLabel>
                <Select 
                  value={staffData.affiliation}
                  onChange={(e) => setStaffData({...staffData, affiliation: e.target.value})}
                >
                  {affiliationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名"
                value={staffData.name}
                onChange={(e) => setStaffData({...staffData, name: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名（カナ）"
                value={staffData.nameKana}
                onChange={(e) => setStaffData({...staffData, nameKana: e.target.value})}
                required
                fullWidth
                placeholder="例: タナカ タロウ"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>性別</InputLabel>
                <Select 
                  value={staffData.gender}
                  onChange={(e) => setStaffData({...staffData, gender: e.target.value as 'male' | 'female'})}
                >
                  <MenuItem value="male">男性</MenuItem>
                  <MenuItem value="female">女性</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="最寄り駅"
                value={staffData.nearestStation}
                onChange={(e) => setStaffData({...staffData, nearestStation: e.target.value})}
                required
                fullWidth
                placeholder="例: 渋谷駅"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={staffData.phone}
                onChange={(e) => setStaffData({...staffData, phone: e.target.value})}
                required
                fullWidth
                placeholder="例: 090-1234-5678"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="メールアドレス"
                type="email"
                value={staffData.email}
                onChange={(e) => setStaffData({...staffData, email: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="LINE ID"
                value={staffData.lineId}
                onChange={(e) => setStaffData({...staffData, lineId: e.target.value})}
                fullWidth
                placeholder="例: user_line_id"
                helperText="API連携での通知送信に使用されます"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>役職</InputLabel>
                <Select 
                  value={staffData.position}
                  onChange={(e) => setStaffData({...staffData, position: e.target.value})}
                >
                  {positionOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={staffData.businessTripAvailable}
                      onChange={(e) => setStaffData({...staffData, businessTripAvailable: e.target.checked})}
                    />
                  }
                  label="出張可否"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="平日単価（日給）"
                type="number"
                value={staffData.weekdayRate}
                onChange={(e) => setStaffData({...staffData, weekdayRate: Number(e.target.value)})}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="休日単価（日給）"
                type="number"
                value={staffData.weekendRate}
                onChange={(e) => setStaffData({...staffData, weekendRate: Number(e.target.value)})}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="初期パスワード"
                type={showPassword ? "text" : "password"}
                value={staffData.initialPassword}
                onChange={(e) => setStaffData({...staffData, initialPassword: e.target.value})}
                required
                fullWidth
                helperText="※スタッフが初回ログイン後に変更することを推奨します"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* スキル評価セクション */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>スキル評価</Typography>
            </Grid>

            {staffData.position === 'closer' && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom>クローザー獲得力</Typography>
                  <Rating
                    value={staffData.closerSkillRating}
                    onChange={(event, newValue) => {
                      setStaffData({...staffData, closerSkillRating: newValue || 1});
                    }}
                    max={5}
                    size="large"
                  />
                </Box>
              </Grid>
            )}

            {staffData.position === 'girl' && (
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" gutterBottom>ガール獲得力</Typography>
                  <Rating
                    value={staffData.girlSkillRating}
                    onChange={(event, newValue) => {
                      setStaffData({...staffData, girlSkillRating: newValue || 1});
                    }}
                    max={5}
                    size="large"
                  />
                </Box>
              </Grid>
            )}

            {staffData.position !== 'closer' && staffData.position !== 'girl' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  役職が「クローザー」または「ガール」の場合にスキル評価が表示されます。
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="評価コメント（任意）"
                value={staffData.skillNotes}
                onChange={(e) => setStaffData({...staffData, skillNotes: e.target.value})}
                multiline
                rows={2}
                fullWidth
                placeholder="例: 高い提案力とクロージング能力"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBasicDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveBasicInfo}
            variant="contained"
          >
            {editingStaff ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NG関係追加ダイアログ */}
      <Dialog 
        open={ngDialogOpen} 
        onClose={() => setNgDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>NG関係追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>基準スタッフ</InputLabel>
                <Select 
                  value={selectedStaffForNGAgency}
                  onChange={(e) => setSelectedStaffForNGAgency(e.target.value)}
                >
                  {staffList.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>NGスタッフ</InputLabel>
                <Select 
                  value={selectedNGStaff}
                  onChange={(e) => setSelectedNGStaff(e.target.value)}
                >
                  {staffList
                    .filter(staff => staff.id !== selectedStaffForNGAgency)
                    .map(staff => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name} ({getPositionLabel(staff.position)})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="NG理由"
                value={ngReason}
                onChange={(e) => setNgReason(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                placeholder="例: 過去のトラブル事例"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNgDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleAddNGRelation}
            variant="contained"
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* NG代理店追加ダイアログ */}
      <Dialog 
        open={ngAgencyDialogOpen} 
        onClose={() => setNgAgencyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>NG代理店設定追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>対象スタッフ</InputLabel>
                <Select 
                  value={selectedStaffForNGAgency}
                  onChange={(e) => {
                    setSelectedStaffForNGAgency(e.target.value);
                    setSelectedAgency('');
                    setSelectedTarget('');
                  }}
                >
                  {staffList.map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({getPositionLabel(staff.position)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>代理店</InputLabel>
                <Select 
                  value={selectedAgency}
                  onChange={(e) => {
                    setSelectedAgency(e.target.value);
                    setSelectedTarget('');
                  }}
                >
                  {agencyOptions.map(agency => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>NG種別</InputLabel>
                <Select 
                  value={selectedNGType}
                  onChange={(e) => {
                    setSelectedNGType(e.target.value as 'agency' | 'layer' | 'store');
                    setSelectedTarget('');
                  }}
                >
                  <MenuItem value="agency">代理店全体</MenuItem>
                  <MenuItem value="layer">特定レイヤー</MenuItem>
                  <MenuItem value="store">特定店舗</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {selectedNGType === 'layer' && selectedAgency && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>対象レイヤー</InputLabel>
                  <Select 
                    value={selectedTarget}
                    onChange={(e) => {
                      const value = e.target.value as string;
                      console.log('Layer selected:', value);
                      setSelectedTarget(value);
                    }}
                  >
                    {/* テスト用の固定選択肢 */}
                    <MenuItem value="test1">テスト選択肢1</MenuItem>
                    <MenuItem value="test2">テスト選択肢2</MenuItem>
                    
                    {/* 実際のレイヤーデータ */}
                    {(() => {
                      const layerGroups = getLayerOptions(selectedAgency);
                      console.log('=== DEBUG INFO ===');
                      console.log('Selected Agency:', selectedAgency);
                      console.log('Layer groups:', layerGroups);
                      console.log('Layer groups length:', layerGroups.length);
                      
                      if (layerGroups.length === 0) {
                        console.warn('No layer groups found!');
                        return <MenuItem value="no-data">データがありません</MenuItem>;
                      }
                      
                      const menuItems: React.ReactElement[] = [];
                      
                      layerGroups.forEach((layerGroup, groupIndex) => {
                        console.log(`Processing group ${groupIndex}:`, layerGroup);
                        
                        // レイヤー名（選択不可）
                        menuItems.push(
                          <MenuItem 
                            key={`header-${layerGroup.layerName}`}
                            disabled 
                            sx={{ 
                              fontWeight: 'bold', 
                              backgroundColor: '#f5f5f5',
                              '&.Mui-disabled': {
                                opacity: 1
                              }
                            }}
                          >
                            {layerGroup.layerName}
                          </MenuItem>
                        );
                        
                        // 人員（選択可能）
                        layerGroup.persons.forEach((person, personIndex) => {
                          console.log(`  Processing person ${personIndex}:`, person);
                          menuItems.push(
                            <MenuItem 
                              key={person.id} 
                              value={person.id} 
                              sx={{ 
                                pl: 4,
                                '&:hover': {
                                  backgroundColor: '#e3f2fd'
                                }
                              }}
                            >
                              {person.name}
                            </MenuItem>
                          );
                        });
                      });
                      
                      console.log('Generated menu items count:', menuItems.length);
                      console.log('==================');
                      return menuItems;
                    })()}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selectedNGType === 'store' && selectedAgency && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>対象店舗</InputLabel>
                  <Select 
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                  >
                    {getStoreOptions(selectedAgency).map(store => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="NG理由"
                value={ngAgencyReason}
                onChange={(e) => setNgAgencyReason(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                placeholder="例: 過去のクレーム対応でトラブル"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNgAgencyDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleAddNGAgency}
            variant="contained"
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;