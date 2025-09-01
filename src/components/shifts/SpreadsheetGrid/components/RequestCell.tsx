'use client';

import React, { useState, memo, useEffect } from 'react';
import { 
  TableCell, 
  styled, 
  TextField,
  Typography,
  Box
} from '@mui/material';
import { StaffRequest } from '../types';

const Cell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 12,
  whiteSpace: 'nowrap',
  height: 36,
  lineHeight: 1,
  borderRight: '1px solid #000000',
  verticalAlign: 'middle',
  position: 'relative'
}));

interface RequestCellProps {
  staffId: string;
  request?: StaffRequest;
  isReadOnly?: boolean;
  onRequestTextChange?: (staffId: string, text: string) => void;
}

const RequestCell: React.FC<RequestCellProps> = memo(({ 
  staffId, 
  request, 
  isReadOnly = false, 
  onRequestTextChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(request?.requestText || '');

  useEffect(() => {
    setEditValue(request?.requestText || '');
  }, [request?.requestText]);

  const handleClick = () => {
    if (!isReadOnly) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onRequestTextChange && editValue !== (request?.requestText || '')) {
      onRequestTextChange(staffId, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditValue(request?.requestText || '');
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  if (isEditing) {
    return (
      <Cell>
        <TextField
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          variant="standard"
          size="small"
          autoFocus
          fullWidth
          multiline
          maxRows={2}
          sx={{
            '& .MuiInput-root': {
              fontSize: 12,
              padding: 0,
            },
            '& .MuiInputBase-input': {
              padding: '2px 4px',
              textAlign: 'center',
            }
          }}
        />
      </Cell>
    );
  }

  return (
    <Cell 
      onClick={handleClick}
      sx={{
        cursor: isReadOnly ? 'default' : 'pointer',
        '&:hover': {
          backgroundColor: isReadOnly ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 24,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: 12,
            lineHeight: 1.2,
            wordBreak: 'break-word',
            maxWidth: '100%',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {request?.requestText || ''}
        </Typography>
      </Box>
    </Cell>
  );
});

RequestCell.displayName = 'RequestCell';

export default RequestCell; 