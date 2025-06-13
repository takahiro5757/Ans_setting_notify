'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import YearMonthSelector from '@/components/YearMonthSelector';

// 代理店選択ボタン（見積処理と同じスタイル）
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

// 金額データの型定義
interface AmountData {
  id: number;
  agencyName: string;
  storeName: string;
  paymentType: 'weekly' | 'monthly' | 'fulltime';
  dataType: 'estimate' | 'invoice'; // 見積か請求かを区別
  amounts: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week5?: number; // 5週目は月によって存在しない場合がある
    monthly?: number; // 月払い金額
  };
}

// モックデータ
const MOCK_AMOUNT_DATA: AmountData[] = [
  // 見積データ
  {
    id: 1,
    agencyName: '株式会社ABC代理店',
    storeName: '大宮店',
    paymentType: 'weekly',
    dataType: 'estimate',
    amounts: { week1: 50000, week2: 45000, week3: 52000, week4: 48000 }
  },
  {
    id: 2,
    agencyName: '株式会社ABC代理店',
    storeName: '池袋店',
    paymentType: 'monthly',
    dataType: 'estimate',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 180000 }
  },
  {
    id: 3,
    agencyName: '株式会社ABC代理店',
    storeName: '新宿店',
    paymentType: 'weekly',
    dataType: 'estimate',
    amounts: { week1: 35000, week2: 40000, week3: 38000, week4: 42000 }
  },
  {
    id: 4,
    agencyName: 'DEF広告株式会社',
    storeName: '渋谷店',
    paymentType: 'weekly',
    dataType: 'estimate',
    amounts: { week1: 60000, week2: 55000, week3: 58000, week4: 62000 }
  },
  {
    id: 5,
    agencyName: 'DEF広告株式会社',
    storeName: '品川店',
    paymentType: 'monthly',
    dataType: 'estimate',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 220000 }
  },
  {
    id: 6,
    agencyName: 'GHIプロモーション',
    storeName: '横浜店',
    paymentType: 'weekly',
    dataType: 'estimate',
    amounts: { week1: 45000, week2: 50000, week3: 47000, week4: 53000 }
  },
  {
    id: 7,
    agencyName: '株式会社ABC代理店',
    storeName: '秋葉原店',
    paymentType: 'fulltime',
    dataType: 'estimate',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 250000 }
  },
  {
    id: 8,
    agencyName: 'DEF広告株式会社',
    storeName: '上野店',
    paymentType: 'fulltime',
    dataType: 'estimate',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 280000 }
  },
  // 請求データ
  {
    id: 11,
    agencyName: '株式会社ABC代理店',
    storeName: '大宮店',
    paymentType: 'weekly',
    dataType: 'invoice',
    amounts: { week1: 48000, week2: 43000, week3: 50000, week4: 46000 }
  },
  {
    id: 12,
    agencyName: '株式会社ABC代理店',
    storeName: '池袋店',
    paymentType: 'monthly',
    dataType: 'invoice',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 175000 }
  },
  {
    id: 13,
    agencyName: '株式会社ABC代理店',
    storeName: '新宿店',
    paymentType: 'weekly',
    dataType: 'invoice',
    amounts: { week1: 33000, week2: 38000, week3: 36000, week4: 40000 }
  },
  {
    id: 14,
    agencyName: 'DEF広告株式会社',
    storeName: '渋谷店',
    paymentType: 'weekly',
    dataType: 'invoice',
    amounts: { week1: 58000, week2: 53000, week3: 56000, week4: 60000 }
  },
  {
    id: 15,
    agencyName: 'DEF広告株式会社',
    storeName: '品川店',
    paymentType: 'monthly',
    dataType: 'invoice',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 215000 }
  },
  {
    id: 16,
    agencyName: 'GHIプロモーション',
    storeName: '横浜店',
    paymentType: 'weekly',
    dataType: 'invoice',
    amounts: { week1: 43000, week2: 48000, week3: 45000, week4: 51000 }
  },
  {
    id: 17,
    agencyName: '株式会社ABC代理店',
    storeName: '秋葉原店',
    paymentType: 'fulltime',
    dataType: 'invoice',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 245000 }
  },
  {
    id: 18,
    agencyName: 'DEF広告株式会社',
    storeName: '上野店',
    paymentType: 'fulltime',
    dataType: 'invoice',
    amounts: { week1: 0, week2: 0, week3: 0, week4: 0, monthly: 275000 }
  }
];

