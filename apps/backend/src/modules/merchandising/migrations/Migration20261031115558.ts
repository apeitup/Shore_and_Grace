import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261031115558 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "merchandising_item" ("id" text not null, "set_id" text not null, "product_id" text not null, "position" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "merchandising_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_MERCHANDISING_ITEM_SET_ID" ON "merchandising_item" ("set_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_MERCHANDISING_ITEM_PRODUCT_ID" ON "merchandising_item" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchandising_item_deleted_at" ON "merchandising_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_MERCHANDISING_ITEM_SET_PRODUCT_UNIQUE" ON "merchandising_item" ("set_id", "product_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "merchandising_set" ("id" text not null, "name" text not null, "handle" text not null, "kind" text check ("kind" in ('featured', 'upsell', 'complementary', 'frequently_bought_together')) not null, "source_product_id" text null, "strategy" text check ("strategy" in ('manual', 'automatic')) not null default 'manual', "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "merchandising_set_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_MERCHANDISING_SET_HANDLE" ON "merchandising_set" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_merchandising_set_deleted_at" ON "merchandising_set" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_MERCHANDISING_SET_HANDLE_UNIQUE" ON "merchandising_set" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_MERCHANDISING_SET_SOURCE_PRODUCT_ID" ON "merchandising_set" ("source_product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "merchandising_item" cascade;`);

    this.addSql(`drop table if exists "merchandising_set" cascade;`);
  }

}
