# IK 物販レジ — Supabase移行 + 新規登録画面 設計

**作成日**: 2026-05-26  
**フェーズ**: フェーズ2（Supabaseバックエンド構築）

---

## 概要

現在 `DEMO_USERS`（ハードコード）と `localStorage` で動いているアプリを、Supabase Auth + Supabase DB に完全移行する。あわせて、「管理者に問い合わせ」ではなくユーザー自身が登録できる新規登録画面を追加する。

---

## 変更スコープ

変更対象ファイルは `index.html` のみ（1ファイル構成を維持）。

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| 認証 | DEMO_USERS（ハードコード） | Supabase Auth |
| データ保存 | localStorage | Supabase `app_data` テーブル |
| 画面 | ログインのみ | ログイン ＋ 新規登録 |
| UI/デザイン | そのまま維持 | そのまま維持 |

---

## アーキテクチャ

```
index.html
├── <head>
│   ├── Supabase JS CDN (@supabase/supabase-js@2)
│   └── supabase クライアント初期化（URL + ANON_KEY を直書き）
│
├── 認証画面
│   ├── ログインカード（既存）
│   │   └── 「新規登録はこちら →」リンク追加
│   ├── 登録カード（新規）
│   │   └── アーティスト名 / メール / パスワード
│   └── 登録完了メッセージカード（新規）
│
└── JavaScript
    ├── doLogin()     → supabase.auth.signInWithPassword()
    ├── doRegister()  → supabase.auth.signUp() + profiles insert
    ├── loadUserData()→ supabase.from('app_data').select()
    ├── saveUserData()→ supabase.from('app_data').upsert()
    └── confirmLogout()→ supabase.auth.signOut()
```

---

## 認証フロー

### 新規登録
```
1. 登録画面でアーティスト名・メール・パスワードを入力
2. supabase.auth.signUp({ email, password })
3. 成功 → profiles に { id: user.id, artist_name } を insert
4. 登録完了カードを表示（「確認メールを送信しました」）
5. ユーザーがメール内のリンクをクリック → ログイン可能になる
```

### ログイン
```
1. メール・パスワードを入力
2. supabase.auth.signInWithPassword({ email, password })
3. 成功 → profiles から artist_name を取得
4. app_data からデータをロード（なければ初期値で upsert）
5. メインアプリを表示
```

### ログアウト
```
1. supabase.auth.signOut()
2. ログイン画面に戻る（appDataをリセット）
```

---

## エラーハンドリング

| 状況 | 表示メッセージ |
|------|----------------|
| メール未確認でログイン | メールを確認してください |
| 認証情報が間違い | IDまたはパスワードが正しくありません |
| 既存メールで登録 | このメールアドレスは既に登録されています |
| ネットワークエラー | 通信エラーが発生しました。再度お試しください |

---

## データフロー

### 読み込み（ログイン成功時）
```javascript
const { data } = await supabase
  .from('app_data')
  .select('content')
  .eq('user_id', uid)
  .single();

// データがなければ初期値を upsert
const content = data?.content || {
  products: [], transactions: [], settlements: [],
  cashLedger: [], regiFund: 0
};
```

### 書き込み（操作のたび）
```javascript
await supabase.from('app_data').upsert({
  user_id: currentUser.id,
  content: appData,
  updated_at: new Date().toISOString()
});
```

### 移行方針
既存の localStorage データは移行しない。社内確認フェーズのためデータ継続性は不要。

---

## 登録画面UI

既存の `.auth-card` スタイルを流用。ログイン・登録・完了の3状態をカード切り替えで実現。

**ログイン画面（追加: 切り替えリンク）:**
```
┌─────────────────────┐
│ ログイン            │
│ メールアドレス      │
│ [________________]  │
│ パスワード          │
│ [________________]  │
│ [エラーメッセージ]  │
│ [   ログイン   ]    │
│ 新規登録はこちら →  │ ← 追加
└─────────────────────┘
```

**登録画面（新規）:**
```
┌─────────────────────┐
│ 新規登録            │
│ アーティスト名      │
│ [________________]  │
│ メールアドレス      │
│ [________________]  │
│ パスワード          │
│ [________________]  │
│ [エラーメッセージ]  │
│ [   登録する   ]    │
│ ← ログインに戻る    │
└─────────────────────┘
```

**登録完了（新規）:**
```
┌─────────────────────┐
│ ✓ 確認メールを      │
│   送信しました      │
│                     │
│ メールのリンクを    │
│ クリックしてから    │
│ ログインしてください│
│                     │
│ ← ログインに戻る    │
└─────────────────────┘
```

---

## Supabase側の設定（ブラウザ操作）

1. **URL Configuration**  
   Authentication > URL Configuration  
   - Site URL: `https://ik-reji.vercel.app`  
   - Redirect URLs: `https://ik-reji.vercel.app`

2. **Email確認**: デフォルト有効のまま

3. **DBスキーマ**: `schema.sql` を SQL Editor で実行済みであること

---

## Vercel環境変数（デプロイ後設定）

Vercel ダッシュボード > Settings > Environment Variables に追加：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` |

ただし、ビルドステップがないため `index.html` に直接記述する形で実装する（Privateリポジトリのため許容）。
