import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261028090513 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_preference" drop constraint if exists "customer_preference_customer_id_unique";`);
    this.addSql(`create table if not exists "customer_preference" ("id" text not null, "customer_id" text not null, "personalised_recommendations" boolean not null default false, "remember_delivery_preferences" boolean not null default false, "default_delivery_instructions" text null, "leave_in_safe_place" boolean not null default false, "hide_prices" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_preference_customer_id_unique" ON "customer_preference" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CUSTOMER_PREFERENCE_CUSTOMER_ID" ON "customer_preference" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_preference_deleted_at" ON "customer_preference" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_preference" cascade;`);
  }

}
