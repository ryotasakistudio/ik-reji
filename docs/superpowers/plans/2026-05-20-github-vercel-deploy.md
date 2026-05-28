# GitHub + Vercel デプロイ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** IK 物販レジ（静的HTMLアプリ）をGitHub Private リポジトリにプッシュし、Vercelで自動デプロイできる状態にする。

**Architecture:** 単一HTMLファイルをGitHub（Private）で管理し、VercelのGitHub連携で自動デプロイする。ビルドステップは不要。mainブランチへのプッシュがそのままデプロイに直結する。

**Tech Stack:** Git, GitHub CLI (`gh`), Vercel（ブラウザダッシュボード）

---

## ファイル構成

| ファイル | 操作 | 内容 |
|---------|------|------|
| `.gitignore` | 新規作成 | `gitignore` の内容 + `.env` を追加 |
| `gitignore` | 削除 | `.gitignore` に置き換えるため不要になる |

---

### Task 1: `.gitignore` を整備する

**Files:**
- Create: `/Users/tasakiryo/ik-reji/.gitignore`
- Delete: `/Users/tasakiryo/ik-reji/gitignore`

- [ ] **Step 1: 現在の `gitignore` の内容を確認する**

```bash
cat /Users/tasakiryo/ik-reji/gitignore
```

- [ ] **Step 2: `.gitignore` を作成する**

`/Users/tasakiryo/ik-reji/.gitignore` を以下の内容で作成する：

```
.env
.DS_Store
```

- [ ] **Step 3: 元の `gitignore` ファイルを削除する**

```bash
rm /Users/tasakiryo/ik-reji/gitignore
```

- [ ] **Step 4: ファイルが正しく作成されたことを確認する**

```bash
cat /Users/tasakiryo/ik-reji/.gitignore
```

期待される出力：
```
.env
.DS_Store
```

---

### Task 2: Gitリポジトリを初期化して初回コミットする

**Files:**
- Modify: `/Users/tasakiryo/ik-reji/`（git init）

- [ ] **Step 1: `ik-reji` ディレクトリに移動して `git init` を実行する**

```bash
cd /Users/tasakiryo/ik-reji && git init
```

期待される出力：
```
Initialized empty Git repository in /Users/tasakiryo/ik-reji/.git/
```

- [ ] **Step 2: git ユーザー設定を確認する**

```bash
git config user.name && git config user.email
```

`ryohaneki` と `ik.music.04@gmail.com` が表示されればOK。表示されない場合：

```bash
git config user.name "ryohaneki"
git config user.email "ik.music.04@gmail.com"
```

- [ ] **Step 3: ステージングする対象を確認する**

```bash
git status
```

以下のファイルが `Untracked files` に表示されることを確認する：
- `index.html`
- `schema.sql`
- `CLAUDE.md`
- `env.example`
- `.gitignore`
- `docs/`

`.env` が含まれていないことを確認する（`.gitignore` が効いていれば表示されない）。

- [ ] **Step 4: ファイルをステージングする**

```bash
git add index.html schema.sql CLAUDE.md env.example .gitignore docs/
```

- [ ] **Step 5: ステージング内容を確認する**

```bash
git status
```

`Changes to be committed:` に上記5ファイルと `docs/` 以下が表示されることを確認する。

- [ ] **Step 6: 初回コミットする**

```bash
git commit -m "$(cat <<'EOF'
feat: IK 物販レジ 初回コミット

localStorageベースのフロントエンド一式。
フェーズ2でSupabaseバックエンドを統合予定。

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

期待される出力：
```
[main (root-commit) xxxxxxx] feat: IK 物販レジ 初回コミット
```

---

### Task 3: GitHub Private リポジトリを作成してプッシュする

**前提:** `gh` CLI がインストール済みで `gh auth login` 済みであること。

- [ ] **Step 1: `gh` CLIのログイン状態を確認する**

```bash
gh auth status
```

`Logged in to github.com as ryohaneki` と表示されればOK。未ログインの場合：

```bash
gh auth login
```

対話形式で GitHub.com → HTTPS → ブラウザ認証を選ぶ。

- [ ] **Step 2: GitHub Private リポジトリを作成する**

```bash
gh repo create ik-reji --private --source=. --remote=origin --push
```

このコマンド1つで以下を全て実行する：
- `ryohaneki/ik-reji` というPrivateリポジトリを作成
- リモート `origin` として登録
- 現在のコミットをプッシュ

期待される出力：
```
✓ Created repository ryohaneki/ik-reji on GitHub
✓ Added remote https://github.com/ryohaneki/ik-reji.git
✓ Pushed commits to https://github.com/ryohaneki/ik-reji.git
```

- [ ] **Step 3: GitHub上でファイルが確認できることを確認する**

```bash
gh repo view ryohaneki/ik-reji --web
```

ブラウザでリポジトリが開き、`index.html` などが表示されればOK。

---

### Task 4: Vercel でデプロイする（ブラウザ操作）

このタスクはブラウザで行う手動操作。

- [ ] **Step 1: Vercel にログインする**

https://vercel.com にアクセスし、GitHubアカウントでログインする。

- [ ] **Step 2: 新規プロジェクトを作成する**

1. ダッシュボードの「Add New... → Project」をクリック
2. 「Import Git Repository」で `ryohaneki/ik-reji` を検索
   - 表示されない場合は「Adjust GitHub App Permissions」でリポジトリへのアクセスを許可する
3. `ik-reji` の「Import」をクリック

- [ ] **Step 3: プロジェクト設定を確認してデプロイする**

以下の設定を確認する：

| 項目 | 設定値 |
|------|--------|
| Framework Preset | `Other` |
| Root Directory | `.`（デフォルト） |
| Build Command | 空欄のまま |
| Output Directory | 空欄のまま（または `.`） |

「Deploy」ボタンをクリックする。

- [ ] **Step 4: デプロイ完了を確認する**

数秒〜数十秒後に以下のような画面が表示される：
- 「Congratulations!」メッセージ
- デプロイURL（例: `https://ik-reji-xxxx.vercel.app`）

URLをクリックしてアプリが正常に表示されることを確認する。

- [ ] **Step 5: 動作確認**

デプロイされたURLでアプリを開き、以下を確認する：
- ログイン画面が表示される
- デモユーザーでログインできる（IDとパスワードはindex.html内の `DEMO_USERS` に記載）
  - `artist1` / `pass123`
  - `artist2` / `pass456`
  - `admin` / `admin123`
- 各タブ（お会計・お取引・精算・その他）が表示される

---

## 今後の修正をデプロイする方法

コードを変更したあとは以下のコマンドだけで自動デプロイされる：

```bash
git add <変更ファイル>
git commit -m "fix: ..."
git push origin main
```

Vercelが自動的に検知して数十秒でデプロイ完了する。

---

## フェーズ2（Supabase統合）への移行時の追加作業

Vercel側で環境変数を設定するだけでデプロイフローは変わらない：

1. Vercel ダッシュボード → プロジェクト → Settings → Environment Variables
2. `SUPABASE_URL` と `SUPABASE_ANON_KEY` を追加
3. `git push` で再デプロイ
