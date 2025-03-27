import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

interface SalesDetailsProps {
  counts: {
    closer: number;
    girl: number;
    traineeCloser: number;
    freeStaff: number;
  };
  unitPrices: {
    closer: number;
    girl: number;
  };
  transportationFees: {
    closer: number;
    girl: number;
  };
  schedule: boolean[];
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SalesDetails = ({ counts, unitPrices, transportationFees, schedule, isEditing, onEdit }: SalesDetailsProps) => (
  <Box sx={{ minWidth: '300px', flex: '0 0 auto' }}>
    <Box sx={{ mb: 2 }}>
      {isEditing ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              size="small"
              label="クローザー人数"
              type="number"
              value={counts.closer}
              onChange={onEdit}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              size="small"
              label="ガール人数"
              type="number"
              value={counts.girl}
              onChange={onEdit}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              size="small"
              label="研修クローザー人数"
              type="number"
              value={counts.traineeCloser}
              onChange={onEdit}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              size="small"
              label="無料入店人数"
              type="number"
              value={counts.freeStaff}
              onChange={onEdit}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>単価</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                size="small"
                label="クローザー単価"
                type="number"
                value={unitPrices.closer}
                onChange={onEdit}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                size="small"
                label="ガール単価"
                type="number"
                value={unitPrices.girl}
                onChange={onEdit}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>交通費</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                size="small"
                label="クローザー交通費"
                type="number"
                value={transportationFees.closer}
                onChange={onEdit}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                size="small"
                label="ガール交通費"
                type="number"
                value={transportationFees.girl}
                onChange={onEdit}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>人数</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            <Typography variant="body2">クローザー: {counts.closer}名</Typography>
            <Typography variant="body2">ガール: {counts.girl}名</Typography>
            <Typography variant="body2">研修クローザー: {counts.traineeCloser}名</Typography>
            <Typography variant="body2">無料入店: {counts.freeStaff}名</Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>単価</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            <Typography variant="body2">クローザー: ¥{unitPrices.closer.toLocaleString()}</Typography>
            <Typography variant="body2">ガール: ¥{unitPrices.girl.toLocaleString()}</Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>交通費</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">クローザー: ¥{transportationFees.closer.toLocaleString()}</Typography>
            <Typography variant="body2">ガール: ¥{transportationFees.girl.toLocaleString()}</Typography>
          </Box>
        </>
      )}
    </Box>
  </Box>
); 