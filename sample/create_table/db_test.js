import { DB } from "../../DB.js";

const db = await new DB().init({ database: "sample2" });

await db.dropTable("test1");

// date, integer, jsonb
await db.createTable("test1", [
  { name: "name", type: "character varying(30)" },
  { name: "cnt", type: "integer", opt: "not null" },
  { name: "data", type: "jsonb" },
]);

for (let i = 0; i < 100; i++) {
  await db.add("test1", {
    name: "test",
    cnt: i,
    data: JSON.stringify({ abc: 34, def: "xx", num: i }),
  });
}

console.log(await db.list("test1"));

await db.close();
