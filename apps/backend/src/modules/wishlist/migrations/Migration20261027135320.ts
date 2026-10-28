import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261027135320 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_WISHLIST_ITEM_CUSTOMER_PRODUCT_UNIQUE" ON "wishlist_item" ("customer_id", "product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_WISHLIST_ITEM_CUSTOMER_PRODUCT_UNIQUE";`);
  }

}
