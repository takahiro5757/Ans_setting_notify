## 1. 要件定義書（抜粋・差分なし）

| 項目       | 内容                                                 |
| -------- | -------------------------------------------------- |
| フロントエンド  | **Next.js 13（App Router）+ React 18 + TailwindCSS** |
| 主要 UI    | Kanban ボード（案件カード仕様は前回提示のとおり）                       |
| インタラクション | クリックでモーダル、ホバーでカード強調。ドラッグ＆ドロップは未使用。                 |

> それ以外の業務要件・非機能要件・KPI は Angular 版と同一のため割愛。

---

## 2. 基本設計書（差分のみ）

### 2.1 全体構成

| 層        | 技術                                                         | 役割                  |
| -------- | ---------------------------------------------------------- | ------------------- |
| **フロント** | Next.js 13 (App Router) / React 18 / TypeScript / Tailwind | SPA & SSR・UX・JWT 保持 |
| API      | FastAPI                                                    | ルーティング・認証・業務ロジック    |
| DB       | PostgreSQL                                                 | 永続化                 |

### 2.2 フロントエンド・ディレクトリ構成

```
src/
├─ app/                    # App Router ルート
│  ├─ layout.tsx          # 共通レイアウト
│  └─ page.tsx            # デフォルト ⇒ /kanban にリダイレクト
├─ kanban/                # Kanban モジュール
│  ├─ page.tsx            # K001 画面
│  └─ components/
│     └─ ProjectCard.tsx  # カード
├─ projects/              # API 操作用 Hooks
│  └─ useProjects.ts
├─ lib/
│  ├─ api-client.ts       # fetch ラッパー (JWT 添付)
│  └─ icons.tsx           # Lucide など共通アイコン
└─ styles/
   └─ globals.css         # Tailwind base
```

> Vite ではなく **Next.js のビルトイン** を使用。
> 静的最適化が不要なページ（Kanban 等）はすべて CSR / RSC。

---

## 3. 詳細設計書（Next.js 版）

### 3.1 ProjectCard コンポーネント

```
/kanban/components/ProjectCard.tsx
```

```tsx
'use client';
import { FC } from 'react';
import clsx from 'clsx';
import { PinIcon, CloserIcon, GirlIcon, RookieIcon } from '@/lib/icons';

export type ProjectCardDTO = {
  id: number;
  mainStore: string;
  subStores: string[];
  eventDate: string;   // ISO
  venue: string;
  closer: number;
  girl: number;
  free: number;
  placeReserved: boolean;
};

type Props = {
  dto: ProjectCardDTO;
  onOpen: (id: number) => void;
};

export const ProjectCard: FC<Props> = ({ dto, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={`${dto.eventDate} ${dto.mainStore} ${dto.venue} クローザー${dto.closer}名 ガール${dto.girl}名 新人${dto.free}名 場所取り${dto.placeReserved ? 'あり' : 'なし'}`}
    onClick={() => onOpen(dto.id)}
    className={clsx(
      'relative w-[280px] rounded-lg bg-white p-3 shadow-sm',
      'hover:shadow-md hover:scale-[1.02] transition'
    )}
  >
    {/* 場所取りアイコン */}
    {dto.placeReserved && (
      <PinIcon className="absolute right-1 top-1 h-4 w-4 text-green-500" aria-hidden />
    )}

    {/* 店舗 Pill 群 */}
    <div className="flex flex-wrap gap-1">
      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
        {dto.mainStore}
      </span>
      {dto.subStores.map((s) => (
        <span
          key={s}
          className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-700"
        >
          {s}
        </span>
      ))}
    </div>

    {/* 日付 */}
    <p className="mt-1 text-xs text-gray-600">{dto.eventDate}</p>

    {/* 開催場所 */}
    <p className="truncate text-sm font-semibold">{dto.venue}</p>

    {/* オーダー内訳 */}
    <div className="mt-1 flex gap-2 text-[13px]">
      <span className="flex items-center gap-0.5">
        <CloserIcon className="h-4 w-4 text-blue-500" aria-hidden />
        {dto.closer}名
      </span>
      <span className="flex items-center gap-0.5">
        <GirlIcon className="h-4 w-4 text-pink-500" aria-hidden />
        {dto.girl}名
      </span>
      <span className="flex items-center gap-0.5">
        <RookieIcon className="h-4 w-4 text-yellow-500" aria-hidden />
        {dto.free}名
      </span>
    </div>
  </div>
);
```

> **icons.tsx** に Lucide/Iconify などをラップしてエクスポート。
> `bg-primary` は Tailwind カスタム色を `tailwind.config.js` に定義。

### 3.2 Kanban ページ (`/kanban/page.tsx`)

* **データ取得**: React Query or `useSWR` で `GET /projects?status=` → カラム別にグルーピング
* **フィルタ**: `useSearchParams()` で `agency=xxx` を URL に反映
* **ステータス変更**: カードモーダル内で `<select>` → `PATCH /projects/{id}/status`

### 3.3 API クライアント（lib/api-client.ts）

```ts
export const api = async <T>(url: string, opts: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('jwt');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${url}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
```

---

## 4. セキュリティ & パフォーマンス（フロント差分のみ）

| 項目         | Next.js での実装指針                                              |
| ---------- | ----------------------------------------------------------- |
| JWT 保持     | `httpOnly` Cookie 推奨（App Router でサーバーアクション）                 |
| SSR 範囲     | ログインページなど静的で済む画面のみ `generateStaticParams`; Kanban は CSR/RSC |
| Bundle 最適化 | Dynamic Import + Suspense、`next/font` でアイコン subset          |

---

## 5. テスト

| レイヤー       | ツール                                                                    |
| ---------- | ---------------------------------------------------------------------- |
| 単体 (React) | **@testing-library/react** + Vitest                                    |
| E2E        | **Playwright** (`npx playwright codegen http://localhost:3000/kanban`) |

---

### まとめ & 次アクション

* **Next.js 化した設計**は以上です。バックエンド・データベース設計は変更不要。
* この内容で問題なければ **OpenAPI クライアント生成 (`openapi-typescript`) と Kanban ページ実装着手** へ進みます。
* 修正点・追加要望があればお知らせください。
