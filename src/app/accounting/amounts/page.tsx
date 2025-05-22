'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';

export default function AmountsPage() {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">金額確認</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>案件の売上・経費・利益などの金額確認ページです。</Typography>
        </Paper>
      </Container>
    </Box>
  );
} 