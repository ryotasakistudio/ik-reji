-- IK 物販レジ — Supabase スキーマ
-- Supabase ダッシュボード > SQL Editor で実行する

-- プロフィールテーブル（アーティスト名を管理）
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  artist_name text not null,
  created_at timestamptz default now()
);

-- アプリデータテーブル（商品・取引・精算データをJSONBで保存）
create table if not exists app_data (
  user_id uuid references auth.users on delete cascade primary key,
  content jsonb not null default '{"products":[],"transactions":[],"settlements":[],"cashLedger":[],"regiFund":0}',
  updated_at timestamptz default now()
);

-- Row Level Security を有効化
alter table profiles enable row level security;
alter table app_data enable row level security;

-- ポリシー: 自分のプロフィールのみ操作可能
create policy "自分のプロフィールのみ参照" on profiles
  for select using (auth.uid() = id);

create policy "自分のプロフィールのみ更新" on profiles
  for update using (auth.uid() = id);

-- ポリシー: 自分のデータのみ操作可能
create policy "自分のデータのみ参照" on app_data
  for select using (auth.uid() = user_id);

create policy "自分のデータのみ挿入" on app_data
  for insert with check (auth.uid() = user_id);

create policy "自分のデータのみ更新" on app_data
  for update using (auth.uid() = user_id);

-- updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger app_data_updated_at
  before update on app_data
  for each row execute function update_updated_at();
