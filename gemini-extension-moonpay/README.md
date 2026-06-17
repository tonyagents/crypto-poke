# MoonPay for Gemini CLI

Buy crypto with fiat from inside Gemini CLI. Ask Gemini to buy any supported asset and a MoonPay checkout opens in your browser.

```
> buy me $100 of ETH

Sure — here is your MoonPay checkout for $100 → ETH:
https://buy.moonpay.com/?apiKey=pk_live_...&currencyCode=eth&baseCurrencyAmount=100&baseCurrencyCode=usd
```

## Install

```bash
gemini extensions install https://github.com/moonpay/gemini-extension
```

On first use, Gemini will prompt for:

- **MOONPAY_API_KEY** — your MoonPay publishable key (`pk_live_...` or `pk_test_...`). Get one at [dashboard.moonpay.com/developers](https://dashboard.moonpay.com/developers).
- **MOONPAY_ENV** — optional, set to `sandbox` to use `buy-sandbox.moonpay.com` for testing.

## Tools provided

- **`buy_crypto`** — Generate a MoonPay checkout URL for a given asset, fiat amount, and optional wallet address.
- **`list_supported_assets`** — List commonly supported assets.

## What this extension does NOT do

This is a *deep-link generator*. It does not custody funds, sign transactions, or read your wallet. All payment, KYC, and crypto delivery happen on moonpay.com.

If you need full wallet, swap, and on-chain operations, install the [MoonPay MCP server](https://www.npmjs.com/package/@moonpay/cli) directly:

```bash
npm i -g @moonpay/cli && mp login --email you@example.com
claude mcp add moonpay -- mp mcp
```

## Local development

```bash
git clone https://github.com/moonpay/gemini-extension
cd gemini-extension
npm install
gemini extensions link .
```

Then iterate on `src/server.js` and re-link.

## License

MIT
