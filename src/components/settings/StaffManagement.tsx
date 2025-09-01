'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Rating,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  Checkbox,
  ListItemButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Excel-like filter component
import ExcelLikeFilter, { FilterOption } from '../common/ExcelLikeFilter';


// Image components
import ImageCropDialog from '../common/ImageCropDialog';
import AvatarWithPreview from '../common/AvatarWithPreview';

// データファイルからインポート
import {
  StaffData,
  NGStaffRelation,
  NGAgencyRelation,
  StaffTabValue,
  LayerPerson,
  Store,
  AgencyData,
  generateSimplePassword,
  initialStaffData,
  sampleStaff,
  sampleNGRelations,
  sampleNGAgencies,
  affiliationOptions,
  positionOptions,
  agencyOptions,
  getLayerOptions,
  getStoreOptions,
  getLayerPersonName,
  getStoreName,
} from '../../data/staffData';

export const StaffManagement: React.FC = () => {
  // タブ関連
  const [tabValue, setTabValue] = useState<StaffTabValue>('basic');
  
  // スタッフ管理関連
  const [staffList, setStaffList] = useState<StaffData[]>(sampleStaff);
  const [basicDialogOpen, setBasicDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);
  const [staffData, setStaffData] = useState<Omit<StaffData, 'id'>>(initialStaffData);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  // NG関係管理関連
  const [ngRelations, setNgRelations] = useState<NGStaffRelation[]>(sampleNGRelations);
  const [ngDialogOpen, setNgDialogOpen] = useState(false);
  const [ngStaffAffiliationFilter, setNgStaffAffiliationFilter] = useState<string>('');

  // NG関係編集ダイアログ関連
  const [editNGStaffDialogOpen, setEditNGStaffDialogOpen] = useState(false);
  const [editingNGStaff, setEditingNGStaff] = useState<NGStaffRelation | null>(null);
  const [editNGStaffData, setEditNGStaffData] = useState<Partial<NGStaffRelation>>({});
  const [editNGStaffAffiliationFilter, setEditNGStaffAffiliationFilter] = useState<string>('');
  
  // NG代理店管理関連
  const [ngAgencies, setNgAgencies] = useState<NGAgencyRelation[]>(sampleNGAgencies);
  const [ngAgencyDialogOpen, setNgAgencyDialogOpen] = useState(false);
  const [selectedStaffForNGAgency, setSelectedStaffForNGAgency] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedNGType, setSelectedNGType] = useState<'agency' | 'layer' | 'store'>('agency');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [ngAgencyReason, setNgAgencyReason] = useState<string>('');
  const [selectedNGStaff, setSelectedNGStaff] = useState<string>('');
  const [ngReason, setNgReason] = useState<string>('');

  // NG代理店編集ダイアログ関連
  const [editNGAgencyDialogOpen, setEditNGAgencyDialogOpen] = useState(false);
  const [editingNGAgency, setEditingNGAgency] = useState<NGAgencyRelation | null>(null);
  const [editNGAgencyData, setEditNGAgencyData] = useState<Partial<NGAgencyRelation>>({});
  const [ngAgencyStaffAffiliationFilter, setNgAgencyStaffAffiliationFilter] = useState<string>('');
  const [editNgAgencyStaffAffiliationFilter, setEditNgAgencyStaffAffiliationFilter] = useState<string>('');

  // Excelライクなフィルター関連
  const [affiliationFilter, setAffiliationFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [businessTripFilter, setBusinessTripFilter] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [stationFilter, setStationFilter] = useState<string[]>([]);
  const [carOwnershipFilter, setCarOwnershipFilter] = useState<string[]>([]);
  const [outdoorWorkNGFilter, setOutdoorWorkNGFilter] = useState<string[]>([]);
  const [directorCapabilityFilter, setDirectorCapabilityFilter] = useState<string[]>([]);
  const [priceRangeFilter, setPriceRangeFilter] = useState<string[]>([]);

  // 画像アップロード関連
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [editingStaffForImage, setEditingStaffForImage] = useState<string | null>(null);

  // 単価変更関連
  const [originalPrices, setOriginalPrices] = useState<{weekdayRate: number; weekendRate: number} | null>(null);
  const [isPriceChanged, setIsPriceChanged] = useState(false);

  // 役職ラベル取得関数
  const getPositionLabel = (position: string) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option ? option.label : position;
  };

  // スタッフ絞り込み関数
  const getFilteredStaff = (affiliationFilter: string) => {
    if (!affiliationFilter) return staffList;
    return staffList.filter(staff => staff.affiliation === affiliationFilter);
  };

  // 所属選択肢を取得
  const getAffiliationOptions = () => {
    const affiliationSet = new Set(staffList.map(staff => staff.affiliation));
    const affiliations = Array.from(affiliationSet);
    return affiliations.map(affiliation => ({
      value: affiliation,
      label: affiliationOptions.find(opt => opt.value === affiliation)?.label || affiliation
    }));
  };

  // 単価フィルター用のオプション生成関数
  const getPriceRangeOptions = (): FilterOption[] => {
    const priceRanges = [
      { value: '8000-12000', label: '¥8,000-¥12,000' },
      { value: '12000-15000', label: '¥12,000-¥15,000' },
      { value: '15000-18000', label: '¥15,000-¥18,000' },
      { value: '18000-20000', label: '¥18,000-¥20,000' },
      { value: '20000+', label: '¥20,000以上' }
    ];

    return priceRanges.map(range => {
      const count = staffList.filter(staff => {
        const maxRate = Math.max(staff.weekdayRate, staff.weekendRate);
        switch (range.value) {
          case '8000-12000':
            return maxRate >= 8000 && maxRate < 12000;
          case '12000-15000':
            return maxRate >= 12000 && maxRate < 15000;
          case '15000-18000':
            return maxRate >= 15000 && maxRate < 18000;
          case '18000-20000':
            return maxRate >= 18000 && maxRate < 20000;
          case '20000+':
            return maxRate >= 20000;
          default:
            return false;
        }
      }).length;

      return {
        value: range.value,
        label: `${range.label} (${count})`
      };
    }).filter(option => option.label.includes('(') && !option.label.includes('(0)'));
  };



  // Excelライクフィルター用のオプション生成関数
  const getFilterOptions = (field: keyof StaffData): FilterOption[] => {
    const valueCount = new Map<string, number>();
    
    staffList.forEach(staff => {
      const value = staff[field];
      let displayValue: string;
      
      switch (field) {
        case 'affiliation':
          displayValue = affiliationOptions.find(opt => opt.value === value)?.label || value as string;
          break;
        case 'position':
          displayValue = positionOptions.find(opt => opt.value === value)?.label || value as string;
          break;
        case 'businessTripAvailable':
          displayValue = value ? '可' : '不可';
          break;
        case 'gender':
          displayValue = value === 'male' ? '男性' : '女性';
          break;
        case 'hasOwnCar':
          displayValue = value ? '有' : '無';
          break;
        case 'outdoorWorkNG':
          displayValue = value ? 'NG' : 'OK';
          break;
        case 'canBeDirector':
          displayValue = value ? '可' : '不可';
          break;
        default:
          displayValue = value as string;
      }
      
      const key = value as string;
      valueCount.set(key, (valueCount.get(key) || 0) + 1);
    });
    
    return Array.from(valueCount.entries()).map(([value, count]) => {
      let label: string;
      
      switch (field) {
        case 'affiliation':
          label = affiliationOptions.find(opt => opt.value === value)?.label || value;
          break;
        case 'position':
          label = positionOptions.find(opt => opt.value === value)?.label || value;
          break;
        case 'businessTripAvailable':
          label = value === 'true' ? '可' : '不可';
          break;
        case 'gender':
          label = value === 'male' ? '男性' : '女性';
          break;
        case 'hasOwnCar':
          label = value === 'true' ? '有' : '無';
          break;
        case 'outdoorWorkNG':
          label = value === 'true' ? 'NG' : 'OK';
          break;
        case 'canBeDirector':
          label = value === 'true' ? '可' : '不可';
          break;
        default:
          label = value;
      }
      
      return { value, label, count };
    }).sort((a, b) => a.label.localeCompare(b.label));
  };

  const getFilteredStaffList = () => {
    return staffList.filter(staff => {
      // 所属フィルター
      if (affiliationFilter.length > 0 && !affiliationFilter.includes(staff.affiliation)) {
        return false;
      }
      
      // 氏名フィルター
      if (nameFilter.length > 0 && !nameFilter.includes(staff.name)) {
        return false;
      }
      
      // 役職フィルター
      if (positionFilter.length > 0 && !positionFilter.includes(staff.position)) {
        return false;
      }
      
      // 出張可否フィルター
      if (businessTripFilter.length > 0) {
        const tripValue = staff.businessTripAvailable ? 'true' : 'false';
        if (!businessTripFilter.includes(tripValue)) {
          return false;
        }
      }
      
      // 性別フィルター
      if (genderFilter.length > 0 && !genderFilter.includes(staff.gender)) {
        return false;
      }
      
      // 最寄駅フィルター
      if (stationFilter.length > 0 && !stationFilter.includes(staff.nearestStation)) {
        return false;
      }
      
      // 車所有フィルター
      if (carOwnershipFilter.length > 0) {
        const carValue = staff.hasOwnCar ? 'true' : 'false';
        if (!carOwnershipFilter.includes(carValue)) {
          return false;
        }
      }
      
      // 外現場NGフィルター
      if (outdoorWorkNGFilter.length > 0) {
        const outdoorValue = staff.outdoorWorkNG ? 'true' : 'false';
        if (!outdoorWorkNGFilter.includes(outdoorValue)) {
          return false;
        }
      }
      
      // ディレクター可否フィルター
      if (directorCapabilityFilter.length > 0) {
        const directorValue = staff.canBeDirector ? 'true' : 'false';
        if (!directorCapabilityFilter.includes(directorValue)) {
          return false;
        }
      }
      
      // 単価フィルター
      if (priceRangeFilter.length > 0) {
        const maxRate = Math.max(staff.weekdayRate, staff.weekendRate);
        const matchesRange = priceRangeFilter.some(range => {
          switch (range) {
            case '8000-12000':
              return maxRate >= 8000 && maxRate < 12000;
            case '12000-15000':
              return maxRate >= 12000 && maxRate < 15000;
            case '15000-18000':
              return maxRate >= 15000 && maxRate < 18000;
            case '18000-20000':
              return maxRate >= 18000 && maxRate < 20000;
            case '20000+':
              return maxRate >= 20000;
            default:
              return false;
          }
        });
        
        if (!matchesRange) {
          return false;
        }
      }
      

      
      return true;
    });
  };

  // フィルターがアクティブかどうかを判定
  const isFilterActive = (filterValues: string[], totalOptions: number) => {
    return filterValues.length > 0 && filterValues.length < totalOptions;
  };

  // 単価変更を検知する関数
  const checkPriceChange = (newWeekdayRate: number, newWeekendRate: number) => {
    if (originalPrices) {
      const changed = newWeekdayRate !== originalPrices.weekdayRate || 
                     newWeekendRate !== originalPrices.weekendRate;
      setIsPriceChanged(changed);
      
      // 単価が変更された場合、適用日を今日の日付に設定
      if (changed && !isPriceChanged) {
        setStaffData(prev => ({
          ...prev,
          priceEffectiveDate: new Date().toISOString().split('T')[0]
        }));
      }
    }
  };

  // ローカルストレージから画像データを読み込み
  React.useEffect(() => {
    const loadProfileImages = () => {
      const updatedStaffList = staffList.map(staff => {
        const savedStaff = localStorage.getItem(`staff_${staff.id}`);
        if (savedStaff) {
          try {
            const parsedStaff = JSON.parse(savedStaff);
            return { ...staff, profileImage: parsedStaff.profileImage };
          } catch (error) {
            console.error('Failed to parse saved staff data:', error);
          }
        }
        return staff;
      });
      
      // 変更があった場合のみ更新
      if (JSON.stringify(updatedStaffList) !== JSON.stringify(staffList)) {
        setStaffList(updatedStaffList);
      }
    };

    if (staffList.length > 0) {
      loadProfileImages();
    }
  }, []); // 初回のみ実行

  // フィルター初期化（全選択状態にする）
  React.useEffect(() => {
    if (staffList.length > 0) {
      // 初回のみ全選択状態にする
      if (affiliationFilter.length === 0) {
        setAffiliationFilter(Array.from(new Set(staffList.map(s => s.affiliation))));
      }
      if (nameFilter.length === 0) {
        setNameFilter(Array.from(new Set(staffList.map(s => s.name))));
      }
      if (positionFilter.length === 0) {
        setPositionFilter(Array.from(new Set(staffList.map(s => s.position))));
      }
      if (businessTripFilter.length === 0) {
        setBusinessTripFilter(['true', 'false']);
      }
      if (genderFilter.length === 0) {
        setGenderFilter(Array.from(new Set(staffList.map(s => s.gender))));
      }
      if (stationFilter.length === 0) {
        setStationFilter(Array.from(new Set(staffList.map(s => s.nearestStation))));
      }
      if (priceRangeFilter.length === 0) {
        setPriceRangeFilter(getPriceRangeOptions().map(option => option.value));
      }
      if (carOwnershipFilter.length === 0) {
        setCarOwnershipFilter(['true', 'false']);
      }
      if (outdoorWorkNGFilter.length === 0) {
        setOutdoorWorkNGFilter(['true', 'false']);
      }
      if (directorCapabilityFilter.length === 0) {
        setDirectorCapabilityFilter(['true', 'false']);
      }

    }
  }, [staffList]);

  // 画像アップロード関連の関数
  const validateImage = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) return 'ファイルサイズが5MBを超えています';
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) return '対応していない画像形式です';
    return null;
  };

  const handleImageUpload = (staffId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const error = validateImage(file);
      if (error) {
        alert(error);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setEditingStaffForImage(staffId);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  const handleCropComplete = (croppedImage: string) => {
    if (!editingStaffForImage) return;

    // 編集中のスタッフがいる場合（既存スタッフの編集）
    if (editingStaff) {
      // 編集中のスタッフデータに画像を追加
      setEditingStaff(prev => prev ? { ...prev, profileImage: croppedImage } : null);
      
      // スタッフリストも更新
      setStaffList(prev => prev.map(staff => 
        staff.id === editingStaffForImage 
          ? { ...staff, profileImage: croppedImage }
          : staff
      ));

      // ローカルストレージに保存
      const updatedStaff = staffList.find(s => s.id === editingStaffForImage);
      if (updatedStaff) {
        const staffWithImage = { ...updatedStaff, profileImage: croppedImage };
        localStorage.setItem(`staff_${editingStaffForImage}`, JSON.stringify(staffWithImage));
      }
    } else {
      // 新規追加の場合は一時的にstaffDataに保存
      setStaffData(prev => ({ ...prev, profileImage: croppedImage }));
    }

    // 状態をリセット
    setCropDialogOpen(false);
    setOriginalImage('');
    setEditingStaffForImage(null);
  };

  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
    setOriginalImage('');
    setEditingStaffForImage(null);
  };

  // NG関係編集ダイアログハンドラー
  const handleEditNGStaff = (ngStaff: NGStaffRelation) => {
    setEditingNGStaff(ngStaff);
    setEditNGStaffData({ ...ngStaff });
    setEditNGStaffDialogOpen(true);
  };

  const handleCloseEditNGStaffDialog = () => {
    setEditNGStaffDialogOpen(false);
    setEditingNGStaff(null);
    setEditNGStaffData({});
    setEditNGStaffAffiliationFilter(''); // 絞り込み状態をリセット
  };

  const handleSaveEditNGStaff = () => {
    if (editingNGStaff && editNGStaffData) {
      setNgRelations(prev => prev.map(ng => 
        ng.id === editingNGStaff.id 
          ? { ...ng, ...editNGStaffData }
          : ng
      ));
      handleCloseEditNGStaffDialog();
      setSaveMessage('NG関係を更新しました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleEditNGStaffFieldChange = (field: keyof NGStaffRelation, value: any) => {
    setEditNGStaffData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // NG代理店編集ダイアログハンドラー
  const handleEditNGAgency = (ngAgency: NGAgencyRelation) => {
    setEditingNGAgency(ngAgency);
    setEditNGAgencyData({ ...ngAgency });
    setEditNGAgencyDialogOpen(true);
  };

  const handleCloseEditNGAgencyDialog = () => {
    setEditNGAgencyDialogOpen(false);
    setEditingNGAgency(null);
    setEditNGAgencyData({});
    setEditNgAgencyStaffAffiliationFilter(''); // 絞り込み状態をリセット
  };

  const handleSaveEditNGAgency = () => {
    if (editingNGAgency && editNGAgencyData) {
      setNgAgencies(prev => prev.map(ng => 
        ng.id === editingNGAgency.id 
          ? { ...ng, ...editNGAgencyData }
          : ng
      ));
      handleCloseEditNGAgencyDialog();
    }
  };

  const handleEditNGAgencyFieldChange = (field: keyof NGAgencyRelation, value: any) => {
    setEditNGAgencyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 基本情報管理用のハンドラー
  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffData(initialStaffData);
    // 新規作成時は単価変更状態をリセット
    setOriginalPrices(null);
    setIsPriceChanged(false);
    setShowPassword(false);
    setBasicDialogOpen(true);
  };

  const handleEditBasicInfo = (staff: StaffData) => {
    setEditingStaff(staff);
    // 元の単価を記録
    setOriginalPrices({
      weekdayRate: staff.weekdayRate,
      weekendRate: staff.weekendRate
    });
    setIsPriceChanged(false);
    
    setStaffData({
        affiliation: staff.affiliation,
        name: staff.name,
        nameKana: staff.nameKana,
        gender: staff.gender,
        nearestStation: staff.nearestStation,
        phone: staff.phone,
        email: staff.email,
        lineId: staff.lineId,
        position: staff.position,
        businessTripAvailable: staff.businessTripAvailable,
        hasOwnCar: staff.hasOwnCar,
        outdoorWorkNG: staff.outdoorWorkNG,
        canBeDirector: staff.canBeDirector,
        weekdayRate: staff.weekdayRate,
        weekendRate: staff.weekendRate,
        priceEffectiveDate: staff.priceEffectiveDate,
        initialPassword: staff.initialPassword,
        mallAcquisitionPower: staff.mallAcquisitionPower,
        externalSalesAcquisitionPower: staff.externalSalesAcquisitionPower,
        inStoreAcquisitionPower: staff.inStoreAcquisitionPower,
        skillNotes: staff.skillNotes || '',
      });
    setShowPassword(false);
    setBasicDialogOpen(true);
  };

  const handleSaveBasicInfo = () => {
    if (!staffData.name.trim() || !staffData.email.trim()) {
      alert('必須項目を入力してください');
      return;
    }

    if (editingStaff) {
      const updatedStaff = { ...editingStaff, ...staffData };
      setStaffList(prev => prev.map(staff => 
        staff.id === editingStaff.id 
          ? updatedStaff
          : staff
      ));
      
      // ローカルストレージに画像データも保存
      if (updatedStaff.profileImage) {
        localStorage.setItem(`staff_${updatedStaff.id}`, JSON.stringify(updatedStaff));
      }
      
      setSaveMessage('スタッフ情報を更新しました');
    } else {
      const newStaff: StaffData = {
        id: Date.now().toString(),
        ...staffData,
      };
      setStaffList(prev => [...prev, newStaff]);
      
      // ローカルストレージに画像データも保存
      if (newStaff.profileImage) {
        localStorage.setItem(`staff_${newStaff.id}`, JSON.stringify(newStaff));
      }
      
      setSaveMessage('新しいスタッフを追加しました');
    }
    
    setBasicDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // NG関係管理の関数
  const handleAddNGRelation = () => {
    if (!selectedStaffForNGAgency || !selectedNGStaff || !ngReason.trim()) {
      alert('すべての項目を入力してください');
      return;
    }
    
    if (selectedStaffForNGAgency === selectedNGStaff) {
      alert('同じスタッフを選択することはできません');
      return;
    }
    
    const existingRelation = ngRelations.find(relation => 
      (relation.staffId === selectedStaffForNGAgency && relation.ngStaffId === selectedNGStaff) ||
      (relation.staffId === selectedNGStaff && relation.ngStaffId === selectedStaffForNGAgency)
    );
    
    if (existingRelation) {
      alert('この組み合わせのNG関係は既に登録されています');
      return;
    }
    
    const newRelation: NGStaffRelation = {
      id: Date.now().toString(),
      staffId: selectedStaffForNGAgency,
      ngStaffId: selectedNGStaff,
      reason: ngReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    
    const reverseRelation: NGStaffRelation = {
      id: (Date.now() + 1).toString(),
      staffId: selectedNGStaff,
      ngStaffId: selectedStaffForNGAgency,
      reason: ngReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    
    setNgRelations(prev => [...prev, newRelation, reverseRelation]);
    setSaveMessage('NG関係を登録しました');
    setNgDialogOpen(false);
    setSelectedStaffForNGAgency('');
    setSelectedNGStaff('');
    setNgStaffAffiliationFilter(''); // 絞り込み状態をリセット
    setNgReason('');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // NG代理店管理の関数
  const handleAddNGAgency = () => {
    if (!selectedStaffForNGAgency || !selectedAgency || !ngAgencyReason.trim()) {
      alert('すべての必須項目を入力してください');
      return;
    }

    if (selectedNGType !== 'agency' && !selectedTarget) {
      alert('対象を選択してください');
      return;
    }

    const selectedAgencyData = agencyOptions.find(agency => agency.id === selectedAgency);
    if (!selectedAgencyData) {
      alert('代理店が見つかりません');
      return;
    }

    let targetName = '';
    if (selectedNGType === 'layer') {
      const layerGroups = getLayerOptions(selectedAgency);
      let selectedLayerData = null;
      for (const group of layerGroups) {
        selectedLayerData = group.persons.find(person => person.id === selectedTarget);
        if (selectedLayerData) break;
      }
      targetName = selectedLayerData?.name || '';
    } else if (selectedNGType === 'store') {
      const storeOptions = getStoreOptions(selectedAgency);
      const selectedStoreData = storeOptions.find(store => store.id === selectedTarget);
      targetName = selectedStoreData?.name || '';
    }

    const existingNG = ngAgencies.find(ng => 
      ng.staffId === selectedStaffForNGAgency &&
      ng.agencyId === selectedAgency &&
      ng.ngType === selectedNGType &&
      (selectedNGType === 'agency' || ng.ngTargetId === selectedTarget)
    );

    if (existingNG) {
      alert('この設定は既に登録されています');
      return;
    }

    const newNGAgency: NGAgencyRelation = {
      id: Date.now().toString(),
      staffId: selectedStaffForNGAgency,
      agencyId: selectedAgency,
      agencyName: selectedAgencyData.name,
      ngType: selectedNGType,
      ngTargetId: selectedNGType === 'agency' ? undefined : selectedTarget,
      ngTargetName: selectedNGType === 'agency' ? undefined : targetName,
      reason: ngAgencyReason.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setNgAgencies(prev => [...prev, newNGAgency]);
    
    setSelectedStaffForNGAgency('');
    setSelectedAgency('');
    setSelectedNGType('agency');
    setSelectedTarget('');
    setNgAgencyReason('');
    setNgAgencyDialogOpen(false);
    setNgAgencyStaffAffiliationFilter(''); // 絞り込み状態をリセット
    
    setSaveMessage('NG代理店設定を追加しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // レンダリング関数
  const renderBasicManagement = () => (
      <Card>
        <CardHeader 
          title="スタッフ一覧"
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              自社・2次請スタッフの統合管理（基本情報・スキル評価含む）
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
              表示中: {getFilteredStaffList().length}件 / 全{staffList.length}件
            </Typography>
          </Box>
        }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* フィルターリセットボタン */}
              {(isFilterActive(affiliationFilter, getFilterOptions('affiliation').length) ||
                isFilterActive(nameFilter, getFilterOptions('name').length) ||
                isFilterActive(positionFilter, getFilterOptions('position').length) ||
                isFilterActive(businessTripFilter, getFilterOptions('businessTripAvailable').length) ||
                isFilterActive(stationFilter, getFilterOptions('nearestStation').length) ||
                isFilterActive(priceRangeFilter, getPriceRangeOptions().length) ||
                isFilterActive(carOwnershipFilter, getFilterOptions('hasOwnCar').length) ||
                isFilterActive(outdoorWorkNGFilter, getFilterOptions('outdoorWorkNG').length) ||
                isFilterActive(directorCapabilityFilter, getFilterOptions('canBeDirector').length)) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => {
                    setAffiliationFilter(Array.from(new Set(staffList.map(s => s.affiliation))));
                    setNameFilter(Array.from(new Set(staffList.map(s => s.name))));
                    setPositionFilter(Array.from(new Set(staffList.map(s => s.position))));
                    setBusinessTripFilter(['true', 'false']);
                    setGenderFilter(Array.from(new Set(staffList.map(s => s.gender))));
                    setStationFilter(Array.from(new Set(staffList.map(s => s.nearestStation))));
                    setPriceRangeFilter(getPriceRangeOptions().map(option => option.value));
                    setCarOwnershipFilter(['true', 'false']);
                    setOutdoorWorkNGFilter(['true', 'false']);
                    setDirectorCapabilityFilter(['true', 'false']);
                  }}
                >
                  フィルターリセット
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStaff}
              >
                スタッフ追加
              </Button>
            </Box>
          }
        />
        <CardContent sx={{ padding: '8px !important' }}>
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', minWidth: '100%' }}>
            <Table sx={{ 
              minWidth: 1400, 
              tableLayout: 'fixed',
              '& .MuiTableCell-root': {
                padding: '4px 8px',
                fontSize: '0.875rem'
              }
            }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      所属
                      <ExcelLikeFilter
                        title="所属"
                        options={getFilterOptions('affiliation')}
                        selectedValues={affiliationFilter}
                        onFilterChange={setAffiliationFilter}
                        isActive={isFilterActive(affiliationFilter, getFilterOptions('affiliation').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 200, whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      氏名
                      <ExcelLikeFilter
                        title="氏名"
                        options={getFilterOptions('name')}
                        selectedValues={nameFilter}
                        onFilterChange={setNameFilter}
                        isActive={isFilterActive(nameFilter, getFilterOptions('name').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 80, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      役職
                      <ExcelLikeFilter
                        title="役職"
                        options={getFilterOptions('position')}
                        selectedValues={positionFilter}
                        onFilterChange={setPositionFilter}
                        isActive={isFilterActive(positionFilter, getFilterOptions('position').length)}
                      />
                    </Box>
                  </TableCell>
                                    <TableCell sx={{ minWidth: 180, whiteSpace: 'nowrap', textAlign: 'center' }}>獲得力評価</TableCell>
                <TableCell sx={{ minWidth: 70, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      最寄駅
                      <ExcelLikeFilter
                        title="最寄駅"
                        options={getFilterOptions('nearestStation')}
                        selectedValues={stationFilter}
                        onFilterChange={setStationFilter}
                        isActive={isFilterActive(stationFilter, getFilterOptions('nearestStation').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 90, whiteSpace: 'nowrap', textAlign: 'center' }}>単価</TableCell>
                  <TableCell sx={{ minWidth: 50, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      出張可否
                      <ExcelLikeFilter
                        title="出張可否"
                        options={getFilterOptions('businessTripAvailable')}
                        selectedValues={businessTripFilter}
                        onFilterChange={setBusinessTripFilter}
                        isActive={isFilterActive(businessTripFilter, getFilterOptions('businessTripAvailable').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 80, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ディレクター可否
                      <ExcelLikeFilter
                        title="ディレクター可否"
                        options={getFilterOptions('canBeDirector')}
                        selectedValues={directorCapabilityFilter}
                        onFilterChange={setDirectorCapabilityFilter}
                        isActive={isFilterActive(directorCapabilityFilter, getFilterOptions('canBeDirector').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 60, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      外現場NG
                      <ExcelLikeFilter
                        title="外現場NG"
                        options={getFilterOptions('outdoorWorkNG')}
                        selectedValues={outdoorWorkNGFilter}
                        onFilterChange={setOutdoorWorkNGFilter}
                        isActive={isFilterActive(outdoorWorkNGFilter, getFilterOptions('outdoorWorkNG').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 40, whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      車所有
                      <ExcelLikeFilter
                        title="車所有"
                        options={getFilterOptions('hasOwnCar')}
                        selectedValues={carOwnershipFilter}
                        onFilterChange={setCarOwnershipFilter}
                        isActive={isFilterActive(carOwnershipFilter, getFilterOptions('hasOwnCar').length)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 60, whiteSpace: 'nowrap', textAlign: 'center' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredStaffList().map((staff) => (
                  <TableRow key={staff.id} sx={{ 
                    '& > *': { borderBottom: 'unset' },
                    height: '40px'
                  }}>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Chip 
                      label={affiliationOptions.find(opt => opt.value === staff.affiliation)?.label || staff.affiliation}
                        color={staff.affiliation === 'ansteype' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 380 }}>
                        <AvatarWithPreview
                          imageUrl={staff.profileImage}
                          altText={`${staff.name}のプロフィール画像`}
                          size={64}
                          editable={false}
                          disableClick={false}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {staff.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{getPositionLabel(staff.position)}                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 180 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="primary" sx={{ minWidth: 40, fontSize: '0.7rem', fontFamily: 'monospace' }}>モール：</Typography>
                          <Rating value={staff.mallAcquisitionPower} max={5} size="small" readOnly />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="secondary" sx={{ minWidth: 40, fontSize: '0.7rem', fontFamily: 'monospace' }}>外　販：</Typography>
                          <Rating value={staff.externalSalesAcquisitionPower} max={5} size="small" readOnly />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="success.main" sx={{ minWidth: 40, fontSize: '0.7rem', fontFamily: 'monospace' }}>店　内：</Typography>
                          <Rating value={staff.inStoreAcquisitionPower} max={5} size="small" readOnly />
                        </Box>
                      </Box>
                    </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{staff.nearestStation}                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          平日: ¥{staff.weekdayRate.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          土日: ¥{staff.weekendRate.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                          ({staff.priceEffectiveDate}〜)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Chip 
                        label={staff.businessTripAvailable ? '可' : '不可'}
                        color={staff.businessTripAvailable ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Chip 
                        label={staff.canBeDirector ? '可' : '不可'}
                        color={staff.canBeDirector ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Chip 
                        label={staff.outdoorWorkNG ? 'NG' : 'OK'}
                        color={staff.outdoorWorkNG ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <Chip 
                        label={staff.hasOwnCar ? '有' : '無'}
                        color={staff.hasOwnCar ? 'info' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <IconButton
                        size="small"
                      onClick={() => handleEditBasicInfo(staff)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
  );

  const renderNGManagement = () => (
      <Card>
        <CardHeader 
        title="NG要員管理"
        subheader="スタッフ間のNG関係を管理"
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setNgDialogOpen(true)}
          >
            NGペア追加
          </Button>
        }
        />
        <CardContent sx={{ padding: '8px !important' }}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" sx={{ '& .MuiTableCell-root': { padding: '4px 8px', fontSize: '0.875rem' } }}>
                  <TableHead>
                    <TableRow>
                <TableCell>基準スタッフ</TableCell>
                <TableCell>NGスタッフ</TableCell>
                <TableCell>理由</TableCell>
                <TableCell>登録日</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
              {ngRelations.map((relation) => {
                const baseStaff = staffList.find(s => s.id === relation.staffId);
                const ngStaff = staffList.find(s => s.id === relation.ngStaffId);
                return (
                  <TableRow key={relation.id}>
                    <TableCell>{baseStaff?.name || '不明'}</TableCell>
                    <TableCell>{ngStaff?.name || '不明'}</TableCell>
                    <TableCell>{relation.reason}</TableCell>
                    <TableCell>{relation.registeredDate}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditNGStaff(relation)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (confirm('このNG関係を削除しますか？')) {
                                  setNgRelations(prev => prev.filter(r => r.id !== relation.id));
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                );
              })}
              {ngRelations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      NG関係が登録されていません
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
                  </TableBody>
                </Table>
              </TableContainer>
                </CardContent>
              </Card>
  );

  const renderNGAgencyManagement = () => (
    <Card>
        <CardHeader 
        title="NG代理店管理"
        subheader="スタッフごとに代理店・レイヤー・店舗別のNG設定を管理"
          action={
            <Button
              variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNgAgencyDialogOpen(true)}
            >
            NG代理店追加
            </Button>
          }
        />
        <CardContent sx={{ padding: '8px !important' }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ '& .MuiTableCell-root': { padding: '4px 8px', fontSize: '0.875rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell>スタッフ名</TableCell>
                <TableCell>代理店名</TableCell>
                <TableCell>NG種別</TableCell>
                <TableCell>対象</TableCell>
                <TableCell>理由</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ngAgencies.map((ngAgency) => {
                const staff = staffList.find(s => s.id === ngAgency.staffId);
                return (
                  <TableRow key={ngAgency.id}>
                    <TableCell>{staff?.name || '不明'}</TableCell>
                    <TableCell>{ngAgency.agencyName}</TableCell>
                    <TableCell>
                            <Chip 
                        label={
                          ngAgency.ngType === 'agency' ? '代理店全体' :
                          ngAgency.ngType === 'layer' ? 'レイヤー' : '店舗'
                        }
                        color={
                          ngAgency.ngType === 'agency' ? 'error' :
                          ngAgency.ngType === 'layer' ? 'warning' : 'info'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {ngAgency.ngType === 'agency' ? '-' : 
                       ngAgency.ngType === 'layer' && ngAgency.ngTargetId ? 
                         getLayerPersonName(ngAgency.ngTargetId) || ngAgency.ngTargetName :
                       ngAgency.ngType === 'store' && ngAgency.ngTargetId ?
                         getStoreName(ngAgency.ngTargetId) || ngAgency.ngTargetName :
                         ngAgency.ngTargetName
                      }
                    </TableCell>
                    <TableCell>{ngAgency.reason}</TableCell>
                    <TableCell>{ngAgency.registeredDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditNGAgency(ngAgency)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (confirm('このNG設定を削除しますか？')) {
                              setNgAgencies(prev => prev.filter(ng => ng.id !== ngAgency.id));
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
              </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {ngAgencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      NG代理店設定がありません
                </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </CardContent>
      </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        スタッフ管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ '& .MuiTab-root': { minHeight: 48 } }}
        >
          <Tab 
            value="basic" 
            label="スタッフ管理" 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="ng-relations" 
            label="NG要員管理" 
            icon={<BlockIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="ng-agencies" 
            label="NG代理店管理" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* タブコンテンツ */}
      {tabValue === 'basic' && renderBasicManagement()}
      {tabValue === 'ng-relations' && renderNGManagement()}
      {tabValue === 'ng-agencies' && renderNGAgencyManagement()}

      {/* 基本情報編集ダイアログ */}
      <Dialog 
        open={basicDialogOpen} 
        onClose={() => {
          setBasicDialogOpen(false);
          // 状態をリセット
          setOriginalPrices(null);
          setIsPriceChanged(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStaff ? 'スタッフ情報編集' : 'スタッフ追加'}
        </DialogTitle>
        <DialogContent>
          {/* プロフィール画像セクション */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                顔写真
              </Typography>
              <AvatarWithPreview
                imageUrl={editingStaff?.profileImage || staffData.profileImage}
                altText={`${staffData.name || 'スタッフ'}のプロフィール画像`}
                size={80}
                editable={true}
                onEditClick={() => handleImageUpload(editingStaff?.id || 'new')}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                JPEG・PNG・GIF・WebP・BMP形式、5MB以下
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>所属</InputLabel>
                <Select 
                  value={staffData.affiliation}
                  onChange={(e) => setStaffData({...staffData, affiliation: e.target.value})}
                >
                  {affiliationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名"
                value={staffData.name}
                onChange={(e) => setStaffData({...staffData, name: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名（カナ）"
                value={staffData.nameKana}
                onChange={(e) => setStaffData({...staffData, nameKana: e.target.value})}
                required
                fullWidth
                placeholder="例: タナカ タロウ"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>性別</InputLabel>
                <Select 
                  value={staffData.gender}
                  onChange={(e) => setStaffData({...staffData, gender: e.target.value as 'male' | 'female'})}
                >
                  <MenuItem value="male">男性</MenuItem>
                  <MenuItem value="female">女性</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="最寄り駅"
                value={staffData.nearestStation}
                onChange={(e) => setStaffData({...staffData, nearestStation: e.target.value})}
                required
                fullWidth
                placeholder="例: 渋谷駅"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={staffData.phone}
                onChange={(e) => setStaffData({...staffData, phone: e.target.value})}
                required
                fullWidth
                placeholder="例: 090-1234-5678"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="メールアドレス"
                type="email"
                value={staffData.email}
                onChange={(e) => setStaffData({...staffData, email: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="LINE ID"
                value={staffData.lineId}
                onChange={(e) => setStaffData({...staffData, lineId: e.target.value})}
                fullWidth
                placeholder="例: user_line_id"
                helperText="API連携での通知送信に使用されます"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>役職</InputLabel>
                <Select 
                  value={staffData.position}
                  onChange={(e) => setStaffData({...staffData, position: e.target.value})}
                >
                  {positionOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="平日単価（日給）"
                type="number"
                value={staffData.weekdayRate}
                onChange={(e) => {
                  const newWeekdayRate = Number(e.target.value);
                  setStaffData({...staffData, weekdayRate: newWeekdayRate});
                  checkPriceChange(newWeekdayRate, staffData.weekendRate);
                }}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="休日単価（日給）"
                type="number"
                value={staffData.weekendRate}
                onChange={(e) => {
                  const newWeekendRate = Number(e.target.value);
                  setStaffData({...staffData, weekendRate: newWeekendRate});
                  checkPriceChange(staffData.weekdayRate, newWeekendRate);
                }}
                required
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="単価適用開始日"
                type="date"
                value={staffData.priceEffectiveDate}
                onChange={(e) => setStaffData({...staffData, priceEffectiveDate: e.target.value})}
                required
                fullWidth
                disabled={!isPriceChanged}
                inputProps={{
                  min: new Date().toISOString().split('T')[0], // 今日以降の日付のみ選択可能
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={
                  isPriceChanged 
                    ? "この日以降のシフトに新単価が適用されます（今日以降の日付のみ選択可能）"
                    : "単価を変更すると適用開始日を選択できます"
                }
                sx={{
                  '& .MuiInputBase-input:disabled': {
                    WebkitTextFillColor: isPriceChanged ? 'inherit' : 'rgba(0, 0, 0, 0.38)',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={staffData.outdoorWorkNG}
                    onChange={(e) => setStaffData({...staffData, outdoorWorkNG: e.target.checked})}
                  />
                }
                label="外現場NG"
              />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={staffData.canBeDirector}
                    onChange={(e) => setStaffData({...staffData, canBeDirector: e.target.checked})}
                  />
                }
                label="ディレクター可否"
              />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={staffData.hasOwnCar}
                    onChange={(e) => setStaffData({...staffData, hasOwnCar: e.target.checked})}
                  />
                }
                label="車所有"
              />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={staffData.businessTripAvailable}
                    onChange={(e) => setStaffData({...staffData, businessTripAvailable: e.target.checked})}
                  />
                }
                label="出張可否"
              />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="初期パスワード"
                type={showPassword ? "text" : "password"}
                value={staffData.initialPassword}
                onChange={(e) => setStaffData({...staffData, initialPassword: e.target.value})}
                required
                fullWidth
                helperText="※スタッフが初回ログイン後に変更することを推奨します"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* 獲得力評価セクション */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>獲得力評価</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                各現場特性における獲得力を0～5で評価してください。（0の場合はその特性の現場にアサインされません）
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" gutterBottom color="primary">
                  モール稼働獲得力
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  イオンモールなどの大型イベント
                </Typography>
                <Rating
                  value={staffData.mallAcquisitionPower}
                  onChange={(event, newValue) => {
                    setStaffData({...staffData, mallAcquisitionPower: (newValue || 0) as 0 | 1 | 2 | 3 | 4 | 5});
                  }}
                  max={5}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" gutterBottom color="secondary">
                  外販獲得力
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  スーパーなどの小規模イベント
                </Typography>
                <Rating
                  value={staffData.externalSalesAcquisitionPower}
                  onChange={(event, newValue) => {
                    setStaffData({...staffData, externalSalesAcquisitionPower: (newValue || 0) as 0 | 1 | 2 | 3 | 4 | 5});
                  }}
                  max={5}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" gutterBottom sx={{ color: 'success.main' }}>
                  店内獲得力
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  ソフトバンク・ワイモバイル店内
                </Typography>
                <Rating
                  value={staffData.inStoreAcquisitionPower}
                  onChange={(event, newValue) => {
                    setStaffData({...staffData, inStoreAcquisitionPower: (newValue || 0) as 0 | 1 | 2 | 3 | 4 | 5});
                  }}
                  max={5}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="評価コメント（任意）"
                value={staffData.skillNotes}
                onChange={(e) => setStaffData({...staffData, skillNotes: e.target.value})}
                multiline
                rows={2}
                fullWidth
                placeholder="例: 高い提案力とクロージング能力"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBasicDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveBasicInfo}
            variant="contained"
          >
            {editingStaff ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NG関係追加ダイアログ */}
      <Dialog 
        open={ngDialogOpen} 
        onClose={() => {
          setNgDialogOpen(false);
          setNgStaffAffiliationFilter(''); // 絞り込み状態をリセット
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>NG関係追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 所属絞り込み */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>所属で絞り込み</InputLabel>
                <Select 
                  value={ngStaffAffiliationFilter}
                  onChange={(e) => {
                    setNgStaffAffiliationFilter(e.target.value);
                    setSelectedStaffForNGAgency(''); // スタッフ選択をリセット
                  }}
                >
                  <MenuItem value="">すべて表示</MenuItem>
                  {getAffiliationOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>基準スタッフ</InputLabel>
                <Select 
                  value={selectedStaffForNGAgency}
                  onChange={(e) => setSelectedStaffForNGAgency(e.target.value)}
                >
                  {getFilteredStaff(ngStaffAffiliationFilter).map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>NGスタッフ</InputLabel>
                <Select 
                  value={selectedNGStaff}
                  onChange={(e) => setSelectedNGStaff(e.target.value)}
                >
                  {getFilteredStaff(ngStaffAffiliationFilter)
                    .filter(staff => staff.id !== selectedStaffForNGAgency)
                    .map(staff => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="NG理由"
                value={ngReason}
                onChange={(e) => setNgReason(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                placeholder="例: 過去のトラブル事例"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNgDialogOpen(false);
            setNgStaffAffiliationFilter(''); // 絞り込み状態をリセット
          }}>
            キャンセル
          </Button>
          <Button 
            onClick={handleAddNGRelation}
            variant="contained"
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* NG代理店追加ダイアログ */}
      <Dialog 
        open={ngAgencyDialogOpen} 
        onClose={() => {
          setNgAgencyDialogOpen(false);
          setNgAgencyStaffAffiliationFilter(''); // 絞り込み状態をリセット
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>NG代理店設定追加</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 所属絞り込み */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>所属で絞り込み</InputLabel>
                <Select 
                  value={ngAgencyStaffAffiliationFilter}
                  onChange={(e) => {
                    setNgAgencyStaffAffiliationFilter(e.target.value);
                    setSelectedStaffForNGAgency(''); // スタッフ選択をリセット
                  }}
                >
                  <MenuItem value="">すべて表示</MenuItem>
                  {getAffiliationOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>対象スタッフ</InputLabel>
                <Select 
                  value={selectedStaffForNGAgency}
                  onChange={(e) => {
                    setSelectedStaffForNGAgency(e.target.value);
                    setSelectedAgency('');
                    setSelectedTarget('');
                  }}
                >
                  {getFilteredStaff(ngAgencyStaffAffiliationFilter).map(staff => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>代理店</InputLabel>
                <Select 
                  value={selectedAgency}
                  onChange={(e) => {
                    setSelectedAgency(e.target.value);
                    setSelectedTarget('');
                  }}
                >
                  {agencyOptions.map(agency => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>NG種別</InputLabel>
                <Select 
                  value={selectedNGType}
                  onChange={(e) => {
                    setSelectedNGType(e.target.value as 'agency' | 'layer' | 'store');
                    setSelectedTarget('');
                  }}
                >
                  <MenuItem value="agency">代理店全体</MenuItem>
                  <MenuItem value="layer">特定レイヤー</MenuItem>
                  <MenuItem value="store">特定店舗</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {selectedNGType === 'layer' && selectedAgency && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>対象レイヤー</InputLabel>
                  <Select 
                    value={selectedTarget}
                    onChange={(e) => {
                      const value = e.target.value as string;
                      console.log('Layer selected:', value);
                      setSelectedTarget(value);
                    }}
                  >
                    {/* テスト用の固定選択肢 */}
                    <MenuItem value="test1">テスト選択肢1</MenuItem>
                    <MenuItem value="test2">テスト選択肢2</MenuItem>
                    
                    {/* 実際のレイヤーデータ */}
                    {(() => {
                      const layerGroups = getLayerOptions(selectedAgency);
                      console.log('=== DEBUG INFO ===');
                      console.log('Selected Agency:', selectedAgency);
                      console.log('Layer groups:', layerGroups);
                      console.log('Layer groups length:', layerGroups.length);
                      
                      if (layerGroups.length === 0) {
                        console.warn('No layer groups found!');
                        return <MenuItem value="no-data">データがありません</MenuItem>;
                      }
                      
                      const menuItems: React.ReactElement[] = [];
                      
                      layerGroups.forEach((layerGroup, groupIndex) => {
                        console.log(`Processing group ${groupIndex}:`, layerGroup);
                        
                        // レイヤー名（選択不可）
                        menuItems.push(
                          <MenuItem 
                            key={`header-${layerGroup.layerName}`}
                            disabled 
                            sx={{ 
                              fontWeight: 'bold', 
                              backgroundColor: '#f5f5f5',
                              '&.Mui-disabled': {
                                opacity: 1
                              }
                            }}
                          >
                            {layerGroup.layerName}
                          </MenuItem>
                        );
                        
                        // 人員（選択可能）
                        layerGroup.persons.forEach((person, personIndex) => {
                          console.log(`  Processing person ${personIndex}:`, person);
                          menuItems.push(
                            <MenuItem 
                              key={person.id} 
                              value={person.id} 
                              sx={{ 
                                pl: 4,
                                '&:hover': {
                                  backgroundColor: '#e3f2fd'
                                }
                              }}
                            >
                              {person.name}
                            </MenuItem>
                          );
                        });
                      });
                      
                      console.log('Generated menu items count:', menuItems.length);
                      console.log('==================');
                      return menuItems;
                    })()}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selectedNGType === 'store' && selectedAgency && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>対象店舗</InputLabel>
                  <Select 
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                  >
                    {getStoreOptions(selectedAgency).map(store => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="NG理由"
                value={ngAgencyReason}
                onChange={(e) => setNgAgencyReason(e.target.value)}
                required
                fullWidth
                multiline
                rows={3}
                placeholder="例: 過去のクレーム対応でトラブル"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNgAgencyDialogOpen(false);
            setNgAgencyStaffAffiliationFilter(''); // 絞り込み状態をリセット
          }}>
            キャンセル
          </Button>
          <Button 
            onClick={handleAddNGAgency}
            variant="contained"
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* NG代理店編集ダイアログ */}
      {editNGAgencyDialogOpen && (
        <Dialog 
          open={editNGAgencyDialogOpen} 
          onClose={handleCloseEditNGAgencyDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>NG代理店設定の編集</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* 所属絞り込み */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>所属で絞り込み</InputLabel>
                    <Select
                      value={editNgAgencyStaffAffiliationFilter}
                      onChange={(e) => {
                        setEditNgAgencyStaffAffiliationFilter(e.target.value);
                        handleEditNGAgencyFieldChange('staffId', ''); // スタッフ選択をリセット
                      }}
                      label="所属で絞り込み"
                    >
                      <MenuItem value="">すべて表示</MenuItem>
                      {getAffiliationOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* スタッフ選択 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>スタッフ</InputLabel>
                    <Select
                      value={editNGAgencyData.staffId || ''}
                      onChange={(e) => handleEditNGAgencyFieldChange('staffId', e.target.value)}
                      label="スタッフ"
                    >
                      {getFilteredStaff(editNgAgencyStaffAffiliationFilter).map(staff => (
                        <MenuItem key={staff.id} value={staff.id}>
                          {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 代理店選択 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>代理店</InputLabel>
                    <Select
                      value={editNGAgencyData.agencyId || ''}
                      onChange={(e) => {
                        const selectedAgency = agencyOptions.find(a => a.id === e.target.value);
                        handleEditNGAgencyFieldChange('agencyId', e.target.value);
                        handleEditNGAgencyFieldChange('agencyName', selectedAgency?.name || '');
                        // 代理店変更時は対象をリセット
                        handleEditNGAgencyFieldChange('ngTargetId', '');
                        handleEditNGAgencyFieldChange('ngTargetName', '');
                      }}
                      label="代理店"
                    >
                      {agencyOptions.map(agency => (
                        <MenuItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* NG種別選択 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>NG種別</InputLabel>
                    <Select
                      value={editNGAgencyData.ngType || ''}
                      onChange={(e) => {
                        handleEditNGAgencyFieldChange('ngType', e.target.value);
                        // NG種別変更時は対象をリセット
                        handleEditNGAgencyFieldChange('ngTargetId', '');
                        handleEditNGAgencyFieldChange('ngTargetName', '');
                      }}
                      label="NG種別"
                    >
                      <MenuItem value="agency">代理店全体</MenuItem>
                      <MenuItem value="layer">レイヤー</MenuItem>
                      <MenuItem value="store">店舗</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 対象選択 */}
                <Grid item xs={12} md={6}>
                  {editNGAgencyData.ngType === 'agency' ? (
                    <TextField
                      fullWidth
                      label="対象"
                      value="-"
                      disabled
                      helperText="代理店全体の場合は対象なし"
                    />
                  ) : editNGAgencyData.ngType === 'layer' && editNGAgencyData.agencyId ? (
                    <FormControl fullWidth>
                      <InputLabel>対象レイヤー</InputLabel>
                      <Select
                        value={editNGAgencyData.ngTargetId || ''}
                        onChange={(e) => {
                          const selectedLayerPersonName = getLayerPersonName(e.target.value as string);
                          handleEditNGAgencyFieldChange('ngTargetId', e.target.value);
                          handleEditNGAgencyFieldChange('ngTargetName', selectedLayerPersonName);
                        }}
                        label="対象レイヤー"
                        MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                      >
                        {getLayerOptions(editNGAgencyData.agencyId).map(layerGroup => (
                          <React.Fragment key={layerGroup.layerName}>
                            <MenuItem 
                              disabled 
                              sx={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#f5f5f5',
                                '&.Mui-disabled': { opacity: 1 }
                              }}
                            >
                              {layerGroup.layerName}
                            </MenuItem>
                            {layerGroup.persons.map(person => (
                              <MenuItem 
                                key={person.id} 
                                value={person.id} 
                                sx={{ 
                                  pl: 4,
                                  '&:hover': { backgroundColor: '#e3f2fd' }
                                }}
                              >
                                {person.name}
                              </MenuItem>
                            ))}
                          </React.Fragment>
                        ))}
                      </Select>
                    </FormControl>
                  ) : editNGAgencyData.ngType === 'store' && editNGAgencyData.agencyId ? (
                    <FormControl fullWidth>
                      <InputLabel>対象店舗</InputLabel>
                      <Select
                        value={editNGAgencyData.ngTargetId || ''}
                        onChange={(e) => {
                          const selectedStoreName = getStoreName(e.target.value as string);
                          handleEditNGAgencyFieldChange('ngTargetId', e.target.value);
                          handleEditNGAgencyFieldChange('ngTargetName', selectedStoreName);
                        }}
                        label="対象店舗"
                      >
                        {getStoreOptions(editNGAgencyData.agencyId).map(storeOption => (
                          <MenuItem key={storeOption.id} value={storeOption.id}>
                            {storeOption.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="対象"
                      disabled
                      helperText="代理店とNG種別を先に選択してください"
                    />
                  )}
                </Grid>

                {/* 理由 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="理由"
                    value={editNGAgencyData.reason || ''}
                    onChange={(e) => handleEditNGAgencyFieldChange('reason', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="NG設定の理由を入力してください"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditNGAgencyDialog}>
              キャンセル
            </Button>
            <Button 
              onClick={handleSaveEditNGAgency}
              variant="contained"
              disabled={!editNGAgencyData.staffId || !editNGAgencyData.agencyId || !editNGAgencyData.ngType}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* NG関係編集ダイアログ */}
      {editNGStaffDialogOpen && (
        <Dialog 
          open={editNGStaffDialogOpen} 
          onClose={handleCloseEditNGStaffDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>NG関係の編集</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* 所属絞り込み */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>所属で絞り込み</InputLabel>
                    <Select
                      value={editNGStaffAffiliationFilter}
                      onChange={(e) => {
                        setEditNGStaffAffiliationFilter(e.target.value);
                        handleEditNGStaffFieldChange('staffId', '');
                        handleEditNGStaffFieldChange('ngStaffId', '');
                      }}
                      label="所属で絞り込み"
                    >
                      <MenuItem value="">すべて表示</MenuItem>
                      {getAffiliationOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* 空のスペース */}
                </Grid>

                {/* 基準スタッフ選択 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>基準スタッフ</InputLabel>
                    <Select
                      value={editNGStaffData.staffId || ''}
                      onChange={(e) => handleEditNGStaffFieldChange('staffId', e.target.value)}
                      label="基準スタッフ"
                    >
                      {getFilteredStaff(editNGStaffAffiliationFilter).map(staff => (
                        <MenuItem key={staff.id} value={staff.id}>
                          {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* NGスタッフ選択 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>NGスタッフ</InputLabel>
                    <Select
                      value={editNGStaffData.ngStaffId || ''}
                      onChange={(e) => handleEditNGStaffFieldChange('ngStaffId', e.target.value)}
                      label="NGスタッフ"
                    >
                      {getFilteredStaff(editNGStaffAffiliationFilter)
                        .filter(staff => staff.id !== editNGStaffData.staffId)
                        .map(staff => (
                          <MenuItem key={staff.id} value={staff.id}>
                            {staff.name} ({affiliationOptions.find(opt => opt.value === staff.affiliation)?.label})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 理由 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="理由"
                    value={editNGStaffData.reason || ''}
                    onChange={(e) => handleEditNGStaffFieldChange('reason', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="NG関係の理由を入力してください"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditNGStaffDialog}>
              キャンセル
            </Button>
            <Button 
              onClick={handleSaveEditNGStaff}
              variant="contained"
              disabled={!editNGStaffData.staffId || !editNGStaffData.ngStaffId}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 画像クロップダイアログ */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={handleCropDialogClose}
        onCropComplete={handleCropComplete}
        originalImage={originalImage}
        title="プロフィール画像をクロップ"
      />
    </Box>
  );
};

export default StaffManagement;