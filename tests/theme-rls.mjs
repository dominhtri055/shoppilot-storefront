import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
const owner = "00000000-0000-0000-0000-000000000001";
const other = "00000000-0000-0000-0000-000000000002";
await db.exec(`create role anon; create role authenticated; create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated;
create table public.profiles(id uuid primary key,store_slug text,is_store_published boolean);
insert into public.profiles values ('${owner}','my-store',true),('${other}','other-store',false);`);
await db.exec(
  await readFile(
    new URL(
      "../supabase/migrations/008_storefront_customization.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
await db.exec(`set role authenticated; set request.jwt.claim.sub = '${owner}';
insert into public.storefront_themes(merchant_id,draft,published) values ('${owner}','{"heading":"draft"}','{"heading":"live"}');`);
await db.exec(`set request.jwt.claim.sub = '${other}';`);
assert.equal(
  (await db.query("select * from public.storefront_themes")).rows.length,
  0,
);
assert.equal(
  (
    await db.query(
      `update public.storefront_themes set draft='{}' where merchant_id='${owner}' returning *`,
    )
  ).rows.length,
  0,
);
await assert.rejects(
  db.exec(
    `insert into public.storefront_themes(merchant_id) values ('${owner}')`,
  ),
);
await db.exec(`insert into public.storefront_themes(merchant_id,draft,published) values ('${other}','{}','{"heading":"hidden"}');
set role anon;`);
await assert.rejects(db.query("select draft from public.storefront_themes"));
assert.equal(
  (await db.query("select public.get_public_store_theme('my-store') as theme"))
    .rows[0].theme.heading,
  "live",
);
assert.equal(
  (
    await db.query(
      "select public.get_public_store_theme('other-store') as theme",
    )
  ).rows[0].theme,
  null,
);
await db.exec(
  `set role authenticated; set request.jwt.claim.sub = '${owner}'; update public.storefront_themes set draft='{"heading":"new draft"}' where merchant_id='${owner}'; set role anon;`,
);
assert.equal(
  (await db.query("select public.get_public_store_theme('my-store') as theme"))
    .rows[0].theme.heading,
  "live",
);
console.log(
  "PASS: owner isolation, cross-owner write rejection, private drafts, unpublished store privacy, and draft/published separation.",
);
await db.close();
