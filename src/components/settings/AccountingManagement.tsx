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
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountBalance as AccountingIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Description as DocumentIcon,
  Visibility as PreviewIcon,
  FolderOpen as FolderIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface CompanyBasicSettings {
  companyName: string;
  companyLogo?: string;
  postalCode: string;
  address: string;
  invoiceNumber: string;
  phone?: string;
  email?: string;
  url?: string;
}

// 会社基本設定の初期データ
const initialCompanySettings: CompanyBasicSettings = {
  companyName: '株式会社ANSTEYPE',
  companyLogo: '/37db5f1f-cd78-47b1-9a49-bdbdddc1c3be.png',
  postalCode: '334-0067',
  address: '埼玉県春日部市中央1丁目2-2 7F',
  invoiceNumber: 'T－8030001135891',
  phone: '048-123-4567',
  email: 'info@ansteype.com',
  url: 'ansteype.com',
};

interface EmailTemplate {
  id: string;
  type: 'estimate_subject' | 'estimate_body' | 'invoice_subject' | 'invoice_body';
  label: string;
  content: string;
  lastUpdated: string;
}

interface AccountingRule {
  id: string;
  type: 'item_naming' | 'payment_terms' | 'tax_rate';
  label: string;
  value: string | number;
  unit?: string;
  lastUpdated: string;
}

interface DocumentSetting {
  id: string;
  type: 'file_naming' | 'number_rule' | 'item_rule' | 'payment_due' | 'mail_template' | 'save_location';
  label: string;
  content: string;
  description?: string;
  lastUpdated: string;
}

interface PaymentDueSetting {
  month: string;
  day: string;
  businessDayRule: 'before' | 'after' | 'ignore';
}

const initialTemplates: EmailTemplate[] = [
  {
    id: '1',
    type: 'estimate_subject',
    label: '見積メール件名テンプレート',
    content: '【見積書】${c_company}様_${yyyy}年${mm}月分',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    type: 'estimate_body',
    label: '見積メール本文テンプレート',
    content: '\${c_company}\${space}\${c_name,1}様\${/r}\n\${/r}\nお世話になっております。\${/r}\n\${m_company}の\${c_name,1}です。\${/r}\n\${/r}\n\${mm,-1}月分の見積書を送付いたします。\${/r}\n\${list,\${item},●}\n\${/r}\n何卒ご査収のほどよろしくお願いいたします。\n\${/r}\n\${/r}\n------------------------\${/r}\n\${m_company}\${/r}\n\${c_name,0}\${/r}\nTEL：\${m_tel}\${/r}\nEMAIL：\${u_mail}\${/r}\nURL：\${m_url}\${/r}\n------------------------',
    lastUpdated: '2024-01-15',
  },
  {
    id: '3',
    type: 'invoice_subject',
    label: '請求メール件名テンプレート',
    content: '【請求書】${c_company}様_${yyyy}年${mm}月分',
    lastUpdated: '2024-01-15',
  },
  {
    id: '4',
    type: 'invoice_body',
    label: '請求メール本文テンプレート',
    content: '\${c_company}\${space}\${c_name,1}様\${/r}\n\${/r}\nお世話になっております。\${/r}\n\${m_company}の\${c_name,1}です。\${/r}\n\${/r}\n\${mm,-1}月分の請求書を送付いたします。\${/r}\n\${list,\${item},●}\n\${/r}\n何卒ご査収のほどよろしくお願いいたします。\n\${/r}\n\${/r}\n------------------------\${/r}\n\${m_company}\${/r}\n\${c_name,0}\${/r}\nTEL：\${m_tel}\${/r}\nEMAIL：\${u_mail}\${/r}\nURL：\${m_url}\${/r}\n------------------------',
    lastUpdated: '2024-01-15',
  },
];

const initialRules: AccountingRule[] = [
  {
    id: '3',
    type: 'tax_rate',
    label: '消費税率',
    value: 10,
    unit: '%',
    lastUpdated: '2024-01-15',
  },
];

