'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Card,
  Grid,
  IconButton,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  TextField,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Modal
} from '@mui/material';
import { styled } from '@mui/material/styles';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeekSelector from '@/components/WeekSelector';
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupIcon from '@mui/icons-material/Group';
import RoomIcon from '@mui/icons-material/Room';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ProjectDetailModal, { Project } from '../../../components/accounting/ProjectDetailModal';
import InvoiceSettingList from '../../../components/accounting/InvoiceSettingList';
import InvoicePreviewList from '../../../components/accounting/InvoicePreviewList';
import InvoicePreviewModal from '../../../components/accounting/InvoicePreviewModal';

// ステップ定義
const INVOICE_STEPS = [
  '請求作成',
  '送付先設定',
  'プレビュー',
  '送付'
];

// 請求品目の型定義
interface InvoiceItem {
  id: number;
  eventDate: string; // 開催日付
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  taxType: 'taxable' | 'tax-free'; // 課税 or 非課税
}

// 請求データの型定義
interface Invoice {
  id: number;
  agencyName: string;
  sendTo: string;
  storeAddressSetting: string;
  fileName: string;
  totalAmount: number;
  createdAt: string;
  projectIds: number[];
  mainStoreNames: string[]; // 送付先店舗名（複数）
  coStoreNames: string[]; // 連名店舗名（店舗アドレス）
  items: InvoiceItem[]; // 請求品目
}

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

// ダミー案件データ（案件管理画面と同じデータを使用）
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
    status: 'invoice_ready',
    revenue: 50000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true,
    transportationTaxFree: false
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
    status: 'invoice_sent',
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
    status: 'invoice_ready',
    revenue: 48000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true,
    transportationTaxFree: false
  },
  {
    id: 4,
    agencyName: 'DEF広告株式会社',
    storeName: '春日部店',
    coStores: ['保木間店', '草加店'],
    venue: 'イオンモール春日部',
    eventDate: '2025-01-05',
    unitPrice: 20000,
    days: 2,
    addAmount: 10000,
    subAmount: 5000,
    status: 'invoice_ready',
    revenue: 45000,
    closerCount: 2,
    girlCount: 3,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: true,
    transportationTaxFree: true
  },
  {
    id: 5,
    agencyName: 'DEF広告株式会社',
    storeName: '越谷店',
    coStores: ['春日部店', '草加店'],
    venue: 'イオンレイクタウン',
    eventDate: '2025-01-12',
    unitPrice: 21000,
    days: 3,
    addAmount: 2000,
    subAmount: 1000,
    status: 'invoice_revised',
    revenue: 63000,
    closerCount: 1,
    girlCount: 2,
    freeEntryCount: 2,
    hasPlaceReservation: true,
    isMonthlyPayment: false,
    transportationTaxFree: false
  },
  {
    id: 6,
    agencyName: 'GHIプロモーション',
    storeName: '草加店',
    coStores: ['若葉店', '大宮店'],
    venue: 'ららぽーと新三郷',
    eventDate: '2025-01-10',
    unitPrice: 18000,
    days: 4,
    addAmount: 8000,
    subAmount: 2000,
    status: 'invoice_ready',
    revenue: 78000,
    closerCount: 1,
    girlCount: 1,
    freeEntryCount: 0,
    hasPlaceReservation: true,
    isMonthlyPayment: true,
    transportationTaxFree: true
  },
  {
    id: 7,
    agencyName: 'GHIプロモーション',
    storeName: '八潮店',
    coStores: ['草加店', '大宮店'],
    venue: 'フレスポ八潮',
    eventDate: '2025-01-15',
    unitPrice: 17500,
    days: 2,
    addAmount: 2000,
    subAmount: 500,
    status: 'invoice_revised',
    revenue: 35000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false,
    transportationTaxFree: false
  }
];

// 常勤ダミーデータ（業務委託のみ）
const MOCK_REGULAR_WORKERS: RegularWorker[] = [
  {
    id: 1,
    agencyName: '株式会社ABC代理店',
    workLocation: '新宿オフィス',
    workType: '業務委託',
    workerName: '田中 太郎',
    unitPrice: 25000,
    quantity: 20,
    unit: '日',
    totalAmount: 500000
  },
  {
    id: 2,
    agencyName: '株式会社ABC代理店',
    workLocation: '渋谷オフィス',
    workType: '業務委託',
    workerName: '佐藤 花子',
    unitPrice: 30000,
    quantity: 15,
    unit: '日',
    totalAmount: 450000
  },
  {
    id: 3,
    agencyName: 'DEF広告株式会社',
    workLocation: '池袋オフィス',
    workType: '業務委託',
    workerName: '鈴木 一郎',
    unitPrice: 28000,
    quantity: 18,
    unit: '日',
    totalAmount: 504000
  },
  {
    id: 4,
    agencyName: 'DEF広告株式会社',
    workLocation: '銀座オフィス',
    workType: '業務委託',
    workerName: '山田 美咲',
    unitPrice: 32000,
    quantity: 12,
    unit: '日',
    totalAmount: 384000
  },
  {
    id: 5,
    agencyName: 'GHIプロモーション',
    workLocation: '浦和オフィス',
    workType: '業務委託',
    workerName: '高橋 健太',
    unitPrice: 27000,
    quantity: 16,
    unit: '日',
    totalAmount: 432000
  },
  {
    id: 6,
    agencyName: 'GHIプロモーション',
    workLocation: '大宮オフィス',
    workType: '業務委託',
    workerName: '伊藤 由美',
    unitPrice: 29000,
    quantity: 14,
    unit: '日',
    totalAmount: 406000
  }
];

