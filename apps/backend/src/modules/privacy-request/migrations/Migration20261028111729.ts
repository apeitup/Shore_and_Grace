import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261028111729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "privacy_request" ("id" text not null, "reference" text not null, "request_type" text check ("request_type" in ('access', 'correction', 'deletion', 'restriction', 'objection', 'portability')) not null, "requester_type" text check ("requester_type" in ('customer', 'gift_recipient', 'visitor')) not null, "name" text not null, "email" text not null, "phone" text null, "order_reference" text null, "details" text null, "customer_id" text null, "status" text check ("status" in ('received', 'identity_check', 'in_progress', 'completed', 'rejected')) not null default 'received', "identity_status" text check ("identity_status" in ('pending', 'verified', 'failed')) not null default 'pending', "due_at" text not null, "completed_at" text null, "internal_notes" text null, "privacy_notice_version" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "privacy_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRIVACY_REQUEST_REFERENCE" ON "privacy_request" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRIVACY_REQUEST_EMAIL" ON "privacy_request" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRIVACY_REQUEST_DUE_AT" ON "privacy_request" ("due_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_privacy_request_deleted_at" ON "privacy_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_PRIVACY_REQUEST_REFERENCE_UNIQUE" ON "privacy_request" ("reference") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "privacy_request" cascade;`);
  }

}
