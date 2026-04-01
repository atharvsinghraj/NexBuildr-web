// /api/ai.js — NexBuildr Groq AI backend
// Place at: /api/ai.js in Vercel project root

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[NexAI] GROQ_API_KEY missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let messages;
  try {
    messages = req.body?.messages;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Clean messages — remove empty, fix roles
  const validRoles = ['user', 'assistant', 'system'];
  const clean = messages
    .filter(m => m && validRoles.includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.trim() }));

  if (clean.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided' });
  }

  // Ensure conversation starts with user role (Groq requirement)
  if (clean[0].role !== 'user' && clean[0].role !== 'system') {
    return res.status(400).json({ error: 'First message must be from user' });
  }

  const systemPrompt = {
    role: 'system',
    content: `You are Nex AI, the intelligent startup assistant for NexBuildr — India's startup community platform for students and young entrepreneurs. 
Help founders with: startup idea validation, business models, MVP planning, pitch decks, funding strategy (Angel/Seed/Series A), finding co-founders, growth hacking, Indian startup ecosystem (Startup India, DPIIT, grants).
Be concise, direct, practical. Use bullet points for lists. Max 250 words per response. Sound like a sharp startup mentor.`
  };

  const finalMessages = [systemPrompt, ...clean];

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: finalMessages,
    max_tokens: 512,
    temperature: 0.7,
    stream: false,
  };

  console.log('[NexAI] Request → model:', payload.model, '| messages:', clean.length, '| last:', clean[clean.length-1].content.substring(0, 50));

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await groqResponse.text();
    console.log('[NexAI] Groq status:', groqResponse.status);

    if (!groqResponse.ok) {
      console.error('[NexAI] Groq error:', groqResponse.status, rawText.substring(0, 300));
      let detail = rawText;
      try { detail = JSON.parse(rawText)?.error?.message || rawText; } catch (_) {}
      return res.status(502).json({
        error: `AI service error (${groqResponse.status}). Try again.`,
        detail,
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error('[NexAI] Parse error:', rawText.substring(0, 200));
      return res.status(502).json({ error: 'Invalid response from AI service' });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error('[NexAI] Empty reply:', JSON.stringify(data).substring(0, 200));
      return res.status(502).json({ error: 'AI returned empty response. Try again.' });
    }

    console.log('[NexAI] Reply OK → chars:', reply.length);
    return res.status(200).json({ reply, model: payload.model });

  } catch (err) {
    console.error('[NexAI] Network error:', err.message);
    return res.status(500).json({ error: 'Failed to reach AI service. Check server logs.' });
  }
  }
    