// 代理店選択ボタン（案件管理と同じスタイル）
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
  invoice_revised: '#e8f5e9', // 請求修正済: 薄緑
  rejected: '#bdbdbd' // お断り: 濃いグレー
};

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['invoice_ready']);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeStep, setActiveStep] = useState(() => {
    const stepParam = searchParams.get('step');
    return stepParam ? parseInt(stepParam, 10) : 1;
  });
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [editingItems, setEditingItems] = useState<{[key: string]: boolean}>({});
  const [editingItemValues, setEditingItemValues] = useState<{[key: string]: string}>({});
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);
  const [invoicePreviewModalOpen, setInvoicePreviewModalOpen] = useState(false);
  const [previewExpandedAccordions, setPreviewExpandedAccordions] = useState<Record<string, boolean>>({});
  const [contactInfo, setContactInfo] = useState({
    to: [{ lastName: '田中', firstName: '太郎', email: 'example@sample.com' }],
    cc: [
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' },
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' },
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' }
    ]
  });
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [isMailEditing, setIsMailEditing] = useState(false);
  const [mailContent, setMailContent] = useState({
    subject: '【請求書送付】',
    body: 'いつもお世話になっております。\n\n下記の件につきまして、請求書をお送りいたします。ご査収のほど、よろしくお願いいたします。\n\n■請求内容\n・送付先店舗: 大宮店\n・請求総額: ¥50,000\n・ファイル名: 請求書_株式会社ABC代理店_2025-01-01.pdf\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n今後ともよろしくお願いいたします。'
  });
  const [isInvoiceInfoEditing, setIsInvoiceInfoEditing] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState({
    fileName: '請求書_株式会社ABC代理店_2025-01-01.pdf',
    paymentDeadline: '2025-05-24',
    items: [
      { 
        date: '2025-03-01', 
        name: 'クローザー人件費', 
        unitPrice: '15000', 
        count: 2, 
        taxType: 'taxable' as 'taxable' | 'tax-free'
      },
      { 
        date: '2025-03-02', 
        name: 'ガール人件費', 
        unitPrice: '12000', 
        count: 1, 
        taxType: 'taxable' as 'taxable' | 'tax-free'
      },
      { 
        date: '2025-03-01', 
        name: '場所取り費用', 
        unitPrice: '5000', 
        count: 1, 
        taxType: 'tax-free' as 'taxable' | 'tax-free'
      }
    ]
  });

  // デバッグ用のuseEffect
  useEffect(() => {
    console.log('Debug - invoices:', invoices);
    console.log('Debug - selectedInvoiceForPreview:', selectedInvoiceForPreview);
    console.log('Debug - activeStep:', activeStep);
  }, [invoices, selectedInvoiceForPreview, activeStep]);

  // 代理店リスト（固定値）
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // 利用可能な店舗リスト（プロジェクトデータから抽出）
  const availableStores = MOCK_PROJECTS.flatMap(project => [project.storeName, ...project.coStores])
    .filter((store, index, arr) => arr.indexOf(store) === index)
    .sort();

  // 代理店ごとにグループ化（useMemoを使用）
  const groupedInvoices = useMemo(() => {
    return invoices.reduce<Record<string, Invoice[]>>((acc, invoice) => {
      if (!acc[invoice.agencyName]) acc[invoice.agencyName] = [];
      acc[invoice.agencyName].push(invoice);
      return acc;
    }, {});
  }, [invoices]);

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
  
  // ステータス変更ハンドラ
  const handleStatusChange = (status: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStatus([...selectedStatus, status]);
    } else {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    }
  };

  // フィルター適用済みプロジェクト
  const filteredProjects = MOCK_PROJECTS.filter(project => {
    // ステータスフィルター
    if (selectedStatus.length > 0 && !selectedStatus.includes(project.status)) {
      return false;
    }
    // 代理店フィルター
    if (!selectedAgencies.includes('all') && !selectedAgencies.includes(project.agencyName)) {
      return false;
    }
    return true;
  });

  // フィルター適用済み常勤データ（業務委託のみ）
  const filteredRegularWorkers = MOCK_REGULAR_WORKERS.filter(worker => {
    // 業務委託のみ
    if (worker.workType !== '業務委託') {
      return false;
    }
    // 代理店フィルター
    if (!selectedAgencies.includes('all') && !selectedAgencies.includes(worker.agencyName)) {
      return false;
    }
    return true;
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

  // 月払い選択時の店舗ごとのグルーピング
  const groupedProjectsByStore = useMemo(() => {
    if (selectedWeek !== 'monthly') return {};
    
    return filteredProjects.reduce<Record<string, Record<string, Project[]>>>((acc, project) => {
      if (!acc[project.agencyName]) acc[project.agencyName] = {};
      if (!acc[project.agencyName][project.storeName]) acc[project.agencyName][project.storeName] = [];
      acc[project.agencyName][project.storeName].push(project);
      return acc;
    }, {});
  }, [filteredProjects, selectedWeek]);

  // カードをクリックした時の処理（選択状態の切り替え）
  const handleCardClick = (projectId: number) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        // 既に選択されている場合は選択解除
        return prev.filter(id => id !== projectId);
      } else {
        // 選択されていない場合は選択追加
        return [...prev, projectId];
      }
    });
  };

  // 編集ボタンクリック処理
  const handleEditClick = (event: React.MouseEvent, project: Project) => {
    event.stopPropagation(); // タイル選択を防ぐ
    setSelectedProject(project);
    setModalOpen(true);
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  // プロジェクト保存処理
  const handleSaveProject = (updatedProject: Project) => {
    // 実際のアプリではここでAPIを呼び出して更新処理を行う
    setModalOpen(false);
  };

  // 全案件選択ハンドラー
  const handleSelectAll = () => {
    if (selectedWeek === 'fulltime') {
      const allWorkerIds = filteredRegularWorkers.map(worker => worker.id);
      setSelectedWorkers(allWorkerIds);
    } else {
      const allProjectIds = filteredProjects.map(project => project.id);
      setSelectedProjects(allProjectIds);
    }
  };

  // 全案件選択解除ハンドラー
  const handleDeselectAll = () => {
    if (selectedWeek === 'fulltime') {
      setSelectedWorkers([]);
    } else {
      setSelectedProjects([]);
    }
  };

  // 代理店別選択ハンドラー
  const handleSelectByAgency = (agencyProjects: Project[]) => {
    const agencyProjectIds = agencyProjects.map(project => project.id);
    setSelectedProjects(prev => {
      // 既存の選択から現在の代理店以外を残し、この代理店の全案件を追加
      const otherAgencyIds = prev.filter(id => !agencyProjectIds.includes(id));
      return [...otherAgencyIds, ...agencyProjectIds];
    });
  };

  // 代理店別選択解除ハンドラー
  const handleDeselectByAgency = (agencyProjects: Project[]) => {
    const agencyProjectIds = agencyProjects.map(project => project.id);
    setSelectedProjects(prev => prev.filter(id => !agencyProjectIds.includes(id)));
  };

  // 店舗別選択ハンドラー
  const handleSelectByStore = (storeProjects: Project[]) => {
    const storeProjectIds = storeProjects.map(project => project.id);
    setSelectedProjects(prev => {
      // 既存の選択から現在の店舗以外を残し、この店舗の全案件を追加
      const otherStoreIds = prev.filter(id => !storeProjectIds.includes(id));
      return [...otherStoreIds, ...storeProjectIds];
    });
  };

  // 店舗別選択解除ハンドラー
  const handleDeselectByStore = (storeProjects: Project[]) => {
    const storeProjectIds = storeProjects.map(project => project.id);
    setSelectedProjects(prev => prev.filter(id => !storeProjectIds.includes(id)));
  };

  // 常勤ワーワー行クリックハンドラー
  const handleWorkerRowClick = (workerId: number) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  // 常勤ワーワーの代理店別選択ハンドラー
  const handleSelectWorkersByAgency = (agencyWorkers: RegularWorker[]) => {
    const agencyWorkerIds = agencyWorkers.map(worker => worker.id);
    setSelectedWorkers(prev => {
      const otherAgencyIds = prev.filter(id => !agencyWorkerIds.includes(id));
      return [...otherAgencyIds, ...agencyWorkerIds];
    });
  };

  // 常勤ワーワーの代理店別選択解除ハンドラー
  const handleDeselectWorkersByAgency = (agencyWorkers: RegularWorker[]) => {
    const agencyWorkerIds = agencyWorkers.map(worker => worker.id);
    setSelectedWorkers(prev => prev.filter(id => !agencyWorkerIds.includes(id)));
  };

  // 請求作成ハンドラー
  const handleCreateInvoice = () => {
    if (selectedProjects.length === 0) return;
    
    const selectedProjectsData = filteredProjects.filter(project => 
      selectedProjects.includes(project.id)
    );
    
    // 代理店ごとに請求を作成
    const agencyGroups = selectedProjectsData.reduce<Record<string, Project[]>>((acc, project) => {
      if (!acc[project.agencyName]) acc[project.agencyName] = [];
      acc[project.agencyName].push(project);
      return acc;
    }, {});

    const newInvoices: Invoice[] = [];
    
    Object.entries(agencyGroups).forEach(([agencyName, projects]) => {
      const totalAmount = projects.reduce((sum, project) => sum + project.revenue, 0);
      const currentDate = new Date().toISOString().split('T')[0];
      const invoiceId = Date.now() + Math.random();
      
      // 品目データを作成
      const items: InvoiceItem[] = [
        {
          id: 1,
          eventDate: projects[0]?.eventDate || currentDate,
          itemName: `クローザー人件費`,
          unitPrice: 15000,
          quantity: projects.reduce((sum, p) => sum + p.closerCount, 0),
          amount: projects.reduce((sum, p) => sum + (p.closerCount * 15000), 0),
          taxType: 'taxable' as 'taxable'
        },
        {
          id: 2,
          eventDate: projects[0]?.eventDate || currentDate,
          itemName: `ガール人件費`,
          unitPrice: 12000,
          quantity: projects.reduce((sum, p) => sum + p.girlCount, 0),
          amount: projects.reduce((sum, p) => sum + (p.girlCount * 12000), 0),
          taxType: 'taxable' as 'taxable'
        },
        {
          id: 3,
          eventDate: projects[0]?.eventDate || currentDate,
          itemName: `場所取り費用`,
          unitPrice: 5000,
          quantity: projects.filter(p => p.hasPlaceReservation).length,
          amount: projects.filter(p => p.hasPlaceReservation).length * 5000,
          taxType: 'tax-free' as 'tax-free'
        }
      ].filter(item => item.quantity > 0); // 数量が0でない項目のみ
      
      // 税込み総額を計算
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxableAmount = items.filter(item => item.taxType === 'taxable').reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = Math.floor(taxableAmount * 0.1);
      const totalAmountWithTax = subtotal + taxAmount;
      
      const invoice: Invoice = {
        id: invoiceId,
        agencyName: agencyName,
        sendTo: `${agencyName.replace('株式会社', '').replace('プロモーション', '')}@example.com`,
        storeAddressSetting: '本店住所',
        fileName: `請求書_${agencyName}_${currentDate}.pdf`,
        totalAmount: totalAmountWithTax,
        createdAt: new Date().toLocaleString('ja-JP'),
        projectIds: projects.map(p => p.id),
        mainStoreNames: projects.map(p => p.storeName).filter((store, index, arr) => arr.indexOf(store) === index),
        coStoreNames: projects.flatMap(p => p.coStores).filter((store, index, arr) => arr.indexOf(store) === index),
        items: items
      };
      
      newInvoices.push(invoice);
    });

    setInvoices(prev => [...newInvoices, ...prev]);
    setSelectedProjects([]); // 選択をクリア
    setActiveStep(2); // ステップを「送付先設定」に進める
    
    console.log('作成された請求:', newInvoices);
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

  // 請求削除ハンドラー
  const handleDeleteInvoice = (invoiceId: number) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
  };

  // プレビューハンドラー
  const handlePreview = (invoice: Invoice) => {
    setSelectedInvoiceForPreview(invoice);
    setActiveStep(3);
  };

  // 送付ハンドラー
  const handleSend = () => {
    if (selectedInvoiceForPreview) {
      alert(`「${selectedInvoiceForPreview.fileName}」を送付しました。`);
      setActiveStep(4);
    }
  };

  // ステッククリックハンドラー
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === 0) {
      setActiveStep(1);
    } else if (stepIndex === 1 && invoices.length > 0) {
      setActiveStep(2);
    } else if (stepIndex === 2 && selectedInvoiceForPreview) {
      setActiveStep(3);
    } else if (stepIndex === 3 && selectedInvoiceForPreview) {
      setActiveStep(4);
    }
  };

  // 戻るボタンハンドラー
  const handleGoBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // アコーディオン変更ハンドラー
  const handleAccordionChange = (invoiceId: number | string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedInvoices(prev => {
      if (isExpanded) {
        return { ...prev, [invoiceId.toString()]: true };
      } else {
        return { ...prev, [invoiceId.toString()]: false };
      }
    });
  };

  // 品目編集開始ハンドラー
  const handleItemEditStart = (invoiceId: number, itemId: number, currentName: string) => {
    const key = `${invoiceId}-${itemId}`;
    setEditingItems(prev => ({ ...prev, [key]: true }));
    setEditingItemValues(prev => ({ ...prev, [key]: currentName }));
  };

  // 品目編集キャンセルハンドラー
  const handleItemEditCancel = (invoiceId: number, itemId: number) => {
    const key = `${invoiceId}-${itemId}`;
    setEditingItems(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setEditingItemValues(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  // 品目編集保存ハンドラー
  const handleItemEditSave = (invoiceId: number, itemId: number) => {
    const key = `${invoiceId}-${itemId}`;
    const newName = editingItemValues[key];
    
    if (newName) {
      setInvoices(prev => prev.map(invoice => {
        if (invoice.id === invoiceId) {
          return {
            ...invoice,
            items: invoice.items.map(item => 
              item.id === itemId ? { ...item, itemName: newName } : item
            )
          };
        }
        return invoice;
      }));
    }
    
    setEditingItems(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;        
    });
    setEditingItemValues(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  // 品目名変更ハンドラー
  const handleItemNameChange = (invoiceId: number, itemId: number, value: string) => {
    const key = `${invoiceId}-${itemId}`;
    setEditingItemValues(prev => ({ ...prev, [key]: value }));
  };

  // メイン店舗変更ハンドラー
  const handleMainStoreChange = (invoiceId: number, newStores: string[]) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, mainStoreNames: newStores }
        : invoice
    ));
  };

  // 連名店舗変更ハンドラー
  const handleCoStoreChange = (invoiceId: number, newStores: string[]) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, coStoreNames: newStores }
        : invoice
    ));
  };

  // プレビュー請求書選択ハンドラー
  const handlePreviewInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoiceForPreview(invoice);
  };

  // プレビューアコーディオン切り替えハンドラー
  const handlePreviewAccordionToggle = (key: string) => {
    setPreviewExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 総額計算
  const calculateTotalAmount = () => {
    return invoiceInfo.items.reduce((total, item) => {
      const amount = parseInt(item.unitPrice) * item.count;
      if (item.taxType === 'taxable') {
        return total + amount * 1.1; // 10%税込み
      } else {
        return total + amount; // 非課税
      }
    }, 0);
  };

  // 送付先メールアドレス変更ハンドラー
  const handleSendToChange = (invoiceId: number, value: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, sendTo: value } : inv
    ));
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
              activeStep={activeStep - 1}
              connector={<CustomStepConnector />}
            >
              {INVOICE_STEPS.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      cursor: (
                        index === 0 || 
                        (index === 1 && invoices.length > 0) ||
                        (index === 2 && selectedInvoiceForPreview) ||
                        (index === 3 && selectedInvoiceForPreview)
                      ) ? 'pointer' : 'default'
                    }}
                    onClick={() => handleStepClick(index)}
                  >
                    {label}
                  </StepLabel>
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
                  showMonthlyPayment={true}
                  showFullTimeEmployee={true}
                />
              </Box>
            </Box>
            
            {/* 右側：ステータス選択と代理店選択 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              {/* ステータス選択チェックボックス */}
              <FormGroup 
                row 
                sx={{ 
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  mb: 0
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatus.includes('invoice_ready')}
                      onChange={handleStatusChange('invoice_ready')}
                      size="small"
                      sx={{
                        color: '#1976d2',
                        '&.Mui-checked': {
                          color: '#1976d2',
                        },
                      }}
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
                      sx={{
                        color: '#2e7d32',
                        '&.Mui-checked': {
                          color: '#2e7d32',
                        },
                      }}
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>請求修正済</Typography>}
                />
              </FormGroup>
              
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
        </Box>

        {/* 案件一覧表示 */}
        {activeStep === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
            {/* 全体選択ボタンと請求作成ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  disabled={selectedWeek === 'fulltime' ? filteredRegularWorkers.length === 0 : filteredProjects.length === 0}
                >
                  すべて選択
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleDeselectAll}
                  disabled={selectedWeek === 'fulltime' ? selectedWorkers.length === 0 : selectedProjects.length === 0}
                >
                  すべて解除
                </Button>
                {(selectedProjects.length > 0 || selectedWorkers.length > 0) && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedWeek === 'fulltime' ? `${selectedWorkers.length}名` : `${selectedProjects.length}件`}選択中
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  component="a"
                  href="/accounting/invoices/custom"
                  sx={{ 
                    color: '#1976d2',
                    textDecoration: 'underline',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  フリー請求作成
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateInvoice}
                  disabled={selectedWeek === 'fulltime' ? selectedWorkers.length === 0 : selectedProjects.length === 0}
                  sx={{ 
                    minWidth: '160px',
                    height: '48px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  請求作成
                </Button>
              </Box>
            </Box>
            
            {/* 代理店ごとにグループ化して表示 */}
            {selectedWeek === 'fulltime' ? (
              // 常勤選択時：テーブル表示
              <Box>
                {Object.entries(groupedRegularWorkers).map(([agency, workers]) => (
                  <Box key={agency} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleSelectWorkersByAgency(workers)}
                          sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                        >
                          すべて選択
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleDeselectWorkersByAgency(workers)}
                          sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                        >
                          すべて解除
                        </Button>
                      </Box>
                    </Box>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold', width: '180px', minWidth: '180px', maxWidth: '180px' }}>稼働場所</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '120px', minWidth: '120px', maxWidth: '120px' }}>形態</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '140px', minWidth: '140px', maxWidth: '140px' }}>氏名</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px' }}>単価</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '150px', minWidth: '150px', maxWidth: '150px' }}>数量/単位</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px' }}>合計金額</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {workers.map((worker) => (
                            <TableRow
                              key={worker.id}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f9f9f9' },
                                ...(selectedWorkers.includes(worker.id) && { bgcolor: '#e3f2fd' })
                              }}
                              onClick={() => handleWorkerRowClick(worker.id)}
                            >
                              <TableCell sx={{ width: '180px', minWidth: '180px', maxWidth: '180px', padding: '8px 16px' }}>
                                <Typography variant="body2" sx={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  width: '160px'
                                }}>
                                  {worker.workLocation}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    bgcolor: '#fff3e0',
                                    color: '#e65100',
                                    fontWeight: 'medium',
                                    display: 'inline-block',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                  }}
                                >
                                  {worker.workType}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium', width: '140px', minWidth: '140px', maxWidth: '140px', padding: '8px 16px' }}>
                                <Typography variant="body2" sx={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  width: '120px'
                                }}>
                                  {worker.workerName}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                ¥{worker.unitPrice.toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', width: '150px', minWidth: '150px', maxWidth: '150px', padding: '8px 16px' }}>
                                {worker.quantity.toLocaleString()}{worker.unit}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px 16px' }}>
                                ¥{worker.totalAmount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* 代理店ごとの合計行 */}
                          <TableRow sx={{ bgcolor: '#f0f0f0', borderTop: '2px solid #ddd' }}>
                            <TableCell colSpan={5} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                              {agency} 合計
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem', width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                              ¥{workers.reduce((sum, worker) => sum + worker.totalAmount, 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
                
                {filteredRegularWorkers.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      選択した条件に該当する常勤スタッフがありません
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : selectedWeek === 'monthly' ? (
              // 月払い選択時：代理店 > 店舗 > 案件の階層表示
              Object.entries(groupedProjectsByStore).map(([agency, storeGroups]) => (
                <Box key={agency} sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          const allAgencyProjects = Object.values(storeGroups).flat();
                          handleSelectByAgency(allAgencyProjects);
                        }}
                        sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        すべて選択
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          const allAgencyProjects = Object.values(storeGroups).flat();
                          handleDeselectByAgency(allAgencyProjects);
                        }}
                        sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        すべて解除
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* 店舗ごとの小セクション */}
                  {Object.entries(storeGroups).map(([storeName, storeProjects]) => (
                    <Box key={`${agency}-${storeName}`} sx={{ mb: 3, ml: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.7
                            }
                          }}
                          onClick={() => {
                            const storeProjectIds = storeProjects.map(p => p.id);
                            const allSelected = storeProjectIds.every(id => selectedProjects.includes(id));
                            if (allSelected) {
                              handleDeselectByStore(storeProjects);
                            } else {
                              handleSelectByStore(storeProjects);
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 'medium', 
                            color: '#666',
                            fontSize: '0.9rem',
                            pl: 1,
                            borderLeft: '2px solid #e0e0e0',
                            userSelect: 'none'
                          }}>
                            {storeName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleSelectByStore(storeProjects)}
                            sx={{ 
                              fontSize: '0.7rem', 
                              minWidth: 'auto', 
                              px: 1, 
                              color: '#888',
                              '&:hover': {
                                color: '#666',
                                backgroundColor: 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            選択
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleDeselectByStore(storeProjects)}
                            sx={{ 
                              fontSize: '0.7rem', 
                              minWidth: 'auto', 
                              px: 1, 
                              color: '#888',
                              '&:hover': {
                                color: '#666',
                                backgroundColor: 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            解除
                          </Button>
                        </Box>
                      </Box>
                      <Grid container spacing={3}>
                        {storeProjects.map((project) => (
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
                                overflow: 'visible',
                                border: selectedProjects.includes(project.id) ? '3px solid #1976d2' : '1px solid #e0e0e0',
                                boxShadow: selectedProjects.includes(project.id) ? 2 : 1
                              }}
                              onClick={() => handleCardClick(project.id)}
                              role="button"
                              tabIndex={0}
                              aria-label={`${formatDate(project.eventDate)} ${project.storeName} ${project.venue} クローザー${project.closerCount}名 ガール${project.girlCount}名 無料入店${project.freeEntryCount}名 ${project.hasPlaceReservation ? '場所取りあり' : ''}`}
                            >
                              {/* カード全体のコンテナ */}
                              <Box sx={{ p: 3 }}>
                                {/* 編集ボタン（左上） */}
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    zIndex: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 1)',
                                    },
                                  }}
                                  onClick={(e) => handleEditClick(e, project)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>

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
                                  {project.coStores.map((store: string, index: number) => (
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
                                        fontWeight: 'medium'
                                      }}
                                    >
                                      {store}
                                    </Typography>
                                  ))}
                                </Box>
                                {/* 開催日 */}
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.95rem', display: 'block', mb: 0.8 }}>
                                  {formatDate(project.eventDate)}
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
                </Box>
              ))
            ) : (
              // 通常表示：代理店 > 案件の階層表示
              Object.entries(groupedProjects).map(([agency, projects]) => (
                <Box key={agency} sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 4, height: 28, bgcolor: '#17424d', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{agency}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleSelectByAgency(projects)}
                        sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        すべて選択
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleDeselectByAgency(projects)}
                        sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        すべて解除
                      </Button>
                    </Box>
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
                            overflow: 'visible',
                            border: selectedProjects.includes(project.id) ? '3px solid #1976d2' : '1px solid #e0e0e0',
                            boxShadow: selectedProjects.includes(project.id) ? 2 : 1
                          }}
                          onClick={() => handleCardClick(project.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${formatDate(project.eventDate)} ${project.storeName} ${project.venue} クローザー${project.closerCount}名 ガール${project.girlCount}名 無料入店${project.freeEntryCount}名 ${project.hasPlaceReservation ? '場所取りあり' : ''}`}
                        >
                          {/* カード全体のコンテナ */}
                          <Box sx={{ p: 3 }}>
                            {/* 編集ボタン（左上） */}
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                zIndex: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 1)',
                                },
                              }}
                              onClick={(e) => handleEditClick(e, project)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

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
                              {project.coStores.map((store: string, index: number) => (
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
                                    fontWeight: 'medium'
                                  }}
                                >
                                  {store}
                                </Typography>
                              ))}
                            </Box>
                            {/* 開催日 */}
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.95rem', display: 'block', mb: 0.8 }}>
                              {formatDate(project.eventDate)}
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
              ))
            )}

            {filteredProjects.length === 0 && selectedWeek !== 'fulltime' && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  選択した条件に該当する案件がありません
                </Typography>
              </Box>
            )}
        </Paper>
        )}

        {/* 案件詳細Drawer */}
        <ProjectDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
          onSave={handleSaveProject}
        />

        {/* ステップ2: 送付先設定 */}
        {invoices.length > 0 && activeStep === 2 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <IconButton
                onClick={handleGoBack}
                sx={{ 
                  p: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if (invoices.length > 0) {
                    // 最初の請求書をプレビュー対象として設定
                    handlePreview(invoices[0]);
                  }
                }}
                disabled={invoices.length === 0}
                sx={{ 
                  minWidth: '160px',
                  height: '48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                プレビュー
              </Button>
            </Box>
            
            <InvoiceSettingList
              invoices={invoices}
              availableStores={availableStores}
              expandedAccordions={expandedInvoices}
              editingItems={editingItems}
              editingItemValues={editingItemValues}
              onAccordionChange={handleAccordionChange}
              onDeleteInvoice={handleDeleteInvoice}
              onMainStoreChange={handleMainStoreChange}
              onCoStoreChange={handleCoStoreChange}
              onItemEditStart={handleItemEditStart}
              onItemEditCancel={handleItemEditCancel}
              onItemEditSave={handleItemEditSave}
              onItemNameChange={handleItemNameChange}
            />
          </Paper>
        )}

        {/* ステップ3: プレビュー */}
        {activeStep === 3 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* 上部：戻るボタンと送付ボタン */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <IconButton
                onClick={handleGoBack}
                sx={{
                  p: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Button
                variant="contained"
                size="large"
                onClick={handleSend}
                sx={{
                  minWidth: '160px',
                  height: '48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                送付
              </Button>
            </Box>

            {/* メインコンテンツエリア */}
            <Box sx={{ display: 'flex', gap: 3, height: '1450px' }}>
              {/* 左側：請求書リスト */}
              <Box sx={{ width: '300px', p: 2, overflow: 'auto' }}>
                <InvoicePreviewList
                  invoices={invoices}
                  selectedInvoice={selectedInvoiceForPreview}
                  expandedAccordions={previewExpandedAccordions}
                  onInvoiceSelect={handlePreviewInvoiceSelect}
                  onAccordionToggle={handlePreviewAccordionToggle}
                />
              </Box>

              {/* 右側：プレビューエリア */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* メールプレビュー */}
                <Box sx={{ height: '400px' }}>
                  <Box sx={{ display: 'flex', gap: 3, height: '400px' }}>
                    {/* 連絡先情報 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, overflow: 'auto', backgroundColor: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          連絡先
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setIsContactEditing(!isContactEditing)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* To セクション */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>To</Typography>
                        {contactInfo.to.map((contact, index) => (
                          <Box key={`to-${index}`} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            {isContactEditing ? (
                              <>
                                <TextField
                                  size="small"
                                  value={contact.lastName}
                                  onChange={(e) => {
                                    const newTo = [...contactInfo.to];
                                    newTo[index].lastName = e.target.value;
                                    setContactInfo(prev => ({ ...prev, to: newTo }));
                                  }}
                                  sx={{ width: '80px' }}
                                  placeholder="田中"
                                />
                                <TextField
                                  size="small"
                                  value={contact.firstName}
                                  onChange={(e) => {
                                    const newTo = [...contactInfo.to];
                                    newTo[index].firstName = e.target.value;
                                    setContactInfo(prev => ({ ...prev, to: newTo }));
                                  }}
                                  sx={{ width: '80px' }}
                                  placeholder="太郎"
                                />
                                <TextField
                                  size="small"
                                  value={contact.email}
                                  onChange={(e) => {
                                    const newTo = [...contactInfo.to];
                                    newTo[index].email = e.target.value;
                                    setContactInfo(prev => ({ ...prev, to: newTo }));
                                  }}
                                  sx={{ flex: 1 }}
                                  placeholder="example@sample.com"
                                />
                                {contactInfo.to.length > 1 && (
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const newTo = contactInfo.to.filter((_, i) => i !== index);
                                      setContactInfo(prev => ({ ...prev, to: newTo }));
                                    }}
                                    sx={{ p: 0.5 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </>
                            ) : (
                              <>
                                <Box sx={{ 
                                  width: '80px', 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  {contact.lastName}
                                </Box>
                                <Box sx={{ 
                                  width: '80px', 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  {contact.firstName}
                                </Box>
                                <Box sx={{ 
                                  flex: 1, 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem'
                                }}>
                                  {contact.email}
                                </Box>
                              </>
                            )}
                          </Box>
                        ))}
                        {isContactEditing && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setContactInfo(prev => ({
                                ...prev,
                                to: [...prev.to, { lastName: '', firstName: '', email: '' }]
                              }));
                            }}
                            sx={{ mt: 1, fontSize: '0.75rem' }}
                          >
                            + To追加
                          </Button>
                        )}
                      </Box>

                      {/* Cc セクション */}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Cc</Typography>
                        {contactInfo.cc.map((contact, index) => (
                          <Box key={`cc-${index}`} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            {isContactEditing ? (
                              <>
                                <TextField
                                  size="small"
                                  value={contact.lastName}
                                  onChange={(e) => {
                                    const newCc = [...contactInfo.cc];
                                    newCc[index].lastName = e.target.value;
                                    setContactInfo(prev => ({ ...prev, cc: newCc }));
                                  }}
                                  sx={{ width: '80px' }}
                                  placeholder="田中"
                                />
                                <TextField
                                  size="small"
                                  value={contact.firstName}
                                  onChange={(e) => {
                                    const newCc = [...contactInfo.cc];
                                    newCc[index].firstName = e.target.value;
                                    setContactInfo(prev => ({ ...prev, cc: newCc }));
                                  }}
                                  sx={{ width: '80px' }}
                                  placeholder="太郎"
                                />
                                <TextField
                                  size="small"
                                  value={contact.email}
                                  onChange={(e) => {
                                    const newCc = [...contactInfo.cc];
                                    newCc[index].email = e.target.value;
                                    setContactInfo(prev => ({ ...prev, cc: newCc }));
                                  }}
                                  sx={{ flex: 1 }}
                                  placeholder="example@sample.com"
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newCc = contactInfo.cc.filter((_, i) => i !== index);
                                    setContactInfo(prev => ({ ...prev, cc: newCc }));
                                  }}
                                  sx={{ p: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <Box sx={{ 
                                  width: '80px', 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  {contact.lastName}
                                </Box>
                                <Box sx={{ 
                                  width: '80px', 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  {contact.firstName}
                                </Box>
                                <Box sx={{ 
                                  flex: 1, 
                                  p: 0.5, 
                                  border: '1px solid #e0e0e0', 
                                  borderRadius: 1, 
                                  backgroundColor: '#fff',
                                  fontSize: '0.875rem'
                                }}>
                                  {contact.email}
                                </Box>
                              </>
                            )}
                          </Box>
                        ))}
                        {isContactEditing && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setContactInfo(prev => ({
                                ...prev,
                                cc: [...prev.cc, { lastName: '', firstName: '', email: '' }]
                              }));
                            }}
                            sx={{ mt: 1, fontSize: '0.75rem' }}
                          >
                            + Cc追加
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* メール本文 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, overflow: 'auto', backgroundColor: '#fff' }}>
                      {/* メール件名 */}
                      <Box sx={{ mb: 2, position: 'relative' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>メール件名</Typography>
                          <IconButton
                            size="small"
                            onClick={() => setIsMailEditing(!isMailEditing)}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        {isMailEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={mailContent.subject}
                            onChange={(e) => setMailContent(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="件名を入力してください"
                          />
                        ) : (
                          <Typography variant="body2" sx={{ 
                            p: 1, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            backgroundColor: '#fff',
                            fontSize: '0.875rem'
                          }}>
                            {mailContent.subject}
                          </Typography>
                        )}
                      </Box>

                      {/* メール本文 */}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>本文</Typography>
                        {isMailEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={8}
                            size="small"
                            value={mailContent.body}
                            onChange={(e) => setMailContent(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="本文を入力してください"
                          />
                        ) : (
                          <Box sx={{ 
                            p: 1, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            backgroundColor: '#fff',
                            minHeight: '200px',
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-line'
                          }}>
                            {mailContent.body}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* 請求書プレビュー */}
                <Box sx={{ height: '1000px' }}>
                  <Box sx={{ display: 'flex', gap: 3, height: '1000px' }}>
                    {/* 請求書 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, backgroundColor: '#fff' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        請求書プレビュー
                      </Typography>
                      {selectedInvoiceForPreview ? (
                        <Box 
                          sx={{
                            height: 'calc(100% - 40px)', 
                            backgroundColor: '#fff', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: 1,
                            position: 'relative',
                            backgroundImage: `linear-gradient(45deg, #f5f5f5 25%, transparent 25%), 
                                            linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), 
                                            linear-gradient(45deg, transparent 75%, #f5f5f5 75%), 
                                            linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)`,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                            '&:hover': {
                              backgroundColor: '#f9f9f9'
                            }
                          }}
                          onClick={() => setInvoicePreviewModalOpen(true)}
                        >
                          {/* 請求書のイメージ */}
                          <Box sx={{ 
                            width: '50%', 
                            height: '85%', 
                            backgroundColor: '#fff',
                            border: '2px solid #ddd',
                            borderRadius: 1,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            p: 1.5,
                            position: 'relative',
                            aspectRatio: '210/297' // A4の比率
                          }}>
                            {/* ヘッダー部分 */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              {/* 左側：会社ロゴエリア */}
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd100, #8bc34a, #2196f3, #9c27b0)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1
                                }}>
                                  <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                    LOGO
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {/* 右側：日付と請求書タイトル */}
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                  2025/04/24
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', borderBottom: '3px solid #d32f2f', pb: 0.5 }}>
                                  請求書
                                </Typography>
                                <Box sx={{ 
                                  border: '2px solid #d32f2f', 
                                  width: 60, 
                                  height: 60, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mt: 1,
                                  ml: 'auto'
                                }}>
                                  <Typography sx={{ fontSize: '0.6rem', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>
                                    印鑑<br/>エリア
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            {/* 会社情報 */}
                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block' }}>
                                株式会社ANSTYPE
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block' }}>
                                〒334-0067 埼玉県春日部市中央1丁目2-7F
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', display: 'block' }}>
                                代表 荒川昭美
                              </Typography>
                            </Box>
                            
                            {/* 宛先 */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {selectedInvoiceForPreview.agencyName} 御中
                              </Typography>
                            </Box>
                            
                            {/* 合計金額ボックス */}
                            <Box sx={{ 
                              border: '2px solid #d32f2f', 
                              p: 1, 
                              mb: 2, 
                              backgroundColor: '#ffebee',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                合計金額<br/>（税込金額）
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                {selectedInvoiceForPreview.totalAmount.toLocaleString()}
                              </Typography>
                            </Box>
                            
                            {/* 請求番号 */}
                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                請求番号：T80300011358591
                              </Typography>
                            </Box>
                            
                            {/* 明細テーブル */}
                            <Box sx={{ flex: 1, mb: 2 }}>
                              {/* テーブルヘッダー */}
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '80px 1fr 60px 40px 80px',
                                backgroundColor: '#d32f2f',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                p: 0.5
                              }}>
                                <Box>納期予定日</Box>
                                <Box>品目名</Box>
                                <Box>単価(円)</Box>
                                <Box>数(回)</Box>
                                <Box>金額(円)</Box>
                              </Box>
                              
                              {/* テーブル行 */}
                              {selectedInvoiceForPreview.items.slice(0, 2).map((item, index) => (
                                <Box key={index} sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '80px 1fr 60px 40px 80px',
                                  backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fff',
                                  fontSize: '0.6rem',
                                  p: 0.5,
                                  borderBottom: '1px solid #ddd'
                                }}>
                                  <Box>3/1,3/2</Box>
                                  <Box>{item.itemName}</Box>
                                  <Box>{item.unitPrice.toLocaleString()}</Box>
                                  <Box>{item.quantity}</Box>
                                  <Box>{item.amount.toLocaleString()}</Box>
                                </Box>
                              ))}
                              
                              {/* 空行 */}
                              {Array.from({ length: 8 }).map((_, index) => (
                                <Box key={`empty-${index}`} sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '80px 1fr 60px 40px 80px',
                                  backgroundColor: (index + 2) % 2 === 0 ? '#f5f5f5' : '#fff',
                                  fontSize: '0.6rem',
                                  p: 0.5,
                                  borderBottom: '1px solid #ddd',
                                  minHeight: '20px'
                                }}>
                                  <Box></Box>
                                  <Box></Box>
                                  <Box></Box>
                                  <Box></Box>
                                  <Box>0</Box>
                                </Box>
                              ))}
                            </Box>
                            
                            {/* フッター計算部分 */}
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 100px 80px',
                              gap: 0.5,
                              fontSize: '0.7rem',
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              p: 0.5
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '0.6rem' }}>
                                  振込期日: 2025年04月末日　課税小計 (10%対象)　120,000
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.6rem' }}>非課税</Typography>
                                <Typography sx={{ fontSize: '0.6rem' }}>消費税</Typography>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>合計</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: '0.6rem' }}>0</Typography>
                                <Typography sx={{ fontSize: '0.6rem' }}>12,000</Typography>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>132,000</Typography>
                              </Box>
                            </Box>
                            
                            {/* 最下部情報 */}
                            <Box sx={{ mt: 1, fontSize: '0.6rem', color: '#666' }}>
                              <Typography sx={{ fontSize: '0.6rem' }}>
                                埼玉りそな銀行 春日部支店 普通4338463
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* クリック案内（請求書の外に配置） */}
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: 30, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                              クリックで拡大表示
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          height: 'calc(100% - 40px)', 
                          backgroundColor: '#fff', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          border: '1px dashed #ccc'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            請求書を選択してください
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* 請求情報 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, overflow: 'auto', backgroundColor: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          請求情報
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setIsInvoiceInfoEditing(!isInvoiceInfoEditing)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {selectedInvoiceForPreview ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* ファイル名 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>ファイル名</Typography>
                            {isInvoiceInfoEditing ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={invoiceInfo.fileName}
                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, fileName: e.target.value }))}
                                placeholder="ファイル名を入力してください"
                              />
                            ) : (
                              <Box sx={{ 
                                p: 1, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: 1, 
                                backgroundColor: '#fff',
                                fontSize: '0.875rem'
                              }}>
                                {selectedInvoiceForPreview.fileName}
                              </Box>
                            )}
                          </Box>

                          {/* 支払期限 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>支払期限</Typography>
                            {isInvoiceInfoEditing ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={invoiceInfo.paymentDeadline}
                                onChange={(e) => setInvoiceInfo(prev => ({ ...prev, paymentDeadline: e.target.value }))}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            ) : (
                              <Box sx={{ 
                                p: 1, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: 1, 
                                backgroundColor: '#fff',
                                fontSize: '0.875rem'
                              }}>
                                {new Date(invoiceInfo.paymentDeadline).toLocaleDateString('ja-JP')}
                              </Box>
                            )}
                          </Box>

                          {/* 請求総額 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>請求総額</Typography>
                            <Box sx={{ 
                              p: 1, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1, 
                              backgroundColor: '#fff',
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              color: 'primary.main'
                            }}>
                              ¥{calculateTotalAmount().toLocaleString()}
                            </Box>
                          </Box>

                          {/* 請求品目 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>請求品目</Typography>
                            {isInvoiceInfoEditing ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {invoiceInfo.items.map((item, index) => (
                                  <Box key={index} sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '120px 1fr 100px 80px 100px 40px',
                                    gap: 1, 
                                    alignItems: 'center',
                                    p: 1,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    backgroundColor: '#f9f9f9'
                                  }}>
                                    {/* 日付 */}
                                    <TextField
                                      size="small"
                                      type="date"
                                      value={item.date}
                                      onChange={(e) => {
                                        const newItems = [...invoiceInfo.items];
                                        newItems[index].date = e.target.value;
                                        setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                    
                                    {/* 品目名 */}
                                    <TextField
                                      size="small"
                                      value={item.name}
                                      onChange={(e) => {
                                        const newItems = [...invoiceInfo.items];
                                        newItems[index].name = e.target.value;
                                        setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      placeholder="品目名"
                                    />
                                    
                                    {/* 単価 */}
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) => {
                                        const newItems = [...invoiceInfo.items];
                                        newItems[index].unitPrice = e.target.value;
                                        setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      placeholder="単価"
                                      InputProps={{
                                        startAdornment: <Typography sx={{ mr: 0.5, color: '#666' }}>¥</Typography>
                                      }}
                                    />
                                    
                                    {/* 回数 */}
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={item.count}
                                      onChange={(e) => {
                                        const newItems = [...invoiceInfo.items];
                                        newItems[index].count = Math.max(1, parseInt(e.target.value) || 1);
                                        setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      inputProps={{ min: 1, step: 1 }}
                                      placeholder="回数"
                                    />
                                    
                                    {/* 課税区分 */}
                                    <FormControl size="small">
                                      <Select
                                        value={item.taxType}
                                        onChange={(e) => {
                                          const newItems = [...invoiceInfo.items];
                                          newItems[index].taxType = e.target.value as 'taxable' | 'tax-free';
                                          setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                        }}
                                        displayEmpty
                                      >
                                        <MenuItem value="taxable">課税</MenuItem>
                                        <MenuItem value="tax-free">非課税</MenuItem>
                                      </Select>
                                    </FormControl>
                                    
                                    {/* 削除ボタン */}
                                    {invoiceInfo.items.length > 1 && (
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const newItems = invoiceInfo.items.filter((_, i) => i !== index);
                                          setInvoiceInfo(prev => ({ ...prev, items: newItems }));
                                        }}
                                        sx={{ p: 0.5 }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                ))}
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setInvoiceInfo(prev => ({
                                      ...prev,
                                      items: [...prev.items, { 
                                        date: new Date().toISOString().split('T')[0], 
                                        name: '', 
                                        unitPrice: '', 
                                        count: 1, 
                                        taxType: 'taxable' as 'taxable' | 'tax-free'
                                      }]
                                    }));
                                  }}
                                  sx={{ mt: 1, fontSize: '0.75rem', alignSelf: 'flex-start' }}
                                >
                                  + 品目追加
                                </Button>
                              </Box>
                            ) : (
                              <Box sx={{ 
                                p: 1, 
                                border: '1px solid #e0e0e0', 
                                borderRadius: 1, 
                                backgroundColor: '#fff',
                                fontSize: '0.875rem'
                              }}>
                                {selectedInvoiceForPreview.items.map((item, index) => (
                                  <Box key={index} sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '80px 1fr 80px 50px 80px',
                                    gap: 1,
                                    mb: 0.5,
                                    p: 0.5,
                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                                    borderRadius: 0.5
                                  }}>
                                    <Typography variant="caption">{new Date(item.eventDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</Typography>
                                    <Typography variant="caption">{item.itemName}</Typography>
                                    <Typography variant="caption">¥{item.unitPrice.toLocaleString()}</Typography>
                                    <Typography variant="caption">{item.quantity}回</Typography>
                                    <Typography variant="caption">{item.taxType === 'taxable' ? '課税' : '非課税'}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          height: '200px', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px dashed #ccc',
                          borderRadius: 1
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            請求書を選択してください
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* 請求書プレビューモーダル */}
        <InvoicePreviewModal
          open={invoicePreviewModalOpen}
          invoice={selectedInvoiceForPreview}
          onClose={() => setInvoicePreviewModalOpen(false)}
        />

        {/* ステップ4: 送付完了 */}
        {activeStep === 4 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center'
            }}>
              {/* 完了アイコン */}
              <Box sx={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                backgroundColor: '#4caf50', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <Typography sx={{ 
                  fontSize: '4rem', 
                  color: 'white',
                  lineHeight: 1
                }}>
                  ✓
                </Typography>
              </Box>

              {/* 完了メッセージ */}
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#4caf50', 
                mb: 2 
              }}>
                送付完了
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: '#666', 
                mb: 1 
              }}>
                請求書の送付が完了しました
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#888', 
                maxWidth: '500px'
              }}>
                送付履歴は送付一覧でご確認いただけます。
              </Typography>

            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
} 