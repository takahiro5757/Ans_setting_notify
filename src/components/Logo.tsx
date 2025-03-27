'use client';

import { Box } from '@mui/material';
import Image from 'next/image';

export default function Logo() {
  return (
    <Box sx={{ bgcolor: 'white', px: 2, py: 1.5 }}>
      <Image
        src="/ansteype-logo.png"
        alt="ANSTEYPE"
        width={180}
        height={40}
        style={{ objectFit: 'contain' }}
        priority
      />
    </Box>
  );
} 