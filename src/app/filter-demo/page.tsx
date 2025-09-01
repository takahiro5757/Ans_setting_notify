'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { NotificationFilter, useShiftStore } from '@/stores/shiftStore';
import ImprovedNotificationFilter from '@/components/notifications/ImprovedNotificationFilter';

/**
 * フィルターデザインのデモページ
 * 
 * 各種フィルターデザインパターンを比較できるデモンストレーション
 */
const FilterDemoPage: React.FC = () => {
  const [filter1, setFilter1] = useState<NotificationFilter>('all');
  const [filter2, setFilter2] = useState<NotificationFilter>('all');
  const [filter3, setFilter3] = useState<NotificationFilter>('all');
  const [filter4, setFilter4] = useState<NotificationFilter>('all');
  const [showCounts, setShowCounts] = useState(true);

  // ストアから実際の通知データを取得
  const { notifications, getChangeRequestStatus } = useShiftStore();

  // 実際の件数データを計算
  const actualCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      submission: notifications.filter(n => n.type === 'shift_submission').length,
      change: notifications.filter(n => n.type === 'change_request').length,
      pending: notifications.filter(n => {
        if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
          const status = getChangeRequestStatus(n.shiftDetails.relatedShiftId);
          return status === 'pending';
        }
        return false;
      }).length,
      approved: notifications.filter(n => {
        if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
          const status = getChangeRequestStatus(n.shiftDetails.relatedShiftId);
          return status === 'completed';
        }
        return false;
      }).length,
    };
  }, [notifications, getChangeRequestStatus]);

  // 表示用の件数データ
  const displayCounts = showCounts ? actualCounts : {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        通知フィルター デザイン比較
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        現在の通知フィルターの改善案をいくつかのパターンで比較できます
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={showCounts}
              onChange={(e) => setShowCounts(e.target.checked)}
            />
          }
          label="件数表示"
        />
      </Box>

      <Grid container spacing={4}>
        {/* パターン1: ドロップダウン式 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="パターン1: ドロップダウン式"
              subheader="コンパクトで現代的なデザイン"
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ✅ 省スペース<br/>
                  ✅ 件数表示<br/>
                  ✅ アイコンで視覚的識別<br/>
                  ✅ スマホでも使いやすい
                </Typography>
              </Box>
                              <ImprovedNotificationFilter
                  variant="dropdown"
                  filter={filter1}
                  onFilterChange={setFilter1}
                  filterCounts={displayCounts}
                />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                現在選択: {filter1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* パターン2: アコーディオン式 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="パターン2: アコーディオン式"
              subheader="カテゴリ別にグループ化"
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ✅ 階層的な構造<br/>
                  ✅ カテゴリ別分類<br/>
                  ✅ 詳細なフィルタリング<br/>
                  ⚠️ 高さが必要
                </Typography>
              </Box>
              <ImprovedNotificationFilter
                variant="accordion"
                filter={filter2}
                onFilterChange={setFilter2}
                filterCounts={displayCounts}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                現在選択: {filter2}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* パターン3: セグメント式 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="パターン3: セグメント式"
              subheader="iOSライクなデザイン"
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ✅ 直感的な操作<br/>
                  ✅ 主要フィルターが見やすい<br/>
                  ✅ モダンなデザイン<br/>
                  ⚠️ 画面幅が必要
                </Typography>
              </Box>
              <ImprovedNotificationFilter
                variant="segments"
                filter={filter3}
                onFilterChange={setFilter3}
                filterCounts={displayCounts}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                現在選択: {filter3}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* パターン4: タブ式 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader
              title="パターン4: タブ式"
              subheader="タブナビゲーション風"
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ✅ 一覧性が高い<br/>
                  ✅ 慣れ親しまれたUI<br/>
                  ✅ 件数が見やすい<br/>
                  ⚠️ 縦方向にスペース使用
                </Typography>
              </Box>
              <ImprovedNotificationFilter
                variant="tabs"
                filter={filter4}
                onFilterChange={setFilter4}
                filterCounts={displayCounts}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                現在選択: {filter4}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 現在のデザインとの比較 */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          現在の実装との比較
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="error.main" gutterBottom>
              現在の課題
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 水平スクロールが必要<br/>
              • 件数情報がない<br/>
              • 視覚的階層が不明確<br/>
              • レスポンシブ対応が不十分<br/>
              • カテゴリ分けがない
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              改善される点
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • コンパクトなデザイン<br/>
              • リアルタイム件数表示<br/>
              • アイコンによる視覚的識別<br/>
              • レスポンシブ対応<br/>
              • カテゴリ別の整理
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* 推奨案 */}
      <Paper sx={{ mt: 3, p: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
        <Typography variant="h6" color="primary.main" gutterBottom>
          🎯 推奨案: ドロップダウン式
        </Typography>
        <Typography variant="body2" color="text.secondary">
          最もバランスが取れており、現在のドロワーデザインにも馴染みます。
          スペース効率が良く、機能も充実しているため、実装をお勧めします。
        </Typography>
      </Paper>
    </Container>
  );
};

export default FilterDemoPage;