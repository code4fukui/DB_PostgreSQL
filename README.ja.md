# DB_PostgreSQL

PostgreSQLを操作するためのDenoベースのDB.js。

## 機能
- PostgreSQLデータベースの操作
- トランザクション管理
- シンプルなCRUD操作
- テーブル定義の自動生成

## 要件
- Deno
- PostgreSQL

## 使い方

PostgreSQLのインストール（Mac）:

```
brew install postgresql
brew services start postgresql
psql postgres
create user postgres SUPERUSER;
exit
```

テーブルの作成（既存のテーブルデータは削除されます）:

```
psql -U postgres -f create_tables.sql
```

APIサーバーの起動:

```
sh run.sh
```

## ライセンス
MIT License
