import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261027143146 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "blocked_delivery_date" ("id" text not null, "date" text not null, "fulfillment_type" text check ("fulfillment_type" in ('delivery', 'collection', 'all')) not null default 'all', "reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blocked_delivery_date_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_BLOCKED_DELIVERY_DATE" ON "blocked_delivery_date" ("date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blocked_delivery_date_deleted_at" ON "blocked_delivery_date" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "delivery_reservation" ("id" text not null, "cart_id" text not null, "order_id" text null, "zone_id" text not null, "zone_name" text not null, "fulfillment_type" text check ("fulfillment_type" in ('delivery', 'collection')) not null, "postcode" text null, "delivery_date" text not null, "delivery_window" text null, "shipping_option_id" text null, "fee" integer not null default 0, "currency_code" text not null default 'gbp', "status" text check ("status" in ('held', 'confirmed', 'cancelled')) not null default 'held', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_reservation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_DELIVERY_RESERVATION_CART_ID" ON "delivery_reservation" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_DELIVERY_RESERVATION_DATE" ON "delivery_reservation" ("delivery_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_reservation_deleted_at" ON "delivery_reservation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_DELIVERY_RESERVATION_CART_UNIQUE" ON "delivery_reservation" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_DELIVERY_RESERVATION_ORDER_ID" ON "delivery_reservation" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "delivery_zone" ("id" text not null, "name" text not null, "fulfillment_type" text check ("fulfillment_type" in ('delivery', 'collection')) not null default 'delivery', "postcode_patterns" jsonb not null default '{"values":[]}', "shipping_option_id" text null, "currency_code" text not null default 'gbp', "fee" integer not null default 0, "minimum_lead_days" integer not null default 1, "same_day_cutoff" text null, "daily_capacity" integer not null default 20, "allowed_weekdays" jsonb not null default '{"values":[1,2,3,4,5,6]}', "delivery_window" text null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_zone_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_zone_deleted_at" ON "delivery_zone" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blocked_delivery_date" cascade;`);

    this.addSql(`drop table if exists "delivery_reservation" cascade;`);

    this.addSql(`drop table if exists "delivery_zone" cascade;`);
  }

}
