import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  Badge,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupIcon from '@mui/icons-material/Group';
import PlaceIcon from '@mui/icons-material/Place';
import RoomIcon from '@mui/icons-material/Room';
import Drawer from '@mui/material/Drawer';
import DeleteIcon from '@mui/icons-material/Delete';

// プロジェクトの型定義
export interface Project {
  id: number;
  agencyName: string;
  storeName: string;
  coStores: string[]; // 連名店舗の配列
  venue: string;
  eventDate: string;
  unitPrice: number;
  days: number;
  addAmount: number;
  subAmount: number;
  status: string;
  revenue: number;
  // 追加プロパティ
  closerCount: number;
  girlCount: number;
  freeEntryCount: number;
  hasPlaceReservation: boolean;
  isMonthlyPayment: boolean; // 月払いフラグを追加
}

// ステータスの定義
const STATUS_OPTIONS = [
  { value: 'draft', label: '起票' },
  { value: 'quote_ready', label: '見積送付前' },
  { value: 'quote_sent', label: '見積送付済' },
  { value: 'quote_revision', label: '見積修正中' },
  { value: 'quote_revised', label: '見積修正済' },
  { value: 'on_hold', label: '保留' },
  { value: 'invoice_ready', label: '請求送付前' },
  { value: 'invoice_sent', label: '請求送付済' },
  { value: 'rejected', label: 'お断り' }
];

