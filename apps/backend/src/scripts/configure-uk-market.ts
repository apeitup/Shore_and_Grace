import { MedusaContainer } from "@medusajs/framework";
import type { RuleOperatorType } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  updateProductVariantsWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies";

type ShippingOptionWithPrices = {
  id: string;
  price_type: string;
  prices?: {
    id: string;
    currency_code: string;
    amount: number;
    price_rules?: {
      attribute: string;
      operator: RuleOperatorType;
      value: string | string[];
    }[];
  }[];
};

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

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "price_type",
      "*prices",
      "*prices.price_rules",
    ],
  });

  const pricedShippingOptions = shippingOptions as ShippingOptionWithPrices[];
  const flatShippingOptionsMissingGbp = pricedShippingOptions.filter(
    (option) =>
      option.price_type === "flat" &&
      !option.prices?.some(
        (price) =>
          price.currency_code === "gbp" && !price.price_rules?.length,
      ),
  );

  if (flatShippingOptionsMissingGbp.length) {
    await updateShippingOptionsWorkflow(container).run({
      input: flatShippingOptionsMissingGbp.map((option) => ({
        id: option.id,
        prices: [
          ...(option.prices ?? []).map((price) => ({
            id: price.id,
            currency_code: price.currency_code,
            amount: price.amount,
            rules: (price.price_rules ?? []).map((rule) => ({
              attribute: rule.attribute,
              operator: rule.operator,
              value: rule.value,
            })),
          })),
          {
            currency_code: "gbp",
            amount: 10,
          },
        ],
      })),
    });
  }

  logger.info(
    `Configured Shore & Grace for the UK with GBP pricing on ${variants.length} demo variants and ${flatShippingOptionsMissingGbp.length} shipping options.`,
  );
}
