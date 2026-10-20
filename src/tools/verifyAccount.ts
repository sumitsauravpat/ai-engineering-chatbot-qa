import customers from "../mock-data/customers.json";
import z from "zod";
import { tool } from "langchain";

export const verifyAccountTool = tool(
  (input) => {
    const foundCustomer = customers.find(
      (item) =>
        item.accountNumber === input.accountNumber ||
        item.phoneNumber === input.phoneNumber,
    );
    if (foundCustomer) {
      return {
        found: true,
        customerId: foundCustomer?.customerId,
        planName: foundCustomer.planName,
        region: foundCustomer.region,
      };
    } else {
      return {
        found: false,
      };
    }
  },
  {
    name: "verify_account_by_phone_or_id",
    description: "looks up a customer's plan info",
    schema: z.object({
      phoneNumber: z.string().optional(),
      accountNumber: z.string().optional(),
    }),
  },
);
