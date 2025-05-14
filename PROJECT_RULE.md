📐 Requirements（機能・非機能要件）

### Functional Requirements

1. シフト管理 UI
   * 火曜日始まりの週次カレンダーを表示（0W–5W 変動）
   * スタッフをドラッグ＆ドロップで日付セルへ割り当て
   * 各セルの右クリックコンテキストメニュー：
     * 編集履歴
     * セル色変更（カラーピッカー、デフォルトリセット）
   * Shift+Enter でメモを登録・更新
   * 欠勤／TM／選択中などのステータスタイルを表示
   * 他月日のセルはグレー表示
2. フィルタリング & ソート
   * 組織複数選択（「すべて」は排他）
   * ステータスラジオ（遠方／出張NG／指定なし）
3. ダッシュボード
   * Year / Month / Week セレクタは動的リストを生成
   * Weekly Summary で各週の充足率を表示
4. レスポンシブ対応
   * デスクトップファースト。タブレット・モバイルも最適化
5. アクセシビリティ
   * WCAG 2.2 AA、色コントラスト ≥ 4.5:1

### Non-Functional Requirements

1. パフォーマンス：ページ LCP <2.5s（デスクトップ Chrome 80th percentile）
2. 安定性：TypeScript strict モード、実行時エラー 0 を維持
3. 可観測性：Sentry でフロントエンドエラーを収集
4. セキュリティ：OWASP Top10 に対する静的解析（CodeQL）
5. CI/CD：プルリク毎に Lint → Test → Build → Preview Deploy（Vercel）
6. バックアップ：`backup/` へ日次 `git bundle`、7 世代保持

---

🏗️ Tech Stack（言語／FW／DB／インフラ）

| Layer | Technology | Version | 備考 |
|-------|------------|---------|------|
| Frontend | Next.js (React 18, TypeScript) | ^14.x | App Router & Server Actions 未使用（Pages Router） |
| UI Library | MUI (Material-UI) | ^5.x | Theme カスタマイズ・design-token.json で集中管理 |
| Drag & Drop | @dnd-kit/core | ^6.x | AssignmentTable と StaffList で使用 |
| State Mgmt | React Context / useReducer | – | recoil 等は未採用 |
| Testing | Jest + React Testing Library | ^29.x | unit / integration |
| E2E | Playwright | ^1.x | GitHub Actions matrix |
| Lint | ESLint, Prettier, Stylelint | – | CI で `--max-warnings 0` |
| Type Check | TypeScript `--strict` | – | `tsc --noEmit` |
| Backend (optional) | Next.js API Routes | Node 18 LTS | 追加 API が必要な場合 |
| DB (optional) | SQLite (development) → PostgreSQL (production) | 15 | Prisma ORM を想定 |
| Hosting | Vercel | – | Preview Deploy & PR コメント |
| Monitoring | Sentry | – | Frontend error tracking |
| CI | GitHub Actions | – | Lint → Test → Build |

---

🚫 禁止事項

1. 破壊的変更（既存 UI/API の互換性を損なう行為）
2. 型安全性を無視した `any` の使用
3. グローバル CSS の追加（CSS Modules または styled API を使用）
4. deprecated ライブラリ（moment.js など）の導入
5. バージョン固定なしでのパッケージ追加（lockfile 必須）
6. ISSUE / PR を介さない `main` への直接 push
7. Lint Error / Test Failure を無視したマージ 

---

📋 決定済み画面仕様

### SalesTable コンポーネント

1. 基本レイアウト
   * 行：案件データ（編集可能）
   * 列：担当者、更新者、ステータス、代理店、曜日別スケジュール（火〜月）、曜日区分、帯案件、詳細情報
   * テーブルヘッダー：各カラムのラベル表示

2. 曜日表示
   * 火曜日始まり（火、水、木、金、土、日、月）の週次カレンダー
   * 各日付列に曜日と日付を表示
   * 土曜日（5日目）は青色、日曜日（6日目）は赤色で背景とテキスト色を強調表示

