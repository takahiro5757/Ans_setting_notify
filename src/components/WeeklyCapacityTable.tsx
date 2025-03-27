import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

interface WeeklyCapacityTableProps {
  weeks: {
    week: string;
    closerCapacity: number;
    girlCapacity: number;
    maxCapacity: number;
  }[];
}

export const WeeklyCapacityTable: React.FC<WeeklyCapacityTableProps> = ({ weeks }) => (
  <Box>
    <TableContainer component={Paper}>
      <Table size="small" sx={{ 
        '& .MuiTableCell-root': { 
          borderColor: '#e0e0e0',
          py: 1
        }
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '80px', bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>週</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center" sx={{ width: '80px', bgcolor: '#fafafa' }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>{week.week}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'normal' }}>クローザー枠数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{week.closerCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#e91e63', fontWeight: 'normal' }}>ガール枠数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2" sx={{ color: '#e91e63', fontWeight: 'bold' }}>{week.girlCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>稼働可能人数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2">{week.maxCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default WeeklyCapacityTable; 