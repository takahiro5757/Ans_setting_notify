'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Table, TableHead, TableBody, TableRow, TableCell, Box, styled,
  createTheme, ThemeProvider, IconButton, Tooltip
} from '@mui/material';
import { ShiftProvider, useShiftContext } from './context/ShiftContext';
import { SpreadsheetGridProps, DateInfo, StaffRequest } from './types';
import DateRow from './components/DateRow';
import CommentDialog from './components/CommentDialog';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

/* ===== 定数 ===== */
const H_HEADER = 32; const H_ROW = 36;
const TOP = { 
  company: H_HEADER, // 所属会社行の位置
  name: H_HEADER+H_ROW, // 氏名行の位置を下にずらす
  kana: H_HEADER+H_ROW*2, // カナ行の位置を下にずらす
  // station行をTOPから削除して固定しないようにする
};
// 列の幅を調整して新しい列を追加
const W   = { 
  date: 86, 
  closerCase: 100, // 幅を調整
  girlCase: 100,   // 幅を調整
  closerAvailable: 100, // 幅を調整
  girlAvailable: 100,   // 幅を調整
  close: 100, // 幅を調整
  girl: 100,  // 幅を調整
  
  // 折りたたみ時の幅
  closerSection: 400, // クローザーセクション全体（折りたたみ時）
};

// 定数をさらに追加（固定列の正確な位置）
const LEFT = { 
  // 展開時の位置
  date: 0, 
  closerCase: W.date,             // クローザー案件数位置
  girlCase: W.date + W.closerCase, // ガール案件数位置
  closerAvailable: W.date + W.closerCase + W.girlCase, // 新規：クローザー稼働可能数位置
  girlAvailable: W.date + W.closerCase + W.girlCase + W.closerAvailable, // 新規：ガール稼働可能数位置
  close: W.date + W.closerCase + W.girlCase + W.closerAvailable + W.girlAvailable, // 未決クローザー位置を更新
  girl: W.date + W.closerCase + W.girlCase + W.closerAvailable + W.girlAvailable + W.close, // 未決ガール位置を更新
  
  // 折りたたみ時の位置
  closerSection: W.date, // クローザーセクション位置（折りたたみ時）
  closeCollapsed: W.date + W.closerSection, // 未決クローザー位置（折りたたみ時）
  girlCollapsed: W.date + W.closerSection + W.close, // 未決ガール位置（折りたたみ時）
};

/* ===== 汎用セル ===== */
const Cell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.5),
  textAlign: 'center',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  height: H_ROW,
  lineHeight: 1,
  borderRight: '1px solid #000000',
  '&.header':       { background:'#f5f5f5', fontWeight:700, borderBottom:'2px solid #000000' },
  '&.shift-header': { background:'#fff8e1', fontWeight:700, borderTop:'2px solid #000000', borderBottom:'2px solid #000000' },
  '&.shift-available':{ background:'#ffd54f' },
  '&.staff-section': { borderRight:'2px solid #000000' },
  '&.location': { width: 112.5, maxWidth: 112.5 }, // 稼働場所セルのサイズを半分に
}));

/* ===== セクションヘッダー（展開時と折りたたみ時で使用） ===== */
const CloserSectionHead = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.closerSection,
  top: 0,
  zIndex: 600,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.closerSection,
  fontWeight: 700,
  fontSize: 16,
  height: H_HEADER,
  borderBottom: '2px solid #000000',
}));

/* ===== 折りたたみ時の未決列ヘッダー ===== */
const CloseHeadCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.closeCollapsed,
  top: 0,
  zIndex: 600,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.close,
  fontWeight: 700,
  borderBottom: '2px solid #000000',
}));

const GirlHeadCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.girlCollapsed,
  top: 0,
  zIndex: 600,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.girl,
  fontWeight: 700,
  borderBottom: '2px solid #000000',
}));

/* ===== 折りたたみ時のセクション固定セル（情報行用） ===== */
const CloserSectionTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.closerSection,
  top: top,
  zIndex: 500,
  background: '#e3f2fd',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.closerSection,
}));

const CloseCellFixCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.closeCollapsed,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.close,
}));

const GirlCellFixCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.girlCollapsed,
  zIndex: 400,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.girl,
}));

const CloseTopCollapsed = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.closeCollapsed,
  top: top,
  zIndex: 500,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.close,
}));

const GirlTopCollapsed = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.girlCollapsed,
  top: top,
  zIndex: 500,
  background: '#fffde7',
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  width: W.girl,
}));

/* ===== 折りたたみ時の実績行用セル ===== */
const CloserSectionBottom = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.closerSection,
  bottom: 0,
  zIndex: 699,
  background: '#fce4ec',
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  width: W.closerSection,
}));

const CloseBottomCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.closeCollapsed,
  bottom: 0,
  zIndex: 695,
  background: '#fce4ec',
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  width: W.close,
}));

const GirlBottomCollapsed = styled(Cell)(({ theme }) => ({
  position: 'sticky',
  left: LEFT.girlCollapsed,
  bottom: 0,
  zIndex: 694,
  background: '#fce4ec',
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  width: W.girl,
}));

/* ===== 左列用のスタイル付きコンポーネント ===== */
const DateHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.date,
  top: 0,
  zIndex: 600,
  background: '#f5f5f5',
  width: W.date,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const DateTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.date,
  top,
  zIndex: 500,
  background: '#f5f5f5',
  width: W.date,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const DateCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.date,
  zIndex: 400,
  background: '#f5f5f5',
  width: W.date,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// クローザー案件数列
const CloserCaseHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerCase,
  top: 0,
  zIndex: 600,
  background: '#e3f2fd',
  width: W.closerCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2,
  cursor: 'move',
  '&.dragging': { 
    opacity: 0.8,
    background: '#bbdefb', 
    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)', 
    transform: 'scale(1.02)', 
    transition: 'transform 0.1s ease' 
  },
  '&.dragover': { 
    borderLeft: '4px solid #000000',
    background: '#e8f4fd'  
  }
}));

const CloserCaseTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.closerCase,
  top,
  zIndex: 500,
  background: '#e3f2fd',
  width: W.closerCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloserCaseCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerCase,
  zIndex: 400,
  background: '#e3f2fd',
  width: W.closerCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// ガール案件数列
const GirlCaseHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlCase,
  top: 0,
  zIndex: 600,
  background: '#e3f2fd',
  width: W.girlCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2,
  cursor: 'move',
  '&.dragging': { 
    opacity: 0.8,
    background: '#bbdefb', 
    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)', 
    transform: 'scale(1.02)', 
    transition: 'transform 0.1s ease' 
  },
  '&.dragover': { 
    borderLeft: '4px solid #000000',
    background: '#e8f4fd'  
  }
}));

const GirlCaseTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.girlCase,
  top,
  zIndex: 500,
  background: '#e3f2fd',
  width: W.girlCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlCaseCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlCase,
  zIndex: 400,
  background: '#e3f2fd',
  width: W.girlCase,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// 新規：クローザー稼働可能数列
const CloserAvailableHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerAvailable,
  top: 0,
  zIndex: 600,
  background: '#e8f5e9',
  width: W.closerAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2,
  cursor: 'move',
  '&.dragging': { 
    opacity: 0.8,
    background: '#c8e6c9', 
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)', 
    transform: 'scale(1.02)', 
    transition: 'transform 0.1s ease' 
  },
  '&.dragover': { 
    borderLeft: '4px solid #000000',
    background: '#dcedc8'  
  }
}));

const CloserAvailableTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.closerAvailable,
  top,
  zIndex: 500,
  background: '#e8f5e9',
  width: W.closerAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloserAvailableCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  width: W.closerAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// 新規：ガール稼働可能数列
const GirlAvailableHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlAvailable,
  top: 0,
  zIndex: 600,
  background: '#e8f5e9',
  width: W.girlAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2,
  cursor: 'move',
  '&.dragging': { 
    opacity: 0.8,
    background: '#c8e6c9', 
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)', 
    transform: 'scale(1.02)', 
    transition: 'transform 0.1s ease' 
  },
  '&.dragover': { 
    borderLeft: '4px solid #000000',
    background: '#dcedc8'  
  }
}));

const GirlAvailableTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.girlAvailable,
  top,
  zIndex: 500,
  background: '#e8f5e9',
  width: W.girlAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlAvailableCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlAvailable,
  zIndex: 400,
  background: '#e8f5e9',
  width: W.girlAvailable,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloseHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.close,
  top: 0,
  zIndex: 600,
  background: '#fffde7',
  width: W.close,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloseTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.close,
  top,
  zIndex: 500,
  background: '#fffde7',
  width: W.close,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloseCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.close,
  zIndex: 400,
  background: '#fffde7',
  width: W.close,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// ガール集計列の位置も調整
const GirlHead = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girl,
  top: 0,
  zIndex: 600,
  background: '#fffde7',
  width: W.girl,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlTop = styled(Cell)<{top:number}>(({top}) => ({
  position: 'sticky',
  left: LEFT.girl,
  top,
  zIndex: 500,
  background: '#fffde7',
  width: W.girl,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlCellFix = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girl,
  zIndex: 400,
  background: '#fffde7',
  width: W.girl,
  boxShadow: 'inset 0 -1px 0 #000000',
  borderRight: '2px solid #000000',
  marginRight: -2
}));

/* ===== 実績行専用 bottom‑sticky セル ===== */
// 底部固定セルの左位置も調整
const DateBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.date,
  bottom: 0,
  zIndex: 700,
  background: '#fce4ec',
  width: W.date,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// 底部固定セル
const CloserCaseBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerCase,
  bottom: 0,
  zIndex: 699,
  background: '#fce4ec',
  width: W.closerCase,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlCaseBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlCase,
  bottom: 0,
  zIndex: 698,
  background: '#fce4ec',
  width: W.girlCase,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

// 新規：稼働可能数用の底部固定セル
const CloserAvailableBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.closerAvailable,
  bottom: 0,
  zIndex: 697,
  background: '#fce4ec',
  width: W.closerAvailable,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlAvailableBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girlAvailable,
  bottom: 0,
  zIndex: 696,
  background: '#fce4ec',
  width: W.girlAvailable,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const CloseBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.close,
  bottom: 0,
  zIndex: 695,
  background: '#fce4ec',
  width: W.close,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

const GirlBottom = styled(Cell)(() => ({
  position: 'sticky',
  left: LEFT.girl,
  bottom: 0,
  zIndex: 694,
  background: '#fce4ec',
  width: W.girl,
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700,
  borderRight: '2px solid #000000',
  marginRight: -2
}));

/* ===== スタッフヘッダー (青) ===== */
const StaffHeadSticky = styled(Cell)({
  position:'sticky', top:0, zIndex:550,
  background:'#e3f2fd', fontWeight:700, fontSize:16,
  borderBottom:'2px solid #000000', height:H_HEADER,
  cursor: 'move', // カーソルをmoveに変更してドラッグ可能を示す
  '&.dragging': { 
    opacity: 0.8,
    background: '#bbdefb', // より明るい青色に変更
    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)', // 青い光彩効果
    transform: 'scale(1.02)', // わずかに拡大
    transition: 'transform 0.1s ease' 
  },
  '&.dragover': { 
    borderLeft: '4px solid #000000',
    background: '#e8f4fd'  // ドロップ候補の背景を少し明るくする
  }
});

/* ===== ラッパ ===== */
const Scroll = styled(Box)({ 
  height:'calc(100vh - 350px)', 
  overflow:'auto',
  // 共通スタイル - すべてのセル境界線を黒にする
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #000000',
    borderRight: '1px solid #000000'
  },
  // 全ての枠線を黒に統一
  '& .MuiTableCell-root.staff-section': {
    borderRight: '2px solid #000000'
  },
  '& .MuiTableCell-root.header': {
    borderBottom: '2px solid #000000'
  },
  '& .MuiTableCell-root.shift-header': {
    borderTop: '2px solid #000000',
    borderBottom: '2px solid #000000'
  }
});