export default function AmountsPage() {
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [displayMode, setDisplayMode] = useState<'estimate' | 'invoice'>('estimate');

  // 代理店リスト（見積処理と同じ）
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // 代理店選択ハンドラ（見積処理と同じロジック）
  const handleAgencyChange = (_: any, newAgencies: string[]) => {
    if (newAgencies.includes('all')) {
      setSelectedAgencies(['all']);
    } else if (newAgencies.length === 0) {
      setSelectedAgencies(['all']);
    } else {
      setSelectedAgencies(newAgencies);
    }
  };

  // フィルター適用済みデータ（表示モードとエージェンシーでフィルタリング）
  const filteredData = useMemo(() => {
    let data = MOCK_AMOUNT_DATA.filter(item => item.dataType === displayMode);
    
    if (!selectedAgencies.includes('all')) {
      data = data.filter(item => selectedAgencies.includes(item.agencyName));
    }
    
    return data;
  }, [selectedAgencies, displayMode]);

  // 代理店ごとにグループ化
  const groupedData = useMemo(() => {
    return filteredData.reduce<Record<string, AmountData[]>>((acc, data) => {
      if (!acc[data.agencyName]) {
        acc[data.agencyName] = [];
      }
      acc[data.agencyName].push(data);
      return acc;
    }, {});
  }, [filteredData]);

  // 金額フォーマット関数
  const formatAmount = (amount: number) => {
    return amount === 0 ? '-' : `¥${amount.toLocaleString()}`;
  };

  // 週のヘッダー生成
  const getWeekHeaders = () => {
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const weeks = [];
    
    for (let i = 1; i <= 4; i++) {
      const startDate = (i - 1) * 7 + 1;
      const endDate = Math.min(i * 7, daysInMonth);
      weeks.push(`第${i}週 (${startDate}-${endDate}日)`);
    }
    
    // 5週目がある場合
    if (daysInMonth > 28) {
      const week5Start = 29;
      weeks.push(`第5週 (${week5Start}-${daysInMonth}日)`);
    }
    
    return weeks;
  };

  const weekHeaders = getWeekHeaders();

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false} sx={{ px: 4 }}>
        {/* 固定ヘッダー：年月 */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3, px: 3, pt: 0, pb: 2 }}>
          {/* 年月選択コンポーネントと右側のフィルター */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '58px', mb: 2, mt: 0 }}>
            {/* 左側：年月選択 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'nowrap' }}>
              <YearMonthSelector
                year={year}
                month={month}
                onYearChange={setYear}
                onMonthChange={setMonth}
                months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
              />
            </Box>
            
            {/* 右側：代理店選択 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              {/* 代理店選択ボタン群 */}
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
          
          {/* 表示切替ボタン */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={(_, v) => v && setDisplayMode(v)}
              aria-label="表示切替"
              size="small"
              sx={{ mr: 2, borderRadius: 2, boxShadow: 0 }}
            >
              <ToggleButton value="estimate" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: '8px 0 0 8px' }}>
                見積
              </ToggleButton>
              <ToggleButton value="invoice" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: '0 8px 8px 0' }}>
                請求
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* 金額テーブル：代理店ごとにセクション分け */}
        {Object.entries(groupedData).map(([agencyName, agencyData]) => (
          <Paper key={agencyName} sx={{ mb: 4 }}>
            {/* 代理店名ヘッダー */}
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 4, height: 28, bgcolor: '#1976d2', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {agencyName}
                </Typography>
              </Box>
            </Box>

            {/* テーブル */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>店舗名</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100, textAlign: 'center' }}>種別</TableCell>
                    {weekHeaders.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold', minWidth: 120, textAlign: 'right' }}>
                        {header}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120, textAlign: 'right' }}>
                      月払い
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120, textAlign: 'right', bgcolor: '#e3f2fd' }}>
                      月合計
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agencyData.map((data) => {
                    const weeklyTotal = (data.amounts.week1 || 0) + (data.amounts.week2 || 0) + (data.amounts.week3 || 0) + (data.amounts.week4 || 0) + (data.amounts.week5 || 0);
                    const monthlyAmount = data.amounts.monthly || 0;
                    const monthTotal = weeklyTotal + monthlyAmount;
                    
                    return (
                      <TableRow key={data.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{data.storeName}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={
                              data.paymentType === 'weekly' ? '週払い' : 
                              data.paymentType === 'monthly' ? '月払い' : '常勤'
                            }
                            size="small"
                            color={
                              data.paymentType === 'weekly' ? 'primary' : 
                              data.paymentType === 'monthly' ? 'secondary' : 'success'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>{formatAmount(data.amounts.week1)}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>{formatAmount(data.amounts.week2)}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>{formatAmount(data.amounts.week3)}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>{formatAmount(data.amounts.week4)}</TableCell>
                        {weekHeaders.length > 4 && (
                          <TableCell sx={{ textAlign: 'right' }}>{formatAmount(data.amounts.week5 || 0)}</TableCell>
                        )}
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          fontWeight: (data.paymentType === 'monthly' || data.paymentType === 'fulltime') ? 'bold' : 'normal'
                        }}>
                          {formatAmount(monthlyAmount)}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          fontWeight: 'bold', 
                          bgcolor: '#e3f2fd',
                          color: '#1976d2'
                        }}>
                          ¥{monthTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* 代理店合計行 */}
                  {(() => {
                    const agencyTotals = {
                      week1: agencyData.reduce((sum, data) => sum + (data.amounts.week1 || 0), 0),
                      week2: agencyData.reduce((sum, data) => sum + (data.amounts.week2 || 0), 0),
                      week3: agencyData.reduce((sum, data) => sum + (data.amounts.week3 || 0), 0),
                      week4: agencyData.reduce((sum, data) => sum + (data.amounts.week4 || 0), 0),
                      week5: agencyData.reduce((sum, data) => sum + (data.amounts.week5 || 0), 0),
                      monthly: agencyData.reduce((sum, data) => sum + (data.amounts.monthly || 0), 0)
                    };
                    const agencyGrandTotal = Object.values(agencyTotals).reduce((sum, amount) => sum + amount, 0);
                    
                    return (
                      <TableRow sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderTop: '2px solid #dee2e6',
                        '& .MuiTableCell-root': {
                          fontWeight: 'bold',
                          fontSize: '0.95rem'
                        }
                      }}>
                        <TableCell sx={{ color: '#495057' }}>合計</TableCell>
                        <TableCell></TableCell>
                        <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                          {agencyTotals.week1 > 0 ? `¥${agencyTotals.week1.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                          {agencyTotals.week2 > 0 ? `¥${agencyTotals.week2.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                          {agencyTotals.week3 > 0 ? `¥${agencyTotals.week3.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                          {agencyTotals.week4 > 0 ? `¥${agencyTotals.week4.toLocaleString()}` : '-'}
                        </TableCell>
                        {weekHeaders.length > 4 && (
                          <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                            {agencyTotals.week5 > 0 ? `¥${agencyTotals.week5.toLocaleString()}` : '-'}
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: 'right', color: '#495057' }}>
                          {agencyTotals.monthly > 0 ? `¥${agencyTotals.monthly.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell sx={{ 
                          textAlign: 'right', 
                          bgcolor: '#d1ecf1',
                          color: '#0c5460',
                          fontSize: '1rem'
                        }}>
                          ¥{agencyGrandTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}

        {/* データが存在しない場合 */}
        {Object.keys(groupedData).length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              選択された条件に該当するデータがありません。
            </Typography>
          </Paper>
        )}
        
      </Container>
    </Box>
  );
}