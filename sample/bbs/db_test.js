import { DB } from "../../DB.js";
import { DateTime } from "https://js.sabae.cc/DateTime.js";

const db = await new DB().init({ database: "sample1" });

const tbl = "db_user";

await db.add(tbl, {
  name: "test",
  date: new DateTime().toString(),
  password: "pwhash",
});

console.log(await db.list(tbl));

await db.edit(tbl, { name: "test" }, {
  name: "jiro db2",
});

console.log(await db.list(tbl));

await db.del(tbl, { name: "jiro db2" });

console.log(await db.list(tbl));

await db.close();
