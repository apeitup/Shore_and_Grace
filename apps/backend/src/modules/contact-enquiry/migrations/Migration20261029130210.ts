import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261029130210 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "contact_enquiry" ("id" text not null, "reference" text not null, "name" text not null, "email" text not null, "phone" text null, "order_reference" text null, "category" text check ("category" in ('order', 'delivery', 'returns', 'products', 'services', 'privacy', 'other')) not null, "message" text not null, "status" text check ("status" in ('new', 'in_progress', 'resolved', 'spam')) not null default 'new', "internal_notes" text null, "resolved_at" text null, "retained_until" text not null, "privacy_notice_version" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "contact_enquiry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_REFERENCE" ON "contact_enquiry" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_EMAIL" ON "contact_enquiry" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_RETAINED_UNTIL" ON "contact_enquiry" ("retained_until") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_contact_enquiry_deleted_at" ON "contact_enquiry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_REFERENCE_UNIQUE" ON "contact_enquiry" ("reference") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_enquiry" cascade;`);
  }

}
