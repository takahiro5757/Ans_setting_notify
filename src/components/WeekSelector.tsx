'use client';

import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

interface WeekSelectorProps {
  selectedWeek: number;
  onChange: (week: number) => void;
  weekCount?: number; // デフォルトは6週（0-5）
}

const WeekSelector = ({ selectedWeek, onChange, weekCount = 6 }: WeekSelectorProps) => {
  // 週選択用のToggleButtonスタイル
  const weekToggleButtonStyle: SxProps<Theme> = {
    px: 3,
    py: 1,
    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      backgroundColor: '#e0e0e0',
      color: '#333333',
      borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
      borderTop: '1px solid rgba(0, 0, 0, 0.2)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
      fontWeight: 'bold',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        backgroundColor: '#d5d5d5',
      },
    },
    '&:first-of-type': {
      borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    }
  };

  // ToggleButtonGroupスタイル
  const toggleButtonGroupStyle: SxProps<Theme> = { 
    bgcolor: 'white', 
    boxShadow: 1, 
    borderRadius: 1
  };

  const handleWeekChange = (event: React.MouseEvent<HTMLElement>, newWeek: number | null) => {
    if (newWeek !== null) {
      onChange(newWeek);
    }
  };

  // 0Wから5Wまでの週を生成
  const weeks = Array.from({ length: weekCount }, (_, i) => i);

  return (
    <Box sx={{ mb: 3 }}>
      <ToggleButtonGroup
        value={selectedWeek}
        exclusive
        onChange={handleWeekChange}
        aria-label="週選択"
        size="small"
        sx={toggleButtonGroupStyle}
      >
        {weeks.map((week) => (
          <ToggleButton 
            key={week}
            value={week}
            sx={weekToggleButtonStyle}
          >
            <Typography variant="body2">{week}W</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default WeekSelector; 