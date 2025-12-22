export const PLANS = {
  lite: {
    id: "lite",
    name: "Lite",
    limits: { employees: 5, locations: 1 },
    overageCost: { employee: 2.0, location: 15.0 },
    stripe: {
      productId: "prod_TbqZyZRTyIdeP0",
      monthly: "price_1Secsh4ofjjgqRAvwg1M4ScO",
      yearly: "price_1SectZ4ofjjgqRAv7rbbkf0M",
      usage: {
        employee: "price_1SedRc4ofjjgqRAvfOLMcIgL",
        location: "price_1SedZj4ofjjgqRAvPVWXlJUQ",
      },
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    limits: { employees: 10, locations: 3 },
    overageCost: { employee: 2.5, location: 10.0 },
    stripe: {
      productId: "prod_TbqnZ07aIQTIWU",
      monthly: "price_1Sed5b4ofjjgqRAvBv9IASJ0",
      yearly: "price_1Sed8X4ofjjgqRAv6W23Ywk3",
      usage: {
        employee: "price_1SedSc4ofjjgqRAvEMxn3PIU",
        location: "price_1SedZj4ofjjgqRAvvcvZZ2rv",
      },
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    limits: { employees: 50, locations: 10 },
    overageCost: { employee: 1.5, location: 5.0 },
    stripe: {
      monthly: "price_1SedD44ofjjgqRAvcrJA5JLN",
      yearly: "price_1SedDV4ofjjgqRAvE15heEjN",
      usage: {
        employee: "price_1SedTQ4ofjjgqRAvlk6NhaOh",
        location: "price_1SedZj4ofjjgqRAvz4xtOfib",
      },
    },
  },
  scale: {
    id: "scale",
    name: "Scale",
    limits: { employees: 100, locations: 20 },
    overageCost: { employee: 1.0, location: 2.5 },
    stripe: {
      monthly: "price_1SedEf4ofjjgqRAvMwJJYgOO",
      yearly: "price_1SedF84ofjjgqRAvDUrn35cj",
      usage: {
        employee: "price_1SedTm4ofjjgqRAvExQL4Jh8",
        location: "price_1SedZj4ofjjgqRAv5jZd92ex",
      },
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
