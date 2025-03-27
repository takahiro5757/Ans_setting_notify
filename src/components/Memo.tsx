import {
  Box,
  Typography,
  TextField
} from '@mui/material';

interface MemoProps {
  memo: string;
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Memo = ({ memo, isEditing, onEdit }: MemoProps) => (
  <Box sx={{ minWidth: '300px', flex: '1 1 auto' }}>
    <Box sx={{ mb: 2 }}>
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="メモ"
          value={memo}
          onChange={onEdit}
        />
      ) : (
        <Box sx={{ 
          p: 2, 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          minHeight: '100%',
          backgroundColor: '#fafafa'
        }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {memo}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
); 