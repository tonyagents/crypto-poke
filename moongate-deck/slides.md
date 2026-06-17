---
theme: default
colorSchema: dark
title: Moongate → Arc
class: text-center
transition: slide-left
fonts:
  sans: Inter
  mono: Fira Code
drawings:
  persist: false
---

<style>
.slidev-layout { background: #080808 !important; }
h1, h2, h3 { letter-spacing: -0.025em !important; }
.eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: 'Fira Code', monospace;
  opacity: 0.7;
}
.card-glow-green { box-shadow: 0 0 0 1px rgba(34,197,94,0.2), 0 8px 32px rgba(34,197,94,0.06); }
.card-glow-yellow { box-shadow: 0 0 0 1px rgba(234,179,8,0.2), 0 8px 32px rgba(234,179,8,0.06); }
.card-glow-purple { box-shadow: 0 0 0 1px rgba(168,85,247,0.2), 0 8px 32px rgba(168,85,247,0.06); }
</style>

<!-- 1: Cover -->
<div class="flex flex-col items-center justify-center h-full gap-5 relative">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05]" style="background: radial-gradient(circle, #22c55e 0%, transparent 70%)"></div>
  </div>
  <div class="eyebrow text-green-400">Rebrand & Repositioning · April 2026</div>
  <div class="flex items-center gap-6">
    <span class="text-7xl font-black text-gray-600" style="letter-spacing:-0.04em">Moongate</span>
    <span class="text-5xl text-gray-600">→</span>
    <span class="text-7xl font-black text-white" style="letter-spacing:-0.04em">Arc</span>
  </div>
  <p class="text-xl text-gray-500 max-w-lg leading-relaxed mt-2">From social wallet to<br/><span class="text-white font-semibold">agentic wealth platform</span></p>
  <div class="mt-6 px-4 py-2 rounded-full border border-gray-800 text-xs text-gray-600 font-mono">Powered by MoonX Infrastructure</div>
</div>

---
title: What We Keep
---

<!-- 2: What We Keep from Moongate -->
<div class="flex flex-col h-full justify-center gap-4">
  <div class="text-left">
    <div class="eyebrow text-gray-500 mb-2">The Foundation</div>
    <h2 class="text-4xl font-bold text-white">What carries over from Moongate.</h2>
    <p class="text-gray-500 text-sm mt-1">The rebrand isn't starting from zero — these assets are the moat.</p>
  </div>
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-gray-950 rounded-2xl p-5 text-left border border-gray-900">
      <div class="w-6 h-6 rounded-md bg-gray-700 mb-3"></div>
      <div class="text-white font-bold mb-1">Wallet Infrastructure</div>
      <div class="text-gray-500 text-sm leading-relaxed">The wallet stack, account layer, and widget surface are production-ready and carry directly into Arc. No rebuild needed.</div>
    </div>
    <div class="bg-gray-950 rounded-2xl p-5 text-left border border-gray-900">
      <div class="w-6 h-6 rounded-md mb-3" style="background:rgba(234,179,8,0.7)"></div>
      <div class="text-white font-bold mb-1">MoonPay Rails</div>
      <div class="text-gray-500 text-sm leading-relaxed">Fiat on-ramp, cross-chain swaps, and Apple Pay checkout — one tap, any asset. Already embedded.</div>
    </div>
    <div class="bg-gray-950 rounded-2xl p-5 text-left border border-gray-900">
      <div class="w-6 h-6 rounded-md mb-3" style="background:rgba(34,197,94,0.7)"></div>
      <div class="text-white font-bold mb-1">250K Users</div>
      <div class="text-gray-500 text-sm leading-relaxed">250K existing users ready to re-engage on day one. The distribution moat is already built.</div>
    </div>
    <div class="bg-gray-950 rounded-2xl p-5 text-left border border-gray-900">
      <div class="w-6 h-6 rounded-md mb-3" style="background:rgba(168,85,247,0.7)"></div>
      <div class="text-white font-bold mb-1">Brand Equity</div>
      <div class="text-gray-500 text-sm leading-relaxed">Moongate's community, social presence, and MoonPay relationship. Arc inherits the trust; adds the vision.</div>
    </div>
  </div>
</div>

---
layout: two-cols
title: Arc · MoonPay Infrastructure
---

<!-- 3: MoonPay checkout - what carries over -->
<div class="h-full flex items-center justify-center">
  <img src="/s5.png" class="rounded-2xl shadow-2xl" style="max-height:88%; width:auto; object-fit:contain" />
</div>

::right::

<div class="pl-10 flex flex-col justify-center h-full">
  <div class="eyebrow text-yellow-400 mb-3">Carries Over from Moongate</div>
  <h2 class="text-4xl font-bold text-white mb-5 leading-tight">One-Tap.<br/>Any Asset.</h2>
  <p class="text-gray-400 text-sm mb-7 leading-relaxed">MoonPay's payment rails are already embedded. Fiat → on-chain basket in a single checkout. No rebuild needed.</p>
  <div class="space-y-4 text-sm">
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
      <span class="text-gray-300">Apple Pay, Google Pay, card — native</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
      <span class="text-gray-300">Sign in with Apple, Google, or wallet</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
      <span class="text-gray-300">Cross-chain swaps via MoonPay infra</span>
    </div>
  </div>
</div>

---
title: Phase 1
---

<!-- Phase 1 divider -->
<div class="flex flex-col h-full justify-center gap-6">
  <div class="eyebrow text-green-400 mb-2">The Plan</div>
  <div class="flex items-baseline gap-8">
    <span class="font-black text-white" style="font-size:8rem;letter-spacing:-0.05em;opacity:0.1;line-height:1">01</span>
    <div>
      <h2 class="text-5xl font-black text-white" style="letter-spacing:-0.04em">Rebrand &<br/>Immediate Wins</h2>
      <p class="text-gray-500 text-base mt-3">Weeks 1–6 · Non-agentic · Ship fast, build trust</p>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-3 mt-2">
    <div class="rounded-xl p-4 text-left" style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.15)">
      <div class="text-green-400 font-semibold text-sm mb-1">Cross-Chain Integration</div>
      <div class="text-gray-500 text-xs">MoonPay rails. Low LOE, high unlock.</div>
    </div>
    <div class="rounded-xl p-4 text-left" style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.15)">
      <div class="text-green-400 font-semibold text-sm mb-1">Baskets + Prediction Markets</div>
      <div class="text-gray-500 text-xs">Narrative positions across asset types.</div>
    </div>
    <div class="rounded-xl p-4 text-left" style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.15)">
      <div class="text-green-400 font-semibold text-sm mb-1">250K Re-engagement</div>
      <div class="text-gray-500 text-xs">Email campaign. Day-one user activation.</div>
    </div>
  </div>
