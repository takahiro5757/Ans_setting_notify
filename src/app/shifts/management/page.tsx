'use client';

import { useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, SelectChangeEvent, 
  FormControl, InputLabel, Select, MenuItem, TextField,
  Grid, Chip, Stack
} from '@mui/material';
import Breadcrumb from '@/components/Breadcrumb';
import YearMonthSelector from '@/components/YearMonthSelector';
import WeeklySummary from '@/components/WeeklySummary';
import { SpreadsheetGrid } from '@/components/shifts/SpreadsheetGrid';
import { Shift } from '@/components/shifts/SpreadsheetGrid/types';
import { getWeeks, generateDummySummary } from '@/utils/dateUtils';

// ダミーのスタッフデータ
const dummyStaffMembers = [
  // クローザー
  {
    id: '1205000001',
    name: '荒川拓実',
    nameKana: 'アラカワタクミ',
    station: '渋谷駅',
    weekdayRate: 20000,
    holidayRate: 25000,
    tel: '090-1234-5678',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000002',
    name: '山中翔',
    nameKana: 'ヤマナカショウ',
    station: '新宿駅',
    weekdayRate: 18000,
    holidayRate: 22000,
    tel: '090-2345-6789',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000003',
    name: '猪本留渚',
    nameKana: 'イノモトルナ',
    station: '池袋駅',
    weekdayRate: 19000,
    holidayRate: 23000,
    tel: '090-3456-7890',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000004',
    name: '吉岡海',
    nameKana: 'ヨシオカカイ',
    station: '東京駅',
    weekdayRate: 21000,
    holidayRate: 26000,
    tel: '090-4567-8901',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000005',
    name: '岩田咲海',
    nameKana: 'イワタサクミ',
    station: '品川駅',
    weekdayRate: 19500,
    holidayRate: 24000,
    tel: '090-5678-9012',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000006',
    name: '林宏樹',
    nameKana: 'ハヤシヒロキ',
    station: '上野駅',
    weekdayRate: 20500,
    holidayRate: 25500,
    tel: '090-6789-0123',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000007',
    name: '齋藤涼花',
    nameKana: 'サイトウリョウカ',
    station: '秋葉原駅',
    weekdayRate: 18500,
    holidayRate: 23500,
    tel: '090-7890-1234',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000009',
    name: '水谷亮介',
    nameKana: 'ミズタニリョウスケ',
    station: '赤坂駅',
    weekdayRate: 21500,
    holidayRate: 27000,
    tel: '090-8901-2345',
    role: 'クローザー',
    company: 'ANSTEYPEバイト'
  },
  {
    id: '1205000010',
    name: '大久保卓哉',
    nameKana: 'オオクボタクヤ',
    station: '三田駅',
    weekdayRate: 19800,
    holidayRate: 24500,
    tel: '090-9012-3456',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000011',
    name: '佐藤孝郁',
    nameKana: 'サトウタカフミ',
    station: '目黒駅',
    weekdayRate: 20200,
    holidayRate: 25200,
    tel: '090-0123-4567',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000012',
    name: '富岡勇太',
    nameKana: 'トミオカユウタ',
    station: '五反田駅',
    weekdayRate: 19200,
    holidayRate: 24200,
    tel: '090-1122-3344',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000013',
    name: '髙橋愛結奈',
    nameKana: 'タカハシアユナ',
    station: '恵比寿駅',
    weekdayRate: 20800,
    holidayRate: 26300,
    tel: '090-2233-4455',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000014',
    name: '和田美優',
    nameKana: 'ワダミユ',
    station: '新橋駅',
    weekdayRate: 21300,
    holidayRate: 26800,
    tel: '090-3344-5566',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000015',
    name: '中島悠喜',
    nameKana: 'ナカシマユウキ',
    station: '有楽町駅',
    weekdayRate: 19700,
    holidayRate: 24700,
    tel: '090-4455-6677',
    role: 'クローザー',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: '1205000016',
    name: '石谷直斗',
    nameKana: 'イシタニナオト',
    station: '御茶ノ水駅',
    weekdayRate: 20400,
    holidayRate: 25400,
    tel: '090-5566-7788',
    role: 'クローザー',
    company: 'PPP'
  },
  {
    id: '1205000017',
    name: '阿部将大',
    nameKana: 'アベショウダイ',
    station: '代々木駅',
    weekdayRate: 18800,
    holidayRate: 23800,
    tel: '090-6677-8899',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000018',
    name: '本間大地',
    nameKana: 'ホンマダイチ',
    station: '四ツ谷駅',
    weekdayRate: 19900,
    holidayRate: 24900,
    tel: '090-7788-9900',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000026',
    name: '堀田慎之介',
    nameKana: 'ホッタシンノスケ',
    station: '飯田橋駅',
    weekdayRate: 20700,
    holidayRate: 25700,
    tel: '090-8899-0011',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000027',
    name: '上堀内啓太',
    nameKana: 'カミホリウチケイタ',
    station: '神田駅',
    weekdayRate: 21100,
    holidayRate: 26100,
    tel: '090-9900-1122',
    role: 'クローザー',
    company: 'Festal'
  },
  {
    id: '1205000029',
    name: '松山家銘',
    nameKana: 'マツヤマイエアキ',
    station: '六本木駅',
    weekdayRate: 19400,
    holidayRate: 24400,
    tel: '090-0011-2233',
    role: 'クローザー',
    company: 'Festal'
  },
  // ガール
  {
    id: 'girl1',
    name: '佐々木 美月',
    nameKana: 'ササキ ミツキ',
    station: '原宿駅',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '090-1111-2222',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl2',
    name: '遠藤 さくら',
    nameKana: 'エンドウ サクラ',
    station: '表参道駅',
    weekdayRate: 14000,
    holidayRate: 17000,
    tel: '090-2222-3333',
    role: 'ガール',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: 'girl3',
    name: '石川 ゆみ',
    nameKana: 'イシカワ ユミ',
    station: '中目黒駅',
    weekdayRate: 16000,
    holidayRate: 19000,
    tel: '090-3333-4444',
    role: 'ガール',
    company: 'ANSTEYPEバイト'
  },
  {
    id: 'girl4',
    name: '長谷川 愛',
    nameKana: 'ハセガワ アイ',
    station: '自由が丘駅',
    weekdayRate: 13000,
    holidayRate: 16000,
    tel: '090-4444-5555',
    role: 'ガール',
    company: 'Festal'
  },
  {
    id: 'girl5',
    name: '村田 彩香',
    nameKana: 'ムラタ アヤカ',
    station: '二子玉川駅',
    weekdayRate: 17000,
    holidayRate: 20000,
    tel: '090-5555-6666',
    role: 'ガール',
    company: 'PPP'
  },
  {
    id: 'girl6',
    name: '小川 琴音',
    nameKana: 'オガワ コトネ',
    station: '三軒茶屋駅',
    weekdayRate: 12000,
    holidayRate: 15000,
    tel: '090-6666-7777',
    role: 'ガール',
    company: 'TMR'
  },
  {
    id: 'girl7',
    name: '藤田 結衣',
    nameKana: 'フジタ ユイ',
    station: '吉祥寺駅',
    weekdayRate: 18000,
    holidayRate: 21000,
    tel: '090-7777-8888',
    role: 'ガール',
    company: 'One.ft'
  },
  {
    id: 'girl8',
    name: '三浦 桜子',
    nameKana: 'ミウラ サクラコ',
    station: '下北沢駅',
    weekdayRate: 11000,
    holidayRate: 14000,
    tel: '090-8888-9999',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: 'girl9',
    name: '高木 優奈',
    nameKana: 'タカギ ユウナ',
    station: '中野駅',
    weekdayRate: 19000,
    holidayRate: 22000,
    tel: '090-9999-0000',
    role: 'ガール',
    company: 'ANSTEYPE個人事業主'
  },
  {
    id: 'girl10',
    name: '内田 莉子',
    nameKana: 'ウチダ リコ',
    station: '高円寺駅',
    weekdayRate: 15500,
    holidayRate: 18500,
    tel: '090-0101-0202',
    role: 'ガール',
    company: 'ANSTEYPEバイト'
  },
  {
    id: 'girl11',
    name: '西村 那奈',
    nameKana: 'ニシムラ ナナ',
    station: '阿佐ヶ谷駅',
    weekdayRate: 16500,
    holidayRate: 19500,
    tel: '090-0303-0404',
    role: 'ガール',
    company: 'Festal'
  },
  {
    id: 'girl12',
    name: '青木 茉莉',
    nameKana: 'アオキ マリ',
    station: '荻窪駅',
    weekdayRate: 13500,
    holidayRate: 16500,
    tel: '090-0505-0606',
    role: 'ガール',
    company: 'PPP'
  },
  {
    id: 'girl13',
    name: '坂本 詩織',
    nameKana: 'サカモト シオリ',
    station: '北千住駅',
    weekdayRate: 17500,
    holidayRate: 20500,
    tel: '090-0707-0808',
    role: 'ガール',
    company: 'TMR'
  },
  {
    id: 'girl14',
    name: '太田 美玲',
    nameKana: 'オオタ ミレイ',
    station: '錦糸町駅',
    weekdayRate: 14500,
    holidayRate: 17500,
    tel: '090-0909-1010',
    role: 'ガール',
    company: 'One.ft'
  },
  {
    id: 'girl15',
    name: '金子 葵',
    nameKana: 'カネコ アオイ',
    station: '門前仲町駅',
    weekdayRate: 12500,
    holidayRate: 15500,
    tel: '090-1111-1212',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  }
];

