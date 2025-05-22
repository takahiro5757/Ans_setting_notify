'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';

export default function ShiftsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/shifts/management');
  }, [router]);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false}>
        <Typography variant="body1">リダイレクト中...</Typography>
      </Container>
    </Box>
  );
} 