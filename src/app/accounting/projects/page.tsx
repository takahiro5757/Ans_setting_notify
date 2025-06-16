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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupIcon from '@mui/icons-material/Group';
import RoomIcon from '@mui/icons-material/Room';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
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
    isMonthlyPayment: true,
    transportationTaxFree: false,
    accountingMemo: '初回案件につき、支払い条件要確認'
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
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    status: 'quote_revision',
    revenue: 48000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true,
    transportationTaxFree: false,
    accountingMemo: '請求書分割希望との連絡あり'
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
    status: 'invoice_revision',
    revenue: 36000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    isMonthlyPayment: false,
    transportationTaxFree: true,
    accountingMemo: '月末締め翌月末支払い条件で合意済み'
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
    status: 'quote_revision',
    revenue: 36000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    status: 'invoice_revised',
    revenue: 57000,
    closerCount: 1,
    girlCount: 3,
    freeEntryCount: 2,
    hasPlaceReservation: true,
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    status: 'quote_revision',
    revenue: 78000,
    closerCount: 1,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    status: 'invoice_revision',
    revenue: 37000,
    closerCount: 2,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: false,
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    isMonthlyPayment: false,
    transportationTaxFree: true,
    accountingMemo: '振込手数料は当社負担で合意'
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
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    status: 'quote_revision',
    revenue: 66000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false,
    transportationTaxFree: true
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
    isMonthlyPayment: true,
    transportationTaxFree: false,
    accountingMemo: '初回案件につき、支払い条件要確認'
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
    status: 'invoice_revised',
    revenue: 58500,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: true,
    isMonthlyPayment: false,
    transportationTaxFree: true,
    accountingMemo: '月末締め翌月末支払い条件で合意済み'
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
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    isMonthlyPayment: false,
    transportationTaxFree: true
  }
];

// 常勤データ用の型定義
interface RegularWorker {
  id: number;
  agencyName: string;
  workLocation: string;
  workType: '派遣' | '業務委託';
  workerName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalAmount: number;
}

