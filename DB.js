import { Client } from "https://deno.land/x/postgres/mod.ts";

const chki = (n) => {
  const m = parseInt(n);
  if (isNaN(m) || m != n) {
    throw new Error("chki " + n);
  }
  return n;
};
const chks = (s) => {
  if (s.indexOf("'") >= 0 || s.indexOf('"') >= 0) {
    throw new Error("chks " + s)
  }
  return s;
};
const escape = (s) => {
  if (s == null) {
    s = "";
  } else if (typeof s == "object") {
    s = s.toString();
  }
  if (typeof s == "string") {
    s = s.replace(/'/g, "''");
    //s = s.replace(/\n/g, "\\n");
    return s;
  } else if (typeof s == "boolean") {
    return s == true;
  } else if (typeof s == "bigint") {
    return s;
  } else if (typeof s == "number") {
    return parseFloat(s);
  }
  throw new Error("undefined value: " + s + " " + typeof s);
  //return s;
};
const dquote = (s) => {
  const n = s.indexOf(".");
  if (n < 0) {
    return `"${s}"`;
  }
  return s.substring(0, n + 1) + `"${s.substring(n + 1)}"`;
};
const getNames = (obj) => {
  return Object.keys(obj).map(s => chks(s)).map(s => dquote(s));
};

const selectSchema = async (tr, tbl) => {
  const res = await tr.queryArray(`select * from ${dquote(tbl)} limit 0`);
  return res.rowDescription.columns.map(m => m.name);
};

const select = async (tr, tbl, req, columns = null) => {
  const cols = columns ? columns.join(", ") : "*";
  const res = await tr.queryArray(`select ${cols} from ${dquote(tbl)}` + makeWhere(req));
  //console.log(res);
  const rcolumns = res.rowDescription.columns;
  const rows = res.rows;
  const res2 = [];
  for (let i = 0; i < rows.length; i++) {
    const d = {};
    const row = rows[i];
    for (let j = 0; j < rcolumns.length; j++) {
      d[rcolumns[j].name] = row[j];
    }
    res2.push(d);
  }
  return res2;
};

const selectOne = async (tr, tbl, req, columns = null) => {
  const cols = columns ? columns.join(", ") : "*";
  const query = `select ${cols} from ${dquote(tbl)}` + makeWhere(req) + " limit 1";
  //console.log(query);
  const res = await tr.queryArray(query);
  const rcolumns = res.rowDescription.columns;
  const rows = res.rows;
  if (rows.length == 0) {
    return null;
  }
  const d = {};
  const row = rows[0];
  for (let j = 0; j < rcolumns.length; j++) {
    d[rcolumns[j].name] = row[j];
  }
  return d;
};
const selectColumns = async (tr, tbl, name, cond) => {
  const query = `select ${name} from ${dquote(tbl)}` + makeWhere(cond);
  //console.log(query);
  const res = await tr.queryArray(query);
  const columns = res.rowDescription.columns;
  const rows = res.rows;
  const res2 = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    res2.push(row[0]);
  }
  return res2;
};

const insert = async (tr, tbl, set) => {
  const values = Object.values(set).map(s => escape(s));
  const names = getNames(set);
  const query = `insert into ${dquote(tbl)} (${names.join(", ")}) values (${values.map(v => `'${v}'`).join(", ")})`;
  //console.log(query);
  const res = await tr.queryArray(query);
  //console.log("res", res);
  return res;
};

const makeWhere = (req) => {
  if (!req) {
    return "";
  }
  const names = Object.keys(req).map(s => chks(s));
  const ands = names.map(n => {
    return req[n] != "null" ? `"${n}"='${escape(req[n])}'` : `${n} IS NULL`
  }).join(" and ");
  return " where " + ands;
};

class DB {
  constructor() {
  }
  async init(opts) { // useserial: true -> addWithID
    this.opts = opts;
    this.client = new Client({
      user: opts.user || "postgres",
      database: opts.database || "sample",
      hostname: opts.host || "localhost",
      port: opts.port || 5432,
    });
    await this.client.connect();
    return this;
  }
  async close() {
    await this.client.end();
  }
  async transaction() {
    const t = Math.random();
    const tr = this.client.createTransaction("tr" + t);
    await tr.begin();
    return tr;
  }

  async add(tbl, req) {
    if (Array.isArray(req)) {
      for (const r of req) {
        await insert(this.client, tbl, r);
      }
    } else {
      await insert(this.client, tbl, req);
    }
    return true;
  }
  async addWithID(tbl, idname, req) {
    if (!this.opts.useserial) {
      //const tr = await this.transaction();
      const tr = this.client; // 仮
      //console.log("tr", tr)

      const query = `select max("${idname}") from ${dquote(tbl)};`;
      if (this.debug) {
        console.log(query);
      }
      const idres = await tr.queryArray(query);
      if (!idres) {
        return false;
      }
      let id = 1;
      if (idres && idres.rows && idres.rows[0] && idres.rows[0][0]) {
        id = idres.rows[0][0] + 1;
      }
      req[idname] = id;
      await insert(tr, tbl, req);
      //await tr.commit();
      return true;
    } else {
      await insert(this.client, tbl, req);
      return true;
    }
  }
  async list(tbl, req, columns = null) {
    return await select(this.client, tbl, req, columns);
  }
  async get(tbl, req, columns = null) {
    return await selectOne(this.client, tbl, req, columns);
  }
  async del(tbl, cond) {
    if (!cond) {
      throw new Error("no cond");
    }
    const res = await this.client.queryArray(`delete from ${dquote(tbl)} ${makeWhere(cond)}`);
    //console.log(res);
    return res;
  }
  async clear(tbl) {
    const res = await this.client.queryArray(`delete from ${dquote(tbl)}`);
    //console.log(res);
    return res;
  }
  async edit(tbl, cond, req) {
    if (!cond) {
      throw new Error("no cond");
    }
    const updates = [];
    for (const name in req) {
      const s = `${chks(name)}='${escape(req[name])}'`;
      updates.push(s);
    }
    //console.log(updates, req);
    const query = `update ${dquote(tbl)} set ${updates.join(", ")} ${makeWhere(cond)}`;
    //console.log(query);
    const res = await this.client.queryArray(query);
    //console.log(res);
    return res;
  }
  async dropTable(tbl) {
    try {
      return await this.client.queryArray(`drop table ${dquote(tbl)}`);
    } catch (e) {
    }
  }
  async createTable(tbl, columns) {
    const schema = columns.map(c => Object.values(c).join(" ")).join(", ");
    const query = `create table ${tbl.trim()} (${schema})`;
    //console.log("query", query);
    const res = await this._queryArray(query);
    return res;
  }
  async _queryArray(query) {
    if (this.debug) {
      console.log("query:", query);
    }
    return await this.client.queryArray(query);
  }
  async listTable() {
    //return await this.client.queryArray(`select tablename from pg_catalog.pg_tables where schemaname != 'pg_catalog' and schemaname != 'information_schema'`);
    return await selectColumns(this.client, "pg_catalog.pg_tables", "tablename", { schemaname: "public" });
  }
  async getTableSchema(tbl) {
    //return await this.client.queryArray(`select tablename from pg_catalog.pg_tables where schemaname != 'pg_catalog' and schemaname != 'information_schema'`);
    return await selectSchema(this.client, tbl);
  }
};

export { DB };