// ダミーのシフトデータを生成する関数
const generateDummyShifts = (year: number, month: number): Shift[] => {
  const shifts: Shift[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 稼働場所のリスト - 実データを使用
  const locations = [
    'イオンモール上尾センターコート',
    'イトーヨーカドー立場',
    'マルエツ松江',
    'コーナン西新井',
    '錦糸町マルイ たい焼き屋前',
    'ららぽーと富士見　1階スリコ前',
    'イオンモール春日部 風の広場',
    'イトーヨーカドー東久留米',
    'イオンタウン吉川美南',
    'イオン南越谷',
    'イトーヨーカドー埼玉大井',
    'スーパーバリュー草加',
    'エルミこうのす2F',
    'モラージュ菖蒲',
    'カインズ羽生',
    'ベイシア行田',
    'レイクタウンkaze3階ブリッジ',
    'さいたまスーパーアリーナけやき広場(ラーメンフェス)',
    'ソフトバンクエミテラス所沢店頭',
    'アリオ上尾',
    'イオン板橋',
    'イオンモール石巻',
    'イオンマリンピア(稲毛海岸)',
    'イオン市川妙典',
    '島忠ホームズ東村山',
    'コピス吉祥寺デッキイベント',
    'ロピア小平',
    'イトーヨーカドー大井町',
    'ドン・キホーテ浦和原山',
    'イオン大井',
    'ドン・キホーテ武蔵浦和',
    '草加セーモンプラザ',
    'イオンモール北戸田'
  ];
  
  // スタッフごとにシフトを生成
  dummyStaffMembers.forEach(staff => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // 疑似ランダム値を生成（決定論的な方法）
      // スタッフIDと日付から一貫した値を生成
      const staffIdNum = parseInt(staff.id.replace(/[^0-9]/g, ''));
      const dateNum = day + month * 100 + year * 10000;
      const pseudoRandom = (staffIdNum * 123 + dateNum * 456) % 100 / 100;
      
      let status: '○' | '×' | '-' = '-';
      
      // ガールとクローザーで出勤確率を変える
      if (staff.role === 'ガール') {
        // ガールは確率が少し高め
        if (pseudoRandom < 0.7) {
          status = '○';
        } else if (pseudoRandom < 0.9) {
          status = '×';
        }
      } else {
        // クローザー
        if (pseudoRandom < 0.6) {
          status = '○';
        } else if (pseudoRandom < 0.9) {
          status = '×';
        }
      }
      
      // 土日は出勤率を下げる
      if ((dayOfWeek === 0 || dayOfWeek === 6) && status === '○') {
        // ガールは土日の出勤率を低くする
        if (staff.role === 'ガール' && ((staffIdNum + day) % 10) < 5) {
          status = '×';
        }
        // クローザーも土日の調整
        else if (staff.role !== 'ガール' && ((staffIdNum + day) % 10) < 3) {
          status = '×';
        }
      }
      
      // 場所も決定論的に決定
      const locationIndex = (staffIdNum + day + (staff.role === 'ガール' ? 2 : 0)) % locations.length;
      
      // 場所の決定（一部は未確定に）
      let location: string | undefined = undefined;
      
      if (status === '○') {
        // 山田太郎から後藤瑠璃までの範囲のスタッフで一部未確定にする
        if (
          (staff.id >= 'staff1' && staff.id <= 'staff7') || // クローザー（山田太郎〜中村杏奈）
          (staff.id >= 'girl1' && staff.id <= 'girl10')     // ガール（佐々木美月〜内田莉子）
        ) {
          // 約40%のシフトで稼働場所を未確定にする
          const unassignedRandom = (staffIdNum * day * 31 + dateNum) % 100;
          if (unassignedRandom >= 40) {
            location = locations[locationIndex]; // 60%は場所を設定
          }
          // 残り40%は未確定（locationはundefinedのまま）
        } else {
          // 他のスタッフは通常通り場所を設定
          location = locations[locationIndex];
        }
      }
      
      // シフトの追加
      shifts.push({
        date: dateStr,
        staffId: staff.id,
        status,
        location: location
      });
    }
  });
  
  return shifts;
};

