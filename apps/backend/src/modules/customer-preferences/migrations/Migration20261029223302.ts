import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261029223302 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_preference" add column if not exists "delivery_updates" boolean not null default true, add column if not exists "occasion_reminders" boolean not null default true, add column if not exists "marketing_collections" boolean not null default false, add column if not exists "marketing_offers" boolean not null default true, add column if not exists "marketing_stories" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "customer_preference" drop column if exists "delivery_updates", drop column if exists "occasion_reminders", drop column if exists "marketing_collections", drop column if exists "marketing_offers", drop column if exists "marketing_stories";`);
  }

}
