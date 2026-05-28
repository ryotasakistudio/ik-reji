# IK 物販レジ — GitHub + Vercel デプロイ設計

**作成日**: 2026-05-20  
**フェーズ**: フェーズ1（フロントエンドデプロイ）

---

## 概要

アーティスト向け物販POSアプリ「IK 物販レジ」を、社内確認のためVercelにデプロイする。
現状はlocalStorage版のフロントエンドのみをデプロイし、バックエンド（Supabase）統合は後続フェーズで行う。

---

## 開発フェーズ全体像

| フェーズ | 内容 | 状態 |
|---------|------|------|
| フェーズ1 | フロントエンドをGitHub + Vercelにデプロイ | **今回** |
| フェーズ2 | Supabaseバックエンド構築・localStorage → Supabase移行 | 社内確認後 |
| フェーズ3 | 実運用しながら修正・新機能追加 | フェーズ2完了後 |

---

## アーキテクチャ

```
[開発環境]
/Users/tasakiryo/ik-reji/
├── index.html          ← アプリ本体（HTML + CSS + JS 1ファイル）
├── schema.sql          ← Supabase用DBスキーマ（フェーズ2で使用）
├── CLAUDE.md           ← Claude Code 引き継ぎ仕様書
├── .gitignore          ← .env を除外
├── env.example         ← 環境変数テンプレート（git管理対象）
└── docs/
    └── superpowers/
        └── specs/      ← 設計ドキュメント

[デプロイ先]
GitHub: ryohaneki/ik-reji（Private）
  └─ main ブランチ
       └─ 自動デプロイ
            └─ Vercel: ik-reji-xxxx.vercel.app
```

---

## 技術スタック

- **フロントエンド**: 純HTML/CSS/JS（1ファイル構成）、追加ビルドツールなし
- **データ保存（フェーズ1）**: localStorage（端末依存、社内確認目的）
- **データ保存（フェーズ2以降）**: Supabase（PostgreSQL + RLS）
- **認証（フェーズ2以降）**: Supabase Auth
- **ホスティング**: Vercel（静的サイトとして配信）
- **バージョン管理**: GitHub（Private）

---

## デプロイ設定

### .gitignore
```
.env
.DS_Store
```

### Vercel設定
単一HTMLファイルのため `vercel.json` は不要。  
Vercelのルートディレクトリ設定でリポジトリルートを指定する。

### デプロイフロー
```
git push origin main
    └─ Vercelが自動検知
         └─ ビルド（静的サイトのためビルド不要）
              └─ デプロイ完了（数秒）
```

---

## 作業手順

1. `.gitignore` ファイル整備（`gitignore` をリネーム、`.env` 追加）
2. `git init` → 初回コミット
3. `gh repo create ryohaneki/ik-reji --private` でGitHubリポジトリ作成
4. `git push -u origin main`
5. Vercelダッシュボードでリポジトリ連携・デプロイ（ブラウザ操作）

---

## フェーズ2（Supabase）への移行方針

CLAUDE.md に詳細な移行手順が記載済み。主な変更点：
- `<head>` に Supabase CDN を追加
- ログイン処理をSupabase Authに置き換え
- `loadUserData` / `saveUserData` をSupabaseのupsertに置き換え
- ログアウト処理を `supabase.auth.signOut()` に置き換え

移行後もVercelへのデプロイフローは変わらない（環境変数をVercelのダッシュボードに設定）。

---

## セキュリティ

- `.env` はgit管理対象外（`.gitignore` で除外）
- フェーズ2以降: Supabase Anon KeyはRLSポリシーで保護
- GitHubリポジトリはPrivate設定
