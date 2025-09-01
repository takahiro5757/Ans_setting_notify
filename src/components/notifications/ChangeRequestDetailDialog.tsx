'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  Chip,
  Alert,
  IconButton,
  Divider,
  styled
} from '@mui/material';
import { 
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { ShiftNotification, ChangeRequestData, StaffChangeData, Comment } from '@/stores/shiftStore';
import { useShiftStore } from '@/stores/shiftStore';

// スタイル定義
const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

const StaffChangeCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const CommentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

const CommentItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const CommentHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

interface ChangeRequestDetailDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean;
  /** 通知データ */
  notification: ShiftNotification;
  /** ダイアログを閉じる */
  onClose: () => void;
}

/**
 * 変更依頼詳細ダイアログコンポーネント
 * 
 * シフト変更依頼の詳細表示と個別承認機能を提供。
 * スタッフ単位での承認・却下、一括操作が可能。
 */
const ChangeRequestDetailDialog: React.FC<ChangeRequestDetailDialogProps> = ({
  open,
  notification,
  onClose
}) => {
  const {
    changeRequests,
    updateStaffChangeStatus,
    bulkApproveChangeRequest,
    bulkRejectChangeRequest,
    getComments,
    addComment
  } = useShiftStore();



  const [overallComment, setOverallComment] = useState('');
  const [showBulkApprovalDialog, setShowBulkApprovalDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showIndividualRejectDialog, setShowIndividualRejectDialog] = useState<string | null>(null);
  


  // 変更依頼データを取得
  const changeRequest = changeRequests.find(cr => {
    // 関連IDがある場合は、それを最優先で使用
    if (notification.shiftDetails.relatedShiftId) {
      return cr.id === notification.shiftDetails.relatedShiftId;
    }
    
    // 関連IDがない場合は、従来通り年月・会社名で検索
    return cr.targetYear === notification.shiftDetails.targetYear &&
           cr.targetMonth === notification.shiftDetails.targetMonth &&
           cr.companyName === notification.shiftDetails.storeName;
  });



  if (!changeRequest) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="warning" />
            変更依頼詳細
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            対応する変更依頼データが見つかりません。
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            この通知に関連する変更依頼データが見つからないか、既に処理済みの可能性があります。
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>通知情報:</strong><br/>
              店舗名: {notification.shiftDetails.storeName}<br/>
              対象年月: {notification.shiftDetails.targetYear}年{notification.shiftDetails.targetMonth}月<br/>
              {notification.shiftDetails.relatedShiftId && (
                <>関連ID: {notification.shiftDetails.relatedShiftId}<br/></>
              )}
              通知時刻: {notification.timestamp.toLocaleString('ja-JP')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ステータスチップの表示
  const getStatusChip = (status: StaffChangeData['status']) => {
    const config = {
      pending: { label: '保留中', color: 'default' as const },
      approved: { label: '承認済み', color: 'success' as const },
      rejected: { label: '却下', color: 'error' as const }
    };
    return <Chip {...config[status]} size="small" />;
  };

  // 全体ステータスのラベル
  const getOverallStatusLabel = (status: ChangeRequestData['status']) => {
    switch (status) {
      case 'pending': return '保留中';
      case 'approved': return '承認完了';
      case 'rejected': return '却下済み';
      case 'mixed': return '部分承認';
      default: return '不明';
    }
  };

  // 保留中のスタッフ数を取得
  const pendingStaff = changeRequest.staffChanges.filter(sc => sc.status === 'pending');
  const approvedStaff = changeRequest.staffChanges.filter(sc => sc.status === 'approved');
  const rejectedStaff = changeRequest.staffChanges.filter(sc => sc.status === 'rejected');

  // 個別承認処理
  const handleIndividualApprove = (staffId: string) => {
    updateStaffChangeStatus(changeRequest.id, staffId, 'approved');
  };

  // 個別却下処理
  const handleIndividualReject = (staffId: string) => {
    updateStaffChangeStatus(changeRequest.id, staffId, 'rejected');
    setShowIndividualRejectDialog(null);
  };

  // 一括承認処理
  const handleBulkApprove = () => {
    // 承認理由があればコメント履歴に追加
    if (overallComment.trim()) {
      addComment(overallComment.trim(), 'change_request', changeRequest.id);
    }
    
    bulkApproveChangeRequest(changeRequest.id);
    setShowBulkApprovalDialog(false);
    setOverallComment('');
  };

  // 一括却下処理
  const handleBulkReject = () => {
    // 却下理由をコメント履歴に追加
    if (overallComment.trim()) {
      addComment(overallComment.trim(), 'change_request', changeRequest.id);
    }
    
    bulkRejectChangeRequest(changeRequest.id);
    setShowBulkRejectDialog(false);
    setOverallComment('');
  };



  // コメント取得
  const comments = getComments('change_request', changeRequest.id);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <DialogHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="warning" />
              <Typography variant="h6">
                シフト変更依頼詳細
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </DialogHeader>
        </DialogTitle>

        <DialogContent>
          {/* 基本情報表示 */}
          <InfoSection>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {changeRequest.targetYear}年{changeRequest.targetMonth}月のシフト変更依頼
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" color="text.primary">
                <strong>依頼ID：</strong>{changeRequest.id}
              </Typography>
              
              <Typography variant="body1" color="text.primary">
                <strong>提出日時：</strong>{new Date(changeRequest.submittedAt).toLocaleString('ja-JP')}
              </Typography>
              
              <Typography variant="body1" color="text.primary">
                <strong>変更理由：</strong>{changeRequest.reason}
              </Typography>
            </Box>
          </InfoSection>

          {/* スタッフ単位の変更内容表示・個別操作 */}
          <Typography variant="h6" gutterBottom>
            変更内容詳細（スタッフ単位承認）
          </Typography>
          
          {changeRequest.staffChanges.map((staffChange) => (
            <StaffChangeCard key={staffChange.staffId}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {staffChange.staffName}
                </Typography>
                <ActionButtons>
                  {getStatusChip(staffChange.status)}
                  {staffChange.status === 'pending' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleIndividualApprove(staffChange.staffId)}
                      >
                        承認
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setShowIndividualRejectDialog(staffChange.staffId)}
                      >
                        却下
                      </Button>
                    </>
                  )}
                  {staffChange.approvedAt && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(staffChange.approvedAt).toLocaleString('ja-JP')}
                      {staffChange.approvedBy && (
                        <> / 操作者: {staffChange.approvedBy.userName}</>
                      )}
                    </Typography>
                  )}
                </ActionButtons>
              </Box>
              
              {/* 変更内容表示 */}
              {staffChange.changes.map((change, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                  {change.date ? `${change.date}: ` : ''}
                  {change.oldValue} → {change.newValue} ({change.field === 'status' ? 'シフト希望' : '要望'})
                </Typography>
              ))}
            </StaffChangeCard>
          ))}

          <Divider sx={{ my: 3 }} />

          {/* 依頼全体の承認者コメント入力欄 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              承認者コメント（依頼全体）
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="この変更依頼全体に対するコメント"
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="承認・却下の理由や追加のコメントを入力してください"
              />
              <Button
                onClick={() => {
                  if (overallComment.trim()) {
                    addComment(overallComment.trim(), 'change_request', changeRequest.id);
                    setOverallComment('');
                  }
                }}
                variant="contained"
                disabled={!overallComment.trim()}
                startIcon={<SendIcon />}
                sx={{ minWidth: 100, height: 'fit-content' }}
              >
                送信
              </Button>
            </Box>
          </Box>

          {/* コメント履歴セクション */}
          <CommentSection>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CommentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                コメント履歴 ({comments.length})
              </Typography>
            </Box>
            
            {comments.length > 0 ? (
              <Box>
                {comments.map((comment) => (
                  <CommentItem key={comment.id}>
                    <CommentHeader>
                      <Typography variant="subtitle2" color="primary">
                        {comment.author.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleString('ja-JP')}
                        {comment.editedAt && (
                          <> (編集済み: {new Date(comment.editedAt).toLocaleString('ja-JP')})</>
                        )}
                      </Typography>
                    </CommentHeader>
                    
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </CommentItem>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                まだコメントがありません
              </Typography>
            )}


          </CommentSection>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowBulkApprovalDialog(true)}
            variant="contained"
            color="success"
            disabled={pendingStaff.length === 0}
          >
            一括承認 ({pendingStaff.length}件)
          </Button>
          <Button
            onClick={() => setShowBulkRejectDialog(true)}
            variant="contained"
            color="error"
            disabled={pendingStaff.length === 0}
          >
            一括却下 ({pendingStaff.length}件)
          </Button>
          <Button onClick={onClose}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

      {/* 一括承認確認ダイアログ */}
      <Dialog open={showBulkApprovalDialog} onClose={() => setShowBulkApprovalDialog(false)}>
        <DialogTitle>一括承認の確認</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            保留中の{pendingStaff.length}件のスタッフ変更を一括で承認しますか？
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            既に承認済み・却下済みのスタッフは対象外です
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkApprovalDialog(false)}>キャンセル</Button>
          <Button
            onClick={handleBulkApprove}
            variant="contained"
            color="success"
          >
            一括承認
          </Button>
        </DialogActions>
      </Dialog>

      {/* 一括却下確認ダイアログ */}
      <Dialog open={showBulkRejectDialog} onClose={() => {
        setShowBulkRejectDialog(false);
        setOverallComment('');
      }}>
        <DialogTitle>一括却下の確認</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            保留中の{pendingStaff.length}件のスタッフ変更を一括で却下しますか？
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            既に承認済み・却下済みのスタッフは対象外です
          </Alert>
          <Alert severity="error" sx={{ mb: 2 }}>
            却下理由の入力は必須です
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="却下理由"
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="却下理由を入力してください（必須）"
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowBulkRejectDialog(false);
            setOverallComment('');
          }}>キャンセル</Button>
          <Button
            onClick={handleBulkReject}
            variant="contained"
            color="error"
            disabled={!overallComment.trim()}
          >
            一括却下
          </Button>
        </DialogActions>
      </Dialog>

      {/* 個別却下確認ダイアログ */}
      <Dialog 
        open={showIndividualRejectDialog !== null} 
        onClose={() => setShowIndividualRejectDialog(null)}
      >
        <DialogTitle>変更内容の却下</DialogTitle>
        <DialogContent>
          {showIndividualRejectDialog && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {changeRequest.staffChanges.find(sc => sc.staffId === showIndividualRejectDialog)?.staffName}さんの変更内容を却下しますか？
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ※ 却下理由は依頼全体のコメント欄に入力してください
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIndividualRejectDialog(null)}>キャンセル</Button>
          <Button
            onClick={() => showIndividualRejectDialog && handleIndividualReject(showIndividualRejectDialog)}
            color="error"
          >
            却下
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangeRequestDetailDialog;