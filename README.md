# ANSTEYPE - 携帯販売営業管理システム

携帯販売代理店の営業活動と実績管理をサポートするWebアプリケーションです。

## 主な機能

### 販売管理機能
- 週次キャパシティ管理
- 販売実績の記録・管理
- 詳細/サマリービューの切り替え
- 帯案件の管理

## 技術スタック

- **フロントエンド**
  - Next.js 14.1.0
  - React 18.2.0
  - TypeScript
  - Material-UI (MUI)

## 開発環境のセットアップ

1. リポジトリのクローン:
```bash
git clone https://github.com/Festal-KM/ANSTEYPE.git
cd ANSTEYPE
```

2. 依存関係のインストール:
```bash
npm install
```

3. 開発サーバーの起動:
```bash
npm run dev
```

4. ブラウザで開く:
```
http://localhost:3004
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動（ポート3004）
- `npm run build` - プロダクションビルドを作成
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - コードの静的解析を実行

## プロジェクト構造

```
ANSTEYPE/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── sales/
│   │       └── page.tsx
│   └── components/
│       ├── Header.tsx
│       └── SalesTable.tsx
├── public/
├── package.json
└── tsconfig.json
```

## 機能詳細

### 販売管理機能
- **週次キャパシティ管理**
  - 週ごとのCloser、Girl、最大キャパシティの設定
  - キャパシティの可視化と管理

- **販売実績管理**
  - 年月選択による期間指定
  - 週次の実績データの記録
  - 詳細ビューとサマリービューの切り替え

- **帯案件管理**
  - 帯案件の登録と管理
  - ステータス管理と進捗追跡

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
