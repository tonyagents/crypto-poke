const API_KEY = process.env.SENDBLUE_API_KEY ?? '';
const API_SECRET = process.env.SENDBLUE_API_SECRET ?? '';
const FROM_NUMBER = process.env.SENDBLUE_FROM_NUMBER ?? '';
const BASE = 'https://api.sendblue.co';

export type InboundMessage = {
  from_number: string;
  content: string;
  media_url?: string | null;
  date_sent: string;
  was_downgraded?: boolean;
  plan?: string;
};

export async function sendMessage(to: string, content: string): Promise<void> {
  // In local dev without keys, just log
  if (!API_KEY || !API_SECRET) {
    console.log(`\n[sendblue → ${to}]\n${content}\n`);
    return;
  }
  // iMessage has a ~4096 char limit — split if needed
  const chunks = splitMessage(content);
  for (const chunk of chunks) {
    const res = await fetch(`${BASE}/api/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sb-api-key-id': API_KEY,
        'sb-api-secret-key': API_SECRET,
      },
      body: JSON.stringify({ number: to, content: chunk, ...(FROM_NUMBER && { from_number: FROM_NUMBER }) }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Sendblue error ${res.status}: ${err}`);
    }
  }
}

function splitMessage(text: string, limit = 1600): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    // Split at last newline within limit
    const cutAt = remaining.lastIndexOf('\n', limit) || limit;
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
