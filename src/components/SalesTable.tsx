'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  Button,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import FaceIcon from '@mui/icons-material/Face';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TerrainIcon from '@mui/icons-material/Terrain';
import FlightIcon from '@mui/icons-material/Flight';

interface SalesData {
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

const emptyRecord: SalesData = {
  id: '',
  assignee: '',
  updatedBy: '',
  status: '代理店連絡前',
  agency: '',
  schedule: [false, false, false, false, false, false, false],
  isBandShift: false,
  bandShiftCount: 0,
  location: {
    name: '',
    manager: '',
    mainStore: '',
    jointStores: [],
    hasLocation: false,
    isOutdoor: false,
    hasBusinessTrip: false
  },
  phone: '',
  dayType: '平日',
  counts: {
    closer: 0,
    girl: 0,
    traineeCloser: 0,
    freeStaff: 0
  },
  unitPrices: {
    closer: 18000,
    girl: 9000
  },
  transportationFees: {
    closer: 4000,
    girl: 2500
  },
  memo: ''
};

interface LocationDetailsProps {
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
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | string[]> | React.ChangeEvent<HTMLInputElement>) => void;
}

const LocationDetails = ({ location, phone, isEditing, onEdit }: LocationDetailsProps) => (
  <Box sx={{ minWidth: '200px', flex: '0 0 auto' }}>
    <Box sx={{ mb: 2 }}>
      {isEditing ? (
        <>
          <TextField
            fullWidth
            size="small"
            label="場所名"
            value={location.name}
            onChange={onEdit}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              label="担当MG"
              value={location.manager}
              onChange={onEdit}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="電話番号"
              value={phone}
              onChange={onEdit}
              sx={{ flex: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>開催店舗</InputLabel>
              <Select
                value={location.mainStore}
                label="開催店舗"
                onChange={onEdit}
              >
                <MenuItem value="大宮">大宮</MenuItem>
                <MenuItem value="浦和">浦和</MenuItem>
                <MenuItem value="川越">川越</MenuItem>
                <MenuItem value="所沢">所沢</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>連名店舗</InputLabel>
              <Select
                multiple
                value={location.jointStores}
                label="連名店舗"
                onChange={onEdit}
              >
                <MenuItem value="大宮">大宮</MenuItem>
                <MenuItem value="浦和">浦和</MenuItem>
                <MenuItem value="川越">川越</MenuItem>
                <MenuItem value="所沢">所沢</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl>
              <Checkbox
                checked={location.hasLocation}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">場所取りあり</Typography>
            </FormControl>
            <FormControl>
              <Checkbox
                checked={location.isOutdoor}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">外現場</Typography>
            </FormControl>
            <FormControl>
              <Checkbox
                checked={location.hasBusinessTrip}
                onChange={onEdit}
                size="small"
              />
              <Typography variant="caption">出張あり</Typography>
            </FormControl>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1 }}>
            {location.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">担当MG</Typography>
              <Typography variant="body2">{location.manager}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">電話番号</Typography>
              <Typography variant="body2">{phone}</Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="textSecondary">開催店舗</Typography>
            <Typography variant="body2">{location.mainStore}</Typography>
          </Box>
          {location.jointStores.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary">連名店舗</Typography>
              <Typography variant="body2">{location.jointStores.join('、')}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {location.hasLocation && (
              <Tooltip title="場所取りあり" arrow>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: 'primary.main',
                  fontSize: '0.875rem'
                }}>
                  <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="body2">場所取り</Typography>
                </Box>
              </Tooltip>
            )}
            {location.isOutdoor && (
              <Tooltip title="外現場" arrow>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#4caf50',
                  fontSize: '0.875rem'
                }}>
                  <TerrainIcon sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="body2">外現場</Typography>
                </Box>
              </Tooltip>
            )}
            {location.hasBusinessTrip && (
              <Tooltip title="出張あり" arrow>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#ff9800',
                  fontSize: '0.875rem'
                }}>
                  <FlightIcon sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="body2">出張</Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </>
      )}
    </Box>
  </Box>
);

