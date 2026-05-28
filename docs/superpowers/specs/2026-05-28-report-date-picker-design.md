# IK 物販レジ — レポート日付ピッカー 設計

**作成日**: 2026-05-28

---

## 概要

現在「今日・今月・今年」固定表示のレポート画面に、日付選択UIを追加する。

- **日別レポート**: `<input type="date">` でカレンダー日付選択
- **月別レポート**: 年 + 月の `<select>` プルダウン
- **年別レポート**: 年の `<select>` プルダウン

追加ライブラリなし。ブラウザ標準のネイティブUIを使用し、スマホ操作に最適化する。

---

## 変更スコープ

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | 精算タブ内レポートHTML + その他レポートHTML + JS関数 |

---

## 変更箇所

### 1. 精算タブ内レポート（`#settle-tab-report`）

**変更前:**
```html
<div id="settle-tab-report">
  <div class="report-section" id="daily-report-content"></div>
</div>
```

**変更後:**
```html
<div id="settle-tab-report">
  <div class="report-date-row">
    <input type="date" id="report-date-input" onchange="selectReportDate(this.value)">
  </div>
  <div class="report-section" id="daily-report-content"></div>
</div>
```

- 日付入力欄は `daily-report-content` の外に置くことで、レポート再描画しても入力欄が消えない
- 初期化時（`renderDailyReport()` 呼び出し前）に今日の日付をセットする

### 2. JS状態変数の追加

```javascript
let reportSelectedDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
```

### 3. `renderDailyReport()` の変更

- `new Date().toDateString()` → `new Date(reportSelectedDate + 'T00:00:00').toDateString()` に変更
- タイトルも選択日を表示するよう変更

### 4. `selectReportDate(dateStr)` 関数の追加

```javascript
function selectReportDate(dateStr) {
  reportSelectedDate = dateStr;
  renderDailyReport();
}
```

### 5. `switchSettleTab()` 内の初期化

`renderDailyReport()` 呼び出し前に `#report-date-input` の value を `reportSelectedDate` でセットする。

---

### 6. その他 > レポート（`openOthersSection('report')`）

**変更方針:**
- 状態変数 3つを追加（画面外で保持）
- `openOthersSection('report')` を分割: 画面遷移 + `renderOthersReport(content)` 呼び出し
- picker変更時は `renderOthersReport()` のみ実行（`showScreen` 呼ばない）

**状態変数:**
```javascript
let othersReportDay   = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
let othersReportMonth = new Date().getMonth();    // 0-indexed (0=1月)
let othersReportYear  = new Date().getFullYear();
let othersReportMonthYear = new Date().getFullYear();
```

**`renderOthersReport(content)` 関数:**

3枚のカードを生成。各カードに picker を含む。

```
┌─────────────────────┐
│ 日別  [2026/05/28▼] │  ← input type="date"
│ 売上 ¥12,000 / 50個 │
├─────────────────────┤
│ 月別  [2026年][5月▼]│  ← 年+月の select × 2
│ 売上 ¥48,000 / 200個│
├─────────────────────┤
│ 年別  [2026年    ▼] │  ← 年の select × 1
│ 売上 ¥200,000/1000個│
└─────────────────────┘
```

**年の選択肢の生成:**
取引データ内の全年 + 現在年をSetで収集し、昇順ソート。

```javascript
const years = [...new Set([
  new Date().getFullYear(),
  ...(appData.transactions||[]).map(t => new Date(t.date).getFullYear())
])].sort();
```

**変更ハンドラー:**
```javascript
function updateOthersDay(v)       { othersReportDay = v;              renderOthersReport(document.getElementById('others-sub-content')); }
function updateOthersMonth(v)     { othersReportMonth = parseInt(v);  renderOthersReport(document.getElementById('others-sub-content')); }
function updateOthersMonthYear(v) { othersReportMonthYear = parseInt(v); renderOthersReport(document.getElementById('others-sub-content')); }
function updateOthersYear(v)      { othersReportYear = parseInt(v);   renderOthersReport(document.getElementById('others-sub-content')); }
```

---

## スタイル

`.report-date-row` は既存の `.report-card` に合わせたパディングで配置。picker 要素に最小限のスタイルを追加:

```css
.report-date-row {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
input[type="date"], .report-select {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text1);
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
}
```

---

## 変更対象関数まとめ

| 関数 | 変更内容 |
|-----|---------|
| `renderDailyReport()` | `reportSelectedDate` を参照するよう変更 |
| `switchSettleTab()` | `#report-date-input` の初期値セットを追加 |
| `openOthersSection('report')` | `renderOthersReport()` 呼び出しに切り出し |
| `renderOthersReport(content)` | 新規追加（3カード + picker） |
| `selectReportDate(dateStr)` | 新規追加 |
| `updateOthersDay/Month/MonthYear/Year()` | 新規追加（4関数） |
| 状態変数 | `reportSelectedDate`, `othersReportDay`, `othersReportMonth`, `othersReportMonthYear`, `othersReportYear` を追加 |
