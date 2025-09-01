import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StaffMember, Shift, SubmissionStatus, SyncStatus, StaffRequest } from '@/components/shifts/SpreadsheetGrid/types';

// 基本の通知型定義
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

// シフト通知の詳細データ
interface ShiftNotificationDetails {
  storeName: string;        // 2次店名
  storeId: string;         // 店舗ID
  targetYear: number;       // 対象年
  targetMonth: number;      // 対象月
  submissionType: 'new' | 'modification' | 'resubmission';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedShiftId?: string; // 関連シフトID
  requiredAction?: string; // 必要なアクション
  staffCount?: number;     // 対象スタッフ数
  changeCount?: number;    // 変更件数
}

// シフト通知拡張型
interface ShiftNotification extends Omit<Notification, 'type'> {
  type: 'shift_submission' | 'change_request';
  shiftDetails: ShiftNotificationDetails;
  actions: {
    primaryAction: {
      label: string;          // "確認" | "承認" | "対応"
      path: string;           // 遷移先パス
    };
    secondaryAction?: {
      label: string;          // "詳細" | "履歴"
      path: string;
    };
  };
}

// コメントデータ
interface Comment {
  id: string;
  content: string;
  author: {
    userId: string;
    userName: string;
    userRole: string;
  };
  timestamp: string;
  editedAt?: string;
  targetType: 'change_request' | 'staff_change';
  targetId: string; // change_request_id または staffId
}

// 変更依頼データ
interface StaffChangeData {
  staffId: string;
  staffName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: {
    userId: string;
    userName: string;
    userRole: string;
  };
  changes: Array<{
    field: 'status' | 'request';
    date?: string;
    oldValue: string;
    newValue: string;
  }>;
}

// 変更依頼全体データ
interface ChangeRequestData {
  id: string;
  targetYear: number;
  targetMonth: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'mixed';
  staffChanges: StaffChangeData[];
  approverComment?: string;
  submittedAt: string;
  companyName: string;
}

// 通知フィルター型
type NotificationFilter = 'all' | 'unread' | 'submission' | 'change' | 'pending' | 'approved';

// 型をエクスポート
export type {
  ShiftNotification,
  ShiftNotificationDetails,
  ChangeRequestData,
  StaffChangeData,
  NotificationFilter,
  Comment
};

// ストアの状態型定義
interface ShiftStoreState {
  // 現在の年月
  currentYear: number;
  currentMonth: number;
  
  // 現在のログインユーザー情報
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  
  // スタッフメンバー
  staffMembers: StaffMember[];
  
  // シフトデータ
  shifts: Shift[];
  
  // スタッフ要望データ
  staffRequests: { [key: string]: StaffRequest[] }; // 'YYYY-MM' をキーとする
  
  // ローディング状態
  isLoading: boolean;
  
  // 通知管理
  notifications: ShiftNotification[];
  changeRequests: ChangeRequestData[];
  notificationFilter: NotificationFilter;
  
  // コメント管理
  comments: Comment[];
  
  // 自動同期状態
  autoSyncEnabled: boolean;
  
  // 最終同期時刻
  lastSyncTime: Date | null;
  
