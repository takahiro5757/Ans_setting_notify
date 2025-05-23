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
  ToggleButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupIcon from '@mui/icons-material/Group';
import RoomIcon from '@mui/icons-material/Room';
import ProjectDetailModal, { Project } from '../../../components/accounting/ProjectDetailModal';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import { styled } from '@mui/material/styles';

// ダミー案件データ（修正済み）
const MOCK_PROJECTS: Project[] = [
  // 株式会社ABC代理店
  {
    id: 1,
    agencyName: '株式会社ABC代理店',
    storeName: '大宮店',
    coStores: ['春日部店', '保木間店', '若葉店'],
    venue: '島忠ホームズ川越',
    eventDate: '2025-01-01',
    unitPrice: 15000,
    days: 3,
    addAmount: 5000,
    subAmount: 0,
    status: 'quote_ready',
    revenue: 50000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true
  },
  {
    id: 2,
    agencyName: '株式会社ABC代理店',
    storeName: '浦和店',
    coStores: ['大宮店', '春日部店'],
    venue: 'コクーンシティ',
    eventDate: '2025-01-10',
    unitPrice: 17000,
    days: 2,
    addAmount: 3000,
    subAmount: 1000,
    status: 'quote_sent',
    revenue: 34000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false
  },
  {
    id: 3,
    agencyName: '株式会社ABC代理店',
    storeName: '川口店',
    coStores: ['浦和店', '大宮店'],
    venue: 'アリオ川口',
    eventDate: '2025-01-15',
    unitPrice: 16000,
    days: 3,
    addAmount: 2000,
    subAmount: 500,
    status: 'revision',
    revenue: 48000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true
  },
  {
    id: 4,
    agencyName: '株式会社ABC代理店',
    storeName: '所沢店',
    coStores: ['川口店', '浦和店'],
    venue: 'グランエミオ所沢',
    eventDate: '2025-01-20',
    unitPrice: 18000,
    days: 2,
    addAmount: 4000,
    subAmount: 2000,
    status: 'invoice_ready',
    revenue: 36000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false
  },
  // DEF広告株式会社
  {
    id: 5,
    agencyName: 'DEF広告株式会社',
    storeName: '春日部店',
    coStores: ['保木間店', '草加店'],
    venue: 'イオンモール春日部',
    eventDate: '2025-01-05',
    unitPrice: 20000,
    days: 2,
    addAmount: 10000,
    subAmount: 5000,
    status: 'quote_sent',
    revenue: 45000,
    closerCount: 2,
    girlCount: 3,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 6,
    agencyName: 'DEF広告株式会社',
    storeName: '越谷店',
    coStores: ['春日部店', '草加店'],
    venue: 'イオンレイクタウン',
    eventDate: '2025-01-12',
    unitPrice: 21000,
    days: 3,
    addAmount: 2000,
    subAmount: 1000,
    status: 'quote_ready',
    revenue: 63000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 2,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  },
  {
    id: 7,
    agencyName: 'DEF広告株式会社',
    storeName: '草加店',
    coStores: ['越谷店', '春日部店'],
    venue: '草加マルイ',
    eventDate: '2025-01-18',
    unitPrice: 18000,
    days: 2,
    addAmount: 3000,
    subAmount: 500,
    status: 'revision',
    revenue: 36000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 8,
    agencyName: 'DEF広告株式会社',
    storeName: '新越谷店',
    coStores: ['草加店', '越谷店'],
    venue: 'ヴァリエ新越谷',
    eventDate: '2025-01-25',
    unitPrice: 19000,
    days: 3,
    addAmount: 1000,
    subAmount: 0,
    status: 'invoice_ready',
    revenue: 57000,
    closerCount: 1,
    girlCount: 3,
    freeEntryCount: 2,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  },
  // GHIプロモーション
  {
    id: 9,
    agencyName: 'GHIプロモーション',
    storeName: '草加店',
    coStores: ['若葉店', '大宮店'],
    venue: 'ららぽーと新三郷',
    eventDate: '2025-01-10',
    unitPrice: 18000,
    days: 4,
    addAmount: 8000,
    subAmount: 2000,
    status: 'revision',
    revenue: 78000,
    closerCount: 1,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true
  },
  {
    id: 10,
    agencyName: 'GHIプロモーション',
    storeName: '八潮店',
    coStores: ['草加店', '大宮店'],
    venue: 'フレスポ八潮',
    eventDate: '2025-01-15',
    unitPrice: 17500,
    days: 2,
    addAmount: 2000,
    subAmount: 500,
    status: 'quote_ready',
    revenue: 35000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false
  },
  {
    id: 11,
    agencyName: 'GHIプロモーション',
    storeName: '三郷店',
    coStores: ['八潮店', '草加店'],
    venue: 'イトーヨーカドー三郷',
    eventDate: '2025-01-20',
    unitPrice: 20000,
    days: 3,
    addAmount: 5000,
    subAmount: 1000,
    status: 'quote_sent',
    revenue: 60000,
    closerCount: 1,
    girlCount: 3,
    freeEntryCount: 2,
    hasPlaceReservation: true,
    isMonthlyPayment: true
  },
  {
    id: 12,
    agencyName: 'GHIプロモーション',
    storeName: '吉川店',
    coStores: ['三郷店', '八潮店'],
    venue: 'イオンタウン吉川美南',
    eventDate: '2025-01-28',
    unitPrice: 18500,
    days: 2,
    addAmount: 3000,
    subAmount: 500,
    status: 'invoice_ready',
    revenue: 37000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: false
  },
  // JKLマーケティング
  {
    id: 13,
    agencyName: 'JKLマーケティング',
    storeName: '越谷店',
    coStores: ['草加店', '大宮店'],
    venue: 'イトーヨーカドー三郷',
    eventDate: '2025-01-15',
    unitPrice: 25000,
    days: 2,
    addAmount: 0,
    subAmount: 5000,
    status: 'invoice_ready',
    revenue: 45000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 2,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 14,
    agencyName: 'JKLマーケティング',
    storeName: '松伏店',
    coStores: ['越谷店', '草加店'],
    venue: '松伏ショッピングプラザ',
    eventDate: '2025-01-22',
    unitPrice: 24000,
    days: 3,
    addAmount: 2000,
    subAmount: 1000,
    status: 'quote_ready',
    revenue: 72000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  },
  {
    id: 15,
    agencyName: 'JKLマーケティング',
    storeName: '春日部店',
    coStores: ['松伏店', '越谷店'],
    venue: 'ララガーデン春日部',
    eventDate: '2025-01-28',
    unitPrice: 23000,
    days: 2,
    addAmount: 1000,
    subAmount: 0,
    status: 'quote_sent',
    revenue: 46000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 16,
    agencyName: 'JKLマーケティング',
    storeName: '大袋店',
    coStores: ['春日部店', '松伏店'],
    venue: 'イオン大袋',
    eventDate: '2025-02-02',
    unitPrice: 22000,
    days: 3,
    addAmount: 3000,
    subAmount: 500,
    status: 'revision',
    revenue: 66000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  },
  // 代理店ごとにさらに1件ずつ追加
  {
    id: 17,
    agencyName: '株式会社ABC代理店',
    storeName: '南越谷店',
    coStores: ['大宮店', '浦和店'],
    venue: '南越谷ラクーン',
    eventDate: '2025-02-10',
    unitPrice: 15500,
    days: 2,
    addAmount: 2000,
    subAmount: 500,
    status: 'quote_ready',
    revenue: 31000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 18,
    agencyName: 'DEF広告株式会社',
    storeName: '蒲生店',
    coStores: ['越谷店', '春日部店'],
    venue: '蒲生ショッピングモール',
    eventDate: '2025-02-12',
    unitPrice: 19500,
    days: 3,
    addAmount: 1000,
    subAmount: 0,
    status: 'invoice_ready',
    revenue: 58500,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  },
  {
    id: 19,
    agencyName: 'GHIプロモーション',
    storeName: '新三郷店',
    coStores: ['三郷店', '八潮店'],
    venue: 'ららぽーと新三郷',
    eventDate: '2025-02-15',
    unitPrice: 18200,
    days: 2,
    addAmount: 2000,
    subAmount: 500,
    status: 'quote_sent',
    revenue: 36400,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: true
  },
  {
    id: 20,
    agencyName: 'JKLマーケティング',
    storeName: '北越谷店',
    coStores: ['越谷店', '松伏店'],
    venue: '北越谷ショッピングセンター',
    eventDate: '2025-02-18',
    unitPrice: 22500,
    days: 3,
    addAmount: 1500,
    subAmount: 500,
    status: 'quote_ready',
    revenue: 67500,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false
  }
];

