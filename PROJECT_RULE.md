# PROJECT RULE

## 📐 Requirements（機能・非機能要件）

### 機能要件
- 見積管理システム（案件作成、送付先設定、プレビュー、送付完了）
- 案件管理システム（sales画面での案件一覧・詳細管理）
- シフト管理システム（スプレッドシート形式での稼働管理）
- 会計管理システム（プロジェクト・見積の会計処理）

### 非機能要件
- レスポンシブデザイン（デスクトップファースト）
- 直感的なUI/UX
- リアルタイム更新対応
- データの整合性保持

## 🏗️ Tech Stack（言語／FW／DB／インフラ）

### フロントエンド
- **Framework**: Next.js 13.5.6
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: Material-UI sx prop, CSS-in-JS

### バックエンド
- **Runtime**: Node.js
- **API**: Next.js API Routes

### 開発環境
- **Package Manager**: npm
- **Dev Server**: Next.js dev server (port 3000)
- **Linting**: ESLint, TypeScript

## 🎨 Design System（カラースケール・アイコン統一ルール）

### カラーパレット

#### ステータス系カラー
- **起票**: `#e3f2fd` (背景) / `#1976d2` (テキスト) - ブルー系
- **進行中・連絡前**: `#f5f5f5` (背景) / `#666666` (テキスト) - グレー系
- **完了・連絡済**: `#e8f5e9` (背景) / `#2e7d32` (テキスト) - グリーン系
- **注意・連絡不要**: `#fff3e0` (背景) / `#ef6c00` (テキスト) - オレンジ系
- **エラー・お断り**: `#ffebee` (背景) / `#d32f2f` (テキスト) - レッド系

#### 役割系カラー
- **クローザー**: `#1976d2` (プライマリブルー) / `#2196f3` (セカンダリブルー)
- **ガール**: `#e91e63` (ピンク) / `#f50057` (セカンダリピンク)
- **無料入店**: `#4caf50` (グリーン)

#### 代理店系カラー
- **ピーアップ**: `#e0f2f1` (背景) / `#00796b` (テキスト) - ティール系
- **ラネット**: `#f3e5f5` (背景) / `#7b1fa2` (テキスト) - パープル系
- **CS**: `#e8f5e9` (背景) / `#2e7d32` (テキスト) - グリーン系

#### 機能系カラー
- **場所取り**: `#1976d2` (プライマリブルー)
- **外現場**: `#4caf50` (グリーン)
- **出張**: `#ff9800` (オレンジ)

### アイコン統一ルール

#### 人物・役割系アイコン
- **クローザー**: `PersonIcon` - 人物アイコン
- **ガール**: `WomanIcon` - 女性アイコン（カード表示）/ `FaceIcon` - 顔アイコン（テーブル表示）
- **無料入店**: `GroupIcon` - グループアイコン（カード表示）/ `SchoolIcon` - 学校アイコン（テーブル表示）

#### 場所・移動系アイコン
- **場所取り**: `LocationOnIcon` - 位置アイコン
- **外現場**: `TerrainIcon` - 地形アイコン
- **出張**: `FlightIcon` - 飛行機アイコン

#### アクション系アイコン
- **編集**: `EditIcon` - 編集アイコン
- **保存**: `SaveIcon` / `CheckIcon` - 保存・チェックアイコン
- **削除**: `DeleteIcon` - 削除アイコン
- **追加**: `AddIcon` - 追加アイコン
- **閉じる**: `CloseIcon` - 閉じるアイコン

#### 表示切替系アイコン
- **サマリー表示**: `ViewModuleIcon` - モジュール表示アイコン
- **詳細表示**: `ViewListIcon` - リスト表示アイコン

### カラー適用ルール

1. **ステータス表示**: 必ずChipコンポーネントを使用し、上記ステータス系カラーを適用
2. **役割表示**: アイコンと組み合わせて役割系カラーを適用
   - カード表示: WomanIcon/GroupIcon + セカンダリカラー（#f50057/#4caf50）
   - テーブル表示: FaceIcon/SchoolIcon + プライマリカラー（#e91e63/#4caf50）
3. **代理店表示**: 背景色とテキスト色のセットで代理店系カラーを適用
4. **機能フラグ**: アイコンと組み合わせて機能系カラーを適用

### アイコンサイズ統一

- **小**: `fontSize="small"` - 一覧表示、インライン表示
- **中**: `fontSize="medium"` - ボタン、アクション
- **大**: `fontSize="large"` - ヘッダー、重要な表示

## 🚫 禁止事項

### カラー関連
- **カスタムカラーの無断使用禁止**: 上記パレット以外の色の使用は事前相談必須
- **カラーコードの直接記述禁止**: 必ず定数化またはテーマ変数を使用
- **コントラスト比違反禁止**: WCAG 2.2 AA基準（4.5:1以上）を遵守

### アイコン関連
- **Material-UI以外のアイコン使用禁止**: 統一性維持のため
- **同一機能での異なるアイコン使用禁止**: 機能ごとに統一されたアイコンを使用
- **アイコンサイズの任意指定禁止**: 上記統一ルールに従う

### UI関連
- **既存レイアウトの破壊的変更禁止**: 修正時は既存デザインとの整合性を保持
- **レスポンシブ対応の省略禁止**: 全ての新規コンポーネントはレスポンシブ対応必須
- **アクセシビリティ配慮の省略禁止**: aria-label、role等の適切な設定必須

## 📝 実装ガイドライン

### カラー実装例
```typescript
// ステータス色分け関数の例
const getStatusColor = (status: string) => {
  switch (status) {
    case '起票': return { bg: '#e3f2fd', text: '#1976d2' };
    case '代理店連絡前': return { bg: '#f5f5f5', text: '#666666' };
    case '代理店連絡済': return { bg: '#e8f5e9', text: '#2e7d32' };
    case '代理店連絡不要': return { bg: '#fff3e0', text: '#ef6c00' };
    case 'お断り': return { bg: '#ffebee', text: '#d32f2f' };
    default: return { bg: '#f5f5f5', text: '#666666' };
  }
};
```

### アイコン実装例
```typescript
// 役割アイコンの例（カード表示用）
const RoleIconCard = ({ role }: { role: string }) => {
  switch (role) {
    case 'closer': return <PersonIcon sx={{ color: '#1976d2', fontSize: '2rem' }} />;
    case 'girl': return <WomanIcon sx={{ color: '#f50057', fontSize: '2rem' }} />;
    case 'free': return <GroupIcon sx={{ color: '#4caf50', fontSize: '2rem' }} />;
    default: return null;
  }
};

// 役割アイコンの例（テーブル表示用）
const RoleIconTable = ({ role }: { role: string }) => {
  switch (role) {
    case 'closer': return <PersonIcon fontSize="small" color="primary" />;
    case 'girl': return <FaceIcon fontSize="small" color="secondary" />;
    case 'free': return <SchoolIcon fontSize="small" color="success" />;
    default: return null;
  }
};
```

## 🔄 更新履歴

- 2024/12/19: 初版作成 - カラースケール・アイコン統一ルール策定
- 2024/12/19: 実態調査に基づくルール修正 - アイコン・カラーの使い分け明確化 