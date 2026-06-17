import cron from 'node-cron';
import { recipeOps, userOps, type Recipe } from '../db/client.js';
import { mp, resolveToken } from '../services/moonpay.js';
import { sendMessage } from '../services/sendblue.js';

type ScheduledTask = {
  task: cron.ScheduledTask;
  recipeId: string;
};

const scheduled = new Map<string, ScheduledTask>();

export function startRecipeEngine() {
  console.log('[recipes] Starting engine...');
  const recipes = recipeOps.listAll();
  console.log(`[recipes] Loading ${recipes.length} active recipe(s)`);
  recipes.forEach(scheduleRecipe);
}

export function scheduleRecipe(recipe: Recipe) {
  if (scheduled.has(recipe.id)) return;

  if (!cron.validate(recipe.cron_expr)) {
    console.warn(`[recipes] Invalid cron for ${recipe.id}: ${recipe.cron_expr}`);
    return;
  }

  const task = cron.schedule(recipe.cron_expr, async () => {
    console.log(`[recipes] Running ${recipe.type} recipe: ${recipe.name}`);
    try {
      await executeRecipe(recipe);
      recipeOps.markRan(recipe.id);
    } catch (err: any) {
      console.error(`[recipes] Error in recipe ${recipe.id}:`, err.message);
      try {
        await sendMessage(recipe.phone, `Recipe "${recipe.name}" failed: ${err.message}`);
      } catch { /* ignore notification failure */ }
    }
  });

  scheduled.set(recipe.id, { task, recipeId: recipe.id });
  console.log(`[recipes] Scheduled "${recipe.name}" (${recipe.cron_expr})`);
}

export function unscheduleRecipe(recipeId: string) {
  const entry = scheduled.get(recipeId);
  if (entry) {
    entry.task.stop();
    scheduled.delete(recipeId);
  }
}

async function executeRecipe(recipe: Recipe) {
  const config = JSON.parse(recipe.config);
  const user = userOps.get(recipe.phone);

  switch (recipe.type) {
    case 'dca':
      await executeDCA(recipe, config, user);
      break;
    case 'alert':
      await executeAlert(recipe, config);
      break;
    default:
      console.log(`[recipes] Recipe type "${recipe.type}" not yet implemented`);
  }
}

// ── DCA ──────────────────────────────────────────────────────────────────────

async function executeDCA(recipe: Recipe, config: any, user: any) {
  const { token, amount_usd, wallet_name, chain } = config;

  if (!wallet_name) {
    await sendMessage(recipe.phone, `DCA "${recipe.name}": no wallet configured.`);
    return;
  }

  // Use MoonPay buy (fiat → crypto) or swap from stablecoin
  try {
    const result = mp.buy(token, amount_usd, wallet_name);
    const url = result?.checkoutUrl ?? result?.url;

    const msg = [
      `DCA triggered: "${recipe.name}"`,
      `Buying $${amount_usd} of ${token.toUpperCase()}`,
      url ? `Complete purchase: ${url}` : 'Transaction submitted.',
    ].join('\n');

    await sendMessage(recipe.phone, msg);
  } catch (err: any) {
    throw new Error(`DCA buy failed: ${err.message}`);
  }
}

// ── Price Alerts ─────────────────────────────────────────────────────────────

async function executeAlert(recipe: Recipe, config: any) {
  const { symbol, chain, condition, price: targetPrice } = config;

  const token = await resolveToken(symbol, chain);
  if (!token) {
    await sendMessage(recipe.phone, `Alert "${recipe.name}": token "${symbol}" not found.`);
    return;
  }

  const data = mp.token.retrieve(token.address, chain);
  const currentPrice = data?.marketData?.price;
  if (currentPrice == null) return;

  const triggered =
    (condition === 'above' && currentPrice >= targetPrice) ||
    (condition === 'below' && currentPrice <= targetPrice);

  if (triggered) {
    const msg = [
      `Alert: ${symbol.toUpperCase()} is ${condition} $${targetPrice.toLocaleString()}`,
      `Current price: $${currentPrice.toLocaleString()}`,
      `Recipe: "${recipe.name}"`,
    ].join('\n');

    await sendMessage(recipe.phone, msg);

    // Pause alert after firing to avoid spam — cancel and let user re-enable
    recipeOps.cancel(recipe.id, recipe.phone);
    unscheduleRecipe(recipe.id);
  }
}

// ── Register new recipe after creation ───────────────────────────────────────
// Called from tools when a recipe is created mid-conversation
export function registerNewRecipe(recipeId: string) {
  const all = recipeOps.listAll();
  const recipe = all.find(r => r.id === recipeId);
  if (recipe) scheduleRecipe(recipe);
}
