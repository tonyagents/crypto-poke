import { Router, type Request, type Response } from 'express';
import { processMessage } from '../services/claude.js';
import { sendMessage, type InboundMessage } from '../services/sendblue.js';

const router = Router();

// GET /webhook/sendblue — verification ping from Sendblue
router.get('/sendblue', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// POST /webhook/sendblue — incoming iMessages from Sendblue
router.post('/sendblue', async (req: Request, res: Response) => {
  // Acknowledge immediately so Sendblue doesn't retry
  res.status(200).json({ ok: true });

  console.log('[webhook] Raw payload:', JSON.stringify(req.body).slice(0, 300));

  const body = req.body as InboundMessage;
  const phone = body.from_number;
  const content = body.content?.trim();

  if (!phone || !content) {
    console.log('[webhook] Skipping — missing phone or content');
    return;
  }

  // Ignore outbound messages (Sendblue echoes them back)
  if ((body as any).is_outbound) {
    console.log('[webhook] Skipping — outbound echo');
    return;
  }

  console.log(`[webhook] Message from ${phone.slice(-4)}: ${content.slice(0, 80)}`);

  try {
    const reply = await processMessage(phone, content);
    await sendMessage(phone, reply);
  } catch (err: any) {
    console.error('[webhook] Error processing message:', err.message);
    try {
      await sendMessage(phone, "Something went wrong on my end. Try again in a moment.");
    } catch { /* ignore */ }
  }
});

// POST /chat — local dev test endpoint (no Sendblue needed)
// curl -X POST http://localhost:3000/chat \
//   -H "Content-Type: application/json" \
//   -d '{"message": "what are my wallets", "phone": "+15550000001"}'
router.post('/chat', async (req: Request, res: Response) => {
  const { message, phone = '+15550000001' } = req.body as { message: string; phone?: string };
  if (!message) return void res.status(400).json({ error: 'message required' });

  try {
    const reply = await processMessage(phone, message);
    res.json({ reply, phone });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /webhook/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ts: Date.now() });
});

export default router;
