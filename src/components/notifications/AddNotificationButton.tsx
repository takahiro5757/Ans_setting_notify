'use client';

import React from 'react';
import { Button } from '@mui/material';
import { useShiftStore } from '@/stores/shiftStore';

/**
 * 新しい通知を追加するためのテスト用ボタン
 */
const AddNotificationButton: React.FC = () => {
  const { addNotification, addChangeRequest } = useShiftStore();

  const addNewNotification = () => {
    const now = new Date();
    const notificationTypes = ['shift_bulk_submission', 'change_request', 'approval', 'rejection'] as const;
    const stores = ['新宿店', '渋谷店', '池袋店', '品川店'];
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomStaffCount = Math.floor(Math.random() * 30) + 1;

    let message = '';
    switch (randomType) {
      case 'shift_bulk_submission':
        message = `${randomStore}から2025年4月のシフト一括提出 (${randomStaffCount}名分)`;
        break;
      case 'change_request':
        message = `${randomStore}から2025年4月のシフト変更依頼 (${Math.floor(randomStaffCount/5)}名、${Math.floor(randomStaffCount/3)}件の変更)`;
        break;
      case 'approval':
        message = `シフト変更依頼が承認されました (${randomStore})`;
        break;
      case 'rejection':
        message = `シフト変更依頼が却下されました (${randomStore})`;
        break;
    }

    // 変更依頼の場合は、事前に関連IDを生成
    const changeRequestId = randomType === 'change_request' ? `change_request_${Date.now()}` : undefined;

    const newNotification = {
      type: randomType,
      message,
      read: false,
      shiftDetails: {
        storeName: randomStore,
        storeId: `store_${Math.floor(Math.random() * 1000)}`,
        targetYear: 2025,
        targetMonth: 4,
        submissionType: Math.random() > 0.5 ? 'new' as const : 'modification' as const,
        priority: randomPriority,
        staffCount: randomStaffCount,
        changeCount: randomType === 'change_request' ? Math.floor(randomStaffCount/3) : undefined,
        relatedShiftId: changeRequestId // 変更依頼の場合は関連IDを設定
      },
      actions: {
        primaryAction: {
          label: randomType === 'change_request' ? '承認' : '確認',
          path: '/shifts/management'
        },
        secondaryAction: {
          label: '詳細',
          path: '/shifts/management?detail=true'
        }
      }
    };

    addNotification(newNotification);

    // 変更依頼の場合は、対応する変更依頼データも追加
    if (randomType === 'change_request' && changeRequestId) {
      
      const newChangeRequest = {
        id: changeRequestId,
        targetYear: 2025,
        targetMonth: 4,
        reason: `${randomStore}からの緊急調整依頼`,
        status: 'pending' as const,
        companyName: randomStore,
        submittedAt: now.toISOString(),
        staffChanges: [
          {
            staffId: `staff_${Math.floor(Math.random() * 1000)}`,
            staffName: `スタッフ${Math.floor(Math.random() * 100)}`,
            status: 'pending' as const,
            changes: [
              {
                field: 'status' as const,
                date: '4月' + (Math.floor(Math.random() * 28) + 1) + '日',
                oldValue: Math.random() > 0.5 ? '○' : '×',
                newValue: Math.random() > 0.5 ? '○' : '×'
              }
            ]
          }
        ]
      };
      addChangeRequest(newChangeRequest);
    }

    console.log('新しい通知を追加しました:', message);
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={addNewNotification}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'white',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)'
        }
      }}
    >
      📢 新しい通知を追加
    </Button>
  );
};

export default AddNotificationButton;