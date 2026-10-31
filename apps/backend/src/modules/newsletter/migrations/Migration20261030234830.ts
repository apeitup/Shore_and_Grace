import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261030234830 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "newsletter_event" drop constraint if exists "newsletter_event_event_type_check";`);

    this.addSql(`alter table if exists "newsletter_event" add constraint "newsletter_event_event_type_check" check("event_type" in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'converted', 'failed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "newsletter_event" drop constraint if exists "newsletter_event_event_type_check";`);

    this.addSql(`alter table if exists "newsletter_event" add constraint "newsletter_event_event_type_check" check("event_type" in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'converted'));`);
  }

}
