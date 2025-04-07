'use client';

import { TableCell, Box, IconButton, Typography, SxProps, Theme } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import FlightIcon from '@mui/icons-material/Flight';
import EditIcon from '@mui/icons-material/Edit';
import { Venue } from '../types';

interface VenueInfoCellProps {
  venue: Venue;
  onOrderEdit: () => void;
  sx?: SxProps<Theme>;
}

export const VenueInfoCell = ({ venue, onOrderEdit, sx }: VenueInfoCellProps) => {
  return (
    <TableCell sx={{ ...sx }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {venue.agency}
          </Typography>
          {venue.isOutsideVenue && (
            <PlaceIcon fontSize="small" color="primary" />
          )}
          {venue.hasBusinessTrip && (
            <FlightIcon fontSize="small" color="primary" />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {venue.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {venue.orders.map((order) => (
            <Box 
              key={order.id} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: order.type === 'クローザー' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(233, 30, 99, 0.1)',
                padding: '2px 8px',
                borderRadius: 1
              }}
            >
              <Typography variant="caption" sx={{ color: order.type === 'クローザー' ? 'primary.main' : 'error.main' }}>
                {order.type}
              </Typography>
              <Typography variant="caption">
                {order.count}名
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            size="small" 
            onClick={onOrderEdit}
            sx={{ 
              padding: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </TableCell>
  );
}; 