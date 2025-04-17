'use client';

import { Box, Typography } from '@mui/material';

interface BreadcrumbProps {
  items: string[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ color: '#666' }}>
        {items.join(' / ')}
      </Typography>
    </Box>
  );
};

export default Breadcrumb; 