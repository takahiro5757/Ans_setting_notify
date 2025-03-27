import { Box, Button } from '@mui/material';

interface WeekTabsProps {
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}

export const WeekTabs: React.FC<WeekTabsProps> = ({ selectedWeek, onWeekChange }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map((week) => (
      <Button
        key={week}
        onClick={() => onWeekChange(week)}
        sx={{
          minWidth: '64px',
          height: '36px',
          borderRadius: 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          color: selectedWeek === week ? '#1976d2' : '#757575',
          bgcolor: selectedWeek === week ? '#E3F2FD' : '#EEEEEE',
          border: 'none',
          '&:hover': {
            bgcolor: selectedWeek === week ? '#E3F2FD' : '#E0E0E0',
          }
        }}
      >
        {week}週目
      </Button>
    ))}
  </Box>
);

export default WeekTabs; 