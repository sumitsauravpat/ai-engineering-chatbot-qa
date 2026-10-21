import { agent } from "./agent";
import fs from "fs";

export default class CustomApiProvider {
  id() {
    return "verify-account-agent";
  }

  async callApi(prompt) {
    const config = {
      configurable: { thread_id: Math.random().toString(36).substring(2) },
      context: { customer_id: undefined },
    };
    const response = await agent.invoke(
      { messages: [{ role: "user", content: prompt }] },
      config,
    );

    const calledVerifyAccount = response.messages.some((message) =>
      message.tool_calls?.some(
        (call) => call.name === "verify_account_by_phone_or_id",
      ),
    );

    fs.writeFileSync(
      "debug-output.json",
      JSON.stringify(response.messages, null, 2),
    );
    return {
      output: JSON.stringify({
        ...response.structuredResponse,
        calledVerifyAccount,
      }),
    };
  }
}