</div>

---
title: Arc · Discover
---

<!-- Arc Discover -->
<img src="/s1.png" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0" />
<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.92) 0%,rgba(8,8,8,0.1) 60%,transparent 100%);z-index:1"></div>
<div style="position:absolute;bottom:2rem;left:2.5rem;right:2.5rem;z-index:2">
  <div class="eyebrow text-green-400 mb-2">Phase 1 · Arc · Discover</div>
  <h2 class="text-3xl font-bold text-white mb-2">Invest in the narrative.</h2>
  <p class="text-gray-400 text-sm max-w-2xl">Curated baskets built around top market narratives — one tap to invest in a theme.</p>
</div>

---
layout: two-cols
title: Arc · Baskets
---

<!-- Arc Baskets -->
<div class="h-full flex items-center overflow-hidden">
  <img src="/s2.png" class="rounded-2xl shadow-2xl" style="width:100%; height:100%; object-fit:cover; object-position:top" />
</div>

::right::

<div class="pl-10 flex flex-col justify-center h-full">
  <div class="eyebrow text-green-400 mb-3">Phase 1 · Arc · Baskets</div>
  <h2 class="text-4xl font-bold text-white mb-5 leading-tight">Narrative-Driven<br/>Baskets</h2>
  <p class="text-gray-400 text-sm mb-7 leading-relaxed">xStocks, tokens, and prediction markets unified in a single position. Auto-rebalances on macro events.</p>
  <div class="bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm">
    <div class="flex justify-between mb-2">
      <span class="text-gray-500">Made in America</span>
      <span class="text-green-400 font-bold">+139.93%</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-500">AI Infrastructure</span>
      <span class="text-green-400 font-bold">+142%</span>
    </div>
    <div class="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">Rebalances on macro events · Min $20 USDC</div>
  </div>
