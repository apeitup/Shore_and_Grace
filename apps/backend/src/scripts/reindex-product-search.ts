import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

const BATCH_SIZE = 100;

export default async function reindexProductSearch({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const search = container.resolve(Modules.SEARCH);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
  });

  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    const batch = products.slice(start, start + BATCH_SIZE);

    await search.ingest({
      name: "product.updated",
      data: batch.map((product) => ({ id: product.id })),
    } as never);
  }

  logger.info(`Reindexed ${products.length} product(s).`);
}
