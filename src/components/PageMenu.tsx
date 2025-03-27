'use client';

import { Box, Tabs, Tab } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

interface PageMenuProps {
  items: {
    label: string;
    path: string;
  }[];
}

export default function PageMenu({ items }: PageMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (_event: React.SyntheticEvent, newPath: string) => {
    router.push(newPath);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={pathname}
        onChange={handleChange}
        aria-label="page navigation"
        sx={{
          '& .MuiTab-root': {
            minWidth: 120,
            fontWeight: 'bold',
          },
        }}
      >
        {items.map((item) => (
          <Tab
            key={item.path}
            label={item.label}
            value={item.path}
          />
        ))}
      </Tabs>
    </Box>
  );
} 