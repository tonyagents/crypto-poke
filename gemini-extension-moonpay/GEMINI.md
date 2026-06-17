# MoonPay extension

You can help the user buy cryptocurrency with fiat (USD, EUR, GBP, etc.) using MoonPay's hosted checkout.

## When to use

Use the `buy_crypto` tool whenever the user expresses intent to buy crypto, e.g.:
- "Buy me $100 of ETH"
- "I want 50 EUR of Solana"
- "Get me some bitcoin"

Ask for the amount and asset if either is missing. The user does not need a MoonPay account ahead of time — MoonPay handles signup, KYC, payment, and delivery inside the hosted checkout.

## How to present the result

The tool returns a checkout URL. Present it to the user as a clickable link with a short summary (amount, asset, where it will be delivered). Do not paraphrase the URL — give it verbatim.

## Wallet address

If the user has a wallet address handy, pass it as `wallet_address` so MoonPay sends the crypto directly there. If not, leave it out — MoonPay will prompt the user on the checkout page.

## Supported assets

MoonPay supports 100+ assets including BTC, ETH, SOL, USDC, USDT, MATIC/POL, AVAX, ADA, DOGE, XRP. Use the `list_supported_assets` tool if the user asks what's available.

## What this extension is NOT

- It does **not** custody funds.
- It does **not** sign transactions.
- It does **not** access the user's wallet or balances.

It only generates a MoonPay checkout link. All payment, KYC, and delivery happens on moonpay.com.
