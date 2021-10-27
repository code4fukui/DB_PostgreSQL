import { DB } from "https://code4fukui.github.io/DB_PostgreSQL/DB.js";
//import { DB } from "../../DB.js";
import { DateTime } from "https://js.sabae.cc/DateTime.js";

const db = await new DB().init({ database: "sample1" });
const tbluser = "db_user";
const tblbbs = "db_bbs";

class BBS {
  static async list() {
    return await db.list(tblbbs);
  }
  static async regist(req) {
    const u = await db.get(tbluser, { name: req.name });
    if (!u) {
      req.session = Math.random();
      req.date = new DateTime().toString();
      await db.add(tbluser, req);
      return req.session;
    }
    if (u.password != req.password) {
      return null; // wrong password
    }
    return u.session;
  }
  static async add(req) {
    const u = await db.get(tbluser, { name: req.name, session: req.session });
    if (!u) {
      return "err";
    }
    delete req.session;
    req.date = new DateTime().toString();
    const res = await db.addWithID(tblbbs, "id", req);
    return "ok";
  }
};

export { BBS };