// アサイン画面風の丸み・配色のボタン
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

// ステータスごとのタイル色マップ
const STATUS_TILE_COLORS: Record<string, string> = {
  draft: '#fff', // 起票: 白
  quote_ready: '#e3f0fa', // 見積送付前: 薄青
  quote_sent: '#eaf6fb', // 見積送付済: 薄水色
  quote_revision: '#fff8e1', // 見積修正中: 薄黄
  quote_revised: '#e8f5e9', // 見積修正済: 薄緑
  on_hold: '#f5f5f5', // 保留: 薄グレー
  invoice_ready: '#fff3e0', // 請求送付前: 薄オレンジ
  invoice_sent: '#e8f5e9', // 請求送付済: 薄緑
  rejected: '#bdbdbd' // お断り: 濃いグレー
};

export default function ProjectsPage() {
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'normal' | 'multi'>('normal');
  
  // 代理店リスト（ダミーデータから一意に抽出）
  const agencyList = Array.from(new Set(MOCK_PROJECTS.map(p => p.agencyName)));

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
  
  // フィルター適用済みプロジェクト
  const filteredProjects = MOCK_PROJECTS.filter(project => {
    // 代理店フィルター
    if (!selectedAgencies.includes('all') && !selectedAgencies.includes(project.agencyName)) {
      return false;
    }
    // キーワード検索
    const keyword = searchKeyword.toLowerCase();
    const keywordMatch = 
      searchKeyword === '' ||
      project.venue.toLowerCase().includes(keyword) ||
      project.eventDate.toLowerCase().includes(keyword) ||
      project.storeName.toLowerCase().includes(keyword);
    return keywordMatch;
  });

  // 代理店ごとにグルーピング
  const groupedProjects = filteredProjects.reduce<Record<string, Project[]>>((acc, project) => {
    if (!acc[project.agencyName]) acc[project.agencyName] = [];
    acc[project.agencyName].push(project);
    return acc;
  }, {});

  // カードをクリックした時の処理
  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // プロジェクト保存処理
  const handleSaveProject = (updatedProject: Project) => {
    // 実際のアプリではここでAPIを呼び出して更新処理を行う
    setModalOpen(false);
  };

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
        {/* 固定ヘッダー：年月週・表示切替・代理店選択・集計・凡例 */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3 }}>
          {/* ステータス色凡例（右上） */}
          <Box sx={{ position: 'absolute', right: 32, top: 16, zIndex: 20, bgcolor: '#fff', borderRadius: 2, boxShadow: 1, px: 2, py: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>凡例</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#fff', borderRadius: 1, mr: 0.5, border: '1px solid #e0e0e0' }} /> <Typography variant="caption">起票</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#e3f0fa', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">見積送付前</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#eaf6fb', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">見積送付済</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#fff8e1', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">見積修正中</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#e8f5e9', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">見積修正済</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#f5f5f5', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">保留</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#fff3e0', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">請求送付前</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#e8f5e9', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">請求送付済</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#bdbdbd', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">お断り</Typography></Box>
            </Box>
          </Box>
          {/* 年月週選択コンポーネント */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'nowrap', height: '58px', pt: 2, mb: 2 }}>
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
          {/* 表示切替＋代理店選択ボタン群 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            {/* 表示切替ボタン */}
            <ToggleButtonGroup
              value={displayMode}
              exclusive
              onChange={(_, v) => v && setDisplayMode(v)}
              aria-label="表示切替"
              size="small"
              sx={{ mr: 2, borderRadius: 2, boxShadow: 0 }}
            >
              <ToggleButton value="normal" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: '8px 0 0 8px' }}>
                通常
              </ToggleButton>
              <ToggleButton value="multi" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: '0 8px 8px 0' }}>
                帯案件
              </ToggleButton>
            </ToggleButtonGroup>
            {/* 代理店選択ボタン群 */}
            <ToggleButtonGroup
              value={selectedAgencies}
              onChange={handleAgencyChange}
              aria-label="代理店選択"
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              <OrganizationButton value="all" aria-label="すべて" selected={selectedAgencies.includes('all')}>
                すべて
              </OrganizationButton>
              {agencyList.map((agency) => (
                <OrganizationButton key={agency} value={agency} aria-label={agency} selected={selectedAgencies.includes(agency)}>
                  {agency}
                </OrganizationButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {/* ステータス集計コンポーネント */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 6, pl: 3, py: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>起票</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'draft').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>見積送付前</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'quote_ready').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>見積送付済</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'quote_sent').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>請求送付前</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_ready').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>請求送付済</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_sent').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>お断り</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'rejected').length}</Typography>
            </Box>
          </Box>
        </Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          {/* 代理店ごとにグループ化して表示 */}
          {Object.entries(groupedProjects).map(([agency, projects]) => (
            <Box key={agency} sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
              </Box>
          <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={12} md={2} key={project.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3, transform: 'scale(1.02)' },
                    transition: 'all 0.2s ease',
                    height: '100%',
                    width: '100%',
                        maxWidth: 400,
                        bgcolor: STATUS_TILE_COLORS[project.status] || '#ffffff',
                    borderRadius: 2,
                    position: 'relative',
                    p: 0,
                    overflow: 'visible'
                  }}
                  onClick={() => handleCardClick(project)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${formatDate(project.eventDate)} ${project.storeName} ${project.venue} クローザー${project.closerCount}名 ガール${project.girlCount}名 無料入店${project.freeEntryCount}名 ${project.hasPlaceReservation ? '場所取りあり' : ''}`}
                >
                  {/* カード全体のコンテナ */}
                  <Box sx={{ p: 3 }}>
                    {/* 場所取りマーカー（右上） */}
                    {project.hasPlaceReservation && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          zIndex: 1,
                          color: '#4caf50'
                        }}
                        aria-hidden="true"
                      >
                        <RoomIcon
                          sx={{
                            fontSize: 32,
                          }}
                        />
                      </Box>
                    )}
                    {/* 開催店舗 */}
                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                      <Typography 
                        variant="caption" 
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: '16px',
                          bgcolor: '#2196f3',
                          color: 'white',
                          fontWeight: 'medium',
                          fontSize: '0.9rem',
                          display: 'inline-block'
                        }}
                      >
                        {project.storeName}
                      </Typography>
                    </Box>
                    {/* 連名店舗 */}
                    <Box 
                      sx={{ 
                        display: 'flex',
                        flexWrap: 'nowrap',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        mb: 1.5,
                        gap: 0.8
                      }}
                    >
                      {project.coStores.map((store, index) => (
                        <Typography 
                          key={index} 
                          variant="caption" 
                          sx={{ 
                            px: 1.5,
                            py: 0.4,
                            bgcolor: '#e0e0e0',
                            color: '#666',
                            borderRadius: '14px',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem',
                            fontWeight: 'normal'
                          }}
                        >
                          {store}
                        </Typography>
                      ))}
                    </Box>
                    {/* 開催日 or 稼働日数 */}
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.95rem', display: 'block', mb: 0.8 }}>
                      {displayMode === 'multi' ? `稼働日数：${project.days}日` : formatDate(project.eventDate)}
                    </Typography>
                    {/* 開催場所 */}
                    <Typography variant="body2" component="div" sx={{ fontWeight: 'medium', mb: 2, fontSize: '1.25rem' }}>
                      {project.venue}
                    </Typography>
                    {/* 人員情報 */}
                    <Box sx={{ display: 'flex', gap: 3, mt: 1.5, alignItems: 'center' }}>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ color: '#1976d2', mr: 0.7, fontSize: '2rem' }} />
                        <Typography variant="caption" fontSize="1.2rem">{project.closerCount}名</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <WomanIcon sx={{ color: '#f50057', mr: 0.7, fontSize: '2rem' }} />
                        <Typography variant="caption" fontSize="1.2rem">{project.girlCount}名</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <GroupIcon sx={{ color: '#4caf50', mr: 0.7, fontSize: '2rem' }} />
                        <Typography variant="caption" fontSize="1.2rem">{project.freeEntryCount}名</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
            </Box>
          ))}

          {/* 案件詳細モーダル */}
          <ProjectDetailModal
            open={modalOpen}
            project={selectedProject}
            onClose={handleCloseModal}
            onSave={handleSaveProject}
          />
        </Paper>
      </Container>
    </Box>
  );
} 