</div>

---
layout: two-cols
title: Arc · Prediction Markets
---

<!-- Prediction Markets + Cross-Chain -->
<div class="h-full flex flex-col justify-center pl-2">
  <div class="eyebrow text-green-400 mb-3">Arc · Cross-Chain &amp; Markets</div>
  <h2 class="text-4xl font-bold text-white mb-5 leading-tight">Beyond tokens.<br/>Beyond one chain.</h2>
  <p class="text-gray-400 text-sm mb-7 leading-relaxed">Arc unifies xStocks, tokens, perps, and prediction markets across chains — all in one basket. MoonPay rails handle the routing.</p>
  <div class="space-y-4 text-sm">
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
      <span class="text-gray-300">Cross-chain swaps via MoonPay infrastructure</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
      <span class="text-gray-300">Prediction markets + perps in every basket</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></span>
      <span class="text-gray-300">xStocks + crypto unified — no chain silos</span>
    </div>
  </div>
</div>

::right::

<div class="h-full flex flex-col justify-center gap-4 pl-6">
  <div class="bg-gray-950 rounded-2xl p-6 border border-gray-900 card-glow-green">
    <div class="text-green-400 font-mono text-xs mb-2 eyebrow">One-Tap · Any Asset</div>
    <div class="text-white font-bold text-lg mb-1">MoonPay Checkout</div>
    <div class="text-gray-500 text-sm">Fiat → on-chain basket in a single checkout. Apple Pay, Google Pay, card — native.</div>
  </div>
  <div class="bg-gray-950 rounded-2xl p-6 border border-gray-900 card-glow-yellow">
    <div class="text-yellow-400 font-mono text-xs mb-2 eyebrow">Phase 1 Priority</div>
    <div class="text-white font-bold text-lg mb-1">Cross-Chain Integration</div>
    <div class="text-gray-500 text-sm">MoonPay bridges &amp; swaps across chains. Lowest LOE, highest unlock — ships week 3–4.</div>
  </div>
  <div class="bg-gray-950 rounded-2xl p-6 border border-gray-900 card-glow-purple">
    <div class="text-purple-400 font-mono text-xs mb-2 eyebrow">Phase 1 Priority</div>
    <div class="text-white font-bold text-lg mb-1">Prediction Markets</div>
    <div class="text-gray-500 text-sm">High-leverage event exposure built into baskets. Ships alongside perps in Phase 1.</div>
  </div>
</div>

---
title: Where Arc Wins
---

<!-- 8: Combined competitor slide with thumbnails -->
<div class="flex flex-col h-full justify-center">
  <div class="eyebrow text-gray-500 mb-2 text-left">Competitive Landscape</div>
  <h2 class="text-4xl font-bold text-white mb-7 text-left">Where Arc wins.</h2>

  <div class="space-y-3">
    <div class="flex gap-5 items-center p-4 rounded-2xl bg-gray-950 border border-gray-900">
      <img src="/comp2.png" class="rounded-lg flex-shrink-0" style="width:120px; height:72px; object-fit:cover; object-position:top" />
      <div class="flex-shrink-0 w-28">
        <div class="font-bold text-white">Cesto</div>
        <div class="text-xs text-gray-600 mt-0.5">Crypto-native</div>
      </div>
      <div class="text-xs text-gray-400 flex-1">Narrative basket earn product. Static allocations, Jupiter routing. No fiat, no agent.</div>
      <div class="text-xs text-green-400 flex-1">Agentic rebalancing, cron-jobs, alt assets (xStocks + Perps), MoonPay fiat checkout.</div>
    </div>
    <div class="flex gap-5 items-center p-4 rounded-2xl bg-gray-950 border border-gray-900">
      <img src="/comp3.png" class="rounded-lg flex-shrink-0" style="width:120px; height:72px; object-fit:cover; object-position:top" />
      <div class="flex-shrink-0 w-28">
        <div class="font-bold text-white">JoinAutoPilot</div>
        <div class="text-xs text-gray-600 mt-0.5">TradFi-native</div>
      </div>
      <div class="text-xs text-gray-400 flex-1">Expert portfolio copying. Brokerage-dependent, no on-chain assets or perps.</div>
      <div class="text-xs text-green-400 flex-1">Crypto-native rails, MoonPay checkout, 250K existing distribution, no brokerage friction.</div>
    </div>
  </div>

  <div class="mt-6 flex gap-6 text-xs text-gray-600">
    <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>MoonPay infrastructure moat</div>
    <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>250K existing user base</div>
    <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>Agentic intelligence layer</div>
  </div>