// 見積設定の初期データ
const initialEstimateSettings: DocumentSetting[] = [
  {
    id: 'est_1',
    type: 'file_naming',
    label: '見積書ファイル命名規則',
    content: '【${c_company}御中】御見積書_${yyyy,0}${mm,0}',
    description: 'ファイル名の自動生成ルール',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_2',
    type: 'number_rule',
    label: '見積書番号発番ルール',
    content: 'Q-${yyyy}${mm}${dd}-${number,5,1}',
    description: '見積書番号の自動生成パターン',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_3',
    type: 'item_rule',
    label: '品目名記載ルール',
    content: '${column,イベント実施場所}${space}${column,オーダー}${space}${column,人数}名',
    description: '品目欄の表示形式',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_4',
    type: 'mail_template',
    label: 'メール作成ルール',
    content: '\${c_company}\${space}\${c_name,1}様\${/r}\n\${/r}\nお世話になっております。\${/r}\n\${m_company}の\${c_name,1}です。\${/r}\n\${/r}\n\${mm,-1}月分の見積書を送付いたします。\${/r}\n\${list,\${item},●}\n\${/r}\n何卒ご査収のほどよろしくお願いいたします。\n\${/r}\n\${/r}\n------------------------\${/r}\n\${m_company}\${/r}\n\${c_name,0}\${/r}\nTEL：\${m_tel}\${/r}\nEMAIL：\${u_mail}\${/r}\nURL：\${m_url}\${/r}\n------------------------',
    description: 'メール本文テンプレート',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_5',
    type: 'save_location',
    label: '見積保存先',
    content: 'https://drive.google.com/drive/u/0/folders/1WCBVeXVZ9DMtd4GNzvoCAQLNDroKsUGp',
    description: 'ファイル保存先URL',
    lastUpdated: '2024-01-15',
  },
];

// 請求設定の初期データ（見積設定と同一構成）
const initialInvoiceSettings: DocumentSetting[] = [
  {
    id: 'inv_1',
    type: 'file_naming',
    label: '請求書ファイル命名規則',
    content: '【${c_company}御中】御請求書_${yyyy,0}${mm,0}',
    description: 'ファイル名の自動生成ルール',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_2',
    type: 'number_rule',
    label: '請求書番号発番ルール',
    content: 'I-${yyyy}${mm}${dd}-${number,5,1}',
    description: '請求書番号の自動生成パターン',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_3',
    type: 'item_rule',
    label: '品目名記載ルール',
    content: '${column,イベント実施場所}${space}${column,オーダー}${space}${column,人数}名',
    description: '品目欄の表示形式',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_4',
    type: 'mail_template',
    label: 'メール作成ルール',
    content: '\${c_company}\${space}\${c_name,1}様\${/r}\n\${/r}\nお世話になっております。\${/r}\n\${m_company}の\${c_name,1}です。\${/r}\n\${/r}\n\${mm,-1}月分の請求書を送付いたします。\${/r}\n\${list,\${item},●}\n\${/r}\n何卒ご査収のほどよろしくお願いいたします。\n\${/r}\n\${/r}\n------------------------\${/r}\n\${m_company}\${/r}\n\${c_name,0}\${/r}\nTEL：\${m_tel}\${/r}\nEMAIL：\${u_mail}\${/r}\nURL：\${m_url}\${/r}\n------------------------',
    description: 'メール本文テンプレート',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_5',
    type: 'save_location',
    label: '請求保存先',
    content: 'https://drive.google.com/drive/u/0/folders/1WCBVeXVZ9DMtd4GNzvoCAQLNDroKsUGp',
    description: 'ファイル保存先URL',
    lastUpdated: '2024-01-15',
  },
];

// 振込期日設定
const initialPaymentDue: PaymentDueSetting = {
  month: '翌月',
  day: '末日',
  businessDayRule: 'before'
};

// ユーザー情報取得関数（実際の実装では認証システムから取得）
const getCurrentUser = () => {
  return {
    firstName: '太郎',
    lastName: '田中',
    name: '田中太郎',
    email: 'tanaka@ansteype.com',
    phone: '090-1234-5678',
    department: '営業部',
    position: '主任'
  };
};

