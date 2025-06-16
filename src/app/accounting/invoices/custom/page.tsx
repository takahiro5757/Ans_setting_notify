'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';

// ステップ定義
const INVOICE_STEPS = [
  '請求作成',
  '送付先設定', 
  'プレビュー',
  '送付'
];

// スタイルコンポーネント
const CustomStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(2.5, 0),
  backgroundColor: 'transparent',
  '& .MuiStep-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  '& .MuiStepLabel-root': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  '& .MuiStepLabel-label': {
    marginTop: theme.spacing(1.2),
    fontWeight: 'normal',
    fontSize: '1rem',
    color: '#666',
    '&.Mui-active': {
      color: theme.palette.primary.main,
      fontWeight: 'medium',
    },
    '&.Mui-completed': {
      color: '#666',
      fontWeight: 'normal',
    },
  },
  '& .MuiStepIcon-root': {
    fontSize: '1.8rem',
    color: '#e0e0e0',
    '&.Mui-active': {
      color: theme.palette.primary.main,
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
  '& .MuiStepIcon-text': {
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
}));

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderTopWidth: 2,
    borderColor: '#e0e0e0',
    marginTop: '12px',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.success.main,
  },
}));

const OrganizationButton = styled(ToggleButton)(({ theme }) => ({
  padding: '4px 12px',
  border: '1px solid #e0e0e0',
  borderRadius: '20px !important',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  margin: theme.spacing(0.5),
  textTransform: 'none',
  backgroundColor: '#f5f5f5',
  minWidth: 120,
  maxWidth: 180,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&:hover': {
    backgroundColor: '#eeeeee',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

// フリー請求品目の型定義
interface FreeInvoiceItem {
  id: number;
  eventDate: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  taxType: 'taxable' | 'tax-free';
}

export default function FreeInvoicePage() {
  const router = useRouter();
  
  // 元のページと同じ状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['invoice_ready']);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  
  // フォーム状態
  const [agencyName, setAgencyName] = useState('');
  const [mainStores, setMainStores] = useState<string[]>([]);
  const [coStores, setCoStores] = useState<string[]>([]);
  const [orderDate, setOrderDate] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [items, setItems] = useState<FreeInvoiceItem[]>([
    {
      id: 1,
      eventDate: '',
      itemName: '',
      unitPrice: 0,
      quantity: 1,
      taxType: 'taxable'
    }
  ]);

  // 代理店リスト
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // 利用可能な店舗リスト
  const availableStores = [
    '大宮店', '浦和店', '川口店', '所沢店', '春日部店', '越谷店', '草加店', 
    '新越谷店', '保木間店', '若葉店', 'その他'
  ];

  // 元のページと同じハンドラー
  const handleAgencyChange = (_: any, newAgencies: string[]) => {
    setSelectedAgencies(newAgencies);
  };

  const handleStatusChange = (status: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStatus(prev => [...prev, status]);
    } else {
      setSelectedStatus(prev => prev.filter(s => s !== status));
    }
  };

  // 品目追加
  const handleAddItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems([...items, {
      id: newId,
      eventDate: '',
      itemName: '',
      unitPrice: 0,
      quantity: 1,
      taxType: 'taxable'
    }]);
  };

  // 品目削除
  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // 品目変更
  const handleItemChange = (id: number, field: keyof FreeInvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 金額計算
  const calculateAmount = (item: FreeInvoiceItem) => {
    return item.unitPrice * item.quantity;
  };

  // 合計計算
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateAmount(item), 0);
    const taxableAmount = items
      .filter(item => item.taxType === 'taxable')
      .reduce((sum, item) => sum + calculateAmount(item), 0);
    const tax = Math.floor(taxableAmount * 0.1);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // 請求作成
  const handleCreateInvoice = () => {
    // バリデーション
    if (!agencyName || mainStores.length === 0 || !orderDate || !paymentDeadline) {
      alert('必須項目を入力してください。');
      return;
    }

    if (items.some(item => !item.itemName || item.unitPrice <= 0)) {
      alert('品目名と単価を正しく入力してください。');
      return;
    }

    const { total } = calculateTotal();
    const generatedFileName = `請求書_${agencyName}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const invoiceData = {
      id: Date.now(),
      agencyName,
      sendTo: mainStores.join(', '),
      storeAddressSetting: coStores.join(', '),
      fileName: generatedFileName,
      totalAmount: total,
      createdAt: new Date().toISOString(),
      projectIds: [],
      mainStoreNames: mainStores,
      coStoreNames: coStores,
      orderDate,
      recipientName,
      items: items.map(item => ({
        id: item.id,
        eventDate: item.eventDate,
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        amount: calculateAmount(item),
        taxType: item.taxType
      }))
    };

    // データを保存してリダイレクト
    localStorage.setItem('freeInvoiceData', JSON.stringify(invoiceData));
    router.push('/accounting/invoices?from=custom');
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false} sx={{ position: 'relative' }}>
        {/* ステップナビゲーション */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3,
          px: 2
        }}>
          <Box sx={{ 
            maxWidth: '600px', 
            width: '100%'
          }}>
            <CustomStepper
              activeStep={0}
              connector={<CustomStepConnector />}
            >
              {INVOICE_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </CustomStepper>
          </Box>
        </Box>

        {/* 固定ヘッダー：年月週 */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3, px: 3, pt: 0, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '58px', mb: 2, mt: 0 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'nowrap' }}>
              <YearMonthSelector
                year={year}
                month={month}
                onYearChange={setYear}
                onMonthChange={setMonth}
                months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
              />
              <Box sx={{ mx: 1 }}>
                <WeekSelector
                  selectedWeek={selectedWeek}
                  onChange={setSelectedWeek}
                  year={year}
                  month={month}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              <FormGroup row sx={{ alignItems: 'center', px: 1, py: 0.5, mb: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatus.includes('invoice_ready')}
                      onChange={handleStatusChange('invoice_ready')}
                      size="small"
                      sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>請求送付前</Typography>}
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatus.includes('invoice_revised')}
                      onChange={handleStatusChange('invoice_revised')}
                      size="small"
                      sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }}
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>請求修正済</Typography>}
                />
              </FormGroup>
              
              <ToggleButtonGroup
                value={selectedAgencies}
                onChange={handleAgencyChange}
                aria-label="代理店選択"
                size="small"
                sx={{ flexWrap: 'wrap' }}
              >
                <OrganizationButton value="all" selected={selectedAgencies.includes('all')}>
                  すべて
                </OrganizationButton>
                {agencyList.map((agency) => (
                  <OrganizationButton key={agency} value={agency} selected={selectedAgencies.includes(agency)}>
                    {agency}
                  </OrganizationButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>

        {/* メインフォーム */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {/* ヘッダー：戻るボタン・タイトル・請求作成ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => router.push('/accounting/invoices')} 
                  sx={{ mr: 2, p: 0.5 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  フリー請求作成
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleCreateInvoice}
                disabled={!agencyName || mainStores.length === 0}
                sx={{ 
                  minWidth: '120px',
                  height: '40px',
                  fontWeight: 'bold'
                }}
              >
                請求作成
              </Button>
            </Box>
            
            {/* 基本情報 */}
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'medium' }}>基本情報</Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* 1行目：代理店 */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>代理店を選択してください</InputLabel>
                  <Select
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    label="代理店を選択してください"
                  >
                    {agencyList.map((agency) => (
                      <MenuItem key={agency} value={agency}>
                        {agency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* 2行目：送付先、店舗アドレス */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  送付先
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                  {mainStores.map((store, index) => (
                    <Chip
                      key={index}
                      label={store}
                      size="small"
                      sx={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        fontWeight: 'medium',
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                          '&:hover': {
                            color: '#ffcdd2',
                          },
                        },
                      }}
                      onDelete={() => setMainStores(mainStores.filter((_, i) => i !== index))}
                    />
                  ))}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !mainStores.includes(e.target.value as string)) {
                          setMainStores([...mainStores, e.target.value as string]);
                        }
                      }}
                      displayEmpty
                      renderValue={() => '追加'}
                      sx={{
                        height: 24,
                        minHeight: 24,
                        '& .MuiSelect-select': {
                          padding: '0 8px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: '#999',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          minHeight: '24px !important',
                          height: '24px !important',
                          lineHeight: '24px',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ccc',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#666',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      {availableStores
                        .filter(store => !mainStores.includes(store))
                        .map((store) => (
                          <MenuItem key={store} value={store}>
                            {store}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  店舗アドレス
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                  {coStores.map((store, index) => (
                    <Chip
                      key={index}
                      label={store}
                      size="small"
                      sx={{
                        backgroundColor: '#e0e0e0',
                        color: '#666',
                        fontWeight: 'normal',
                        '& .MuiChip-deleteIcon': {
                          color: '#666',
                          '&:hover': {
                            color: '#d32f2f',
                          },
                        },
                      }}
                      onDelete={() => setCoStores(coStores.filter((_, i) => i !== index))}
                    />
                  ))}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !coStores.includes(e.target.value as string)) {
                          setCoStores([...coStores, e.target.value as string]);
                        }
                      }}
                      displayEmpty
                      renderValue={() => '追加'}
                      sx={{
                        height: 24,
                        minHeight: 24,
                        '& .MuiSelect-select': {
                          padding: '0 8px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: '#999',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          minHeight: '24px !important',
                          height: '24px !important',
                          lineHeight: '24px',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ccc',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#666',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      {availableStores
                        .filter(store => !coStores.includes(store))
                        .map((store) => (
                          <MenuItem key={store} value={store}>
                            {store}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              {/* 3行目：発注日、振込み期日 */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="発注日"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="振込み期日"
                  type="date"
                  value={paymentDeadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* 請求品目 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>請求品目</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                品目追加
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '120px' }}>開催日</TableCell>
                  <TableCell sx={{ width: '300px' }}>品目名</TableCell>
                  <TableCell sx={{ width: '180px' }}>単価</TableCell>
                  <TableCell sx={{ width: '120px' }}>数量</TableCell>
                  <TableCell sx={{ width: '100px' }}>課税区分</TableCell>
                  <TableCell sx={{ width: '120px' }}>金額</TableCell>
                  <TableCell sx={{ width: '80px' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ width: '120px' }}>
                      <TextField
                        size="small"
                        type="date"
                        value={item.eventDate}
                        onChange={(e) => handleItemChange(item.id, 'eventDate', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '300px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                        placeholder="品目名を入力"
                      />
                    </TableCell>
                    <TableCell sx={{ width: '180px' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        InputProps={{
                          startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>¥</Typography>,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={item.taxType}
                          onChange={(e) => handleItemChange(item.id, 'taxType', e.target.value)}
                        >
                          <MenuItem value="taxable">課税</MenuItem>
                          <MenuItem value="tax-free">非課税</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      ¥{calculateAmount(item).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ width: '80px' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 合計金額 */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 300 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>小計:</Typography>
                  <Typography>¥{subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>消費税:</Typography>
                  <Typography>¥{tax.toLocaleString()}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="h6">合計:</Typography>
                  <Typography variant="h6">¥{total.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 