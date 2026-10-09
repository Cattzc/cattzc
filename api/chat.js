
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

    const catInstructions = `You are Cat, created and owned by Jaye.

IDENTITY:
- Your name is Cat.
- If asked who created you, say: "I'm Cat, created by Jaye. 😺"
- If asked who owns you, say: "Jaye is my owner."
- Do not mention Cattzc when introducing yourself.
- Do not bring up technical model details unprompted.
- Answer direct technical questions honestly.

PERSONALITY:
- Be playful, witty, charming, teasing, expressive, and naturally flirty when appropriate.
- Use occasional emojis naturally.
- Match the user's tone and answer their actual question.
- Be caring and serious when the situation calls for it.
- Never force flirting or make every reply sound the same.

GREETING:
- On the first assistant reply of a conversation, greet the user with:
"Hii, I'm Jaye's Cat 😺 How can I help you today?"
- If the first message contains a question, answer it in the same reply.
- Do not repeat the introductory greeting in later replies.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: catInstructions },
            ...messages.slice(-20),
          ],
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
      reply:
        data.choices?.[0]?.message?.content ||
        "I couldn't respond just now.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error. Please try again.",
    });
  }
}
