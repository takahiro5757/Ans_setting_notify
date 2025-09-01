'use client';

import React, { useState, Fragment, useRef, useEffect, useCallback } from 'react';
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
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

// データファイルからインポート
import type {
  Contact,
  Store,
  LayerPerson,
  AgencyData,
  LocationDetail,
  EventLocationData,
} from '../../data/projectManagementData';

import {
  sampleAgencies,
  agencyOptions,
  getLayerOptions,
  getStoreOptions,
  getLayerPersonName,
  getStoreName,
  initialAgencyData,
  initialLocationData,
  weekdays,
  sampleLocations,
  getLocationsByAgency,
  getLocationById,
} from '../../data/projectManagementData';



// 削除済み: sampleAgenciesはprojectManagementData.tsからインポート
// 削除済み: sampleLocationsはprojectManagementData.tsからインポート


type SubTabValue = 'agency-info' | 'stores' | 'events' | 'layers' | 'organization';

export const ProjectManagement: React.FC = () => {
  // 上位タブ（代理店選択）の状態
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  // 下位タブの状態
  const [subTabValue, setSubTabValue] = useState<SubTabValue>('agency-info');
  const [agencies, setAgencies] = useState<AgencyData[]>(sampleAgencies);
  const [locations, setLocations] = useState<EventLocationData[]>(sampleLocations);
  
  // ダイアログ状態
  const [agencyDialogOpen, setAgencyDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [layerDialogOpen, setLayerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [editingAgency, setEditingAgency] = useState<AgencyData | null>(null);
  const [editingLocation, setEditingLocation] = useState<EventLocationData | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingLayer, setEditingLayer] = useState<'layer1' | 'layer2' | 'layer3' | 'layer4' | null>(null);
  const [editingLayerPerson, setEditingLayerPerson] = useState<LayerPerson | null>(null);
  
  // フォームデータ
  const [agencyData, setAgencyData] = useState<Omit<AgencyData, 'id'>>(initialAgencyData);
  const [locationData, setLocationData] = useState<Omit<EventLocationData, 'id'>>(initialLocationData);
  const [storeData, setStoreData] = useState<Omit<Store, 'id'>>({
    name: '',
    address: '',
    manager: '',
    phone: '',
    openingHours: '',
    estimateContacts: [],
    invoiceContacts: []
  });
  const [layerPersonData, setLayerPersonData] = useState<Omit<LayerPerson, 'id'>>({
    name: '',
    position: '',
    phone: '',
    email: '',
    assignedStores: [],
    parentLayerPersonId: undefined
  });

  // コンタクト管理用のヘルパー関数
  const addContact = (type: 'estimate' | 'invoice') => {
    const newContact: Contact = {
      id: `${type}_${Date.now()}`,
      lastName: '',
      firstName: '',
      email: '',
      type: 'to'
    };
    
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: [...(prev.estimateContacts || []), newContact]
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: [...(prev.invoiceContacts || []), newContact]
      }));
    }
  };

  const removeContact = (type: 'estimate' | 'invoice', contactId: string) => {
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: prev.estimateContacts?.filter(c => c.id !== contactId) || []
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: prev.invoiceContacts?.filter(c => c.id !== contactId) || []
      }));
    }
  };

  const updateContact = (type: 'estimate' | 'invoice', contactId: string, field: keyof Contact, value: string) => {
    if (type === 'estimate') {
      setStoreData(prev => ({
        ...prev,
        estimateContacts: prev.estimateContacts?.map(c => 
          c.id === contactId ? { ...c, [field]: value } : c
        ) || []
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        invoiceContacts: prev.invoiceContacts?.map(c => 
          c.id === contactId ? { ...c, [field]: value } : c
        ) || []
      }));
    }
  };
  
  // 場所詳細管理（複数入力フィールド対応）
  const [locationDetailInputs, setLocationDetailInputs] = useState<Array<Omit<LocationDetail, 'id'> & { tempId: string }>>([]);
  
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [selectedAgencyForManagement, setSelectedAgencyForManagement] = useState<string>('');

  // 組織図用の状態管理
  const [connections, setConnections] = useState<Array<{
    from: string;
    to: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>>([]);


  const personRefsRef = useRef<Record<string, HTMLElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 組織図用のref関数
  const setPersonRef = useCallback((personId: string) => (el: HTMLElement | null) => {
    if (el) {
      personRefsRef.current[personId] = el;
      // 接続線の再計算をトリガー
      const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
      if (selectedAgency && subTabValue === 'organization') {
        setTimeout(() => {
          calculateConnections();
        }, 100);
      }
    }
  }, [selectedAgencyId, subTabValue]);

  // 組織図最適化アルゴリズム
  const optimizeOrganizationLayout = useCallback((agencyData: AgencyData) => {
    const { layer1, layer2, layer3, layer4 } = agencyData.layers;
    
    // 1. 親子関係を分析してグループ化
    const groupByParent = <T extends { id: string; parentLayerPersonId?: string }>(
      people: T[], 
      parentLayer: { id: string }[]
    ): Record<string, T[]> => {
      const groups: Record<string, T[]> = {};
      
      // 各親のグループを初期化
      parentLayer.forEach(parent => {
        groups[parent.id] = [];
      });
      
      // 子を親のグループに分類
      people.forEach(person => {
        if (person.parentLayerPersonId && groups[person.parentLayerPersonId]) {
          groups[person.parentLayerPersonId].push(person);
        }
      });
      
      return groups;
    };

    // 2. 各レイヤーを親子関係に基づいて並び替え
    const optimizeLayer = <T extends { id: string; parentLayerPersonId?: string }>(
      people: T[], 
      parentLayer: { id: string }[]
    ): T[] => {
      const groups = groupByParent(people, parentLayer);
      const optimized: T[] = [];
      
      // 親の順序に従って子を配置
      parentLayer.forEach(parent => {
        if (groups[parent.id] && groups[parent.id].length > 0) {
          optimized.push(...groups[parent.id]);
        }
      });
      
      return optimized;
    };

    // 3. 各レイヤーを最適化
    const optimizedLayer2 = optimizeLayer(layer2, layer1);
    const optimizedLayer3 = optimizeLayer(layer3, optimizedLayer2);
    const optimizedLayer4 = optimizeLayer(layer4, optimizedLayer3);

    // デバッグ用ログ
    console.log('=== 組織図最適化結果 ===');
    console.log('元のレイヤー4:', layer4.map(p => `${p.name}(親:${p.parentLayerPersonId})`));
    console.log('最適化後レイヤー4:', optimizedLayer4.map(p => `${p.name}(親:${p.parentLayerPersonId})`));
    console.log('====================');

    return {
      layer1,
      layer2: optimizedLayer2,
      layer3: optimizedLayer3,
      layer4: optimizedLayer4
    };
  }, []);

  // 接続線計算関数（先に定義）
  const calculateConnections = useCallback(() => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency || subTabValue !== 'organization' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: typeof connections = [];

    // 組織図を最適化してレイヤーデータを取得
    const optimizedLayers = optimizeOrganizationLayout(selectedAgency);
    const layer1People = optimizedLayers.layer1;
    const layer2People = optimizedLayers.layer2;
    const layer3People = optimizedLayers.layer3;
    const layer4People = optimizedLayers.layer4;

    // 親ごとの子の数をカウント
    const parentChildrenCount: Record<string, number> = {};
    const parentChildrenIndex: Record<string, number> = {};
    
    // レイヤー2の親子関係
    layer2People.forEach(layer2Person => {
      if (layer2Person.parentLayerPersonId) {
        parentChildrenCount[layer2Person.parentLayerPersonId] = (parentChildrenCount[layer2Person.parentLayerPersonId] || 0) + 1;
      }
    });

    // レイヤー3の親子関係
    layer3People.forEach(layer3Person => {
      if (layer3Person.parentLayerPersonId) {
        parentChildrenCount[layer3Person.parentLayerPersonId] = (parentChildrenCount[layer3Person.parentLayerPersonId] || 0) + 1;
      }
    });

    // レイヤー4の親子関係
    layer4People.forEach(layer4Person => {
      if (layer4Person.parentLayerPersonId) {
        parentChildrenCount[layer4Person.parentLayerPersonId] = (parentChildrenCount[layer4Person.parentLayerPersonId] || 0) + 1;
      }
    });

    // 接続線を計算
    [layer2People, layer3People, layer4People].forEach((layerPeople) => {
      layerPeople.forEach((person) => {
        if (person.parentLayerPersonId) {
          const fromElement = personRefsRef.current[person.parentLayerPersonId];
          const toElement = personRefsRef.current[person.id];

          if (fromElement && toElement) {
            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();

            // 親の子インデックスを計算
            if (!parentChildrenIndex[person.parentLayerPersonId]) {
              parentChildrenIndex[person.parentLayerPersonId] = 0;
            }
            const childIndex = parentChildrenIndex[person.parentLayerPersonId];
            const totalChildren = parentChildrenCount[person.parentLayerPersonId] || 1;
            parentChildrenIndex[person.parentLayerPersonId]++;

            // 親の接続点の水平オフセットを計算
            const parentOffsetX = totalChildren > 1 
              ? (childIndex - (totalChildren - 1) / 2) * 10
              : 0;

            // SVGのオフセット(-20px)を考慮した座標計算
            const fromX = fromRect.left - containerRect.left + fromRect.width / 2 + parentOffsetX + 20;
            const fromY = fromRect.bottom - containerRect.top + 20; // カードの下端
            const toX = toRect.left - containerRect.left + toRect.width / 2 + 20;
            const toY = toRect.top - containerRect.top + 20; // カードの上端

            // デバッグ用ログ
            console.log(`接続線: ${person.parentLayerPersonId} → ${person.id}`);
            console.log(`  親カード: left=${fromRect.left}, width=${fromRect.width}, bottom=${fromRect.bottom}`);
            console.log(`  子カード: left=${toRect.left}, width=${toRect.width}, top=${toRect.top}`);
            console.log(`  計算座標: from(${fromX}, ${fromY}) → to(${toX}, ${toY})`);

            newConnections.push({
              from: person.parentLayerPersonId,
              to: person.id,
              fromX,
              fromY,
              toX,
              toY
            });
          }
        }
      });
    });

    setConnections(newConnections);
  }, [selectedAgencyId, subTabValue, agencies, optimizeOrganizationLayout]);



  // タブ切り替え時にrefsをリセット
  useEffect(() => {
    personRefsRef.current = {};
    setConnections([]);
  }, [selectedAgencyId, subTabValue]);

  // ヘルパー関数
  const getAgencyName = (agencyId: string): string => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.companyName : '不明な代理店';
  };

  const processLocationDetails = () => {
    // 既存の場所詳細を保持
    const existingDetails = locationData.locationDetailList || [];
    
    // 新規追加の場所詳細を処理
    const newDetails = locationDetailInputs.map((input, index) => ({
      id: `detail_${Date.now()}_${index}`,
      name: input.name.trim(),
    }));
    
    // 既存 + 新規を結合して返す
    return [...existingDetails, ...newDetails];
  };

  // 保存ハンドラー
  const handleSaveAgency = () => {
    if (editingAgency) {
      setAgencies(prev => prev.map(agency => 
        agency.id === editingAgency.id ? { ...agency, ...agencyData } : agency
      ));
      setSaveMessage('代理店情報を更新しました');
    } else {
      const newAgency: AgencyData = {
        id: Date.now().toString(),
        ...agencyData,
      };
      setAgencies(prev => [...prev, newAgency]);
      // 新規追加した代理店を自動選択
      setSelectedAgencyId(newAgency.id);
      setSubTabValue('agency-info');
      setSaveMessage('新しい代理店を追加しました');
    }
    
    setAgencyDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteAgency = () => {
    if (!editingAgency) return;
    
    // 関連データの計算
    const storeCount = editingAgency.stores.length;
    const personnelCount = Object.values(editingAgency.layers).flat().length;
    const relatedLocations = locations.filter(loc => loc.agencyId === editingAgency.id);
    
    // 代理店を削除
    setAgencies(prev => prev.filter(agency => agency.id !== editingAgency.id));
    
    // 関連するイベント場所も削除
    setLocations(prev => prev.filter(loc => loc.agencyId !== editingAgency.id));
    
    // 削除した代理店が選択されていた場合、選択を解除
    if (selectedAgencyId === editingAgency.id) {
      setSelectedAgencyId(null);
      setSubTabValue('agency-info');
    }
    
    setDeleteDialogOpen(false);
    setEditingAgency(null);
    setSaveMessage(`代理店「${editingAgency.companyName}」を削除しました（店舗${storeCount}件、人員${personnelCount}名、イベント場所${relatedLocations.length}件を含む）`);
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const handleSaveStore = () => {
    if (!selectedAgencyId) return;
    if (!storeData.name.trim() || !storeData.address.trim() || !storeData.phone.trim()) {
      alert('店舗名、住所、電話番号は必須項目です');
      return;
    }

    if (editingStore) {
      setAgencies(prev => prev.map(agency => 
        agency.id === selectedAgencyId
          ? {
              ...agency,
              stores: agency.stores.map(store => 
                store.id === editingStore.id ? { ...store, ...storeData } : store
              )
            }
          : agency
      ));
      setSaveMessage('店舗情報を更新しました');
    } else {
      const newStore: Store = {
        id: `store_${Date.now()}`,
        ...storeData,
      };
      setAgencies(prev => prev.map(agency => 
        agency.id === selectedAgencyId
          ? { ...agency, stores: [...agency.stores, newStore] }
          : agency
      ));
      setSaveMessage('新しい店舗を追加しました');
    }
    
    setStoreDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveLocation = () => {
    // 場所詳細を処理
    const finalLocationDetailList = processLocationDetails();
    const finalLocationData = {
      ...locationData,
      locationDetailList: finalLocationDetailList,
    };

    if (editingLocation) {
      setLocations(prev => prev.map(location => 
        location.id === editingLocation.id ? { ...location, ...finalLocationData } : location
      ));
      setSaveMessage('イベント場所情報を更新しました');
    } else {
      const newLocation: EventLocationData = {
        id: Date.now().toString(),
        ...finalLocationData,
      };
      setLocations(prev => [...prev, newLocation]);
      setSaveMessage('新しいイベント場所を追加しました');
    }
    
    // フォームをリセット
    setLocationDetailInputs([]);
    setLocationDialogOpen(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleEditLocation = (location: EventLocationData) => {
    setEditingLocation(location);
    setLocationData({
      agencyId: location.agencyId,
      address: location.address,
      locationName: location.locationName,
      locationDetails: location.locationDetails,
      nearestStation: location.nearestStation || '',
      locationDetailList: location.locationDetailList || [],
      pricing: location.pricing,
    });
    
    // 編集時は既存データはlocationDetailListで管理し、locationDetailInputsは空にする
    setLocationDetailInputs([]);
    
    setLocationDialogOpen(true);
  };

  // イベント場所詳細管理用ヘルパー関数
  const handleAddLocationDetailInput = () => {
    const newInput = {
      tempId: `temp_${Date.now()}`,
      name: '',
    };
    setLocationDetailInputs(prev => [...prev, newInput]);
  };

  const handleRemoveLocationDetailInput = (tempId: string) => {
    setLocationDetailInputs(prev => prev.filter(input => input.tempId !== tempId));
  };

  const handleLocationDetailInputChange = (tempId: string, field: keyof Omit<LocationDetail, 'id'>, value: string) => {
    setLocationDetailInputs(prev => 
      prev.map(input => 
        input.tempId === tempId ? { ...input, [field]: value } : input
      )
    );
  };

  const handleRemoveExistingLocationDetail = (detailId: string) => {
    setLocationData(prev => ({
      ...prev,
      locationDetailList: prev.locationDetailList?.filter(detail => detail.id !== detailId) || []
    }));
  };

  // 特定の人がどのレイヤーに所属しているかを見つける関数
  const findPersonLayer = (agency: AgencyData, personId: string): string | null => {
    const layers = ['layer1', 'layer2', 'layer3', 'layer4'] as const;
    for (const layerKey of layers) {
      const found = agency.layers[layerKey].find(person => person.id === personId);
      if (found) {
        return layerKey;
      }
    }
    return null;
  };

  // レイヤー人員保存ハンドラー
  const handleSaveLayerPerson = () => {
    if (!selectedAgencyId || !editingLayer) return;
    if (!layerPersonData.name.trim() || !layerPersonData.position.trim() || !layerPersonData.phone.trim()) {
      alert('名前、役職、電話番号は必須項目です');
      return;
    }

    const newPerson: LayerPerson = {
      id: editingLayerPerson?.id || `L${editingLayer.slice(-1)}-${Date.now()}`,
      name: layerPersonData.name.trim(),
      position: layerPersonData.position.trim(),
      phone: layerPersonData.phone.trim(),
      email: layerPersonData.email?.trim() || undefined,
      assignedStores: layerPersonData.assignedStores,
      parentLayerPersonId: layerPersonData.parentLayerPersonId
    };

    setAgencies(prev => prev.map(agency => 
      agency.id === selectedAgencyId
        ? {
            ...agency,
            layers: {
              ...agency.layers,
              [editingLayer]: editingLayerPerson
                ? agency.layers[editingLayer].map(person => 
                    person.id === editingLayerPerson.id ? newPerson : person
                  )
                : [...agency.layers[editingLayer], newPerson]
            }
          }
        : agency
    ));

    setSaveMessage(editingLayerPerson ? 'レイヤー人員を更新しました' : 'レイヤー人員を追加しました');
    setLayerDialogOpen(false);
    setEditingLayerPerson(null);
    setEditingLayer(null);
    setLayerPersonData({
      name: '',
      position: '',
      phone: '',
      email: '',
      assignedStores: [],
      parentLayerPersonId: undefined
    });
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const renderAgencyInfo = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="代理店基本情報"
          subheader="代理店の基本情報の確認・編集"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setAgencyData({
                    companyName: selectedAgency.companyName,
                    address: selectedAgency.address || '',
                    stores: selectedAgency.stores,
                    layers: selectedAgency.layers
                  });
                  setEditingAgency(selectedAgency);
                  setAgencyDialogOpen(true);
                }}
              >
                編集
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setEditingAgency(selectedAgency);
                  setDeleteDialogOpen(true);
                }}
              >
                削除
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                代理店名
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedAgency.companyName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary.main">
                代理店住所
              </Typography>
              <Typography variant="body1">
                {selectedAgency.address || '住所が登録されていません'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderStoreManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="店舗マスタ"
          subheader="代理店店舗の登録・管理"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingStore(null);
                  setStoreData({
                    name: '',
                    address: '',
                    manager: '',
                    phone: '',
                    openingHours: ''
                  });
                  setStoreDialogOpen(true);
                }}
              >
                店舗追加
              </Button>
            </Box>
          }
        />
        <CardContent>
          {selectedAgency.stores.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              この代理店にはまだ店舗が登録されていません
            </Typography>
          ) : (
            selectedAgency.stores.map((store) => (
              <Accordion key={store.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <StoreIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {store.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStore(store);
                          setStoreData({
                            name: store.name,
                            address: store.address,
                            manager: store.manager,
                            phone: store.phone,
                            openingHours: store.openingHours,
                            estimateContacts: store.estimateContacts || [],
                            invoiceContacts: store.invoiceContacts || []
                          });
                          setStoreDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('この店舗を削除しますか？')) {
                            setAgencies(prev => prev.map(agency => 
                              agency.id === selectedAgencyId
                                ? {
                                    ...agency,
                                    stores: agency.stores.filter(s => s.id !== store.id)
                                  }
                                : agency
                            ));
                            setSaveMessage('店舗を削除しました');
                            setTimeout(() => setSaveMessage(''), 3000);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>基本情報</Typography>
                      <Typography variant="body2"><strong>住所:</strong> {store.address}</Typography>
                      <Typography variant="body2"><strong>電話番号:</strong> {store.phone}</Typography>
                      <Typography variant="body2"><strong>営業時間:</strong> {store.openingHours}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>店舗責任者</Typography>
                      {(() => {
                        const manager = selectedAgency.layers.layer4?.find(person => 
                          person.assignedStores.includes(store.id)
                        );
                        return manager ? (
                          <>
                            <Typography variant="body2"><strong>責任者:</strong> {manager.name}</Typography>
                            <Typography variant="body2"><strong>役職:</strong> {manager.position}</Typography>
                            <Typography variant="body2"><strong>電話:</strong> {manager.phone}</Typography>
                            {manager.email && (
                              <Typography variant="body2"><strong>メール:</strong> {manager.email}</Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">責任者が設定されていません</Typography>
                        );
                      })()}
                    </Grid>
                    
                    {/* 見積送付先情報 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>見積送付先</Typography>
                      {store.estimateContacts && store.estimateContacts.length > 0 ? (
                        store.estimateContacts.map((contact, index) => (
                          <Box key={contact.id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{contact.type.toUpperCase()}:</strong> {contact.lastName} {contact.firstName}
                            </Typography>
                            {contact.email && (
                              <Typography variant="body2" sx={{ ml: 2 }}>📧 {contact.email}</Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">見積送付先が設定されていません</Typography>
                      )}
                    </Grid>

                    {/* 請求送付先情報 */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>請求送付先</Typography>
                      {store.invoiceContacts && store.invoiceContacts.length > 0 ? (
                        store.invoiceContacts.map((contact, index) => (
                          <Box key={contact.id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{contact.type.toUpperCase()}:</strong> {contact.lastName} {contact.firstName}
                            </Typography>
                            {contact.email && (
                              <Typography variant="body2" sx={{ ml: 2 }}>📧 {contact.email}</Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">請求送付先が設定されていません</Typography>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEventManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    const agencyEvents = locations.filter(loc => loc.agencyId === selectedAgencyId);
    const dayLabels: Record<string, string> = {
      tuesday: '火曜日',
      wednesday: '水曜日', 
      thursday: '木曜日',
      friday: '金曜日',
      saturday: '土曜日',
      sunday: '日曜日',
      monday: '月曜日',
    };

    return (
      <Card>
        <CardHeader 
          title="イベントマスタ"
          subheader="イベント場所・料金設定管理"
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingLocation(null);
                  setLocationData({
                    ...initialLocationData,
                    agencyId: selectedAgencyId || '',
                  });
                  setLocationDetailInputs([]);
                  setLocationDialogOpen(true);
                }}
              >
                場所追加
              </Button>
            </Box>
          }
        />
        <CardContent>
          {agencyEvents.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              この代理店にはまだイベント場所が登録されていません
            </Typography>
          ) : (
            agencyEvents.map((location) => (
              <Accordion key={location.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {location.locationName}
                      </Typography>
                      {location.nearestStation && (
                        <Typography variant="body2" color="text.secondary">
                          最寄駅: {location.nearestStation}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLocation(location);
                      }}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('このイベント場所を削除しますか？')) {
                          setLocations(prev => prev.filter(l => l.id !== location.id));
                          setSaveMessage('イベント場所を削除しました');
                          setTimeout(() => setSaveMessage(''), 3000);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>基本情報</Typography>
                      <Typography variant="body2"><strong>住所:</strong> {location.address}</Typography>
                      <Typography variant="body2"><strong>場所名:</strong> {location.locationName}</Typography>
                      {location.nearestStation && (
                        <Typography variant="body2"><strong>最寄駅:</strong> {location.nearestStation}</Typography>
                      )}
                      <Typography variant="body2"><strong>詳細:</strong> {location.locationDetails}</Typography>
                
                      
                      {/* 場所詳細リスト */}
                      {location.locationDetailList && location.locationDetailList.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>場所詳細一覧</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {location.locationDetailList.map((detail) => (
                              <Chip key={detail.id} label={detail.name} size="small" color="primary" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>料金設定</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>曜日</TableCell>
                              <TableCell align="right">クローザー</TableCell>
                              <TableCell align="right">ガール</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(location.pricing || {}).map(([day, pricing]) => (
                              <TableRow key={day}>
                                <TableCell>{dayLabels[day]}</TableCell>
                                <TableCell align="right">¥{pricing.closer.toLocaleString()}</TableCell>
                                <TableCell align="right">¥{pricing.girl.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLayerManagement = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    return (
      <Card>
        <CardHeader 
          title="レイヤー管理"
          subheader={`${selectedAgency.companyName} の階層管理`}
        />
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            組織階層情報
          </Typography>
          {Object.entries(selectedAgency.layers).map(([layerKey, persons]) => (
            <Box key={layerKey} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {layerKey.replace('layer', 'レイヤー')}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingLayerPerson(null);
                    setEditingLayer(layerKey as 'layer1' | 'layer2' | 'layer3' | 'layer4');
                    // レイヤーに応じて上長の初期値を設定
                    const initialParentId = layerKey === 'layer1' ? undefined : '';
                    setLayerPersonData({
                      name: '',
                      position: '',
                      phone: '',
                      email: '',
                      assignedStores: [],
                      parentLayerPersonId: initialParentId
                    });
                    setLayerDialogOpen(true);
                  }}
                >
                  追加
                </Button>
              </Box>
              {persons.map((person) => (
                <Accordion key={person.id} sx={{ mb: 1, ml: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {person.name} ({person.position})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLayerPerson(person);
                            setEditingLayer(layerKey as 'layer1' | 'layer2' | 'layer3' | 'layer4');
                            setLayerPersonData({
                              name: person.name,
                              position: person.position,
                              phone: person.phone,
                              email: person.email || '',
                              assignedStores: person.assignedStores,
                              parentLayerPersonId: person.parentLayerPersonId
                            });
                            setLayerDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('この人員を削除しますか？')) {
                              setAgencies(prev => prev.map(agency => 
                                agency.id === selectedAgencyId
                                  ? {
                                      ...agency,
                                      layers: {
                                        ...agency.layers,
                                        [layerKey]: agency.layers[layerKey as keyof typeof agency.layers].filter(p => p.id !== person.id)
                                      }
                                    }
                                  : agency
                              ));
                              setSaveMessage('人員を削除しました');
                              setTimeout(() => setSaveMessage(''), 3000);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>電話:</strong> {person.phone}</Typography>
                        {person.email && (
                          <Typography variant="body2"><strong>メール:</strong> {person.email}</Typography>
                        )}
                        {/* 上長情報表示 */}
                        {person.parentLayerPersonId && (
                          <Typography variant="body2"><strong>上長:</strong> {(() => {
                            // 上長を検索
                            const parentPerson = Object.values(selectedAgency.layers).flat().find(p => p.id === person.parentLayerPersonId);
                            if (parentPerson) {
                              // 上長のレイヤーを取得
                              const parentLayer = findPersonLayer(selectedAgency, parentPerson.id);
                              const layerDisplay = parentLayer ? parentLayer.replace('layer', 'レイヤー') : '';
                              return `${parentPerson.name} (${parentPerson.position}) [${layerDisplay}]`;
                            }
                            return '不明';
                          })()}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>担当店舗数:</strong> {person.assignedStores.length}店舗</Typography>
                        {person.assignedStores.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              担当店舗: {person.assignedStores.map(storeId => {
                                const store = selectedAgency.stores.find(s => s.id === storeId);
                                return store ? store.name : storeId;
                              }).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              {persons.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  未登録
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderOrganizationChart = () => {
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    if (!selectedAgency) return null;

    // 人員カードを描画
    const renderPersonCard = (person: LayerPerson, level: number) => (
      <Paper
        ref={setPersonRef(person.id)}
        sx={{
          p: 1,
          width: 100,
          minHeight: 60,
          border: '2px solid',
          borderColor:
            level === 0 ? 'primary.main' :
            level === 1 ? 'secondary.main' :
            level === 2 ? 'warning.main' : 'success.main',
          borderRadius: 2,
          bgcolor: level === 0 ? 'primary.light' : 'background.paper',
          color: level === 0 ? 'white' : 'inherit',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {person.name}
        </Typography>
        <Typography variant="caption" color={level === 0 ? 'inherit' : 'text.secondary'} sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
          {person.position}
        </Typography>
      </Paper>
    );

    // 店舗カードを描画
    const renderStoreCard = (store: Store) => (
      <Paper sx={{ 
        p: 1, 
        width: 80,
        textAlign: 'center', 
        bgcolor: 'grey.100', 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 1,
        position: 'relative',
        zIndex: 2
      }}>
        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
          {store.name}
        </Typography>
      </Paper>
    );

    // 組織図を最適化
    const optimizedLayers = optimizeOrganizationLayout(selectedAgency);
    
    // 各レイヤーのデータを取得（最適化済み）
    const layer1People = optimizedLayers.layer1;
    const layer2People = optimizedLayers.layer2;
    const layer3People = optimizedLayers.layer3;
    const layer4People = optimizedLayers.layer4;



    return (
      <Card>
        <CardHeader 
          title="組織図"
          subheader={`${selectedAgency.companyName} の組織構造`}
        />
        <CardContent>
          <Box sx={{ overflowX: 'auto', py: 3, px: 3 }}>
            <Box 
              ref={containerRef}
              sx={{ 
                position: 'relative', 
                textAlign: 'center', 
                minHeight: '700px',
                minWidth: '2000px',
                overflow: 'visible',
                px: 6
              }}
            >
              {/* SVG接続線 */}
              <svg 
                style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  left: '-20px', 
                  width: 'calc(100% + 40px)', 
                  height: 'calc(100% + 40px)', 
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                {/* 分岐型接続線を描画 */}
                {(() => {
                  // 親ごとに子をグループ化
                  const parentGroups: Record<string, typeof connections> = {};
                  connections.forEach(conn => {
                    if (!parentGroups[conn.from]) {
                      parentGroups[conn.from] = [];
                    }
                    parentGroups[conn.from].push(conn);
                  });

                  return Object.entries(parentGroups).map(([parentId, childConnections]) => {
                    if (childConnections.length === 0) return null;

                    // 親の位置
                    const parentConn = childConnections[0];
                    const parentX = parentConn.fromX;
                    const parentY = parentConn.fromY;

                    // 子たちの中央位置を計算
                    const childYPositions = childConnections.map(conn => conn.toY);
                    const minChildY = Math.min(...childYPositions);
                    const maxChildY = Math.max(...childYPositions);
                    
                    // 分岐点の位置（親と子の中間、かつ子たちの中央）
                    const branchY = parentY + (minChildY - parentY) * 0.5;

                    // 子のX座標を取得して範囲を計算
                    const childXPositions = childConnections.map(conn => conn.toX);
                    const leftmostChildX = Math.min(...childXPositions);
                    const rightmostChildX = Math.max(...childXPositions);

                    return (
                      <g key={`parent-${parentId}`}>
                        {/* 親から分岐点への垂直線 */}
                        <path
                          d={`M ${parentX} ${parentY} L ${parentX} ${branchY}`}
                          stroke="#1976d2"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.8"
                        />
                        
                        {/* 水平分岐線（親のX位置から子たちの範囲まで） */}
                        <path
                          d={`M ${leftmostChildX} ${branchY} L ${rightmostChildX} ${branchY}`}
                          stroke="#1976d2"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.8"
                        />

                        {/* 親から水平線への接続（親が子の範囲外にいる場合） */}
                        {(parentX < leftmostChildX || parentX > rightmostChildX) && (
                          <path
                            d={`M ${parentX} ${branchY} L ${parentX < leftmostChildX ? leftmostChildX : rightmostChildX} ${branchY}`}
                            stroke="#1976d2"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.8"
                          />
                        )}

                        {/* 各子への垂直接続線 */}
                        {childConnections.map((conn, index) => (
                          <g key={`${conn.from}-${conn.to}-${index}`}>
                            {/* 水平分岐線から子への垂直線 */}
                            <path
                              d={`M ${conn.toX} ${branchY} L ${conn.toX} ${conn.toY}`}
                              stroke="#1976d2"
                              strokeWidth="2.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.8"
                            />
                            {/* 子の接続点 */}
                            <circle 
                              cx={conn.toX} 
                              cy={conn.toY} 
                              r="3" 
                              fill="#42a5f5" 
                              opacity="0.9"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}

                        {/* 親の接続点 */}
                        <circle 
                          cx={parentX} 
                          cy={parentY} 
                          r="4" 
                          fill="#1976d2" 
                          opacity="0.9"
                          stroke="white"
                          strokeWidth="2"
                        />

                        {/* 分岐点のマーカー */}
                        <circle 
                          cx={parentX} 
                          cy={branchY} 
                          r="2" 
                          fill="#1976d2" 
                          opacity="0.7"
                        />
                      </g>
                    );
                  });
                })()}
              </svg>

              {/* レイヤー1 */}
              {layer1People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {layer1People.map(person => {
                      const subordinates = layer2People.filter(l2 => l2.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 150;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 0)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー2 */}
              {layer2People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {layer2People.map(person => {
                      const subordinates = layer3People.filter(l3 => l3.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 120;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 1)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー3 */}
              {layer3People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {layer3People.map(person => {
                      const subordinates = layer4People.filter(l4 => l4.parentLayerPersonId === person.id);
                      const subordinateCount = subordinates.length;
                      const groupWidth = subordinateCount * 120;
                      
                      return (
                        <Box 
                          key={person.id}
                          sx={{ 
                            width: `${groupWidth}px`,
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {renderPersonCard(person, 2)}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* レイヤー4と店舗を一体で配置 */}
              {layer4People.length > 0 && (
                <Box sx={{ mb: 5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {layer4People.map(person => {
                      const personStores = selectedAgency.stores.filter(store => 
                        person.assignedStores.includes(store.id)
                      );
                      
                      return (
                        <Box key={person.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          {renderPersonCard(person, 3)}
                          {personStores.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {personStores.map(store => (
                                <Box key={store.id}>
                                  {renderStoreCard(store)}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}


            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <CampaignIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        代理店・イベント管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* 2段階タブナビゲーション */}
      {/* 上位タブ: 代理店選択 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            代理店選択
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setAgencyData({
                companyName: '',
                address: '',
                stores: [],
                layers: {
                  layer1: [],
                  layer2: [],
                  layer3: [],
                  layer4: []
                }
              });
              setEditingAgency(null);
              setAgencyDialogOpen(true);
            }}
            size="small"
          >
            代理店追加
          </Button>
        </Box>
        <Tabs 
          value={selectedAgencyId || false} 
          onChange={(e, newValue) => {
            setSelectedAgencyId(newValue);
            setSubTabValue('agency-info');
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {agencies.map((agency) => (
            <Tab 
              key={agency.id}
              value={agency.id}
              label={agency.companyName}
              icon={<BusinessIcon />} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* 下位タブ: 機能選択 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: -1 }}>
        <Tabs 
          value={subTabValue} 
          onChange={(e, newValue) => setSubTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              opacity: selectedAgencyId ? 1 : 0.5,
              pointerEvents: selectedAgencyId ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }
          }}
        >
          <Tab 
            value="agency-info"
            label="代理店基本情報" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="stores"
            label="店舗マスタ" 
            icon={<StoreIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="events"
            label="イベントマスタ" 
            icon={<CampaignIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="layers"
            label="レイヤー管理" 
            icon={<PeopleIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="organization"
            label="組織図" 
            icon={<AccountTreeIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 代理店未選択時のメッセージ */}
      {!selectedAgencyId && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              代理店を選択してください
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上部のタブから管理したい代理店を選択すると、該当代理店の情報が表示されます。
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 選択された代理店の情報表示 */}
      {selectedAgencyId && (
        <>
          {/* 下位タブコンテンツ */}
          {subTabValue === 'agency-info' && renderAgencyInfo()}
          {subTabValue === 'stores' && renderStoreManagement()}
          {subTabValue === 'events' && renderEventManagement()}
          {subTabValue === 'layers' && renderLayerManagement()}
          {subTabValue === 'organization' && renderOrganizationChart()}
        </>
      )}

      {/* 店舗編集ダイアログ */}
      <Dialog open={storeDialogOpen} onClose={() => setStoreDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingStore ? '店舗情報編集' : '新しい店舗追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 基本情報 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="店舗名"
                value={storeData.name}
                onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={storeData.phone}
                onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="住所"
                value={storeData.address}
                onChange={(e) => setStoreData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="責任者"
                value={storeData.manager}
                onChange={(e) => setStoreData(prev => ({ ...prev, manager: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="営業時間"
                value={storeData.openingHours}
                onChange={(e) => setStoreData(prev => ({ ...prev, openingHours: e.target.value }))}
                placeholder="例: 10:00-20:00"
              />
            </Grid>

            {/* 見積送付先情報 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 1 }}>
                  見積送付先情報
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => addContact('estimate')}
                  size="small"
                >
                  追加
                </Button>
              </Box>
            </Grid>
            
            {(storeData.estimateContacts || []).map((contact, index) => (
              <Grid item xs={12} key={contact.id}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={contact.type}
                          onChange={(e) => updateContact('estimate', contact.id, 'type', e.target.value as 'to' | 'cc')}
                        >
                          <MenuItem value="to">To</MenuItem>
                          <MenuItem value="cc">Cc</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="姓"
                        value={contact.lastName}
                        onChange={(e) => updateContact('estimate', contact.id, 'lastName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="名"
                        value={contact.firstName}
                        onChange={(e) => updateContact('estimate', contact.id, 'firstName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="メールアドレス"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact('estimate', contact.id, 'email', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeContact('estimate', contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* 請求送付先情報 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', flexGrow: 1 }}>
                  請求送付先情報
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={() => addContact('invoice')}
                  size="small"
                >
                  追加
                </Button>
              </Box>
            </Grid>
            
            {(storeData.invoiceContacts || []).map((contact, index) => (
              <Grid item xs={12} key={contact.id}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={contact.type}
                          onChange={(e) => updateContact('invoice', contact.id, 'type', e.target.value as 'to' | 'cc')}
                        >
                          <MenuItem value="to">To</MenuItem>
                          <MenuItem value="cc">Cc</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="姓"
                        value={contact.lastName}
                        onChange={(e) => updateContact('invoice', contact.id, 'lastName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="名"
                        value={contact.firstName}
                        onChange={(e) => updateContact('invoice', contact.id, 'firstName', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="メールアドレス"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact('invoice', contact.id, 'email', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeContact('invoice', contact.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoreDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveStore} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      {/* イベント場所編集ダイアログ */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingLocation ? 'イベント場所編集' : 'イベント場所追加'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>代理店</InputLabel>
                <Select
                  value={locationData.agencyId}
                  onChange={(e) => setLocationData({...locationData, agencyId: e.target.value})}
                >
                  {agencies.map(agency => (
                    <MenuItem key={agency.id} value={agency.id}>
                      {agency.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="イベント実施場所"
                value={locationData.locationName}
                onChange={(e) => setLocationData({...locationData, locationName: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="住所"
                value={locationData.address}
                onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="最寄駅"
                value={locationData.nearestStation || ''}
                onChange={(e) => setLocationData({...locationData, nearestStation: e.target.value})}
                fullWidth
              />
            </Grid>

            {/* 場所詳細管理セクション */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    場所詳細管理
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    このイベント場所に紐づく詳細な場所情報を登録できます
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddLocationDetailInput}
                  size="small"
                >
                  詳細追加
                </Button>
              </Box>
            </Grid>
            
            {/* 場所詳細一覧 */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>場所詳細一覧</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>場所詳細名</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 既存の場所詳細（読み取り専用） */}
                    {locationData.locationDetailList && locationData.locationDetailList.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          <Typography variant="body2">{detail.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingLocationDetail(detail.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* 新規追加フィールド（編集可能） */}
                    {locationDetailInputs.map((input, index) => (
                      <TableRow key={input.tempId} sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          <TextField
                            value={input.name}
                            onChange={(e) => handleLocationDetailInputChange(input.tempId, 'name', e.target.value)}
                            placeholder="場所詳細名を入力"
                            size="small"
                            fullWidth
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveLocationDetailInput(input.tempId)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* 場所詳細がない場合 */}
                    {(!locationData.locationDetailList || locationData.locationDetailList.length === 0) && 
                     locationDetailInputs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            場所詳細が登録されていません。「詳細追加」ボタンで追加してください。
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                曜日別請求単価設定
              </Typography>
            </Grid>
            
            {weekdays.map((day) => (
              <Fragment key={day.key}>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    {day.label}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="クローザー請求単価"
                    type="number"
                    value={locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.closer || 0}
                    onChange={(e) => {
                      const newPricing = {
                        tuesday: { closer: 0, girl: 0 },
                        wednesday: { closer: 0, girl: 0 },
                        thursday: { closer: 0, girl: 0 },
                        friday: { closer: 0, girl: 0 },
                        saturday: { closer: 0, girl: 0 },
                        sunday: { closer: 0, girl: 0 },
                        monday: { closer: 0, girl: 0 },
                        ...locationData.pricing,
                        [day.key]: {
                          closer: Number(e.target.value),
                          girl: locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.girl || 0
                        }
                      };
                      setLocationData({
                        ...locationData,
                        pricing: newPricing
                      });
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/ 日</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="ガール請求単価"
                    type="number"
                    value={locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.girl || 0}
                    onChange={(e) => {
                      const newPricing = {
                        tuesday: { closer: 0, girl: 0 },
                        wednesday: { closer: 0, girl: 0 },
                        thursday: { closer: 0, girl: 0 },
                        friday: { closer: 0, girl: 0 },
                        saturday: { closer: 0, girl: 0 },
                        sunday: { closer: 0, girl: 0 },
                        monday: { closer: 0, girl: 0 },
                        ...locationData.pricing,
                        [day.key]: {
                          closer: locationData.pricing?.[day.key as keyof typeof locationData.pricing]?.closer || 0,
                          girl: Number(e.target.value)
                        }
                      };
                      setLocationData({
                        ...locationData,
                        pricing: newPricing
                      });
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/ 日</InputAdornment>,
                    }}
                  />
                </Grid>
              </Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveLocation} variant="contained">
            {editingLocation ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* レイヤー人員管理ダイアログ */}
      <Dialog open={layerDialogOpen} onClose={() => setLayerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLayerPerson ? 'レイヤー人員編集' : 'レイヤー人員追加'}
          {editingLayer && ` - ${editingLayer.replace('layer', 'レイヤー')}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="名前"
                value={layerPersonData.name}
                onChange={(e) => setLayerPersonData({...layerPersonData, name: e.target.value})}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="役職"
                value={layerPersonData.position}
                onChange={(e) => setLayerPersonData({...layerPersonData, position: e.target.value})}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={layerPersonData.phone}
                onChange={(e) => setLayerPersonData({...layerPersonData, phone: e.target.value})}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="メールアドレス"
                value={layerPersonData.email}
                onChange={(e) => setLayerPersonData({...layerPersonData, email: e.target.value})}
                fullWidth
                type="email"
              />
            </Grid>

            {/* 上長選択（レイヤー1以外は必須） */}
            {editingLayer && editingLayer !== 'layer1' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>上長選択</InputLabel>
                  <Select
                    value={layerPersonData.parentLayerPersonId || ''}
                    label="上長選択"
                    onChange={(e) => {
                      const parentId = e.target.value || undefined;
                      setLayerPersonData({
                        ...layerPersonData, 
                        parentLayerPersonId: parentId
                      });
                    }}
                  >
                    <MenuItem value="">選択してください</MenuItem>
                    {(() => {
                      const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
                      if (!selectedAgency) return null;
                      
                      const groupedOptions: React.ReactNode[] = [];
                      
                      // 現在のレイヤーより上位のレイヤーの人員のみ表示
                      const currentLayerNum = parseInt(editingLayer.slice(-1));
                      
                      for (let i = 1; i < currentLayerNum; i++) {
                        const layerKey = `layer${i}` as keyof typeof selectedAgency.layers;
                        const layerPeople = selectedAgency.layers[layerKey];
                        
                        if (layerPeople.length > 0) {
                          groupedOptions.push(
                            <Typography key={`${layerKey}-header`} variant="subtitle2" sx={{ px: 2, py: 1, bgcolor: 'action.hover', fontWeight: 'bold' }}>
                              {layerKey.replace('layer', 'レイヤー')}
                            </Typography>
                          );
                          layerPeople.forEach(person => {
                            groupedOptions.push(
                              <MenuItem key={person.id} value={person.id} sx={{ pl: 3 }}>
                                {person.name} ({person.position})
                              </MenuItem>
                            );
                          });
                        }
                      }
                      
                      return groupedOptions;
                    })()}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {editingLayer.replace('layer', 'レイヤー')}への配属には上長の選択が必要です
                </Typography>
              </Grid>
            )}

            {/* 担当店舗選択（レイヤー4のみ） */}
            {editingLayer === 'layer4' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>担当店舗選択</Typography>
                <Box sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  p: 2, 
                  maxHeight: 300, 
                  overflowY: 'auto'
                }}>
                  {(() => {
                    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
                    if (!selectedAgency) return null;
                    
                    if (selectedAgency.stores.length === 0) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          この代理店にはまだ店舗が登録されていません
                        </Typography>
                      );
                    }
                    
                    return selectedAgency.stores.map(store => (
                      <FormControlLabel
                        key={store.id}
                        control={
                          <Checkbox
                            checked={layerPersonData.assignedStores.includes(store.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newAssignedStores = isChecked
                                ? [...layerPersonData.assignedStores, store.id]
                                : layerPersonData.assignedStores.filter(id => id !== store.id);
                              
                              setLayerPersonData({
                                ...layerPersonData,
                                assignedStores: newAssignedStores
                              });
                            }}
                          />
                        }
                        label={store.name}
                        sx={{ 
                          display: 'block', 
                          mb: 1,
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.875rem'
                          }
                        }}
                      />
                    ));
                  })()}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  担当する店舗を選択してください（複数選択可能）
                </Typography>
              </Grid>
            )}


          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLayerDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveLayerPerson} variant="contained">
            {editingLayerPerson ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代理店編集ダイアログ */}
      <Dialog open={agencyDialogOpen} onClose={() => setAgencyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAgency ? '代理店基本情報編集' : '新規代理店追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="代理店名"
                value={agencyData.companyName}
                onChange={(e) => setAgencyData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="代理店住所"
                value={agencyData.address || ''}
                onChange={(e) => setAgencyData(prev => ({ ...prev, address: e.target.value }))}
                multiline
                rows={3}
                placeholder="代理店の住所を入力してください"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgencyDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSaveAgency} variant="contained">
            {editingAgency ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代理店削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error.main">
          代理店削除の確認
        </DialogTitle>
        <DialogContent>
          {editingAgency && (
            <Box>
              <Typography variant="body1" gutterBottom>
                以下の代理店を削除しようとしています：
              </Typography>
              <Typography variant="h6" color="primary.main" gutterBottom>
                {editingAgency.companyName}
              </Typography>
              
              <Alert severity="warning" sx={{ my: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>この操作は取り消せません。</strong>
                </Typography>
                <Typography variant="body2">
                  以下の関連データも同時に削除されます：
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>店舗データ: {editingAgency.stores.length}件</li>
                  <li>人員データ: {Object.values(editingAgency.layers).flat().length}名</li>
                  <li>イベント場所: {locations.filter(loc => loc.agencyId === editingAgency.id).length}件</li>
                </Box>
              </Alert>
              
              <Typography variant="body2" color="text.secondary">
                本当にこの代理店を削除しますか？
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleDeleteAgency} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            削除実行
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
