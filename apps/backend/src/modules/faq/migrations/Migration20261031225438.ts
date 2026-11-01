import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261031225438 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "faq_category" ("id" text not null, "name" text not null, "handle" text not null, "description" text null, "position" integer not null default 0, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "faq_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_FAQ_CATEGORY_HANDLE" ON "faq_category" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_faq_category_deleted_at" ON "faq_category" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_FAQ_CATEGORY_HANDLE_UNIQUE" ON "faq_category" ("handle") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "faq_question" ("id" text not null, "category_id" text not null, "question" text not null, "answer" text not null, "position" integer not null default 0, "published" boolean not null default false, "featured" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "faq_question_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_FAQ_QUESTION_CATEGORY_ID" ON "faq_question" ("category_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_faq_question_deleted_at" ON "faq_question" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_FAQ_QUESTION_CATEGORY_POSITION" ON "faq_question" ("category_id", "position") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "faq_category" cascade;`);

    this.addSql(`drop table if exists "faq_question" cascade;`);
  }

}
