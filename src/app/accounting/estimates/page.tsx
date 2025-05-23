'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import { styled } from '@mui/material/styles';

// 見積データの型定義
interface Estimate {
  id: number;
  agencyName: string;
  storeName: string;
  venue: string;
  eventDate: string;
  status: 'draft' | 'quote_ready' | 'quote_sent' | 'quote_revision' | 'approved' | 'rejected';
  estimateNumber: string;
  totalAmount: number;
  closerCount: number;
  girlCount: number;
  days: number;
  createdDate: string;
  lastModified: string;
}

// ダミー見積データ
const MOCK_ESTIMATES: Estimate[] = [
  {
    id: 1,
    agencyName: '株式会社ABC代理店',
    storeName: '大宮店',
    venue: '島忠ホームズ川越',
    eventDate: '2025-01-01',
    status: 'quote_ready',
    estimateNumber: 'EST-2025-0001',
    totalAmount: 50000,
    closerCount: 1,
    girlCount: 2,
    days: 3,
    createdDate: '2024-12-15',
    lastModified: '2024-12-15'
  },
  {
    id: 2,
    agencyName: '株式会社ABC代理店',
    storeName: '浦和店',
    venue: 'コクーンシティ',
    eventDate: '2025-01-10',
    status: 'quote_sent',
    estimateNumber: 'EST-2025-0002',
    totalAmount: 34000,
    closerCount: 2,
    girlCount: 1,
    days: 2,
    createdDate: '2024-12-16',
    lastModified: '2024-12-18'
  },
  {
    id: 3,
    agencyName: 'DEF広告株式会社',
    storeName: '春日部店',
    venue: 'イオンモール春日部',
    eventDate: '2025-01-05',
    status: 'quote_revision',
    estimateNumber: 'EST-2025-0003',
    totalAmount: 45000,
    closerCount: 2,
    girlCount: 3,
    days: 2,
    createdDate: '2024-12-17',
    lastModified: '2024-12-20'
  },
  {
    id: 4,
    agencyName: 'GHIプロモーション',
    storeName: '草加店',
    venue: 'ららぽーと新三郷',
    eventDate: '2025-01-10',
    status: 'approved',
    estimateNumber: 'EST-2025-0004',
    totalAmount: 78000,
    closerCount: 1,
    girlCount: 1,
    days: 4,
    createdDate: '2024-12-18',
    lastModified: '2024-12-22'
  }
];

// 代理店選択ボタン
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
    }
  }
}));

// ステータスごとの色マップ
const STATUS_COLORS: Record<string, string> = {
  draft: '#9e9e9e',
  quote_ready: '#2196f3',
  quote_sent: '#03a9f4',
  quote_revision: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336'
};

// ステータスラベル
const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  quote_ready: '見積送付前',
  quote_sent: '見積送付済',
  quote_revision: '修正中',
  approved: '承認済',
  rejected: 'お断り'
};

export default function EstimatesPage() {
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
  
  // 代理店リスト
  const agencyList = Array.from(new Set(MOCK_ESTIMATES.map(e => e.agencyName)));

  // 代理店選択ハンドラ
  const handleAgencyChange = (_: any, newAgencies: string[]) => {
    if (newAgencies.includes('all')) {
      setSelectedAgencies(['all']);
    } else if (newAgencies.length === 0) {
      setSelectedAgencies(['all']);
    } else {
      setSelectedAgencies(newAgencies);
    }
  };

  // ステータス選択ハンドラ
  const handleStatusChange = (_: any, newStatuses: string[]) => {
    if (newStatuses.includes('all')) {
      setStatusFilter(['all']);
    } else if (newStatuses.length === 0) {
      setStatusFilter(['all']);
    } else {
      setStatusFilter(newStatuses);
    }
  };
  
  // フィルター適用済み見積
  const filteredEstimates = MOCK_ESTIMATES.filter(estimate => {
    // 代理店フィルター
    if (!selectedAgencies.includes('all') && !selectedAgencies.includes(estimate.agencyName)) {
      return false;
    }
    // ステータスフィルター
    if (!statusFilter.includes('all') && !statusFilter.includes(estimate.status)) {
      return false;
    }
    // キーワード検索
    const keyword = searchKeyword.toLowerCase();
    const keywordMatch = 
      searchKeyword === '' ||
      estimate.venue.toLowerCase().includes(keyword) ||
      estimate.estimateNumber.toLowerCase().includes(keyword) ||
      estimate.storeName.toLowerCase().includes(keyword);
    return keywordMatch;
  });

  // 日付表示用フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric'
    }).replace(/\//g, '/');
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false} sx={{ position: 'relative' }}>
        {/* 固定ヘッダー：年月週・代理店選択・ステータス選択 */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3, px: 3, pt: 1, pb: 3 }}>
          {/* 年月週選択コンポーネント */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'nowrap', height: '58px', mb: 2, mt: 1 }}>
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

          {/* 代理店選択ボタン群 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: 80, fontWeight: 'bold' }}>代理店：</Typography>
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

          {/* ステータス選択ボタン群 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: 80, fontWeight: 'bold' }}>ステータス：</Typography>
            <ToggleButtonGroup
              value={statusFilter}
              onChange={handleStatusChange}
              aria-label="ステータス選択"
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              <OrganizationButton value="all" selected={statusFilter.includes('all')}>
                すべて
              </OrganizationButton>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <OrganizationButton key={status} value={status} selected={statusFilter.includes(status)}>
                  {label}
                </OrganizationButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 検索ボックス */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: 80, fontWeight: 'bold' }}>検索：</Typography>
            <TextField
              size="small"
              placeholder="見積番号、開催場所、店舗名で検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon sx={{ color: '#666' }} />
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {/* 集計表示 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6, mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>総件数</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1 }}>{filteredEstimates.length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>見積送付前</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1, color: STATUS_COLORS.quote_ready }}>{filteredEstimates.filter(e => e.status === 'quote_ready').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>見積送付済</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1, color: STATUS_COLORS.quote_sent }}>{filteredEstimates.filter(e => e.status === 'quote_sent').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>承認済</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', lineHeight: 1, color: STATUS_COLORS.approved }}>{filteredEstimates.filter(e => e.status === 'approved').length}</Typography>
            </Box>
          </Box>
        </Box>

        {/* 見積一覧テーブル */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>見積一覧</Typography>
            <Button variant="contained" sx={{ minWidth: 120 }}>
              新規見積
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>見積番号</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>代理店</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>店舗</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>開催場所</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>開催日</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>人員</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>金額</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ステータス</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>最終更新</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEstimates.map((estimate) => (
                <TableRow key={estimate.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{estimate.estimateNumber}</TableCell>
                  <TableCell>{estimate.agencyName}</TableCell>
                  <TableCell>{estimate.storeName}</TableCell>
                  <TableCell>{estimate.venue}</TableCell>
                  <TableCell>{formatDate(estimate.eventDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`C:${estimate.closerCount}`} size="small" color="primary" />
                      <Chip label={`G:${estimate.girlCount}`} size="small" color="secondary" />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>¥{estimate.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={STATUS_LABELS[estimate.status]} 
                      size="small"
                      sx={{ 
                        bgcolor: STATUS_COLORS[estimate.status],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(estimate.lastModified)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" title="編集">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="default" title="プレビュー">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="info" title="メール送信">
                        <EmailIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary" title="印刷">
                        <PrintIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEstimates.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                該当する見積がありません。
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
} 