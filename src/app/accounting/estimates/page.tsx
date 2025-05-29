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
import EstimateSettingList from '../../../components/accounting/EstimateSettingList';
import EstimatePreviewList from '../../../components/accounting/EstimatePreviewList';
import EstimatePreviewModal from '../../../components/accounting/EstimatePreviewModal';

// ステップ定義
const ESTIMATION_STEPS = [
  '見積作成',
  '送付先設定',
  'プレビュー',
  '送付'
];

// 見積品目の型定義
interface EstimateItem {
  id: number;
  eventDate: string; // 開催日付
  itemName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  taxType: 'taxable' | 'tax-free'; // 課税 or 非課税
}

// 見積データの型定義
interface Estimate {
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
  items: EstimateItem[]; // 見積品目
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
    status: 'quote_ready',
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
    status: 'quote_revised',
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
    status: 'quote_ready',
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
    status: 'quote_revised',
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
    status: 'quote_ready',
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
    status: 'quote_revised',
    revenue: 35000,
    closerCount: 2,
    girlCount: 2,
    freeEntryCount: 1,
    hasPlaceReservation: false,
    isMonthlyPayment: false,
    transportationTaxFree: false
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
  rejected: '#bdbdbd' // お断り: 濃いグレー
};

export default function EstimatesPage() {
  const searchParams = useSearchParams();
  
  // 状態管理
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('1');
  const [selectedWeek, setSelectedWeek] = useState<number | string>(1);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['quote_ready']);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['all']);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [activeStep, setActiveStep] = useState(() => {
    const stepParam = searchParams.get('step');
    return stepParam ? parseInt(stepParam, 10) : 1;
  });
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});
  const [editingItemValues, setEditingItemValues] = useState<Record<string, string>>({});
  const [selectedEstimateForPreview, setSelectedEstimateForPreview] = useState<Estimate | null>(null);
  const [estimatePreviewModalOpen, setEstimatePreviewModalOpen] = useState(false);
  const [previewExpandedAccordions, setPreviewExpandedAccordions] = useState<Record<string, boolean>>({});
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    to: [{ lastName: '田中', firstName: '太郎', email: 'example@sample.com' }],
    cc: [
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' },
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' },
      { lastName: '田中', firstName: '太郎', email: 'example@sample.com' }
    ]
  });
  const [isMailEditing, setIsMailEditing] = useState(false);
  const [mailContent, setMailContent] = useState({
    subject: '【見積書送付】',
    body: 'いつもお世話になっております。\n\n下記の件につきまして、見積書をお送りいたします。ご査収のほど、よろしくお願いいたします。\n\n■見積内容\n・送付先店舗: 大宮店\n・見積総額: ¥50,000\n・ファイル名: 見積書_株式会社ABC代理店_2025-01-01.pdf\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n今後ともよろしくお願いいたします。'
  });
  const [isEstimateInfoEditing, setIsEstimateInfoEditing] = useState(false);
  const [estimateInfo, setEstimateInfo] = useState({
    fileName: '見積書_株式会社ABC代理店_2025-01-01.pdf',
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
  
  // 代理店リスト（固定値）
  const agencyList = ['株式会社ABC代理店', 'DEF広告株式会社', 'GHIプロモーション'];

  // 利用可能な店舗リスト（プロジェクトデータから抽出）
  const availableStores = MOCK_PROJECTS.flatMap(project => [project.storeName, ...project.coStores])
    .filter((store, index, arr) => arr.indexOf(store) === index)
    .sort();

  // 代理店ごとにグループ化（useMemoを使用）
  const groupedEstimates = useMemo(() => {
    return estimates.reduce<Record<string, Estimate[]>>((acc, estimate) => {
      if (!acc[estimate.agencyName]) acc[estimate.agencyName] = [];
      acc[estimate.agencyName].push(estimate);
      return acc;
    }, {});
  }, [estimates]);

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

  // 代理店ごとにグルーピング
  const groupedProjects = filteredProjects.reduce<Record<string, Project[]>>((acc, project) => {
    if (!acc[project.agencyName]) acc[project.agencyName] = [];
    acc[project.agencyName].push(project);
    return acc;
  }, {});

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
    const allProjectIds = filteredProjects.map(project => project.id);
    setSelectedProjects(allProjectIds);
  };

  // 全案件選択解除ハンドラー
  const handleDeselectAll = () => {
    setSelectedProjects([]);
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

  // 見積作成ハンドラー
  const handleCreateEstimate = () => {
    if (selectedProjects.length === 0) return;
    
    const selectedProjectsData = filteredProjects.filter(project => 
      selectedProjects.includes(project.id)
    );
    
    // 代理店ごとに見積を作成
    const agencyGroups = selectedProjectsData.reduce<Record<string, Project[]>>((acc, project) => {
      if (!acc[project.agencyName]) acc[project.agencyName] = [];
      acc[project.agencyName].push(project);
      return acc;
    }, {});

    const newEstimates: Estimate[] = [];
    
    Object.entries(agencyGroups).forEach(([agencyName, projects]) => {
      const totalAmount = projects.reduce((sum, project) => sum + project.revenue, 0);
      const currentDate = new Date().toISOString().split('T')[0];
      const estimateId = Date.now() + Math.random();
      
      // 品目データを作成
      const items: EstimateItem[] = [
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
      
      const estimate: Estimate = {
        id: estimateId,
        agencyName: agencyName,
        sendTo: `${agencyName.replace('株式会社', '').replace('プロモーション', '')}@example.com`,
        storeAddressSetting: '本店住所',
        fileName: `見積書_${agencyName}_${currentDate}.pdf`,
        totalAmount: totalAmountWithTax,
        createdAt: new Date().toLocaleString('ja-JP'),
        projectIds: projects.map(p => p.id),
        mainStoreNames: projects.map(p => p.storeName).filter((store, index, arr) => arr.indexOf(store) === index),
        coStoreNames: projects.flatMap(p => p.coStores).filter((store, index, arr) => arr.indexOf(store) === index),
        items: items
      };
      
      newEstimates.push(estimate);
    });

    setEstimates(prev => [...newEstimates, ...prev]);
    setSelectedProjects([]); // 選択をクリア
    setActiveStep(2); // ステップを「送付先設定」に進める
    
    console.log('作成された見積:', newEstimates);
  };

  // 見積削除ハンドラー
  const handleDeleteEstimate = (estimateId: number) => {
    setEstimates(prev => prev.filter(estimate => estimate.id !== estimateId));
  };

  // プレビューボタンハンドラー
  const handlePreview = (estimate: Estimate) => {
    console.log('プレビュー表示:', estimate);
    setActiveStep(3); // ステップを「プレビュー」に進める
  };

  // 送付ボタンハンドラー
  const handleSend = () => {
    console.log('全見積送付:', estimates);
    setActiveStep(4); // ステップを「送付」に進める
    // 実際のアプリではここで全ての見積の送付処理を行う
  };

  // ステップクリックハンドラー（ステップを戻す機能）
  const handleStepClick = (stepIndex: number) => {
    // 現在のステップより前のステップのみクリック可能
    const actualStepIndex = stepIndex + 1; // インデックスを実際のステップ番号に変換
    if (actualStepIndex < activeStep) {
      setActiveStep(actualStepIndex);
    }
  };

  // 戻るボタンハンドラー（見積作成に戻る）
  const handleGoBack = () => {
    if (activeStep === 3) {
      setActiveStep(2); // プレビューから送付先設定に戻る
    } else {
      setActiveStep(1); // 送付先設定から見積作成に戻る
    }
  };

  // アコーディオン展開/折りたたみハンドラー
  const handleAccordionChange = (estimateId: number | string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [estimateId]: isExpanded
    }));
  };

  // 品目編集開始ハンドラー
  const handleItemEditStart = (estimateId: number, itemId: number, currentName: string) => {
    const key = `${estimateId}-${itemId}`;
    setEditingItems(prev => ({ ...prev, [key]: true }));
    setEditingItemValues(prev => ({ ...prev, [key]: currentName }));
  };

  // 品目編集キャンセルハンドラー
  const handleItemEditCancel = (estimateId: number, itemId: number) => {
    const key = `${estimateId}-${itemId}`;
    setEditingItems(prev => ({ ...prev, [key]: false }));
    setEditingItemValues(prev => ({ ...prev, [key]: '' }));
  };

  // 品目編集保存ハンドラー
  const handleItemEditSave = (estimateId: number, itemId: number) => {
    const key = `${estimateId}-${itemId}`;
    const newItemName = editingItemValues[key];
    
    if (newItemName.trim()) {
      setEstimates(prev => prev.map(estimate => 
        estimate.id === estimateId 
          ? {
              ...estimate,
              items: estimate.items.map(item =>
                item.id === itemId 
                  ? { ...item, itemName: newItemName.trim() }
                  : item
              )
            }
          : estimate
      ));
    }
    
    setEditingItems(prev => ({ ...prev, [key]: false }));
    setEditingItemValues(prev => ({ ...prev, [key]: '' }));
  };

  // 品目名変更ハンドラー
  const handleItemNameChange = (estimateId: number, itemId: number, value: string) => {
    const key = `${estimateId}-${itemId}`;
    setEditingItemValues(prev => ({ ...prev, [key]: value }));
  };

  // 送付先変更ハンドラー
  const handleMainStoreChange = (estimateId: number, newStores: string[]) => {
    setEstimates(prev => prev.map(estimate => 
      estimate.id === estimateId 
        ? { ...estimate, mainStoreNames: newStores }
        : estimate
    ));
  };

  // 店舗アドレス変更ハンドラー
  const handleCoStoreChange = (estimateId: number, newStores: string[]) => {
    setEstimates(prev => prev.map(estimate => 
      estimate.id === estimateId 
        ? { ...estimate, coStoreNames: newStores }
        : estimate
    ));
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

  // プレビュー用ハンドラー
  const handlePreviewEstimateSelect = (estimate: Estimate) => {
    setSelectedEstimateForPreview(estimate);
  };

  const handlePreviewAccordionToggle = (key: string) => {
    setPreviewExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // 見積総額の自動集計関数
  const calculateTotalAmount = () => {
    const subtotal = estimateInfo.items.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const count = item.count || 0;
      return sum + (unitPrice * count);
    }, 0);
    
    const taxableAmount = estimateInfo.items
      .filter(item => item.taxType === 'taxable')
      .reduce((sum, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const count = item.count || 0;
        return sum + (unitPrice * count);
      }, 0);
    
    const tax = Math.floor(taxableAmount * 0.1);
    return subtotal + tax;
  };
  
  // フリー見積データの読み込み
  useEffect(() => {
    const fromParam = searchParams.get('from');
    if (fromParam === 'free') {
      const freeEstimateData = localStorage.getItem('freeEstimateData');
      if (freeEstimateData) {
        try {
          const estimateData = JSON.parse(freeEstimateData);
          setEstimates(prev => [estimateData, ...prev]);
          // 使用後はlocalStorageから削除
          localStorage.removeItem('freeEstimateData');
        } catch (error) {
          console.error('フリー見積データの読み込みに失敗しました:', error);
        }
      }
    }
  }, [searchParams]);
  
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
              {ESTIMATION_STEPS.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      cursor: index + 1 < activeStep ? 'pointer' : 'default',
                      '&:hover': index + 1 < activeStep ? { opacity: 0.8 } : {},
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
                      checked={selectedStatus.includes('quote_ready')}
                      onChange={handleStatusChange('quote_ready')}
                      size="small"
                      sx={{
                        color: '#1976d2',
                        '&.Mui-checked': {
                          color: '#1976d2',
                        },
                      }}
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>見積送付前</Typography>}
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatus.includes('quote_revised')}
                      onChange={handleStatusChange('quote_revised')}
                      size="small"
                      sx={{
                        color: '#2e7d32',
                        '&.Mui-checked': {
                          color: '#2e7d32',
                        },
                      }}
                    />
                  }
                  label={<Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>見積修正済</Typography>}
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
            {/* 全体選択ボタンと見積作成ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  disabled={filteredProjects.length === 0}
                >
                  すべて選択
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleDeselectAll}
                  disabled={selectedProjects.length === 0}
                >
                  すべて解除
                </Button>
                {selectedProjects.length > 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedProjects.length}件選択中
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="text"
                  size="medium"
                  component="a"
                  href="/accounting/estimates/free"
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
                  フリー見積作成
                </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateEstimate}
                disabled={selectedProjects.length === 0}
                sx={{ 
                  minWidth: '160px',
                  height: '48px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                見積作成
              </Button>
              </Box>
            </Box>
            
            {/* 代理店ごとにグループ化して表示 */}
            {Object.entries(groupedProjects).map(([agency, projects]) => (
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
            ))}

            {filteredProjects.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  選択した条件に該当する案件がありません
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* 見積リスト表示 */}
        {estimates.length > 0 && activeStep === 2 && (
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
                  if (estimates.length > 0) {
                    handlePreview(estimates[0]);
                  }
                }}
                disabled={estimates.length === 0}
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
            
            {/* 送付先設定リスト */}
            <EstimateSettingList
              estimates={estimates}
              availableStores={availableStores}
              expandedAccordions={expandedAccordions}
              editingItems={editingItems}
              editingItemValues={editingItemValues}
              onAccordionChange={handleAccordionChange}
              onDeleteEstimate={handleDeleteEstimate}
              onMainStoreChange={handleMainStoreChange}
              onCoStoreChange={handleCoStoreChange}
              onItemEditStart={handleItemEditStart}
              onItemEditCancel={handleItemEditCancel}
              onItemEditSave={handleItemEditSave}
              onItemNameChange={handleItemNameChange}
            />
        </Paper>
        )}

        {/* プレビュービュー */}
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
              {/* 左側：見積リスト */}
              <Box sx={{ width: '300px', p: 2, overflow: 'auto' }}>
                <EstimatePreviewList
                  estimates={estimates}
                  selectedEstimate={selectedEstimateForPreview}
                  expandedAccordions={previewExpandedAccordions}
                  onEstimateSelect={handlePreviewEstimateSelect}
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

                {/* 見積書プレビュー */}
                <Box sx={{ height: '1000px' }}>
                  <Box sx={{ display: 'flex', gap: 3, height: '1000px' }}>
                    {/* 見積書 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, backgroundColor: '#fff' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        見積書プレビュー
                      </Typography>
                      {selectedEstimateForPreview ? (
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
                          onClick={() => setEstimatePreviewModalOpen(true)}
                        >
                          {/* 見積書のイメージ */}
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
                              
                              {/* 右側：日付と見積書タイトル */}
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                  2025/04/24
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', borderBottom: '3px solid #1976d2', pb: 0.5 }}>
                                  御見積書
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
                                {selectedEstimateForPreview.agencyName} 御中
                              </Typography>
                            </Box>
                            
                            {/* 合計金額ボックス */}
                            <Box sx={{ 
                              border: '2px solid #1976d2', 
                              p: 1, 
                              mb: 2, 
                              backgroundColor: '#e3f2fd',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                合計金額<br/>（税込金額）
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {selectedEstimateForPreview.totalAmount.toLocaleString()}
                              </Typography>
                            </Box>
                            
                            {/* 見積番号 */}
                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                見積番号：T80300011358591
                              </Typography>
                            </Box>
                            
                            {/* 明細テーブル */}
                            <Box sx={{ flex: 1, mb: 2 }}>
                              {/* テーブルヘッダー */}
                              <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '80px 1fr 60px 40px 80px',
                                backgroundColor: '#1976d2',
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
                              {selectedEstimateForPreview.items.slice(0, 2).map((item, index) => (
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
                              backgroundColor: '#1976d2',
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
                          
                          {/* クリック案内（見積書の外に配置） */}
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
                            見積を選択してください
                                </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* 見積情報 */}
                    <Box sx={{ flex: 1, border: '1px solid #fff', borderRadius: 1, p: 2, overflow: 'auto', backgroundColor: '#fff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          見積情報
                        </Typography>
                            <IconButton
                              size="small"
                          onClick={() => setIsEstimateInfoEditing(!isEstimateInfoEditing)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                      {selectedEstimateForPreview ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* ファイル名 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>ファイル名</Typography>
                            {isEstimateInfoEditing ? (
                                        <TextField
                                fullWidth
                                          size="small"
                                value={estimateInfo.fileName}
                                onChange={(e) => setEstimateInfo(prev => ({ ...prev, fileName: e.target.value }))}
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
                                {selectedEstimateForPreview.fileName}
                              </Box>
                            )}
                          </Box>

                          {/* 支払期限 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>支払期限</Typography>
                            {isEstimateInfoEditing ? (
                              <TextField
                                          fullWidth
                                size="small"
                                type="date"
                                value={estimateInfo.paymentDeadline}
                                onChange={(e) => setEstimateInfo(prev => ({ ...prev, paymentDeadline: e.target.value }))}
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
                                {new Date(estimateInfo.paymentDeadline).toLocaleDateString('ja-JP')}
                              </Box>
                            )}
                          </Box>

                          {/* 見積総額 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>見積総額</Typography>
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

                          {/* 見積品目 */}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>見積品目</Typography>
                            {isEstimateInfoEditing ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {estimateInfo.items.map((item, index) => (
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
                                        const newItems = [...estimateInfo.items];
                                        newItems[index].date = e.target.value;
                                        setEstimateInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                    
                                    {/* 品目名 */}
                                    <TextField
                                            size="small"
                                      value={item.name}
                                      onChange={(e) => {
                                        const newItems = [...estimateInfo.items];
                                        newItems[index].name = e.target.value;
                                        setEstimateInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      placeholder="品目名"
                                    />
                                    
                                    {/* 単価 */}
                                    <TextField
                                            size="small"
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) => {
                                        const newItems = [...estimateInfo.items];
                                        newItems[index].unitPrice = e.target.value;
                                        setEstimateInfo(prev => ({ ...prev, items: newItems }));
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
                                        const newItems = [...estimateInfo.items];
                                        newItems[index].count = Math.max(1, parseInt(e.target.value) || 1);
                                        setEstimateInfo(prev => ({ ...prev, items: newItems }));
                                      }}
                                      inputProps={{ min: 1, step: 1 }}
                                      placeholder="回数"
                                    />
                                    
                                    {/* 課税区分 */}
                                    <FormControl size="small">
                                      <Select
                                        value={item.taxType}
                                        onChange={(e) => {
                                          const newItems = [...estimateInfo.items];
                                          newItems[index].taxType = e.target.value as 'taxable' | 'tax-free';
                                          setEstimateInfo(prev => ({ ...prev, items: newItems }));
                                        }}
                                        displayEmpty
                                      >
                                        <MenuItem value="taxable">課税</MenuItem>
                                        <MenuItem value="tax-free">非課税</MenuItem>
                                      </Select>
                                    </FormControl>
                                    
                                    {/* 削除ボタン */}
                                    {estimateInfo.items.length > 1 && (
                                        <IconButton
                                          size="small"
                                        onClick={() => {
                                          const newItems = estimateInfo.items.filter((_, i) => i !== index);
                                          setEstimateInfo(prev => ({ ...prev, items: newItems }));
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
                                    setEstimateInfo(prev => ({
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
                                {selectedEstimateForPreview.items.map((item, index) => (
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
                        <Typography variant="body2" color="text.secondary">
                          見積を選択してください
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
        </Paper>
        )}

        {/* 送付完了画面 */}
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
                見積書の送付が完了しました
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#888', 
                maxWidth: '500px'
              }}>
                送付履歴は見積管理画面でご確認いただけます。
              </Typography>

            </Box>
          </Paper>
        )}

        {/* 見積書拡大モーダル */}
        <EstimatePreviewModal
          open={estimatePreviewModalOpen}
          estimate={selectedEstimateForPreview}
          onClose={() => setEstimatePreviewModalOpen(false)}
        />

        {/* 案件詳細Drawer */}
        <ProjectDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
          onSave={handleSaveProject}
        />

      </Container>
    </Box>
  );
}
