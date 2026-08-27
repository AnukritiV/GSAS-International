import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.ALLOWED_ORIGIN || '*';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: origin === '*' ? true : origin }));
app.use(express.json({ limit: '32kb' }));

const buckets = new Map();
function rateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;
  const max = 20;
  const recent = (buckets.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= max) return res.status(429).json({ error: 'Too many requests' });
  recent.push(now); buckets.set(key, recent); next();
}

const SYSTEM = `You are the customer-facing GSAS International AI assistant.
Your job is to understand a prospective customer's objective, ask only useful follow-up questions, recommend the correct GSAS service, and prepare a concise human handoff.

GSAS services:
1. Business Banking Consultation and Bank Account Facilitation
2. Company Formation and Business Setup Services
3. Investment and Wealth Solutions
4. High-End Life Insurance Facilitation
5. Commercial Brokerage Services
6. Specialist Advisory Connections and Structuring Guidance

Available routes:
- index.html#services for service information
- quotation.html for a formal quotation / proposal
- contact.html for general contact or human support

Official support details:
- WhatsApp / phone: +971 58 979 7465
- Email: contact@gsasintl.com

Rules:
- Be concise, professional, warm and commercially useful.
- Never claim GSAS guarantees a bank account, investment return, insurance approval, regulatory outcome, visa, license, or deal.
- Do not provide definitive legal, tax, financial, investment, insurance, or regulatory advice. Explain that a qualified representative/specialist must confirm regulated or jurisdiction-specific matters.
- Never request passwords, OTPs, bank account numbers, card numbers, government ID scans, or other highly sensitive credentials in chat.
- If the user's intent is unclear, ask one focused follow-up question rather than guessing.
- If the user wants pricing or has a defined scope, route to quotation.html.
- If they ask for a human, urgent support, phone, email, WhatsApp, or an issue outside the six services, route to contact.html.
- The handoffSummary should be a short factual summary for a GSAS representative, preserving important jurisdiction, timeline and objective details if supplied.

Return ONLY valid JSON with these keys:
reply: string
 topic: string
 route: string
 followup: string or empty string
 handoffSummary: string`;

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim().slice(0, 3000);
    const page = String(req.body?.page || '').slice(0, 100);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI backend is not configured' });

    const safeHistory = history.map(x => ({
      role: x?.role === 'assistant' ? 'assistant' : 'user',
      content: String(x?.content || '').slice(0, 1800)
    }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4',
      instructions: SYSTEM,
      input: [...safeHistory, { role:'user', content:`Current page: ${page}\nCustomer message: ${message}` }],
      max_output_tokens: 500
    });

    const text = (response.output_text || '').trim();
    let data;
    try {
      data = JSON.parse(text.replace(/^```json\s*/i,'').replace(/```$/,'').trim());
    } catch {
      data = {
        reply: text || 'I can help with that. A GSAS representative can review your requirement and advise on the next step.',
        topic: 'General Enquiry', route: 'contact.html', followup: '', handoffSummary: message
      };
    }

    const allowedRoutes = new Set(['index.html#services','quotation.html','contact.html']);
    res.json({
      reply: String(data.reply || '').slice(0, 2500),
      topic: String(data.topic || 'General Enquiry').slice(0, 180),
      route: allowedRoutes.has(data.route) ? data.route : 'contact.html',
      followup: String(data.followup || '').slice(0, 500),
      handoffSummary: String(data.handoffSummary || message).slice(0, 1800)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to process the request' });
  }
});

app.listen(port, () => console.log(`GSAS AI backend listening on port ${port}`));
