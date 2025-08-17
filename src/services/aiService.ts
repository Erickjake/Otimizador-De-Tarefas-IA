// src/services/aiService.ts
// src/services/aiService.ts

// ... resto do código
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
console.log("CHAVE DE API SENDO LIDA:", API_KEY);
/**
 * Pede à IA para quebrar uma tarefa principal em subtarefas.
 * @param mainTaskTitle - A tarefa principal a ser detalhada.
 * @returns Um array de strings com os títulos das subtarefas.
 */
export async function getTaskSuggestions(
  mainTaskTitle: string
): Promise<string[]> {
  // O prompt é a instrução que damos à IA. Ser claro aqui é fundamental.
  const prompt = `
        Você é um assistente de produtividade especialista. Dada a tarefa principal a seguir, quebre-a em 3 a 5 subtarefas curtas e acionáveis.
        NÃO adicione introduções ou conclusões, como "Claro, aqui estão as subtarefas:".
        Retorne a resposta como um array JSON de strings. Por exemplo: ["Subtarefa 1", "Subtarefa 2"].

        Tarefa Principal: "${mainTaskTitle}"
    `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json", // Pedimos a resposta diretamente em JSON
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.statusText}`);
    }

    const data = await response.json();
    // O caminho para o conteúdo da resposta pode variar, inspecione `data` se necessário.
    const suggestions = data.candidates[0].content.parts[0].text;

    return JSON.parse(suggestions);
  } catch (error) {
    console.error("Falha ao obter sugestões da IA:", error);
    // Retorna um array vazio em caso de erro para não quebrar a aplicação.
    return [];
  }
}
