'use client';

import { useState, useMemo } from 'react';
import { Box, Container, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, TextField, InputAdornment, OutlinedInput, Tooltip, Slider, IconButton } from '@mui/material';
import YearMonthSelector from '@/components/YearMonthSelector';
import { getWeeks, generateDummySummary } from '@/utils/dateUtils';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// インターフェース
interface VenueAssignment {
  date: string;
  agency: string;
  venue: string;
  staff: {
    id: string;
    name: string;
    isGirl: boolean;
  }[];
}

// 青系の5色パターンを定義（濃い色と薄い色のペア）
const colorPalette = [
  { dark: '#0D47A1', light: '#BBDEFB' }, // ネイビーブルー
  { dark: '#1976D2', light: '#E3F2FD' }, // ロイヤルブルー
  { dark: '#03A9F4', light: '#E1F5FE' }, // ライトブルー  
  { dark: '#0097A7', light: '#E0F7FA' }, // シアン
  { dark: '#00796B', light: '#E0F2F1' }  // ティール
];

// 代理店ごとの色を定義
const agencyColors: {[key: string]: {dark: string, light: string}} = {
  'ピーアップ': colorPalette[0],
  'ラネット': colorPalette[1],
  'CS': colorPalette[2],
  'コスモネット': colorPalette[3],
  'ベルパーク': colorPalette[4],
  'ニューコム': colorPalette[0],
  'エムデジ': colorPalette[1],
  'ケインズ': colorPalette[2],
  'RD': colorPalette[3]
};

// デフォルトの色（新しい代理店が追加された場合のフォールバック）
const defaultColor = { dark: '#2196F3', light: '#E3F2FD' }; // 標準的な青

