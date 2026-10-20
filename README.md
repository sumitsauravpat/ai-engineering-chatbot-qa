# AI Engineering Chatbot QA

A hands-on project in building **and** testing an AI agent — a LangChain.js chatbot for a
fictional mobile telecom provider, with a real tool-calling flow, real memory across turns,
and (next phase) a dedicated AI-QA evaluation suite.

All data is 100% fabricated — no real company names, phone numbers, or account records appear
anywhere in this repo.

---

## Why this project exists

Most "I tried LangChain" portfolio pieces stop at a single tool and a single prompt. This one
goes further, specifically to demonstrate the **AI QA Engineer** skillset — not just building
an AI agent, but rigorously testing whether it actually behaves the way it's told to:

- **A real, realistic business flow** — identity verification before any account data is
  shared, a current-plan lookup, and a region-based promotions check — not a toy weather demo.
- **Real memory across multiple turns** — the agent must remember what it already knows
  (a verified identity, a resolved plan) across separate `invoke()` calls in the same thread.
- **A real bug, found and fixed** — the first live run exposed a genuine ordering violation
  (see "A real finding" below), which is exactly the kind of failure a human QA engineer has
  to catch — and exactly why AI testing is necessary, not optional.
- **Build and test as two separate, equally weighted halves** — the test suite (in progress)
  checks tool-call correctness, hallucination/groundedness, multi-turn consistency, and
  red-teaming — not just "does it run."

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Agent (LangChain.js)                        │
│         model: claude-sonnet-4-5 · systemPrompt · memory         │
└───────────────────────────────┬───────────────────────────────── ┘
                                 │ decides which tool to call
                 ┌───────────────┴───────────────┐
                 ▼                                ▼
┌─────────────────────────────┐   ┌─────────────────────────────────┐
│   verify_account_by_phone_   │   │   get_regional_promotions       │
│   or_id                      │   │                                 │
│   looks up a customer by     │   │   looks up available promos     │
│   phone/account number       │   │   for a verified customer's     │
│   (mock-data/customers.json) │   │   region (mock-data/promotions  │
│                               │   │   .json)                        │
└─────────────────────────────┘   └─────────────────────────────────┘
```

Every tool call is validated against a `zod` schema before it runs, and the agent's final
answer is shaped by a `responseFormat` schema — structured data out, not just a sentence.

---

## The conversation flow this agent is built to follow

1. Customer asks something (e.g., "do we have any discounts in my region?")
2. Agent must **verify identity first** — either it already knows the customer (via session
   context) or it asks for a phone/account number and calls `verify_account_by_phone_or_id`
3. Once verified, the agent can state the customer's current plan
4. If the customer wants to know about promotions, the agent calls `get_regional_promotions`
   and presents **exactly** what the tool returns — a discount, an upgrade offer with a
   multi-year bonus, or a plain "none available" if nothing exists for that region
5. The agent must never invent a promotion, discount, or plan detail that wasn't actually
   returned by a tool

---

## Running it locally

```bash
npm install
# add your own ANTHROPIC_API_KEY to a .env file (see .env.example)
npx tsx src/agent.ts
```

---

## Project structure

```
ai-engineering-chatbot-qa/
├── src/
│   ├── agent.ts                      # system prompt, responseFormat, agent assembly, test calls
│   ├── tools/
│   │   ├── verifyAccount.ts          # identity verification tool
│   │   └── getRegionalPromotions.ts  # region-based promotions lookup tool
│   └── mock-data/
│       ├── customers.json            # fabricated customer records
│       └── promotions.json           # fabricated regional promotions
├── tsconfig.json
└── package.json
```

---

## Project status

**Build half — complete and confirmed working end-to-end:**
- [x] Two tools, each with zod-validated input schemas
- [x] System prompt enforcing a real business rule (verify before anything else)
- [x] Memory across multiple conversation turns (`thread_id`)
- [x] Structured final output (`responseFormat`)
- [x] A real bug found on the first live run, root-caused, and fixed

**Test half — in progress, the actual AI-QA work:**
- [ ] `promptfoo` eval suite setup
- [ ] Tool-call correctness assertions (right tool, right arguments, right order)
- [ ] Hallucination/groundedness assertions (never state a promotion that wasn't returned)
- [ ] Multi-turn consistency assertions
- [ ] Red-teaming (can the verification rule be bypassed with an adversarial prompt?)

---

## Tech stack

**LangChain.js** — agent orchestration and tool-calling · **Claude Sonnet 4.5** (Anthropic) —
the underlying LLM · **TypeScript** + **zod** — schema-validated tool inputs and structured
output · **tsx** — direct TypeScript execution · **promptfoo** (next phase) — AI evaluation and
red-teaming