// 常勤ダミーデータ
const MOCK_REGULAR_WORKERS: RegularWorker[] = [
  {
    id: 1,
    agencyName: '株式会社ABC代理店',
    workLocation: '新宿オフィス',
    workType: '派遣',
    workerName: '田中 太郎',
    unitPrice: 2000,
    quantity: 160,
    unit: '時間',
    totalAmount: 320000
  },
  {
    id: 2,
    agencyName: '株式会社ABC代理店',
    workLocation: '渋谷オフィス',
    workType: '業務委託',
    workerName: '佐藤 花子',
    unitPrice: 25000,
    quantity: 20,
    unit: '日',
    totalAmount: 500000
  },
  {
    id: 3,
    agencyName: 'DEF広告株式会社',
    workLocation: '池袋オフィス',
    workType: '派遣',
    workerName: '鈴木 一郎',
    unitPrice: 1800,
    quantity: 140,
    unit: '時間',
    totalAmount: 252000
  },
  {
    id: 4,
    agencyName: 'DEF広告株式会社',
    workLocation: '銀座オフィス',
    workType: '業務委託',
    workerName: '山田 美咲',
    unitPrice: 30000,
    quantity: 15,
    unit: '日',
    totalAmount: 450000
  },
  {
    id: 5,
    agencyName: 'GHIプロモーション',
    workLocation: '浦和オフィス',
    workType: '派遣',
    workerName: '高橋 健太',
    unitPrice: 2200,
    quantity: 170,
    unit: '時間',
    totalAmount: 374000
  },
  {
    id: 6,
    agencyName: 'GHIプロモーション',
    workLocation: '大宮オフィス',
    workType: '業務委託',
    workerName: '伊藤 由美',
    unitPrice: 28000,
    quantity: 18,
    unit: '日',
    totalAmount: 504000
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
  invoice_revision: '#ffcc80', // 請求書修正中: オレンジ
  invoice_revised: '#c8e6c9', // 請求書修正済: 薄い緑
  invoice_sent: '#e8f5e9', // 請求送付済: 薄緑
  rejected: '#bdbdbd' // お断り: 濃いグレー
};

export default function ProjectsPage() {
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'normal' | 'multi' | 'regular'>('normal');
  
  // 編集機能のための新しい状態
  const [editingWorkers, setEditingWorkers] = useState<Set<number>>(new Set());
  const [editedWorkerData, setEditedWorkerData] = useState<Record<number, RegularWorker>>({});
  
  // 新規追加機能のための状態
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState<Omit<RegularWorker, 'id' | 'totalAmount'>>({
    agencyName: '株式会社ABC代理店',
    workLocation: '',
    workType: '派遣',
    workerName: '',
    unitPrice: 2000,
    quantity: 160,
    unit: '時間'
  });
  
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

  // 常勤データのフィルタリング
  const filteredRegularWorkers = MOCK_REGULAR_WORKERS.filter(worker => {
    // 代理店フィルター
    if (!selectedAgencies.includes('all') && !selectedAgencies.includes(worker.agencyName)) {
      return false;
    }
    // キーワード検索
    const keyword = searchKeyword.toLowerCase();
    const keywordMatch = 
      searchKeyword === '' ||
      worker.workLocation.toLowerCase().includes(keyword) ||
      worker.workerName.toLowerCase().includes(keyword);
    return keywordMatch;
  });

  // 代理店ごとにグルーピング
  const groupedProjects = filteredProjects.reduce<Record<string, Project[]>>((acc, project) => {
    if (!acc[project.agencyName]) acc[project.agencyName] = [];
    acc[project.agencyName].push(project);
    return acc;
  }, {});

  // 常勤データの代理店ごとグルーピング
  const groupedRegularWorkers = filteredRegularWorkers.reduce<Record<string, RegularWorker[]>>((acc, worker) => {
    if (!acc[worker.agencyName]) acc[worker.agencyName] = [];
    acc[worker.agencyName].push(worker);
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
    // ダミーデータ内の該当プロジェクトを更新
    const projectIndex = MOCK_PROJECTS.findIndex(p => p.id === updatedProject.id);
    if (projectIndex !== -1) {
      MOCK_PROJECTS[projectIndex] = updatedProject;
    }
    setModalOpen(false);
  };

  // 分割で作成された新案件をプロジェクト一覧に追加
  const handleSplitCreate = (newProjects: Project[]) => {
    // 新しいIDを生成して追加
    const maxId = Math.max(...MOCK_PROJECTS.map(p => p.id));
    const projectsWithNewIds = newProjects.map((project, index) => ({
      ...project,
      id: maxId + index + 1
    }));
    
    MOCK_PROJECTS.push(...projectsWithNewIds);
    
    // 画面を強制的に再描画（実際のアプリでは状態管理ライブラリを使用）
    window.location.reload();
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

  // 編集開始ハンドラ
  const handleStartEdit = (worker: RegularWorker) => {
    setEditingWorkers(prev => new Set(prev).add(worker.id));
    setEditedWorkerData(prev => ({
      ...prev,
      [worker.id]: { ...worker }
    }));
  };

  // 編集キャンセルハンドラ
  const handleCancelEdit = (workerId: number) => {
    setEditingWorkers(prev => {
      const newSet = new Set(prev);
      newSet.delete(workerId);
      return newSet;
    });
    setEditedWorkerData(prev => {
      const newData = { ...prev };
      delete newData[workerId];
      return newData;
    });
  };

  // 編集保存ハンドラ
  const handleSaveEdit = (workerId: number) => {
    const editedWorker = editedWorkerData[workerId];
    if (editedWorker) {
      // バリデーション
      if (!editedWorker.workerName.trim()) {
        alert('氏名を入力してください');
        return;
      }
      if (editedWorker.unitPrice <= 0) {
        alert('単価は0より大きい値を入力してください');
        return;
      }
      if (editedWorker.quantity <= 0) {
        alert('数量は0より大きい値を入力してください');
        return;
      }

      // 合計金額を再計算
      editedWorker.totalAmount = editedWorker.unitPrice * editedWorker.quantity;

      // 実際のアプリではここでAPIを呼び出して更新
      const workerIndex = MOCK_REGULAR_WORKERS.findIndex(w => w.id === workerId);
      if (workerIndex !== -1) {
        MOCK_REGULAR_WORKERS[workerIndex] = editedWorker;
      }

      // 編集モードを終了
      setEditingWorkers(prev => {
        const newSet = new Set(prev);
        newSet.delete(workerId);
        return newSet;
      });
      setEditedWorkerData(prev => {
        const newData = { ...prev };
        delete newData[workerId];
        return newData;
      });
    }
  };

  // 編集中のデータ更新ハンドラ
  const handleEditChange = (workerId: number, field: keyof RegularWorker, value: any) => {
    setEditedWorkerData(prev => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: value,
        // 単価または数量が変更された場合は合計金額も更新
        ...(field === 'unitPrice' || field === 'quantity' ? {
          totalAmount: field === 'unitPrice' ? value * prev[workerId].quantity : prev[workerId].unitPrice * value
        } : {})
      }
    }));
  };

  // 新規追加ダイアログを開く
  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  // 新規追加ダイアログを閉じる
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    // フォームをリセット
    setNewWorkerData({
      agencyName: '株式会社ABC代理店',
      workLocation: '',
      workType: '派遣',
      workerName: '',
      unitPrice: 2000,
      quantity: 160,
      unit: '時間'
    });
  };

  // 新規レコードのフィールド変更
  const handleNewWorkerChange = (field: keyof Omit<RegularWorker, 'id' | 'totalAmount'>, value: any) => {
    setNewWorkerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 新規レコードを追加
  const handleAddWorker = () => {
    // バリデーション
    if (!newWorkerData.workerName.trim()) {
      alert('氏名を入力してください');
      return;
    }
    if (!newWorkerData.workLocation.trim()) {
      alert('稼働場所を入力してください');
      return;
    }
    if (newWorkerData.unitPrice <= 0) {
      alert('単価は0より大きい値を入力してください');
      return;
    }
    if (newWorkerData.quantity <= 0) {
      alert('数量は0より大きい値を入力してください');
      return;
    }

    // 新しいIDを生成
    const maxId = Math.max(...MOCK_REGULAR_WORKERS.map(w => w.id));
    const newWorker: RegularWorker = {
      ...newWorkerData,
      id: maxId + 1,
      totalAmount: newWorkerData.unitPrice * newWorkerData.quantity
    };

    // レコードを追加
    MOCK_REGULAR_WORKERS.push(newWorker);

    // ダイアログを閉じる
    handleAddDialogClose();

    // 画面を再描画（実際のアプリでは状態管理ライブラリを使用）
    window.location.reload();
  };

  // 計算された合計金額
  const calculatedTotal = newWorkerData.unitPrice * newWorkerData.quantity;

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#ffcc80', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">請求書修正中</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 16, height: 16, bgcolor: '#c8e6c9', borderRadius: 1, mr: 0.5 }} /> <Typography variant="caption">請求書修正済</Typography></Box>
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
              <ToggleButton value="multi" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: 0 }}>
                帯案件
              </ToggleButton>
              <ToggleButton value="regular" sx={{ minWidth: 64, fontWeight: 'bold', borderRadius: '0 8px 8px 0' }}>
                常勤
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 4, pl: 3, py: 2, flexWrap: 'wrap' }}>
            {displayMode === 'regular' ? (
              /* 常勤ビューでは派遣人数と業務委託人数を表示 */
              <>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>派遣</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>
                    {filteredRegularWorkers.filter(worker => worker.workType === '派遣').length}名
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>業務委託</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>
                    {filteredRegularWorkers.filter(worker => worker.workType === '業務委託').length}名
                  </Typography>
                </Box>
              </>
            ) : (
              /* 通常・帯案件ビューでは既存のステータス集計 */
              <>
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
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>見積修正中</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'quote_revision').length}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>見積修正済</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'quote_revised').length}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>保留</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'on_hold').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>請求送付前</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_ready').length}</Typography>
            </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>請求書修正中</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_revision').length}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 400 }}>請求書修正済</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_revised').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>請求送付済</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'invoice_sent').length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 400 }}>お断り</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>{filteredProjects.filter(p => p.status === 'rejected').length}</Typography>
            </Box>
              </>
            )}
          </Box>
        </Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          {displayMode === 'regular' ? (
            /* 常勤ビュー：テーブル表示 */
            <Box>
              {/* 新規追加ボタン */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: 0,
                    zIndex: 1,
                    minWidth: 100,
                    height: 36,
                    borderRadius: 1
                  }}
                  onClick={handleAddDialogOpen}
                >
                  新規追加
                </Button>
              </Box>

              {Object.entries(groupedRegularWorkers).map(([agency, workers]) => (
                <Box key={agency} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
                  </Box>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ width: '60px', padding: '8px', minWidth: '60px', maxWidth: '60px' }}></TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '180px', minWidth: '180px', maxWidth: '180px' }}>稼働場所</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '120px', minWidth: '120px', maxWidth: '120px' }}>形態</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '140px', minWidth: '140px', maxWidth: '140px' }}>氏名</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px' }}>単価</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '150px', minWidth: '150px', maxWidth: '150px' }}>数量/単位</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px' }}>合計金額</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workers.map((worker) => {
                          const isEditing = editingWorkers.has(worker.id);
                          const displayWorker = isEditing ? editedWorkerData[worker.id] || worker : worker;
                          
                          return (
                            <TableRow key={worker.id} sx={{ 
                              '&:hover': { bgcolor: '#f9f9f9' },
                              ...(isEditing && { bgcolor: '#f0f8ff' })
                            }}>
                              <TableCell sx={{ textAlign: 'center', width: '60px', minWidth: '60px', maxWidth: '60px', padding: '8px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  {isEditing ? (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton 
                                        size="small"
                                        sx={{
                                          width: '26px',
                                          height: '26px',
                                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                          '&:hover': { 
                                            backgroundColor: 'rgba(76, 175, 80, 0.3)',
                                          }
                                        }}
                                        onClick={() => handleSaveEdit(worker.id)}
                                      >
                                        <CheckIcon fontSize="small" color="success" />
                                      </IconButton>
                                      <IconButton 
                                        size="small"
                                        sx={{
                                          width: '26px',
                                          height: '26px',
                                          backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                          '&:hover': { 
                                            backgroundColor: 'rgba(244, 67, 54, 0.3)',
                                          }
                                        }}
                                        onClick={() => handleCancelEdit(worker.id)}
                                      >
                                        <CancelIcon fontSize="small" color="error" />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <IconButton 
                                      size="small" 
                                      sx={{
                                        width: '28px',
                                        height: '28px',
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        opacity: 0.3,
                                        '&:hover': { 
                                          backgroundColor: 'rgba(25, 118, 210, 0.3)',
                                          opacity: 1,
                                        }
                                      }}
                                      onClick={() => handleStartEdit(worker)}
                                    >
                                      <EditIcon fontSize="small" color="primary" />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: '180px', minWidth: '180px', maxWidth: '180px', padding: '8px 16px' }}>
                                {isEditing ? (
                                  <TextField
                                    value={displayWorker.workLocation}
                                    onChange={(e) => handleEditChange(worker.id, 'workLocation', e.target.value)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      width: '160px',
                                      '& .MuiInputBase-root': {
                                        height: '32px',
                                        fontSize: '0.875rem'
                                      },
                                      '& .MuiOutlinedInput-input': {
                                        padding: '6px 8px'
                                      }
                                    }}
                                  />
                                ) : (
                                  <Typography variant="body2" sx={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    width: '160px'
                                  }}>
                                    {displayWorker.workLocation}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                {isEditing ? (
                                  <FormControl size="small" sx={{ width: '100px' }}>
                                    <Select
                                      value={displayWorker.workType}
                                      onChange={(e) => handleEditChange(worker.id, 'workType', e.target.value)}
                                      sx={{
                                        height: '32px',
                                        fontSize: '0.875rem',
                                        '& .MuiSelect-select': {
                                          padding: '6px 8px'
                                        }
                                      }}
                                    >
                                      <MenuItem value="派遣">派遣</MenuItem>
                                      <MenuItem value="業務委託">業務委託</MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: '12px',
                                      bgcolor: displayWorker.workType === '派遣' ? '#e3f2fd' : '#fff3e0',
                                      color: displayWorker.workType === '派遣' ? '#1565c0' : '#e65100',
                                      fontWeight: 'medium',
                                      display: 'inline-block',
                                      minWidth: '60px',
                                      textAlign: 'center'
                                    }}
                                  >
                                    {displayWorker.workType}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium', width: '140px', minWidth: '140px', maxWidth: '140px', padding: '8px 16px' }}>
                                {isEditing ? (
                                  <TextField
                                    value={displayWorker.workerName}
                                    onChange={(e) => handleEditChange(worker.id, 'workerName', e.target.value)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      width: '120px',
                                      '& .MuiInputBase-root': {
                                        height: '32px',
                                        fontSize: '0.875rem'
                                      },
                                      '& .MuiOutlinedInput-input': {
                                        padding: '6px 8px'
                                      }
                                    }}
                                  />
                                ) : (
                                  <Typography variant="body2" sx={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    width: '120px'
                                  }}>
                                    {displayWorker.workerName}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                {isEditing ? (
                                  <TextField
                                    type="number"
                                    value={displayWorker.unitPrice}
                                    onChange={(e) => handleEditChange(worker.id, 'unitPrice', parseInt(e.target.value) || 0)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      width: '90px',
                                      '& .MuiInputBase-root': {
                                        height: '32px',
                                        fontSize: '0.875rem'
                                      },
                                      '& .MuiOutlinedInput-input': {
                                        padding: '6px 8px',
                                        textAlign: 'right'
                                      }
                                    }}
                                    InputProps={{
                                      startAdornment: '¥'
                                    }}
                                  />
                                ) : (
                                  `¥${displayWorker.unitPrice.toLocaleString()}`
                                )}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', width: '150px', minWidth: '150px', maxWidth: '150px', padding: '8px 16px' }}>
                                {isEditing ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                    <TextField
                                      type="number"
                                      value={displayWorker.quantity}
                                      onChange={(e) => handleEditChange(worker.id, 'quantity', parseInt(e.target.value) || 0)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        width: '65px',
                                        '& .MuiInputBase-root': {
                                          height: '32px',
                                          fontSize: '0.875rem'
                                        },
                                        '& .MuiOutlinedInput-input': {
                                          padding: '6px 8px',
                                          textAlign: 'right'
                                        }
                                      }}
                                    />
                                    <FormControl size="small">
                                      <Select
                                        value={displayWorker.unit}
                                        onChange={(e) => handleEditChange(worker.id, 'unit', e.target.value)}
                                        sx={{ 
                                          width: '65px',
                                          height: '32px',
                                          fontSize: '0.875rem',
                                          '& .MuiSelect-select': {
                                            padding: '6px 8px'
                                          }
                                        }}
                                      >
                                        <MenuItem value="時間">時間</MenuItem>
                                        <MenuItem value="日">日</MenuItem>
                                        <MenuItem value="月">月</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Box>
                                ) : (
                                  `${displayWorker.quantity.toLocaleString()}${displayWorker.unit}`
                                )}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                ¥{displayWorker.totalAmount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* 代理店ごとの合計行 */}
                        <TableRow sx={{ bgcolor: '#f0f0f0', borderTop: '2px solid #ddd' }}>
                          <TableCell sx={{ width: '60px', minWidth: '60px', maxWidth: '60px' }} />
                          <TableCell colSpan={5} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                            {agency} 合計
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                            ¥{workers.reduce((sum, worker) => {
                              const displayWorker = editingWorkers.has(worker.id) 
                                ? editedWorkerData[worker.id] || worker 
                                : worker;
                              return sum + displayWorker.totalAmount;
                            }, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          ) : (
            /* 通常・帯案件ビュー：既存のカード表示 */
            <Box>
          {Object.entries(groupedProjects).map(([agency, projects]) => (
            <Box key={agency} sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
              </Box>
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={project.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3, transform: 'scale(1.02)' },
                        transition: 'all 0.2s ease',
                        height: '100%',
                        width: '100%',
                        minHeight: 280,
                        maxWidth: 'none',
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
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
            </Box>
          )}

          {/* 案件詳細モーダル */}
          <ProjectDetailModal
            open={modalOpen}
            project={selectedProject}
            onClose={handleCloseModal}
            onSave={handleSaveProject}
            onSplitCreate={handleSplitCreate}
          />

          {/* 新規追加ダイアログ */}
          <Dialog
            open={addDialogOpen}
            onClose={handleAddDialogClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>新規常勤レコード追加</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {/* 代理店名 */}
                <FormControl fullWidth>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>代理店名</Typography>
                  <Select
                    value={newWorkerData.agencyName}
                    onChange={(e) => handleNewWorkerChange('agencyName', e.target.value)}
                  >
                    <MenuItem value="株式会社ABC代理店">株式会社ABC代理店</MenuItem>
                    <MenuItem value="DEF広告株式会社">DEF広告株式会社</MenuItem>
                    <MenuItem value="GHIプロモーション">GHIプロモーション</MenuItem>
                    <MenuItem value="JKLマーケティング">JKLマーケティング</MenuItem>
                  </Select>
                </FormControl>

                {/* 稼働場所 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>稼働場所</Typography>
                  <TextField
                    fullWidth
                    value={newWorkerData.workLocation}
                    onChange={(e) => handleNewWorkerChange('workLocation', e.target.value)}
                    placeholder="例: 新宿オフィス"
                  />
                </Box>

                {/* 形態 */}
                <FormControl fullWidth>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>形態</Typography>
                  <Select
                    value={newWorkerData.workType}
                    onChange={(e) => handleNewWorkerChange('workType', e.target.value)}
                  >
                    <MenuItem value="派遣">派遣</MenuItem>
                    <MenuItem value="業務委託">業務委託</MenuItem>
                  </Select>
                </FormControl>

                {/* 氏名 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>氏名</Typography>
                  <TextField
                    fullWidth
                    value={newWorkerData.workerName}
                    onChange={(e) => handleNewWorkerChange('workerName', e.target.value)}
                    placeholder="例: 田中 太郎"
                  />
                </Box>

                {/* 単価 */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>単価</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={newWorkerData.unitPrice}
                    onChange={(e) => handleNewWorkerChange('unitPrice', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: '¥'
                    }}
                  />
                </Box>

                {/* 数量と単位 */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>数量</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={newWorkerData.quantity}
                      onChange={(e) => handleNewWorkerChange('quantity', parseInt(e.target.value) || 0)}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>単位</Typography>
                    <FormControl fullWidth>
                      <Select
                        value={newWorkerData.unit}
                        onChange={(e) => handleNewWorkerChange('unit', e.target.value)}
                      >
                        <MenuItem value="時間">時間</MenuItem>
                        <MenuItem value="日">日</MenuItem>
                        <MenuItem value="月">月</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* 合計金額（自動計算） */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>合計金額</Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    textAlign: 'right'
                  }}>
                    ¥{calculatedTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddDialogClose} color="inherit">
                キャンセル
              </Button>
              <Button onClick={handleAddWorker} variant="contained" color="primary">
                追加
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
} 