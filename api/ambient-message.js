
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "AI key is not configured",
      });
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
          
model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content:
                "Write one short, warm, natural ambient message for a personal website. Be human, subtle, thoughtful, and never overly dramatic. Return only the message, maximum 25 words.",
            },
            {
              role: "user",
              content: "Generate a fresh ambient message.",
            },
          ],
          temperature: 0.9,
          max_tokens: 60,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI message generation failed",
      });
    }

    return res.status(200).json({
      message:
        data.choices?.[0]?.message?.content?.trim() ||
        "Some moments are worth keeping.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error. Please try again.",
    });
  }
}