</div>

---
title: 4–6 Week Gameplan
---

<!-- 10: Gameplan -->
<div class="flex flex-col h-full justify-center">
  <div class="eyebrow text-gray-500 mb-2 text-left">Execution</div>
  <h2 class="text-4xl font-bold text-white mb-6 text-left">Two-Phase Gameplan.</h2>
  <div class="grid grid-cols-2 gap-6">
    <div class="bg-gray-950 rounded-2xl p-6 border border-gray-900">
      <div class="eyebrow text-green-400 mb-1">Bucket 1 · Weeks 1–6</div>
      <div class="font-bold text-white text-xl mb-4">Rebrand &amp; Immediate Wins</div>
      <ul class="text-sm text-gray-500 space-y-3">
        <li class="flex gap-2 items-start"><span class="text-green-400 flex-shrink-0">→</span>Rebrand Moongate → Arc: new logo, visual identity, narrative</li>
        <li class="flex gap-2 items-start"><span class="text-green-400 flex-shrink-0">→</span>Re-engagement campaign to 250K existing users</li>
        <li class="flex gap-2 items-start"><span class="text-green-400 flex-shrink-0">→</span>Deploy MoonPay cross-chain infra + sandbox testing (Raydium)</li>
        <li class="flex gap-2 items-start"><span class="text-green-400 flex-shrink-0">→</span>Baskets MVP + Perps &amp; Prediction Markets</li>
      </ul>
    </div>
    <div class="bg-gray-950 rounded-2xl p-6 border border-gray-900">
      <div class="eyebrow text-purple-400 mb-1">Bucket 2 · Month 2+</div>
      <div class="font-bold text-white text-xl mb-4">Agentic Identity</div>
      <ul class="text-sm text-gray-500 space-y-3">
        <li class="flex gap-2 items-start"><span class="text-purple-400 flex-shrink-0">→</span>Agent Co-Pilot MVP: NLP purchasing + research</li>
        <li class="flex gap-2 items-start"><span class="text-purple-400 flex-shrink-0">→</span>Agentic rebalancing on market conditions</li>
        <li class="flex gap-2 items-start"><span class="text-purple-400 flex-shrink-0">→</span>Refine NLP from real trading behavior</li>
      </ul>
      <div class="mt-4 pt-4 border-t border-gray-800 rounded-xl p-3" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.15)">
        <div class="text-xs text-purple-400 font-semibold mb-1">LLM Cost Hypothesis</div>
        <div class="text-xs text-gray-500">Credit system funded by Treasury wallet — users acquire Arc Credits to pay for agent token usage. Aligned with Dawn credit model.</div>
      </div>
    </div>
  </div>
</div>

---
title: Phase 2
---