// ダミーのアサインデータを生成する関数
const generateDummyAssignments = (year: number, month: number): VenueAssignment[] => {
  const assignments: VenueAssignment[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 代理店のリスト
  const agencies = [
    'ピーアップ',
    'ラネット',
    'CS',
    'コスモネット',
    'ベルパーク',
    'ニューコム',
    'エムデジ',
    'ケインズ',
    'RD'
  ];
  
  // 代理店ごとのイベント場所のリスト
  const venuesByAgency: { [key: string]: string[] } = {
    'ピーアップ': [
      'イオンモール上尾センターコート',
      'イトーヨーカドー立場',
      'マルエツ松江',
      'コーナン西新井'
    ],
    'ラネット': [
      '錦糸町マルイ たい焼き屋前',
      'ららぽーと富士見　1階スリコ前',
      'イオンモール春日部 風の広場',
      'イトーヨーカドー東久留米'
    ],
    'CS': [
      'イオンタウン吉川美南',
      'イオン南越谷',
      'イトーヨーカドー埼玉大井',
      'スーパーバリュー草加'
    ],
    'コスモネット': [
      'エルミこうのす2F',
      'モラージュ菖蒲',
      'カインズ羽生',
      'ベイシア行田'
    ],
    'ベルパーク': [
      'レイクタウンkaze3階ブリッジ',
      'さいたまスーパーアリーナけやき広場(ラーメンフェス)',
      'ソフトバンクエミテラス所沢店頭',
      'アリオ上尾'
    ],
    'ニューコム': [
      'イオン板橋',
      'イオンモール石巻',
      'イオンマリンピア(稲毛海岸)',
      'イオン市川妙典'
    ],
    'エムデジ': [
      '島忠ホームズ東村山',
      'コピス吉祥寺デッキイベント',
      'ロピア小平',
      'イトーヨーカドー大井町'
    ],
    'ケインズ': [
      'ドン・キホーテ浦和原山',
      'イオン大井'
    ],
    'RD': [
      'ドン・キホーテ武蔵浦和',
      '草加セーモンプラザ',
      'イオンモール北戸田'
    ]
  };
  
  // スタッフデータ
  const staffData = [
    // クローザー
    { id: '1', name: '荒川拓実', isGirl: false },
    { id: '2', name: '山中翔', isGirl: false },
    { id: '3', name: '猪本留渚', isGirl: false },
    { id: '4', name: '吉岡海', isGirl: false },
    { id: '5', name: '岩田咲海', isGirl: false },
    { id: '6', name: '林宏樹', isGirl: false },
    { id: '7', name: '齋藤涼花', isGirl: false },
    { id: '8', name: '水谷亮介', isGirl: false },
    { id: '9', name: '大久保卓哉', isGirl: false },
    { id: '10', name: '佐藤孝郁', isGirl: false },
    { id: '11', name: '富岡勇太', isGirl: false },
    { id: '12', name: '髙橋愛結奈', isGirl: false },
    { id: '13', name: '和田美優', isGirl: false },
    { id: '14', name: '中島悠喜', isGirl: false },
    { id: '15', name: '石谷直斗', isGirl: false },
    { id: '21', name: '森田来美', isGirl: false },
    { id: '22', name: '須郷瑠斗', isGirl: false },
    { id: '27', name: '森保勇生', isGirl: false },
    { id: '29', name: '森保大地', isGirl: false },
    { id: '30', name: '宮日向', isGirl: false },
    { id: '32', name: '美濃部椋太', isGirl: false },
    { id: '33', name: '白畑龍弥', isGirl: false },
    { id: '34', name: '長崎敬太', isGirl: false },
    { id: '36', name: '加瀬悠貴', isGirl: false },
    { id: '37', name: '篠知隆', isGirl: false },
    
    // ガール
    { id: '16', name: '柴李佐紅', isGirl: true },
    { id: '17', name: '佐藤祐未', isGirl: true },
    { id: '18', name: '石嶋瑠花', isGirl: true },
    { id: '19', name: '岸川明日菜', isGirl: true },
    { id: '20', name: '山岸莉子', isGirl: true },
    { id: '23', name: '大滝晴香', isGirl: true },
    { id: '24', name: '山下千尋', isGirl: true },
    { id: '25', name: '小林希歩', isGirl: true },
    { id: '26', name: '飯塚ひかり', isGirl: true },
    { id: '28', name: '須貝真奈美', isGirl: true },
    { id: '31', name: '中川ひかる', isGirl: true },
    { id: '35', name: '安面遥夏', isGirl: true },
    { id: '38', name: '小林天音', isGirl: true },
    { id: '39', name: '安藤心優', isGirl: true },
    { id: '40', name: '水谷新菜', isGirl: true }
  ];
  
  // 各日付に対してデータを生成
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 各代理店のイベント場所ごとにデータを生成
    agencies.forEach(agency => {
      const venues = venuesByAgency[agency];
      
      venues.forEach(venue => {
        // この日付・現場に配置する確率（擬似ランダム）
        // 会場ごとに決定論的に決める（同じ会場、同じ日付では常に同じ結果になるようにする）
        const venueHash = venue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dateHash = day + month * 31;
        const pseudoRandom = ((venueHash * 13) + (dateHash * 17)) % 100 / 100;
        
        // 60%の確率でこの日付・会場でイベントが開催される
        if (pseudoRandom < 0.6) {
          // スタッフを何人配置するか決定（1〜4人）
          // 週末は多めにする
          const staffCount = isWeekend ? 
            Math.floor(pseudoRandom * 3) + 2 : // 2-4人
            Math.floor(pseudoRandom * 3) + 1;  // 1-3人
            
          // スタッフをランダムに選択（ガールは少なくとも1人含める）
          const selectedStaff: typeof staffData = [];
          
          // まずガールを1人選ぶ
          const availableGirls = staffData.filter(s => s.isGirl);
          const girlIndex = (venueHash + dateHash + day) % availableGirls.length;
          selectedStaff.push(availableGirls[girlIndex]);
          
          // 残りのスタッフを選ぶ（クローザー優先）
          const availableClosers = staffData.filter(s => !s.isGirl);
          for (let i = 1; i < staffCount; i++) {
            const closerIndex = (venueHash + dateHash + day + i * 7) % availableClosers.length;
            // すでに選ばれていないスタッフを追加
            const nextStaff = availableClosers[closerIndex];
            if (!selectedStaff.some(s => s.id === nextStaff.id)) {
              selectedStaff.push(nextStaff);
            }
          }
          
          // アサインメントを追加
          assignments.push({
            date: dateStr,
            agency,
            venue,
            staff: selectedStaff
          });
        }
      });
    });
  }
  
  return assignments;
};