3. ステータスと代理店表示
   * ステータス列：背景色付きチップで表示
     * 代理店連絡前：グレー背景（#f5f5f5）、グレーテキスト（#666666）
     * 代理店調整中：オレンジ系背景（#fff3e0）、オレンジテキスト（#ef6c00）
     * 確定：緑系背景（#e8f5e9）、緑テキスト（#2e7d32）
   * 代理店列：背景色付きテキストで表示
     * ピーアップ：ティール系背景（#e0f2f1）、ティールテキスト（#00796b）
     * ラネット：紫系背景（#f3e5f5）、紫テキスト（#7b1fa2）
     * CS：緑系背景（#e8f5e9）、緑テキスト（#2e7d32）

4. インタラクション機能
   * 担当者/ステータス/代理店列をクリックするとドロップダウンメニュー表示
   * ドロップダウンメニューからの選択で値を変更可能
   * 編集ボタンクリックで行全体を編集モードに切り替え
   * 削除ボタンで行を削除

5. 詳細情報表示
   * 概要表示モード（summary）：コンパクトな情報表示
   * 詳細表示モード（detail）：場所情報、セールス詳細、メモを表示
   * 場所情報：場所名、担当MG、電話番号、開催店舗、連名店舗、各種フラグ（場所取りあり、外現場、出張あり）
   * セールス詳細：クローザー・ガールの人数、単価、交通費、合計金額
   * メモ：自由記述テキスト

6. UI詳細仕様
   * 行ホバー時にアクションボタン（編集/削除）を表示
   * ReactDOMポータルを使用したカスタムドロップダウンメニュー
   * 複数日程のチェックマーク表示
   * 帯案件の稼働数表示
   * 計算された合計金額の自動表示
   * サマリー表示／詳細表示の列幅・X座標を完全一致させる（場所列300px、クローザー160px、ガール+無料200px ほか共通）
   * サマリー表示の詳細列は以下コンテンツを表示し順序・横位置を固定
     1) 場所名（省略記号付きMax240px）
     2) フラグアイコン（場所取り・外現場・出張） ※ラベルは非表示
     3) クローザー人数
     4) ガール人数
     5) 無料入店人数
   * フラグはアイコンのみで gap=0.5、要素ブロック gap=2 で統一
   * サマリー行でも担当者／更新者／ステータス／代理店／曜日列は詳細行と同一のインライン編集・ドロップダウン仕様
   * **編集／新規追加操作時はポップアップダイアログで入力**
     * トリガー：行の Edit アイコン、またはテーブル下部「新規追加」ボタン
     * ダイアログタイトル：`案件編集`（編集時） / `新規追加`（新規時）
     * 入力項目一覧
       | フィールド | UI コントロール | 必須 | 備考 |
       |-----------|-----------------|------|------|
       | 担当者 | Select | ✔ | 担当者マスタから選択 |
       | 代理店 | Select | ✔ | ピーアップ / ラネット / CS |
       | ステータス | Select | ✔ | 代理店連絡前 / 調整中 / 確定 |
       | 曜日区分 | Radio（平日/週末） | ✔ | – |
       | スケジュール（火〜月） | Checkbox ×7 | ✔ | 稼働日にチェック |
       | 帯案件 | Checkbox | – | ON で自動的にスケジュール全選択 |
       | 帯稼働数 | NumberField | 帯案件ON時必須 | 0–99 |
       | 場所名 | TextField | ✔ | 30 文字まで |
       | 場所取り | Checkbox | – | – |
       | 外現場 | Checkbox | – | – |
       | 出張 | Checkbox | – | – |
       | 担当 MG | TextField | – | 20 文字まで |
       | 電話番号 | TextField | – | ハイフンなし 11 桁 |
       | 開催店舗 | Select | – | 大宮 / 浦和 / 川越 / 所沢 |
       | 連名店舗 | MultiSelect | – | 同上複数可 |
       | 人数（クローザー） | NumberField | ✔ | 0–20 |
       | 人数（ガール） | NumberField | ✔ | 0–20 |
       | 人数（トレーナー） | NumberField | – | 0–20 |
       | 人数（無料入店） | NumberField | – | 0–20 |
       | メモ | Multiline TextField | – | 500 文字まで |
     * バリデーション：必須項目チェック、数値は 0 以上、電話番号フォーマット等
     * ボタン：`キャンセル` / `保存`（保存時にバリデーション→閉じてテーブル更新） 