# IK 物販レジ — Claude Code 引き継ぎ仕様書

## このファイルについて
このプロジェクトはClaude Codeと会話しながら継続開発する。
修正・追加の依頼はすべてClaude Codeに自然言語で伝えること。
**必ずこのファイルを最初に読んでから作業を始めること。**

---

## プロジェクト概要
アーティスト向けの物販POSレジアプリ。
商品登録・会計記録・精算管理が目的。実際の金銭授受はPayPay/現金で行い、このアプリは記録専用。
ホスティングは自前。フロント: 純HTML/CSS/JS（1ファイル構成）。

---

## ファイル構成
```
index.html        ← アプリ本体（HTML + CSS + JS を1ファイルに統合）
CLAUDE.md         ← この仕様書（必ず最初に読む）
supabase/
  schema.sql      ← DBテーブル定義（Supabaseで実行する）
  seed.sql        ← 初期ユーザーデータ
.env.example      ← 環境変数のテンプレート
```

---

## 現在の実装状況（完成済み）

| 画面 | 機能 |
|------|------|
| ログイン | ID/PW認証、アーティストごとにデータ分離 |
| お会計 | 商品ライブラリ/お気に入りタブ、カート、現金(キーパッド+お釣り)/PayPay決済 |
| お取引 | 取引履歴一覧、フィルター(現金/PayPay/返品)、詳細表示、返品処理 |
| 精算 | 本日レポート(現金/PayPay/返金)、商品別売上、紙幣硬貨別精算入力 |
| その他 | 日月年レポート、精算履歴、レジ金管理(売上入金/レジ金設定)、ログアウト |

### 現在のデータ保存方法（移行前）
```javascript
// localStorageに保存（端末依存）→ Supabaseに移行する
localStorage.setItem('ik_reji_' + userId, JSON.stringify(appData))
```

---

## 【最優先タスク】Supabaseへの移行手順

### ステップ1: Supabaseプロジェクト作成
1. https://supabase.com でプロジェクト作成
2. `supabase/schema.sql` をSupabase SQL Editorで実行
3. `supabase/seed.sql` でアーティストアカウントを登録
4. `.env.example` を `.env` にコピーして値を入力

### ステップ2: index.html の修正箇所

#### ① `<head>` にSupabase CDNを追加
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  );
</script>
```

#### ② ログイン処理を置き換え
```javascript
// 削除する定数
const DEMO_USERS = { ... };

// 置き換え後
async function doLogin() {
  const email = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
  if (error) { document.getElementById('auth-error').style.display = 'block'; return; }
  const profile = await supabase.from('profiles').select('artist_name').eq('id', data.user.id).single();
  currentUser = { id: data.user.id, name: profile.data?.artist_name || email };
  appData = await loadUserData(currentUser.id);
  // ...以降は現在のログイン成功処理と同じ
}
```

#### ③ データ保存・読み込みを置き換え
```javascript
async function loadUserData(userId) {
  const { data } = await supabase
    .from('app_data')
    .select('content')
    .eq('user_id', userId)
    .single();
  return data?.content || { products:[], transactions:[], settlements:[], cashLedger:[], regiFund:0 };
}

async function saveUserData() {
  if (!currentUser) return;
  await supabase.from('app_data').upsert({
    user_id: currentUser.id,
    content: appData,
    updated_at: new Date().toISOString()
  });
}
```

#### ④ ログアウト処理を置き換え
```javascript
async function confirmLogout() {
  if (!confirm('本当にログアウトしますか？')) return;
  await supabase.auth.signOut();
  // ...以降は現在のログアウト処理と同じ
}
```

---

## Supabase DB スキーマ（supabase/schema.sql の内容）

```sql
-- プロフィールテーブル
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  artist_name text not null,
  created_at timestamptz default now()
);

-- アプリデータテーブル（JSONBで全データを1カラムに保存）
create table app_data (
  user_id uuid references auth.users on delete cascade primary key,
  content jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Row Level Security（自分のデータのみ読み書き可能）
alter table profiles enable row level security;
alter table app_data enable row level security;

create policy "自分のプロフィールのみ" on profiles
  for all using (auth.uid() = id);

create policy "自分のデータのみ" on app_data
  for all using (auth.uid() = user_id);
```

---

## アーティストアカウントの登録方法（supabase/seed.sql）

Supabase Authのダッシュボード（Authentication > Users > Add user）から手動で追加するか、
以下のSQLで登録する（メールアドレスでログイン）：

```sql
-- profilesテーブルにアーティスト名を登録（auth.usersへの追加はダッシュボードで行う）
insert into profiles (id, artist_name) values
  ('auth.usersで作成したUUID', 'アーティスト A'),
  ('auth.usersで作成したUUID', 'アーティスト B');
```

> ログインIDはメールアドレス形式になる（例: artist_a@example.com）

---

## データ構造（content フィールドの中身）

```javascript
{
  products: [
    {
      id: 'p_1234567890',    // タイムスタンプベースのID
      name: 'Tシャツ',
      price: 3000,            // 税込金額（円）
      stock: 10,
      emoji: '👕',
      favorite: false
    }
  ],
  transactions: [
    {
      id: 'tx_1234567890',
      type: 'sale',           // 'sale' | 'refund'
      method: 'cash',         // 'cash' | 'paypay'
      total: 3000,
      received: 5000,         // 現金の場合のお預かり額
      change: 2000,           // 現金の場合のお釣り
      items: [
        { productId: 'p_xxx', name: 'Tシャツ', price: 3000, qty: 1, emoji: '👕' }
      ],
      originalTxId: null,     // 返品の場合、元の取引ID
      date: '2026-05-19T10:00:00.000Z'
    }
  ],
  settlements: [
    {
      id: 'set_1234567890',
      total: 50000,
      counts: { 10000: 3, 5000: 2, 1000: 5, 500: 0, 100: 0, 50: 0, 10: 0, 1: 0 },
      date: '2026-05-19T20:00:00.000Z'
    }
  ],
  cashLedger: [
    { type: 'deposit', amount: 30000, date: '...' },
    { type: 'setup',   amount: 10000, date: '...' }
  ],
  regiFund: 10000
}
```

---

## UI・デザイン仕様（変更禁止）

- レイアウト: モバイルファースト、max-width: 430px、中央寄せ
- フォント: Hiragino Kaku Gothic ProN（日本語）
- アクセントカラー: `#1a1a2e`（ネイビー）
- 色の意味: 現金=緑(`#2d7a4f`)、PayPay=青(`#185fa5`)、返品=赤(`#c0392b`)
- アイコン: Tabler Icons（CDN）
- ボトムナビ: お会計 / お取引 / 精算 / その他 の4タブ固定

---

## 今後の修正依頼の例

```
「商品に写真をアップロードできるようにして。Supabase Storageを使う。」
「取引履歴をCSVでダウンロードできるボタンを追加して。」
「在庫が3個以下になったら商品カードに警告を表示して。」
「管理者がアーティストアカウントを作成できる画面を追加して。」
```

---

## 環境変数（.env.example）
```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
index.html内のscriptタグに直接埋め込む。
本番公開時はgit管理から外すこと（.gitignoreに.envを追加）。

---

## セキュリティ
- Supabase Anon Keyはフロントに露出するが、RLSポリシーで自分のデータのみ操作可能
- パスワードはSupabase Authが管理（平文保存なし）
- RLSポリシー: `user_id = auth.uid()` で他ユーザーのデータにはアクセス不可
