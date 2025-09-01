'use client';

import React, { useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  Badge,
  styled,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  NotificationsOutlined as NotificationIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  MoreVert as MoreIcon,
  Visibility as UnreadIcon,
  VisibilityOff as ReadIcon
} from '@mui/icons-material';
import { NotificationFilter } from '@/stores/shiftStore';

// スタイル定義
const FilterContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const DropdownSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  fontSize: '0.875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const FilterChipGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: theme.spacing(0.75, 1.5),
  fontSize: '0.875rem',
  textTransform: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

interface FilterOption {
  key: NotificationFilter;
  label: string;
  icon: React.ReactNode;
  count?: number;
  category: 'general' | 'type' | 'status';
}

interface ImprovedNotificationFilterProps {
  /** 現在のフィルター */
  filter: NotificationFilter;
  /** フィルター変更コールバック */
  onFilterChange: (filter: NotificationFilter) => void;
  /** 各フィルターの件数（オプション） */
  filterCounts?: Partial<Record<NotificationFilter, number>>;
  /** フィルタースタイル */
  variant?: 'dropdown' | 'accordion' | 'tabs' | 'segments';
}

/**
 * 改善された通知フィルターコンポーネント
 * 
 * 複数のスタイルとレイアウトオプションを提供する柔軟なフィルターUI
 */
const ImprovedNotificationFilter: React.FC<ImprovedNotificationFilterProps> = ({
  filter,
  onFilterChange,
  filterCounts = {},
  variant = 'dropdown'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accordionExpanded, setAccordionExpanded] = useState<string | false>('general');

  // フィルターオプション定義
  const filterOptions: FilterOption[] = [
    { 
      key: 'all', 
      label: '全ての通知', 
      icon: <NotificationIcon fontSize="small" />, 
      count: filterCounts?.all ?? 0,
      category: 'general' 
    },
    { 
      key: 'unread', 
      label: '未読のみ', 
      icon: <UnreadIcon fontSize="small" />, 
      count: filterCounts?.unread ?? 0,
      category: 'general' 
    },
    { 
      key: 'submission', 
      label: 'シフト提出', 
      icon: <AssignmentIcon fontSize="small" />, 
      count: filterCounts?.submission ?? 0,
      category: 'type' 
    },
    { 
      key: 'change', 
      label: '変更依頼', 
      icon: <ScheduleIcon fontSize="small" />, 
      count: filterCounts?.change ?? 0,
      category: 'type' 
    },
    { 
      key: 'pending', 
      label: '承認待ち', 
      icon: <PendingIcon fontSize="small" />, 
      count: filterCounts?.pending ?? 0,
      category: 'status' 
    },
    { 
      key: 'approved', 
      label: '回答済み', 
      icon: <CheckCircleIcon fontSize="small" />, 
      count: filterCounts?.approved ?? 0,
      category: 'status' 
    },
  ];

  // カテゴリ別にフィルターをグループ化
  const filtersByCategory = filterOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, FilterOption[]>);

  // 現在選択されているフィルターの情報を取得
  const currentFilter = filterOptions.find(option => option.key === filter);

  // ドロップダウン式フィルター
  const DropdownFilter = () => (
    <FormControl fullWidth size="small">
      <DropdownSelect
        value={filter}
        onChange={(e: SelectChangeEvent<unknown>) => onFilterChange(e.target.value as NotificationFilter)}
        displayEmpty
        startAdornment={<FilterIcon sx={{ color: 'text.secondary', mr: 1 }} />}
      >
        {filterOptions.map((option) => (
          <MenuItem key={option.key} value={option.key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {option.icon}
              <Typography sx={{ flex: 1 }}>{option.label}</Typography>
              {option.count !== undefined && (
                <Chip 
                  label={option.count} 
                  size="small" 
                  color={option.count > 0 ? 'primary' : 'default'}
                  sx={{ minWidth: 32, height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </DropdownSelect>
    </FormControl>
  );

  // アコーディオン式フィルター
  const AccordionFilter = () => (
    <Box>
      {Object.entries(filtersByCategory).map(([category, options]) => (
        <Accordion 
          key={category}
          expanded={accordionExpanded === category}
          onChange={(_, isExpanded) => setAccordionExpanded(isExpanded ? category : false)}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              {category === 'general' && '表示設定'}
              {category === 'type' && '通知タイプ'}
              {category === 'status' && 'ステータス'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <FilterChipGroup>
              {options.map((option) => (
                <Chip
                  key={option.key}
                  icon={React.isValidElement(option.icon) ? option.icon : undefined}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {option.label}
                      {option.count !== undefined && (
                        <Badge 
                          badgeContent={option.count} 
                          color={option.count > 0 ? 'primary' : 'default'}
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.625rem', height: 16, minWidth: 16 } }}
                        />
                      )}
                    </Box>
                  }
                  color={filter === option.key ? 'primary' : 'default'}
                  onClick={() => onFilterChange(option.key)}
                  clickable
                  size="small"
                />
              ))}
            </FilterChipGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  // セグメント式フィルター
  const SegmentFilter = () => {
    const mainFilters = filterOptions.slice(0, 4); // 主要フィルターのみ表示
    const remainingFilters = filterOptions.slice(4);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => newFilter && onFilterChange(newFilter)}
          size="small"
        >
          {mainFilters.map((option) => (
            <StyledToggleButton key={option.key} value={option.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {option.icon}
                {option.label}
                {option.count !== undefined && option.count > 0 && (
                  <Chip 
                    label={option.count} 
                    size="small" 
                    sx={{ 
                      height: 18, 
                      fontSize: '0.6rem',
                      backgroundColor: filter === option.key ? 'rgba(255,255,255,0.2)' : 'primary.main',
                      color: filter === option.key ? 'inherit' : 'white'
                    }}
                  />
                )}
              </Box>
            </StyledToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* その他のフィルター用メニュー */}
        {remainingFilters.length > 0 && (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 1 }}
            >
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {remainingFilters.map((option) => (
                <MenuItem 
                  key={option.key} 
                  onClick={() => {
                    onFilterChange(option.key);
                    setAnchorEl(null);
                  }}
                  selected={filter === option.key}
                >
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText>{option.label}</ListItemText>
                  {option.count !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {option.count}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    );
  };

  // タブ式フィルター
  const TabFilter = () => (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => newFilter && onFilterChange(newFilter)}
          sx={{ width: '100%' }}
        >
          {filterOptions.map((option) => (
            <StyledToggleButton 
              key={option.key} 
              value={option.key}
              sx={{ 
                flex: 1, 
                borderRadius: 0,
                borderBottom: filter === option.key ? 2 : 0,
                borderBottomColor: 'primary.main'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                {option.icon}
                <Typography variant="caption">{option.label}</Typography>
                {option.count !== undefined && (
                  <Chip 
                    label={option.count} 
                    size="small" 
                    color={option.count > 0 ? 'primary' : 'default'}
                    sx={{ height: 16, fontSize: '0.625rem' }}
                  />
                )}
              </Box>
            </StyledToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );

  // バリアントに応じてコンポーネントを選択
  const renderFilter = () => {
    switch (variant) {
      case 'dropdown':
        return <DropdownFilter />;
      case 'accordion':
        return <AccordionFilter />;
      case 'segments':
        return <SegmentFilter />;
      case 'tabs':
        return <TabFilter />;
      default:
        return <DropdownFilter />;
    }
  };

  return (
    <FilterContainer>
      {renderFilter()}
    </FilterContainer>
  );
};

export default ImprovedNotificationFilter;