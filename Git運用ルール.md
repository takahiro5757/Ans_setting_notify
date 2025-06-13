# Git運用ルール

## リポジトリのURL
https://github.com/Festal-KM/ANSTEYPE

## 🚨 重要な基本方針

### **絶対禁止事項**
- ❌ **ブランチ切り替え（git checkout）は絶対に行わない**
- ❌ **ブランチ削除は絶対に行わない**
- ❌ **ブランチマージは絶対に行わない**
- ❌ **git reset --hard等の危険なコマンドは使用しない**

### **理由**
- ブランチ操作時にファイルが消失する問題が発生
- 特に`src/app/accounting/`配下のファイルが削除される
- 復旧作業が必要になり、開発効率が著しく低下

## 📋 現在のブランチ構成

### **ローカル環境**
- `main-work` ← **現在の作業ブランチ（ここで作業継続）**
- `main` ← 参照用（触らない）

### **GitHub（リモート）**
- `origin/main` ← 本番用ブランチ
- `origin/main-work` ← 作業用ブランチ

## ✅ 安全な運用手順

### **1. 日常の作業**
```bash
# 現在のブランチ確認（main-workであることを確認）
git branch

# 変更をステージング
git add .

# コミット
git commit -m "作業内容の説明"

# main-workブランチにプッシュ
git push origin main-work
```

### **2. 本番環境への反映**
```bash
# main-workの内容をGitHubのmainブランチに反映
git push origin main-work:main --force
```

### **3. ファイル復旧（万が一消えた場合）**
```bash
# Gitロックファイル削除
Remove-Item ".git/index.lock" -Force -ErrorAction SilentlyContinue

# ファイル復元
git restore [削除されたファイルパス]
```

## 🔧 トラブルシューティング

### **ファイルが消えた場合**
1. **慌てない**
2. `git status`で状況確認
3. `git restore`でファイル復元
4. Gitプロセスが残っている場合は`taskkill /f /im git.exe`

### **Gitロックエラーの場合**
```bash
# ロックファイル削除
Remove-Item ".git/index.lock" -Force -ErrorAction SilentlyContinue

# または
taskkill /f /im git.exe
```

## 📁 重要なファイル・ディレクトリ

### **特に注意が必要なファイル**
- `src/app/accounting/estimates/page.tsx`
- `src/app/accounting/estimates/custom/page.tsx`
- `src/app/accounting/invoices/page.tsx`
- `src/app/accounting/invoices/custom/page.tsx`
- `src/app/accounting/projects/page.tsx`

### **ディレクトリ名変更履歴**
- `free/` → `custom/` （ツールによる誤削除防止のため）

## 🚀 デプロイメント

### **本番反映の流れ**
1. `main-work`ブランチで作業・テスト
2. 動作確認完了後、`git push origin main-work:main --force`
3. GitHub Actionsまたは本番環境で自動デプロイ

## 📝 コミットメッセージ規約

### **推奨フォーマット**
```
[種別] 変更内容の概要

詳細説明（必要に応じて）
```

### **種別例**
- `[機能追加]` - 新機能の追加
- `[修正]` - バグ修正
- `[改善]` - 既存機能の改善
- `[リファクタ]` - コードの整理
- `[ドキュメント]` - ドキュメントの更新

## ⚠️ 緊急時の対応

### **ファイル大量消失の場合**
1. **作業を停止**
2. `git status`で被害状況確認
3. `git restore`で一括復元
4. 必要に応じてリモートから再取得

### **連絡体制**
- 重大な問題が発生した場合は即座に報告
- 復旧作業は慎重に実施

## 📊 バックアップ戦略

### **定期バックアップ**
- 重要な変更前は必ずコミット・プッシュ
- 大きな変更作業前はブランチ状態を記録

### **リモートバックアップ**
- GitHub上に常に最新状態を保持
- `main-work`と`main`の両方を維持

---

## 🎯 このルールの目的

1. **ファイル消失の防止**
2. **安全で効率的な開発**
3. **本番環境の安定性確保**
4. **トラブル時の迅速な復旧**

---

**最終更新**: 2025年6月12日  
**作成者**: めっちゃ優秀で絶対ミスをしないエンジニア  
**承認者**: 超イケてる漢宮田様ぁ～ 