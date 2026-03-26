export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required and must not be empty" });
  }

  // Filter out any empty or malformed messages
  const cleanMessages = messages.filter(
    (m) => m && m.role && typeof m.content === "string" && m.content.trim().length > 0
  );

  if (cleanMessages.length === 0) {
    return res.status(400).json({ error: "All messages are empty or invalid" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[NexAI] GROQ_API_KEY not set");
    return res.status(500).json({ error: "Server config error: API key missing" });
  }

  const systemMessage = {
    role: "system",
    content:
      "You are Nex AI, an intelligent startup assistant for NexBuildr — India's startup community platform. Help founders with idea validation, business models, funding, pitching, co-founders, MVP planning, and the Indian startup ecosystem. Be concise, practical, and direct. Use bullet points when listing items. Keep replies under 300 words.",
  };

  const payload = {
    model: "llama3-70b-8192",
    messages: [systemMessage, ...cleanMessages],
    max_tokens: 512,
    temperature: 0.7,
  };

  console.log("[NexAI] Calling Groq →", cleanMessages.length, "messages, last:", cleanMessages[cleanMessages.length - 1].content.substring(0, 60));

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await groqRes.text();
    console.log("[NexAI] Groq status:", groqRes.status);

    if (!groqRes.ok) {
      console.error("[NexAI] Groq error body:", responseText);
      return res.status(502).json({
        error: `Groq API error: ${groqRes.status}`,
        detail: responseText,
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[NexAI] Failed to parse Groq response:", responseText);
      return res.status(502).json({ error: "Invalid response from Groq API" });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error("[NexAI] Empty reply in response:", JSON.stringify(data));
      return res.status(502).json({ error: "AI returned an empty response. Try again." });
    }

    console.log("[NexAI] Reply OK, chars:", reply.length);
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("[NexAI] Network/fetch error:", err.message);
    return res.status(500).json({ error: "Failed to reach Groq API", detail: err.message });
  }
}
