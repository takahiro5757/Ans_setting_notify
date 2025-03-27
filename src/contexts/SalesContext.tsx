'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SalesData {
  id: string;
  assignee: string;
  updatedBy: string;
  status: string;
  agency: string;
  schedule: boolean[];
  location: string;
  phone: string;
  counts: {
    closer: number;
    girl: number;
    newCustomer: number;
    repeater: number;
  };
  staff: {
    closer: {
      count: number;
      unitPrice: number;
      transportationFee: number;
    };
    girl: {
      count: number;
      unitPrice: number;
      transportationFee: number;
    };
  };
}

interface SalesContextType {
  salesData: SalesData[];
  updateSalesData: (id: string, newData: Partial<SalesData>) => void;
  addSalesData: (data: SalesData) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [salesData, setSalesData] = useState<SalesData[]>(Array(10).fill(null).map((_, index) => ({
    id: `sale-${index}`,
    assignee: '田中',
    updatedBy: '山田',
    status: '申請中',
    agency: '代理店連絡済',
    schedule: Array(7).fill(false),
    location: '島忠ホームズ 3F',
    phone: '080-1111-1111',
    counts: {
      closer: 1,
      girl: 2,
      newCustomer: 0,
      repeater: 0,
    },
    staff: {
      closer: {
        count: 3,
        unitPrice: 20000,
        transportationFee: 5000,
      },
      girl: {
        count: 3,
        unitPrice: 10000,
        transportationFee: 3000,
      },
    },
  })));

  const updateSalesData = (id: string, newData: Partial<SalesData>) => {
    setSalesData(prev => prev.map(item => 
      item.id === id ? { ...item, ...newData } : item
    ));
  };

  const addSalesData = (data: SalesData) => {
    setSalesData(prev => [...prev, data]);
  };

  return (
    <SalesContext.Provider value={{ salesData, updateSalesData, addSalesData }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
} 