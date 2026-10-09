
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "AI key is not configured" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: model: "llama-3.1-8b-instant",
          messages: messages.slice(-20),
          temperature: 0.8,
          max_tokens: 700,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed",
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "I couldn't respond just now.",
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