  // アクション
  setStaffMembers: (members: StaffMember[]) => void;
  setShifts: (shifts: Shift[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentDate: (year: number, month: number) => void;
  getShifts: (year: number, month: number) => Shift[];
  getStaffRequests: (year: number, month: number) => StaffRequest[];
  updateStaffRequests: (year: number, month: number, requests: StaffRequest[]) => void;
  
  // 通知関連アクション
  addNotification: (notification: Omit<ShiftNotification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
  getFilteredNotifications: () => ShiftNotification[];
  setNotificationFilter: (filter: NotificationFilter) => void;
  
  // 変更依頼関連アクション
  addChangeRequest: (request: ChangeRequestData) => void;
  updateStaffChangeStatus: (requestId: string, staffId: string, status: 'approved' | 'rejected') => void;
  bulkApproveChangeRequest: (requestId: string) => void;
  bulkRejectChangeRequest: (requestId: string) => void;
  getChangeRequestStatus: (requestId: string) => 'pending' | 'completed';
  getChangeRequestSummary: (requestId: string) => { pending: number; approved: number; rejected: number; total: number; };
  getChangeRequestStaffNames: (requestId: string) => { 
    approved: Array<{staffName: string; approvedBy?: string}>; 
    rejected: Array<{staffName: string; approvedBy?: string}>; 
    pending: string[]; 
  };
  
  // コメント関連アクション
  addComment: (content: string, targetType: 'change_request' | 'staff_change', targetId: string) => void;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  getComments: (targetType: 'change_request' | 'staff_change', targetId: string) => Comment[];
  
  syncFromAnsteype: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
}

// ダミーのスタッフメンバーデータ
export const staffMembers: StaffMember[] = [
  // クローザー
  {
    id: '1205000001',
    name: '荒川拓実',
    nameKana: 'アラカワタクミ',
    station: '渋谷駅',
    weekdayRate: 20000,
    holidayRate: 25000,
    tel: '090-1234-5678',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000002',
    name: '田中花子',
    nameKana: 'タナカハナコ',
    station: '新宿駅',
    weekdayRate: 18000,
    holidayRate: 23000,
    tel: '090-2345-6789',
    role: 'クローザー',
    company: 'ANSTEYPE社員'
  },
  // ガール
  {
    id: '1205000003',
    name: '佐藤美咲',
    nameKana: 'サトウミサキ',
    station: '池袋駅',
    weekdayRate: 15000,
    holidayRate: 18000,
    tel: '090-3456-7890',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  },
  {
    id: '1205000004',
    name: '鈴木愛',
    nameKana: 'スズキアイ',
    station: '品川駅',
    weekdayRate: 16000,
    holidayRate: 19000,
    tel: '090-4567-8901',
    role: 'ガール',
    company: 'ANSTEYPE社員'
  }
];

// Zustandストアの作成
export const useShiftStore = create<ShiftStoreState>()(
  devtools(
    (set, get) => {
      // 現在の年月を取得
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      return {
        // 初期状態
        currentYear,
        currentMonth,
        // 現在のログインユーザー（デモ用）
        currentUser: {
          id: 'user_001',
          name: '管理者 太郎',
          role: 'administrator'
        },
        staffMembers: staffMembers,
        shifts: [],
        staffRequests: {},
        isLoading: false,
        notifications: [
          // モック通知データ
          {
            id: 'notification-001',
            type: 'shift_submission' as const,
            message: 'Festal 4月分のシフトの提出',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1時間前
            read: false,
            shiftDetails: {
              storeName: 'Festal',
              storeId: 'store_001',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'new' as const,
              priority: 'medium' as const,
              staffCount: 23
            },
            actions: {
              primaryAction: {
                label: '確認',
                path: '/shifts/management'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/management?detail=true'
              }
            }
          },
          {
            id: 'notification-002',
            type: 'change_request' as const,
            message: 'Festal 4月分のシフトの変更依頼',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分前
            read: false,
            shiftDetails: {
              storeName: 'Festal',
              storeId: 'store_001',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'modification' as const,
              priority: 'high' as const,
              staffCount: 3,
              changeCount: 5,
              relatedShiftId: 'Festal-20250110-143000' // 関連する変更依頼IDを追加
            },
            actions: {
              primaryAction: {
                label: '承認',
                path: '/shifts/change-requests'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/change-requests?detail=true'
              }
            }
          },
          {
            id: 'notification-005',
            type: 'change_request' as const,
            message: 'エイティーン 4月分のシフトの変更依頼',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分前
            read: false,
            shiftDetails: {
              storeName: 'エイティーン',
              storeId: 'store_002',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'modification' as const,
              priority: 'urgent' as const,
              staffCount: 2,
              changeCount: 3,
              relatedShiftId: 'エイティーン-20250110-140500' // 関連する変更依頼IDを追加
            },
            actions: {
              primaryAction: {
                label: '緊急承認',
                path: '/shifts/change-requests'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/change-requests?detail=true'
              }
            }
          },
          {
            id: 'notification-003',
            type: 'shift_submission' as const,
            message: 'エイティーン 4月分のシフトの提出',
            timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10分前
            read: false,
            shiftDetails: {
              storeName: 'エイティーン',
              storeId: 'store_002',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'new' as const,
              priority: 'medium' as const,
              staffCount: 15
            },
            actions: {
              primaryAction: {
                label: '確認',
                path: '/shifts/management'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/management?detail=true'
              }
            }
          },
          // 未承認（全員保留中）のシフト変更依頼
          {
            id: 'notification-006',
            type: 'change_request' as const,
            message: 'カフェドリーム 4月分のシフトの変更依頼',
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45分前
            read: false,
            shiftDetails: {
              storeName: 'カフェドリーム',
              storeId: 'store_003',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'modification' as const,
              priority: 'medium' as const,
              staffCount: 4,
              changeCount: 6,
              relatedShiftId: 'エイティーン-20250110-120000'
            },
            actions: {
              primaryAction: {
                label: '承認',
                path: '/shifts/change-requests'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/change-requests?detail=true'
              }
            }
          },
          // 承認済み（全員承認）のシフト変更依頼
          {
            id: 'notification-007',
            type: 'change_request' as const,
            message: 'ベーカリー工房 4月分のシフトの変更依頼',
            timestamp: new Date(Date.now() - 1000 * 60 * 90), // 90分前
            read: false,
            shiftDetails: {
              storeName: 'ベーカリー工房',
              storeId: 'store_004',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'modification' as const,
              priority: 'low' as const,
              staffCount: 2,
              changeCount: 3,
              relatedShiftId: 'Festal-20250110-100000'
            },
            actions: {
              primaryAction: {
                label: '確認',
                path: '/shifts/change-requests'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/change-requests?detail=true'
              }
            }
          },
          // 却下済み（全員却下）のシフト変更依頼
          {
            id: 'notification-008',
            type: 'change_request' as const,
            message: 'レストラン華 4月分のシフトの変更依頼',
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2時間前
            read: false,
            shiftDetails: {
              storeName: 'レストラン華',
              storeId: 'store_005',
              targetYear: 2025,
              targetMonth: 4,
              submissionType: 'modification' as const,
              priority: 'low' as const,
              staffCount: 3,
              changeCount: 4,
              relatedShiftId: 'エイティーン-20250110-080000'
            },
            actions: {
              primaryAction: {
                label: '確認',
                path: '/shifts/change-requests'
              },
              secondaryAction: {
                label: '詳細',
                path: '/shifts/change-requests?detail=true'
              }
            }
          }
        ],
        changeRequests: [
          // モック変更依頼データ
          {
            id: 'Festal-20250110-143000',
            targetYear: 2025,
            targetMonth: 4,
            reason: 'イベント会場の変更により人員調整が必要',
            status: 'pending' as const,
            companyName: 'Festal',
            submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            staffChanges: [
              {
                staffId: '1205000001',
                staffName: '田中太郎',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月15日',
                    oldValue: '○',
                    newValue: '×'
                  },
                  {
                    field: 'request' as const,
                    oldValue: '15',
                    newValue: '18'
                  }
                ]
              },
              {
                staffId: '1205000002',
                staffName: '佐藤花子',
                status: 'approved' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '6',
                    newValue: '8'
                  }
                ]
              },
              {
                staffId: '1205000003',
                staffName: '山田次郎',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月10日',
                    oldValue: '×',
                    newValue: '○'
                  },
                  {
                    field: 'request' as const,
                    oldValue: '10',
                    newValue: '12'
                  }
                ]
              }
            ]
          },
          {
            id: 'エイティーン-20250110-140500',
            targetYear: 2025,
            targetMonth: 4,
            reason: '急な体調不良により出勤調整が必要',
            status: 'pending' as const,
            companyName: 'エイティーン',
            submittedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            staffChanges: [
              {
                staffId: '1205000004',
                staffName: '鈴木愛',
                status: 'approved' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2分前
                approvedBy: {
                  userId: 'user_002',
                  userName: '承認者 花子',
                  userRole: 'manager'
                },
                comment: '承認いたします',
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月12日',
                    oldValue: '○',
                    newValue: '×'
                  }
                ]
              },
              {
                staffId: '1205000005',
                staffName: '高橋健',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月12日',
                    oldValue: '×',
                    newValue: '○'
                  },
                  {
                    field: 'request' as const,
                    oldValue: '8',
                    newValue: '10'
                  }
                ]
              }
            ]
          },
          // 未承認（全員保留中）の変更依頼
          {
            id: 'エイティーン-20250110-120000',
            targetYear: 2025,
            targetMonth: 4,
            reason: '新商品の販売準備により人員配置を見直したい',
            status: 'pending' as const,
            companyName: 'カフェドリーム',
            submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            staffChanges: [
              {
                staffId: '1205000006',
                staffName: '中村美咲',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月20日',
                    oldValue: '×',
                    newValue: '○'
                  }
                ]
              },
              {
                staffId: '1205000007',
                staffName: '小林和也',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '12',
                    newValue: '16'
                  }
                ]
              },
              {
                staffId: '1205000008',
                staffName: '松田智子',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月22日',
                    oldValue: '○',
                    newValue: '×'
                  }
                ]
              },
              {
                staffId: '1205000009',
                staffName: '木村大輔',
                status: 'pending' as const,
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '8',
                    newValue: '12'
                  }
                ]
              }
            ]
          },
          // 承認済み（全員承認）の変更依頼
          {
            id: 'Festal-20250110-100000',
            targetYear: 2025,
            targetMonth: 4,
            reason: '従業員の家庭事情による勤務時間調整',
            status: 'approved' as const,
            companyName: 'ベーカリー工房',
            submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            staffChanges: [
              {
                staffId: '1205000010',
                staffName: '井上雅美',
                status: 'approved' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
                approvedBy: {
                  userId: 'user_003',
                  userName: '店長 田中',
                  userRole: 'store_manager'
                },
                comment: '承認いたします',
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '6',
                    newValue: '4'
                  }
                ]
              },
              {
                staffId: '1205000011',
                staffName: '渡辺健一',
                status: 'approved' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
                approvedBy: {
                  userId: 'user_003',
                  userName: '店長 田中',
                  userRole: 'store_manager'
                },
                comment: '了解しました',
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月25日',
                    oldValue: '×',
                    newValue: '○'
                  }
                ]
              }
            ]
          },
          // 却下済み（全員却下）の変更依頼
          {
            id: 'エイティーン-20250110-080000',
            targetYear: 2025,
            targetMonth: 4,
            reason: 'イベント対応のための緊急シフト変更',
            status: 'rejected' as const,
            companyName: 'レストラン華',
            submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            staffChanges: [
              {
                staffId: '1205000012',
                staffName: '加藤純子',
                status: 'rejected' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
                approvedBy: {
                  userId: 'user_004',
                  userName: 'エリアマネージャー 佐藤',
                  userRole: 'area_manager'
                },
                comment: '人員不足のため対応困難',
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '4',
                    newValue: '8'
                  }
                ]
              },
              {
                staffId: '1205000013',
                staffName: '原田光男',
                status: 'rejected' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
                approvedBy: {
                  userId: 'user_004',
                  userName: 'エリアマネージャー 佐藤',
                  userRole: 'area_manager'
                },
                comment: '既存シフトとの調整が困難',
                changes: [
                  {
                    field: 'status' as const,
                    date: '4月28日',
                    oldValue: '×',
                    newValue: '○'
                  }
                ]
              },
              {
                staffId: '1205000014',
                staffName: '福田明美',
                status: 'rejected' as const,
                approvedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                approvedBy: {
                  userId: 'user_004',
                  userName: 'エリアマネージャー 佐藤',
                  userRole: 'area_manager'
                },
                comment: '労働時間上限に抵触',
                changes: [
                  {
                    field: 'request' as const,
                    oldValue: '10',
                    newValue: '14'
                  }
                ]
              }
            ]
          }
        ],
        notificationFilter: 'all' as NotificationFilter,
        
        // 初期コメントデータ
        comments: [
          {
            id: 'comment_001',
            content: '人員配置について確認が必要です。特に田中太郎さんの勤務時間について検討中です。',
            author: {
              userId: 'user_001',
              userName: '管理者 太郎',
              userRole: 'administrator'
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            targetType: 'change_request' as const,
            targetId: 'Festal-20250110-143000'
          },
          {
            id: 'comment_002',
            content: '承認いたします。勤務時間の調整は適切と判断します。',
            author: {
              userId: 'user_002',
              userName: '承認者 花子',
              userRole: 'manager'
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            targetType: 'staff_change' as const,
            targetId: '1205000002'
          },
          {
            id: 'comment_003',
            content: '店舗の運営状況を考慮し、承認可能です。',
            author: {
              userId: 'user_003',
              userName: '店長 田中',
              userRole: 'store_manager'
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            targetType: 'change_request' as const,
            targetId: 'Festal-20250110-100000'
          }
        ],
        
        autoSyncEnabled: false,
        lastSyncTime: null,



        // アクション
        setStaffMembers: (members) =>
          set({ staffMembers: members }, false, 'setStaffMembers'),

        setShifts: (shifts) =>
          set({ shifts }, false, 'setShifts'),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),

        setCurrentDate: (year, month) =>
          set({ currentYear: year, currentMonth: month }, false, 'setCurrentDate'),

        getShifts: (year, month) => {
          const { shifts } = get();
          // 指定された年月のシフトをフィルタリング
          const yearMonthString = `${year}-${month.toString().padStart(2, '0')}`;
          return shifts.filter(shift => shift.date.startsWith(yearMonthString));
        },

        getStaffRequests: (year, month) => {
          const { staffRequests, staffMembers } = get();
          const yearMonthKey = `${year}-${month.toString().padStart(2, '0')}`;
          
          // 既存のリクエストがある場合はそれを返す
          if (staffRequests[yearMonthKey]) {
            return staffRequests[yearMonthKey];
          }
          
          // 存在しない場合は、スタッフメンバーをベースにした初期データを作成
          const initialRequests: StaffRequest[] = staffMembers.map(staff => ({
            id: staff.id,
            totalRequest: 0,
            weekendRequest: 0,
            company: staff.company || '',
            requestText: ''
          }));
          
          return initialRequests;
        },

        updateStaffRequests: (year, month, requests) => {
          const yearMonthKey = `${year}-${month.toString().padStart(2, '0')}`;
          set(
            (state) => ({
              staffRequests: {
                ...state.staffRequests,
                [yearMonthKey]: requests
              }
            }),
            false,
            'updateStaffRequests'
          );
        },

        addNotification: (notification) =>
          set(
            (state) => ({
              notifications: [
                {
                  ...notification,
                  id: `notification-${Date.now()}`,
                  timestamp: new Date(),
                  read: false,
                },
                ...state.notifications,
              ],
            }),
            false,
            'addNotification'
          ),

        markNotificationAsRead: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            }),
            false,
            'markNotificationAsRead'
          ),

        clearAllNotifications: () =>
          set({ notifications: [] }, false, 'clearAllNotifications'),

        getUnreadCount: () => {
          const { notifications } = get();
          return notifications.filter(n => !n.read).length;
        },

        getFilteredNotifications: () => {
          const { notifications, notificationFilter } = get();
          
          let filtered = notifications;
          
          switch (notificationFilter) {
            case 'unread':
              filtered = notifications.filter(n => !n.read);
              break;
            case 'submission':
              filtered = notifications.filter(n => n.type === 'shift_submission');
              break;
            case 'change':
              filtered = notifications.filter(n => n.type === 'change_request');
              break;
            case 'pending':
              // 承認待ち通知は変更依頼のうち承認待ちがあるもの
              filtered = notifications.filter(n => {
                if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
                  const status = get().getChangeRequestStatus(n.shiftDetails.relatedShiftId);
                  return status === 'pending';
                }
                return false;
              });
              break;
            case 'approved':
              // 回答済み通知は変更依頼のうち全て回答されたもの
              filtered = notifications.filter(n => {
                if (n.type === 'change_request' && n.shiftDetails.relatedShiftId) {
                  const status = get().getChangeRequestStatus(n.shiftDetails.relatedShiftId);
                  return status === 'completed';
                }
                return false;
              });
              break;
            default:
              // 'all' の場合はフィルタリングしない
              break;
          }
          
          // 未読が上位、同じ読取状態内では新しい順
          return filtered.sort((a, b) => {
            if (a.read !== b.read) {
              return a.read ? 1 : -1; // 未読が上位
            }
            return b.timestamp.getTime() - a.timestamp.getTime(); // 新しい順
          });
        },

        setNotificationFilter: (filter) =>
          set({ notificationFilter: filter }, false, 'setNotificationFilter'),

        addChangeRequest: (request) =>
          set(
            (state) => ({
              changeRequests: [request, ...state.changeRequests]
            }),
            false,
            'addChangeRequest'
          ),

        updateStaffChangeStatus: (requestId, staffId, status) =>
          set(
            (state) => ({
              changeRequests: state.changeRequests.map(request => {
                if (request.id === requestId) {
                  const updatedStaffChanges = request.staffChanges.map(staffChange => {
                    if (staffChange.staffId === staffId) {
                      return {
                        ...staffChange,
                        status,
                        approvedAt: (status === 'approved' || status === 'rejected') ? new Date().toISOString() : undefined,
                        approvedBy: (status === 'approved' || status === 'rejected') ? {
                          userId: state.currentUser.id,
                          userName: state.currentUser.name,
                          userRole: state.currentUser.role
                        } : undefined
                      };
                    }
                    return staffChange;
                  });
                  
                  // 全体ステータスを更新
                  const pendingCount = updatedStaffChanges.filter(sc => sc.status === 'pending').length;
                  const approvedCount = updatedStaffChanges.filter(sc => sc.status === 'approved').length;
                  const rejectedCount = updatedStaffChanges.filter(sc => sc.status === 'rejected').length;
                  
                  let overallStatus: 'pending' | 'approved' | 'rejected' | 'mixed';
                  if (pendingCount === updatedStaffChanges.length) {
                    overallStatus = 'pending';
                  } else if (approvedCount === updatedStaffChanges.length) {
                    overallStatus = 'approved';
                  } else if (rejectedCount === updatedStaffChanges.length) {
                    overallStatus = 'rejected';
                  } else {
                    overallStatus = 'mixed';
                  }
                  
                  return {
                    ...request,
                    staffChanges: updatedStaffChanges,
                    status: overallStatus,
                    approverComment: request.approverComment
                  };
                }
                return request;
              })
            }),
            false,
            'updateStaffChangeStatus'
          ),

        bulkApproveChangeRequest: (requestId) => {
          const { updateStaffChangeStatus, changeRequests } = get();
          const request = changeRequests.find(r => r.id === requestId);
          
          if (request) {
            // pending状態のスタッフのみを一括承認
            const pendingStaff = request.staffChanges.filter(sc => sc.status === 'pending');
            pendingStaff.forEach(staffChange => {
              updateStaffChangeStatus(requestId, staffChange.staffId, 'approved');
            });
          }
        },

        bulkRejectChangeRequest: (requestId) => {
          const { updateStaffChangeStatus, changeRequests } = get();
          const request = changeRequests.find(r => r.id === requestId);
          
          if (request) {
            // pending状態のスタッフのみを一括却下
            const pendingStaff = request.staffChanges.filter(sc => sc.status === 'pending');
            pendingStaff.forEach(staffChange => {
              updateStaffChangeStatus(requestId, staffChange.staffId, 'rejected');
            });
          }
        },

        // コメント追加
        addComment: (content, targetType, targetId) => {
          const { currentUser } = get();
          const newComment: Comment = {
            id: `comment_${Date.now()}`,
            content,
            author: {
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role
            },
            timestamp: new Date().toISOString(),
            targetType,
            targetId
          };
          
          set(
            (state) => ({
              comments: [...state.comments, newComment]
            }),
            false,
            'addComment'
          );
        },

        // コメント編集
        editComment: (commentId, content) => {
          set(
            (state) => ({
              comments: state.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, content, editedAt: new Date().toISOString() }
                  : comment
              )
            }),
            false,
            'editComment'
          );
        },

        // コメント削除
        deleteComment: (commentId) => {
          set(
            (state) => ({
              comments: state.comments.filter(comment => comment.id !== commentId)
            }),
            false,
            'deleteComment'
          );
        },

        // コメント取得
        getComments: (targetType, targetId) => {
          const { comments } = get();
          return comments
            .filter(comment => comment.targetType === targetType && comment.targetId === targetId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        },

        syncFromAnsteype: async () => {
          const { setLoading } = get();
          
          try {
            setLoading(true);
            
            // ダミーの同期処理（実際のAPI呼び出しに置き換える）
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // 最終同期時刻を更新
            set({ lastSyncTime: new Date() }, false, 'updateLastSyncTime');
            
            console.log('Ansteype sync completed with existing notifications');
          } catch (error) {
            console.error('Ansteype sync error:', error);
          } finally {
            setLoading(false);
          }
        },

        startAutoSync: () => {
          set({ autoSyncEnabled: true }, false, 'startAutoSync');
          console.log('Auto sync started');
        },

        stopAutoSync: () => {
          set({ autoSyncEnabled: false }, false, 'stopAutoSync');
          console.log('Auto sync stopped');
        },

        // 変更依頼のステータスを取得
        getChangeRequestStatus: (requestId: string) => {
          const { changeRequests } = get();
          const request = changeRequests.find(r => r.id === requestId);
          
          if (!request) return 'pending';
          
          const staffChanges = request.staffChanges;
          const pendingCount = staffChanges.filter(sc => sc.status === 'pending').length;
          
          // 一件でも承認待ちがあれば「承認待ち」、全て回答済みなら「回答済み」
          if (pendingCount > 0) {
            return 'pending'; // 承認待ち
          } else {
            return 'completed'; // 回答済み（全て承認または却下済み）
          }
        },

        // 変更依頼のサマリーを取得
        getChangeRequestSummary: (requestId: string) => {
          const { changeRequests } = get();
          const request = changeRequests.find(r => r.id === requestId);
          
          if (!request) return { pending: 0, approved: 0, rejected: 0, total: 0 };
          
          const staffChanges = request.staffChanges;
          const approved = staffChanges.filter(sc => sc.status === 'approved').length;
          const rejected = staffChanges.filter(sc => sc.status === 'rejected').length;
          const pending = staffChanges.filter(sc => sc.status === 'pending').length;
          const total = staffChanges.length;
          
          return { pending, approved, rejected, total };
        },

        // 変更依頼のスタッフ名を取得
        getChangeRequestStaffNames: (requestId: string) => {
          const { changeRequests } = get();
          const request = changeRequests.find(r => r.id === requestId);
          
          if (!request) return { approved: [], rejected: [], pending: [] };
          
          const staffChanges = request.staffChanges;
          const approved = staffChanges
            .filter(sc => sc.status === 'approved')
            .map(sc => ({
              staffName: sc.staffName,
              approvedBy: sc.approvedBy?.userName
            }));
          const rejected = staffChanges
            .filter(sc => sc.status === 'rejected')
            .map(sc => ({
              staffName: sc.staffName,
              approvedBy: sc.approvedBy?.userName
            }));
          const pending = staffChanges
            .filter(sc => sc.status === 'pending')
            .map(sc => sc.staffName);
          
          return { approved, rejected, pending };
        },
      };
    },
    {
      name: 'shift-store', // devtools用の名前
    }
  )
); 