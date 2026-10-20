import promotions from "../mock-data/promotions.json";
import z from "zod";
import { tool } from "langchain";

export const getRegionalPromotionsTool = tool(
  (input) => {
    const foundRegion = promotions.find((item) => item.region === input.region);
    if (foundRegion) {
      return {
        found: true,
        region: foundRegion.region,
        discountPercent: foundRegion.discountPercent,
        upgradeOption: foundRegion.upgradeOption,
      };
    } else {
      return {
        found: false,
      };
    }
  },
  {
    name: "get_regional_promotions",
    description: "looks up a promotion based on the region",
    schema: z.object({
      region: z.string(),
    }),
  },
);
