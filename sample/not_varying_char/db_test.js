import { DB } from "../../DB.js";

const db = await new DB().init({ database: "sample2" });

await db.dropTable("test1");

// date, integer, jsonb
await db.createTable("test1", [
  { name: "name", type: "character(10)" },
]);

await db.add("test1", { name: "test" });
const d = await db.get("test1", { name: "test" });
console.log(d);

await db.close();
