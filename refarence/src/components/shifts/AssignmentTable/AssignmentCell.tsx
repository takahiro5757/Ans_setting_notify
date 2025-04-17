'use client';

import { TableCell, Box, Typography } from '@mui/material';
import { Assignment } from '../types';

interface AssignmentCellProps {
  assignments: Assignment[];
  hasSlot: boolean;
}

export const AssignmentCell = ({ assignments, hasSlot }: AssignmentCellProps) => {
  return (
    <TableCell 
      sx={{ 
        backgroundColor: hasSlot ? '#ffffff' : '#f5f5f5',
        minWidth: '120px',
        height: '100%',
        p: 1
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {assignments.map((assignment) => (
          <Box
            key={`${assignment.staffId}-${assignment.date}`}
            sx={{
              backgroundColor: assignment.orderType === 'クローザー' 
                ? 'rgba(33, 150, 243, 0.1)' 
                : 'rgba(233, 30, 99, 0.1)',
              borderRadius: 1,
              padding: '2px 8px',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: assignment.orderType === 'クローザー' 
                  ? 'primary.main' 
                  : 'error.main',
                display: 'block',
                textAlign: 'center'
              }}
            >
              {assignment.staffName}
            </Typography>
          </Box>
        ))}
      </Box>
    </TableCell>
  );
}; 