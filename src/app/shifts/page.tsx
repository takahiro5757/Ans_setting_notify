'use client';

import { Box, Typography, Paper } from '@mui/material';

export default function Page() {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          シフト管理
          </Typography>
        <Typography>
          シフト管理ページの内容がここに表示されます。
                            </Typography>
            </Paper>
          </Box>
  );
} 