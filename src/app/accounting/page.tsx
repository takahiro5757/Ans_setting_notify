'use client';

import {
  Box,
  Container,
  Typography,
} from '@mui/material';

export default function Page() {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false}>
        <Box>
          <Typography variant="h6">経理処理</Typography>
        </Box>
      </Container>
    </Box>
  );
} 