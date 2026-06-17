#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiKey = process.env.MOONPAY_API_KEY;
const env = (process.env.MOONPAY_ENV || "production").toLowerCase();
const baseUrl =
  env === "sandbox" ? "https://buy-sandbox.moonpay.com" : "https://buy.moonpay.com";

const server = new McpServer({
  name: "moonpay",
  version: "0.1.0",
});

server.registerTool(
  "buy_crypto",
  {
    description:
      "Generate a MoonPay buy checkout URL. Use when the user wants to buy crypto with fiat (USD, EUR, GBP, etc.). Returns a URL the user opens in their browser to complete the purchase with card or bank transfer. MoonPay handles KYC, payment, and delivery to the user's wallet.",
    inputSchema: {
      asset: z
        .string()
        .describe(
          "Crypto asset symbol to buy, lowercase (e.g. 'eth', 'btc', 'sol', 'usdc', 'usdt', 'matic')."
        ),
      amount: z
        .number()
        .positive()
        .describe("Fiat amount to spend (e.g. 100 for $100)."),
      fiat_currency: z
        .string()
        .default("usd")
        .describe("Fiat currency code, lowercase (default 'usd'). Examples: 'usd', 'eur', 'gbp'."),
      wallet_address: z
        .string()
        .optional()
        .describe(
          "Optional destination wallet address. If omitted, the user enters one on the MoonPay checkout page."
        ),
    },
  },
  async ({ asset, amount, fiat_currency, wallet_address }) => {
    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "MoonPay API key is not configured. Set MOONPAY_API_KEY via `gemini extensions configure moonpay` or get one at https://dashboard.moonpay.com/developers.",
          },
        ],
        isError: true,
      };
    }

    const params = new URLSearchParams({
      apiKey,
      currencyCode: asset.toLowerCase(),
      baseCurrencyCode: fiat_currency.toLowerCase(),
      baseCurrencyAmount: String(amount),
    });
    if (wallet_address) params.set("walletAddress", wallet_address);

    const url = `${baseUrl}/?${params.toString()}`;

    return {
      content: [
        {
          type: "text",
          text: [
            `MoonPay checkout ready for ${amount} ${fiat_currency.toUpperCase()} → ${asset.toUpperCase()}.`,
            "",
            `Open this URL to complete the purchase:`,
            url,
            "",
            wallet_address
              ? `Crypto will be delivered to: ${wallet_address}`
              : "The user will enter a destination wallet address on MoonPay.",
          ].join("\n"),
        },
      ],
    };
  }
);

server.registerTool(
  "list_supported_assets",
  {
    description:
      "List the most commonly supported crypto assets available to buy via MoonPay. Use when the user asks what they can buy.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: [
          "Commonly supported MoonPay assets:",
          "- BTC (Bitcoin)",
          "- ETH (Ethereum)",
          "- SOL (Solana)",
          "- USDC (USD Coin, on ETH/SOL/Polygon/Base)",
          "- USDT (Tether)",
          "- MATIC / POL (Polygon)",
          "- AVAX (Avalanche)",
          "- ADA (Cardano)",
          "- DOGE (Dogecoin)",
          "- XRP (Ripple)",
          "",
          "MoonPay supports 100+ assets. For a full list see https://www.moonpay.com/supported-currencies.",
        ].join("\n"),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
