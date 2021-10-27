import * as t from "https://deno.land/std/testing/asserts.ts";
import { BBS } from "./BBS.js";
import { hash } from "https://js.sabae.cc/hash.js";

Deno.test("regist", async () => {
  const res1 = await BBS.regist({ name: "test1", password: hash("abc") });
  console.log(res1);
  t.assert(res1);
});

Deno.test("add", async () => {
  const session = await BBS.regist({ name: "test1", password: hash("abc") });
  const res = await BBS.add({ name: "test1", session, body: "test" });
  console.log(res);
});

Deno.test("list", async () => {
  const list = await BBS.list();
  console.log(list);
  t.assert(list.length > 0);
});

Deno.test("can't login", async () => {
  const res1 = await BBS.regist({ name: "test1", password: hash("def") });
  t.assert(res1 == null);
});