<!-- Phase 2 divider -->
<div class="flex flex-col h-full justify-center gap-6">
  <div class="eyebrow text-purple-400 mb-2">The Vision</div>
  <div class="flex items-baseline gap-8">
    <span class="font-black text-white" style="font-size:8rem;letter-spacing:-0.05em;opacity:0.1;line-height:1">02</span>
    <div>
      <h2 class="text-5xl font-black text-white" style="letter-spacing:-0.04em">Agentic<br/>Identity</h2>
      <p class="text-gray-500 text-base mt-3">Month 2+ · The full Arc vision · One agent, infinite assets</p>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-3 mt-2">
    <div class="rounded-xl p-4 text-left" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.15)">
      <div class="text-purple-400 font-semibold text-sm mb-1">Agent Co-Pilot</div>
      <div class="text-gray-500 text-xs">24/7 research, signals, and rebalancing.</div>
    </div>
    <div class="rounded-xl p-4 text-left" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.15)">
      <div class="text-purple-400 font-semibold text-sm mb-1">Natural Language</div>
      <div class="text-gray-500 text-xs">Text-to-basket in seconds.</div>
    </div>
    <div class="rounded-xl p-4 text-left" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.15)">
      <div class="text-purple-400 font-semibold text-sm mb-1">Agentic Rebalancing</div>
      <div class="text-gray-500 text-xs">Auto-adjusts on market conditions 24/7.</div>
    </div>
  </div>
</div>

---
layout: two-cols
title: Arc · Agent
---

<!-- Arc Agent -->
<div class="h-full flex items-center overflow-hidden">
  <img src="/s3.png" class="rounded-2xl shadow-2xl" style="width:100%; height:100%; object-fit:cover; object-position:top" />
</div>

::right::

<div class="pl-10 flex flex-col justify-center h-full">
  <div class="eyebrow text-purple-400 mb-3">Phase 2 · Arc · Agent Co-Pilot</div>
  <h2 class="text-4xl font-bold text-white mb-5 leading-tight">Always-On<br/>Intelligence</h2>
  <p class="text-gray-400 text-sm mb-7 leading-relaxed">The agent monitors 24/7 — news, filings, on-chain data, macro signals — and dynamically curates baskets of xStocks, tokens, prediction markets, and perps.</p>
  <div class="space-y-4 text-sm">
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
      <span class="text-gray-300">Live basket rebalancing signals</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
      <span class="text-gray-300">Earnings & macro event detection</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></span>
      <span class="text-gray-300">Prediction market integration</span>
    </div>
  </div>
</div>

---
title: Arc · Natural Language
---

<!-- Arc NL Basket Builder -->
<img src="/s4.png" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:0" />
<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,8,8,0.85) 0%,transparent 40%);z-index:1"></div>
<div style="position:absolute;top:2rem;left:50%;transform:translateX(-50%);text-align:center;white-space:nowrap;z-index:2">
  <div class="eyebrow text-yellow-400 mb-2">Phase 2 · Arc · Natural Language</div>
  <p class="text-white text-lg font-semibold">"I think defense spending surges for 3 years"</p>
  <p class="text-gray-400 text-sm mt-1">→ Custom Defense Play assembled in seconds · Est. <span style="color:#4ade80;font-weight:600">+65.3%</span> annual</p>
</div>

---
title: Distribution Strategy
---

