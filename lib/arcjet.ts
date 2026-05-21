import arcjet, { request, tokenBucket } from "@arcjet/next";

type RateLimitConfig = {
  refillRate: number;
  capacity: number;
  message: string;
};

const DAILY_INTERVAL_SECONDS = 86400;

const rateLimitConfigs = {
  createTransaction: {
    refillRate: 10,
    capacity: 10,
    message: "Too many transactions created. Please try again later.",
  },
  scanReceipt: {
    refillRate: 2,
    capacity: 2,
    message: "Receipt scan limit reached. Please try again later.",
  },
  chatWithKubera: {
    refillRate: 2,
    capacity: 2,
    message: "AI usage limit reached. Please try again later.",
  },
  createAccount: {
    refillRate: 3,
    capacity: 3,
    message: "Too many account actions. Please try again later.",
  },
  updateBudget: {
    refillRate: 10,
    capacity: 10,
    message: "Too many budget updates. Please try again later.",
  },
} satisfies Record<string, RateLimitConfig>;

type RateLimitAction = keyof typeof rateLimitConfigs;

function createRateLimitClient(config: RateLimitConfig) {
  return arcjet({
    key: process.env.ARCJET_KEY ?? "",
    characteristics: ["userId"] as const,
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: config.refillRate,
        interval: DAILY_INTERVAL_SECONDS,
        capacity: config.capacity,
      }),
    ],
  });
}

const clients: Record<RateLimitAction, ReturnType<typeof createRateLimitClient>> = {
  createTransaction: createRateLimitClient(rateLimitConfigs.createTransaction),
  scanReceipt: createRateLimitClient(rateLimitConfigs.scanReceipt),
  chatWithKubera: createRateLimitClient(rateLimitConfigs.chatWithKubera),
  createAccount: createRateLimitClient(rateLimitConfigs.createAccount),
  updateBudget: createRateLimitClient(rateLimitConfigs.updateBudget),
};

export async function enforceRateLimit(action: RateLimitAction, userId: string) {
  const req = await request();
  const decision = await clients[action].protect(req, {
    userId,
    requested: 1,
  });

  if (!decision.isDenied()) {
    return;
  }

  if (decision.reason.isRateLimit()) {
    const { remaining, reset } = decision.reason;

    console.error({
      code: "RATE_LIMIT_EXCEEDED",
      action,
      details: {
        remaining,
        resetInSeconds: reset,
      },
    });

    throw new Error(rateLimitConfigs[action].message);
  }

  throw new Error("Request blocked");
}
