'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';

// ステップ定義
const ESTIMATION_STEPS = [
  '見積作成',
  '送付先設定',
  'プレビュー',
  '送付'
];

// カスタムStepperスタイル
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

// 見積品目の型定義
interface EstimateItem {
  id: number;
  eventDate: string;
  itemName: string;
  unitPrice: string;
  quantity: number;
  taxType: 'taxable' | 'tax-free';
}

export default function FreeEstimatePage() {
  const router = useRouter();
  
  // 今日の日付を取得
  const today = new Date().toISOString().split('T')[0];
  
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [agencyName, setAgencyName] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [recipient, setRecipient] = useState('');
  const [sendTo, setSendTo] = useState<string[]>(['大宮店']);
  const [storeAddress, setStoreAddress] = useState<string[]>(['春日部店', '保木間店', '若葉店']);
  const [paymentDeadline, setPaymentDeadline] = useState('');
  const [items, setItems] = useState<EstimateItem[]>([
    {
      id: 1,
      eventDate: today,
      itemName: '',
      unitPrice: '',
      quantity: 1,
      taxType: 'taxable'
    }
  ]);

  // 代理店リスト（見積管理ページと同じ）
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // 利用可能な店舗リスト
  const availableStores = [
    '大宮店', '浦和店', '川口店', '所沢店', '春日部店', '越谷店', '草加店', 
    '新越谷店', '三郷店', '八潮店', '吉川店', '松伏店', '大袋店', '南越谷店',
    '蒲生店', '新三郷店', '北越谷店', '保木間店', '若葉店'
  ];

  // 戻るボタンハンドラー
  const handleGoBack = () => {
    router.back();
  };

  // 品目追加ハンドラー
  const handleAddItem = () => {
    const newItem: EstimateItem = {
      id: Date.now(),
      eventDate: today,
      itemName: '',
      unitPrice: '',
      quantity: 1,
      taxType: 'taxable'
    };
    setItems([...items, newItem]);
  };

  // 品目削除ハンドラー
  const handleDeleteItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // 品目更新ハンドラー
  const handleUpdateItem = (id: number, field: keyof EstimateItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 見積作成ハンドラー
  const handleCreateEstimate = () => {
    // バリデーション
    if (!agencyName.trim()) {
      alert('代理店を選択してください');
      return;
    }
    if (!recipient.trim()) {
      alert('宛先を入力してください');
      return;
    }
    if (!sendTo.length) {
      alert('送付先を選択してください');
      return;
    }
    if (!storeAddress.length) {
      alert('店舗アドレスを選択してください');
      return;
    }
    if (!paymentDeadline) {
      alert('振り込み期日を設定してください');
      return;
    }
    if (items.some(item => !item.itemName.trim() || !item.unitPrice.trim())) {
      alert('すべての品目の品目名と単価を入力してください');
      return;
    }

    // 見積データを作成
    const processedItems = items.map(item => ({
      id: item.id,
      eventDate: item.eventDate,
      itemName: item.itemName,
      unitPrice: parseFloat(item.unitPrice) || 0,
      quantity: item.quantity,
      amount: (parseFloat(item.unitPrice) || 0) * item.quantity,
      taxType: item.taxType
    }));

    // 税込み総額を計算
    const subtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxableAmount = processedItems.filter(item => item.taxType === 'taxable').reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(taxableAmount * 0.1);
    const totalAmountWithTax = subtotal + taxAmount;

    const estimateData = {
      id: Date.now() + Math.random(),
      agencyName,
      sendTo: `${agencyName.replace('株式会社', '').replace('プロモーション', '')}@example.com`,
      storeAddressSetting: '本店住所',
      fileName: `見積書_${agencyName}_${issueDate}.pdf`,
      totalAmount: totalAmountWithTax,
      createdAt: new Date().toLocaleString('ja-JP'),
      projectIds: [],
      mainStoreNames: sendTo,
      coStoreNames: storeAddress,
      items: processedItems,
      issueDate,
      recipient,
      paymentDeadline
    };

    console.log('フリー見積データ:', estimateData);
    
    // フリー見積データをlocalStorageに保存
    localStorage.setItem('freeEstimateData', JSON.stringify(estimateData));
    
    // 送付先設定ステップに遷移（activeStep=2）
    router.push('/accounting/estimates?step=2&from=free');
  };

  // 合計金額計算
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (unitPrice * item.quantity);
    }, 0);
    
    const taxableAmount = items
      .filter(item => item.taxType === 'taxable')
      .reduce((sum, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return sum + (unitPrice * item.quantity);
      }, 0);
    
    const tax = Math.floor(taxableAmount * 0.1);
    return subtotal + tax;
  };

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
              activeStep={0} // フリー見積作成は最初のステップ
              connector={<CustomStepConnector />}
            >
              {ESTIMATION_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </CustomStepper>
          </Box>
        </Box>

        {/* 固定ヘッダー：年月週 */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3, px: 3, pt: 0, pb: 2 }}>
          {/* 年月週選択コンポーネントと右側のフィルター */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '58px', mb: 2, mt: 0 }}>
            {/* 左側：年月週選択 */}
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
          </Box>
        </Box>

        {/* フリー見積作成フォーム */}
        <Container maxWidth="lg" sx={{ px: 8 }}>
          <Paper sx={{ p: 4, mx: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={handleGoBack}
                  sx={{ mr: 2 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  フリー見積作成
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateEstimate}
                sx={{ 
                  minWidth: '120px',
                  height: '48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                見積作成
              </Button>
            </Box>

            {/* 基本情報 */}
            <Box sx={{ mb: 4 }}>
              {/* 代理店選択 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  代理店
                </Typography>
                <FormControl fullWidth size="medium">
                  <Select
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>代理店を選択してください</em>
                    </MenuItem>
                    {agencyList.map((agency) => (
                      <MenuItem key={agency} value={agency}>
                        {agency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                {/* 送付先 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    送付先
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {sendTo.map((store, index) => (
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
                        onDelete={() => {
                          const newStores = sendTo.filter((_, i) => i !== index);
                          setSendTo(newStores);
                        }}
                      />
                    ))}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !sendTo.includes(e.target.value as string)) {
                            setSendTo([...sendTo, e.target.value as string]);
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
                          .filter(store => !sendTo.includes(store))
                          .map((store) => (
                            <MenuItem key={store} value={store}>
                              {store}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* 店舗アドレス */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    店舗アドレス
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {storeAddress.map((store, index) => (
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
                        onDelete={() => {
                          const newStores = storeAddress.filter((_, i) => i !== index);
                          setStoreAddress(newStores);
                        }}
                      />
                    ))}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !storeAddress.includes(e.target.value as string)) {
                            setStoreAddress([...storeAddress, e.target.value as string]);
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
                          .filter(store => !storeAddress.includes(store))
                          .map((store) => (
                            <MenuItem key={store} value={store}>
                              {store}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                {/* 発行日 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    発行日
                  </Typography>
                  <TextField
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    fullWidth
                    size="medium"
                    InputLabelProps={{ shrink: true }}
                    placeholder="YYYY/MM/DD"
                  />
                </Box>

                {/* 振り込み期日 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    振り込み期日
                  </Typography>
                  <TextField
                    type="date"
                    value={paymentDeadline}
                    onChange={(e) => setPaymentDeadline(e.target.value)}
                    fullWidth
                    size="medium"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              {/* 宛先 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  宛先
                </Typography>
                <TextField
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  fullWidth
                  size="medium"
                  placeholder="株式会社○○"
                />
              </Box>
            </Box>

            {/* 見積品目は下部に配置（画像では見えていないため、スクロールで表示される想定） */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  見積品目
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleAddItem}
                  sx={{ fontSize: '0.9rem' }}
                >
                  + 品目追加
                </Button>
              </Box>

              {/* 品目リスト */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 100px 80px 120px 60px',
                      gap: 2,
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    {/* 開催日 */}
                    <TextField
                      type="date"
                      value={item.eventDate}
                      onChange={(e) => handleUpdateItem(item.id, 'eventDate', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* 品目名 */}
                    <TextField
                      value={item.itemName}
                      onChange={(e) => handleUpdateItem(item.id, 'itemName', e.target.value)}
                      placeholder="品目名"
                      size="small"
                    />

                    {/* 単価 */}
                    <TextField
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                      placeholder="単価"
                      size="small"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5, color: '#666' }}>¥</Typography>
                      }}
                    />

                    {/* 数 */}
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      size="small"
                      inputProps={{ min: 1, step: 1 }}
                    />

                    {/* 課税区分 */}
                    <FormControl size="small">
                      <Select
                        value={item.taxType}
                        onChange={(e) => handleUpdateItem(item.id, 'taxType', e.target.value)}
                      >
                        <MenuItem value="taxable">課税</MenuItem>
                        <MenuItem value="tax-free">非課税</MenuItem>
                      </Select>
                    </FormControl>

                    {/* 削除ボタン */}
                    <IconButton
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={items.length === 1}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 合計金額 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  合計金額（税込）: ¥{calculateTotal().toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Container>
    </Box>
  );
} 