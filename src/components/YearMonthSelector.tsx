'use client';

import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface YearMonthSelectorProps {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  years?: string[];
  months?: string[];
}

const YearMonthSelector = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  years = ['2024'],
  months = Array.from({ length: 12 }, (_, i) => String(i + 1))
}: YearMonthSelectorProps) => {

  const handleYearChange = (event: SelectChangeEvent) => {
    onYearChange(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    onMonthChange(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FormControl size="small">
        <InputLabel>対象年</InputLabel>
        <Select
          value={year}
          label="対象年"
          onChange={handleYearChange}
          sx={{ width: 120 }}
        >
          {years.map((yearValue) => (
            <MenuItem key={yearValue} value={yearValue}>{yearValue}年</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>対象月</InputLabel>
        <Select
          value={month}
          label="対象月"
          onChange={handleMonthChange}
          sx={{ width: 120 }}
        >
          {months.map((monthValue) => (
            <MenuItem key={monthValue} value={monthValue}>{monthValue}月</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default YearMonthSelector; 