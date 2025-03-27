import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { SalesData } from './types';
import { LocationDetails } from './LocationDetails';
import { SalesDetails } from './SalesDetails';
import { Memo } from './Memo';
import React, { useState, ChangeEvent } from 'react';

interface EditDialogProps {
  open: boolean;
  record: SalesData;
  onSave: (record: SalesData) => void;
  onClose: () => void;
}

export const EditDialog = ({ open, record: initialRecord, onSave, onClose }: EditDialogProps) => {
  const [record, setRecord] = useState(initialRecord);

  React.useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  const handleSave = () => {
    onSave(record);
    onClose();
  };

  const handleClose = () => {
    setRecord(initialRecord);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {record.id ? '編集' : '新規登録'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
          <LocationDetails
            location={record.location}
            phone={record.phone}
            isEditing={true}
            onEdit={(e) => {
              const { name, value } = e.target;
              setRecord(prev => ({
                ...prev,
                location: {
                  ...prev.location,
                  [name]: value
                }
              }));
            }}
          />
          <SalesDetails
            counts={record.counts}
            unitPrices={record.unitPrices}
            transportationFees={record.transportationFees}
            schedule={record.schedule}
            isEditing={true}
            onEdit={(e) => {
              const { name, value } = e.target;
              setRecord(prev => ({
                ...prev,
                counts: {
                  ...prev.counts,
                  [name]: parseInt(value) || 0
                }
              }));
            }}
          />
          <Memo
            memo={record.memo}
            isEditing={true}
            onEdit={(e) => {
              setRecord(prev => ({
                ...prev,
                memo: e.target.value
              }));
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={record.isBandShift}
                  onChange={(e) => {
                    setRecord({
                      ...record,
                      isBandShift: e.target.checked,
                      bandShiftCount: e.target.checked ? record.bandShiftCount : 0
                    });
                  }}
                />
              }
              label="帯案件"
            />
          </FormControl>
          {record.isBandShift && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                type="number"
                size="small"
                value={record.bandShiftCount}
                onChange={(e) => {
                  setRecord({
                    ...record,
                    bandShiftCount: parseInt(e.target.value) || 0
                  });
                }}
                inputProps={{ 
                  min: 0,
                  style: { 
                    textAlign: 'center',
                    padding: '4px',
                    width: '40px'
                  }
                }}
              />
              <Typography>稼働</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
} 