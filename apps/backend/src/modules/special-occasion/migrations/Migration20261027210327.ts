import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261027210327 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "customer_occasion" ("id" text not null, "customer_id" text not null, "system_occasion_id" text null, "name" text not null, "occasion_date" text null, "reminder_days" integer not null default 14, "enabled" boolean not null default true, "repeats_annually" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_occasion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CUSTOMER_OCCASION_CUSTOMER_ID" ON "customer_occasion" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_occasion_deleted_at" ON "customer_occasion" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CUSTOMER_OCCASION_SYSTEM_ID" ON "customer_occasion" ("system_occasion_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "system_occasion" ("id" text not null, "name" text not null, "slug" text not null, "date_type" text check ("date_type" in ('fixed', 'easter', 'mothering_sunday', 'fathers_day')) not null, "month" integer null, "day" integer null, "default_reminder_days" integer not null default 14, "enabled_by_default" boolean not null default false, "active" boolean not null default true, "description" text null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "system_occasion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_SYSTEM_OCCASION_SLUG" ON "system_occasion" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_system_occasion_deleted_at" ON "system_occasion" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_SYSTEM_OCCASION_SLUG_UNIQUE" ON "system_occasion" ("slug") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_occasion" cascade;`);

    this.addSql(`drop table if exists "system_occasion" cascade;`);
  }

}
