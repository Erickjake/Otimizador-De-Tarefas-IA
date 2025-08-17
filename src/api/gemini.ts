import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { mainTaskTitle } = req.body;

  const prompt = `
    Você é um assistente de produtividade especialista. Dada a tarefa principal a seguir, quebre-a em 3 a 5 subtarefas curtas e acionáveis.
    NÃO adicione introduções ou conclusões.
    Retorne a resposta como um array JSON de strings.
    Tarefa Principal: "${mainTaskTitle}"
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro no Gemini" });
    }

    const data = await response.json();
    const suggestions = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ suggestions: JSON.parse(suggestions) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
}