interface SalesDetailsProps {
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
  schedule: boolean[];
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SalesDetails = ({ counts, unitPrices, transportationFees, schedule, isEditing, onEdit }: SalesDetailsProps) => (
  <Box sx={{ flex: '1 1 auto', minWidth: '300px', pr: 3 }}>
    <Table size="small" sx={{ 
      width: '100%',
      tableLayout: 'fixed',
      position: 'relative',
      zIndex: 0,
      '& .MuiTableCell-root': { 
        px: 1.5,
        py: 1,
        borderBottom: '1px dotted #e0e0e0',
        whiteSpace: 'nowrap'
      },
      '& .MuiTableHead-root': {
        '& .MuiTableCell-root': {
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 0
        }
      }
    }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '80px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>役割</Typography>
          </TableCell>
          <TableCell align="center" sx={{ width: '60px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>人数</Typography>
          </TableCell>
          <TableCell align="center" sx={{ width: '80px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>単価</Typography>
          </TableCell>
          <TableCell align="center" sx={{ width: '80px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>交通費</Typography>
          </TableCell>
          <TableCell align="right" sx={{ width: '80px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>小計</Typography>
          </TableCell>
          <TableCell align="right" sx={{ width: '80px', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>合計</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>クローザー</Typography>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEditing ? (
                <TextField
                  type="number"
                  size="small"
                  value={counts.closer}
                  onChange={onEdit}
                  name="closer"
                  inputProps={{ 
                    min: 0,
                    style: { 
                      textAlign: 'center',
                      padding: '4px',
                      width: '40px'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff'
                    }
                  }}
                />
              ) : (
                <Typography variant="body2">{counts.closer}</Typography>
              )}
              <Typography variant="caption" sx={{ ml: 0.5, color: '#666666' }}>名</Typography>
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2">¥{unitPrices.closer.toLocaleString()}</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2">¥{transportationFees.closer.toLocaleString()}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              ¥{(counts.closer * (unitPrices.closer + transportationFees.closer) * schedule.filter(Boolean).length).toLocaleString()}
            </Typography>
          </TableCell>
          <TableCell rowSpan={2} align="right" sx={{ 
            verticalAlign: 'middle',
            borderLeft: '1px dotted #e0e0e0',
            bgcolor: '#fafafa'
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              ¥{((counts.closer * (unitPrices.closer + transportationFees.closer) + 
                  counts.girl * (unitPrices.girl + transportationFees.girl)) * 
                  schedule.filter(Boolean).length).toLocaleString()}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography variant="body2" sx={{ color: '#e91e63', fontWeight: 'bold' }}>ガール</Typography>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isEditing ? (
                <TextField
                  type="number"
                  size="small"
                  value={counts.girl}
                  onChange={onEdit}
                  name="girl"
                  inputProps={{ 
                    min: 0,
                    style: { 
                      textAlign: 'center',
                      padding: '4px',
                      width: '40px'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff'
                    }
                  }}
                />
              ) : (
                <Typography variant="body2">{counts.girl}</Typography>
              )}
              <Typography variant="caption" sx={{ ml: 0.5, color: '#666666' }}>名</Typography>
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2">¥{unitPrices.girl.toLocaleString()}</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2">¥{transportationFees.girl.toLocaleString()}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              ¥{(counts.girl * (unitPrices.girl + transportationFees.girl) * schedule.filter(Boolean).length).toLocaleString()}
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Box sx={{ mt: 3, borderTop: '1px solid #e0e0e0', pt: 2 }}>
      <Typography variant="subtitle2" sx={{ color: '#666666', mb: 1 }}>無料入店</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {schedule.map((checked, index) => (
          checked && (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#666666', minWidth: '45px' }}>{index + 1}日目</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={counts.freeStaff || 0}
                    onChange={onEdit}
                    name="freeStaff"
                    inputProps={{ 
                      min: 0,
                      style: { 
                        textAlign: 'center',
                        padding: '2px',
                        width: '32px',
                        height: '20px'
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '24px',
                        backgroundColor: '#fff'
                      }
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>{counts.freeStaff || 0}</Typography>
                )}
                <Typography variant="caption" sx={{ ml: 0.5, color: '#666666' }}>名</Typography>
              </Box>
            </Box>
          )
        ))}
      </Box>
    </Box>
  </Box>
);

interface MemoProps {
  memo: string;
  isEditing: boolean;
  onEdit: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Memo = ({ memo, isEditing, onEdit }: MemoProps) => (
  <Box sx={{ 
    width: '200px',
    height: '100%',
    borderLeft: '1px solid #e0e0e0',
    pl: 2,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Typography variant="caption" sx={{ color: '#666666', mb: 1, display: 'block' }}>
      メモ
    </Typography>
    {isEditing ? (
      <TextField
        multiline
        fullWidth
        size="small"
        value={memo}
        onChange={onEdit}
        name="memo"
        placeholder="メモを入力"
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            height: '100%',
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#e0e0e0'
            },
            '& textarea': {
              height: '100% !important'
            }
          }
        }}
      />
    ) : (
      <Typography 
        variant="body2" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          color: memo ? 'text.primary' : 'text.secondary',
          fontSize: '0.875rem',
          flex: 1
        }}
      >
        {memo || 'メモなし'}
      </Typography>
    )}
  </Box>
);

interface SalesTableProps {
  initialViewMode?: 'detail' | 'summary';
}

interface WeekTabsProps {
  selectedWeek: number;
  onWeekChange: (week: number) => void;
}

const WeekTabs: React.FC<WeekTabsProps> = ({ selectedWeek, onWeekChange }) => (
  <Box sx={{ mb: 2 }}>
    <ToggleButtonGroup
      value={selectedWeek}
      exclusive
      onChange={(e, value) => value !== null && onWeekChange(value)}
      size="small"
    >
      {[1, 2, 3, 4, 5].map((week) => (
        <ToggleButton
          key={week}
          value={week}
          sx={{
            px: 3,
            py: 1,
            '&.Mui-selected': {
              backgroundColor: '#1976d2',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            },
          }}
        >
          <Typography variant="body2">{week}週目</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

interface WeeklyCapacityTableProps {
  weeks: {
    week: string;
    closerCapacity: number;
    girlCapacity: number;
    maxCapacity: number;
  }[];
}

const WeeklyCapacityTable: React.FC<WeeklyCapacityTableProps> = ({ weeks }) => (
  <Box sx={{ mb: 3 }}>
    <TableContainer component={Paper}>
      <Table size="small" sx={{ 
        '& .MuiTableCell-root': { 
          borderColor: '#e0e0e0',
          py: 1
        }
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '80px', bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>週</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center" sx={{ width: '80px', bgcolor: '#fafafa' }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>{week.week}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'normal' }}>クローザー枠数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{week.closerCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#e91e63', fontWeight: 'normal' }}>ガール枠数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2" sx={{ color: '#e91e63', fontWeight: 'bold' }}>{week.girlCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>稼働可能人数</Typography>
            </TableCell>
            {weeks.map((week) => (
              <TableCell key={week.week} align="center">
                <Typography variant="body2">{week.maxCapacity}名</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const SalesTable: React.FC<SalesTableProps> = ({ initialViewMode = 'summary' }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [records, setRecords] = useState<SalesData[]>([
    {
      id: '1',
      assignee: '山田',
      updatedBy: '山田',
      status: '代理店連絡前',
      agency: 'ピーアップ',
      schedule: [true, false, false, false, false, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イオンモール上尾センターコート',
        manager: '大宮MG',
        mainStore: '大宮',
        jointStores: ['浦和'],
        hasLocation: true,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-1234-5678',
      dayType: '平日',
      counts: {
        closer: 2,
        girl: 2,
        traineeCloser: 1,
        freeStaff: 0
      },
      unitPrices: {
        closer: 18000,
        girl: 9000
      },
      transportationFees: {
        closer: 4000,
        girl: 2500
      },
      memo: '',
    },
    {
      id: '2',
      assignee: '鈴木',
      updatedBy: '山田',
      status: '代理店連絡前',
      agency: 'ピーアップ',
      schedule: [false, true, true, true, true, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イトーヨーカドー立場',
        manager: '浦和MG',
        mainStore: '浦和',
        jointStores: [],
        hasLocation: true,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-2222-2222',
      dayType: '平日',
      counts: {
        closer: 2,
        girl: 2,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 18000,
        girl: 9000
      },
      transportationFees: {
        closer: 4000,
        girl: 2500
      },
      memo: '',
    },
    {
      id: '3',
      assignee: '佐藤',
      updatedBy: '佐藤',
      status: '代理店連絡前',
      agency: 'ピーアップ',
      schedule: [false, false, false, false, true, true, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'マルエツ松江',
        manager: '川越MG',
        mainStore: '川越',
        jointStores: ['所沢', '大宮'],
        hasLocation: false,
        isOutdoor: false,
        hasBusinessTrip: true
      },
      phone: '080-3333-3333',
      dayType: '週末',
      counts: {
        closer: 4,
        girl: 4,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 22000,
        girl: 11000
      },
      transportationFees: {
        closer: 6000,
        girl: 3500
      },
      memo: '',
    },
    {
      id: '4',
      assignee: '山田',
      updatedBy: '山田',
      status: '代理店連絡前',
      agency: 'ピーアップ',
      schedule: [true, true, false, false, false, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'コーナン西新井',
        manager: '所沢MG',
        mainStore: '所沢',
        jointStores: ['川越'],
        hasLocation: true,
        isOutdoor: true,
        hasBusinessTrip: false
      },
      phone: '080-4444-4444',
      dayType: '平日',
      counts: {
        closer: 2,
        girl: 3,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 19000,
        girl: 9500
      },
      transportationFees: {
        closer: 5500,
        girl: 3200
      },
      memo: '',
    },
    {
      id: '5',
      assignee: '高橋',
      updatedBy: '田中',
      status: '代理店連絡前',
      agency: 'ラネット',
      schedule: [false, false, true, true, true, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: '錦糸町マルイ たい焼き屋前',
        manager: '川越MG',
        mainStore: '川越',
        jointStores: [],
        hasLocation: false,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-5555-5555',
      dayType: '平日',
      counts: {
        closer: 3,
        girl: 2,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 18000,
        girl: 9000
      },
      transportationFees: {
        closer: 4500,
        girl: 2800
      },
      memo: '',
    },
    {
      id: '6',
      assignee: '田中',
      updatedBy: '田中',
      status: '代理店連絡前',
      agency: 'ラネット',
      schedule: [false, false, false, false, true, true, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'ららぽーと富士見　1階スリコ前',
        manager: '川口MG',
        mainStore: '大宮',
        jointStores: ['浦和'],
        hasLocation: true,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-1111-1111',
      dayType: '週末',
      counts: {
        closer: 3,
        girl: 3,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 20000,
        girl: 10000
      },
      transportationFees: {
        closer: 5000,
        girl: 3000
      },
      memo: '',
    },
    {
      id: '7',
      assignee: '鈴木',
      updatedBy: '山田',
      status: '代理店連絡前',
      agency: 'CS',
      schedule: [true, true, true, true, true, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イオンタウン吉川美南',
        manager: '浦和MG',
        mainStore: '浦和',
        jointStores: [],
        hasLocation: true,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-2222-2222',
      dayType: '平日',
      counts: {
        closer: 2,
        girl: 2,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 18000,
        girl: 9000
      },
      transportationFees: {
        closer: 4000,
        girl: 2500
      },
      memo: '',
    },
    {
      id: '8',
      assignee: '佐藤',
      updatedBy: '佐藤',
      status: '代理店連絡前',
      agency: 'CS',
      schedule: [false, false, false, false, false, true, true],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イオン南越谷',
        manager: '川越MG',
        mainStore: '川越',
        jointStores: ['所沢', '大宮'],
        hasLocation: false,
        isOutdoor: false,
        hasBusinessTrip: true
      },
      phone: '080-3333-3333',
      dayType: '週末',
      counts: {
        closer: 4,
        girl: 4,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 22000,
        girl: 11000
      },
      transportationFees: {
        closer: 6000,
        girl: 3500
      },
      memo: '',
    },
    {
      id: '9',
      assignee: '山田',
      updatedBy: '山田',
      status: '代理店連絡前',
      agency: 'CS',
      schedule: [true, true, false, false, false, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イオンタウン吉川美南',
        manager: '所沢MG',
        mainStore: '所沢',
        jointStores: ['川越'],
        hasLocation: true,
        isOutdoor: true,
        hasBusinessTrip: false
      },
      phone: '080-4444-4444',
      dayType: '平日',
      counts: {
        closer: 2,
        girl: 3,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 19000,
        girl: 9500
      },
      transportationFees: {
        closer: 5500,
        girl: 3200
      },
      memo: '',
    },
    {
      id: '10',
      assignee: '高橋',
      updatedBy: '田中',
      status: '代理店連絡前',
      agency: 'CS',
      schedule: [false, false, true, true, true, false, false],
      isBandShift: false,
      bandShiftCount: 0,
      location: {
        name: 'イオン南越谷',
        manager: '川越MG',
        mainStore: '川越',
        jointStores: [],
        hasLocation: false,
        isOutdoor: false,
        hasBusinessTrip: false
      },
      phone: '080-5555-5555',
      dayType: '平日',
      counts: {
        closer: 3,
        girl: 2,
        traineeCloser: 0,
        freeStaff: 0
      },
      unitPrices: {
        closer: 18000,
        girl: 9000
      },
      transportationFees: {
        closer: 4500,
        girl: 2800
      },
      memo: '',
    }
  ]);

  const [editingRecord, setEditingRecord] = useState<SalesData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>(initialViewMode);

  const handleEdit = (record: SalesData) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedRecord: SalesData) => {
    setRecords(prev =>
      prev.map(record =>
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
    setIsDialogOpen(false);
    setEditingRecord(null);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const columnWidths = {
    checkbox: '60px',
    assignee: '80px',
    updater: '80px',
    status: '120px',
    agency: '120px',
    weekday: '28px',
    dayType: '65px',
    bandProject: '120px',
    details: 'auto'
  };

  const renderEditableRow = (record: SalesData) => (
    <TableRow key="new" sx={{ bgcolor: '#fff' }}>
      <TableCell padding="checkbox" sx={{ width: '60px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <IconButton size="small" onClick={() => handleSave(record)}>
            <SaveIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
            <CloseIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell sx={{ width: '80px' }}>
        <TextField
          size="small"
          value={record.assignee}
          onChange={(e) => setEditingRecord({ ...record, assignee: e.target.value })}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '80px' }}>
        <TextField
          size="small"
          value={record.updatedBy}
          onChange={(e) => setEditingRecord({ ...record, updatedBy: e.target.value })}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '120px' }}>
        <FormControl fullWidth size="small">
          <Select
            value={record.status}
            onChange={(e) => setEditingRecord({ ...record, status: e.target.value })}
          >
            <MenuItem value="代理店連絡前">代理店連絡前</MenuItem>
            <MenuItem value="代理店調整中">代理店調整中</MenuItem>
            <MenuItem value="確定">確定</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ width: '120px' }}>
        <FormControl fullWidth size="small">
          <Select
            value={record.agency}
            onChange={(e) => setEditingRecord({ ...record, agency: e.target.value })}
          >
            <MenuItem value="ピアアップ">ピアアップ</MenuItem>
            <MenuItem value="アップフィールド">アップフィールド</MenuItem>
            <MenuItem value="ベストプロモーション">ベストプロモーション</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      {record.schedule.map((checked, index) => (
        <TableCell 
          key={index} 
          align="center"
          sx={{ 
            width: '45px',
            borderLeft: index === 0 ? '1px solid #e0e0e0' : '1px solid #e0e0e0',
            borderRight: index === 6 ? '1px solid #e0e0e0' : '1px solid #e0e0e0',
            px: 0,
            backgroundColor: record.isBandShift && checked ? '#f5f9ff' : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
        >
          {checked && <CheckIcon fontSize="small" color="primary" />}
        </TableCell>
      ))}
      <TableCell sx={{ width: '100px', borderRight: '1px solid #e0e0e0' }}>
        <FormControl fullWidth size="small">
          <Select
            value={record.dayType}
            onChange={(e) => setEditingRecord({ ...record, dayType: e.target.value as '平日' | '週末' })}
          >
            <MenuItem value="平日">平日</MenuItem>
            <MenuItem value="週末">週末</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="center" sx={{ width: '120px', borderRight: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Checkbox
            checked={record.isBandShift}
            onChange={(e) => setEditingRecord({ 
              ...record, 
              isBandShift: e.target.checked,
              schedule: e.target.checked ? [true, true, true, true, true, true, true] : record.schedule
            })}
            size="small"
          />
          {record.isBandShift && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                type="number"
                size="small"
                value={record.bandShiftCount}
                onChange={(e) => setEditingRecord({ 
                  ...record, 
                  bandShiftCount: parseInt(e.target.value) || 0
                })}
                inputProps={{ 
                  min: 0,
                  style: { 
                    textAlign: 'center',
                    padding: '4px 2px',
                    width: '32px'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 0.5
                  }
                }}
              />
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>稼働</Typography>
            </Box>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <LocationDetails
            location={record.location}
            phone={record.phone}
            isEditing={editingRecord?.id === record.id}
            onEdit={(e) => {
              if (editingRecord?.id === record.id) {
                setEditingRecord({
                  ...editingRecord,
                  location: {
                    ...editingRecord.location,
                    [e.target.name]: e.target.value
                  }
                });
              }
            }}
          />
          <SalesDetails
            counts={record.counts}
            unitPrices={record.unitPrices}
            transportationFees={record.transportationFees}
            schedule={record.schedule}
            isEditing={editingRecord?.id === record.id}
            onEdit={(e) => {
              if (editingRecord?.id === record.id) {
                setEditingRecord({
                  ...editingRecord,
                  counts: {
                    ...editingRecord.counts,
                    [e.target.name]: parseInt(e.target.value) || 0
                  }
                });
              }
            }}
          />
          <Memo
            memo={record.memo}
            isEditing={editingRecord?.id === record.id}
            onEdit={(e) => {
              if (editingRecord?.id === record.id) {
                setEditingRecord({
                  ...editingRecord,
                  memo: e.target.value
                });
              }
            }}
          />
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderSummaryRow = (record: SalesData) => (
    <TableRow key={record.id} sx={{ 
      '&:hover': { 
        backgroundColor: '#fafafa',
        '& .MuiIconButton-root': { opacity: 1 }
      }
    }}>
      <TableCell padding="checkbox" sx={{ width: columnWidths.checkbox }}>
        <IconButton 
          size="small" 
          onClick={() => setEditingRecord(record)}
          sx={{ 
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <EditIcon fontSize="small" color="primary" />
        </IconButton>
      </TableCell>
      <TableCell sx={{ width: columnWidths.assignee }}>
        <Typography variant="body2">{record.assignee}</Typography>
      </TableCell>
      <TableCell sx={{ width: columnWidths.updater }}>
        <Typography variant="body2">{record.updatedBy}</Typography>
      </TableCell>
      <TableCell sx={{ width: columnWidths.status }}>
        <Chip 
          label={record.status} 
          size="small"
          sx={{ 
            backgroundColor: 
              record.status === '確定' ? '#e8f5e9' :
              record.status === '代理店調整中' ? '#fff3e0' : '#f5f5f5',
            color: 
              record.status === '確定' ? '#2e7d32' :
              record.status === '代理店調整中' ? '#ef6c00' : '#666666',
            fontSize: '0.75rem',
            height: '24px'
          }} 
        />
      </TableCell>
      <TableCell sx={{ width: columnWidths.agency }}>
        <Typography variant="body2">{record.agency}</Typography>
      </TableCell>
      {record.schedule.map((checked, index) => (
        <TableCell 
          key={index} 
          align="center"
          sx={{ 
            width: columnWidths.weekday,
            borderLeft: index === 0 ? '1px solid #e0e0e0' : 'none',
            borderRight: index === 6 ? '1px solid #e0e0e0' : 'none',
            px: 0,
            backgroundColor: record.isBandShift && checked ? '#f5f9ff' : 'transparent'
          }}
        >
          {checked && <CheckIcon fontSize="small" color="primary" />}
        </TableCell>
      ))}
      <TableCell sx={{ width: columnWidths.dayType, borderRight: '1px solid #e0e0e0' }}>
        <Typography variant="body2">{record.dayType}</Typography>
      </TableCell>
      <TableCell align="center" sx={{ width: columnWidths.bandProject, borderRight: '1px solid #e0e0e0' }}>
        {record.isBandShift && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckIcon fontSize="small" color="primary" />
            {record.bandShiftCount > 0 && (
              <Typography variant="body2">{record.bandShiftCount}稼働</Typography>
            )}
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ width: columnWidths.details }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '300px' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {record.location.name}
            </Typography>
            {record.location.hasLocation && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="primary">場所取りあり</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '150px' }}>
            <PersonIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="primary">
              クローザー: {record.counts.closer}名
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '120px' }}>
            <FaceIcon fontSize="small" color="secondary" />
            <Typography variant="body2" color="secondary">
              ガール: {record.counts.girl}名
            </Typography>
          </Box>
          {record.counts.freeStaff > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '120px' }}>
              <SchoolIcon fontSize="small" color="success" />
              <Typography variant="body2" color="success.main">
                無料入店: {record.counts.freeStaff}名
              </Typography>
            </Box>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderDetailRow = (record: SalesData) => (
    <TableRow key={record.id} sx={{ 
      '&:hover': { 
        backgroundColor: '#fafafa',
        '& .MuiIconButton-root': { opacity: 1 }
      }
    }}>
      <TableCell padding="checkbox" sx={{ width: columnWidths.checkbox }}>
        <IconButton 
          size="small" 
          onClick={() => setEditingRecord(record)}
          sx={{ 
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        >
          <EditIcon fontSize="small" color="primary" />
        </IconButton>
      </TableCell>
      <TableCell sx={{ width: columnWidths.assignee }}>{record.assignee}</TableCell>
      <TableCell sx={{ width: columnWidths.updater }}>{record.updatedBy}</TableCell>
      <TableCell sx={{ width: columnWidths.status }}>
        <Chip 
          label={record.status} 
          size="small"
          sx={{ 
            backgroundColor: 
              record.status === '確定' ? '#e8f5e9' :
              record.status === '代理店調整中' ? '#fff3e0' : '#f5f5f5',
            color: 
              record.status === '確定' ? '#2e7d32' :
              record.status === '代理店調整中' ? '#ef6c00' : '#666666',
            fontSize: '0.75rem',
            height: '24px'
          }} 
        />
      </TableCell>
      <TableCell sx={{ width: columnWidths.agency }}>{record.agency}</TableCell>
      {record.schedule.map((checked, index) => (
        <TableCell 
          key={index} 
          align="center"
          sx={{ 
            width: columnWidths.weekday,
            borderLeft: index === 0 ? '1px solid #e0e0e0' : 'none',
            borderRight: index === 6 ? '1px solid #e0e0e0' : 'none',
            px: 0,
            backgroundColor: record.isBandShift && checked ? '#f5f9ff' : 'transparent'
          }}
        >
          {checked && <CheckIcon fontSize="small" color="primary" />}
        </TableCell>
      ))}
      <TableCell sx={{ width: columnWidths.dayType, borderRight: '1px solid #e0e0e0' }}>
        {record.dayType}
      </TableCell>
      <TableCell align="center" sx={{ width: columnWidths.bandProject, borderRight: '1px solid #e0e0e0' }}>
        {record.isBandShift && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckIcon fontSize="small" color="primary" />
            {record.bandShiftCount > 0 && (
              <Typography variant="body2">{record.bandShiftCount}稼働</Typography>
            )}
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ width: columnWidths.details }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <LocationDetails
            location={record.location}
            phone={record.phone}
            isEditing={false}
            onEdit={() => {}}
          />
          <SalesDetails
            counts={record.counts}
            unitPrices={record.unitPrices}
            transportationFees={record.transportationFees}
            schedule={record.schedule}
            isEditing={false}
            onEdit={() => {}}
          />
          <Memo
            memo={record.memo}
            isEditing={false}
            onEdit={() => {}}
          />
        </Box>
      </TableCell>
    </TableRow>
  );

  const weeklyCapacity = [
    { week: '0W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '1W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '2W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '3W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '4W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 },
    { week: '5W', closerCapacity: 30, girlCapacity: 20, maxCapacity: 50 }
  ];

  return (
    <>
      <WeeklyCapacityTable weeks={weeklyCapacity} />
      <WeekTabs
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
      />
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          新規作成
        </Button>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="summary">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="detail">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} sx={{ 
        mb: 3,
        maxHeight: 'calc(100vh - 250px)',
        overflow: 'auto',
        '& .MuiTable-root': {
          tableLayout: 'fixed',
          width: '100%'
        },
        '& .MuiTableHead-root': {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#fff',
          '& .MuiTableCell-root': {
            backgroundColor: '#fff',
            fontWeight: 'normal'
          }
        }
      }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: columnWidths.checkbox }}></TableCell>
              <TableCell sx={{ width: columnWidths.assignee }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>担当者</Typography>
              </TableCell>
              <TableCell sx={{ width: columnWidths.updater }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>更新者</Typography>
              </TableCell>
              <TableCell sx={{ width: columnWidths.status }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>ステータス</Typography>
              </TableCell>
              <TableCell sx={{ width: columnWidths.agency }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>代理店</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  borderLeft: '1px solid #e0e0e0',
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>火</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>水</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>木</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>金</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>土</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>日</Typography>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  width: columnWidths.weekday,
                  borderRight: '1px solid #e0e0e0',
                  px: 0
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>月</Typography>
              </TableCell>
              <TableCell 
                sx={{ 
                  width: columnWidths.dayType, 
                  borderRight: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>平日/週末</Typography>
              </TableCell>
              <TableCell sx={{ width: columnWidths.bandProject, borderRight: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>帯案件</Typography>
              </TableCell>
              <TableCell sx={{ width: columnWidths.details }}>
                <Typography variant="caption" sx={{ color: '#666666', fontWeight: 'normal' }}>詳細</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record, index) => (
              viewMode === 'detail' ? renderDetailRow(record) : renderSummaryRow(record)
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRecord ? '案件を編集' : '新規案件'}
        </DialogTitle>
        <DialogContent>
          {/* Form fields will be added here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave(editingRecord || emptyRecord)}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SalesTable; 