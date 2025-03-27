import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  SelectChangeEvent
} from '@mui/material';

interface LocationDetailsProps {
  location: {
    name: string;
    manager: string;
    mainStore: string;
    jointStores: string[];
    hasLocation: boolean;
    isOutdoor: boolean;
    hasBusinessTrip: boolean;
  };
  phone: string;
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | string[]> | React.ChangeEvent<HTMLInputElement>) => void;
}

export const LocationDetails = ({ location, phone, isEditing, onEdit }: LocationDetailsProps) => (
  <Box sx={{ minWidth: '300px', flex: '0 0 auto' }}>
    <Box sx={{ mb: 2 }}>
      {isEditing ? (
        <>
          <TextField
            fullWidth
            size="small"
            label="場所名"
            value={location.name}
            onChange={onEdit}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              label="担当MG"
              value={location.manager}
              onChange={onEdit}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="電話番号"
              value={phone}
              onChange={onEdit}
              sx={{ flex: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>開催店舗</InputLabel>
              <Select
                value={location.mainStore}
                label="開催店舗"
                onChange={onEdit}
              >
                <MenuItem value="大宮">大宮</MenuItem>
                <MenuItem value="浦和">浦和</MenuItem>
                <MenuItem value="川越">川越</MenuItem>
                <MenuItem value="所沢">所沢</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>連名店舗</InputLabel>
              <Select
                multiple
                value={location.jointStores}
                label="連名店舗"
                onChange={onEdit}
              >
                <MenuItem value="大宮">大宮</MenuItem>
                <MenuItem value="浦和">浦和</MenuItem>
                <MenuItem value="川越">川越</MenuItem>
                <MenuItem value="所沢">所沢</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl>
              <Checkbox
                checked={location.hasLocation}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">場所取りあり</Typography>
            </FormControl>
            <FormControl>
              <Checkbox
                checked={location.isOutdoor}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">野外</Typography>
            </FormControl>
            <FormControl>
              <Checkbox
                checked={location.hasBusinessTrip}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">出張</Typography>
            </FormControl>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>{location.name}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Typography variant="body2">担当MG: {location.manager}</Typography>
            <Typography variant="body2">TEL: {phone}</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            開催店舗: {location.mainStore}
            {location.jointStores.length > 0 && ` (${location.jointStores.join(', ')})`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {location.hasLocation && (
              <Typography variant="body2" color="primary">場所取りあり</Typography>
            )}
            {location.isOutdoor && (
              <Typography variant="body2" color="primary">野外</Typography>
            )}
            {location.hasBusinessTrip && (
              <Typography variant="body2" color="primary">出張</Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  </Box>
); 