// フィルタリングされた代理店に隣接しない色を割り当てる関数を追加
// テーブルの表示に対しては下記関数を使ってランタイムで色を決定
const getAgencyColorForDisplay = (agency: string, index: number, agencies: string[]): { dark: string, light: string } => {
  // まずデフォルトの色マッピングを取得
  const baseColor = agencyColors[agency] || defaultColor;
  
  // 隣接する代理店が同じ色にならないようにする
  if (index > 0) {
    const prevAgency = agencies[index - 1];
    const prevColor = agencyColors[prevAgency] || defaultColor;
    
    // 前の代理店と同じ色の場合は、別の色を選択
    if (baseColor.dark === prevColor.dark) {
      // 前の色と異なる色を選択
      for (let i = 0; i < colorPalette.length; i++) {
        if (colorPalette[i].dark !== prevColor.dark) {
          return colorPalette[i];
        }
      }
    }
  }
  
  return baseColor;
};

export default function VenueAssignPage() {
  // 状態管理
  const [year, setYear] = useState<string>('2024');
  const [month, setMonth] = useState<string>('4');
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]); // 複数選択用に配列に変更
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]); // イベント場所フィルター用
  const [searchTerm, setSearchTerm] = useState<string>(''); // 検索用
  const [zoomLevel, setZoomLevel] = useState<number>(100); // ズームレベル (100% = 通常サイズ)
  
  // 週情報を取得
  const weeks = getWeeks(year, month);
  
  // ダミーのサマリーデータ（表示しないが、関数は将来的に使用する可能性があるため残す）
  // const summary = generateDummySummary();
  
  // ダミーのアサインデータ
  const dummyAssignments = useMemo(() => 
    generateDummyAssignments(parseInt(year), parseInt(month)), 
    [year, month]
  );
  
  // 代理店、イベント場所、スタッフ名でフィルタリング
  const filteredAssignments = useMemo(() => {
    let filtered = dummyAssignments;
    
    // 代理店フィルター（複数選択対応）
    if (selectedAgencies.length > 0) {
      filtered = filtered.filter(a => selectedAgencies.includes(a.agency));
    }
    
    // イベント場所フィルター（複数選択対応）
    if (selectedVenues.length > 0) {
      filtered = filtered.filter(a => selectedVenues.includes(a.venue));
    }
    
    // スタッフ名検索
    if (searchTerm.trim() !== '') {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.staff.some(staff => 
          staff.name.toLowerCase().includes(normalizedSearchTerm)
        )
      );
    }
    
    return filtered;
  }, [dummyAssignments, selectedAgencies, selectedVenues, searchTerm]);
  
  // 日付でデータをグループ化
  const dateGroups = useMemo(() => {
    const groups: { [date: string]: VenueAssignment[] } = {};
    
    filteredAssignments.forEach(assignment => {
      if (!groups[assignment.date]) {
        groups[assignment.date] = [];
      }
      groups[assignment.date].push(assignment);
    });
    
    return groups;
  }, [filteredAssignments]);
  
  // 代理店とイベント場所の一覧を取得
  const agencies = useMemo(() => {
    const set = new Set<string>();
    dummyAssignments.forEach(a => set.add(a.agency));
    return Array.from(set).sort();
  }, [dummyAssignments]);
  
  const venues = useMemo(() => {
    const venueSet = new Set<string>();
    dummyAssignments.forEach(a => venueSet.add(a.venue));
    return Array.from(venueSet).sort();
  }, [dummyAssignments]);
  
  // エージェンシーと会場の組み合わせを取得
  const agencyVenuePairs = useMemo(() => {
    const pairs: { agency: string; venue: string; }[] = [];
    
    filteredAssignments.forEach(a => {
      const existingPair = pairs.find(p => p.agency === a.agency && p.venue === a.venue);
      if (!existingPair) {
        pairs.push({ agency: a.agency, venue: a.venue });
      }
    });
    
    // 代理店名でソート、次に会場名でソート
    return pairs.sort((a, b) => {
      if (a.agency !== b.agency) return a.agency.localeCompare(b.agency);
      return a.venue.localeCompare(b.venue);
    });
  }, [filteredAssignments]);

  // フィルタリングされたペアを取得
  const filteredPairs = useMemo(() => {
    return agencyVenuePairs;
  }, [agencyVenuePairs]);

  // フィルタリングされた代理店一覧を取得
  const filteredAgencies = useMemo(() => {
    const agencySet = new Set<string>();
    filteredPairs.forEach(pair => {
      agencySet.add(pair.agency);
    });
    return Array.from(agencySet).sort();
  }, [filteredPairs]);
  
  // 日付リストを生成（月の最初から最後まで）
  const dates = useMemo(() => {
    const result: { date: string; displayDate: string; dayOfWeek: string }[] = [];
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeekNum = date.getDay();
      const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeekNum];
      
      result.push({
        date: dateStr,
        displayDate: `${month}/${day}`,
        dayOfWeek: dayOfWeekStr
      });
    }
    
    return result;
  }, [year, month]);
  
  // 年の変更ハンドラ
  const handleYearChange = (year: string) => {
    setYear(year);
  };

  // 月の変更ハンドラ
  const handleMonthChange = (month: string) => {
    setMonth(month);
  };
  
  // 代理店フィルター変更ハンドラ（複数選択対応）
  const handleAgencyChange = (event: SelectChangeEvent<typeof selectedAgencies>) => {
    const value = event.target.value;
    setSelectedAgencies(typeof value === 'string' ? value.split(',') : value);
  };
  
  // イベント場所フィルター変更ハンドラ
  const handleVenueChange = (event: SelectChangeEvent<typeof selectedVenues>) => {
    const value = event.target.value;
    setSelectedVenues(typeof value === 'string' ? value.split(',') : value);
  };
  
  // 検索ワード変更ハンドラ
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // フィルターリセットハンドラ
  const handleResetFilters = () => {
    setSelectedAgencies([]);
    setSelectedVenues([]);
    setSearchTerm('');
  };

  // ズームレベル変更ハンドラー
  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };
  
  // ズームイン/アウトハンドラー
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200)); // 最大200%まで
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50)); // 最小50%まで
  };
  
  // ズームリセットハンドラー
  const handleZoomReset = () => {
    setZoomLevel(100); // 100%（標準サイズ）にリセット
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        bgcolor: '#f5f5f5', 
        minHeight: '100vh', 
        p: 1, // パディングを小さくして表示領域を確保
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* ヘッダー部分（ズームコントロール）- コンパクトに */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        mb: 1, // マージンを小さく
        flexShrink: 0,
        height: '40px' // 高さを固定して小さく
      }}>
        {/* ズームコントロール - コンパクトに */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'white', p: 0.5, borderRadius: 1 }}>
          <IconButton size="small" onClick={handleZoomOut} title="縮小" sx={{ p: 0.5 }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          
          <Slider
            size="small"
            value={zoomLevel}
            min={50}
            max={200}
            step={10}
            onChange={handleZoomChange}
            sx={{ width: 80, mx: 0.5 }}
          />
          
          <IconButton size="small" onClick={handleZoomIn} title="拡大" sx={{ p: 0.5 }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
          
          <IconButton size="small" onClick={handleZoomReset} title="リセット" sx={{ p: 0.5 }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
          
          <Typography variant="caption" sx={{ ml: 0.5, minWidth: 35 }}>
            {zoomLevel}%
          </Typography>
        </Box>
      </Box>

      {/* コンテンツエリア全体 */}
      <Box sx={{ 
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* ズーム適用コンテナ */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transformOrigin: 'top left',
          transform: `scale(${zoomLevel / 100})`,
          width: `${(100 / zoomLevel) * 100}%`,
          height: zoomLevel < 100 ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* フィルターエリア - よりコンパクトに */}
          <Paper elevation={1} sx={{ p: 0.5, mb: 0.5, bgcolor: 'white', flexShrink: 0 }}>
            <Grid container spacing={0.5} alignItems="center">
              {/* 年月選択（幅を調整） */}
              <Grid item xs={12} md={3}>
                <YearMonthSelector
                  year={year}
                  month={month}
                  onYearChange={handleYearChange}
                  onMonthChange={handleMonthChange}
                  years={['2023', '2024', '2025']}
                  months={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                />
              </Grid>

              {/* 代理店フィルター - 年月選択の横に配置 */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ my: 0.25 }}>
                  <InputLabel id="agency-filter-label">所属会社</InputLabel>
                  <Select
                    labelId="agency-filter-label"
                    multiple
                    value={selectedAgencies}
                    label="所属会社"
                    onChange={handleAgencyChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === 0 ? 'すべて' : 
                          selected.length <= 2 ? selected.join(', ') : 
                          `${selected.length}社選択中`}
                      </Box>
                    )}
                  >
                    {agencies.map(agency => (
                      <MenuItem key={agency} value={agency}>{agency}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* イベント場所フィルター */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ my: 0.25 }}>
                  <InputLabel id="venue-filter-label">イベント場所</InputLabel>
                  <Select
                    labelId="venue-filter-label"
                    multiple
                    value={selectedVenues}
                    label="イベント場所"
                    onChange={handleVenueChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length === 0 ? 'すべて' : 
                          selected.length <= 1 ? selected.join(', ') : 
                          `${selected.length}箇所選択中`}
                      </Box>
                    )}
                  >
                    {venues.map(venue => (
                      <MenuItem key={venue} value={venue}>{venue}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 検索機能 */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" variant="outlined" sx={{ my: 0.25 }}>
                  <InputLabel htmlFor="staff-search">稼働者名で検索</InputLabel>
                  <OutlinedInput
                    id="staff-search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    }
                    label="稼働者名で検索"
                  />
                </FormControl>
              </Grid>
            </Grid>

            {/* フィルター情報と検索結果表示 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 0.5
            }}>
              <Typography variant="caption" color="text.secondary">
                {filteredAssignments.length === 0 ? 
                  '該当するデータがありません' : 
                  `${filteredAssignments.length}件表示中`}
              </Typography>
              
              {/* リセットボタン */}
              {(selectedAgencies.length > 0 || selectedVenues.length > 0 || searchTerm.trim() !== '') && (
                <Chip 
                  label="フィルターをリセット" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  onClick={handleResetFilters}
                />
              )}
            </Box>
          </Paper>

          {/* テーブルコンテナ - 最大領域を確保 */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: 0
              }
            }}
          >
            {filteredPairs.length > 0 ? (
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHead>
                  {/* 1行目: 代理店名 - 高さを小さく */}
                  <TableRow sx={{ height: '30px' }}>
                    <TableCell 
                      rowSpan={2}
                      sx={{ 
                        fontWeight: 'bold',
                        bgcolor: '#3F51B5',
                        color: 'white',
                        minWidth: '100px',
                        verticalAlign: 'middle',
                        position: 'sticky',
                        left: 0,
                        top: 0,
                        zIndex: 5,
                        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                        p: 0.5 // パディングを小さく
                      }}
                    >
                      日付
                    </TableCell>
                    {filteredAgencies.map((agency, agencyIndex) => {
                      const venueCount = filteredPairs.filter(p => p.agency === agency).length;
                      // 隣接する代理店が同じ色にならないように色を取得
                      const agencyColor = getAgencyColorForDisplay(agency, agencyIndex, filteredAgencies);
                      return (
                        <TableCell 
                          key={agency}
                          align="center"
                          colSpan={venueCount}
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: agencyColor.dark,
                            color: 'white',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 3,
                            p: 0.5, // パディングを小さく
                            borderBottom: 0,
                            boxShadow: '0 2px 4px -2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {agency}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {/* 2行目: イベント場所名 - 高さを小さく */}
                  <TableRow sx={{ height: '30px' }}>
                    {filteredPairs.map((pair, index) => {
                      // 現在の代理店のインデックスを取得
                      const agencyIndex = filteredAgencies.indexOf(pair.agency);
                      // 隣接する代理店が同じ色にならないように色を取得
                      const agencyColor = getAgencyColorForDisplay(pair.agency, agencyIndex, filteredAgencies);
                      return (
                        <TableCell 
                          key={`${pair.agency}-${pair.venue}-${index}`}
                          align="center"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: agencyColor.light,
                            color: 'rgba(0, 0, 0, 0.87)',
                            minWidth: '150px',
                            maxWidth: '150px',
                            width: '150px',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                            position: 'sticky',
                            top: 30, // 1行目の高さに合わせる
                            zIndex: 3,
                            p: 0.5, // パディングを小さく
                            borderTop: 0,
                            boxShadow: '0 2px 4px -2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Tooltip title={pair.venue} placement="top">
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                fontSize: '0.7rem', // フォントサイズを小さく
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%',
                                maxWidth: '130px'
                              }}
                            >
                              {pair.venue}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dates.map(dateInfo => {
                    const bgColor = dateInfo.dayOfWeek === '土' ? '#E3F2FD' : 
                                    dateInfo.dayOfWeek === '日' ? '#FFEBEE' : 
                                    '#FFFFFF';
                    
                    const rowBgColor = dateInfo.dayOfWeek === '土' ? 'rgba(227, 242, 253, 0.3)' : 
                                       dateInfo.dayOfWeek === '日' ? 'rgba(255, 235, 238, 0.3)' : 
                                       'inherit';
                    
                    return (
                      <TableRow 
                        key={dateInfo.date} 
                        sx={{ 
                          height: '50px !important', // 行の高さを小さく
                          minHeight: '50px !important',
                          maxHeight: '50px !important',
                          bgcolor: rowBgColor,
                          '& .MuiTableCell-root': {
                            height: '50px !important', // セルの高さを小さく
                            padding: '4px', // パディングを小さく
                            boxSizing: 'border-box'
                          }
                        }}
                      >
                        {/* 日付セル */}
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: bgColor,
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            height: '50px !important',
                            boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)',
                            '&:hover': {
                              bgcolor: dateInfo.dayOfWeek === '土' ? 'rgba(227, 242, 253, 0.7)' : 
                                      dateInfo.dayOfWeek === '日' ? 'rgba(255, 235, 238, 0.7)' : 
                                      'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 'bold' }}>
                              {dateInfo.displayDate}
                            </Typography>
                            <Chip 
                              label={dateInfo.dayOfWeek} 
                              size="small" 
                              color={
                                dateInfo.dayOfWeek === '土' ? 'info' : 
                                dateInfo.dayOfWeek === '日' ? 'error' : 
                                'default'
                              }
                              sx={{ 
                                height: 16, 
                                fontSize: '0.6rem',
                                minWidth: '20px'
                              }} 
                            />
                          </Box>
                        </TableCell>

                        {/* 会場ごとのセル */}
                        {filteredPairs.map((pair, index) => {
                          const assignments = dateGroups[dateInfo.date]?.filter(
                            a => a.agency === pair.agency && a.venue === pair.venue
                          ) || [];
                          
                          const assignment = assignments[0];
                          
                          let cellBgColor;
                          if (dateInfo.dayOfWeek === '土') {
                            cellBgColor = assignment ? 
                              'rgba(227, 242, 253, 0.5)' : 
                              'rgba(227, 242, 253, 0.3)';
                          } else if (dateInfo.dayOfWeek === '日') {
                            cellBgColor = assignment ? 
                              'rgba(255, 235, 238, 0.5)' : 
                              'rgba(255, 235, 238, 0.3)';
                          } else {
                            cellBgColor = assignment ? 'rgba(0, 0, 0, 0.02)' : 'white';
                          }
                          
                          let hoverBgColor;
                          if (dateInfo.dayOfWeek === '土') {
                            hoverBgColor = 'rgba(227, 242, 253, 0.8)';
                          } else if (dateInfo.dayOfWeek === '日') {
                            hoverBgColor = 'rgba(255, 235, 238, 0.8)';
                          } else {
                            hoverBgColor = 'rgba(0, 0, 0, 0.08)';
                          }
                          
                          return (
                            <TableCell 
                              key={`${pair.agency}-${pair.venue}-${index}-${dateInfo.date}`}
                              align="left"
                              sx={{ 
                                p: 0.5, // パディングを小さく
                                bgcolor: cellBgColor,
                                borderLeft: '1px dashed rgba(224, 224, 224, 1)',
                                height: '50px !important', // 高さを小さく
                                minHeight: '50px !important',
                                maxHeight: '50px !important',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                '&:hover': {
                                  bgcolor: hoverBgColor,
                                  transition: 'background-color 0.15s ease-in-out'
                                }
                              }}
                            >
                              {assignment && (
                                <Box sx={{ 
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  overflow: 'visible'
                                }}>
                                  {/* 上部の人数表示 */}
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 0.25, // マージンを小さく
                                    height: '16px', // 高さを小さく
                                    flexShrink: 0,
                                    overflow: 'visible'
                                  }}>
                                    <Chip 
                                      label={`${assignment.staff.length}名`} 
                                      size="small" 
                                      color="primary"
                                      variant="outlined"
                                      sx={{ mr: 0.5, height: 16, fontSize: '0.6rem' }} // サイズを小さく
                                    />
                                  </Box>
                                  
                                  {/* スタッフリスト - より小さく */}
                                  <Box sx={{ 
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    gap: '2px', // 間隔を小さく
                                    overflow: 'visible'
                                  }}>
                                    {/* 最初の2人を表示 */}
                                    {assignment.staff.slice(0, Math.min(2, assignment.staff.length)).map(staff => {
                                      const shouldHighlight = searchTerm.trim() !== '' && 
                                        staff.name.toLowerCase().includes(searchTerm.toLowerCase());
                                      
                                      return (
                                        <Box 
                                          key={staff.id}
                                          sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontSize: '0.7rem', // フォントサイズを小さく
                                            color: staff.isGirl ? '#E53935' : '#1976D2',
                                            fontWeight: shouldHighlight ? 'bold' : 'normal',
                                            bgcolor: shouldHighlight ? 'rgba(255, 235, 59, 0.3)' : 'transparent',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            height: '14px', // 高さを小さく
                                            flexShrink: 0
                                          }}
                                        >
                                          <Box 
                                            sx={{ 
                                              width: 6, // サイズを小さく
                                              height: 6, // サイズを小さく
                                              borderRadius: '50%', 
                                              bgcolor: staff.isGirl ? '#E53935' : '#1976D2',
                                              mr: 0.5,
                                              flexShrink: 0
                                            }} 
                                          />
                                          {staff.name}
                                        </Box>
                                      );
                                    })}
                                    
                                    {/* 他X名の表示 */}
                                    {assignment.staff.length > 2 && (
                                      <Box 
                                        key="remainder"
                                        sx={{ 
                                          display: 'flex', 
                                          justifyContent: 'flex-end',
                                          alignItems: 'center',
                                          fontSize: '0.7rem', // フォントサイズを小さく
                                          height: '14px', // 高さを小さく
                                          flexShrink: 0,
                                          position: 'relative',
                                          zIndex: 1,
                                          mt: '1px' // マージンを小さく
                                        }}
                                      >
                                        <Tooltip 
                                          title={
                                            <Box sx={{ p: 0.5 }}>
                                              <Typography variant="subtitle2" sx={{ 
                                                fontWeight: 'bold', 
                                                display: 'block', 
                                                mb: 0.5,
                                                color: '#fff',
                                                borderBottom: '1px solid rgba(255,255,255,0.3)',
                                                pb: 0.5
                                              }}>
                                                残りのスタッフ ({assignment.staff.length - 2}名)
                                              </Typography>
                                              <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {assignment.staff.slice(2).map(staff => {
                                                  const shouldHighlight = searchTerm.trim() !== '' && 
                                                    staff.name.toLowerCase().includes(searchTerm.toLowerCase());
                                                  
                                                  return (
                                                    <Box 
                                                      key={staff.id} 
                                                      sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 0.5,
                                                        backgroundColor: shouldHighlight ? 'rgba(255,255,0,0.2)' : 'transparent',
                                                        borderRadius: '4px',
                                                        p: shouldHighlight ? 0.5 : 0
                                                      }}
                                                    >
                                                      <Box 
                                                        sx={{ 
                                                          width: 8, 
                                                          height: 8, 
                                                          borderRadius: '50%', 
                                                          bgcolor: staff.isGirl ? '#E53935' : '#1976D2',
                                                          mr: 0.5,
                                                          flexShrink: 0
                                                        }} 
                                                      />
                                                      <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                          color: staff.isGirl ? '#ffcdd2' : '#bbdefb',
                                                          fontWeight: shouldHighlight ? 'bold' : 'normal',
                                                        }}
                                                      >
                                                        {staff.name}
                                                      </Typography>
                                                    </Box>
                                                  );
                                                })}
                                              </Box>
                                            </Box>
                                          }
                                          placement="top-end"
                                          arrow
                                          componentsProps={{
                                            tooltip: {
                                              sx: {
                                                bgcolor: 'rgba(45, 45, 45, 0.95)',
                                                '& .MuiTooltip-arrow': {
                                                  color: 'rgba(45, 45, 45, 0.95)',
                                                },
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                                borderRadius: '8px',
                                                p: 1
                                              }
                                            }
                                          }}
                                        >
                                          <Box 
                                            sx={{ 
                                              color: '#757575',
                                              fontStyle: 'italic',
                                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                                              px: 0.8,
                                              py: 0.1, // パディングを小さく
                                              borderRadius: 1,
                                              cursor: 'pointer',
                                              lineHeight: 1.1, // 行の高さを小さく
                                              '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.08)',
                                                color: '#1976D2'
                                              }
                                            }}
                                          >
                                            他{assignment.staff.length - 2}名
                                          </Box>
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">該当するデータがありません</Typography>
              </Box>
            )}
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
} 