// /api/ai.js — Vercel Serverless Function (Node.js)
// Connects to Groq API and returns AI response

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[NexAI] GROQ_API_KEY is not set in environment variables.");
    return res.status(500).json({ error: "Server configuration error. API key missing." });
  }

  console.log("[NexAI] Incoming request →", messages.length, "messages");

  // System prompt — NexBuildr startup assistant
  const systemPrompt = {
    role: "system",
    content: `You are Nex AI, the intelligent startup assistant for NexBuildr — India's startup community platform for students and young entrepreneurs.

Your role is to help founders with:
- Startup idea validation and feedback
- Business model and revenue strategy
- Pitch deck advice and investor readiness
- Finding co-founders and building teams
- MVP planning and product development
- Funding stages (Angel, Seed, Series A)
- Marketing and growth strategies
- Indian startup ecosystem guidance (Startup India, DPIIT, grants)

Be concise, direct, and practical. Use plain language. Avoid jargon unless necessary. 
Format responses clearly — use bullet points when listing multiple items.
Keep responses under 300 words unless the question genuinely needs more detail.
Sound like a knowledgeable mentor, not a textbook.`
  };

  const fullMessages = [systemPrompt, ...messages];

  try {
    console.log("[NexAI] Calling Groq API with model: llama3-8b-8192");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: fullMessages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("[NexAI] Groq API error:", groqRes.status, errorText);
      return res.status(502).json({
        error: `Groq API error: ${groqRes.status}`,
        detail: errorText,
      });
    }

    const data = await groqRes.json();
    console.log("[NexAI] Groq response received. Usage:", data.usage);

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("[NexAI] Empty reply from Groq:", JSON.stringify(data));
      return res.status(502).json({ error: "No response from AI. Try again." });
    }

    console.log("[NexAI] Sending reply (chars):", reply.length);
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("[NexAI] Fetch error:", err.message);
    return res.status(500).json({ error: "Network error reaching AI service.", detail: err.message });
  }
}
