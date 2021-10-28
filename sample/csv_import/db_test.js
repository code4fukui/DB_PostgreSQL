import { DB } from "../../DB.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

const db = await new DB().init({ database: "sample3" });

await db.dropTable("test1");

// type: etc) date, integer, jsonb
await db.createTable("test1", [
  { name: "name", type: "character varying(30)" },
  { name: "cnt", type: "integer", opt: "not null" },
  { name: "data", type: "jsonb" },
]);

const data = CSV.toJSON(await CSV.fetch("test.csv"))
console.log(data);

await db.add("test1", data);

console.log(await db.list("test1"));

await db.close();
