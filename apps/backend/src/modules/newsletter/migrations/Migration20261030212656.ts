import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261030212656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "newsletter_campaign" ("id" text not null, "name" text not null, "subject" text null, "preheader" text null, "status" text check ("status" in ('draft', 'scheduled', 'sending', 'sent', 'archived')) not null default 'draft', "kind" text check ("kind" in ('newsletter', 'template')) not null default 'newsletter', "season" text null, "content" jsonb not null default '{"blocks":[]}', "html" text null, "scheduled_at" timestamptz null, "sent_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "newsletter_campaign_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_campaign_deleted_at" ON "newsletter_campaign" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "newsletter_event" ("id" text not null, "campaign_id" text not null, "subscription_id" text null, "event_type" text check ("event_type" in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'converted')) not null, "link_url" text null, "order_id" text null, "metadata" jsonb null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "newsletter_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_NEWSLETTER_EVENT_CAMPAIGN_ID" ON "newsletter_event" ("campaign_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_event_deleted_at" ON "newsletter_event" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "newsletter_campaign" cascade;`);

    this.addSql(`drop table if exists "newsletter_event" cascade;`);
  }

}
