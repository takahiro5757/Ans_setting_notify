export interface SalesData {
  id: string;
  assignee: string;
  updatedBy: string;
  status: string;
  agency: string;
  schedule: boolean[];
  isBandShift: boolean;
  bandShiftCount: number;
  location: {
    name: string;
    manager: string;
    mainStore: string;
    jointStores: string[];
    hasLocation: boolean;
    isOutdoor: boolean;
    hasBusinessTrip: boolean;
  };
  phone: string;
  dayType: '平日' | '週末';
  counts: {
    closer: number;
    girl: number;
    traineeCloser: number;
    freeStaff: number;
  };
  unitPrices: {
    closer: number;
    girl: number;
  };
  transportationFees: {
    closer: number;
    girl: number;
  };
  memo: string;
} 