const STable = styled(Table)({ 
  borderCollapse:'separate', // 隙間制御のため
  borderSpacing: 0,  // セル間の隙間をゼロに
  minWidth:'max-content', 
  background:'#fff',
  border: '1px solid #000000' 
});

// 黒い枠線に統一したテーマを作成
const darkBorderTheme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #000000',
          borderRight: '1px solid #000000',
          '&.staff-section': {
            borderRight: '2px solid #000000',
          },
          '&.header': {
            borderBottom: '2px solid #000000',
          },
          '&.shift-header': {
            borderTop: '2px solid #000000',
            borderBottom: '2px solid #000000',
          }
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          border: '1px solid #000000'
        }
      }
    }
  }
});

// 合計金額計算に使用するTotalsCalculatorコンポーネントを追加
const TotalsCalculator: React.FC<{
  orderedStaffMembers: any[];
  onCalculated: (staffTotals: {[key: string]: {count: number, amount: number}}, roleTotals: {[key: string]: number}) => void;
}> = ({ orderedStaffMembers, onCalculated }) => {
  const { shifts, getRate } = useShiftContext();
  
  // 各スタッフの稼働数と金額を計算
  useEffect(() => {
    const staffTotals: {[key: string]: {count: number, amount: number}} = {};
    const roleTotals: {[key: string]: number} = {
      'クローザー': 0,
      'ガール': 0
    };
    
    // 全スタッフの合計を計算
    orderedStaffMembers.forEach(staff => {
      const workingShifts = shifts.filter(s => s.staffId === staff.id && s.status === '○');
      const count = workingShifts.length;
      
      // 各シフトの単価を合計（ShiftContextのgetRateを使用）
      let amount = 0;
      workingShifts.forEach(shift => {
        const shiftDate = new Date(shift.date);
        const isWeekend = shiftDate.getDay() % 6 === 0;
        // getRate関数を使用してカスタム単価を含む適切な単価を取得
        const rate = getRate(staff.id, shiftDate, isWeekend);
        amount += rate;
      });
      
      // スタッフの合計を記録
      staffTotals[staff.id] = { count, amount };
      
      // ロール別の合計に加算
      if (staff.role === 'クローザー' || staff.role === 'ガール') {
        roleTotals[staff.role] += amount;
      }
    });
    
    // 結果を親コンポーネントに渡す
    onCalculated(staffTotals, roleTotals);
  }, [orderedStaffMembers, shifts, getRate]);
  
  return null; // UIはレンダリングしない
};

// 一般的な底部固定セル（スタッフ用）
const BottomCell = styled(Cell)(() => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 693,
  background: '#fce4ec',
  boxShadow: '0 -2px 4px rgba(0,0,0,.3)',
  borderTop: '2px solid #000000',
  color: '#e91e63',
  fontWeight: 700
}));

