'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Container component="main" sx={{ flex: 1, py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ようこそ、ANSTEYPEへ
        </Typography>
        <Typography variant="body1" paragraph>
          イベントプロモーション営業支援システムです。
          上部のメニューから各機能にアクセスできます。
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            主な機能：
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>営業管理 - 営業活動の記録と管理</li>
            <li>経理処理 - 売上・経費の管理</li>
            <li>シフト管理 - スタッフのシフト管理</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 