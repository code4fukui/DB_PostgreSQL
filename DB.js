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
  if (typeof s == "object") {
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
  } else if (s == undefined) {
    return "null";
  }
  throw new Error("undefined value: " + s + " " + typeof s);
  //return s;
};


const select = async (tr, tbl, req) => {
  const res = await tr.queryArray(`select * from ${tbl}` + makeWhere(req));
  const columns = res.rowDescription.columns;
  const rows = res.rows;
  const res2 = [];
  for (let i = 0; i < rows.length; i++) {
    const d = {};
    const row = rows[i];
    for (let j = 0; j < columns.length; j++) {
      d[columns[j].name] = row[j];
    }
    res2.push(d);
  }
  return res2;
};

const selectOne = async (tr, tbl, req) => {
  const res = await tr.queryArray(`select * from ${tbl}` + makeWhere(req) + " limit 1");
  const columns = res.rowDescription.columns;
  const rows = res.rows;
  const res2 = [];
  for (let i = 0; i < rows.length; i++) {
    const d = {};
    const row = rows[i];
    for (let j = 0; j < columns.length; j++) {
      d[columns[j].name] = row[j];
    }
    res2.push(d);
  }
  return res2[0];
};

const insert = async (tr, tbl, set) => {
  const values = Object.values(set).map(s => escape(s));
  const names = Object.keys(set).map(s => chks(s));
  const query = `insert into ${tbl} (${names.join(", ")}) values (${values.map(v => `'${v}'`).join(", ")})`;
  console.log(query);
  const res = await tr.queryArray(query);
  //console.log("res", res);
  return res;
};

const makeWhere = (req) => {
  if (!req) {
    return "";
  }
  const values = Object.values(req).map(s => escape(s));
  const names = Object.keys(req).map(s => chks(s));
  const ands = names.map(n => `${n}='${escape(req[n])}'`).join(" and ");
  return " where " + ands;
};

class DB {
  constructor() {
  }
  async init(opts) {
    this.client = new Client({
      user: opts.user || "postgres",
      database: opts.database || "sample",
      hostname: opts.localhost || "localhost",
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
  }
  async addWithID(tbl, idname, req) {
    const tr = await this.transaction();
    const query = `select max(${idname}) from ${tbl}`;
    const idres = await tr.queryArray(query);
    const id = idres.rows[0][0];
    req[idname] = id + 1;
    await insert(tr, tbl, req);
    await tr.commit();
  }
  async list(tbl, req) {
    return await select(this.client, tbl, req);
  }
  async get(tbl, req) {
    return await selectOne(this.client, tbl, req);
  }
  async del(tbl, cond) {
    if (!cond) {
      throw new Error("no cond");
    }
    const res = await this.client.queryArray(`delete from ${tbl} ${makeWhere(cond)}`);
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
    const sql = `update ${tbl} set ${updates.join(", ")} ${makeWhere(cond)}`;
    //console.log(sql);
    const res = await this.client.queryArray(sql);
    //console.log(res);
    return res;
  }
  async dropTable(tbl) {
    try {
      return await this.client.queryArray(`drop table ${tbl}`);
    } catch (e) {
    }
  }
  async createTable(tbl, columns) {
    const keys = Object.keys(columns);
    const query = `create table ${tbl} (${columns.map(c => Object.values(c).join(" ")).join(", ")})`;
    console.log(query);
    const res = await this.client.queryArray(query);
    return res;
  }
};

export { DB };