/* ===== メイン ===== */
export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  year, month, staffMembers, shifts, onRateChange, onStatusChange
}) => {
  // コメントダイアログ用の状態
  const [commentDialogOpen, setCommentDialogOpen] = useState<boolean>(false);
  const [commentCellKey, setCommentCellKey] = useState<{staffId: string, date: Date} | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  
  // スタッフの順序管理用ステート
  const [staffOrder, setStaffOrder] = useState<string[]>([]);
  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [dragOverStaffId, setDragOverStaffId] = useState<string | null>(null);
  
  // 列順序管理用ステート - 新しい列を追加
  const [columnOrder, setColumnOrder] = useState<string[]>(['closerCase', 'girlCase', 'closerAvailable', 'girlAvailable']);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // アコーディオン状態管理用ステート
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // アコーディオン切り替えハンドラー
  const handleToggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  // スクロール用の参照とハイライト状態を追加
  const scrollRef = useRef<HTMLDivElement>(null);
  // 未確定シフトのインデックスとクリックされたセルを追跡
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null);
  // 最後にクリックした日付とロールを記録
  const [lastClicked, setLastClicked] = useState<{date: string, role: string} | null>(null);

  // 初期化時にスタッフIDの配列を作成
  useEffect(() => {
    if (staffMembers.length > 0 && staffOrder.length === 0) {
      setStaffOrder(staffMembers.map(staff => staff.id));
    }
  }, [staffMembers, staffOrder.length]);
  
  // 現在の順序でソートされたスタッフメンバー
  const orderedStaffMembers = useMemo(() => {
    if (staffOrder.length === 0) return staffMembers;
    
    // staffOrderの順番に従ってスタッフを並び替え
    return staffOrder
      .map(id => staffMembers.find(staff => staff.id === id))
      .filter((staff): staff is typeof staffMembers[0] => staff !== undefined);
  }, [staffMembers, staffOrder]);
  
  // ドラッグ開始ハンドラー
  const handleDragStart = useCallback((e: React.DragEvent, staffId: string) => {
    setDraggedStaffId(staffId);
    // ドラッグ中の透明な画像を設定（デフォルトのゴーストイメージを非表示に）
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);
  
  // ドラッグオーバーハンドラー
  const handleDragOver = useCallback((e: React.DragEvent, staffId: string) => {
    e.preventDefault();
    if (draggedStaffId && draggedStaffId !== staffId) {
      setDragOverStaffId(staffId);
    }
  }, [draggedStaffId]);
  
  // ドラッグ終了ハンドラー
  const handleDragEnd = useCallback(() => {
    if (draggedStaffId && dragOverStaffId && draggedStaffId !== dragOverStaffId) {
      // 新しい順序を作成
      setStaffOrder(prevOrder => {
        const newOrder = [...prevOrder];
        const draggedIndex = newOrder.indexOf(draggedStaffId);
        const dropIndex = newOrder.indexOf(dragOverStaffId);
        
        // 順序を入れ替え
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(dropIndex, 0, draggedStaffId);
        
        return newOrder;
      });
    }
    
    // ドラッグ状態をリセット
    setDraggedStaffId(null);
    setDragOverStaffId(null);
  }, [draggedStaffId, dragOverStaffId]);
  
  // 列のドラッグ開始ハンドラー
  const handleColumnDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    // ドラッグ中の透明な画像を設定
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);
  
  // 列のドラッグオーバーハンドラー
  const handleColumnDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  }, [draggedColumn]);
  
  // 列のドラッグ終了ハンドラー
  const handleColumnDragEnd = useCallback(() => {
    if (draggedColumn && dragOverColumn && draggedColumn !== dragOverColumn) {
      // 新しい列順序を作成
      setColumnOrder(prevOrder => {
        const newOrder = [...prevOrder];
        const draggedIndex = newOrder.indexOf(draggedColumn);
        const dropIndex = newOrder.indexOf(dragOverColumn);
        
        // 順序を入れ替え
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(dropIndex, 0, draggedColumn);
        
        return newOrder;
      });
    }
    
    // ドラッグ状態をリセット
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [draggedColumn, dragOverColumn]);

  /* ---- utilities ---- */
  const dates: DateInfo[] = useMemo(() => {
    const wd = ['日', '月', '火', '水', '木', '金', '土']; 
    const last = new Date(year, month, 0).getDate();
    return Array.from({length: last}, (_, i) => {
      const d = new Date(year, month-1, i+1);
      return {
        date: d,
        dayOfWeek: wd[d.getDay()],
        isWeekend: d.getDay() % 6 === 0
      };
    });
  }, [year, month]);
  
  const getShift = useCallback((d: Date, id: string) => 
    shifts.find(s => 
      s.date === d.toISOString().slice(0, 10) && 
      s.staffId === id
    ), [shifts]);
  
  // 未確定シフト数と未確定シフト自体を取得
  const getUnassigned = useCallback((date: Date, role: string) => {
    const dateStr = date.toISOString().slice(0, 10);
    // 希望があり稼働場所が未確定のシフト
    const unassigned = shifts.filter(s => 
      s.date === dateStr && s.status === '○' && !s.location && 
      staffMembers.find(m => m.id === s.staffId)?.role === role
    );
    return unassigned;
  }, [shifts, staffMembers]);

  // 未決数セルクリック時の処理 - 別のセルクリック時はリセット
  const handleUnassignedClick = useCallback((date: Date, role: string) => {
    const dateStr = date.toISOString().slice(0, 10);
    const unassigned = getUnassigned(date, role);
    if (unassigned.length === 0) return;

    // 前回と同じセルがクリックされたかチェック
    const isSameCell = lastClicked && lastClicked.date === dateStr && lastClicked.role === role;
    
    // 新しいインデックスを計算
    let newIndex = 0;
    if (isSameCell) {
      // 同じセルなら次のインデックスへ進む
      newIndex = (currentIndex + 1) % unassigned.length;
    } else {
      // 違うセルなら最初のインデックスから
      newIndex = 0;
      // 最後にクリックしたセルを更新
      setLastClicked({ date: dateStr, role });
    }
    
    // インデックスを更新
    setCurrentIndex(newIndex);
    
    // 選択した未確定シフト
    const targetShift = unassigned[newIndex];
    const cellId = `loc-${date.getDate()}-${targetShift.staffId}`;
    
    // ハイライト設定
    setHighlightedCell(cellId);
    
    // 対象セルにスクロール
    setTimeout(() => {
      const element = document.getElementById(cellId);
      if (element && scrollRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightedCell(null), 3000);
      }
    }, 100);
  }, [getUnassigned, lastClicked, currentIndex]);

  // 案件数をランダムに生成するヘルパー関数
  const getRandomCaseCount = () => Math.floor(Math.random() * 11) + 20; // 20〜30の範囲

  // 日付ごとの案件数を保持する配列（初回レンダリング時に生成）
  const [dateCloserCases, setDateCloserCases] = useState<number[]>([]);
  const [dateGirlCases, setDateGirlCases] = useState<number[]>([]);
  
  // クライアントサイドでのみ実行されるように useEffect 内でランダム値を生成
  useEffect(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    setDateCloserCases(Array.from({length: daysInMonth}, () => getRandomCaseCount()));
    setDateGirlCases(Array.from({length: daysInMonth}, () => getRandomCaseCount()));
  }, [year, month]);

  // 案件数の合計を計算
  const totalCloserCases = useMemo(() => 
    dateCloserCases.reduce((sum, count) => sum + count, 0),
  [dateCloserCases]);
  
  const totalGirlCases = useMemo(() => 
    dateGirlCases.reduce((sum, count) => sum + count, 0),
  [dateGirlCases]);

  // 未決シフトの合計を計算
  const totalUnassignedClosers = useMemo(() => 
    dates.reduce((sum, {date}) => sum + getUnassigned(date, 'クローザー').length, 0),
  [dates, getUnassigned]);
  
  const totalUnassignedGirls = useMemo(() => 
    dates.reduce((sum, {date}) => sum + getUnassigned(date, 'ガール').length, 0),
  [dates, getUnassigned]);

  // スタッフの稼働要望数を生成するヘルパー関数（10〜20の範囲）
  const getRequestCount = () => Math.floor(Math.random() * 11) + 10;

  // スタッフごとの稼働要望数をステートで管理
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);

  // クライアントサイドでのみ実行されるように useEffect 内でランダム値を生成
  useEffect(() => {
    setStaffRequests(
      staffMembers.map(staff => ({
        id: staff.id,
        totalRequest: getRequestCount(), // 総稼働要望数
        weekendRequest: Math.floor(getRequestCount() / 2), // 土日の稼働要望数（全体の約半分）
        company: staff.company || '未設定' // 会社名のデフォルト値
      }))
    );
  }, [staffMembers]);

  // 稼働要望数の合計
  const totalCloserRequests = useMemo(() => 
    staffRequests
      .filter(req => staffMembers.find(m => m.id === req.id)?.role === 'クローザー')
      .reduce((sum, req) => sum + req.totalRequest, 0),
  [staffRequests, staffMembers]);

  const totalGirlRequests = useMemo(() => 
    staffRequests
      .filter(req => staffMembers.find(m => m.id === req.id)?.role === 'ガール')
      .reduce((sum, req) => sum + req.totalRequest, 0),
  [staffRequests, staffMembers]);

  // コメントダイアログを閉じる
  const handleCloseCommentDialog = useCallback(() => {
    setCommentDialogOpen(false);
    setCommentCellKey(null);
    setCommentText('');
  }, []);

  // useShiftContextはコンポーネント内でのみ使用できるため、
  // ShiftProvider内でサブコンポーネントを作成して処理します
  const CommentHandler: React.FC<{
    open: boolean;
    cellKey: {staffId: string, date: Date} | null;
    initialText: string;
    onClose: () => void;
  }> = ({ open, cellKey, initialText, onClose }) => {
    const { getComment, updateComment } = useShiftContext();
    
    // ダイアログを開く際に既存コメントを取得
    useEffect(() => {
      if (open && cellKey) {
        const comment = getComment(cellKey.staffId, cellKey.date);
        setCommentText(comment);
      }
    }, [open, cellKey, getComment]);
    
    // コメント保存ハンドラー
    const handleSave = useCallback((comment: string) => {
      if (cellKey) {
        updateComment(cellKey.staffId, cellKey.date, comment);
      }
      onClose();
    }, [cellKey, updateComment, onClose]);
    
    if (!open || !cellKey) return null;

  return (
      <CommentDialog
        isOpen={open}
        initialComment={initialText}
        onSave={handleSave}
        onCancel={onClose}
      />
    );
  };

  // コメントダイアログを開くハンドラー - メインコンポーネントで使用
  const handleOpenCommentDialog = useCallback((staffId: string, date: Date) => {
    setCommentCellKey({ staffId, date });
    setCommentDialogOpen(true);
  }, []);

  // 固定情報行（展開時）
  const stickyInfoExpanded = (lbl: string, fn: (m: any) => React.ReactNode, top: number) => (
    <TableRow>
      <DateTop top={top}>{lbl}</DateTop>
      {columnOrder.map(columnId => {
        if (columnId === 'closerCase') {
          return <CloserCaseTop key={columnId} top={top} />;
        } else if (columnId === 'girlCase') {
          return <GirlCaseTop key={columnId} top={top} />;
        } else if (columnId === 'closerAvailable') {
          return <CloserAvailableTop key={columnId} top={top} />;
        } else if (columnId === 'girlAvailable') {
          return <GirlAvailableTop key={columnId} top={top} />;
        }
        return null;
      })}
      <CloseTop top={top} />
      <GirlTop top={top} />
      {orderedStaffMembers.map(m => (
        <Cell 
          key={m.id} 
          colSpan={3} 
          className="staff-section"
          sx={{
            position: 'sticky',
            top,
            background: '#fff',
            zIndex: 450,
            boxShadow: 'inset 0 -1px 0 #000000'
          }}
        >
          {fn(m)}
        </Cell>
      ))}
    </TableRow>
  );
  
  // 固定情報行（折りたたみ時）
  const stickyInfoCollapsed = (lbl: string, fn: (m: any) => React.ReactNode, top: number) => (
    <TableRow>
      <DateTop top={top}>{lbl}</DateTop>
      <CloserSectionTop top={top}>
        {lbl === '所属会社' ? 'ANSTEYPE社員' : ''}
      </CloserSectionTop>
      <CloseTopCollapsed top={top} />
      <GirlTopCollapsed top={top} />
      {orderedStaffMembers.map(m => (
        <Cell 
          key={m.id} 
          colSpan={3} 
          className="staff-section"
          sx={{
            position: 'sticky',
            top,
            background: '#fff',
            zIndex: 450,
            boxShadow: 'inset 0 -1px 0 #000000'
          }}
        >
          {fn(m)}
        </Cell>
      ))}
    </TableRow>
  );
  
  // 通常情報行（展開時）
  const infoRowExpanded = (lbl: string, fn: (m: any) => React.ReactNode) => (
    <TableRow>
      <DateCellFix>{lbl}</DateCellFix>
      {columnOrder.map(columnId => {
        if (columnId === 'closerCase') {
          return <CloserCaseCellFix key={columnId} />;
        } else if (columnId === 'girlCase') {
          return <GirlCaseCellFix key={columnId} />;
        } else if (columnId === 'closerAvailable') {
          return <CloserAvailableCellFix key={columnId} />;
        } else if (columnId === 'girlAvailable') {
          return <GirlAvailableCellFix key={columnId} />;
        }
        return null;
      })}
      <CloseCellFix />
      <GirlCellFix />
      {orderedStaffMembers.map(m => <Cell key={m.id} colSpan={3} className="staff-section">{fn(m)}</Cell>)}
    </TableRow>
  );
  
  // 通常情報行（折りたたみ時）
  const infoRowCollapsed = (lbl: string, fn: (m: any) => React.ReactNode) => (
    <TableRow>
      <DateCellFix>{lbl}</DateCellFix>
      <Cell sx={{ 
        width: W.closerSection,
        backgroundColor: '#e3f2fd',
        borderRight: '2px solid #000000',
        position: 'sticky',
        left: LEFT.closerSection,
        zIndex: 400
      }}>
        {lbl === '平日' ? '¥20,000' : lbl === '土日' ? '¥25,000' : ''}
      </Cell>
      <CloseCellFixCollapsed />
      <GirlCellFixCollapsed />
      {orderedStaffMembers.map(m => <Cell key={m.id} colSpan={3} className="staff-section">{fn(m)}</Cell>)}
    </TableRow>
  );

  // 合計金額計算結果を保存するステート
  const [staffTotals, setStaffTotals] = useState<{[key: string]: {count: number, amount: number}}>({});
  const [roleTotals, setRoleTotals] = useState<{[key: string]: number}>({ 'クローザー': 0, 'ガール': 0 });
  
  // 計算結果を受け取るコールバック
  const handleTotalsCalculated = useCallback((
    newStaffTotals: {[key: string]: {count: number, amount: number}},
    newRoleTotals: {[key: string]: number}
  ) => {
    setStaffTotals(newStaffTotals);
    setRoleTotals(newRoleTotals);
  }, []);

  // 稼働可能数を計算 - 各日付で「○」マークのステータスを持つスタッフの数
  const calculateAvailableCount = useCallback((date: Date, role: string) => {
    const dateStr = date.toISOString().slice(0, 10);
    return shifts.filter(s => 
      s.date === dateStr && 
      s.status === '○' && 
      staffMembers.find(m => m.id === s.staffId)?.role === role
    ).length;
  }, [shifts, staffMembers]);

  // 日付ごとの稼働可能数を保持する配列
  const [dateCloserAvailable, setDateCloserAvailable] = useState<number[]>([]);
  const [dateGirlAvailable, setDateGirlAvailable] = useState<number[]>([]);
  
  // 稼働可能数を計算
  useEffect(() => {
    const closerAvailable: number[] = [];
    const girlAvailable: number[] = [];
    
    dates.forEach(({date}) => {
      closerAvailable.push(calculateAvailableCount(date, 'クローザー'));
      girlAvailable.push(calculateAvailableCount(date, 'ガール'));
    });
    
    setDateCloserAvailable(closerAvailable);
    setDateGirlAvailable(girlAvailable);
  }, [dates, calculateAvailableCount]);
  
  // 稼働可能数の合計
  const totalCloserAvailable = useMemo(() => 
    dateCloserAvailable.reduce((sum, count) => sum + count, 0),
  [dateCloserAvailable]);
  
  const totalGirlAvailable = useMemo(() => 
    dateGirlAvailable.reduce((sum, count) => sum + count, 0),
  [dateGirlAvailable]);

  /* ===== JSX ===== */
  return(
  <ShiftProvider
    shifts={shifts}
    staffMembers={staffMembers}
    onRateChange={onRateChange}
    onStatusChange={onStatusChange}
  >
    <ThemeProvider theme={darkBorderTheme}>
      {/* 合計計算コンポーネント */}
      <TotalsCalculator 
        orderedStaffMembers={orderedStaffMembers}
        onCalculated={handleTotalsCalculated}
      />
      
      <Scroll ref={scrollRef}>
        <STable>
          {/* テーブルヘッダー - アコーディオン状態によって表示を切り替え */}
          <TableHead>
            <TableRow>
              <DateHead className="header">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title={isExpanded ? "折りたたむ" : "展開する"}>
                    <IconButton 
                      size="small" 
                      onClick={handleToggleAccordion}
                      sx={{ mr: 1, p: 0 }}
                    >
                      {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                  </Tooltip>
                  日付
                </Box>
              </DateHead>
              
              {/* 展開時のヘッダー */}
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return (
                        <CloserCaseHead 
                          key={columnId}
                          className={`header ${draggedColumn === columnId ? 'dragging' : ''} ${dragOverColumn === columnId ? 'dragover' : ''}`}
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, columnId)}
                          onDragOver={(e) => handleColumnDragOver(e, columnId)}
                          onDragEnd={handleColumnDragEnd}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}>
                            C案件数
                          </Box>
                        </CloserCaseHead>
                      );
                    } else if (columnId === 'girlCase') {
                      return (
                        <GirlCaseHead 
                          key={columnId} 
                          className={`header ${draggedColumn === columnId ? 'dragging' : ''} ${dragOverColumn === columnId ? 'dragover' : ''}`}
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, columnId)}
                          onDragOver={(e) => handleColumnDragOver(e, columnId)}
                          onDragEnd={handleColumnDragEnd}
                        >
                          G案件数
                        </GirlCaseHead>
                      );
                    } else if (columnId === 'closerAvailable') {
                      return (
                        <CloserAvailableHead 
                          key={columnId} 
                          className={`header ${draggedColumn === columnId ? 'dragging' : ''} ${dragOverColumn === columnId ? 'dragover' : ''}`}
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, columnId)}
                          onDragOver={(e) => handleColumnDragOver(e, columnId)}
                          onDragEnd={handleColumnDragEnd}
                        >
                          C可能
                        </CloserAvailableHead>
                      );
                    } else if (columnId === 'girlAvailable') {
                      return (
                        <GirlAvailableHead 
                          key={columnId} 
                          className={`header ${draggedColumn === columnId ? 'dragging' : ''} ${dragOverColumn === columnId ? 'dragover' : ''}`}
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, columnId)}
                          onDragOver={(e) => handleColumnDragOver(e, columnId)}
                          onDragEnd={handleColumnDragEnd}
                        >
                          G可能
                        </GirlAvailableHead>
                      );
                    }
                    return null;
                  })}
                  <CloseHead className="header">未決C</CloseHead>
                  <GirlHead className="header">未決G</GirlHead>
                </>
              ) : (
                // 折りたたみ時のヘッダー
                <>
                  <CloserSectionHead className="header">クローザー</CloserSectionHead>
                  <CloseHeadCollapsed className="header">未決C</CloseHeadCollapsed>
                  <GirlHeadCollapsed className="header">未決G</GirlHeadCollapsed>
                </>
              )}
              
              {/* スタッフヘッダー - 常に表示 */}
              {orderedStaffMembers.map(s => (
                <StaffHeadSticky 
                  key={s.id} 
                  colSpan={3} 
                  className={`staff-section ${draggedStaffId === s.id ? 'dragging' : ''} ${dragOverStaffId === s.id ? 'dragover' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, s.id)}
                  onDragOver={(e) => handleDragOver(e, s.id)}
                  onDragEnd={handleDragEnd}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    {s.role||'スタッフ'}
                  </Box>
                </StaffHeadSticky>
              ))}
            </TableRow>
          </TableHead>

          {/* ボディセクション - アコーディオン状態によって表示を切り替え */}
          <TableBody>
            {/* 上部固定行 */}
            {isExpanded ? (
              <>
                {stickyInfoExpanded('所属会社', m => m.company || '未設定', TOP.company)}
                {stickyInfoExpanded('氏名', m => m.name, TOP.name)}
                {stickyInfoExpanded('カナ', m => m.nameKana, TOP.kana)}
              </>
            ) : (
              <>
                {stickyInfoCollapsed('所属会社', m => m.company || '未設定', TOP.company)}
                {stickyInfoCollapsed('氏名', m => m.name, TOP.name)}
                {stickyInfoCollapsed('カナ', m => m.nameKana, TOP.kana)}
              </>
            )}
            
            {/* 非固定情報行 */}
            <TableRow>
              <DateCellFix>最寄駅</DateCellFix>
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return <CloserCaseCellFix key={columnId} />;
                    } else if (columnId === 'girlCase') {
                      return <GirlCaseCellFix key={columnId} />;
                    } else if (columnId === 'closerAvailable') {
                      return <CloserAvailableCellFix key={columnId} />;
                    } else if (columnId === 'girlAvailable') {
                      return <GirlAvailableCellFix key={columnId} />;
                    }
                    return null;
                  })}
                  <CloseCellFix />
                  <GirlCellFix />
                </>
              ) : (
                <>
                  <Cell sx={{ width: W.closerSection }}>渋谷駅</Cell>
                  <CloseCellFixCollapsed />
                  <GirlCellFixCollapsed />
                </>
              )}
              {orderedStaffMembers.map(m => <Cell key={m.id} colSpan={3} className="staff-section">{m.station}</Cell>)}
            </TableRow>

            {/* スクロール情報行 */}
            {isExpanded ? (
              <>
                {infoRowExpanded('平日', m => `¥${m.weekdayRate.toLocaleString()}`)}
                {infoRowExpanded('土日', m => `¥${m.holidayRate.toLocaleString()}`)}
                {infoRowExpanded('TEL', m => m.tel)}
                {infoRowExpanded('ID', m => m.id)}
              </>
            ) : (
              <>
                {infoRowCollapsed('平日', m => `¥${m.weekdayRate.toLocaleString()}`)}
                {infoRowCollapsed('土日', m => `¥${m.holidayRate.toLocaleString()}`)}
                {infoRowCollapsed('TEL', m => m.tel)}
                {infoRowCollapsed('ID', m => m.id)}
              </>
            )}

            {/* シフトヘッダー */}
            <TableRow>
              <DateCellFix className="shift-header">日付</DateCellFix>
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return (
                        <CloserCaseCellFix key={columnId} className="shift-header">C案件</CloserCaseCellFix>
                      );
                    } else if (columnId === 'girlCase') {
                      return (
                        <GirlCaseCellFix key={columnId} className="shift-header">G案件</GirlCaseCellFix>
                      );
                    } else if (columnId === 'closerAvailable') {
                      return (
                        <CloserAvailableCellFix key={columnId} className="shift-header">C可能</CloserAvailableCellFix>
                      );
                    } else if (columnId === 'girlAvailable') {
                      return (
                        <GirlAvailableCellFix key={columnId} className="shift-header">G可能</GirlAvailableCellFix>
                      );
                    }
                    return null;
                  })}
                  <CloseCellFix className="shift-header">未決C</CloseCellFix>
                  <GirlCellFix className="shift-header">未決G</GirlCellFix>
                </>
              ) : (
                <>
                  <Cell className="shift-header" sx={{ width: W.closerSection }}>クローザー</Cell>
                  <CloseCellFixCollapsed className="shift-header">未決C</CloseCellFixCollapsed>
                  <GirlCellFixCollapsed className="shift-header">未決G</GirlCellFixCollapsed>
                </>
              )}
              {orderedStaffMembers.map(staff => (
                <React.Fragment key={staff.id}>
                  <Cell className="shift-header">希望</Cell>
                  <Cell className="shift-header">単価</Cell>
                  <Cell className="staff-section shift-header location">稼働場所</Cell>
                </React.Fragment>
              ))}
            </TableRow>

            {/* 日付行 */}
            {dates.map((dateInfo, index) => (
              <DateRow
                key={dateInfo.date.toISOString()}
                dateInfo={dateInfo}
                staffMembers={orderedStaffMembers}
                dateCloserCases={dateCloserCases[index] || 0}
                dateGirlCases={dateGirlCases[index] || 0}
                dateCloserAvailable={dateCloserAvailable[index] || 0}
                dateGirlAvailable={dateGirlAvailable[index] || 0}
                closerUnassignedCount={getUnassigned(dateInfo.date, 'クローザー').length}
                girlUnassignedCount={getUnassigned(dateInfo.date, 'ガール').length}
                highlightedCellId={highlightedCell}
                onUnassignedClick={handleUnassignedClick}
                onCommentClick={handleOpenCommentDialog}
                columnOrder={columnOrder}
                isExpanded={isExpanded}
              />
            ))}
            
            {/* 要望行 */}
            <TableRow>
              <DateCellFix sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}>要望</DateCellFix>
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return (
                        <CloserCaseCellFix 
                          key={columnId} 
                          sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}
                        >
                          {totalCloserRequests}
                        </CloserCaseCellFix>
                      );
                    } else if (columnId === 'girlCase') {
                      return (
                        <GirlCaseCellFix 
                          key={columnId} 
                          sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}
                        >
                          {totalGirlRequests}
                        </GirlCaseCellFix>
                      );
                    } else if (columnId === 'closerAvailable') {
                      return (
                        <CloserAvailableCellFix 
                          key={columnId} 
                          sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}
                        >
                          -
                        </CloserAvailableCellFix>
                      );
                    } else if (columnId === 'girlAvailable') {
                      return (
                        <GirlAvailableCellFix 
                          key={columnId} 
                          sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}
                        >
                          -
                        </GirlAvailableCellFix>
                      );
                    }
                    return null;
                  })}
                  <CloseCellFix sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}>
                    -
                  </CloseCellFix>
                  <GirlCellFix sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}>
                    -
                  </GirlCellFix>
                </>
              ) : (
                <>
                  <Cell 
                    sx={{
                      width: W.closerSection,
                      background:'#f3e5f5',
                      borderTop:'2px solid #000000',
                      color:'#9c27b0'
                    }}
                  >
                    {totalCloserRequests}
                  </Cell>
                  <CloseCellFixCollapsed sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}>
                    -
                  </CloseCellFixCollapsed>
                  <GirlCellFixCollapsed sx={{background:'#f3e5f5',borderTop:'2px solid #000000',color:'#9c27b0'}}>
                    -
                  </GirlCellFixCollapsed>
                </>
              )}
              {orderedStaffMembers.map(s => {
                // そのスタッフの要望データを取得
                const request = staffRequests.find(req => req.id === s.id);
                return (
                  <Cell 
                    key={s.id} 
                    colSpan={3}
                    className="staff-section"
                    sx={{
                      background:'#f3e5f5',
                      borderTop:'2px solid #000000',
                      color:'#9c27b0',
                      fontWeight:700
                    }}
                  >
                    {request ? `${request.totalRequest}回 (土日${request.weekendRequest})` : '-'}
                  </Cell>
                );
              })}
            </TableRow>

            {/* 稼働数 */}
            <TableRow>
              <DateCellFix sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}>稼働数</DateCellFix>
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return (
                        <CloserCaseCellFix 
                          key={columnId} 
                          sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}
                        >
                          {totalCloserCases}
                        </CloserCaseCellFix>
                      );
                    } else if (columnId === 'girlCase') {
                      return (
                        <GirlCaseCellFix 
                          key={columnId} 
                          sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}
                        >
                          {totalGirlCases}
                        </GirlCaseCellFix>
                      );
                    } else if (columnId === 'closerAvailable') {
                      return (
                        <CloserAvailableCellFix 
                          key={columnId} 
                          sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}
                        >
                          {totalCloserAvailable}
                        </CloserAvailableCellFix>
                      );
                    } else if (columnId === 'girlAvailable') {
                      return (
                        <GirlAvailableCellFix 
                          key={columnId} 
                          sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}
                        >
                          {totalGirlAvailable}
                        </GirlAvailableCellFix>
                      );
                    }
                    return null;
                  })}
                  <CloseCellFix sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}>
                    {totalUnassignedClosers}
                  </CloseCellFix>
                  <GirlCellFix sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}>
                    {totalUnassignedGirls}
                  </GirlCellFix>
                </>
              ) : (
                <>
                  <Cell 
                    sx={{
                      width: W.closerSection,
                      background:'#e8eaf6',
                      borderTop:'2px solid #000000',
                      color:'#3f51b5'
                    }}
                  >
                    {totalCloserCases}
                  </Cell>
                  <CloseCellFixCollapsed sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}>
                    {totalUnassignedClosers}
                  </CloseCellFixCollapsed>
                  <GirlCellFixCollapsed sx={{background:'#e8eaf6',borderTop:'2px solid #000000',color:'#3f51b5'}}>
                    {totalUnassignedGirls}
                  </GirlCellFixCollapsed>
                </>
              )}
              {orderedStaffMembers.map(s => (
                <Cell 
                  key={s.id} 
                  colSpan={3}
                  className="staff-section"
                  sx={{
                    background:'#e8eaf6',
                    borderTop:'2px solid #000000',
                    color:'#3f51b5',
                    fontWeight:700
                  }}
                >
                  {staffTotals[s.id]?.count || 0}
                </Cell>
              ))}
            </TableRow>

            {/* ===== 実績 (セル単位で bottom‑sticky) ===== */}
            <TableRow>
              <DateBottom>実績</DateBottom>
              {isExpanded ? (
                <>
                  {columnOrder.map(columnId => {
                    if (columnId === 'closerCase') {
                      return (
                        <CloserCaseBottom key={columnId}>
                          {totalCloserCases}件
                        </CloserCaseBottom>
                      );
                    } else if (columnId === 'girlCase') {
                      return (
                        <GirlCaseBottom key={columnId}>
                          {totalGirlCases}件
                        </GirlCaseBottom>
                      );
                    } else if (columnId === 'closerAvailable') {
                      return (
                        <CloserAvailableBottom key={columnId}>
                          {totalCloserAvailable}人
                        </CloserAvailableBottom>
                      );
                    } else if (columnId === 'girlAvailable') {
                      return (
                        <GirlAvailableBottom key={columnId}>
                          {totalGirlAvailable}人
                        </GirlAvailableBottom>
                      );
                    }
                    return null;
                  })}
                  <CloseBottom>
                    ¥{roleTotals['クローザー'].toLocaleString()}
                  </CloseBottom>
                  <GirlBottom>
                    ¥{roleTotals['ガール'].toLocaleString()}
                  </GirlBottom>
                </>
              ) : (
                <>
                  <CloserSectionBottom>
                    ¥{roleTotals['クローザー'].toLocaleString()}
                  </CloserSectionBottom>
                  <CloseBottomCollapsed>
                    ¥{roleTotals['クローザー'].toLocaleString()}
                  </CloseBottomCollapsed>
                  <GirlBottomCollapsed>
                    ¥{roleTotals['ガール'].toLocaleString()}
                  </GirlBottomCollapsed>
                </>
              )}
              {orderedStaffMembers.map(s => (
                <BottomCell key={s.id} colSpan={3} className="staff-section">
                  ¥{staffTotals[s.id]?.amount.toLocaleString() || '0'}
                </BottomCell>
              ))}
            </TableRow>
          </TableBody>
        </STable>
      </Scroll>
      
      {/* コメント処理コンポーネント */}
      <CommentHandler
        open={commentDialogOpen}
        cellKey={commentCellKey}
        initialText={commentText}
        onClose={handleCloseCommentDialog}
      />
    </ThemeProvider>
  </ShiftProvider>
  );
};