interface ProjectDetailModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  open,
  project,
  onClose,
  onSave
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedProject, setEditedProject] = React.useState<Project | null>(null);
  const [newCoStore, setNewCoStore] = React.useState('');
  const [deductions, setDeductions] = React.useState<{ name: string; amount: number }[]>([]);
  const [tabValue, setTabValue] = React.useState(0);
  // 連絡先リスト（ダミー）
  const [toContacts, setToContacts] = React.useState([
    { email: 'to1@example.com', lastName: '山田', firstName: '太郎' },
    { email: 'to2@example.com', lastName: '佐藤', firstName: '花子' }
  ]);
  const [ccContacts, setCcContacts] = React.useState([
    { email: 'cc1@example.com', lastName: '田中', firstName: '一郎' },
    { email: 'cc2@example.com', lastName: '鈴木', firstName: '美咲' }
  ]);

  // モーダルが開いたときに編集用の状態を初期化
  React.useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
      setNewCoStore('');
    }
  }, [project]);

  // 編集モードの切り替え
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // フィールド値の変更ハンドラー
  const handleFieldChange = (field: keyof Project, value: any) => {
    if (editedProject) {
      const updatedProject = { ...editedProject, [field]: value };
      
      // 収益を再計算する（unitPrice × days + addAmount - subAmount）
      if (['unitPrice', 'days', 'addAmount', 'subAmount'].includes(field)) {
        const { unitPrice, days, addAmount, subAmount } = updatedProject;
        updatedProject.revenue = (unitPrice * days) + addAmount - subAmount;
      }
      
      setEditedProject(updatedProject);
    }
  };

  // 連名店舗を追加するハンドラー
  const handleAddCoStore = () => {
    if (editedProject && newCoStore.trim() !== '') {
      const updatedCoStores = [...editedProject.coStores, newCoStore.trim()];
      handleFieldChange('coStores', updatedCoStores);
      setNewCoStore('');
    }
  };

  // 連名店舗を削除するハンドラー
  const handleRemoveCoStore = (index: number) => {
    if (editedProject) {
      const updatedCoStores = [...editedProject.coStores];
      updatedCoStores.splice(index, 1);
      handleFieldChange('coStores', updatedCoStores);
    }
  };

  // 減算項目リストの状態
  const handleAddDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0 }]);
  };
  // 項目削除
  const handleRemoveDeduction = (idx: number) => {
    setDeductions(deductions.filter((_, i) => i !== idx));
  };
  // 項目編集
  const handleDeductionChange = (idx: number, field: 'name' | 'amount', value: string | number) => {
    setDeductions(deductions.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  // 保存ボタンのハンドラー
  const handleSave = () => {
    if (editedProject) {
      onSave(editedProject);
      setIsEditing(false);
    }
  };

  // キャンセルボタンのハンドラー
  const handleCancel = () => {
    if (project) {
      setEditedProject({ ...project });
      setIsEditing(false);
    }
  };

  // 案件管理側のメモ（ダミー）
  const assignMemo = '';

  const handleAddToContact = () => setToContacts([...toContacts, { email: '', lastName: '', firstName: '' }]);
  const handleAddCcContact = () => setCcContacts([...ccContacts, { email: '', lastName: '', firstName: '' }]);
  const handleRemoveToContact = (idx: number) => setToContacts(toContacts.filter((_, i) => i !== idx));
  const handleRemoveCcContact = (idx: number) => setCcContacts(ccContacts.filter((_, i) => i !== idx));

  if (!project || !editedProject) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 900, maxWidth: '100vw', borderRadius: '16px 0 0 16px' } }}
    >
      <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ステータスプルダウン＋アイコンボタン（最上部・横並び） */}
        <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>ステータス</InputLabel>
              <Select
                value={editedProject.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                label="ステータス"
                disabled={false}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editedProject.isMonthlyPayment}
                  onChange={(e) => handleFieldChange('isMonthlyPayment', e.target.checked)}
                  color="primary"
                />
              }
              label="月払い"
              sx={{ ml: 1 }}
            />
          </Box>
          <Box>
            <IconButton onClick={handleEditToggle} color={isEditing ? 'primary' : 'default'} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        {/* 開催日程・代理店名ラベル */}
        <Box sx={{ px: 3, pt: 1, pb: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, fontSize: '1.2rem', mb: 0.5 }}>
            {formatEventDate(editedProject.eventDate, editedProject.days)}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'normal', mb: 1 }}>
            {editedProject.agencyName}
            </Typography>
        </Box>
        {/* 開催店舗・連名店舗ラベル＋バッジ */}
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ width: 80, fontWeight: 500 }}>開催店舗</Typography>
            <Box sx={{ bgcolor: '#bcd3f7', color: '#222', px: 2, py: 0.5, borderRadius: 1, fontWeight: 'bold', fontSize: '1.1rem', mr: 1 }}>
              {editedProject.storeName}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ width: 80, fontWeight: 500 }}>連名店舗</Typography>
            <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
              {editedProject.coStores.map((store, idx) => (
                <Box key={idx} sx={{ bgcolor: '#e0e0e0', color: '#222', px: 2, py: 0.5, borderRadius: 1, fontWeight: 500, fontSize: '1.05rem' }}>
                  {store}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        {/* 開催場所ラベル＋開催場所名 */}
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, fontSize: '1.1rem', mb: 0.5 }}>
            開催場所
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'normal', mb: 1 }}>
            {editedProject.venue}
          </Typography>
        </Box>
        {/* 金額・連絡先タブ */}
        <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="金額" />
            <Tab label="連絡先" />
          </Tabs>
        </Box>
        {tabValue === 0 && (
          <>
            {/* 役割ごとの要員数・単価・交通費・小計・合計テーブル */}
            <Box sx={{ px: 3, pt: 1, pb: 2 }}>
              <Table size="small" sx={{ minWidth: 480, borderCollapse: 'separate', borderSpacing: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>役割</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>人数</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>日数</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>単価</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>交通費</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>小計</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>合計</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* クローザー */}
                  <TableRow sx={{ height: 72 }}>
                    <TableCell sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.15rem' }}>クローザー</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.closerCount}名</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.days}日</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥18,000</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥4,000</TableCell>
                    <TableCell sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.15rem' }}>¥44,000</TableCell>
                    <TableCell rowSpan={2} sx={{ color: '#1565c0', fontWeight: 'bold', fontSize: '1.3rem', borderLeft: '2px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle' }}>¥67,000</TableCell>
                  </TableRow>
                  {/* ガール */}
                  <TableRow sx={{ height: 72 }}>
                    <TableCell sx={{ color: '#e91e63', fontWeight: 'bold', fontSize: '1.15rem' }}>ガール</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.girlCount}名</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>{editedProject.days}日</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥9,000</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥2,500</TableCell>
                    <TableCell sx={{ color: '#e91e63', fontWeight: 'bold', fontSize: '1.15rem' }}>¥23,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* 交通費ページ分けチェックボックス */}
            <Box sx={{ px: 3, pb: 1 }}>
              <FormControlLabel
                control={<Switch color="primary" />}
                label="交通費ページ分け"
              />
            </Box>
            {/* 場所取り情報（場所ラベル） - テーブル直下 */}
            <Box sx={{ px: 3, pt: 2, pb: 2, display: 'flex', alignItems: 'center' }}>
              <RoomIcon sx={{ color: 'green', mr: 1, fontSize: 32 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '1.5rem' }}>
                {editedProject.venue}
              </Typography>
            </Box>
            {/* 場所取り詳細テーブル */}
            <Box sx={{ px: 3, pb: 2 }}>
              <Table size="small" sx={{ minWidth: 480, borderCollapse: 'separate', borderSpacing: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>日付</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>ステータス</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>手配会社</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>卸単価</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>仕入単価</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.15rem' }}>1/15</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.15rem' }}>1/16</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontSize: '1.15rem' }}>1/17</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>確定</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>場所とる.com</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥50,000</TableCell>
                    <TableCell sx={{ fontSize: '1.15rem' }}>¥30,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            {/* 催事場費ページ分けチェックボックス */}
            <Box sx={{ px: 3, pb: 1 }}>
              <FormControlLabel
                control={<Switch color="primary" />}
                label="催事場費ページ分け"
              />
            </Box>
            {/* 減算金額入力セクション */}
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography sx={{ fontWeight: 'normal', fontSize: '1.15rem', mb: 1, mt: 2 }}>
                減算登録
            </Typography>
              {deductions.map((deduction, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <TextField
                    label="項目名"
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 180 }}
                    value={deduction.name}
                    onChange={e => handleDeductionChange(idx, 'name', e.target.value)}
                  />
                  <TextField
                    label="減算額"
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{ endAdornment: <InputAdornment position='end'>円</InputAdornment> }}
                    sx={{ minWidth: 140 }}
                    value={deduction.amount}
                    onChange={e => handleDeductionChange(idx, 'amount', Number(e.target.value))}
                  />
                  <IconButton onClick={() => handleRemoveDeduction(idx)} size="small" color="error" disabled={!isEditing}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={handleAddDeduction} variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditing}>⊕追加</Button>
            </Box>
            {/* メモセクション */}
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography sx={{ fontWeight: 'normal', fontSize: '1.15rem', mb: 1, mt: 2 }}>
                営業/アサイン 担当メモ
              </Typography>
              {assignMemo ? (
                <Typography sx={{ fontSize: '1rem', color: '#222', whiteSpace: 'pre-line' }}>{assignMemo}</Typography>
              ) : (
                <Typography sx={{ fontSize: '1rem', color: '#888', bgcolor: '#f5f5f5', px: 2, py: 1, borderRadius: 1, display: 'inline-block' }}>
                  メモはありません。
            </Typography>
              )}
            </Box>
          </>
        )}
        {tabValue === 1 && (
          <Box sx={{ px: 3, py: 2 }}>
            {/* 見積送付先セクション */}
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}>見積送付先</Typography>
            <Typography sx={{ fontWeight: 'normal', fontSize: '1rem', mb: 0.5 }}>To連絡先</Typography>
            {toContacts.map((c, idx: number) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <TextField
                  value={c.lastName}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 80 }}
                  label="姓"
                />
                <TextField
                  value={c.firstName}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 80 }}
                  label="名"
                />
                <TextField
                  value={c.email}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 220 }}
                  label="連絡先"
                />
                <IconButton onClick={() => handleRemoveToContact(idx)} size="small" color="error" disabled={!isEditing}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddToContact} variant="outlined" size="small" sx={{ minWidth: 120, mb: 2 }} disabled={!isEditing}>⊕追加</Button>
            <Typography sx={{ fontWeight: 'normal', fontSize: '1rem', mb: 0.5 }}>Cc連絡先</Typography>
            {ccContacts.map((c, idx: number) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <TextField
                  value={c.lastName}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 80 }}
                  label="姓"
                />
                <TextField
                  value={c.firstName}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 80 }}
                  label="名"
                />
                <TextField
                  value={c.email}
                  size="small"
                  variant="outlined"
                  InputProps={{ readOnly: !isEditing }}
                  sx={{ minWidth: 220 }}
                  label="連絡先"
                />
                <IconButton onClick={() => handleRemoveCcContact(idx)} size="small" color="error" disabled={!isEditing}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddCcContact} variant="outlined" size="small" sx={{ minWidth: 120, mb: 3 }} disabled={!isEditing}>⊕追加</Button>
            {/* 請求送付先セクション */}
            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}>請求送付先</Typography>
            {/* To/Cc連絡先は空欄でダミー表示 */}
            <Typography sx={{ fontWeight: 'normal', fontSize: '1rem', mb: 0.5 }}>To連絡先</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 80 }} label="姓" />
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 80 }} label="名" />
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 220 }} label="連絡先" />
            </Box>
            <Button variant="outlined" size="small" sx={{ minWidth: 120, mb: 2 }} disabled={!isEditing}>⊕追加</Button>
            <Typography sx={{ fontWeight: 'normal', fontSize: '1rem', mb: 0.5 }}>Cc連絡先</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 80 }} label="姓" />
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 80 }} label="名" />
              <TextField value="" size="small" variant="outlined" InputProps={{ readOnly: !isEditing }} sx={{ minWidth: 220 }} label="連絡先" />
            </Box>
            <Button variant="outlined" size="small" sx={{ minWidth: 120 }} disabled={!isEditing}>⊕追加</Button>
          </Box>
        )}
        {/* 必要最小限のボタンのみ表示 */}
        <Box sx={{ flex: 1 }} />
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isEditing ? (
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
            >
              保存
            </Button>
          ) : null}
      </DialogActions>
      </Box>
    </Drawer>
  );
};

function formatEventDate(eventDate: string, days: number): string {
  // eventDate: '2025-01-15' など
  const date = new Date(eventDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startDay = date.getDate();
  // 連続日付を生成
  const dayList = Array.from({ length: days }, (_, i) => startDay + i);
  // 週番号（2Wなど）
  const week = Math.floor((startDay - 1) / 7) + 1;
  return `${year}年${month}月 ${week}W ${dayList.map(d => `${d}日`).join('、')}（${days}日間）`;
}

export default ProjectDetailModal; 