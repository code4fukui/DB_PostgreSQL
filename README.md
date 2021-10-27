# DB_PostgreSQL

Denoで、PostgreSQLを扱う DB.js

## サンプル

[ログイン付きBBS](https://github.com/taisukef/server.js/tree/bbs_with_login)のフロントエンドをそのまま使用

コマンドでPostgreSQLインストール (Mac)

```
brew install postgresql
brew services start postgresql
psql postgres
```

PostgreSQL内

```
create user postgres SUPERUSER;
exit
```

コマンドで、テーブル作成（既存テーブルデータは drop table で削除される）

```
psql -U postgres -f create_tables.sql
```

コマンドで、APIサーバー実行

```
sh run.sh
```

ブラウザで[http://localhost:3001/](http://localhost:3001/)を開く