export const AccountingManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [rules, setRules] = useState<AccountingRule[]>(initialRules);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // 見積・請求設定用のstate
  const [estimateSettings, setEstimateSettings] = useState<DocumentSetting[]>(initialEstimateSettings);
  const [invoiceSettings, setInvoiceSettings] = useState<DocumentSetting[]>(initialInvoiceSettings);
  const [paymentDue, setPaymentDue] = useState<PaymentDueSetting>(initialPaymentDue);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'estimate' | 'invoice'>('estimate');
  const [previewContent, setPreviewContent] = useState({ subject: '', body: '' });
  const [companySettings, setCompanySettings] = useState<CompanyBasicSettings>(initialCompanySettings);
  const [editingCompany, setEditingCompany] = useState(false);

  const handleCompanySettingChange = (field: keyof CompanyBasicSettings, value: string | number) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompanySettings = () => {
    // ここで実際の保存処理を実装
    console.log('会社設定を保存:', companySettings);
    setEditingCompany(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 実際の実装では画像をアップロードしてURLを取得
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleCompanySettingChange('companyLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateChange = (templateId: string, newContent: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, content: newContent, lastUpdated: new Date().toISOString().split('T')[0] }
        : template
    ));
  };

  const handleRuleChange = (ruleId: string, newValue: string | number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, value: newValue, lastUpdated: new Date().toISOString().split('T')[0] }
        : rule
    ));
  };

  const handleSaveTemplate = (templateId: string) => {
    setEditingTemplate(null);
    setSaveMessage('テンプレートを保存しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveRule = (ruleId: string) => {
    setEditingRule(null);
    setSaveMessage('ルールを保存しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleResetTemplate = (templateId: string) => {
    // デフォルトテンプレートにリセット（実際にはAPIから取得）
    const defaultTemplate = initialTemplates.find(t => t.id === templateId);
    if (defaultTemplate) {
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...defaultTemplate, lastUpdated: new Date().toISOString().split('T')[0] }
          : template
      ));
      setSaveMessage('テンプレートをリセットしました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // 変数をサンプル値に置き換える関数
  const replaceVariablesWithSamples = (text: string): string => {
    let result = text;
    
    // エスケープされた変数を通常の変数に戻す
    result = result.replace(/\\?\\\$/g, '$');
    
    // 実際のユーザー情報を取得
    const currentUser = getCurrentUser();

    // 基本変数のサンプル値定義
    const sampleData: { [key: string]: string } = {
      // 会社情報
      'c_company': 'ABC株式会社',
      'c_name': currentUser.name,        // 実データ使用（担当者名）
      'c_tel': '03-1234-5678',
      'c_mail': 'tanaka@abc-corp.com',
      
      // 自社情報（実データ使用）
      'm_company': companySettings.companyName,
      'm_tel': companySettings.phone || '048-123-4567',
      'm_mail': companySettings.email || 'info@ansteype.com',
      'm_url': companySettings.url || 'ansteype.com',
      
      // ユーザー情報（実データ使用）
      'u_mail': currentUser.email,
      
      // 日付情報（現在日付ベース）
      'yyyy': '2024',
      'mm': '03',
      'dd': '15',
      'yy': '24',
      
      // 品目
      'item': 'イオンモール上尾店　クローザー　3名',
      
      // その他
      'space': '　',
      '/r': '\n',
    };

    // 1. 名前系変数（番号指定あり）の処理
    result = result.replace(/\$\{c_name,(\d+)\}/g, (match, num) => {
      const nameMap: { [key: string]: string } = {
        '0': currentUser.name,      // フルネーム（実データ）
        '1': currentUser.lastName,  // 姓のみ（実データ）
        '2': currentUser.firstName, // 名のみ（実データ）
        '3': currentUser.name       // フルネーム（実データ）
      };
      return nameMap[num] || currentUser.name;
    });

    // 2. 日付系変数（加減計算あり）の処理
    result = result.replace(/\$\{(yyyy|mm|dd|yy),([-+]?\d+)\}/g, (match, type, offset) => {
      const baseValues: { [key: string]: number } = {
        'yyyy': 2024,
        'mm': 3,
        'dd': 15,
        'yy': 24
      };
      
      const base = baseValues[type] || 0;
      const offsetNum = parseInt(offset, 10) || 0;
      let result = base + offsetNum;
      
      // 月の場合は1-12の範囲に調整
      if (type === 'mm') {
        while (result < 1) result += 12;
        while (result > 12) result -= 12;
        return result.toString().padStart(2, '0');
      }
      
      // 日の場合は1-31の範囲に調整
      if (type === 'dd') {
        while (result < 1) result += 30;
        while (result > 31) result -= 30;
        return result.toString().padStart(2, '0');
      }
      
      // 年の場合
      if (type === 'yy') {
        return (result % 100).toString().padStart(2, '0');
      }
      
      return result.toString();
    });

    // 3. 箇条書き変数の処理
    result = result.replace(/\$\{list,([^,]+),([^}]+)\}/g, (match, value, listChar) => {
      // ${item}が含まれている場合は品目のリストを展開
      if (value.includes('${item}') || value === '${item}') {
        const items = [
          'イオンモール上尾店　クローザー　3名',
          'イオンモール上尾店　ガール　1名'
        ];
        return items.map(item => `${listChar}${item}`).join('\n');
      }
      // その他の場合はサンプル項目
      const items = ['項目1', '項目2', '項目3'];
      return items.map(item => `${listChar}${item}`).join('\n');
    });

    // 4. column変数の処理
    result = result.replace(/\$\{column,([^}]+)\}/g, (match, columnName) => {
      return 'イオンモール上尾'; // サンプル値
    });

    // 5. 基本変数の処理（単純な変数名）
    Object.entries(sampleData).forEach(([variable, replacement]) => {
      const patterns = [
        new RegExp(`\\$\\{${variable}\\}`, 'g'),           // ${variable}
        new RegExp(`\\$\\{${variable},0\\}`, 'g'),         // ${variable,0}
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, replacement);
      });
    });

    // 6. 残った未処理の変数パターンを汎用的に処理
    result = result.replace(/\$\{([^}]+)\}/g, (match, variable) => {
      // 変数名に基づいてサンプル値を推測
      if (variable.includes('company')) return 'サンプル会社';
      if (variable.includes('name')) return 'サンプル太郎';
      if (variable.includes('tel')) return '03-0000-0000';
      if (variable.includes('mail')) return 'sample@example.com';
      if (variable.includes('date')) return '2024-03-15';
      if (variable.includes('time')) return '14:30';
      if (variable.includes('amount')) return '100,000';
      if (variable.includes('price')) return '50,000';

      if (variable.includes('item')) return 'イオンモール上尾店　クローザー　3名';
      
      // その他の場合は変数名をそのまま表示値として使用
      return `[${variable}]`;
    });

    return result;
  };

  // プレビューを開く関数
  const handlePreview = (type: 'estimate' | 'invoice') => {
    const subjectTemplate = getTemplateByType(type === 'estimate' ? 'estimate_subject' : 'invoice_subject');
    const bodyTemplate = getTemplateByType(type === 'estimate' ? 'estimate_body' : 'invoice_body');
    
    console.log('Original subject:', subjectTemplate?.content);
    console.log('Original body:', bodyTemplate?.content);
    
    const subject = subjectTemplate ? replaceVariablesWithSamples(subjectTemplate.content) : '';
    const body = bodyTemplate ? replaceVariablesWithSamples(bodyTemplate.content) : '';
    
    console.log('Processed subject:', subject);
    console.log('Processed body:', body);
    
    setPreviewType(type);
    setPreviewContent({ subject, body });
    setPreviewOpen(true);
  };

  const getTemplateByType = (type: string) => {
    return templates.find(template => template.type === type);
  };

  const getRuleByType = (type: string) => {
    return rules.find(rule => rule.type === type);
  };

  // 見積・請求設定用のハンドラー
  const handleSettingChange = (settingId: string, newContent: string, isEstimate: boolean = true) => {
    const setter = isEstimate ? setEstimateSettings : setInvoiceSettings;
    setter(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, content: newContent, lastUpdated: new Date().toISOString().split('T')[0] }
        : setting
    ));
  };

  const handleSaveSetting = (settingId: string) => {
    setEditingSetting(null);
    setSaveMessage('設定を保存しました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePaymentDueChange = (field: keyof PaymentDueSetting, value: string) => {
    setPaymentDue(prev => ({ ...prev, [field]: value }));
  };

  const getSettingById = (settingId: string, isEstimate: boolean = true) => {
    const settings = isEstimate ? estimateSettings : invoiceSettings;
    return settings.find(setting => setting.id === settingId);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        <AccountingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        経理管理
      </Typography>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {saveMessage}
        </Alert>
      )}

      {/* タブナビゲーション */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label="基本設定" 
            icon={<BusinessIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="メール設定" 
            icon={<EmailIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="文書設定" 
            icon={<DocumentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="経理ルール" 
            icon={<SettingsIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 基本設定タブ */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="会社基本情報"
                action={
                  <Button
                    variant={editingCompany ? "contained" : "outlined"}
                    color={editingCompany ? "primary" : "inherit"}
                    startIcon={editingCompany ? <SaveIcon /> : <EditIcon />}
                    onClick={editingCompany ? handleSaveCompanySettings : () => setEditingCompany(true)}
                  >
                    {editingCompany ? '保存' : '編集'}
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* 会社名 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="会社名"
                      value={companySettings.companyName}
                      onChange={(e) => handleCompanySettingChange('companyName', e.target.value)}
                      disabled={!editingCompany}
                    />
                  </Grid>

                  {/* 郵便番号 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="郵便番号"
                      value={companySettings.postalCode}
                      onChange={(e) => handleCompanySettingChange('postalCode', e.target.value)}
                      disabled={!editingCompany}
                      placeholder="000-0000"
                    />
                  </Grid>

                  {/* 住所 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="会社住所"
                      value={companySettings.address}
                      onChange={(e) => handleCompanySettingChange('address', e.target.value)}
                      disabled={!editingCompany}
                    />
                  </Grid>

                  {/* インボイス番号 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="インボイス番号"
                      value={companySettings.invoiceNumber}
                      onChange={(e) => handleCompanySettingChange('invoiceNumber', e.target.value)}
                      disabled={!editingCompany}
                      placeholder="T－0000000000000"
                    />
                  </Grid>

                  {/* 電話番号 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="会社電話番号"
                      value={companySettings.phone || ''}
                      onChange={(e) => handleCompanySettingChange('phone', e.target.value)}
                      disabled={!editingCompany}
                      placeholder="03-0000-0000"
                    />
                  </Grid>

                  {/* メールアドレス */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="会社メールアドレス"
                      value={companySettings.email || ''}
                      onChange={(e) => handleCompanySettingChange('email', e.target.value)}
                      disabled={!editingCompany}
                      placeholder="info@company.com"
                    />
                  </Grid>

                  {/* URL */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="会社URL"
                      value={companySettings.url || ''}
                      onChange={(e) => handleCompanySettingChange('url', e.target.value)}
                      disabled={!editingCompany}
                      placeholder="company.com"
                    />
                  </Grid>

                  {/* 会社ロゴ */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      会社ロゴ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {companySettings.companyLogo && (
                        <Avatar
                          src={companySettings.companyLogo}
                          sx={{ width: 80, height: 80 }}
                          variant="rounded"
                        />
                      )}
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="logo-upload"
                          type="file"
                          onChange={handleLogoUpload}
                          disabled={!editingCompany}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            disabled={!editingCompany}
                          >
                            ロゴを変更
                          </Button>
                        </label>
                        {companySettings.companyLogo && editingCompany && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleCompanySettingChange('companyLogo', '')}
                            sx={{ ml: 1 }}
                          >
                            削除
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* メール設定タブ */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* 見積メールテンプレート */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="見積書送付メール"
                subheader="見積書送付時のメールテンプレート"
                avatar={<EmailIcon color="primary" />}
                action={
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreview('estimate')}
                    size="small"
                  >
                    プレビュー
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">件名テンプレート</Typography>
                    <Box>
                      {editingTemplate === 'estimate_subject' ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveTemplate('1')}
                        >
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setEditingTemplate('estimate_subject')}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleResetTemplate('1')}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {editingTemplate === 'estimate_subject' ? (
                    <TextField
                      fullWidth
                      multiline
                      value={getTemplateByType('estimate_subject')?.content || ''}
                      onChange={(e) => handleTemplateChange('1', e.target.value)}
                      placeholder="件名テンプレートを入力..."
                    />
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {getTemplateByType('estimate_subject')?.content}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    最終更新: {getTemplateByType('estimate_subject')?.lastUpdated}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">本文テンプレート</Typography>
                    <Box>
                      {editingTemplate === 'estimate_body' ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveTemplate('2')}
                        >
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setEditingTemplate('estimate_body')}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleResetTemplate('2')}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {editingTemplate === 'estimate_body' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={getTemplateByType('estimate_body')?.content || ''}
                      onChange={(e) => handleTemplateChange('2', e.target.value)}
                      placeholder="本文テンプレートを入力..."
                    />
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {getTemplateByType('estimate_body')?.content}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    最終更新: {getTemplateByType('estimate_body')?.lastUpdated}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 請求メールテンプレート */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="請求書送付メール"
                subheader="請求書送付時のメールテンプレート"
                avatar={<ReceiptIcon color="primary" />}
                action={
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreview('invoice')}
                    size="small"
                  >
                    プレビュー
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">件名テンプレート</Typography>
                    <Box>
                      {editingTemplate === 'invoice_subject' ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveTemplate('3')}
                        >
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setEditingTemplate('invoice_subject')}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleResetTemplate('3')}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {editingTemplate === 'invoice_subject' ? (
                    <TextField
                      fullWidth
                      multiline
                      value={getTemplateByType('invoice_subject')?.content || ''}
                      onChange={(e) => handleTemplateChange('3', e.target.value)}
                      placeholder="件名テンプレートを入力..."
                    />
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {getTemplateByType('invoice_subject')?.content}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    最終更新: {getTemplateByType('invoice_subject')?.lastUpdated}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">本文テンプレート</Typography>
                    <Box>
                      {editingTemplate === 'invoice_body' ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveTemplate('4')}
                        >
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setEditingTemplate('invoice_body')}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleResetTemplate('4')}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {editingTemplate === 'invoice_body' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={getTemplateByType('invoice_body')?.content || ''}
                      onChange={(e) => handleTemplateChange('4', e.target.value)}
                      placeholder="本文テンプレートを入力..."
                    />
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {getTemplateByType('invoice_body')?.content}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    最終更新: {getTemplateByType('invoice_body')?.lastUpdated}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 利用可能な変数 */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="利用可能な変数" subheader="メールテンプレート内で使用できる変数一覧" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  基本変数:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '35%' }}>変数名</TableCell>
                        <TableCell sx={{ width: '40%' }}>説明</TableCell>
                        <TableCell sx={{ width: '25%' }}>例</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { variable: '${yyyy,【加減】}', description: 'メール送信日の西暦年（加減可能）', example: '2024' },
                        { variable: '${mm,【加減】}', description: 'メール送信日の月（2桁、加減可能）', example: '01' },
                        { variable: '${dd,【加減】}', description: 'メール送信日の日（2桁、加減可能）', example: '15' },
                        { variable: '${item}', description: '品目名をすべて挿入', example: 'イオンモール上尾店 クローザー 3名' },
                        { variable: '${c_company}', description: '取引先の会社名', example: '株式会社ABC' },
                        { variable: '${c_name,0or1}', description: '担当者名（0:フルネーム、1:姓のみ）※ユーザー情報設定から取得', example: '田中太郎 / 田中' },
                        { variable: '${m_company}', description: '自社の会社名※会社基本設定から取得', example: '株式会社ANSTEYPE' },

                        { variable: '${m_tel}', description: '自社の電話番号※会社基本設定から取得', example: '048-123-4567' },
                        { variable: '${m_mail}', description: '自社のメールアドレス※会社基本設定から取得', example: 'info@ansteype.com' },
                        { variable: '${m_url}', description: '自社のURL※会社基本設定から取得', example: 'ansteype.com' },
                        { variable: '${u_mail}', description: 'ユーザーのメールアドレス', example: 'user@sample-corp.com' },
                        { variable: '${/r}', description: '改行を挿入', example: '\\n' },
                        { variable: '${space}', description: '空白文字を挿入', example: '　' }
                      ].map((item) => (
                        <TableRow key={item.variable}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.variable}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle2" gutterBottom>
                  箇条書き変数:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '35%' }}>変数名</TableCell>
                        <TableCell sx={{ width: '40%' }}>説明</TableCell>
                        <TableCell sx={{ width: '25%' }}>例</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>${'{list,${item},●}'}</TableCell>
                        <TableCell>箇条書きを挿入（値、リスト文字指定）</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>●項目1</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  表の変数名をクリックするとクリップボードにコピーされます。
                </Typography>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    使用例:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {'宛先: ${c_company}${space}${c_name,1}様${/r}'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    → ABC株式会社 田中様（改行）
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {'署名: ------------------------${/r}${m_company}${/r}${c_name,0}${/r}TEL：${m_tel}${/r}EMAIL：${u_mail}${/r}URL：${m_url}${/r}------------------------'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    → ------------------------<br/>株式会社ANSTEYPE<br/>田中太郎<br/>TEL：048-123-4567<br/>EMAIL：tanaka@ansteype.com<br/>URL：ansteype.com<br/>------------------------
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 文書設定タブ */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* 見積書設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="見積書設定"
                subheader="見積書作成に関する設定"
                avatar={<DocumentIcon color="primary" />}
              />
              <CardContent>
                <List>
                  {estimateSettings.filter(setting => setting.type !== 'mail_template').map((setting) => (
                    <ListItem key={setting.id} divider>
                      <ListItemText
                        primary={setting.label}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              {setting.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {editingSetting === setting.id ? (
                                <TextField
                                  fullWidth
                                  value={setting.content}
                                  onChange={(e) => handleSettingChange(setting.id, e.target.value, true)}
                                  size="small"
                                  multiline
                                  rows={setting.type === 'save_location' ? 2 : 1}
                                />
                              ) : (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontFamily: 'monospace',
                                      wordBreak: 'break-all',
                                      whiteSpace: 'pre-wrap',
                                      overflowWrap: 'anywhere'
                                    }}
                                  >
                                    {setting.content}
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              最終更新: {setting.lastUpdated}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {editingSetting === setting.id ? (
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleSaveSetting(setting.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            edge="end"
                            onClick={() => setEditingSetting(setting.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* 請求書設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="請求書設定"
                subheader="請求書作成に関する設定"
                avatar={<ReceiptIcon color="primary" />}
              />
              <CardContent>
                <List>
                  {invoiceSettings.filter(setting => setting.type !== 'mail_template').map((setting) => (
                    <ListItem key={setting.id} divider>
                      <ListItemText
                        primary={setting.label}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              {setting.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {editingSetting === setting.id ? (
                                <TextField
                                  fullWidth
                                  value={setting.content}
                                  onChange={(e) => handleSettingChange(setting.id, e.target.value, false)}
                                  size="small"
                                  multiline
                                  rows={setting.type === 'save_location' ? 2 : 1}
                                />
                              ) : (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontFamily: 'monospace',
                                      wordBreak: 'break-all',
                                      whiteSpace: 'pre-wrap',
                                      overflowWrap: 'anywhere'
                                    }}
                                  >
                                    {setting.content}
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              最終更新: {setting.lastUpdated}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {editingSetting === setting.id ? (
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleSaveSetting(setting.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            edge="end"
                            onClick={() => setEditingSetting(setting.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* 利用可能な変数 */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="利用可能な変数" subheader="文書設定内で使用できる変数一覧" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  発番ルール変数:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '35%' }}>変数名</TableCell>
                        <TableCell sx={{ width: '40%' }}>説明</TableCell>
                        <TableCell sx={{ width: '25%' }}>例</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { variable: '${yyyy}', description: '書類作成日の西暦年', example: '2024' },
                        { variable: '${mm}', description: '書類作成日の月（2桁）', example: '01' },
                        { variable: '${dd}', description: '書類作成日の日（2桁）', example: '15' },
                        { variable: '${number,【桁数】,【初期値】}', description: '連番値（桁数・初期値指定）', example: '00001' }
                      ].map((item) => (
                        <TableRow key={item.variable}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.variable}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle2" gutterBottom>
                  ファイル命名規則変数:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '35%' }}>変数名</TableCell>
                        <TableCell sx={{ width: '40%' }}>説明</TableCell>
                        <TableCell sx={{ width: '25%' }}>例</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { variable: '${yyyy,【加減】}', description: '書類作成日の西暦年（加減可能）', example: '2024' },
                        { variable: '${mm,【加減】}', description: '書類作成日の月（2桁、加減可能）', example: '01' },
                        { variable: '${dd,【加減】}', description: '書類作成日の日（2桁、加減可能）', example: '15' },
                        { variable: '${c_company}', description: '取引先の会社名', example: '株式会社ABC' }
                      ].map((item) => (
                        <TableRow key={item.variable}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.variable}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle2" gutterBottom>
                  品目名記載ルール変数:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '35%' }}>変数名</TableCell>
                        <TableCell sx={{ width: '40%' }}>説明</TableCell>
                        <TableCell sx={{ width: '25%' }}>例</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { variable: '${column,【対象の列名】}', description: '対象の列名から取得した値', example: 'イオンモール上尾' },
                        { variable: '${space}', description: '空白文字', example: '　' }
                      ].map((item) => (
                        <TableRow key={item.variable}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.variable}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>


                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  表の変数名をクリックするとクリップボードにコピーされます。
                </Typography>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    使用例:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {'発番ルール: Q-${yyyy}${mm}${dd}-${number,5,1}'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    → Q-20240115-00001
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {'ファイル名: 【${c_company}御中】御見積書_${yyyy,0}${mm,0}'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    → 【ABC株式会社御中】御見積書_202401
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {'品目名: ${column,イベント実施場所}${space}${column,オーダー}${space}${column,人数}名'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    → イオンモール上尾 クローザー 3名
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 経理ルールタブ */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          {/* 経理ルール設定 */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="経理ルール設定"
                subheader="請求・支払いに関する基本ルール"
                avatar={<MoneyIcon color="primary" />}
              />
              <CardContent>
                <List>
                  {rules.map((rule) => (
                    <ListItem key={rule.id} divider>
                      <ListItemText
                        primary={rule.label}
                        secondary={
                          <Box>
                            <Box sx={{ mt: 1 }}>
                              {editingRule === rule.id ? (
                                <TextField
                                  fullWidth
                                  value={rule.value}
                                  onChange={(e) => handleRuleChange(rule.id, rule.type === 'tax_rate' ? Number(e.target.value) : e.target.value)}
                                  type={rule.type === 'tax_rate' ? 'number' : 'text'}
                                  InputProps={rule.unit ? {
                                    endAdornment: <InputAdornment position="end">{rule.unit}</InputAdornment>
                                  } : undefined}
                                />
                              ) : (
                                <Typography variant="body1">
                                  {rule.value}{rule.unit}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              最終更新: {rule.lastUpdated}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {editingRule === rule.id ? (
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleSaveRule(rule.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            edge="end"
                            onClick={() => setEditingRule(rule.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {/* 振込期日設定 */}
                <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    振込期日設定ルール
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>月</InputLabel>
                        <Select
                          value={paymentDue.month}
                          onChange={(e) => handlePaymentDueChange('month', e.target.value)}
                          label="月"
                        >
                          <MenuItem value="翌月">翌月</MenuItem>
                          <MenuItem value="当月">当月</MenuItem>
                          <MenuItem value="翌々月">翌々月</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>日付</InputLabel>
                        <Select
                          value={paymentDue.day}
                          onChange={(e) => handlePaymentDueChange('day', e.target.value)}
                          label="日付"
                        >
                          <MenuItem value="末日">末日</MenuItem>
                          <MenuItem value="15日">15日</MenuItem>
                          <MenuItem value="10日">10日</MenuItem>
                          <MenuItem value="25日">25日</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        支払期日が土日祝の場合:
                      </Typography>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant={paymentDue.businessDayRule === 'before' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handlePaymentDueChange('businessDayRule', 'before')}
                          >
                            前営業日
                          </Button>
                          <Button
                            variant={paymentDue.businessDayRule === 'after' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handlePaymentDueChange('businessDayRule', 'after')}
                          >
                            後営業日
                          </Button>
                          <Button
                            variant={paymentDue.businessDayRule === 'ignore' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => handlePaymentDueChange('businessDayRule', 'ignore')}
                          >
                            考慮しない
                          </Button>
                        </Box>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ルール説明 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="ルール説明" />
              <CardContent>
                <Typography variant="body2" paragraph>
                  <strong>消費税率:</strong><br />
                  請求書に適用する消費税率を設定します。
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>振込期日設定ルール:</strong><br />
                  見積書・請求書の振込期日を自動計算するためのルールです。営業日の考慮設定も可能です。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* メールプレビューダイアログ */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PreviewIcon color="primary" />
              <Typography variant="h6">
                {previewType === 'estimate' ? '見積書' : '請求書'}送付メールプレビュー
              </Typography>
            </Box>
            <IconButton onClick={() => setPreviewOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
              件名
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.2
                }}
              >
                {previewContent.subject}
              </Typography>
            </Paper>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
              本文
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.2
                }}
              >
                {previewContent.body}
              </Typography>
            </Paper>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              このプレビューでは変数がサンプル値に置き換えて表示されています。
              実際の送信時には、対応する実データが挿入されます。
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingManagement;