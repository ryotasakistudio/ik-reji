# Supabase移行 + 新規登録画面 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `index.html` のDEMO_USERS + localStorage構成をSupabase Auth + Supabase DBに完全移行し、新規登録画面を追加する。

**Architecture:** `index.html` 1ファイルのみ変更。Supabase JS CDNをheadに追加し、認証・データ保存の各関数をSupabase版に置き換える。認証画面はログイン・登録・完了の3カードをDOMで切り替える方式。

**Tech Stack:** Supabase JS v2 (CDN), HTML/CSS/JS (既存), Vercel (ホスティング)

---

## 前提条件

- Supabaseプロジェクト作成済み
- `schema.sql` をSupabase SQL Editorで実行済み（`profiles` + `app_data` テーブルが存在すること）
- Supabase URL と Anon Key を手元に用意していること

---

## ファイル構成

| ファイル | 操作 | 内容 |
|---------|------|------|
| `index.html` | 変更 | 全変更箇所（Task 1〜6） |

---

### Task 1: Supabase CDN追加 + クライアント初期化 + DEMO_USERS削除

**Files:**
- Modify: `index.html:219` (`</head>` の直前に追加)
- Modify: `index.html:488-494` (DEMO_USERS を削除)

- [ ] **Step 1: `</head>` の直前（218行目と219行目の間）にSupabase CDNを追加する**

`index.html` の `</head>` タグ（218行目）の直前に以下を挿入する：

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  );
</script>
```

`YOUR_SUPABASE_URL` と `YOUR_SUPABASE_ANON_KEY` はSupabaseダッシュボード > Settings > API で確認した値に置き換える。

- [ ] **Step 2: DEMO_USERSの定数・コメントを削除する**

`index.html` の以下の7行（488〜494行）を削除する：

```javascript
// NOTE FOR DEPLOYMENT: Replace DEMO_USERS with a backend auth system (e.g. Supabase Auth, Firebase Auth)
// Each artist should have their own account; data is isolated per userId
const DEMO_USERS = {
  'artist1': {password:'pass123', name:'アーティスト A'},
  'artist2': {password:'pass456', name:'アーティスト B'},
  'admin': {password:'admin123', name:'管理者'}
};
```

- [ ] **Step 3: ブラウザで `index.html` を開いてコンソールエラーがないことを確認する**

```
open /Users/tasakiryo/ik-reji/index.html
```

ブラウザのデベロッパーツール（F12 → Console）を開き、`supabase is not defined` などのエラーが出ていないことを確認する。

- [ ] **Step 4: コミットする**

```bash
cd /Users/tasakiryo/ik-reji
git add index.html
git commit -m "feat: Supabase CDN追加・クライアント初期化・DEMO_USERS削除"
```

---

### Task 2: 認証画面HTMLを3カード構成に置き換える

**Files:**
- Modify: `index.html:222-240` (AUTH SCREEN セクション)

- [ ] **Step 1: 既存の認証画面HTML（222〜240行）を以下に置き換える**

```html
<!-- AUTH SCREEN -->
<div id="auth-screen">
  <div class="auth-logo">IK 物販レジ</div>
  <div class="auth-sub">Artist POS System</div>

  <!-- ログインカード -->
  <div class="auth-card" id="card-login">
    <h3>ログイン</h3>
    <div class="auth-error" id="auth-error">IDまたはパスワードが正しくありません</div>
    <div class="form-group">
      <label>メールアドレス</label>
      <input type="email" id="login-id" placeholder="mail@example.com" autocomplete="email">
    </div>
    <div class="form-group">
      <label>パスワード</label>
      <input type="password" id="login-pw" placeholder="••••••••" autocomplete="current-password">
    </div>
    <button class="btn-primary" onclick="doLogin()">ログイン</button>
    <div class="auth-hint" style="cursor:pointer;color:var(--accent)" onclick="showAuthCard('register')">新規登録はこちら →</div>
  </div>

  <!-- 登録カード -->
  <div class="auth-card" id="card-register" style="display:none">
    <h3>新規登録</h3>
    <div class="auth-error" id="register-error">エラーが発生しました</div>
    <div class="form-group">
      <label>アーティスト名</label>
      <input type="text" id="register-name" placeholder="アーティスト名" autocomplete="name">
    </div>
    <div class="form-group">
      <label>メールアドレス</label>
      <input type="email" id="register-email" placeholder="mail@example.com" autocomplete="email">
    </div>
    <div class="form-group">
      <label>パスワード</label>
      <input type="password" id="register-pw" placeholder="••••••••" autocomplete="new-password">
    </div>
    <button class="btn-primary" onclick="doRegister()">登録する</button>
    <div class="auth-hint" style="cursor:pointer;color:var(--accent)" onclick="showAuthCard('login')">← ログインに戻る</div>
  </div>

  <!-- 登録完了カード -->
  <div class="auth-card" id="card-complete" style="display:none">
    <h3>確認メールを送信しました</h3>
    <p style="font-size:0.875rem;color:var(--text2);margin-top:1rem;line-height:1.6">メールのリンクをクリックしてからログインしてください。</p>
    <div class="auth-hint" style="cursor:pointer;color:var(--accent);margin-top:1.5rem" onclick="showAuthCard('login')">← ログインに戻る</div>
  </div>
