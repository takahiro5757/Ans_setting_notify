'use client';

import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { getAvailableWeeks } from '@/utils/dateUtils';

interface WeekSelectorProps {
  selectedWeek: number | string;
  onChange: (week: number | string) => void;
  year?: string | number;
  month?: string | number;
  showMonthlyPayment?: boolean;
}

const WeekSelector = ({ 
  selectedWeek, 
  onChange, 
  year = new Date().getFullYear(), 
  month = new Date().getMonth() + 1,
  showMonthlyPayment = false
}: WeekSelectorProps) => {
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

  const handleWeekChange = (event: React.MouseEvent<HTMLElement>, newWeek: number | string | null) => {
    if (newWeek !== null) {
      onChange(newWeek);
    }
  };

  // 指定された年月に基づいて利用可能な週を取得
  const availableWeeks = getAvailableWeeks(year, month);

  return (
    <Box>
      <ToggleButtonGroup
        value={selectedWeek}
        exclusive
        onChange={handleWeekChange}
        aria-label="週選択"
        size="small"
        sx={toggleButtonGroupStyle}
      >
        {availableWeeks.map((week) => (
          <ToggleButton 
            key={week}
            value={week}
            sx={weekToggleButtonStyle}
          >
            <Typography variant="body2">{week}W</Typography>
          </ToggleButton>
        ))}
        {showMonthlyPayment && (
          <ToggleButton 
            key="monthly"
            value="monthly"
            sx={weekToggleButtonStyle}
          >
            <Typography variant="body2">月払い</Typography>
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    </Box>
  );
};

export default WeekSelector; 