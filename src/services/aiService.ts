export async function getTaskSuggestions(
  mainTaskTitle: string
): Promise<string[]> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mainTaskTitle }),
    });

    if (!response.ok) throw new Error("Erro ao chamar API interna");

    const data = await response.json();
    return data.suggestions; // <- já vem como array do backend
  } catch (error) {
    console.error("Falha ao obter sugestões da IA:", error);
    return [];
  }
}
