'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  // 経理処理メニュー項目の定義
  const menuItems = [
    {
      title: '案件一覧',
      description: '案件の登録・管理を行います',
      icon: AssignmentIcon,
      path: '/accounting/projects',
      color: '#1976d2'
    },
    {
      title: '見積処理',
      description: '見積書の作成・管理を行います',
      icon: DescriptionIcon,
      path: '/accounting/estimates',
      color: '#ff9800'
    },
    {
      title: '請求処理',
      description: '請求書の作成・管理を行います',
      icon: ReceiptIcon,
      path: '/accounting/invoices',
      color: '#2e7d32'
    },
    {
      title: '金額確認',
      description: '売上・経費・利益などを確認します',
      icon: MonetizationOnIcon,
      path: '/accounting/amounts',
      color: '#d32f2f'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 3 }}>
      <Container maxWidth={false}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>経理処理</Typography>
          
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                  <CardActionArea 
                    onClick={() => router.push(item.path)}
                    sx={{ height: '100%', p: 1 }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}20`,
                          color: item.color,
                          borderRadius: '50%',
                          width: 60,
                          height: 60,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <item.icon fontSize="large" />
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
} 