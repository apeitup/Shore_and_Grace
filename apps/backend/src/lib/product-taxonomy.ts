export type ProductCategoryDefinition = {
  name: string
  handle: string
  description: string
  productTypes: string[]
  tags: string[]
  children?: ProductCategoryDefinition[]
}

export const shopCategoryStructure: ProductCategoryDefinition[] = [
  {
    name: "Fresh Flowers",
    handle: "fresh-flowers",
    description:
      "Season-led fresh flowers, gathered and arranged in the natural Shore & Grace style.",
    productTypes: [
      "Hand-tied bouquets",
      "Vase arrangements",
      "Seasonal designs",
      "Florist's choice arrangements",
    ],
    tags: ["Fresh", "Seasonal", "Hand-tied", "Vase Arrangement"],
    children: [
      {
        name: "Hand-tied Bouquets",
        handle: "hand-tied-bouquets",
        description:
          "Fresh, hand-tied bouquets ready to unwrap, arrange and enjoy.",
        productTypes: ["Gift bouquets", "Presentation bouquets"],
        tags: ["Fresh", "Hand-tied", "Gift-ready"],
      },
      {
        name: "Vase Arrangements",
        handle: "vase-arrangements",
        description:
          "Complete fresh-flower arrangements designed and delivered in a vase.",
        productTypes: ["Vase arrangements", "Table arrangements"],
        tags: ["Fresh", "Vase Arrangement", "Ready to Display"],
      },
      {
        name: "Seasonal Flowers",
        handle: "seasonal-flowers",
        description:
          "Designs that celebrate the flowers, foliage and colours of the current season.",
        productTypes: ["Seasonal bouquets", "Limited seasonal arrangements"],
        tags: ["Fresh", "Seasonal", "Limited Edition"],
      },
      {
        name: "Florist's Choice",
        handle: "florists-choice",
        description:
          "A one-of-a-kind arrangement created from the finest flowers available that day.",
        productTypes: ["Florist's choice bouquets", "Bespoke arrangements"],
        tags: ["Fresh", "Florist's Choice", "One of a Kind"],
      },
    ],
  },
  {
    name: "Faux Flowers",
    handle: "faux-flowers",
    description:
      "Lifelike faux flowers and everlasting arrangements designed for lasting beauty.",
    productTypes: [
      "Faux bouquets",
      "Faux arrangements",
      "Individual stems",
      "Wreaths and seasonal decor",
    ],
    tags: ["Faux", "Everlasting", "Low Maintenance", "Ready to Display"],
    children: [
      {
        name: "Faux Bouquets",
        handle: "faux-bouquets",
        description:
          "Lifelike hand-gathered bouquets that can be styled again and again.",
        productTypes: ["Faux hand-tied bouquets", "Gift bouquets"],
        tags: ["Faux", "Everlasting", "Hand-tied"],
      },
      {
        name: "Faux Arrangements",
        handle: "faux-arrangements",
        description:
          "Complete everlasting arrangements created for effortless display.",
        productTypes: ["Vase arrangements", "Table arrangements"],
        tags: ["Faux", "Everlasting", "Ready to Display"],
      },
      {
        name: "Faux Stems",
        handle: "faux-stems",
        description:
          "Individual faux stems and foliage for creating a personal arrangement.",
        productTypes: ["Flower stems", "Foliage stems", "Stem bundles"],
        tags: ["Faux", "Stems", "Build Your Own"],
      },
      {
        name: "Wreaths & Seasonal Decor",
        handle: "wreaths-seasonal-decor",
        description:
          "Everlasting wreaths and decorative pieces created for the changing seasons.",
        productTypes: ["Door wreaths", "Table wreaths", "Seasonal decor"],
        tags: ["Faux", "Wreath", "Seasonal", "Everlasting"],
      },
    ],
  },
  {
    name: "Gifts",
    handle: "gifts",
    description:
      "Thoughtful floral gifts and finishing touches chosen for meaningful moments.",
    productTypes: [
      "Floral gifts",
      "Vases and planters",
      "Home fragrance",
      "Gift cards",
    ],
    tags: ["Gift-ready", "Thoughtful Gift", "Home", "Add-on"],
    children: [
      {
        name: "Floral Gifts",
        handle: "floral-gifts",
        description:
          "Flower-led gifts and small botanical pieces made for giving.",
        productTypes: ["Mini arrangements", "Botanical gifts", "Gift sets"],
        tags: ["Floral Gift", "Gift-ready", "Botanical"],
      },
      {
        name: "Vases & Planters",
        handle: "vases-planters",
        description:
          "Vases and planters selected to complement fresh and everlasting flowers.",
        productTypes: ["Vases", "Planters", "Decorative vessels"],
        tags: ["Vase", "Planter", "Home"],
      },
      {
        name: "Home Fragrance",
        handle: "home-fragrance",
        description:
          "Candles and home fragrance selected to bring atmosphere to a space.",
        productTypes: ["Candles", "Diffusers", "Room fragrance"],
        tags: ["Home Fragrance", "Candle", "Home"],
      },
      {
        name: "Gift Cards",
        handle: "gift-cards",
        description:
          "Shore & Grace gift cards for flowers, gifts and thoughtful choices.",
        productTypes: ["Digital gift cards", "Printed gift cards"],
        tags: ["Gift Card", "Gift-ready"],
      },
    ],
  },
  {
    name: "Sympathy & Remembrance",
    handle: "sympathy-remembrance",
    description:
      "Flowers for comfort, remembrance and farewell, created with sensitivity and care.",
    productTypes: [
      "Sympathy bouquets",
      "Funeral tributes",
      "Wreaths",
      "Casket sprays",
      "Sheaves and sprays",
      "Memorial flowers",
    ],
    tags: ["Sympathy", "Remembrance", "Funeral", "Made with Care"],
    children: [
      {
        name: "Sympathy Bouquets",
        handle: "sympathy-bouquets",
        description:
          "Gentle bouquets sent to offer comfort and let someone know they are in your thoughts.",
        productTypes: ["Hand-tied sympathy bouquets", "Vase arrangements"],
        tags: ["Sympathy", "Hand-tied", "Gift-ready"],
      },
      {
        name: "Funeral Tributes",
        handle: "funeral-tributes",
        description:
          "Personal floral tributes designed to reflect a life, memory or relationship.",
        productTypes: ["Named tributes", "Personal tributes", "Tribute shapes"],
        tags: ["Funeral", "Remembrance", "Bespoke"],
      },
      {
        name: "Wreaths",
        handle: "sympathy-wreaths",
        description:
          "Traditional and contemporary wreaths created for funerals and memorials.",
        productTypes: ["Funeral wreaths", "Memorial wreaths"],
        tags: ["Funeral", "Remembrance", "Wreath"],
      },
      {
        name: "Casket Sprays",
        handle: "casket-sprays",
        description:
          "Casket sprays made to order with thoughtful flowers, colours and details.",
        productTypes: ["Full casket sprays", "Half casket sprays"],
        tags: ["Funeral", "Casket Spray", "Bespoke"],
      },
      {
        name: "Sheaves & Sprays",
        handle: "sheaves-sprays",
        description:
          "Hand-tied sheaves and floral sprays for a natural, personal farewell.",
        productTypes: ["Tied sheaves", "Funeral sprays"],
        tags: ["Funeral", "Sheaf", "Spray"],
      },
      {
        name: "Memorial Flowers",
        handle: "memorial-flowers",
        description:
          "Flowers for anniversaries, memorials and quiet moments of remembrance.",
        productTypes: ["Memorial arrangements", "Graveside flowers"],
        tags: ["Memorial", "Remembrance", "Made with Care"],
      },
    ],
  },
  {
    name: "Shop by Occasion",
    handle: "shop-by-occasion",
    description:
      "Find flowers and gifts chosen for celebrations, thoughtful gestures and everyday moments.",
    productTypes: ["Flowers by occasion", "Gifts by occasion"],
    tags: ["Occasion", "Gift-ready", "Celebration"],
    children: [
      {
        name: "Birthday",
        handle: "birthday",
        description: "Joyful flowers and gifts chosen to make a birthday feel special.",
        productTypes: ["Birthday bouquets", "Birthday gifts"],
        tags: ["Birthday", "Celebration", "Gift-ready"],
      },
      {
        name: "Anniversary",
        handle: "anniversary",
        description:
          "Romantic flowers and thoughtful gifts for celebrating time together.",
        productTypes: ["Anniversary bouquets", "Romantic arrangements"],
        tags: ["Anniversary", "Romantic", "Gift-ready"],
      },
      {
        name: "Thank You",
        handle: "thank-you",
        description: "Flowers and gifts that say thank you beautifully.",
        productTypes: ["Thank-you bouquets", "Thank-you gifts"],
        tags: ["Thank You", "Gift-ready", "Thoughtful Gift"],
      },
      {
        name: "Congratulations",
        handle: "congratulations",
        description:
          "Bright flowers and gifts for achievements, new beginnings and happy news.",
        productTypes: ["Celebration bouquets", "Congratulations gifts"],
        tags: ["Congratulations", "Celebration", "Bright"],
      },
      {
        name: "New Baby",
        handle: "new-baby",
        description:
          "Soft, joyful flowers and gifts to welcome a new arrival.",
        productTypes: ["New baby bouquets", "New parent gifts"],
        tags: ["New Baby", "Soft Pastels", "Gift-ready"],
      },
      {
        name: "Get Well",
        handle: "get-well",
        description:
          "Uplifting flowers and thoughtful gifts sent with wishes for recovery.",
        productTypes: ["Get-well bouquets", "Comforting gifts"],
        tags: ["Get Well", "Uplifting", "Gift-ready"],
      },
      {
        name: "Just Because",
        handle: "just-because",
        description:
          "Beautiful flowers and small surprises for no reason other than thinking of someone.",
        productTypes: ["Everyday bouquets", "Thoughtful gifts"],
        tags: ["Just Because", "Thoughtful Gift", "Gift-ready"],
      },
      {
        name: "Autumn",
        handle: "autumn",
        description:
          "Rich seasonal flowers and gifts inspired by the colours and textures of autumn.",
        productTypes: ["Autumn bouquets", "Seasonal arrangements"],
        tags: ["Autumn", "Autumnal", "Seasonal"],
      },
      {
        name: "Christmas",
        handle: "christmas",
        description:
          "Festive flowers, wreaths and gifts for Christmas celebrations and winter homes.",
        productTypes: ["Christmas flowers", "Festive wreaths", "Seasonal gifts"],
        tags: ["Christmas", "Festive", "Winter"],
      },
    ],
  },
]

const merchandisingTags = [
  "Classic",
  "Contemporary",
  "Romantic",
  "Wild & Natural",
  "Minimal",
  "Luxury",
  "White & Green",
  "Soft Pastels",
  "Pink",
  "Bright",
  "Neutral",
  "Autumnal",
  "Festive",
  "Roses",
  "Lilies",
  "Foliage-led",
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "Mother's Day",
  "Valentine's Day",
  "Christmas",
  "Easter",
]

const collectCategoryTags = (
  categories: ProductCategoryDefinition[],
): string[] =>
  categories.flatMap((category) => [
    ...category.tags,
    ...collectCategoryTags(category.children ?? []),
  ])

export const shopProductTags = Array.from(
  new Set([...collectCategoryTags(shopCategoryStructure), ...merchandisingTags]),
).sort((left, right) => left.localeCompare(right))