export default function ManagementPage() {
  // 状態管理
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('4');
  
  // フィルター用の状態管理を追加
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // 週情報を取得
  const weeks = getWeeks(year, month);
  
  // ダミーのサマリーデータ
  const summary = generateDummySummary();
  
  // ダミーのシフトデータ
  const dummyShifts = generateDummyShifts(parseInt(year), parseInt(month));

  // 会社の一覧を動的に取得（重複を排除）
  const companies = useMemo(() => {
    const companySet = new Set<string>();
    dummyStaffMembers.forEach(staff => {
      if (staff.company) {
        companySet.add(staff.company);
      }
    });
    return Array.from(companySet).sort();
  }, []);

  // フィルタリングされたスタッフメンバー
  const filteredStaffMembers = useMemo(() => {
    return dummyStaffMembers.filter(staff => {
      // 所属会社フィルター
      if (companyFilter.length > 0 && !companyFilter.includes(staff.company || '')) {
        return false;
      }
      
      // ロールフィルター
      if (roleFilter && staff.role !== roleFilter) {
        return false;
      }
      
      return true;
    });
  }, [dummyStaffMembers, companyFilter, roleFilter]);

  // スタッフ統計情報
  const staffStats = useMemo(() => {
    const totalClosers = dummyStaffMembers.filter(s => s.role === 'クローザー').length;
    const totalGirls = dummyStaffMembers.filter(s => s.role === 'ガール').length;
    
    const filteredClosers = filteredStaffMembers.filter(s => s.role === 'クローザー').length;
    const filteredGirls = filteredStaffMembers.filter(s => s.role === 'ガール').length;
    
    return {
      totalClosers,
      totalGirls,
      filteredClosers,
      filteredGirls,
      totalStaff: totalClosers + totalGirls,
      filteredStaff: filteredClosers + filteredGirls
    };
  }, [dummyStaffMembers, filteredStaffMembers]);

  // フィルタリングされたシフト
  const filteredShifts = useMemo(() => {
    const filteredStaffIds = filteredStaffMembers.map(staff => staff.id);
    return dummyShifts.filter(shift => filteredStaffIds.includes(shift.staffId));
  }, [dummyShifts, filteredStaffMembers]);

  // 年の変更ハンドラ
  const handleYearChange = (year: string) => {
    setYear(year);
  };

  // 月の変更ハンドラ
  const handleMonthChange = (month: string) => {
    setMonth(month);
  };

  // 会社フィルターの変更ハンドラ
  const handleCompanyFilterChange = (event: SelectChangeEvent<typeof companyFilter>) => {
    const value = event.target.value;
    // SelectのonChangeは文字列または文字列の配列を返す
    setCompanyFilter(typeof value === 'string' ? value.split(',') : value);
  };

  // ロールフィルターの変更ハンドラ
  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };

  // フィルターをリセットするハンドラ
  const handleResetFilters = () => {
    setCompanyFilter([]);
    setRoleFilter('');
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh', 
        py: 3
      }}
    >
      {/* パンくずリスト */}
      <Breadcrumb items={['ホーム', 'シフト調整', 'シフト管理']} />

      {/* メインコンテンツエリア */}
      <Box sx={{ position: 'relative' }}>
        {/* 週別サマリー（右上に固定） */}
        <Box sx={{ 
          position: 'absolute', 
          top: -20,
          right: 0, 
          width: 'auto', 
          minWidth: '650px', 
          zIndex: 1,
          backgroundColor: '#f5f5f5'
        }}>
          <WeeklySummary weeks={weeks} summary={summary} />
        </Box>

        {/* 左側のコンテンツ */}
        <Box>
          {/* 年月選択 */}
          <YearMonthSelector
            year={year}
            month={month}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            years={['2023', '2024', '2025']}
            months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
          />

          {/* フィルターコンポーネント（よりコンパクトに） */}
          <Paper 
            elevation={1}
            sx={{ 
              p: 1.5, 
              mt: 2, 
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              maxWidth: '700px'
            }}
          >
            {/* スタッフ数サマリーとフィルターを横並びに */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* スタッフ数サマリー（よりコンパクトに） */}
              <Stack direction="row" spacing={2} sx={{ mr: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                    {companyFilter || roleFilter ? 
                      `${staffStats.filteredClosers}/${staffStats.totalClosers}` : 
                      staffStats.totalClosers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">クローザー</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                    {companyFilter || roleFilter ? 
                      `${staffStats.filteredGirls}/${staffStats.totalGirls}` : 
                      staffStats.totalGirls}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">ガール</Typography>
                </Box>
              </Stack>
              
              {/* 縦の区切り線 */}
              <Box sx={{ height: 24, borderLeft: '1px solid #e0e0e0', mr: 1 }} />
              
              {/* フィルター */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
                {/* 所属会社フィルター */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="company-filter-label" sx={{ fontSize: '0.8rem' }}>所属会社</InputLabel>
                  <Select
                    labelId="company-filter-label"
                    multiple
                    value={companyFilter}
                    label="所属会社"
                    onChange={handleCompanyFilterChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === 0 ? 'すべて' : 
                         selected.length <= 2 ? selected.join(', ') : 
                         `${selected.length}社選択中`}
                      </Box>
                    )}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    {companies.map(company => (
                      <MenuItem key={company} value={company}>
                        {company}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* ロールフィルター */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="role-filter-label" sx={{ fontSize: '0.8rem' }}>スタッフ種別</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    value={roleFilter}
                    label="スタッフ種別"
                    onChange={handleRoleFilterChange}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    <MenuItem value="">すべて</MenuItem>
                    <MenuItem value="クローザー">クローザー</MenuItem>
                    <MenuItem value="ガール">ガール</MenuItem>
                  </Select>
                </FormControl>
                
                {/* リセットボタン */}
                {(companyFilter.length > 0 || roleFilter) && (
                  <Chip 
                    label="リセット" 
                    size="small"
                    onClick={handleResetFilters}
                    color="primary"
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* SpreadsheetGridコンポーネント */}
          <Box sx={{ mt: 2 }}>
            <SpreadsheetGrid
              year={parseInt(year)}
              month={parseInt(month)}
              staffMembers={filteredStaffMembers}
              shifts={filteredShifts}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 