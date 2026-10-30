import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261030030404 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "newsletter_subscription" drop constraint if exists "newsletter_subscription_email_unique";`);
    this.addSql(`create table if not exists "newsletter_subscription" ("id" text not null, "email" text not null, "status" text check ("status" in ('pending', 'subscribed', 'unsubscribed')) not null default 'pending', "confirmation_token_hash" text null, "confirmation_expires_at" timestamptz null, "confirmed_at" timestamptz null, "unsubscribed_at" timestamptz null, "consent_source" text not null default 'storefront_footer', "consented_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "newsletter_subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_newsletter_subscription_email_unique" ON "newsletter_subscription" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_NEWSLETTER_SUBSCRIPTION_EMAIL" ON "newsletter_subscription" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_NEWSLETTER_CONFIRMATION_TOKEN_HASH" ON "newsletter_subscription" ("confirmation_token_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_subscription_deleted_at" ON "newsletter_subscription" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "newsletter_subscription" cascade;`);
  }

}
