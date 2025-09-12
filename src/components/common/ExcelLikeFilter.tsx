'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Typography,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  SelectAll as SelectAllIcon,
} from '@mui/icons-material';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ExcelLikeFilterProps {
  /** フィルターのタイトル */
  title: string;
  /** フィルターオプションの配列 */
  options: FilterOption[];
  /** 選択された値の配列 */
  selectedValues: string[];
  /** フィルター変更時のコールバック */
  onFilterChange: (selectedValues: string[]) => void;
  /** フィルターがアクティブかどうか */
  isActive?: boolean;
  /** 検索機能を有効にするか */
  enableSearch?: boolean;
  /** 最大表示アイテム数 */
  maxDisplayItems?: number;
}

/**
 * Excelライクなフィルターコンポーネント
 * カラムヘッダーに配置して使用する
 */
const ExcelLikeFilter: React.FC<ExcelLikeFilterProps> = ({
  title,
  options,
  selectedValues,
  onFilterChange,
  isActive = false,
  enableSearch = true,
  maxDisplayItems = 200,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isOpen = Boolean(anchorEl);

  // フィルターされたオプション
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // 表示用オプション（最大数制限）
  const displayOptions = React.useMemo(() => {
    return filteredOptions.slice(0, maxDisplayItems);
  }, [filteredOptions, maxDisplayItems]);

  // フィルターボタンクリック
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // ポップオーバーを閉じる
  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  // 全選択/全解除
  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      // 全解除
      onFilterChange([]);
    } else {
      // 全選択
      onFilterChange(options.map(option => option.value));
    }
  };

  // 個別選択/解除
  const handleToggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onFilterChange(newSelectedValues);
  };

  // フィルタークリア
  const handleClearFilter = () => {
    onFilterChange(options.map(option => option.value));
    handleClose();
  };

  // 適用ボタン
  const handleApply = () => {
    handleClose();
  };

  // 選択されたアイテム数
  const selectedCount = selectedValues.length;
  const totalCount = options.length;
  const isAllSelected = selectedCount === totalCount;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <>
      <IconButton
        ref={buttonRef}
        size="small"
        onClick={handleFilterClick}
        sx={{
          ml: 0.5,
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        aria-label={`${title}でフィルター`}
      >
        <ArrowDropDownIcon fontSize="small" />
      </IconButton>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 400,
            overflow: 'hidden',
          },
        }}
      >
        <Paper elevation={0}>
          {/* ヘッダー */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {title}でフィルター
            </Typography>
            
            {/* 選択状況表示 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={`${selectedCount}/${totalCount}件選択`}
                size="small"
                color={isAllSelected ? 'default' : 'primary'}
              />
              {isActive && (
                <Chip
                  label="フィルター中"
                  size="small"
                  color="warning"
                  onDelete={handleClearFilter}
                  deleteIcon={<ClearIcon />}
                />
              )}
            </Box>

            {/* 検索ボックス */}
            {enableSearch && (
              <TextField
                fullWidth
                size="small"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          </Box>

          {/* 全選択/全解除 */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleSelectAll}>
              <ListItemIcon>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartialSelected}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SelectAllIcon fontSize="small" />
                    <Typography variant="body2">
                      {isAllSelected ? '全て解除' : '全て選択'}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* オプションリスト */}
          <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
            <List dense>
              {displayOptions.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        該当する項目がありません
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                displayOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <ListItem key={option.value} disablePadding>
                      <ListItemButton onClick={() => handleToggleOption(option.value)}>
                        <ListItemIcon>
                          <Checkbox checked={isSelected} size="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {option.label}
                              </Typography>
                              {option.count !== undefined && (
                                <Chip 
                                  label={option.count} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    minWidth: 28,
                                  }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              )}
            </List>
          </Box>

          {/* フッター */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilter}
                startIcon={<ClearIcon />}
                sx={{ flex: 1 }}
              >
                クリア
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleApply}
                sx={{ flex: 1 }}
              >
                適用
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

export default ExcelLikeFilter;