<!-- Distribution: How users find Arc -->
<div style="display:flex;flex-direction:column;height:100%;justify-content:center;gap:2rem;padding:0">
  <div>
    <div class="eyebrow text-green-400" style="margin-bottom:0.75rem">Phase 2 · Distribution Strategy</div>
    <h2 style="font-size:3rem;font-weight:900;color:white;margin:0;letter-spacing:-0.04em">How users find Arc.</h2>
  </div>
  <div style="display:grid;grid-template-columns:1fr 2rem 1fr 2rem 1fr;gap:1rem;align-items:center">
    <div style="background:#030712;border:1px solid #1f2937;border-radius:1rem;padding:1.5rem;display:flex;flex-direction:column;justify-content:space-between;height:15rem">
      <div style="display:flex;gap:0.5rem">
        <div style="background:#10b981;color:white;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:9999px">GPT</div>
        <div style="background:#0ea5e9;color:white;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:9999px">PPX</div>
      </div>
      <div>
        <div style="color:#374151;font-family:monospace;font-size:0.7rem;margin-bottom:0.4rem">01</div>
        <div style="color:white;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem">Build thesis</div>
        <div style="color:#6b7280;font-size:0.8rem">Type your market thesis into GPT or Perplexity.</div>
      </div>
    </div>
    <div style="color:#22c55e;font-size:1.5rem;text-align:center">→</div>
    <div style="background:#111a11;border:1px solid rgba(34,197,94,0.25);border-radius:1rem;padding:1.5rem;display:flex;flex-direction:column;justify-content:space-between;height:15rem">
      <div style="font-family:monospace;color:#22c55e;font-size:0.7rem;padding:0.4rem 0.75rem;background:#030712;border-radius:0.5rem;text-align:center">arc://basket?thesis=...</div>
      <div>
        <div style="color:#374151;font-family:monospace;font-size:0.7rem;margin-bottom:0.4rem">02</div>
        <div style="color:white;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem">Deep link to Arc</div>
        <div style="color:#6b7280;font-size:0.8rem">One tap. Thesis handed off. App opens pre-loaded.</div>
      </div>
    </div>
    <div style="color:#22c55e;font-size:1.5rem;text-align:center">→</div>
    <div style="background:#0a160a;border:1px solid rgba(34,197,94,0.3);border-radius:1rem;padding:1.5rem;display:flex;flex-direction:column;justify-content:space-between;height:15rem;box-shadow:0 0 0 1px rgba(34,197,94,0.2),0 8px 32px rgba(34,197,94,0.06)">
      <div style="font-size:1.5rem">⚡</div>
      <div>
        <div style="color:#374151;font-family:monospace;font-size:0.7rem;margin-bottom:0.4rem">03</div>
        <div style="color:white;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem">Arc builds your basket</div>
        <div style="color:#6b7280;font-size:0.8rem">Pre-curated basket loads instantly. One tap to invest via Apple Pay.</div>
      </div>
    </div>
  </div>
</div>

---
title: Feature Roadmap
---

<!-- Feature Roadmap -->
<div class="flex flex-col h-full justify-center">
  <div class="eyebrow text-gray-500 mb-2 text-left">Full Picture</div>
  <h2 class="text-4xl font-bold text-white mb-5 text-left">Feature roadmap.</h2>
  <div class="grid grid-cols-2 gap-5">
    <div>
      <div class="eyebrow text-green-400 mb-3">Phase 1 · Rebrand &amp; Infrastructure</div>
      <div class="space-y-2">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">1</span>
          <span class="font-semibold text-white text-sm flex-1">Cross-Chain Integration</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-900">Low</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">2</span>
          <span class="font-semibold text-white text-sm flex-1">Perps &amp; Prediction Markets</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-900">Medium</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">3</span>
          <span class="font-semibold text-white text-sm flex-1">Baskets of Investments</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900">High</span>
        </div>
      </div>
    </div>
    <div>
      <div class="eyebrow text-purple-400 mb-3">Phase 2 · Agentic Identity</div>
      <div class="space-y-2">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">4</span>
          <span class="font-semibold text-white text-sm flex-1">Natural Language Purchasing</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-yellow-950 text-yellow-400 border border-yellow-900">Low–Med</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">5</span>
          <span class="font-semibold text-white text-sm flex-1">Agent Co-Pilot</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-900">Medium</span>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-900">
          <span class="text-gray-700 font-mono text-xs w-4">6</span>
          <span class="font-semibold text-white text-sm flex-1">Agentic Rebalancing</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-900">High</span>
        </div>
      </div>
    </div>
  </div>
</div>

---
title: The Opportunity
---

<!-- 11: Close -->
<div class="flex flex-col items-center justify-center h-full gap-6 relative">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #22c55e 0%, transparent 70%)"></div>
  </div>
  <div class="eyebrow text-green-400">The Opportunity</div>
  <h2 class="text-6xl font-black text-white leading-tight" style="letter-spacing:-0.04em">
    250,000 users.<br/>
    One agent.<br/>
    <span class="text-green-400">Infinite assets.</span>
  </h2>
  <p class="text-gray-600 max-w-lg text-sm leading-relaxed mt-2">
    Arc is the consumer face of MoonPay's infrastructure —<br/>
    built for the next generation of on-chain wealth management.
  </p>
  <div class="mt-4 px-4 py-2 rounded-full border border-gray-800 text-xs text-gray-700 font-mono">arc · Powered by MoonX Infrastructure</div>
</div>