</div>
```

- [ ] **Step 2: ブラウザで開いてログイン画面が表示されることを確認する**

```
open /Users/tasakiryo/ik-reji/index.html
```

- ログインカードが表示される
- 「新規登録はこちら →」テキストが表示される
- ラベルが「メールアドレス」になっている

- [ ] **Step 3: コミットする**

```bash
git add index.html
git commit -m "feat: 認証画面を3カード構成（ログイン/登録/完了）に変更"
```

---

### Task 3: showAuthCard() と doRegister() を追加する

**Files:**
- Modify: `index.html` の `// ======= AUTH =======` セクション（元519行付近）

- [ ] **Step 1: `// ======= AUTH =======` のコメント行の直後（元 `function doLogin()` の前）に以下を追加する**

```javascript
function showAuthCard(name) {
  ['login','register','complete'].forEach(n => {
    document.getElementById('card-' + n).style.display = n === name ? 'block' : 'none';
  });
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('register-error').style.display = 'none';
}

async function doRegister() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const pw = document.getElementById('register-pw').value;
  const err = document.getElementById('register-error');
  err.style.display = 'none';

  if (!name || !email || !pw) {
    err.textContent = 'すべての項目を入力してください';
    err.style.display = 'block';
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password: pw });
  if (error) {
    err.textContent = error.message.includes('already')
      ? 'このメールアドレスは既に登録されています'
      : '通信エラーが発生しました。再度お試しください';
    err.style.display = 'block';
    return;
  }

  await supabase.from('profiles').insert({ id: data.user.id, artist_name: name });
  showAuthCard('complete');
}
```

- [ ] **Step 2: ブラウザで「新規登録はこちら」をクリックして登録カードに切り替わることを確認する**

- 「新規登録はこちら →」をクリック → 登録カードが表示される
- 「← ログインに戻る」をクリック → ログインカードに戻る

- [ ] **Step 3: コミットする**

```bash
git add index.html
git commit -m "feat: showAuthCard()・doRegister()を追加"
```

---

### Task 4: doLogin() をSupabase Auth版に置き換える

**Files:**
- Modify: `index.html` の `function doLogin()` （元520〜540行）

- [ ] **Step 1: `function doLogin() { ... }` の全体を以下に置き換える**

```javascript
async function doLogin() {
  const email = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  const err = document.getElementById('auth-error');
  err.style.display = 'none';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
  if (error) {
    err.textContent = error.message.includes('Email not confirmed')
      ? 'メールを確認してください'
      : 'IDまたはパスワードが正しくありません';
    err.style.display = 'block';
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('artist_name')
    .eq('id', data.user.id)
    .single();

  currentUser = { id: data.user.id, name: profile?.artist_name || email };
  appData = await loadUserData(data.user.id);

  document.getElementById('topbar-artist').textContent = currentUser.name;
  document.getElementById('logout-artist-name').textContent = currentUser.name;
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'flex';
  document.getElementById('main-app').style.flexDirection = 'column';
  renderProducts();
  renderTransactions();
  renderDailyReport();
  buildSettlementInputs();
}
```

- [ ] **Step 2: Supabaseで実際のテストユーザーを1件作成する**

Supabaseダッシュボード > Authentication > Users > 「Add user」から：
- Email: テスト用のメールアドレス
- Password: 任意のパスワード
- 「Auto Confirm User」にチェックを入れて作成

次にSQL Editorで以下を実行してアーティスト名を登録する：

```sql
insert into profiles (id, artist_name)
select id, 'テストアーティスト'
from auth.users
where email = '作成したメールアドレス';
```

- [ ] **Step 3: ブラウザでログインが成功することを確認する**

```
open /Users/tasakiryo/ik-reji/index.html
```

作成したテストユーザーのメール・パスワードでログインし、メインアプリが表示されることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add index.html
git commit -m "feat: doLogin()をSupabase Auth版に置き換え"
```

---

### Task 5: loadUserData() / saveUserData() をSupabase版に置き換える

**Files:**
- Modify: `index.html` の `// ======= STORAGE =======` セクション（元504〜517行）

- [ ] **Step 1: `// ======= STORAGE (localStorage for deployed version) =======` から `saveUserData()` の終わりまでを以下に置き換える**

```javascript
// ======= STORAGE (Supabase) =======
async function loadUserData(userId) {
  const { data } = await supabase
    .from('app_data')
    .select('content')
    .eq('user_id', userId)
    .single();
  if (data?.content) return data.content;
  const initial = { products:[], transactions:[], settlements:[], cashLedger:[], regiFund:0 };
  await supabase.from('app_data').upsert({ user_id: userId, content: initial });
  return initial;
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

注意: `saveUserData()` は `async` になるが、既存の呼び出し元（`saveProduct()`・`toggleFav()`・`recordTransaction()` 等）は `await` なしの fire-and-forget で呼び出しているままで問題ない。

- [ ] **Step 2: ログインしてから商品を追加し、リロード後にデータが残っていることを確認する**

1. ログイン
2. 「お会計」タブ → 商品を1件追加
3. ページをリロード（F5）
4. ログインし直す → 追加した商品が表示されることを確認

- [ ] **Step 3: コミットする**

```bash
git add index.html
git commit -m "feat: loadUserData()/saveUserData()をSupabase DB版に置き換え"
```

---

### Task 6: confirmLogout() をSupabase版に置き換える

**Files:**
- Modify: `index.html` の `function confirmLogout()` （元541〜550行）

- [ ] **Step 1: `function confirmLogout() { ... }` の全体を以下に置き換える**

```javascript
async function confirmLogout() {
  if (!confirm('本当にログアウトしますか？')) return;
  await supabase.auth.signOut();
  currentUser = null; appData = {}; cart = [];
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('login-id').value = '';
  document.getElementById('login-pw').value = '';
  document.getElementById('auth-error').style.display = 'none';
  showAuthCard('login');
}
```

- [ ] **Step 2: ログアウトが正常に動作することを確認する**

1. ログイン
2. 「その他」タブ → ログアウトをタップ
3. 確認ダイアログ → 「OK」
4. ログイン画面に戻ることを確認

- [ ] **Step 3: コミットする**

```bash
git add index.html
git commit -m "feat: confirmLogout()をsupabase.auth.signOut()版に置き換え"
```

---

### Task 7: Supabase設定 + Vercelデプロイ + 動作確認

- [ ] **Step 1: SupabaseでリダイレクトURLを設定する（ブラウザ操作）**

Supabaseダッシュボード > Authentication > URL Configuration:
- **Site URL**: `https://ik-reji.vercel.app`
- **Redirect URLs** に `https://ik-reji.vercel.app` を追加

「Save」をクリック。

- [ ] **Step 2: git push してVercelに自動デプロイする**

```bash
cd /Users/tasakiryo/ik-reji
git push origin main
```

期待される出力：
```
To https://github.com/ikmusic04-coder/ik-reji.git
   xxxxxxx..xxxxxxx  main -> main
```

Vercelが自動検知して数十秒でデプロイ完了する。

- [ ] **Step 3: デプロイされたアプリで新規登録の動作確認をする**

https://ik-reji.vercel.app にアクセスして以下を確認する：

1. 「新規登録はこちら →」をクリック → 登録カードが表示される
2. アーティスト名・メール・パスワードを入力して「登録する」
3. 「確認メールを送信しました」カードが表示される
4. 受信したメールのリンクをクリック（メール確認）
5. ログイン画面でメール・パスワードを入力 → メインアプリが表示される
6. 商品を追加 → 別のブラウザ/端末でログインしてもデータが表示される（localStorage依存でないことを確認）

- [ ] **Step 4: 完了**

全機能が正常に動作していることを確認したら移行完了。
