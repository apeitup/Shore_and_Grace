import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261027143155 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "gift_order_details" ("id" text not null, "cart_id" text not null, "order_id" text null, "recipient_type" text check ("recipient_type" in ('self', 'other')) not null default 'other', "recipient_first_name" text null, "recipient_last_name" text null, "recipient_phone" text null, "purchaser_first_name" text null, "purchaser_last_name" text null, "purchaser_phone" text null, "purchaser_email" text null, "gift_message" text null, "delivery_instructions" text null, "leave_safe" boolean not null default false, "hide_prices" boolean not null default true, "anonymous_sender" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gift_order_details_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_GIFT_ORDER_DETAILS_CART_ID" ON "gift_order_details" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gift_order_details_deleted_at" ON "gift_order_details" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_GIFT_ORDER_DETAILS_CART_UNIQUE" ON "gift_order_details" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_GIFT_ORDER_DETAILS_ORDER_ID" ON "gift_order_details" ("order_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "gift_order_details" cascade;`);
  }

}
