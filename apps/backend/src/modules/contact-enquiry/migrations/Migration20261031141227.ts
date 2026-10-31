import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261031141227 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "contact_enquiry_message" ("id" text not null, "enquiry_id" text not null, "request_id" text not null, "direction" text check ("direction" in ('inbound', 'outbound')) not null default 'outbound', "subject" text not null, "body" text not null, "recipient_email" text not null, "sender_email" text not null, "sent_by_user_id" text null, "sent_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "contact_enquiry_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_MESSAGE_ENQUIRY_ID" ON "contact_enquiry_message" ("enquiry_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_contact_enquiry_message_deleted_at" ON "contact_enquiry_message" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_CONTACT_ENQUIRY_MESSAGE_REQUEST_ID_UNIQUE" ON "contact_enquiry_message" ("request_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_enquiry_message" cascade;`);
  }

}
