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
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface CompanyBasicSettings {
  companyName: string;
  companyLogo?: string;
  postalCode: string;
  address: string;
  invoiceNumber: string;
}

// 会社基本設定の初期データ
const initialCompanySettings: CompanyBasicSettings = {
  companyName: '株式会社ANSTEYPE',
  companyLogo: '/37db5f1f-cd78-47b1-9a49-bdbdddc1c3be.png',
  postalCode: '334-0067',
  address: '埼玉県春日部市中央1丁目2-2 7F',
  invoiceNumber: 'T－8030001135891',
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
    content: '【見積書】{代理店名}様_案件名_{日付}',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    type: 'estimate_body',
    label: '見積メール本文テンプレート',
    content: `いつもお世話になっております。
{代理店名}様

下記の件につきまして、見積書をお送りいたします。

案件名: {案件名}
期間: {開始日} ～ {終了日}
場所: {実施場所}

ご確認のほど、よろしくお願いいたします。

株式会社Ansteype
営業部 {担当者名}`,
    lastUpdated: '2024-01-15',
  },
  {
    id: '3',
    type: 'invoice_subject',
    label: '請求メール件名テンプレート',
    content: '【請求書】{代理店名}様_{年月}分',
    lastUpdated: '2024-01-15',
  },
  {
    id: '4',
    type: 'invoice_body',
    label: '請求メール本文テンプレート',
    content: `いつもお世話になっております。
{代理店名}様

{年月}分の請求書をお送りいたします。

請求金額: {請求金額}円（税込）
お支払い期日: {支払期日}

振込先:
{振込先情報}

何かご不明な点がございましたら、お気軽にお問い合わせください。

株式会社Ansteype
経理部 {担当者名}`,
    lastUpdated: '2024-01-15',
  },
];

const initialRules: AccountingRule[] = [
  {
    id: '1',
    type: 'item_naming',
    label: '品目名設定ルール',
    value: '{代理店名}_{場所名}_{役職}_{期間}',
    lastUpdated: '2024-01-15',
  },
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
    content: '\\${c_company}御中_見積書_\\${c_store}\\${c_place}\\${c_mm,0}\\${w_opt}\\${week_opt}\\${extno}',
    description: 'ファイル名の自動生成ルール',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_2',
    type: 'number_rule',
    label: '見積書番号発番ルール',
    content: 'Q-\\${yyyy}\\${mm}\\${dd}-\\${number,5}',
    description: '見積書番号の自動生成パターン',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_3',
    type: 'item_rule',
    label: '品目名記載ルール',
    content: '\\${column,開催店舗}\\${space}\\${column,オーダー}\\${space}\\${column,人数名}',
    description: '品目欄の表示形式',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'est_4',
    type: 'mail_template',
    label: 'メール作成ルール',
    content: `\${c_company}\${space}\${c_name,1}様\${cr}
お世話になっております。\${cr}
\${m_company}の\${m_name}です。\${cr}
この度は貴重なお時間をいただき、ありがとうございます。\${cr}
\${list,\${item}.●}
\${cr}
何卒ご査収のほどよろしくお願いいたします。
\${cr}`,
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
    content: '\\${c_company}御中_請求書_\\${c_store}\\${c_place}\\${c_mm,0}\\${w_opt}\\${week_opt}\\${extno}',
    description: 'ファイル名の自動生成ルール',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_2',
    type: 'number_rule',
    label: '請求書番号発番ルール',
    content: 'I-\\${yyyy}\\${mm}\\${dd}-\\${number,5}',
    description: '請求書番号の自動生成パターン',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_3',
    type: 'item_rule',
    label: '品目名記載ルール',
    content: '\\${column,開催店舗}\\${space}\\${column,オーダー}\\${space}\\${column,人数名}',
    description: '品目欄の表示形式',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'inv_4',
    type: 'mail_template',
    label: 'メール作成ルール',
    content: `\${c_company}\${space}\${c_name,1}様\${cr}
お世話になっております。\${cr}
\${m_company}の\${m_name}です。\${cr}
\${c_mm}月分の請求書をお送りいたします。\${cr}
\${list,\${item}.●}
\${cr}
お支払期日までにご確認のほどよろしくお願いいたします。
\${cr}`,
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
                    onClick={() => setPreviewOpen(true)}
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
                      <Typography variant="body2">
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
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
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
                      <Typography variant="body2">
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
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {[
                    '{代理店名}', '{案件名}', '{開始日}', '{終了日}', '{実施場所}',
                    '{担当者名}', '{年月}', '{請求金額}', '{支払期日}', '{振込先情報}', '{日付}'
                  ].map((variable) => (
                    <Chip key={variable} label={variable} variant="outlined" size="small" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  文書作成用変数:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {[
                    '\\${c_company}', '\\${c_store}', '\\${c_place}', '\\${c_name,1}', '\\${cr}',
                    '\\${m_company}', '\\${m_name}', '\\${space}', '\\${list,\\${item}.●}'
                  ].map((variable) => (
                    <Chip key={variable} label={variable} variant="outlined" size="small" />
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  変数をクリックするとクリップボードにコピーされます。
                </Typography>
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
                                />
                              ) : (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
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
                                />
                              ) : (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
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
                  基本変数:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {[
                    '\\${c_company}', '\\${c_store}', '\\${c_place}', '\\${c_mm,0}', '\\${w_opt}',
                    '\\${week_opt}', '\\${extno}', '\\${yyyy}', '\\${mm}', '\\${dd}', '\\${number,5}'
                  ].map((variable) => (
                    <Chip key={variable} label={variable} variant="outlined" size="small" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  表示用変数:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {[
                    '\\${column,開催店舗}', '\\${space}', '\\${column,オーダー}', '\\${column,人数名}'
                  ].map((variable) => (
                    <Chip key={variable} label={variable} variant="outlined" size="small" />
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  変数をクリックするとクリップボードにコピーされます。
                </Typography>
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
                  <strong>品目名設定ルール:</strong><br />
                  請求書の品目名の自動生成ルールを設定します。
                </Typography>
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
    </Box>
  );
};

export default AccountingManagement;