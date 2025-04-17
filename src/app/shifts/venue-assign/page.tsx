'use client';

import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function VenueAssignPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: '#1B3C8C', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          開発中のページです
        </Typography>
        <Typography variant="h6" gutterBottom color="primary">
          現場×アサイン確認機能
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          現場×アサイン確認機能は現在開発中です。完成までしばらくお待ちください。
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#1B3C8C',
            '&:hover': { bgcolor: '#152C6C' } 
          }}
          onClick={() => router.push('/')}
        >
          ホームに戻る
        </Button>
      </Paper>
    </Container>
  );
} 