'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

// 送付履歴データの型定義
interface DeliveryFile {
  fileName: string;
  totalAmount: number;
}

interface DeliveryRecord {
  id: number;
  agencyName: string;
  mainStoreNames: string[]; // 送付先店舗
  coStoreNames: string[]; // 店舗アドレス（連名店舗）
  deliveryDateTime: string; // 送付日時
  files: DeliveryFile[]; // 複数ファイル対応
  type: 'estimate' | 'invoice';
  isRevised?: boolean; // 修正版送付済みフラグ
}

// 日付フォーマット関数
const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DeliveryPage() {
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [displayMode, setDisplayMode] = useState<'estimate' | 'invoice'>('estimate');
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string | number, boolean>>({});

  // 代理店リスト（見積処理と同じ）
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // サンプルデータ（大幅に増量）
  const deliveryRecords: DeliveryRecord[] = [
    // 株式会社ABC代理店
    {
      id: 1,
      agencyName: '株式会社ABC代理店',
      mainStoreNames: ['新宿店', '渋谷店'],
      coStoreNames: ['池袋店'],
      deliveryDateTime: '2025-01-15T14:30:00',
      files: [
        { fileName: 'estimate_ABC_shinjuku_20250115.pdf', totalAmount: 150000 },
        { fileName: 'estimate_ABC_shibuya_20250115.pdf', totalAmount: 120000 },
        { fileName: 'estimate_ABC_ikebukuro_20250115.pdf', totalAmount: 80000 }
      ],
      type: 'estimate',
      isRevised: true // 修正版送付済み
    },
    {
      id: 2,
      agencyName: '株式会社ABC代理店',
      mainStoreNames: ['新宿店'],
      coStoreNames: ['渋谷店', '池袋店'],
      deliveryDateTime: '2025-01-14T10:15:00',
      files: [
        { fileName: 'invoice_ABC_shinjuku_20250114.pdf', totalAmount: 200000 },
        { fileName: 'invoice_ABC_shibuya_20250114.pdf', totalAmount: 180000 }
      ],
      type: 'invoice'
    },
    {
      id: 3,
      agencyName: '株式会社ABC代理店',
      mainStoreNames: ['原宿店', '表参道店'],
      coStoreNames: ['青山店'],
      deliveryDateTime: '2025-01-13T16:45:00',
      files: [
        { fileName: 'estimate_ABC_harajuku_20250113.pdf', totalAmount: 95000 }
      ],
      type: 'estimate'
    },
    {
      id: 4,
      agencyName: '株式会社ABC代理店',
      mainStoreNames: ['六本木店'],
      coStoreNames: ['赤坂店', '虎ノ門店'],
      deliveryDateTime: '2025-01-12T09:20:00',
      files: [
        { fileName: 'invoice_ABC_roppongi_20250112.pdf', totalAmount: 250000 },
        { fileName: 'invoice_ABC_akasaka_20250112.pdf', totalAmount: 160000 },
        { fileName: 'invoice_ABC_toranomon_20250112.pdf', totalAmount: 140000 }
      ],
      type: 'invoice',
      isRevised: true // 修正版送付済み
    },
    {
      id: 5,
      agencyName: '株式会社ABC代理店',
      mainStoreNames: ['銀座店'],
      coStoreNames: [],
      deliveryDateTime: '2025-01-11T15:30:00',
      files: [
        { fileName: 'estimate_ABC_ginza_20250111.pdf', totalAmount: 300000 }
      ],
      type: 'estimate'
    },
    
    // DEF広告株式会社
    {
      id: 6,
      agencyName: 'DEF広告株式会社',
      mainStoreNames: ['銀座店'],
      coStoreNames: ['表参道店'],
      deliveryDateTime: '2025-01-15T11:20:00',
      files: [
        { fileName: 'estimate_DEF_ginza_20250115.pdf', totalAmount: 120000 },
        { fileName: 'estimate_DEF_omotesando_20250115.pdf', totalAmount: 90000 }
      ],
      type: 'estimate'
    },
    {
      id: 7,
      agencyName: 'DEF広告株式会社',
      mainStoreNames: ['恵比寿店', '代官山店'],
      coStoreNames: ['中目黒店'],
      deliveryDateTime: '2025-01-14T13:45:00',
      files: [
        { fileName: 'invoice_DEF_ebisu_20250114.pdf', totalAmount: 180000 },
        { fileName: 'invoice_DEF_daikanyama_20250114.pdf', totalAmount: 160000 },
        { fileName: 'invoice_DEF_nakameguro_20250114.pdf', totalAmount: 110000 }
      ],
      type: 'invoice',
      isRevised: true // 修正版送付済み
    },
    {
      id: 8,
      agencyName: 'DEF広告株式会社',
      mainStoreNames: ['品川店'],
      coStoreNames: ['五反田店', '大崎店'],
      deliveryDateTime: '2025-01-13T08:30:00',
      files: [
        { fileName: 'estimate_DEF_shinagawa_20250113.pdf', totalAmount: 220000 }
      ],
      type: 'estimate'
    },
    {
      id: 9,
      agencyName: 'DEF広告株式会社',
      mainStoreNames: ['上野店', '浅草店'],
      coStoreNames: ['秋葉原店'],
      deliveryDateTime: '2025-01-12T17:10:00',
      files: [
        { fileName: 'invoice_DEF_ueno_20250112.pdf', totalAmount: 130000 },
        { fileName: 'invoice_DEF_asakusa_20250112.pdf', totalAmount: 100000 },
        { fileName: 'invoice_DEF_akihabara_20250112.pdf', totalAmount: 85000 }
      ],
      type: 'invoice'
    },
    {
      id: 10,
      agencyName: 'DEF広告株式会社',
      mainStoreNames: ['吉祥寺店'],
      coStoreNames: ['三鷹店'],
      deliveryDateTime: '2025-01-11T12:00:00',
      files: [
        { fileName: 'estimate_DEF_kichijoji_20250111.pdf', totalAmount: 170000 },
        { fileName: 'estimate_DEF_mitaka_20250111.pdf', totalAmount: 140000 }
      ],
      type: 'estimate'
    },
    
    // GHIプロモーション
    {
      id: 11,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['品川店', '五反田店'],
      coStoreNames: [],
      deliveryDateTime: '2025-01-15T10:45:00',
      files: [
        { fileName: 'invoice_GHI_shinagawa_20250115.pdf', totalAmount: 180000 },
        { fileName: 'invoice_GHI_gotanda_20250115.pdf', totalAmount: 150000 }
      ],
      type: 'invoice'
    },
    {
      id: 12,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['新橋店'],
      coStoreNames: ['汐留店', '築地店'],
      deliveryDateTime: '2025-01-14T14:20:00',
      files: [
        { fileName: 'estimate_GHI_shimbashi_20250114.pdf', totalAmount: 200000 },
        { fileName: 'estimate_GHI_shiodome_20250114.pdf', totalAmount: 120000 },
        { fileName: 'estimate_GHI_tsukiji_20250114.pdf', totalAmount: 90000 }
      ],
      type: 'estimate',
      isRevised: true // 修正版送付済み
    },
    {
      id: 13,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['丸の内店', '大手町店'],
      coStoreNames: ['日本橋店'],
      deliveryDateTime: '2025-01-13T09:15:00',
      files: [
        { fileName: 'invoice_GHI_marunouchi_20250113.pdf', totalAmount: 280000 },
        { fileName: 'invoice_GHI_otemachi_20250113.pdf', totalAmount: 240000 },
        { fileName: 'invoice_GHI_nihonbashi_20250113.pdf', totalAmount: 190000 }
      ],
      type: 'invoice'
    },
    {
      id: 14,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['神田店'],
      coStoreNames: ['御茶ノ水店'],
      deliveryDateTime: '2025-01-12T16:30:00',
      files: [
        { fileName: 'estimate_GHI_kanda_20250112.pdf', totalAmount: 160000 }
      ],
      type: 'estimate'
    },
    {
      id: 15,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['錦糸町店', '亀戸店'],
      coStoreNames: ['両国店'],
      deliveryDateTime: '2025-01-11T11:45:00',
      files: [
        { fileName: 'invoice_GHI_kinshicho_20250111.pdf', totalAmount: 140000 },
        { fileName: 'invoice_GHI_kameido_20250111.pdf', totalAmount: 120000 },
        { fileName: 'invoice_GHI_ryogoku_20250111.pdf', totalAmount: 100000 }
      ],
      type: 'invoice'
    },
    {
      id: 16,
      agencyName: 'GHIプロモーション',
      mainStoreNames: ['立川店'],
      coStoreNames: ['国分寺店', '国立店'],
      deliveryDateTime: '2025-01-10T13:20:00',
      files: [
        { fileName: 'estimate_GHI_tachikawa_20250110.pdf', totalAmount: 110000 },
        { fileName: 'estimate_GHI_kokubunji_20250110.pdf', totalAmount: 95000 }
      ],
      type: 'estimate'
    }
  ];

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

  // アコーディオン展開ハンドラ
  const handleAccordionChange = (recordId: number | string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [recordId]: isExpanded
    }));
  };

  // フィルタリングされた送付履歴
  const filteredRecords = useMemo(() => {
    return deliveryRecords.filter(record => {
      // 表示モードでフィルタ
      if (record.type !== displayMode) return false;
      
      // 代理店でフィルタ
      if (!selectedAgencies.includes('all') && !selectedAgencies.includes(record.agencyName)) {
        return false;
      }
      
      return true;
    });
  }, [deliveryRecords, displayMode, selectedAgencies]);

  // 代理店ごとにグループ化
  const groupedRecords = useMemo(() => {
    return filteredRecords.reduce((acc, record) => {
      if (!acc[record.agencyName]) {
        acc[record.agencyName] = [];
      }
      acc[record.agencyName].push(record);
      return acc;
    }, {} as Record<string, DeliveryRecord[]>);
  }, [filteredRecords]);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false} sx={{ position: 'relative' }}>
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

        {/* メインコンテンツエリア */}
        <Paper sx={{ p: 3, mb: 3 }}>
          {/* 送付履歴リスト */}
          {Object.keys(groupedRecords).length > 0 ? (
            Object.entries(groupedRecords).map(([agencyName, agencyRecords]) => (
              <Box key={agencyName} sx={{ mb: 4 }}>
                {/* 代理店見出し */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: 4, height: 28, backgroundColor: '#17424d', mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {agencyName}
                  </Typography>
                </Box>
                
                {/* 送付履歴アコーディオン */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {agencyRecords.map((record) => (
                    <Accordion
                      key={record.id}
                      expanded={expandedAccordions[record.id] || false}
                      onChange={handleAccordionChange(record.id)}
                      sx={{
                        border: '1px solid #e0e0e0',
                        boxShadow: 'none',
                        margin: 0,
                        backgroundColor: record.isRevised ? '#f5f5f5' : 'white',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: 0,
                          backgroundColor: record.isRevised ? '#f5f5f5' : 'white',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ order: 2, marginLeft: 1 }} />}
                        sx={{
                          minHeight: 48,
                          '&.Mui-expanded': {
                            minHeight: 48,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                            {/* 送付先 */}
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                送付先
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                {record.mainStoreNames.map((store, index) => (
                                  <Chip
                                    key={index}
                                    label={store}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#2196f3',
                                      color: 'white',
                                      fontWeight: 'medium',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Grid>
                            
                            {/* 店舗アドレス */}
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                店舗アドレス
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                {record.coStoreNames.length > 0 ? (
                                  record.coStoreNames.map((store, index) => (
                                    <Chip
                                      key={index}
                                      label={store}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#e0e0e0',
                                        color: '#666',
                                        fontWeight: 'normal',
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.disabled">
                                    なし
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                            
                            {/* 送付日時 */}
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                送付日時
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {formatDateTime(record.deliveryDateTime)}
                              </Typography>
                            </Grid>
                            
                            {/* 修正版送付済チップ */}
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                                {record.isRevised && (
                                  <Chip
                                    label="修正版送付済"
                                    size="small"
                                    sx={{
                                      backgroundColor: '#757575',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '0.75rem',
                                    }}
                                  />
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', width: '300px', minWidth: '300px' }}>ファイル名</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', width: '150px', minWidth: '150px' }}>合計金額</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {record.files.map((file, index) => (
                              <TableRow key={index} sx={{ height: '53px' }}>
                                <TableCell sx={{ width: '300px', minWidth: '300px' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {file.fileName}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ width: '150px', minWidth: '150px' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    ¥{file.totalAmount.toLocaleString()}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '400px',
              color: 'text.secondary'
            }}>
              <Typography variant="h6">
                {displayMode === 'estimate' ? '見積書' : '請求書'}の送付履歴がありません
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
} 