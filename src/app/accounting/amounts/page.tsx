'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';

export default function InvoicesPage() {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">金額管理</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>コンテンツ準備中です。</Typography>
        </Paper>
      </Container>
    </Box>
  );
} 