import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  updateProductVariantsWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies";

export default async function configureUkMarket({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "metadata"],
  });
  const region = regions[0];

  if (!region) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No region found. Run the initial data seed first."
    );
  }

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: {
        name: "United Kingdom",
        currency_code: "gbp",
        countries: ["gb"],
        is_tax_inclusive: true,
        metadata: {
          ...DEFAULT_REGION_STORE_POLICIES,
          ...(region.metadata ?? {}),
        },
      },
    },
  });

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id"],
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: stores[0].id },
      update: {
        name: "Shore & Grace",
        supported_currencies: [
          { currency_code: "gbp", is_default: true, is_tax_inclusive: true },
        ],
        default_region_id: region.id,
      },
    },
  });

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id"],
  });

  if (variants.length) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: variants.map(({ id }) => ({
          id,
          prices: [{ currency_code: "gbp", amount: 15 }],
        })),
      },
    });
  }

  logger.info(
    `Configured Shore & Grace for the UK with GBP pricing on ${variants.length} demo variants.`,
  );
}
