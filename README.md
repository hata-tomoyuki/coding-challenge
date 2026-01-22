# 旅行費用精算アプリ

旅行の費用を割り勘で精算するためのアプリケーションです。

## 機能

- 参加者の追加・削除
- 支払い費用の追加・削除（誰がいくら何に払ったか）
- 精算計算（誰が誰にいくら払えば良いかを自動計算）
- データの自動保存（localStorage）

## 技術スタック

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Docker

## セットアップ

### ローカル開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### Dockerを使用した起動

#### 開発環境

```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### 本番環境

```bash
# ビルドと起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d --build
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

1. **参加者を追加**: 「参加者」セクションで名前を入力して追加
2. **支払いを追加**: 「支払い」セクションで支払った人、金額、内容を入力して追加
3. **精算を確認**: 「精算結果」セクションで誰が誰にいくら払えば良いかを確認
4. **データのリセット**: 「すべてリセット」ボタンで全データをクリア

## ビルド

```bash
npm run build
npm start
```

## ライセンス

このプロジェクトは課題提出用のコードです。
# coding-challenge
