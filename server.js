/**
 * Avles — optional local mock backend (development only).
 *
 *   npm run server        → http://localhost:3001
 *
 * Endpoints mirror the workflow steps so the n8n workflow and the UI can be exercised locally:
 *   POST /api/crm/lookup          profile enrichment (step 4)
 *   POST /api/campaigns/send      simulated dispatch, never sends anything (step 7)
 *   POST /api/warehouse/audit-log simulated audit write (step 8)
 *   POST /api/ai/recommend        optional server-side LLM proxy (step 6)
 *
 * Secrets: GEMINI_API_KEY is read from the server environment (.env via --env-file-if-exists)
 * and is never sent to the browser. Without a key, /api/ai/recommend returns 503 and the UI
 * falls back to its deterministic sample recommender.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

const USER_DB = {
  demo_1001: { name: 'Lukas Weber', email: 'lukas.w@example.com', subscription: 'free', last_active_days: 8, core_actions_last_30_days: 18, goal: 'habit_building', country: 'DE' },
  demo_1002: { name: 'Sophie Martin', email: 'sophie.m@example.com', subscription: 'free', last_active_days: 14, core_actions_last_30_days: 3, goal: 'goal_tracking', country: 'FR' },
  demo_1003: { name: 'Maximilian Bauer', email: 'max.b@example.com', subscription: 'paid', last_active_days: 9, core_actions_last_30_days: 42, goal: 'skill_progress', country: 'AT' },
  demo_1004: { name: 'Elena Rossi', email: 'elena.r@example.com', subscription: 'free', last_active_days: 11, core_actions_last_30_days: 12, goal: 'routine_planning', country: 'IT' },
  demo_1005: { name: 'Jan Schneider', email: 'jan.s@example.com', subscription: 'trial', last_active_days: 7, core_actions_last_30_days: 25, goal: 'habit_building', country: 'DE' },
  demo_1006: { name: 'Clara Vogel', email: 'clara.v@example.com', subscription: 'free', last_active_days: 3, core_actions_last_30_days: 31, goal: 'goal_tracking', country: 'DE' },
};

const MAX_BODY_BYTES = 64 * 1024;

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

async function recommendWithGemini(signals) {
  const prompt = `You are a lifecycle marketing assistant for a subscription app. Using only the behavioural signals below, return ONLY a JSON object:
{"recommendation": string (4-6 words), "suggestedChannel": "Email" | "Push Notification" | "In-App Message", "rationale": string (1-2 sentences), "confidence": number (0-1), "subject": string, "body": string (2-3 sentences), "cta": string}
Signals: ${JSON.stringify(signals)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
  });
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty model response');
  return JSON.parse(text);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  let tooLarge = false;
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY_BYTES) tooLarge = true;
  });

  req.on('end', async () => {
    if (tooLarge) return sendJson(res, 413, { error: 'payload_too_large' });
    let parsed = {};
    try {
      if (body) parsed = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: 'invalid_json' });
    }
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    if (req.url?.startsWith('/api/crm/lookup')) {
      const userId = parsed.user_id ?? 'demo_1001';
      const user = USER_DB[userId];
      if (!user) return sendJson(res, 404, { error: 'user_not_found', user_id: userId });
      return sendJson(res, 200, {
        user_id: userId,
        ...user,
        preferred_channel: 'Email',
        lifecycle_status: user.last_active_days >= 7 ? 'inactive' : 'active',
        crm_synced_at: new Date().toISOString(),
      });
    }

    if (req.url?.startsWith('/api/campaigns/send')) {
      return sendJson(res, 200, {
        status: 'SIMULATED_NOT_SENT',
        dispatch_id: `dsp_${Math.floor(100000 + Math.random() * 900000)}`,
        recipient: parsed.recipient ?? 'demo-recipient@example.com',
        channel: parsed.channel ?? 'Email',
        campaign_name: parsed.campaign_name ?? 'Re-engagement',
        simulated_at: new Date().toISOString(),
      });
    }

    if (req.url?.startsWith('/api/warehouse/audit-log')) {
      return sendJson(res, 200, { audit_logged: true, table: 'avles_demo.workflow_audit', status: 'SIMULATED', logged_at: new Date().toISOString() });
    }

    if (req.url?.startsWith('/api/ai/recommend')) {
      if (!GEMINI_API_KEY) return sendJson(res, 503, { error: 'llm_not_configured' });
      try {
        return sendJson(res, 200, await recommendWithGemini(parsed));
      } catch (error) {
        console.warn('LLM proxy error:', error.message);
        return sendJson(res, 502, { error: 'llm_upstream_error' });
      }
    }

    return sendJson(res, 200, { status: 'ONLINE', service: 'Avles mock API (development only)' });
  });
});

server.listen(PORT, () => {
  console.log(`\nAvles mock API → http://localhost:${PORT}`);
  console.log('  POST /api/crm/lookup');
  console.log('  POST /api/campaigns/send        (simulated, sends nothing)');
  console.log('  POST /api/warehouse/audit-log   (simulated)');
  console.log(`  POST /api/ai/recommend          (${GEMINI_API_KEY ? `LLM proxy: ${GEMINI_MODEL}` : 'disabled — set GEMINI_API_KEY in .env'})\n`);
});
