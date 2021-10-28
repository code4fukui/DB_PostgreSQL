import { DB } from "../../DB.js";

const db = await new DB().init({ database: "sample1" });

const tables = await db.listTable();
console.log(tables);

for (const tbl of tables) {
  const list = await db.getTableSchema(tbl);
  console.log(list);
}

await db.close();
