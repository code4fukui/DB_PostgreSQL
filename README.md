# DB_PostgreSQL

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

Deno-based DB.js for handling PostgreSQL.

## Features
- Operation of PostgreSQL database
- Transaction management
- Simple CRUD operations
- Automatic generation of table definitions

## Requirements
- Deno
- PostgreSQL

## Usage

Install PostgreSQL (Mac):

```
brew install postgresql
brew services start postgresql
psql postgres
create user postgres SUPERUSER;
exit
```

Create tables (existing table data will be dropped):

```
psql -U postgres -f create_tables.sql
```

Run the API server:

```
sh run.sh
```

## License
MIT License